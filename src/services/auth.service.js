import api from '../api/axios'

const AuthService = {
  // Register new user
  register: async (userData) => {
    const response = await api.post('/auth/register', userData)
    if (response.data.access) {
      localStorage.setItem('accessToken', response.data.access)
      localStorage.setItem('refreshToken', response.data.refresh)
      localStorage.setItem('user', JSON.stringify(response.data.user))
    }
    return response.data
  },

  // Login user
  login: async (username, password) => {
    const response = await api.post('/auth/login', { username, password })
    if (response.data.access) {
      localStorage.setItem('accessToken', response.data.access)
      localStorage.setItem('refreshToken', response.data.refresh)
      localStorage.setItem('user', JSON.stringify(response.data.user))
    }
    return response.data
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
  },

  // Get current user profile
  getProfile: async () => {
    const response = await api.get('/auth/me')
    if (response.data) {
      localStorage.setItem('user', JSON.stringify(response.data))
    }
    return response.data
  },

  // Update user profile
  updateProfile: async (profileData) => {
    const response = await api.put('/auth/profile', profileData)
    if (response.data) {
      localStorage.setItem('user', JSON.stringify(response.data))
    }
    return response.data
  },

  // Change password
  changePassword: async (passwordData) => {
    const response = await api.post('/auth/change-password', passwordData)
    return response.data
  },

  // Refresh access token
  refreshToken: async () => {
    const refreshToken = localStorage.getItem('refreshToken')
    const response = await api.post('/auth/refresh', { refresh: refreshToken })
    if (response.data.access) {
      localStorage.setItem('accessToken', response.data.access)
    }
    return response.data
  },

  // Get current user from localStorage
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  },

  // Get access token
  getAccessToken: () => {
    return localStorage.getItem('accessToken')
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('accessToken')
  },

  // Check if user is admin
  isAdmin: () => {
    const user = AuthService.getCurrentUser()
    return user && user.role === 'admin'
  },

  // Check if user is driver
  isDriver: () => {
    const user = AuthService.getCurrentUser()
    return user && user.role === 'driver'
  },
}

export default AuthService
