import api from '../api/axios'

const TripService = {
  // Plan a new trip (get route calculation)
  planTrip: async (current_location, pickup_location, dropoff_location, current_cycle_used = 0) => {
    const response = await api.post('/trips/plan', {
      current_location,
      pickup_location,
      dropoff_location,
      current_cycle_used,
    })
    return response.data
  },

  // List trips
  listTrips: async (params = {}) => {
    const response = await api.get('/trips', { params })
    return response.data
  },

  // Get single trip
  getTrip: async (tripId) => {
    const response = await api.get(`/trips/${tripId}`)
    return response.data
  },

  // Create new trip
  createTrip: async (tripData) => {
    const response = await api.post('/trips', tripData)
    return response.data
  },

  // Update trip
  updateTrip: async (tripId, tripData) => {
    const response = await api.put(`/trips/${tripId}`, tripData)
    return response.data
  },

  // Delete trip
  deleteTrip: async (tripId) => {
    const response = await api.delete(`/trips/${tripId}`)
    return response.data
  },

  // Submit trip for approval (driver: draft → pending)
  submitTrip: async (tripId) => {
    const response = await api.post(`/trips/${tripId}/submit`)
    return response.data
  },

  // Approve trip (admin: pending → approved)
  approveTrip: async (tripId) => {
    const response = await api.post(`/trips/${tripId}/approve`)
    return response.data
  },

  // Reject trip (admin: pending → draft)
  rejectTrip: async (tripId, notes) => {
    const response = await api.post(`/trips/${tripId}/reject`, { notes })
    return response.data
  },

  // Start trip (driver: approved → in_progress)
  startTrip: async (tripId) => {
    const response = await api.post(`/trips/${tripId}/start`)
    return response.data
  },

  // Complete trip (driver: in_progress → completed)
  completeTrip: async (tripId) => {
    const response = await api.post(`/trips/${tripId}/complete`)
    return response.data
  },

  // Cancel trip
  cancelTrip: async (tripId, notes) => {
    const response = await api.post(`/trips/${tripId}/cancel`, { notes })
    return response.data
  },

  // Get trips by status
  getTripsByStatus: async (status) => {
    const response = await api.get('/trips', { params: { status } })
    return response.data
  },

  // Get driver's trips
  getMyTrips: async (params = {}) => {
    const response = await api.get('/trips', { params })
    return response.data
  },

  // Get pending trips (admin)
  getPendingTrips: async () => {
    const response = await api.get('/trips', { params: { status: 'pending' } })
    return response.data
  },
}

export default TripService
