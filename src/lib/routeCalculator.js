/**
 * Calculate route data including distance, driving time, rest stops, and fuel stops
 * Based on HOS (Hours of Service) rules: 70/8 days, 11 hour driving limit, 14 hour on-duty limit
 *
 * Enhancements:
 * - Attempts real geocoding (Nominatim) and routing (OSRM) when online
 * - Falls back to mock geocoding and straight-line waypoints if network fails
 */

// Geocoding function to get coordinates from city names (mock implementation)
export async function geocodeLocation(location) {
  // Try Nominatim first
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(location)}`
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } })
    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data) && data.length > 0) {
        const item = data[0]
        return {
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
          name: item.display_name || location,
        }
      }
    }
  } catch (_) {
    // fall back to mock
  }

  // Fallback mock coordinates for common cities
  const mockCities = {
    'new york': { lat: 40.7128, lng: -74.0060, name: 'New York, NY' },
    'los angeles': { lat: 34.0522, lng: -118.2437, name: 'Los Angeles, CA' },
    'chicago': { lat: 41.8781, lng: -87.6298, name: 'Chicago, IL' },
    'houston': { lat: 29.7604, lng: -95.3698, name: 'Houston, TX' },
    'phoenix': { lat: 33.4484, lng: -112.0740, name: 'Phoenix, AZ' },
    'philadelphia': { lat: 39.9526, lng: -75.1652, name: 'Philadelphia, PA' },
    'dallas': { lat: 32.7767, lng: -96.7970, name: 'Dallas, TX' },
    'miami': { lat: 25.7617, lng: -80.1918, name: 'Miami, FL' },
    'atlanta': { lat: 33.7490, lng: -84.3880, name: 'Atlanta, GA' },
    'denver': { lat: 39.7392, lng: -104.9903, name: 'Denver, CO' },
  }

  const key = location.toLowerCase().split(',')[0].trim()
  return mockCities[key] || { lat: 40.7128, lng: -74.0060, name: location }
}

// Calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 3959 // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

// Generate waypoints along the route
function generateWaypoints(start, end, numPoints) {
  const waypoints = []
  for (let i = 1; i <= numPoints; i++) {
    const ratio = i / (numPoints + 1)
    waypoints.push({
      lat: start.lat + (end.lat - start.lat) * ratio,
      lng: start.lng + (end.lng - start.lng) * ratio,
    })
  }
  return waypoints
}

// Attempt to fetch a real road route using OSRM between multiple coordinates
async function getOsrmRoute(coords) {
  // coords: array of {lat, lng}
  const coordStr = coords.map(c => `${c.lng},${c.lat}`).join(';')
  const url = `https://router.project-osrm.org/route/v1/driving/${coordStr}?overview=full&geometries=geojson&steps=true&continue_straight=true`
  const res = await fetch(url)
  if (!res.ok) throw new Error('OSRM request failed')
  const data = await res.json()
  if (!data.routes || data.routes.length === 0) throw new Error('No OSRM route')
  const route = data.routes[0]
  // Convert [lon,lat] -> {lat,lng}
  const geometry = route.geometry.coordinates.map(([lon, lat]) => ({ lat, lng: lon }))
  const distanceMiles = route.distance / 1609.34
  const durationHours = route.duration / 3600
  const legs = route.legs || []
  return { geometry, distanceMiles, durationHours, legs }
}

