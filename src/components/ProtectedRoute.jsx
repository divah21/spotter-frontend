import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import AuthService from '@/services/auth.service'

function ProtectedRoute({ children, allowedRoles = [] }) {
  const { isAuthenticated, role, user } = useSelector((state) => state.auth)
  
  // Double check authentication with token presence
  const hasToken = AuthService.isAuthenticated()

  if (!isAuthenticated || !hasToken) {
    // Clear any stale data and redirect to login
    AuthService.logout()
    return <Navigate to="/login" replace />
  }

  // Check if user has required role
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    // Redirect to appropriate dashboard based on user's actual role
    if (role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />
    } else if (role === 'driver') {
      return <Navigate to="/driver/dashboard" replace />
    }
    return <Navigate to="/" replace />
  }

  return children
}

export default ProtectedRoute
