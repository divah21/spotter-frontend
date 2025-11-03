import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useSearchParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Label } from '@/components/ui/Label'
import {
  FileText,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  User,
  Clock
} from 'lucide-react'
import { motion } from 'framer-motion'
import { Sheet, SheetContent } from '@/components/ui/Sheet'
import ELDLogDisplay from '@/components/ELDLogDisplay'
import { fetchPendingLogs, fetchLogs, reviewLogRequest } from '@/redux/logSlice'

export default function AdminLogs() {
  const dispatch = useDispatch()
  const [searchParams, setSearchParams] = useSearchParams()
  const { logs, loading, error } = useSelector((state) => state.log)
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'submitted')
  const [selectedLog, setSelectedLog] = useState(null)
  const [viewLog, setViewLog] = useState(null)
  const [reviewNotes, setReviewNotes] = useState('')
  const [actionLoading, setActionLoading] = useState(null)

  useEffect(() => {
    if (statusFilter === 'submitted') {
      dispatch(fetchPendingLogs())
    } else {
      dispatch(fetchLogs())
    }
  }, [dispatch, statusFilter])

  useEffect(() => {
    const next = {}
    if (statusFilter) next.status = statusFilter
    setSearchParams(next)
  }, [statusFilter, setSearchParams])

  const filtered = useMemo(() => {
    if (statusFilter === 'all') return logs
    return logs.filter((l) => l.submission_status === statusFilter)
  }, [logs, statusFilter])

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'approved':
        return 'secondary'
      case 'submitted':
        return 'warning'
      case 'rejected':
        return 'destructive'
      case 'draft':
        return 'outline'
      default:
        return 'outline'
    }
  }

  const getStatusLabel = (status) => {
    const labels = {
      draft: 'Draft',
      submitted: 'Submitted',
      approved: 'Approved',
      rejected: 'Rejected'
    }
    return labels[status] || status
  }

  const handleReview = async (logId, action) => {
    if (action === 'reject' && !reviewNotes.trim()) {
      alert('Please provide rejection notes')
      return
    }

    setActionLoading(`${action}-${logId}`)
    try {
      await dispatch(
        reviewLogRequest({
          logId,
          action,
          notes: action === 'reject' ? reviewNotes : undefined
        })
      ).unwrap()
      
      if (statusFilter === 'submitted') {
        dispatch(fetchPendingLogs())
      } else {
        dispatch(fetchLogs())
      }
      
      setSelectedLog(null)
      setReviewNotes('')
    } catch (error) {
      if (import.meta.env.DEV) console.error('Review error:', error)
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
        <h1 className="text-3xl font-bold text-[#053E4F]">ELD Log Reviews</h1>
        <p className="text-gray-500 mt-1">Review and approve driver daily log sheets</p>
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
              <FileText className="h-6 w-6" />
              Log Submissions
            </CardTitle>
            <div className="flex items-center gap-2">
              <Label className="text-sm">Status:</Label>
              <select
                className="border rounded px-3 py-1 text-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All</option>
                <option value="submitted">Pending Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="draft">Draft</option>
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
              <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">
                {statusFilter === 'submitted'
                  ? 'No logs pending review'
                  : 'No logs match the selected filter'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((log) => (
                <div
                  key={log.id}
                  className="flex flex-col p-4 border rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-[#053E4F]">
                          Log Date: {(() => {
                            const d = log.date || log.log_date
                            if (!d) return '—'
                            const dt = new Date(d)
                            return isNaN(dt) ? '—' : dt.toLocaleDateString()
                          })()}
                        </p>
                        <Badge variant={getStatusBadgeVariant(log.submission_status)}>
                          {getStatusLabel(log.submission_status)}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        {log.driver && (
                          <p className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            Driver: {log.driver.first_name} {log.driver.last_name} (@
                            {log.driver.username})
                          </p>
                        )}
                        <p>
                          Trip: {typeof log.trip === 'object' && log.trip
                            ? `${log.trip.pickup_location} → ${log.trip.dropoff_location}`
                            : log.trip
                              ? `#${log.trip}`
                              : '—'}
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                          <div>
                            <Clock className="inline-block w-3 h-3 mr-1" />
                            <strong>Total:</strong> {(
                              (Number(log.hours_off_duty) || 0) +
                              (Number(log.hours_sleeper) || 0) +
                              (Number(log.hours_driving) || 0) +
                              (Number(log.hours_on_duty) || 0)
                            ).toFixed(2)}h
                          </div>
                          <div>
                            <strong>Driving:</strong> {(Number(log.hours_driving) || 0).toFixed(2)}h
                          </div>
                          <div>
                            <strong>On Duty:</strong> {(Number(log.hours_on_duty) || 0).toFixed(2)}h
                          </div>
                          <div>
                            <strong>Off Duty:</strong> {(Number(log.hours_off_duty) || 0).toFixed(2)}h
                          </div>
                        </div>
                      </div>
                      {log.review_notes && (
                        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                          <p className="text-sm text-yellow-800">
                            <strong>Review Notes:</strong> {log.review_notes}
                          </p>
                        </div>
                      )}
                      {log.submission_status === 'approved' && log.reviewed_by_name && (
                        <div className="flex items-center gap-2 text-sm text-green-600 mt-2">
                          <CheckCircle className="h-4 w-4" />
                          Approved by {log.reviewed_by_name} on{' '}
                          {new Date(log.reviewed_at).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setViewLog(log)}
                    >
                      View Full Log
                    </Button>
                  {log.submission_status === 'submitted' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleReview(log.id, 'approve')}
                          disabled={actionLoading === `approve-${log.id}`}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {actionLoading === `approve-${log.id}` ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Approving...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Approve Log
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedLog(log)
                            setReviewNotes('')
                          }}
                          className="text-red-600 border-red-300 hover:bg-red-50"
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Reject Log
                        </Button>
                      </>
                  )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Sheet open={!!selectedLog} onOpenChange={(o) => !o && setSelectedLog(null)}>
        <SheetContent side="right" className="w-full sm:w-[460px]">
          {selectedLog && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-[#053E4F] mb-2">Reject Log</h3>
                <p className="text-sm text-gray-600">
                  Log Date: {new Date(selectedLog.log_date).toLocaleDateString()}
                </p>
                {selectedLog.driver && (
                  <p className="text-sm text-gray-600">
                    Driver: {selectedLog.driver.first_name} {selectedLog.driver.last_name}
                  </p>
                )}
              </div>
              <div>
                <Label>Rejection Notes *</Label>
                <textarea
                  className="w-full border rounded px-3 py-2 mt-1 text-sm min-h-[100px]"
                  placeholder="Provide reason for rejection..."
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={() => handleReview(selectedLog.id, 'reject')}
                  disabled={actionLoading === `reject-${selectedLog.id}` || !reviewNotes.trim()}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  {actionLoading === `reject-${selectedLog.id}` ? (
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
                  onClick={() => setSelectedLog(null)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <Sheet open={!!viewLog} onOpenChange={(o) => !o && setViewLog(null)}>
        <SheetContent side="right" className="w-full sm:max-w-[90vw] overflow-y-auto">
          {viewLog && (
            <div className="space-y-4">
              <ELDLogDisplay log={viewLog} tripData={typeof viewLog.trip === 'object' ? viewLog.trip : {}} />
              <Button onClick={() => setViewLog(null)} className="w-full">Close</Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </motion.div>
  )
}
