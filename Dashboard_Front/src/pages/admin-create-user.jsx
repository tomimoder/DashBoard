"use client"

import { useState } from "react"
import axios from 'axios'
import { set } from "date-fns"
import { useNavigate } from "react-router-dom"
import { LayoutDashboard, Users, FileText, Settings, Search, Bell, CreditCard, Calendar, Upload } from "lucide-react"
import { is } from "date-fns/locale"

// Iconos SVG como componentes
const UserPlus = () => (
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
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <line x1="19" x2="19" y1="8" y2="14" />
    <line x1="22" x2="16" y1="11" y2="11" />
  </svg>
)

const Mail = () => (
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
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
)

const User = () => (
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
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)

const Lock = () => (
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
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
)

const Shield = () => (
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
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
  </svg>
)

const CheckCircle2 = () => (
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
    <circle cx="12" cy="12" r="10" />
    <path d="m9 12 2 2 4-4" />
  </svg>
)

const XCircle = () => (
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
    <circle cx="12" cy="12" r="10" />
    <path d="m15 9-6 6" />
    <path d="m9 9 6 6" />
  </svg>
)

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

  const sidebarItems = [
    { id: "home", label: "Inicio", icon: LayoutDashboard, path: "/dashboard" },
    { id: "users", label: "Usuarios", icon: Users, path: "/create-user" },
    { id: "Upload", label: "Boleta", icon: Upload, path: "/upload-receipt" },
    { id: "settings", label: "Configuración", icon: Settings, path: "/settings" },
    { id: "Logout", label: "Cerrar Sesión", icon: LogOut, path: "/", isLogout: true },
  ]


export default function AdminCreateUser() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [activeTab, setActiveTab] = useState("dashboard")
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: false,
  })

  const [errors, setErrors] = useState({})

  const validateForm = () => {
    const newErrors = {}

    if (!formData.username.trim()) {
      newErrors.username = "El nombre de usuario es requerido"
    } else if (formData.username.length < 3) {
      newErrors.username = "El nombre de usuario debe tener al menos 3 caracteres"
    }

    if (!formData.email.trim()) {
      newErrors.email = "El correo electrónico es requerido"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "El correo electrónico no es válido"
    }

    if (!formData.password) {
      newErrors.password = "La contraseña es requerida"
    } else if (formData.password.length < 8) {
      newErrors.password = "La contraseña debe tener al menos 8 caracteres"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  const handleRoleChange = (e) => {
    const value = e.target.value;
    setFormData({
      ...formData,
      role: value === "admin",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)
    setError("")
    setSuccess(false)

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/v1/users/', formData);
      setSuccess(true)
      setFormData({
        username: "",
        email: "",
        password: "",
        role: false,
      })
    } catch (err) {
      console.log("Error completo", err);

    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    setFormData({
      username: "",
      email: "",
      password: "",
      role: false,
    })
    setErrors({})
    setError("")
    setSuccess(false)
  }

  

  return (
    <div className="dashboard-page">
    <aside className="dashboard-sidebar">
  <div className="sidebar-content">
    {sidebarItems.map((item) => (
      <button
        key={item.id}
        className={`sidebar-item ${activeTab === item.id ? "active" : ""} ${item.isLogout ? "logout-item" : ""}`}
        onClick={() => {
          // Si es logout
          if (item.isLogout) {
            localStorage.removeItem('user')
            localStorage.removeItem('isAuthenticated')
            navigate('/')
          } else {
            // Navegación normal
            setActiveTab(item.id)
            navigate(item.path)
          }
        }}
        title={item.label}
      >
        <item.icon size={20} />
        <span>{item.label}</span>
      </button>
    ))}
  </div>
</aside>
    <div className="card">
      <div className="card-header">
        <h1 className="card-title">
          <UserPlus />
          Crear Nuevo Usuario
        </h1>
        <p className="card-description">Complete el formulario para agregar un nuevo usuario al sistema</p>
      </div>

      <div className="card-content">
        <form onSubmit={handleSubmit}>
          {success && (
            <div className="success-message">
              <CheckCircle2 className="success-icon" />
              <span>¡Usuario creado exitosamente!</span>
            </div>
          )}

          {error && (
            <div
              className="error-message"
              style={{
                padding: "1rem",
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                border: "1px solid var(--destructive)",
                borderRadius: "calc(var(--radius) - 0.25rem)",
                marginBottom: "1.5rem",
              }}
            >
              <XCircle className="error-icon" />
              <span>{error}</span>
            </div>
          )}

          {/* Sección: Información de Cuenta */}
          <div className="form-section">
            <h3 className="section-title">
              <User className="section-icon" />
              Información de Cuenta
            </h3>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="username" className="label">
                  Nombre de usuario <span className="required">*</span>
                </label>
                <div className="input-wrapper">
                  <User className="input-icon" />
                  <input
                    id="username"
                    name="username"
                    type="text"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="usuario123"
                    className="input"
                    disabled={loading}
                  />
                </div>
                {errors.username && (
                  <div className="error-message">
                    <XCircle className="error-icon" />
                    <span>{errors.username}</span>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="email" className="label">
                  Email <span className="required">*</span>
                </label>
                <div className="input-wrapper">
                  <Mail className="input-icon" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="usuario@ejemplo.com"
                    className="input"
                    disabled={loading}
                  />
                </div>
                {errors.email && (
                  <div className="error-message">
                    <XCircle className="error-icon" />
                    <span>{errors.email}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sección: Seguridad */}
          <div className="form-section">
            <h3 className="section-title">
              <Lock className="section-icon" />
              Seguridad
            </h3>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="password" className="label">
                  Contraseña <span className="required">*</span>
                </label>
                <div className="input-wrapper">
                  <Lock className="input-icon" />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="input"
                    disabled={loading}
                  />
                </div>
                {errors.password && (
                  <div className="error-message">
                    <XCircle className="error-icon" />
                    <span>{errors.password}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Rol del Usuario */}
          <div className="form-group full-width">
            <label htmlFor="role" className="label">
              Rol del usuario
            </label>
            <div className="input-wrapper">
              <Shield className="input-icon" />
              <select
                id="role"
                name="role"
                value={formData.role ? "admin" : "user"}
                onChange={handleRoleChange}
                className="select"
                disabled={loading}
              >
                <option value="user">Usuario</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
          </div>

          {/* Botones */}
          <div className="button-group">
            <button type="button" onClick={handleClear} disabled={loading} className="button button-outline">
              Limpiar formulario
            </button>
            <button type="submit" disabled={loading} className="button button-primary">
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Creando usuario...
                </>
              ) : (
                <>
                  <UserPlus className="button-icon" />
                  Crear usuario
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
    </div>
  )
}

export { AdminCreateUser }
