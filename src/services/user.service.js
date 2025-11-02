import api from '../api/axios'

const UserService = {
  // List all users (admin only)
  listUsers: async (params = {}) => {
    const response = await api.get('/users', { params })
    return response.data
  },

  // Get single user
  getUser: async (userId) => {
    const response = await api.get(`/users/${userId}`)
    return response.data
  },

  // Create new user (admin only)
  createUser: async (userData) => {
    const response = await api.post('/users', userData)
    return response.data
  },

  // Update user
  updateUser: async (userId, userData) => {
    const response = await api.put(`/users/${userId}`, userData)
    return response.data
  },

  // Delete user (admin only)
  deleteUser: async (userId) => {
    const response = await api.delete(`/users/${userId}`)
    return response.data
  },

  // Toggle user active status (admin only)
  toggleUserStatus: async (userId) => {
    const response = await api.post(`/users/${userId}/toggle-status`)
    return response.data
  },

  // Get drivers list
  getDrivers: async () => {
    const response = await api.get('/users', { params: { role: 'driver' } })
    return response.data
  },

  // Get admins list
  getAdmins: async () => {
    const response = await api.get('/users', { params: { role: 'admin' } })
    return response.data
  },
}

export default UserService
