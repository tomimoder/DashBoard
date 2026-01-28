// src/pages/Inventory.jsx
import { useState, useEffect } from 'react'
import axios from 'axios'
import {
  Upload,
  FileText,
  AlertCircle,
  CheckCircle2,
  Loader2,
  X,
  Home,
  BarChart2,
  FileCheck,
  Settings,
  LogOut,
  Bell,
  Search,
  Package,
  LayoutDashboard,
  Users, 
  History,
  TrendingUp,
  TrendingDown,
  ShoppingCart
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom'

const sidebarItems = [
  { id: "home", label: "Inicio", icon: LayoutDashboard, path: "/dashboard" },
  { id: "inventory", label: "Inventario", icon: Package, path: "/inventory" },
  { id: "sale", label: "Registrar Venta", icon: ShoppingCart, path: "/register-sale" },
  { id: "upload", label: "Subir Boleta", icon: Upload, path: "/upload-receipt" },
  { id: "users", label: "Usuarios", icon: Users, path: "/create-user" },
  { id: "settings", label: "Configuración", icon: Settings, path: "/settings" },
  { id: "logout", label: "Cerrar Sesión", icon: LogOut, isLogout: true },
];

export default function Inventory() {
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const location = useLocation()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('inventory')

  // Filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [stockFilter, setStockFilter] = useState('all') // all, low, medium, high

  // Modal de historial
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [movements, setMovements] = useState([])
  const [loadingMovements, setLoadingMovements] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)

  useEffect(() => {
    const currentItem = sidebarItems.find(item => item.path === location.pathname)
    if (currentItem) {
      setActiveTab(currentItem.id)
    }
  }, [location.pathname]) 

  // Cargar productos
  useEffect(() => {
    loadProducts()
    loadCategories()
  }, [])

  // Aplicar filtros
  useEffect(() => {
    applyFilters()
  }, [products, searchTerm, selectedCategory, stockFilter])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const response = await axios.get('http://127.0.0.1:8000/api/v1/products/')
      setProducts(response.data)
    } catch (error) {
      console.error('Error al cargar productos:', error)
      alert('Error al cargar el inventario')
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/v1/products/categories/')
      setCategories(response.data)
    } catch (error) {
      console.error('Error al cargar categorías:', error)
    }
  }

  const applyFilters = () => {
    let filtered = [...products]

    // Filtro de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Filtro de categoría
    if (selectedCategory) {
      filtered = filtered.filter(product => product.category === selectedCategory)
    }

    // Filtro de stock
    if (stockFilter !== 'all') {
      filtered = filtered.filter(product => {
        if (stockFilter === 'low') return product.current_stock < 20
        if (stockFilter === 'medium') return product.current_stock >= 20 && product.current_stock < 50
        if (stockFilter === 'high') return product.current_stock >= 50
        return true
      })
    }

    setFilteredProducts(filtered)
  }

  const openHistoryModal = async (product) => {
    setSelectedProduct(product)
    setShowHistoryModal(true)
    setLoadingMovements(true)

    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/api/v1/stock-movements/?product=${product.id}`
      )
      setMovements(response.data)
    } catch (error) {
      console.error('Error al cargar movimientos:', error)
      alert('Error al cargar el historial')
    } finally {
      setLoadingMovements(false)
    }
  }

  const closeHistoryModal = () => {
    setShowHistoryModal(false)
    setSelectedProduct(null)
    setMovements([])
  }

  const getStockColor = (stock) => {
    if (stock < 20) return '#ef4444' // Rojo
    if (stock < 50) return '#f59e0b' // Naranja
    return '#10b981' // Verde
  }

  const getStockLabel = (stock) => {
    if (stock < 20) return 'Stock Bajo'
    if (stock < 50) return 'Stock Medio'
    return 'Stock Alto'
  }

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div className="spinner"></div>
        <p>Cargando inventario...</p>
      </div>
    )
  }

  return (
    <div className="dashboard-layout">

      {/* Sidebar */}
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
      <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Package />
            Inventario
          </h1>
          <p style={{ color: '#6b7280', margin: 0 }}>
            Gestiona y visualiza el stock de tus productos
          </p>
        </div>

        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            padding: '1.5rem',
            backgroundColor: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '0.5rem'
          }}>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
              Total Productos
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
              {products.length}
            </div>
          </div>

          <div style={{
            padding: '1.5rem',
            backgroundColor: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '0.5rem'
          }}>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
              Stock Bajo
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ef4444' }}>
              {products.filter(p => p.current_stock < 20).length}
            </div>
          </div>

          <div style={{
            padding: '1.5rem',
            backgroundColor: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '0.5rem'
          }}>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
              Stock Total
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>
              {products.reduce((sum, p) => sum + p.current_stock, 0)}
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
          padding: '1.5rem',
          backgroundColor: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: '0.5rem'
        }}>
          {/* Búsqueda */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
              Buscar
            </label>
            <div style={{ position: 'relative' }}>
              <Search style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#9ca3af'
              }} size={20} />
              <input
                type="text"
                placeholder="Nombre o SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem 0.5rem 2.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem'
                }}
              />
            </div>
          </div>

          {/* Stock */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
              Nivel de Stock
            </label>
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem'
              }}
            >
              <option value="all">Todos</option>
              <option value="low">Bajo (&lt; 20)</option>
              <option value="medium">Medio (20-49)</option>
              <option value="high">Alto (≥ 50)</option>
            </select>
          </div>

          {/* Botón limpiar */}
          {(searchTerm || selectedCategory || stockFilter !== 'all') && (
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button
                onClick={() => {
                  setSearchTerm('')
                  setSelectedCategory('')
                  setStockFilter('all')
                }}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  backgroundColor: '#6b7280',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                <X size={16} />
                Limpiar Filtros
              </button>
            </div>
          )}
        </div>

        {/* Tabla de Productos */}
        <div style={{
          backgroundColor: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: '0.5rem',
          overflow: 'hidden'
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: '#f9fafb' }}>
                <tr>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', fontSize: '0.875rem' }}>
                    Producto
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', fontSize: '0.875rem' }}>
                    SKU
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600', fontSize: '0.875rem' }}>
                    Stock
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600', fontSize: '0.875rem' }}>
                    Estado
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600', fontSize: '0.875rem' }}>
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                      No se encontraron productos
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr key={product.id} style={{ borderTop: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: '500' }}>{product.name}</div>
                        <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                          {product.unit}
                        </div>
                      </td>
                      <td style={{ padding: '1rem', color: '#6b7280' }}>
                        {product.sku || '-'}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        {product.category ? (
                          <span style={{
                            padding: '0.25rem 0.75rem',
                            backgroundColor: '#f3f4f6',
                            borderRadius: '9999px',
                            fontSize: '0.875rem'
                          }}>
                            {product.category}
                          </span>
                        ) : '-'}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <span style={{
                          fontSize: '1.25rem',
                          fontWeight: 'bold',
                          color: getStockColor(product.current_stock)
                        }}>
                          {product.current_stock}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          backgroundColor: product.current_stock < 20 ? '#fee2e2' :
                            product.current_stock < 50 ? '#fef3c7' : '#d1fae5',
                          color: product.current_stock < 20 ? '#991b1b' :
                            product.current_stock < 50 ? '#92400e' : '#065f46',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: '500'
                        }}>
                          {getStockLabel(product.current_stock)}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <button
                          onClick={() => openHistoryModal(product)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.5rem 1rem',
                            backgroundColor: '#3b82f6',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '0.5rem',
                            cursor: 'pointer',
                            fontSize: '0.875rem'
                          }}
                        >
                          <History size={16} />
                          Historial
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal de Historial */}
        {showHistoryModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
          }}>
            <div style={{
              backgroundColor: '#fff',
              borderRadius: '0.5rem',
              maxWidth: '800px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto'
            }}>
              {/* Header del Modal */}
              <div style={{
                padding: '1.5rem',
                borderBottom: '1px solid #e5e7eb',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'start'
              }}>
                <div>
                  <h2 style={{ margin: 0, marginBottom: '0.5rem' }}>
                    Historial de Movimientos
                  </h2>
                  <p style={{ margin: 0, color: '#6b7280' }}>
                    {selectedProduct?.name}
                  </p>
                  <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', color: '#6b7280' }}>
                    Stock actual: <strong style={{ color: getStockColor(selectedProduct?.current_stock) }}>
                      {selectedProduct?.current_stock} {selectedProduct?.unit}
                    </strong>
                  </p>
                </div>
                <button
                  onClick={closeHistoryModal}
                  style={{
                    padding: '0.5rem',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#6b7280'
                  }}
                >
                  <X size={24} />
                </button>
              </div>

              {/* Contenido del Modal */}
              <div style={{ padding: '1.5rem' }}>
                {loadingMovements ? (
                  <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <div className="spinner"></div>
                    <p>Cargando movimientos...</p>
                  </div>
                ) : movements.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                    No hay movimientos registrados para este producto
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {movements.map((movement) => (
                      <div
                        key={movement.id}
                        style={{
                          padding: '1rem',
                          border: '1px solid #e5e7eb',
                          borderRadius: '0.5rem',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'start'
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            marginBottom: '0.5rem'
                          }}>
                            {movement.movement_type === 'receipt' ? (
                              <TrendingUp style={{ color: '#10b981' }} size={20} />
                            ) : (
                              <TrendingDown style={{ color: '#ef4444' }} size={20} />
                            )}
                            <span style={{
                              fontWeight: '500',
                              color: movement.movement_type === 'receipt' ? '#10b981' : '#ef4444'
                            }}>
                              {movement.movement_type === 'receipt' ? 'Entrada' :
                                movement.movement_type === 'sale' ? 'Salida' : 'Ajuste'}
                            </span>
                          </div>

                          <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                            Cantidad: <strong>{movement.movement_type === 'receipt' ? '+' : '-'}{movement.quantity}</strong>
                          </div>

                          <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                            Stock: {movement.previous_stock} → {movement.new_stock}
                          </div>

                          {movement.notes && (
                            <div style={{
                              fontSize: '0.875rem',
                              color: '#6b7280',
                              marginTop: '0.5rem',
                              fontStyle: 'italic'
                            }}>
                              {movement.notes}
                            </div>
                          )}
                        </div>

                        <div style={{ textAlign: 'right', fontSize: '0.875rem', color: '#6b7280' }}>
                          {new Date(movement.created_at).toLocaleDateString('es-CL', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export { Inventory }