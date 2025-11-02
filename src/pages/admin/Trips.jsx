import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import {
  Truck,
  MapPin,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  User
} from 'lucide-react'
import { motion } from 'framer-motion'
import { Sheet, SheetContent } from '@/components/ui/Sheet'
import {
  fetchTrips,
  approveTripRequest,
  rejectTripRequest
} from '@/redux/tripSlice'

export default function AdminTrips() {
  const dispatch = useDispatch()
  const [searchParams, setSearchParams] = useSearchParams()
  const { trips, loading, error } = useSelector((state) => state.trip)
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'pending')
  const [selectedTrip, setSelectedTrip] = useState(null)
  const [rejectNotes, setRejectNotes] = useState('')
  const [actionLoading, setActionLoading] = useState(null)

  useEffect(() => {
    dispatch(fetchTrips())
  }, [dispatch])

  useEffect(() => {
    const next = {}
    if (statusFilter && statusFilter !== 'all') next.status = statusFilter
    setSearchParams(next)
  }, [statusFilter, setSearchParams])

  const filtered = useMemo(() => {
    if (statusFilter === 'all') return trips
    return trips.filter((t) => t.status === statusFilter)
  }, [trips, statusFilter])

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
      case 'rejected':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  const getStatusLabel = (status) => {
    const labels = {
      draft: 'Draft',
      pending: 'Pending Approval',
      approved: 'Approved',
      rejected: 'Rejected',
      in_progress: 'In Progress',
      completed: 'Completed',
      cancelled: 'Cancelled'
    }
    return labels[status] || status
  }

  const handleApprove = async (tripId) => {
    setActionLoading(`approve-${tripId}`)
    try {
      await dispatch(approveTripRequest(tripId)).unwrap()
      dispatch(fetchTrips())
    } catch (error) {
      console.error('Approve error:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (tripId) => {
    if (!rejectNotes.trim()) {
      alert('Please provide rejection notes')
      return
    }

    setActionLoading(`reject-${tripId}`)
    try {
      await dispatch(rejectTripRequest({ tripId, notes: rejectNotes })).unwrap()
      dispatch(fetchTrips())
      setSelectedTrip(null)
      setRejectNotes('')
    } catch (error) {
      console.error('Reject error:', error)
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
      <div>
        <h1 className="text-3xl font-bold text-[#053E4F]">Trip Approvals</h1>
        <p className="text-gray-500 mt-1">Review and approve driver trip requests</p>
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
          <div className="flex items-center justify-between">
            <CardTitle className="text-[#053E4F] flex items-center gap-2">
              <Truck className="h-6 w-6" />
              Trip Requests
            </CardTitle>
            <div className="flex items-center gap-2">
              <Label className="text-sm">Status:</Label>
              <select
                className="border rounded px-3 py-1 text-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#053E4F]" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <Truck className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">
                {statusFilter === 'pending'
                  ? 'No pending trip requests'
                  : 'No trips match the selected filter'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((trip) => (
                <div
                  key={trip.id}
                  className="flex flex-col p-4 border rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-[#053E4F]" />
                        <span className="font-medium text-[#053E4F]">
                          {trip.current_location || trip.pickup_location} → {trip.dropoff_location}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        {trip.driver && (
                          <p className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            Driver: {trip.driver.first_name} {trip.driver.last_name}
                          </p>
                        )}
                        {trip.total_distance && <p>Distance: {trip.total_distance} miles</p>}
                        {trip.total_driving_time && (
                          <p>Estimated Driving: {trip.total_driving_time.toFixed(1)} hours</p>
                        )}
                        {trip.estimated_days && <p>Estimated Days: {trip.estimated_days}</p>}
                        <p>Created: {new Date(trip.created_at).toLocaleDateString()}</p>
                      </div>
                      {trip.notes && (
                        <p className="text-sm text-gray-500 mt-2">
                          <strong>Notes:</strong> {trip.notes}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={getStatusBadgeVariant(trip.status)}>
                        {getStatusLabel(trip.status)}
                      </Badge>
                    </div>
                  </div>

                  {/* View + Action Buttons for Pending Trips */}
                  <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.location.assign(`/admin/trips/${trip.id}`)}
                    >
                      View Details
                    </Button>
                  </div>

                  {/* Action Buttons for Pending Trips */}
                  {trip.status === 'pending' && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Button
                        size="sm"
                        onClick={() => handleApprove(trip.id)}
                        disabled={actionLoading === `approve-${trip.id}`}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {actionLoading === `approve-${trip.id}` ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Approving...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Approve Trip
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedTrip(trip)
                          setRejectNotes('')
                        }}
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Reject Trip
                      </Button>
                    </div>
                  )}

                  {/* Show rejection notes for rejected trips */}
                  {trip.status === 'rejected' && trip.notes && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                      <p className="text-sm text-red-800">
                        <strong>Rejection Notes:</strong> {trip.notes}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reject Trip Sheet */}
      <Sheet open={!!selectedTrip} onOpenChange={(o) => !o && setSelectedTrip(null)}>
        <SheetContent side="right" className="w-full sm:w-[460px]">
          {selectedTrip && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-[#053E4F] mb-2">Reject Trip</h3>
                <p className="text-sm text-gray-600">
                  {selectedTrip.current_location || selectedTrip.pickup_location} →{' '}
                  {selectedTrip.dropoff_location}
                </p>
              </div>
              <div>
                <Label>Rejection Notes *</Label>
                <textarea
                  className="w-full border rounded px-3 py-2 mt-1 text-sm min-h-[100px]"
                  placeholder="Provide reason for rejection..."
                  value={rejectNotes}
                  onChange={(e) => setRejectNotes(e.target.value)}
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={() => handleReject(selectedTrip.id)}
                  disabled={actionLoading === `reject-${selectedTrip.id}` || !rejectNotes.trim()}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  {actionLoading === `reject-${selectedTrip.id}` ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Rejecting...
                    </>
                  ) : (
                    'Confirm Rejection'
                  )}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setSelectedTrip(null)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </motion.div>
  )
}
