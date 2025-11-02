import api from '../api/axios'

const LogService = {
  // List ELD logs
  listLogs: async (params = {}) => {
    const response = await api.get('/logs', { params })
    return response.data
  },

  // Get single log
  getLog: async (logId) => {
    const response = await api.get(`/logs/${logId}`)
    return response.data
  },

  // Submit logs for review (driver: draft → submitted)
  submitLogs: async (logIds, notes = '') => {
    const response = await api.post('/logs/submit', {
      log_ids: logIds,
      notes,
    })
    return response.data
  },

  // Review log (admin: approve/reject)
  reviewLog: async (logId, action, notes = '') => {
    const response = await api.post(`/logs/${logId}/review`, {
      action, // 'approve' or 'reject'
      notes,
    })
    return response.data
  },

  // Get logs by trip
  getLogsByTrip: async (tripId) => {
    const response = await api.get('/logs', { params: { trip_id: tripId } })
    return response.data
  },

  // Get logs by status
  getLogsByStatus: async (status) => {
    const response = await api.get('/logs', { params: { submission_status: status } })
    return response.data
  },

  // Get pending logs (admin)
  getPendingLogs: async () => {
    const response = await api.get('/logs', { params: { submission_status: 'submitted' } })
    return response.data
  },

  // Get my submitted logs (driver)
  getMySubmittedLogs: async () => {
    const response = await api.get('/logs', { params: { submission_status: 'submitted' } })
    return response.data
  },

  // Get log segments for a log
  getLogSegments: async (logId) => {
    const response = await api.get(`/logs/${logId}`)
    return response.data.segments || []
  },
}

export default LogService
