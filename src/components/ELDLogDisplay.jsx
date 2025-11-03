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
    const headerHeight = 80
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
  ctx.fillText(`Date: ${dateStr}`, 20, 44)
  const from = (tripData?.pickup_location || tripData?.pickupLocation || log.trip?.pickup_location || log.trip?.pickupLocation || '')
  const to = (tripData?.dropoff_location || tripData?.dropoffLocation || log.trip?.dropoff_location || log.trip?.dropoffLocation || '')
    ctx.fillText(`From: ${from}`, 250, 44)
    ctx.fillText(`To: ${to}`, 520, 44)
    const miles = log.total_miles || log.totalMiles || 0
    ctx.fillText(`Total Miles Today: ${miles}`, 820, 44)
    
    // Draw grid lines (24 hours)
    ctx.strokeStyle = '#94a3b8'
    ctx.lineWidth = 1
    
    // Vertical lines (hours)
    for (let i = 0; i <= 24; i++) {
      const x = i * hourWidth
      ctx.beginPath()
      ctx.moveTo(x, gridY)
      ctx.lineTo(x, gridY + gridHeight)
      ctx.stroke()
      
      // Hour labels
      ctx.fillStyle = '#334155'
      ctx.font = '10px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(i.toString(), x, gridY - 5)
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
    
    // Draw segments
    if (log.segments) {
      log.segments.forEach((segment) => {
        const startHour = segment.start_hour || segment.startHour || 0
        const duration = segment.duration || 0
        const startX = startHour * hourWidth
        const segmentWidth = duration * hourWidth
        
        // Determine row based on status
        let rowIndex
        if (segment.status === 'off-duty') rowIndex = 0
        else if (segment.status === 'sleeper') rowIndex = 1
        else if (segment.status === 'driving') rowIndex = 2
        else if (segment.status === 'on-duty') rowIndex = 3
        else return
        
        const y = gridY + rowIndex * rowHeight + 2
        const height = rowHeight - 4
        
        // Draw segment
        ctx.fillStyle = statusColors[segment.status]
        ctx.fillRect(startX, y, segmentWidth, height)
        
        // Draw border
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 2
        ctx.strokeRect(startX, y, segmentWidth, height)
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

  return (
    <Card className="mb-6 border-[#053E4F]/20">
      <CardHeader className="bg-gradient-to-r from-[#053E4F] to-[#AEC3DD] text-white">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">
            Day {log.day_number || log.dayNumber} - {new Date(log.date || log.log_date).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-white text-[#053E4F]">
              {log.total_miles || log.totalMiles} miles
            </Badge>
            <Button
              size="sm"
              variant="outline"
              className="bg-white text-[#053E4F] border-white/30"
              onClick={() => {
                if (!canvasRef.current) return
                const date = new Date(log.date || log.log_date).toISOString().slice(0,10)
                const link = document.createElement('a')
                link.href = canvasRef.current.toDataURL('image/png')
                link.download = `eld-log-${date}.png`
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
              }}
            >
              Download PNG
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
            height={280}
            className="w-full border border-slate-200 rounded-lg"
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
            <h4 className="font-semibold text-[#053E4F] mb-2 text-sm">Remarks</h4>
            <ul className="space-y-1">
              {log.remarks.map((remark, index) => (
                <li key={index} className="text-sm text-slate-700 flex items-start gap-2">
                  <span className="text-[#053E4F] font-bold">•</span>
                  <span>{remark}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Segments Detail */}
        <div className="mt-4">
          <h4 className="font-semibold text-[#053E4F] mb-3 text-sm">Activity Timeline</h4>
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
