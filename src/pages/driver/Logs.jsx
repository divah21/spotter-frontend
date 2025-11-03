import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { FileText, Loader2, AlertCircle, Send, CheckCircle, Eye } from 'lucide-react'
import { motion } from 'framer-motion'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { fetchLogs, submitLogsForReview } from '@/redux/logSlice'
import { Sheet, SheetContent } from '@/components/ui/Sheet'
import ELDLogDisplay from '@/components/ELDLogDisplay'

export default function DriverLogs() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { logs, loading, error } = useSelector((state) => state.log)
  const [selectedLogs, setSelectedLogs] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [selectedLog, setSelectedLog] = useState(null)

  useEffect(() => {
    dispatch(fetchLogs())
  }, [dispatch])

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

  const handleSelectLog = (logId) => {
    setSelectedLogs((prev) =>
      prev.includes(logId) ? prev.filter((id) => id !== logId) : [...prev, logId]
    )
  }

  const handleSubmitLogs = async () => {
    if (selectedLogs.length === 0) return

    setSubmitting(true)
    try {
      await dispatch(submitLogsForReview({ logIds: selectedLogs, notes: '' }))
      setSelectedLogs([])
      dispatch(fetchLogs())
    } catch (error) {
      if (import.meta.env.DEV) console.error('Submit logs error:', error)
    } finally {
      setSubmitting(false)
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
          <h1 className="text-3xl font-bold text-[#021d26]">My ELD Logs</h1>
          <p className="text-gray-500 mt-1">View and submit your daily log sheets</p>
        </div>
        {selectedLogs.length > 0 && (
          <Button
            onClick={handleSubmitLogs}
            disabled={submitting}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting {selectedLogs.length} log(s)...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Submit {selectedLogs.length} for Review
              </>
            )}
          </Button>
        )}
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
            <FileText className="h-6 w-6" />
            My ELD Log Sheets
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#021d26]" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 mb-4">No logs yet. Complete trips to generate logs.</p>
              <Button onClick={() => navigate('/driver/planner')}>Plan a Trip</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="flex flex-col p-4 border rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    {log.submission_status === 'draft' && (
                      <input
                        type="checkbox"
                        checked={selectedLogs.includes(log.id)}
                        onChange={() => handleSelectLog(log.id)}
                        className="mt-1 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                    )}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-[#021d26]">
                            Log Date: {log.date || log.log_date ? new Date(log.date || log.log_date).toLocaleDateString() : 'N/A'}
                          </p>
                          {(() => {
                            if (typeof log.trip === 'object' && log.trip) {
                              return (
                                <p className="text-sm text-gray-500">
                                  Trip: {log.trip.pickup_location} → {log.trip.dropoff_location}
                                </p>
                              )
                            }
                            if (log.trip) {
                              return (
                                <p className="text-sm text-gray-500">Trip: #{String(log.trip)}</p>
                              )
                            }
                            return null
                          })()}
                        </div>
                        <Badge variant={getStatusBadgeVariant(log.submission_status)}>
                          {getStatusLabel(log.submission_status)}
                        </Badge>
                      </div>

                      <div className="text-sm text-gray-600">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                          <div>
                            <span className="font-medium">Total Miles:</span> {log.total_miles || 0}
                          </div>
                          <div>
                            <span className="font-medium">Driving:</span> {(log.hours_driving || 0).toFixed(1)}h
                          </div>
                          <div>
                            <span className="font-medium">On Duty:</span> {(log.hours_on_duty || 0).toFixed(1)}h
                          </div>
                          <div>
                            <span className="font-medium">Off Duty:</span> {(log.hours_off_duty || 0).toFixed(1)}h
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

                      {log.submission_status === 'approved' && log.reviewed_at && (
                        <div className="flex items-center gap-2 text-sm text-green-600 mt-2">
                          <CheckCircle className="h-4 w-4" />
                          Approved by {log.reviewed_by_name || 'Admin'} on{' '}
                          {new Date(log.reviewed_at).toLocaleDateString()}
                        </div>
                      )}

                      <div className="flex gap-2 mt-3 pt-3 border-t">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedLog(log)}
                          className="text-blue-600 border-blue-300 hover:bg-blue-50"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Full Log
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      <Sheet open={!!selectedLog} onOpenChange={(o) => !o && setSelectedLog(null)}>
        <SheetContent side="right" className="w-full sm:max-w-[90vw] overflow-y-auto">
          {selectedLog && (
            <div className="space-y-4">
              <ELDLogDisplay log={selectedLog} tripData={typeof selectedLog.trip === 'object' ? selectedLog.trip : {}} />
              <Button onClick={() => setSelectedLog(null)} className="w-full">
                Close
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </motion.div>
  )
}
