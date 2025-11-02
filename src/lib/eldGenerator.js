/**
 * Generate ELD (Electronic Logging Device) logs based on route data and HOS rules
 * Rules: 70/8 days, 11 hour driving limit, 14 hour on-duty limit, 10 hour rest required
 */

export function generateELDLogs(tripData, routeData) {
  const logs = []
  const startDate = new Date()
  
  let currentHour = 8 // Start at 8:00 AM
  let currentDay = 1
  let dailySegments = []
  let dailyHours = {
    offDuty: 0,
    sleeperBerth: 0,
    driving: 0,
    onDuty: 0,
  }
  let totalMilesThisDay = 0
  let remainingDistance = routeData.totalDistance
  let currentCycleUsed = tripData.currentCycleUsed
  
  const avgSpeed = 50 // mph
  const remarks = []
  
  // Helper function to add segment
  const addSegment = (status, duration, location = '') => {
    dailySegments.push({
      status,
      startHour: currentHour,
      duration,
      location,
    })
    
    // Update daily hours
    if (status === 'off-duty') dailyHours.offDuty += duration
    else if (status === 'sleeper') dailyHours.sleeperBerth += duration
    else if (status === 'driving') dailyHours.driving += duration
    else if (status === 'on-duty') dailyHours.onDuty += duration
    
    currentHour += duration
  }
  
  // Helper function to save day and start new one
  const saveDay = () => {
    const date = new Date(startDate)
    date.setDate(date.getDate() + currentDay - 1)
    
    logs.push({
      date: date.toISOString().split('T')[0],
      dayNumber: currentDay,
      hours: { ...dailyHours },
      segments: [...dailySegments],
      remarks: [...remarks],
      totalMiles: Math.round(totalMilesThisDay),
    })
    
    // Reset for next day
    currentDay++
    currentHour = 0
    dailySegments = []
    dailyHours = { offDuty: 0, sleeperBerth: 0, driving: 0, onDuty: 0 }
    totalMilesThisDay = 0
    remarks.length = 0
  }
  
  // Day 1: Start with 10 hour rest (off-duty/sleeper from midnight)
  if (currentHour >= 8) {
    addSegment('sleeper', 8, 'Home terminal')
    remarks.push('Started trip after 10-hour rest')
  }
  
  // Pre-trip inspection
  addSegment('on-duty', 0.5, 'Pre-trip inspection')
  remarks.push('Pre-trip inspection completed')
  
  let stopIndex = 0
  const stops = routeData.restStops || []
  
  while (remainingDistance > 0 || stopIndex < stops.length) {
    // Check if we've reached 11 hours driving or 14 hours on-duty
    if (dailyHours.driving >= 11 || (dailyHours.driving + dailyHours.onDuty) >= 14) {
      // End of day - add post-trip inspection
      addSegment('on-duty', 0.5, 'Post-trip inspection')
      
      // Fill rest of day with sleeper berth
      const remainingHours = 24 - currentHour
      addSegment('sleeper', remainingHours, 'Rest area')
      remarks.push(`10-hour rest period`)
      
      saveDay()
      
      // New day starts with off-duty
      addSegment('sleeper', 10, 'Rest area')
      addSegment('on-duty', 0.5, 'Pre-trip inspection')
      continue
    }
    
    // Process next stop
    if (stopIndex < stops.length) {
      const stop = stops[stopIndex]
      stopIndex++
      
      if (stop.type === 'pickup') {
        // Drive to pickup
        const drivingTime = Math.min(
          stop.milesFromStart / avgSpeed,
          11 - dailyHours.driving,
          14 - (dailyHours.driving + dailyHours.onDuty)
        )
        
        if (drivingTime > 0) {
          addSegment('driving', drivingTime, `En route to ${stop.location}`)
          totalMilesThisDay += drivingTime * avgSpeed
          remainingDistance -= drivingTime * avgSpeed
        }
        
        // Pickup (on-duty)
        addSegment('on-duty', 1, `Pickup at ${stop.location}`)
        remarks.push(`Pickup: ${stop.location}`)
        
      } else if (stop.type === 'dropoff') {
        // Drive to dropoff
        const drivingTime = Math.min(
          remainingDistance / avgSpeed,
          11 - dailyHours.driving,
          14 - (dailyHours.driving + dailyHours.onDuty)
        )
        
        if (drivingTime > 0) {
          addSegment('driving', drivingTime, `En route to ${stop.location}`)
          totalMilesThisDay += drivingTime * avgSpeed
          remainingDistance -= drivingTime * avgSpeed
        }
        
        // Dropoff (on-duty)
        addSegment('on-duty', 1, `Delivery at ${stop.location}`)
        remarks.push(`Delivery: ${stop.location}`)
        
      } else if (stop.type === 'fuel') {
        // Drive to fuel stop
        const driveTime = Math.min(2, 11 - dailyHours.driving)
        if (driveTime > 0) {
          addSegment('driving', driveTime)
          totalMilesThisDay += driveTime * avgSpeed
          remainingDistance -= driveTime * avgSpeed
        }
        
        // Fuel stop (on-duty)
        addSegment('on-duty', 0.5, 'Fuel stop')
        remarks.push('Fueling')
        
      } else if (stop.type === '30-min break') {
        // Drive before break
        const driveTime = Math.min(3, 11 - dailyHours.driving, 8 - dailyHours.driving % 8)
        if (driveTime > 0) {
          addSegment('driving', driveTime)
          totalMilesThisDay += driveTime * avgSpeed
          remainingDistance -= driveTime * avgSpeed
        }
        
        // 30-minute break
        addSegment('off-duty', 0.5, '30-min break')
        remarks.push('30-minute break')
        
      } else if (stop.type === 'rest') {
        // Overnight rest
        if (currentHour < 24) {
          const remainingToday = 24 - currentHour
          addSegment('sleeper', remainingToday, 'Rest area')
        }
        saveDay()
        addSegment('sleeper', 10, 'Rest area')
      }
      
    } else {
      // No more stops, just drive remaining distance
      const drivingTime = Math.min(
        remainingDistance / avgSpeed,
        11 - dailyHours.driving,
        14 - (dailyHours.driving + dailyHours.onDuty) - 0.5 // Reserve time for post-trip
      )
      
      if (drivingTime > 0) {
        addSegment('driving', drivingTime)
        totalMilesThisDay += drivingTime * avgSpeed
        remainingDistance -= drivingTime * avgSpeed
      } else {
        break
      }
    }
    
    // Safety check: if day is getting too long, force rest
    if (currentHour >= 23.5) {
      const remaining = 24 - currentHour
      if (remaining > 0) {
        addSegment('off-duty', remaining)
      }
      saveDay()
      addSegment('sleeper', 10, 'Rest area')
    }
  }
  
  // End of trip - add final post-trip
  if (dailySegments.length > 0) {
    addSegment('on-duty', 0.5, 'Post-trip inspection')
    
    // Fill remaining day with off-duty
    if (currentHour < 24) {
      addSegment('off-duty', 24 - currentHour)
    }
    
    remarks.push('Trip completed')
    saveDay()
  }
  
  return logs
}

// Helper function to format hours for display
export function formatHoursForDisplay(hours) {
  return `${Math.floor(hours)}:${Math.round((hours % 1) * 60).toString().padStart(2, '0')}`
}
