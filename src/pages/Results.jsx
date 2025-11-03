import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { ArrowLeft, MapPin, Clock, Fuel, Coffee, Navigation, Download, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import RouteMap from '@/components/RouteMap'
import ELDLogDisplay from '@/components/ELDLogDisplay'
import { createNewTrip } from '@/redux/tripSlice'

export default function ResultsPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { tripData, routeData, loading } = useSelector((state) => state.trip)

  useEffect(() => {
    if (!routeData) {
      navigate('/driver/planner')
    }
  }, [routeData, navigate])

  if (!routeData) {
    return null
  }

  const trip = routeData
  const eldLogs = trip.eld_logs || []
  const stops = trip.stops || []

  const handlePrint = () => {
    window.print()
  }

  const handleSaveTrip = async () => {
    navigate('/driver/trips')
  }

  const formatDuration = (hours) => {
    const val = Number(hours)
    if (!isFinite(val) || isNaN(val)) return '—'
    const h = Math.floor(val)
    const m = Math.round((val - h) * 60)
    if (h === 0) return `${m}m`
    if (m === 0) return `${h}h`
    return `${h}h ${m}m`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        >
          <Button
            variant="ghost"
            onClick={() => navigate('/driver/planner')}
            className="text-[#053E4F]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Planner
          </Button>
          <div className="flex gap-2">
            <Button onClick={handleSaveTrip} className="bg-green-600 hover:bg-green-700">
              <CheckCircle className="w-4 h-4 mr-2" />
              View My Trips
            </Button>
            <Button onClick={handlePrint} variant="secondary">
              <Download className="w-4 h-4 mr-2" />
              Download/Print
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="mb-6 border-[#053E4F]/20 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-[#053E4F] to-[#AEC3DD] text-white">
              <CardTitle className="text-2xl flex items-center gap-2">
                <Navigation className="w-6 h-6" />
                Trip Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <h3 className="font-semibold text-[#053E4F] flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Route
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500 mt-1 shrink-0" />
                      <div>
                        <div className="font-medium">Current</div>
                        <div className="text-slate-600">{trip.current_location}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500 mt-1 shrink-0" />
                      <div>
                        <div className="font-medium">Pickup</div>
                        <div className="text-slate-600">{trip.pickup_location}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500 mt-1 shrink-0" />
                      <div>
                        <div className="font-medium">Dropoff</div>
                        <div className="text-slate-600">{trip.dropoff_location}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-[#053E4F] flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Trip Stats
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Total Distance:</span>
                      <span className="font-semibold">{trip.total_distance ?? 0} miles</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Driving Time:</span>
                      <span className="font-semibold">{formatDuration(trip.total_driving_time ?? 0)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Estimated Days:</span>
                      <span className="font-semibold">{trip.estimated_days ?? 0} days</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Current Cycle Used:</span>
                      <span className="font-semibold">{trip.current_cycle_used ?? 0}h / 70h</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-[#053E4F]">Stops Summary</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Coffee className="w-4 h-4 text-orange-500" />
                      <span className="text-slate-600">Rest Stops:</span>
                      <Badge variant="secondary">
                        {stops.filter(s => s.type === 'rest').length || 0}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Fuel className="w-4 h-4 text-yellow-500" />
                      <span className="text-slate-600">Fuel Stops:</span>
                      <Badge variant="secondary">
                        {stops.filter(s => s.type === 'fuel').length || 0}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-blue-500" />
                      <span className="text-slate-600">Total Stops:</span>
                      <Badge variant="secondary">
                        {stops.length}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="mb-6 border-[#053E4F]/20 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-[#053E4F] to-[#AEC3DD] text-white">
              <CardTitle className="text-xl">Route Map</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 p-0">
              <div className="h-[500px]">
                <RouteMap routeData={trip} trackLive={true} />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {stops && stops.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="mb-6 border-[#053E4F]/20 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-[#053E4F] to-[#AEC3DD] text-white">
                <CardTitle className="text-xl">Scheduled Stops</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  {stops.map((stop, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-4 p-3 bg-slate-50 rounded-lg border border-slate-200"
                    >
                      <div className="shrink-0">
                        {stop.type === 'pickup' && <MapPin className="w-5 h-5 text-blue-500" />}
                        {stop.type === 'dropoff' && <MapPin className="w-5 h-5 text-red-500" />}
                        {stop.type === 'rest' && <Coffee className="w-5 h-5 text-orange-500" />}
                        {stop.type === 'fuel' && <Fuel className="w-5 h-5 text-yellow-500" />}
                        {stop.type === 'break' && <Clock className="w-5 h-5 text-blue-500" />}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-[#053E4F] capitalize">
                          {stop.name || stop.type}
                        </div>
                        <div className="text-sm text-slate-600">{stop.location || ''}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-slate-900">
                          {stop.miles_from_start ?? 0} mi
                        </div>
                        <div className="text-xs text-slate-500">
                          {stop.time_label || 'Stop'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-6"
        >
          <h2 className="text-2xl font-bold text-[#053E4F] flex items-center gap-2">
            <Clock className="w-6 h-6" />
            Daily ELD Logs
          </h2>
          {eldLogs && eldLogs.map((log, index) => (
            <ELDLogDisplay key={index} log={log} tripData={trip} />
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4 print:hidden"
        >
          <h3 className="font-semibold text-[#053E4F] mb-2">Print Instructions:</h3>
          <p className="text-sm text-slate-700">
            Click the "Download/Print Logs" button above to print or save these logs as PDF. 
            Make sure to review all logs for accuracy before submitting to your carrier.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
