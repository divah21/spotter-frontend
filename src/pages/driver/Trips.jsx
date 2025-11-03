import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Truck, MapPin, Plus, Loader2, Send, Play, CheckCircle, AlertCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { 
  fetchTrips, 
  submitTripForApproval, 
  startTripJourney, 
  completeTripJourney 
} from '@/redux/tripSlice'

export default function DriverTrips() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { trips, loading, error } = useSelector((state) => state.trip)
  const [actionLoading, setActionLoading] = useState(null)

  useEffect(() => {
    dispatch(fetchTrips())
  }, [dispatch])

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'in_progress':
        return 'default'
      case 'completed':
        return 'secondary'
      case 'approved':
        return 'success'
      case 'pending':
        return 'warning'
      case 'draft':
        return 'outline'
      default:
        return 'outline'
    }
  }

  const getStatusLabel = (status) => {
    const labels = {
      draft: 'Draft',
      pending: 'Pending Approval',
      approved: 'Approved',
      in_progress: 'In Progress',
      completed: 'Completed',
      cancelled: 'Cancelled'
    }
    return labels[status] || status
  }

  const handleAction = async (action, tripId) => {
    setActionLoading(`${action}-${tripId}`)
    try {
      switch (action) {
        case 'submit':
          await dispatch(submitTripForApproval(tripId))
          break
        case 'start':
          await dispatch(startTripJourney(tripId))
          break
        case 'complete':
          await dispatch(completeTripJourney(tripId))
          break
      }
      dispatch(fetchTrips())
    } catch (error) {
      if (import.meta.env.DEV) console.error('Action error:', error)
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#021d26]">My Trips</h1>
          <p className="text-gray-500 mt-1">View and manage your trips</p>
        </div>
        <Button
          onClick={() => navigate('/driver/planner')}
          className="bg-[#021d26] hover:bg-[#032a36]"
        >
          <Plus className="mr-2 h-5 w-5" />
          Plan New Trip
        </Button>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200">
          <p className="text-sm text-red-600 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {error}
          </p>
        </div>
      )}

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-[#021d26] flex items-center gap-2">
            <Truck className="h-6 w-6" />
            All Trips
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#021d26]" />
            </div>
          ) : trips.length === 0 ? (
            <div className="text-center py-12">
              <Truck className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No trips yet. Plan your first trip!</p>
              <Button
                onClick={() => navigate('/driver/planner')}
                className="mt-4 bg-[#021d26] hover:bg-[#032a36]"
              >
                Plan New Trip
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {trips.map((trip) => (
                <div
                  key={trip.id}
                  className="flex flex-col p-4 border rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-[#021d26]" />
                        <span className="font-medium text-[#021d26]">
                          {trip.current_location || trip.pickup_location} → {trip.dropoff_location}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 space-y-1">
                        {trip.total_distance && (
                          <p>Distance: {trip.total_distance} miles</p>
                        )}
                        {trip.total_driving_time && (
                          <p>Estimated Driving: {trip.total_driving_time.toFixed(1)} hours</p>
                        )}
                        {trip.estimated_days && (
                          <p>Estimated Days: {trip.estimated_days}</p>
                        )}
                        <p>Created: {new Date(trip.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Badge variant={getStatusBadgeVariant(trip.status)}>
                        {getStatusLabel(trip.status)}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/driver/trips/${trip.id}`)}
                    >
                      View Details
                    </Button>

                    {trip.status === 'draft' && (
                      <Button
                        size="sm"
                        onClick={() => handleAction('submit', trip.id)}
                        disabled={actionLoading === `submit-${trip.id}`}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {actionLoading === `submit-${trip.id}` ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Send className="mr-2 h-4 w-4" />
                            Submit for Approval
                          </>
                        )}
                      </Button>
                    )}

                    {trip.status === 'approved' && (
                      <Button
                        size="sm"
                        onClick={() => handleAction('start', trip.id)}
                        disabled={actionLoading === `start-${trip.id}`}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {actionLoading === `start-${trip.id}` ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Starting...
                          </>
                        ) : (
                          <>
                            <Play className="mr-2 h-4 w-4" />
                            Start Trip
                          </>
                        )}
                      </Button>
                    )}

                    {trip.status === 'in_progress' && (
                      <Button
                        size="sm"
                        onClick={() => handleAction('complete', trip.id)}
                        disabled={actionLoading === `complete-${trip.id}`}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        {actionLoading === `complete-${trip.id}` ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Completing...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Complete Trip
                          </>
                        )}
                      </Button>
                    )}

                    {trip.status === 'pending' && (
                      <p className="text-sm text-gray-500 italic">Waiting for admin approval...</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
