import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import AuthService from '@/services/auth.service'

function ProtectedRoute({ children, allowedRoles = [] }) {
  const { isAuthenticated, role, user } = useSelector((state) => state.auth)
  
  const hasToken = AuthService.isAuthenticated()

  if (!isAuthenticated || !hasToken) {
    AuthService.logout()
    return <Navigate to="/login" replace />
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
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
