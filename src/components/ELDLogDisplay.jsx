import { useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'

export default function ELDLogDisplay({ log, tripData }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!canvasRef.current || !log) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    
    // Set canvas size
    const width = canvas.width
    const height = canvas.height
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height)
    
    // Draw ELD log grid and segments
    drawELDLog(ctx, log, width, height, tripData)
  }, [log, tripData])

  const drawELDLog = (ctx, log, width, height, tripData) => {
    const headerHeight = 140
    const gridHeight = 200
    const gridY = headerHeight
    const hourWidth = width / 24
    
    // Background
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, width, height)

    // Header: mimic paper log look
    ctx.fillStyle = '#0f172a'
    ctx.font = 'bold 18px sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText("Driver's Daily Log (24 hours)", 20, 24)

    const dateStr = new Date(log.date || log.log_date).toLocaleDateString('en-US')
    ctx.font = '12px sans-serif'
    ctx.fillStyle = '#334155'
    ctx.fillText(`Date: ${dateStr}`, 20, 48)
    
    // Driver name from trip.driver or driver_name field
    const driverName = log.driver 
      ? `${log.driver.first_name || ''} ${log.driver.last_name || ''}`.trim()
      : (log.driver_name || tripData?.driver_name || '')
    if (driverName) ctx.fillText(`Driver: ${driverName}`, 20, 64)
    
    // From/To prefer location names
    const fromLoc = (tripData?.pickup_location || tripData?.pickupLocation || log.trip?.pickup_location || log.trip?.pickupLocation || '')
    const toLoc = (tripData?.dropoff_location || tripData?.dropoffLocation || log.trip?.dropoff_location || log.trip?.dropoffLocation || '')
    ctx.fillText(`From: ${fromLoc || ''}`, 250, 48)
    ctx.fillText(`To: ${toLoc || ''}`, 520, 48)
    
    const totalMiles = Number(log.total_miles || log.totalMiles || 0)
    ctx.fillText(`Total Miles Today: ${totalMiles}`, 820, 48)
    
    // Ancillary carrier/vehicle/addresses (best-effort mapping)
    const carrier = log.carrier_name || log.carrier || ''
    const truck = log.truck_numbers || log.truck || log.tractor_trailer || ''
    const mainOffice = log.main_office_address || ''
    const homeTerminal = log.home_terminal_address || ''
    ctx.fillText(`Name of Carrier: ${carrier}`, 20, 80)
    ctx.fillText(`Truck/Trailer/Lic #: ${truck}`, 20, 96)
    ctx.fillText(`Main Office: ${mainOffice}`, 250, 80)
    ctx.fillText(`Home Terminal: ${homeTerminal}`, 250, 96)

    // visual padding divider under header
    ctx.strokeStyle = '#cbd5e1'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(0, gridY - 8)
    ctx.lineTo(width, gridY - 8)
    ctx.stroke()
    
    // Draw grid lines (24 hours)
    ctx.strokeStyle = '#94a3b8'
    ctx.lineWidth = 1
    
    // Vertical lines (hours) - place labels ABOVE the grid to prevent crossing
    for (let i = 0; i <= 24; i++) {
      const x = i * hourWidth
      ctx.beginPath()
      ctx.moveTo(x, gridY)
      ctx.lineTo(x, gridY + gridHeight)
      ctx.stroke()
      
      // Hour labels ABOVE the grid line
      ctx.fillStyle = '#334155'
      ctx.font = 'bold 11px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(i.toString(), x, gridY - 10)
    }
    
    // Horizontal lines (status rows)
    const rowHeight = gridHeight / 4
    const statusLabels = ['Off Duty', 'Sleeper', 'Driving', 'On Duty']
    const statusColors = {
      'off-duty': '#10b981',
      'sleeper': '#3b82f6',
      'driving': '#ef4444',
      'on-duty': '#f59e0b',
    }
    
    for (let i = 0; i <= 4; i++) {
      const y = gridY + i * rowHeight
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
      
      // Row labels
      if (i < 4) {
        ctx.fillStyle = '#334155'
        ctx.font = 'bold 11px sans-serif'
        ctx.textAlign = 'right'
        ctx.fillText(statusLabels[i], 70, y + rowHeight / 2 + 4)
      }
    }
    
    // Draw segments as thin lines on the center of each row with vertical connectors and colored dots at turning points
    if (log.segments && log.segments.length > 0) {
      const centerYOfRow = (idx) => gridY + idx * rowHeight + rowHeight / 2
      ctx.lineWidth = 3

      let prevEndX = null
      let prevRowIndex = null

      log.segments.forEach((segment, i) => {
        const startHour = segment.start_hour || segment.startHour || 0
        const duration = segment.duration || 0
        
        // Clamp to 24-hour display (backend may send hours beyond 24 for next-day segments)
        const clampedStart = Math.min(Math.max(startHour, 0), 24)
        const clampedEnd = Math.min(startHour + duration, 24)
        const clampedDuration = clampedEnd - clampedStart
        
        if (clampedDuration <= 0) return // skip segments entirely outside 0-24 range
        
        const startX = clampedStart * hourWidth
        const endX = clampedEnd * hourWidth

        let rowIndex
        let segmentColor
        if (segment.status === 'off-duty') {
          rowIndex = 0
          segmentColor = statusColors['off-duty']
        } else if (segment.status === 'sleeper') {
          rowIndex = 1
          segmentColor = statusColors['sleeper']
        } else if (segment.status === 'driving') {
          rowIndex = 2
          segmentColor = statusColors['driving']
        } else if (segment.status === 'on-duty') {
          rowIndex = 3
          segmentColor = statusColors['on-duty']
        } else return

        const y = centerYOfRow(rowIndex)

        // Set line color for this segment
        ctx.strokeStyle = segmentColor

        // connector if status changed at this boundary
        if (prevEndX !== null && Math.abs(prevEndX - startX) < 0.1 && prevRowIndex !== null && prevRowIndex !== rowIndex) {
          ctx.beginPath()
          ctx.moveTo(startX, centerYOfRow(prevRowIndex))
          ctx.lineTo(startX, centerYOfRow(rowIndex))
          ctx.stroke()
        }

        // horizontal line for the segment
        ctx.beginPath()
        ctx.moveTo(startX, y)
        ctx.lineTo(endX, y)
        ctx.stroke()

        // dots at segment start and end with status color
        ctx.fillStyle = segmentColor
        ctx.beginPath(); ctx.arc(startX, y, 4, 0, Math.PI * 2); ctx.fill()
        ctx.beginPath(); ctx.arc(endX, y, 4, 0, Math.PI * 2); ctx.fill()

        // small time label centered on the segment
        const startLabel = Math.floor(clampedStart).toString().padStart(2, '0')
        const endLabel = Math.floor(clampedEnd).toString().padStart(2, '0')
        const label = `${startLabel}:00–${endLabel}:00`
        ctx.font = '9px sans-serif'
        ctx.fillStyle = '#1e293b'
        ctx.textAlign = 'center'
        const midX = (startX + endX) / 2
        if (endX - startX > 40) { // only show label if segment is wide enough
          ctx.fillText(label, midX, y - 8)
        }

        prevEndX = endX
        prevRowIndex = rowIndex
      })
    }
    
    // Draw time grid (15-minute marks)
    ctx.strokeStyle = '#cbd5e1'
    ctx.lineWidth = 0.5
    for (let i = 0; i < 24 * 4; i++) {
      const x = (i / 4) * hourWidth
      ctx.beginPath()
      ctx.moveTo(x, gridY)
      ctx.lineTo(x, gridY + gridHeight)
      ctx.stroke()
    }
  }

  const formatHours = (hours) => {
    const h = Math.floor(hours)
    const m = Math.round((hours - h) * 60)
    return `${h}h ${m}m`
  }

  const downloadCompleteLog = () => {
    // Create a temporary canvas with all information
    const tempCanvas = document.createElement('canvas')
    const ctx = tempCanvas.getContext('2d')
    
    // Set larger canvas size to fit everything
    tempCanvas.width = 1200
    tempCanvas.height = 1000
    
    // Background
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height)
    
    // Draw the ELD graph at the top
    drawELDLog(ctx, log, tempCanvas.width, 320, tripData)
    
    let yOffset = 340
    
    // Draw summary cards
    ctx.fillStyle = '#1e293b'
    ctx.font = 'bold 16px sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText('Hours Summary', 20, yOffset)
    yOffset += 30
    
    const summaries = [
      { label: 'Off Duty', hours: log.hours_off_duty || log.hours?.offDuty || 0, color: '#22c55e', bg: '#dcfce7' },
      { label: 'Sleeper Berth', hours: log.hours_sleeper || log.hours?.sleeperBerth || 0, color: '#3b82f6', bg: '#dbeafe' },
      { label: 'Driving', hours: log.hours_driving || log.hours?.driving || 0, color: '#ef4444', bg: '#fee2e2' },
      { label: 'On Duty', hours: log.hours_on_duty || log.hours?.onDuty || 0, color: '#f97316', bg: '#ffedd5' }
    ]
    
    summaries.forEach((item, index) => {
      const x = 20 + (index * 290)
      ctx.fillStyle = item.bg
      ctx.fillRect(x, yOffset, 280, 70)
      ctx.strokeStyle = item.color
      ctx.lineWidth = 2
      ctx.strokeRect(x, yOffset, 280, 70)
      
      ctx.fillStyle = item.color
      ctx.font = 'bold 12px sans-serif'
      ctx.fillText(item.label, x + 10, yOffset + 20)
      
      ctx.fillStyle = '#1e293b'
      ctx.font = 'bold 28px sans-serif'
      ctx.fillText(formatHours(item.hours), x + 10, yOffset + 55)
    })
    
    yOffset += 100
    
    // Draw Activity Timeline
    ctx.fillStyle = '#1e293b'
    ctx.font = 'bold 16px sans-serif'
    ctx.fillText('Activity Timeline', 20, yOffset)
    yOffset += 30
    
    if (log.segments && log.segments.length > 0) {
      log.segments.forEach((segment, index) => {
        const startHour = segment.start_hour || segment.startHour || 0
        const duration = segment.duration || 0
        
        // Time
        ctx.fillStyle = '#64748b'
        ctx.font = '13px monospace'
        const timeStr = `${Math.floor(startHour).toString().padStart(2, '0')}:${Math.round((startHour % 1) * 60).toString().padStart(2, '0')}`
        ctx.fillText(timeStr, 20, yOffset)
        
        // Status dot
        const dotColor = segment.status === 'off-duty' ? '#22c55e' :
                        segment.status === 'sleeper' ? '#3b82f6' :
                        segment.status === 'driving' ? '#ef4444' : '#f97316'
        ctx.fillStyle = dotColor
        ctx.beginPath()
        ctx.arc(100, yOffset - 4, 5, 0, Math.PI * 2)
        ctx.fill()
        
        // Status text
        ctx.fillStyle = '#1e293b'
        ctx.font = 'bold 13px sans-serif'
        const statusText = segment.status.charAt(0).toUpperCase() + segment.status.slice(1).replace('-', ' ')
        ctx.fillText(statusText, 120, yOffset)
        
        // Location
        if (segment.location) {
          ctx.fillStyle = '#64748b'
          ctx.font = '13px sans-serif'
          ctx.fillText(`- ${segment.location}`, 250, yOffset)
        }
        
        // Duration
        ctx.fillStyle = '#64748b'
        ctx.font = '13px sans-serif'
        ctx.textAlign = 'right'
        ctx.fillText(formatHours(duration), 1180, yOffset)
        ctx.textAlign = 'left'
        
        yOffset += 25
        
        // Stop if we're running out of space
        if (yOffset > 980) return
      })
    }
    
    // Download
    const date = new Date(log.date || log.log_date).toISOString().slice(0, 10)
    const link = document.createElement('a')
    link.href = tempCanvas.toDataURL('image/png')
    link.download = `eld-log-complete-${date}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Card className="mb-6 border-primary/20">
      <CardHeader className="bg-linear-to-r from-primary to-primary-light text-white">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">
            Day {log.day_number || log.dayNumber} - {new Date(log.date || log.log_date).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-white text-primary">
              {log.total_miles || log.totalMiles} miles
            </Badge>
            <Button
              size="sm"
              variant="outline"
              className="bg-white text-primary border-white/30"
              onClick={downloadCompleteLog}
            >
              Download Complete Log
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {/* Canvas for ELD graph */}
        <div className="mb-6 overflow-x-auto">
          <canvas
            ref={canvasRef}
            width={1200}
            height={320}
            className="w-full max-w-full border border-slate-200 rounded-lg"
            style={{ display: 'block', maxWidth: '100%', height: 'auto' }}
          />
        </div>

        {/* Hours Summary */}
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-green-50 p-3 rounded-lg border border-green-200">
            <div className="text-xs text-green-700 font-semibold mb-1">Off Duty</div>
            <div className="text-2xl font-bold text-green-900">
              {formatHours(log.hours_off_duty || log.hours?.offDuty || 0)}
            </div>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <div className="text-xs text-blue-700 font-semibold mb-1">Sleeper Berth</div>
            <div className="text-2xl font-bold text-blue-900">
              {formatHours(log.hours_sleeper || log.hours?.sleeperBerth || 0)}
            </div>
          </div>
          <div className="bg-red-50 p-3 rounded-lg border border-red-200">
            <div className="text-xs text-red-700 font-semibold mb-1">Driving</div>
            <div className="text-2xl font-bold text-red-900">
              {formatHours(log.hours_driving || log.hours?.driving || 0)}
            </div>
          </div>
          <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
            <div className="text-xs text-orange-700 font-semibold mb-1">On Duty</div>
            <div className="text-2xl font-bold text-orange-900">
              {formatHours(log.hours_on_duty || log.hours?.onDuty || 0)}
            </div>
          </div>
        </div>

        {/* Remarks */}
        {log.remarks && log.remarks.length > 0 && (
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <h4 className="font-semibold text-primary mb-2 text-sm">Remarks</h4>
            <ul className="space-y-1">
              {log.remarks.map((remark, index) => (
                <li key={index} className="text-sm text-slate-700 flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span>{remark}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Segments Detail */}
        <div className="mt-4">
          <h4 className="font-semibold text-primary mb-3 text-sm">Activity Timeline</h4>
          <div className="space-y-2">
            {log.segments && log.segments.map((segment, index) => {
              const startHour = segment.start_hour || segment.startHour || 0
              const duration = segment.duration || 0
              return (
                <div key={index} className="flex items-center gap-3 text-sm">
                  <div className="w-24 text-slate-500 font-mono">
                    {Math.floor(startHour).toString().padStart(2, '0')}:
                    {Math.round((startHour % 1) * 60).toString().padStart(2, '0')}
                  </div>
                  <div className={`w-3 h-3 rounded-full ${
                    segment.status === 'off-duty' ? 'bg-green-500' :
                    segment.status === 'sleeper' ? 'bg-blue-500' :
                    segment.status === 'driving' ? 'bg-red-500' :
                    'bg-orange-500'
                  }`} />
                  <div className="flex-1">
                    <span className="font-medium capitalize">{segment.status.replace('-', ' ')}</span>
                    {segment.location && <span className="text-slate-500"> - {segment.location}</span>}
                  </div>
                  <div className="text-slate-500">
                    {formatHours(duration)}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