export async function calculateRoute(tripData) {
  const { currentLocation, pickupLocation, dropoffLocation, currentCycleUsed } = tripData
  
  // Geocode locations
  const currentCoords = await geocodeLocation(currentLocation)
  const pickupCoords = await geocodeLocation(pickupLocation)
  const dropoffCoords = await geocodeLocation(dropoffLocation)
  
  // Try real routing first (current -> pickup -> dropoff)
  let routeGeometry = null
  let totalDistance = 0
  let totalDrivingTime = 0
  let legs = []
  let distanceToPickup = 0
  try {
    const osrm = await getOsrmRoute([currentCoords, pickupCoords, dropoffCoords])
    routeGeometry = osrm.geometry
    totalDistance = osrm.distanceMiles
    totalDrivingTime = osrm.durationHours
    legs = osrm.legs
    // Derive distance to pickup from first leg if available
    if (legs[0]?.distance) distanceToPickup = legs[0].distance / 1609.34
  } catch (_) {
    // Fallback to straight-line approximation
    const d1 = calculateDistance(
      currentCoords.lat, currentCoords.lng,
      pickupCoords.lat, pickupCoords.lng
    )
    const d2 = calculateDistance(
      pickupCoords.lat, pickupCoords.lng,
      dropoffCoords.lat, dropoffCoords.lng
    )
    distanceToPickup = d1
    totalDistance = d1 + d2
    const avgSpeed = 50
    totalDrivingTime = totalDistance / avgSpeed
    routeGeometry = [
      { lat: currentCoords.lat, lng: currentCoords.lng },
      { lat: pickupCoords.lat, lng: pickupCoords.lng },
      ...generateWaypoints(pickupCoords, dropoffCoords, 5),
      { lat: dropoffCoords.lat, lng: dropoffCoords.lng },
    ]
  }
  
  // Calculate available driving hours (70 hour rule)
  const availableHours = 70 - currentCycleUsed
  
  // Generate rest stops based on HOS rules
  const avgSpeed = 50 // mph baseline for planning
  const restStops = []
  let currentMiles = 0
  let hoursWorked = 0
  let dayNumber = 1
  
  // 11 hour driving limit per day
  // 14 hour on-duty limit per day
  // 10 hour rest required after 14 hours
  // 30 minute break after 8 hours of driving
  
  while (currentMiles < totalDistance) {
    // Calculate remaining miles this shift
    const remainingShiftHours = Math.min(11 - (hoursWorked % 11), 14 - (hoursWorked % 14))
    const remainingShiftMiles = remainingShiftHours * avgSpeed
    
    // 30-minute break after 8 hours
    if (hoursWorked > 0 && hoursWorked % 8 < 0.5) {
      restStops.push({
        type: '30-min break',
        name: `Rest Area (30-min break)`,
        location: getLocationAtMiles(currentMiles, totalDistance, currentCoords, pickupCoords, dropoffCoords),
        duration: 0.5,
        milesFromStart: Math.round(currentMiles),
        time: formatTime(hoursWorked),
      })
    }
    
    // Drive until next stop
    const driveMiles = Math.min(remainingShiftMiles, totalDistance - currentMiles, 550) // Max 550 miles per segment
    currentMiles += driveMiles
    hoursWorked += driveMiles / avgSpeed
    
    // Check if we need a fuel stop (every 1000 miles)
    if (Math.floor(currentMiles / 1000) > Math.floor((currentMiles - driveMiles) / 1000)) {
      restStops.push({
        type: 'fuel',
        name: `Fuel Stop`,
        location: getLocationAtMiles(currentMiles, totalDistance, currentCoords, pickupCoords, dropoffCoords),
        duration: 0.5,
        milesFromStart: Math.round(currentMiles),
        time: formatTime(hoursWorked),
      })
      hoursWorked += 0.5
    }
    
    // Check if we've hit pickup location
    if (currentMiles >= distanceToPickup && currentMiles - driveMiles < distanceToPickup) {
      restStops.push({
        type: 'pickup',
        name: pickupCoords.name,
        location: pickupCoords.name,
        duration: 1,
        milesFromStart: Math.round(distanceToPickup),
        time: formatTime(hoursWorked),
      })
      hoursWorked += 1
    }
    
    // Check if we need a 10-hour rest
    if (hoursWorked >= 11 || hoursWorked % 14 >= 13.5) {
      if (currentMiles < totalDistance) {
        restStops.push({
          type: 'rest',
          name: `Overnight Rest (10 hours)`,
          location: getLocationAtMiles(currentMiles, totalDistance, currentCoords, pickupCoords, dropoffCoords),
          duration: 10,
          milesFromStart: Math.round(currentMiles),
          time: formatTime(hoursWorked),
        })
        hoursWorked = 0
        dayNumber++
      }
    }
  }
  
  // Add final dropoff
  restStops.push({
    type: 'dropoff',
    name: dropoffCoords.name,
    location: dropoffCoords.name,
    duration: 1,
    milesFromStart: Math.round(totalDistance),
    time: formatTime(totalDrivingTime),
  })
  
  const estimatedDays = Math.ceil(totalDrivingTime / 11) + Math.floor(totalDrivingTime / 11)
  
  return {
    totalDistance: Math.round(totalDistance),
    totalDrivingTime: Math.round(totalDrivingTime * 10) / 10,
    estimatedDays,
    restStops,
    coordinates: {
      current: currentCoords,
      pickup: pickupCoords,
      dropoff: dropoffCoords,
    },
    waypoints: generateWaypoints(pickupCoords, dropoffCoords, 5),
    routeGeometry, // array of {lat,lng} along the road path when available
    legs,
  }
}

function getLocationAtMiles(miles, totalMiles, start, middle, end) {
  const distanceToPickup = calculateDistance(start.lat, start.lng, middle.lat, middle.lng)
  
  if (miles <= distanceToPickup) {
    return `${Math.round(miles)} mi from ${start.name}`
  } else {
    return `${Math.round(miles - distanceToPickup)} mi from ${middle.name}`
  }
}

function formatTime(hours) {
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
}
