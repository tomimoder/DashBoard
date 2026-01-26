import { MoreVertical, TrendingUp } from "lucide-react"
import { useState } from "react"
import { Link, Outlet, useNavigate } from "react-router-dom"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { LayoutDashboard, Upload, Users, FileText, Settings, Search, Bell, CreditCard, Calendar } from "lucide-react"

export function Dashboard() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const navigate = useNavigate()
  // Sample data for charts
  const revenueData = [
    { name: "Sep 01", revenue: 45000, leads: 50 },
    { name: "Sep 02", revenue: 38000, leads: 40 },
    { name: "Sep 03", revenue: 42000, leads: 30 },
    { name: "Sep 04", revenue: 28000, leads: 20 },
    { name: "Sep 05", revenue: 8000, leads: 10 },
    { name: "Sep 06", revenue: 52000, leads: 0 },
    { name: "Sep 07", revenue: 32000, leads: 30 },
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
  )
}
