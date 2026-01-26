"use client"

import { useState } from "react"
import { Link, Outlet, useNavigate } from "react-router-dom"
import { LayoutDashboard, Upload, Users, FileText, Settings, Search, Bell, CreditCard, Calendar } from "lucide-react"


export function DashboardLayout() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const navigate = useNavigate()
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

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
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

      {/* Main Content */}
      <div className="dashboard-main">
        {/* Header */}
        <header className="dashboard-header">
          <nav className="dashboard-nav">
            <Link to="/dashboard1" className="nav-link">
              Home
            </Link>
            <Link to="/customers" className="nav-link">
              Customers
            </Link>
            <div className="nav-dropdown">
              <button className="nav-link">
                Organizations
                <span className="dropdown-arrow">▼</span>
              </button>
            </div>
            <Link to="/upgrade" className="nav-link upgrade-link">
              Upgrade account
            </Link>
          </nav>

          <div className="dashboard-actions">
            <button className="header-icon-btn" title="Search">
              <Search size={18} />
            </button>
            <button className="header-icon-btn" title="Calendar">
              <Calendar size={18} />
            </button>
            <button className="header-icon-btn" title="Cards">
              <CreditCard size={18} />
            </button>
            <button className="header-icon-btn" title="Notifications">
              <Bell size={18} />
            </button>
            <button className="user-avatar">
              <span className="avatar-text">U</span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
