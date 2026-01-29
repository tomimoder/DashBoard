"use client"

import { useState, useEffect } from "react"
import axios from 'axios'
import { set } from "date-fns"
import { useNavigate, useLocation } from "react-router-dom"
import { LayoutDashboard, Users, FileText, Settings, Search, Bell, CreditCard, Calendar, Upload, Package, ShoppingCart, UserPlus, Mail, User, Lock, Shield, CheckCircle2, XCircle, LogOut} from "lucide-react"
import { is } from "date-fns/locale"



 const sidebarItems = [
  { id: "home", label: "Inicio", icon: LayoutDashboard, path: "/dashboard" },
  { id: "inventory", label: "Inventario", icon: Package, path: "/inventory" },
  { id: "sale", label: "Registrar Venta", icon: ShoppingCart, path: "/register-sale" },
  { id: "upload", label: "Subir Boleta", icon: Upload, path: "/upload-receipt" },
  { id: "users", label: "Usuarios", icon: Users, path: "/create-user" },
  { id: "logout", label: "Cerrar Sesión", icon: LogOut, isLogout: true },
];


export default function AdminCreateUser() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [activeTab, setActiveTab] = useState('users')
  const navigate = useNavigate()
  const location = useLocation()

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

  useEffect(() => {
      const currentItem = sidebarItems.find(item => item.path === location.pathname)
      if (currentItem) {
        setActiveTab(currentItem.id)
      }
    }, [location.pathname])

  

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
            <h3 className="section-title" style={{ color: "#ffff" }}>
              <User className="section-icon" style={{ color: "#ffff" }}/>
              Información de Cuenta
            </h3>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="username" className="label">
                  Nombre de usuario <span className="required">*</span>
                </label>
                <div className="input-wrapper">
                  <User className="input-icon" style={{ color: "#ffff" }} />
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
                  <Mail className="input-icon" style={{ color: "#ffff" }}/>
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
            <h3 className="section-title" style={{ color: "#ffff" }}>
              <Lock className="section-icon" style={{ color: "#ffff" }}/>
              Seguridad
            </h3>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="password" className="label">
                  Contraseña <span className="required">*</span>
                </label>
                <div className="input-wrapper">
                  <Lock className="input-icon" style={{ color: "#ffff" }}/>
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
            <div className="input-wrapper" style={{ color: "#ffff" }}>
              <Shield className="input-icon" style={{ color: "#ffff" }}/>
              <select
                id="role"
                name="role"
                value={formData.role ? "admin" : "user"}
                onChange={handleRoleChange}
                className="select"
                disabled={loading}
                style={{ backgroundColor: "#1f2235", border: "1px solid #2a2e45", color: "#ffffff" }}
              >
                <option value="user">Usuario</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
          </div>

          {/* Botones */}
          <div className="button-group">
            <button type="button" onClick={handleClear} disabled={loading} className="button button-outline" style={{ color: "#ffffff" }}>
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
