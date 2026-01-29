import { MoreVertical, TrendingUp } from "lucide-react"
import { useState, useEffect } from "react"
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts"
import { LayoutDashboard, Upload, Users, FileText, Settings, Search, Bell, CreditCard, Calendar, Package, ShoppingCart } from "lucide-react"
import axios from "axios"

export function Dashboard() {
  const [activeTab, setActiveTab] = useState('home')
  const navigate = useNavigate()
  const location = useLocation()
  
  // Estados para datos del backend
  const [products, setProducts] = useState([])
  const [movements, setMovements] = useState([])
  const [receipts, setReceipts] = useState([])
  const [loading, setLoading] = useState(false)
  
  // Datos procesados para gráficos
  const [stockByCategory, setStockByCategory] = useState([])
  const [stockLevels, setStockLevels] = useState([])
  const [recentMovements, setRecentMovements] = useState([])
  const [topProducts, setTopProducts] = useState([])

  useEffect(() => {
    const currentItem = sidebarItems.find(item => item.path === location.pathname)
    if (currentItem) {
      setActiveTab(currentItem.id)
    }
  }, [location.pathname])

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
    { id: "inventory", label: "Inventario", icon: Package, path: "/inventory" },
    { id: "sale", label: "Registrar Venta", icon: ShoppingCart, path: "/register-sale" },
    { id: "upload", label: "Subir Boleta", icon: Upload, path: "/upload-receipt" },
    { id: "users", label: "Usuarios", icon: Users, path: "/create-user" },
    { id: "logout", label: "Cerrar Sesión", icon: LogOut, isLogout: true },
  ]

  // ============================================================================
  // CARGAR DATOS DEL BACKEND
  // ============================================================================
  
  const loadAllData = async () => {
    try {
      setLoading(true)
      
      // Cargar productos
      const productsRes = await axios.get('http://127.0.0.1:8000/api/v1/products/')
      setProducts(productsRes.data)
      
      // Cargar movimientos de stock
      const movementsRes = await axios.get('http://127.0.0.1:8000/api/v1/stock-movements/')
      setMovements(movementsRes.data)
      
      // Cargar boletas
      const receiptsRes = await axios.get('http://127.0.0.1:8000/api/v1/receipts/')
      setReceipts(receiptsRes.data)
      
      // Procesar datos para gráficos
      processChartData(productsRes.data, movementsRes.data)
      
    } catch (error) {
      console.error('Error al cargar datos:', error)
    } finally {
      setLoading(false)
    }
  }

  // ============================================================================
  // PROCESAR DATOS PARA GRÁFICOS
  // ============================================================================
  
  const processChartData = (products, movements) => {
    // 1. Stock por categoría
    const categoryStock = {}
    products.forEach(p => {
      const cat = p.category || 'Sin categoría'
      if (!categoryStock[cat]) {
        categoryStock[cat] = 0
      }
      categoryStock[cat] += p.current_stock
    })
    
    const stockByCat = Object.keys(categoryStock).map(cat => ({
      category: cat,
      stock: categoryStock[cat]
    }))
    setStockByCategory(stockByCat)
    
    // 2. Niveles de stock (Bajo / Medio / Alto)
    const lowStock = products.filter(p => p.current_stock < 20).length
    const mediumStock = products.filter(p => p.current_stock >= 20 && p.current_stock < 50).length
    const highStock = products.filter(p => p.current_stock >= 50).length
    
    setStockLevels([
      { name: 'Stock Bajo', value: lowStock, color: '#ef4444' },
      { name: 'Stock Medio', value: mediumStock, color: '#f59e0b' },
      { name: 'Stock Alto', value: highStock, color: '#10b981' }
    ])
    
    // 3. Movimientos recientes (últimos 10 días)
    const last10Days = {}
    const today = new Date()
    
    // Inicializar últimos 10 días
    for (let i = 9; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      last10Days[dateStr] = { entradas: 0, salidas: 0 }
    }
    
    // Contar movimientos
    movements.forEach(m => {
      const date = m.created_at.split('T')[0]
      if (last10Days[date]) {
        if (m.movement_type === 'receipt') {
          last10Days[date].entradas += parseFloat(m.quantity)
        } else if (m.movement_type === 'sale') {
          last10Days[date].salidas += parseFloat(m.quantity)
        }
      }
    })
    
    const movementData = Object.keys(last10Days).map(date => ({
      date: new Date(date).toLocaleDateString('es-CL', { month: 'short', day: 'numeric' }),
      entradas: last10Days[date].entradas,
      salidas: last10Days[date].salidas
    }))
    setRecentMovements(movementData)
    
    // 4. Top productos con más movimientos
    const productMovements = {}
    movements.forEach(m => {
      if (m.product_name) {
        if (!productMovements[m.product_name]) {
          productMovements[m.product_name] = 0
        }
        productMovements[m.product_name] += Math.abs(parseFloat(m.quantity))
      }
    })
    
    const top5 = Object.keys(productMovements)
      .map(name => ({ name, total: productMovements[name] }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)
    
    setTopProducts(top5)
  }

  useEffect(() => {
    loadAllData()
  }, [])

  return (
    <div className="dashboard-page">
      <aside className="dashboard-sidebar">
        <div className="sidebar-content">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              className={`sidebar-item ${activeTab === item.id ? "active" : ""} ${item.isLogout ? "logout-item" : ""}`}
              onClick={() => {
                if (item.isLogout) {
                  localStorage.removeItem('user')
                  localStorage.removeItem('isAuthenticated')
                  navigate('/')
                } else {
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
          <span className="page-date">
            {new Date().toLocaleDateString('es-CL', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-header">
            <h3 className="kpi-title">Productos Totales</h3>
          </div>
          <div className="kpi-content">
            <div className="kpi-value">{products.length}</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <h3 className="kpi-title">Stock Bajo</h3>
          </div>
          <div className="kpi-content">
            <div className="kpi-value" style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ef4444' }}>
              {products.filter(p => p.current_stock < 20).length}
            </div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <h3 className="kpi-title">Stock Total</h3>
          </div>
          <div className="kpi-content">
            <div className="kpi-value" style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>
              {products.reduce((sum, p) => sum + p.current_stock, 0)}
            </div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <h3 className="kpi-title">Boletas Procesadas</h3>
          </div>
          <div className="kpi-content">
            <div className="kpi-value" style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>
              {receipts.filter(r => r.status === 'completed').length}
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="charts-row">
        
        {/* GRÁFICO 1: Stock por Categoría */}
        <div className="chart-card">
          <div className="chart-header">
          <h3 className="chart-title">Top 5 Productos con Más Movimiento</h3>
        </div>
        <div className="chart-content">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#8b92b2' }}>Cargando...</div>
          ) : topProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
              No hay datos de movimientos
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={topProducts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2e45" />
                <XAxis type="number" stroke="#8b92b2" tick={{ fill: "#8b92b2" }} />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  stroke="#8b92b2" 
                  tick={{ fill: "#8b92b2" }}
                  width={150}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2235",
                    border: "1px solid #2a2e45",
                    borderRadius: "8px",
                    color: "#ffffff",
                  }}
                />
                <Bar dataKey="total" fill="#f59e0b" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
        </div>

        {/* GRÁFICO 2: Niveles de Stock */}
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Niveles de Stock</h3>
          </div>
          <div className="chart-content">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#8b92b2' }}>Cargando...</div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stockLevels}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {stockLevels.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="chart-legend">
                  {stockLevels.map((item) => (
                    <div key={item.name} className="legend-item">
                      <span className="legend-dot" style={{ backgroundColor: item.color }}></span>
                      <span className="legend-label">{item.name}</span>
                      <span className="legend-percent">{item.value} productos</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* GRÁFICO 3: Movimientos de Stock (Últimos 10 días) */}
      <div className="chart-card full-width">
        <div className="chart-header">
          <h3 className="chart-title">Movimientos de Stock (Últimos 10 días)</h3>
          <div className="chart-legend-inline">
            <div className="legend-item">
              <span className="legend-dot" style={{ backgroundColor: "#10b981" }}></span>
              <span className="legend-label">Entradas</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot" style={{ backgroundColor: "#ef4444" }}></span>
              <span className="legend-label">Salidas</span>
            </div>
          </div>
        </div>
        <div className="chart-content">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#8b92b2' }}>Cargando...</div>
          ) : recentMovements.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
              No hay movimientos registrados
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={recentMovements}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2e45" />
                <XAxis dataKey="date" stroke="#8b92b2" tick={{ fill: "#8b92b2" }} />
                <YAxis stroke="#8b92b2" tick={{ fill: "#8b92b2" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2235",
                    border: "1px solid #2a2e45",
                    borderRadius: "8px",
                    color: "#ffffff",
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="entradas" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  dot={{ fill: "#10b981" }}
                />
                <Line 
                  type="monotone" 
                  dataKey="salidas" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  dot={{ fill: "#ef4444" }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}