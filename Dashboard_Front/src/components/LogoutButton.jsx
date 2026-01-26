// src/components/LogoutButton.jsx
import { useNavigate } from 'react-router-dom'

const LogOut = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" x2="9" y1="12" y2="12" />
  </svg>
)

export default function LogoutButton() {
  const navigate = useNavigate()

  const handleLogout = () => {
    // Limpiar localStorage
    localStorage.removeItem('user')
    localStorage.removeItem('isAuthenticated')
    
    // Redirigir a login
    navigate('/')
  }

  return (
    <button 
      onClick={handleLogout} 
      className="button button-outline"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}
    >
      <LogOut />
      Cerrar Sesión
    </button>
  )
}