import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default marker icons in Leaflet with Webpack/Vite
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

export default function RouteMap({ routeData, trackLive = true }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const liveMarkerRef = useRef(null)
  const liveAccuracyRef = useRef(null)
  const [normalized, setNormalized] = useState(null)
  
  // Small helpers
  const haversine = (a, b) => {
    const toRad = (x) => (x * Math.PI) / 180
    const R = 6371000 // meters
    const dLat = toRad(b.lat - a.lat)
    const dLon = toRad(b.lng - a.lng)
    const lat1 = toRad(a.lat)
    const lat2 = toRad(b.lat)
    const sinDLat = Math.sin(dLat / 2)
    const sinDLon = Math.sin(dLon / 2)
    const h = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon
    const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))
    return R * c
  }

  const pointAtFraction = (geometry, fraction) => {
    if (!geometry || geometry.length === 0) return null
    if (fraction <= 0) return geometry[0]
    if (fraction >= 1) return geometry[geometry.length - 1]
    // total length
    let total = 0
    const segLen = []
    for (let i = 1; i < geometry.length; i++) {
      const d = haversine(geometry[i - 1], geometry[i])
      segLen.push(d)
      total += d
    }
    let target = total * fraction
    for (let i = 1; i < geometry.length; i++) {
      if (target > segLen[i - 1]) {
        target -= segLen[i - 1]
        continue
      }
      const start = geometry[i - 1]
      const end = geometry[i]
      const t = segLen[i - 1] === 0 ? 0 : target / segLen[i - 1]
      return { lat: start.lat + (end.lat - start.lat) * t, lng: start.lng + (end.lng - start.lng) * t }
    }
    return geometry[geometry.length - 1]
  }

  // Normalize incoming data: if backend trip shape (addresses only), geocode to coordinates
  useEffect(() => {
    if (!routeData) return

    const hasCoords = routeData.coordinates && routeData.coordinates.current
    if (hasCoords) {
      setNormalized(routeData)
      return
    }

    const current = routeData.current_location
    const pickup = routeData.pickup_location
    const dropoff = routeData.dropoff_location

    if (!current || !pickup || !dropoff) {
      setNormalized(null)
      return
    }

    let cancelled = false
    async function geocode(query) {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`
      const res = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          // Helpful for Nominatim service etiquette
          'User-Agent': 'spotter-frontend/1.0 (+http://localhost)'
        }
      })
      const data = await res.json()
      if (!Array.isArray(data) || data.length === 0) return null
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), name: query }
    }

    ;(async () => {
      try {
        const [c, p, d] = await Promise.all([geocode(current), geocode(pickup), geocode(dropoff)])
        if (cancelled || !c || !p || !d) return
        const stops = (routeData.stops || []).map((s) => ({
          ...s,
          milesFromStart: s.miles_from_start ?? 0,
        }))
        setNormalized({
          coordinates: { current: c, pickup: p, dropoff: d },
          waypoints: [],
          restStops: stops,
          routeGeometry: null,
          totalDistance: routeData.total_distance || 0,
        })
      } catch (_e) {
        // ignore geocoding errors
      }
    })()

    return () => { cancelled = true }
  }, [routeData])

  // Fetch real road-following geometry from OSRM once we have coordinates
  useEffect(() => {
    if (!normalized || normalized.routeGeometry) return
    const coords = normalized.coordinates
    if (!coords?.current || !coords?.pickup || !coords?.dropoff) return

    let cancelled = false
    const toLonLat = (pt) => `${pt.lng},${pt.lat}`
    const url = `https://router.project-osrm.org/route/v1/driving/${toLonLat(coords.current)};${toLonLat(coords.pickup)};${toLonLat(coords.dropoff)}?overview=full&geometries=geojson`

    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return
        const line = data?.routes?.[0]?.geometry?.coordinates || []
        if (line.length > 1) {
          const geom = line.map(([lon, lat]) => ({ lat, lng: lon }))
          setNormalized((prev) => ({ ...prev, routeGeometry: geom }))
        }
      })
      .catch(() => {
        // leave fallback straight lines in place
      })

    return () => { cancelled = true }
  }, [normalized])

  useEffect(() => {
    if (!mapRef.current || !normalized) return

    // Initialize map
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView([39.8283, -98.5795], 4)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(mapInstanceRef.current)
    }

  const map = mapInstanceRef.current

    // Clear existing layers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        map.removeLayer(layer)
      }
    })

  const { coordinates, waypoints, restStops, routeGeometry, totalDistance } = normalized

    // Create custom icons
    const startIcon = L.divIcon({
      html: '<div style="background-color: #10b981; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
      className: 'custom-icon',
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    })

    const pickupIcon = L.divIcon({
      html: '<div style="background-color: #3b82f6; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
      className: 'custom-icon',
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    })

    const dropoffIcon = L.divIcon({
      html: '<div style="background-color: #ef4444; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
      className: 'custom-icon',
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    })

    const restIcon = L.divIcon({
      html: '<div style="background-color: #f59e0b; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
      className: 'custom-icon',
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    })

    // Add markers
    L.marker([coordinates.current.lat, coordinates.current.lng], { icon: startIcon })
      .addTo(map)
      .bindPopup(`<strong>Start:</strong><br>${coordinates.current.name}`)

    L.marker([coordinates.pickup.lat, coordinates.pickup.lng], { icon: pickupIcon })
      .addTo(map)
      .bindPopup(`<strong>Pickup:</strong><br>${coordinates.pickup.name}`)

    L.marker([coordinates.dropoff.lat, coordinates.dropoff.lng], { icon: dropoffIcon })
      .addTo(map)
      .bindPopup(`<strong>Dropoff:</strong><br>${coordinates.dropoff.name}`)

    // Add rest stop markers
  if (restStops) {
      // Only show major rest stops on map (not all breaks)
      const majorStops = restStops.filter(
        (stop) => stop.type === 'rest' || stop.type === 'fuel'
      )
      
      majorStops.forEach((stop, index) => {
        // Calculate approximate position along route
  const progress = totalDistance > 0 ? (stop.milesFromStart || 0) / totalDistance : 0
        // Place along actual geometry if available; otherwise approximate between anchors
        let pos
        if (routeGeometry && routeGeometry.length > 1 && totalDistance > 0) {
          pos = pointAtFraction(routeGeometry, Math.min(1, Math.max(0, progress)))
        } else {
          let lat, lng
          if (progress < 0.5) {
            const segmentProgress = progress * 2
            lat = coordinates.current.lat + (coordinates.pickup.lat - coordinates.current.lat) * segmentProgress
            lng = coordinates.current.lng + (coordinates.pickup.lng - coordinates.current.lng) * segmentProgress
          } else {
            const segmentProgress = (progress - 0.5) * 2
            lat = coordinates.pickup.lat + (coordinates.dropoff.lat - coordinates.pickup.lat) * segmentProgress
            lng = coordinates.pickup.lng + (coordinates.dropoff.lng - coordinates.pickup.lng) * segmentProgress
          }
          pos = { lat, lng }
        }

        L.marker([pos.lat, pos.lng], { icon: restIcon })
          .addTo(map)
          .bindPopup(`<strong>${stop.type === 'rest' ? 'Rest Stop' : 'Fuel Stop'}</strong><br>${stop.milesFromStart} mi`)
      })
    }

    // Draw route line (prefer actual road geometry when available)
    const routePoints = routeGeometry && routeGeometry.length > 1
      ? routeGeometry.map(p => [p.lat, p.lng])
      : [
          [coordinates.current.lat, coordinates.current.lng],
          [coordinates.pickup.lat, coordinates.pickup.lng],
          ...(Array.isArray(waypoints) ? waypoints.map((wp) => [wp.lat, wp.lng]) : []),
          [coordinates.dropoff.lat, coordinates.dropoff.lng],
        ]

    L.polyline(routePoints, {
      color: '#053E4F',
      weight: 4,
      opacity: 0.7,
    }).addTo(map)

    // Fit bounds to show entire route
    const bounds = L.latLngBounds(routePoints)
    map.fitBounds(bounds, { padding: [50, 50] })

    // Live location tracking
    let watchId
    if (trackLive && 'geolocation' in navigator) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude, accuracy } = pos.coords
          const latlng = [latitude, longitude]
          // Create or update marker
          if (!liveMarkerRef.current) {
            liveMarkerRef.current = L.marker(latlng, {
              icon: L.divIcon({
                html: '<div style="background:#2563eb;width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 0 0 2px rgba(37,99,235,0.3)"></div>',
                className: 'live-icon',
                iconSize: [16, 16],
                iconAnchor: [8, 8],
              }),
            }).addTo(map).bindPopup('Your Location')
          } else {
            liveMarkerRef.current.setLatLng(latlng)
          }

          // Accuracy circle
          if (!liveAccuracyRef.current) {
            liveAccuracyRef.current = L.circle(latlng, {
              radius: accuracy,
              color: '#3b82f6',
              fillColor: '#93c5fd',
              fillOpacity: 0.2,
              weight: 1,
            }).addTo(map)
          } else {
            liveAccuracyRef.current.setLatLng(latlng)
            liveAccuracyRef.current.setRadius(accuracy)
          }
        },
        () => {
          // ignore errors (permission denied, etc.)
        },
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
      )
    }

    return () => {
      if (watchId && navigator.geolocation && navigator.geolocation.clearWatch) {
        navigator.geolocation.clearWatch(watchId)
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [normalized, trackLive])

  return <div ref={mapRef} className="w-full h-full min-h-[400px] rounded-lg" />
}
