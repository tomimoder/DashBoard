"use client"

import { useState, useEffect } from "react"
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom"
import { LayoutDashboard, Upload, Users, FileText, Settings, Search, Bell, CreditCard, Calendar, Package, LogOut, ShoppingCart } from "lucide-react"


  const sidebarItems = [
  { id: "home", label: "Inicio", icon: LayoutDashboard, path: "/dashboard" },
  { id: "inventory", label: "Inventario", icon: Package, path: "/inventory" },
  { id: "sale", label: "Registrar Venta", icon: ShoppingCart, path: "/register-sale" },
  { id: "upload", label: "Subir Boleta", icon: Upload, path: "/upload-receipt" },
  { id: "users", label: "Usuarios", icon: Users, path: "/create-user" },
  { id: "logout", label: "Cerrar Sesión", icon: LogOut, isLogout: true },
];

export function DashboardLayout() {
  const [activeTab, setActiveTab] = useState('home')
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
      const currentItem = sidebarItems.find(item => item.path === location.pathname)
      if (currentItem) {
        setActiveTab(currentItem.id)
      }
    }, [location.pathname])

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

        {/* Content Area */}
        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
