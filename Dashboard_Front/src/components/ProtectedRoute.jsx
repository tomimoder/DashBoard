import { Navigate } from 'react-router-dom'

export default function ProtectedRoute({ children, adminOnly = false }) {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true'
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  // Si no está autenticado, redirigir a login
  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  // Si la ruta requiere admin pero el usuario no lo es
  if (adminOnly && !user.role) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}