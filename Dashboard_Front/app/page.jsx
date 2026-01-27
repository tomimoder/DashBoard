"use client"

import { useState, useEffect } from "react"
import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  Search,
  Bell,
  CreditCard,
  Calendar,
  MoreVertical,
  TrendingUp,
} from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { useNavigate, useLocation } from "react-router-dom"

const sidebarItems = [
  { id: "home", label: "Inicio", icon: LayoutDashboard, path: "/dashboard" },
  { id: "inventory", label: "Inventario", icon: Package, path: "/inventory" }, 
  { id: "users", label: "Usuarios", icon: Users, path: "/create-user" },
  { id: "Upload", label: "Boleta", icon: Upload, path: "/upload-receipt" },
  { id: "settings", label: "Configuración", icon: Settings, path: "/settings" },
  { id: "logout", label: "Cerrar Sesión", icon: LogOut, isLogout: true },
]

export default function Page() {
  const [activeTab, setActiveTab] = useState('home')
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
      const currentItem = sidebarItems.find(item => item.path === location.pathname)
      if (currentItem) {
        setActiveTab(currentItem.id)
      }
    }, [location.pathname])

  // Sample data for charts
  const revenueData = [
    { name: "Sep 01", revenue: 45000, leads: 50 },
    { name: "Sep 02", revenue: 38000, leads: 40 },
    { name: "Sep 03", revenue: 42000, leads: 30 },
    { name: "Sep 04", revenue: 28000, leads: 20 },
    { name: "Sep 05", revenue: 8000, leads: 10 },
    { name: "Sep 06", revenue: 52000, leads: 0 },
    { name: "Sep 07", revenue: 32000, leads: 10 },
    { name: "Sep 08", revenue: 48000, leads: 10 },
    { name: "Sep 09", revenue: 35000, leads: 20 },
    { name: "Sep 10", revenue: 45000, leads: 0 },
  ]

  const opportunityData = [
    { name: "Leads", value: 72, color: "#8b92b2" },
    { name: "Sales calls", value: 6, color: "#5b9cff" },
    { name: "Follow-up", value: 4, color: "#47d764" },
    { name: "Conversion", value: 18, color: "#f5c542" },
  ]

  const dealFunnelData = [
    { stage: "Leads", value: 200, color: "#8b92b2" },
    { stage: "Sales calls", value: 100, color: "#5b9cff" },
    { stage: "Follow-up", value: 70, color: "#47d764" },
    { stage: "Conversion", value: 20, color: "#f5c542" },
    { stage: "Sale", value: 10, color: "#5ce1e6" },
  ]

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-content">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              className={`sidebar-item ${activeTab === item.id ? "active" : ""}`}
              onClick={() => setActiveTab(item.id)}
              title={item.id}
            >
              <item.icon size={20} />
            </button>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <div className="dashboard-main">
        {/* Header */}
        <header className="dashboard-header">
          <nav className="dashboard-nav">
            <button className="nav-link">Home</button>
            <button className="nav-link">Customers</button>
            <div className="nav-dropdown">
              <button className="nav-link">
                Organizations
                <span className="dropdown-arrow">▼</span>
              </button>
            </div>
            <button className="nav-link upgrade-link">Upgrade account</button>
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
          <div className="dashboard-page">
            {/* Dashboard Header */}
            <div className="page-header">
              <h1 className="page-title">Dashboard</h1>
              <div className="page-header-actions">
                <span className="page-date">March 30, 2023</span>
                <button className="filter-link">Filter date</button>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="kpi-grid">
              <div className="kpi-card">
                <div className="kpi-header">
                  <h3 className="kpi-title">Total customers</h3>
                  <button className="kpi-menu">
                    <MoreVertical size={16} />
                  </button>
                </div>
                <div className="kpi-content">
                  <div className="kpi-value">2,120</div>
                  <div className="kpi-badge positive">
                    <TrendingUp size={14} />
                    <span>20%</span>
                  </div>
                </div>
              </div>

              <div className="kpi-card">
                <div className="kpi-header">
                  <h3 className="kpi-title">Members</h3>
                  <button className="kpi-menu">
                    <MoreVertical size={16} />
                  </button>
                </div>
                <div className="kpi-content">
                  <div className="kpi-value">1,220</div>
                  <div className="kpi-badge positive">
                    <TrendingUp size={14} />
                    <span>15%</span>
                  </div>
                </div>
              </div>

              <div className="kpi-card">
                <div className="kpi-header">
                  <h3 className="kpi-title">Active now</h3>
                  <button className="kpi-menu">
                    <MoreVertical size={16} />
                  </button>
                </div>
                <div className="kpi-content">
                  <div className="kpi-value">316</div>
                  <div className="active-avatars">
                    <div className="avatar avatar-sm">A</div>
                    <div className="avatar avatar-sm">B</div>
                    <div className="avatar avatar-sm">C</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="charts-row">
              {/* Deal Funnel */}
              <div className="chart-card">
                <div className="chart-header">
                  <h3 className="chart-title">Deal funnel</h3>
                </div>
                <div className="chart-content">
                  <div className="funnel-container">
                    {dealFunnelData.map((item, index) => (
                      <div key={item.stage} className="funnel-stage">
                        <div
                          className="funnel-bar"
                          style={{
                            width: `${(item.value / dealFunnelData[0].value) * 100}%`,
                            backgroundColor: item.color,
                          }}
                        >
                          <span className="funnel-value">{item.value}</span>
                        </div>
                        <div className="funnel-legend">
                          <span className="legend-dot" style={{ backgroundColor: item.color }}></span>
                          <span className="legend-label">{item.stage}</span>
                          <span className="legend-value">{item.value}</span>
                        </div>
                      </div>
                    ))}
                    <div className="funnel-total">Total 150</div>
                  </div>
                </div>
              </div>

              {/* Opportunity Stage */}
              <div className="chart-card">
                <div className="chart-header">
                  <h3 className="chart-title">Opportunity stage</h3>
                </div>
                <div className="chart-content">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={opportunityData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {opportunityData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="donut-center-text">Total 100%</div>
                  <div className="chart-legend">
                    {opportunityData.map((item) => (
                      <div key={item.name} className="legend-item">
                        <span className="legend-dot" style={{ backgroundColor: item.color }}></span>
                        <span className="legend-label">{item.name}</span>
                        <span className="legend-percent">{item.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Revenue vs Leads Chart */}
            <div className="chart-card full-width">
              <div className="chart-header">
                <h3 className="chart-title">Revenue vs Leads</h3>
                <div className="chart-legend-inline">
                  <div className="legend-item">
                    <span className="legend-dot" style={{ backgroundColor: "#8b92b2" }}></span>
                    <span className="legend-label">Revenue</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-dot" style={{ backgroundColor: "#5b9cff" }}></span>
                    <span className="legend-label">Leads</span>
                  </div>
                </div>
              </div>
              <div className="chart-content">
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2e45" />
                    <XAxis dataKey="name" stroke="#8b92b2" tick={{ fill: "#8b92b2" }} />
                    <YAxis stroke="#8b92b2" tick={{ fill: "#8b92b2" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1f2235",
                        border: "1px solid #2a2e45",
                        borderRadius: "8px",
                        color: "#ffffff",
                      }}
                    />
                    <Bar dataKey="revenue" fill="#8b92b2" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="leads" fill="#5b9cff" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
