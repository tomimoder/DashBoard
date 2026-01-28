// src/pages/RegisterSale.jsx
import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
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
  Edit,
  CheckCircle,
  Plus,
  Save,
  LayoutDashboard,
  ShoppingCart,
  Trash,
  Minus,
  Check,
  Users,
} from 'lucide-react';

// ============================================================================
// SIDEBAR ITEMS
// ============================================================================

const sidebarItems = [
  { id: "home", label: "Inicio", icon: LayoutDashboard, path: "/dashboard" },
  { id: "inventory", label: "Inventario", icon: Package, path: "/inventory" },
  { id: "sale", label: "Registrar Venta", icon: ShoppingCart, path: "/register-sale" },
  { id: "upload", label: "Subir Boleta", icon: Upload, path: "/upload-receipt" },
  { id: "users", label: "Usuarios", icon: Users, path: "/create-user" },
  { id: "settings", label: "Configuración", icon: Settings, path: "/settings" },
  { id: "logout", label: "Cerrar Sesión", icon: LogOut, isLogout: true },
];

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function RegisterSale() {
  const navigate = useNavigate()
  const location = useLocation()
  const [activeTab, setActiveTab] = useState("sale")
  
  // Estados del buscador
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  
  // Estados del carrito
  const [cart, setCart] = useState([])
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [notes, setNotes] = useState('')
  
  // Estados de UI
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [processing, setProcessing] = useState(false)
  
  // Sincronizar activeTab con la URL
  useEffect(() => {
    const currentItem = sidebarItems.find(item => item.path === location.pathname)
    if (currentItem) {
      setActiveTab(currentItem.id)
    }
  }, [location.pathname])
  
  // ============================================================================
  // FUNCIONES DE BÚSQUEDA
  // ============================================================================
  
  const searchProducts = async (term) => {
    if (!term || term.length < 2) {
      setSearchResults([])
      return
    }
    
    try {
      setSearching(true)
      const response = await axios.get(
        `http://127.0.0.1:8000/api/v1/products/?search=${term}`
      )
      setSearchResults(response.data)
    } catch (error) {
      console.error('Error al buscar productos:', error)
    } finally {
      setSearching(false)
    }
  }
  
  // Búsqueda con debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      searchProducts(searchTerm)
    }, 300)
    
    return () => clearTimeout(timer)
  }, [searchTerm])
  
  // ============================================================================
  // FUNCIONES DEL CARRITO
  // ============================================================================
  
  const addToCart = (product) => {
    const existingItem = cart.find(item => item.product.id === product.id)
    
    if (existingItem) {
      // Incrementar cantidad si ya existe
      updateQuantity(product.id, existingItem.quantity + 1)
    } else {
      // Agregar nuevo item
      setCart([...cart, {
        product: product,
        quantity: 1,
        unit_price: parseFloat(product.price)
      }])
    }
    
    // Limpiar búsqueda
    setSearchTerm('')
    setSearchResults([])
  }
  
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId)
      return
    }
    
    const product = cart.find(item => item.product.id === productId)?.product
    
    if (product && newQuantity > product.current_stock) {
      alert(`Stock insuficiente. Disponible: ${product.current_stock}`)
      return
    }
    
    setCart(cart.map(item => 
      item.product.id === productId 
        ? { ...item, quantity: newQuantity }
        : item
    ))
  }
  
  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.product.id !== productId))
  }
  
  const clearCart = () => {
    if (window.confirm('¿Vaciar el carrito?')) {
      setCart([])
    }
  }
  
  // ============================================================================
  // CÁLCULOS
  // ============================================================================
  
  const calculateSubtotal = (item) => {
    return item.quantity * item.unit_price
  }
  
  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + calculateSubtotal(item), 0)
  }
  
  // ============================================================================
  // REGISTRAR VENTA
  // ============================================================================
  
  const handleRegisterSale = async () => {
    if (cart.length === 0) {
      alert('El carrito está vacío')
      return
    }
    
    setShowConfirmModal(true)
  }
  
  const confirmSale = async () => {
    try {
      setProcessing(true)
      
      // Obtener usuario del localStorage
      const userData = JSON.parse(localStorage.getItem('user'))
      
      if (!userData || !userData.id) {
        alert('Error: Usuario no encontrado. Por favor inicia sesión de nuevo.')
        navigate('/')
        return
      }
      
      // Preparar datos de la venta
      const saleData = {
        user: userData.id,
        payment_method: paymentMethod,
        total_amount: calculateTotal(),
        notes: notes || '',
        items: cart.map(item => ({
          product: item.product.id,
          quantity: item.quantity,
          unit_price: item.unit_price
        }))
      }
      
      // Enviar al backend
      const response = await axios.post(
        'http://127.0.0.1:8000/api/v1/sales/',
        saleData
      )
      
      // Éxito
      alert(`✅ Venta registrada exitosamente\nTotal: $${calculateTotal().toLocaleString('es-CL')}`)
      
      // Limpiar formulario
      setCart([])
      setNotes('')
      setPaymentMethod('cash')
      setShowConfirmModal(false)
      
      // Opcional: Redirigir al dashboard o inventario
      // navigate('/dashboard')
      
    } catch (error) {
      console.error('Error al registrar venta:', error)
      
      if (error.response?.data?.error) {
        alert(`❌ Error: ${error.response.data.error}`)
      } else {
        alert('❌ Error al registrar la venta')
      }
    } finally {
      setProcessing(false)
    }
  }
  
  // ============================================================================
  // RENDER
  // ============================================================================
  
  return (
    <div className="dashboard-container">
      
      {/* SIDEBAR */}
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
      
      {/* MAIN CONTENT */}
      <main className="dashboard-main">
        <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
          
          {/* HEADER */}
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
              <ShoppingCart />
              Punto de Venta
            </h1>
            <p style={{ color: '#6b7280', margin: '0.5rem 0 0 0' }}>
              Busca productos y agrégalos al carrito para registrar una venta
            </p>
          </div>
          
          {/* BUSCADOR DE PRODUCTOS */}
          <div style={{
            backgroundColor: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '0.5rem',
            padding: '1.5rem',
            marginBottom: '2rem'
          }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Buscar Producto
            </label>
            <div style={{ position: 'relative' }}>
              <Search style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#9ca3af',
                pointerEvents: 'none'
              }} size={20} />
              <input
                type="text"
                placeholder="Buscar por nombre o SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 3rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '1rem'
                }}
              />
            </div>
            
            {/* Resultados de búsqueda */}
            {searchTerm && (
              <div style={{
                marginTop: '1rem',
                maxHeight: '300px',
                overflowY: 'auto',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem'
              }}>
                {searching ? (
                  <div style={{ padding: '1rem', textAlign: 'center', color: '#6b7280' }}>
                    Buscando...
                  </div>
                ) : searchResults.length === 0 ? (
                  <div style={{ padding: '1rem', textAlign: 'center', color: '#6b7280' }}>
                    No se encontraron productos
                  </div>
                ) : (
                  searchResults.map(product => (
                    <button
                      key={product.id}
                      onClick={() => addToCart(product)}
                      style={{
                        width: '100%',
                        padding: '1rem',
                        border: 'none',
                        borderBottom: '1px solid #e5e7eb',
                        backgroundColor: '#fff',
                        cursor: 'pointer',
                        textAlign: 'left',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                    >
                      <div>
                        <div style={{ fontWeight: '500' }}>{product.name}</div>
                        <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                          SKU: {product.sku || 'N/A'} | Stock: {product.current_stock}
                        </div>
                      </div>
                      <div style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#10b981' }}>
                        ${product.price}
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
          
          {/* CARRITO */}
          <div style={{
            backgroundColor: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '0.5rem',
            padding: '1.5rem',
            marginBottom: '2rem'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '1rem'
            }}>
              <h2 style={{ margin: 0 }}>Carrito de Venta</h2>
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    backgroundColor: '#ef4444',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    fontSize: '0.875rem'
                  }}
                >
                  <Trash size={16} />
                  Vaciar Carrito
                </button>
              )}
            </div>
            
            {cart.length === 0 ? (
              <div style={{
                padding: '3rem',
                textAlign: 'center',
                color: '#6b7280'
              }}>
                <ShoppingCart size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                <p>El carrito está vacío</p>
                <p style={{ fontSize: '0.875rem' }}>Busca productos y agrégalos al carrito</p>
              </div>
            ) : (
              <>
                {/* Tabla de productos */}
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ backgroundColor: '#000000' }}>
                      <tr>
                        <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Producto</th>
                        <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600' }}>Precio</th>
                        <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600' }}>Cantidad</th>
                        <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600' }}>Subtotal</th>
                        <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600' }}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cart.map((item) => (
                        <tr key={item.product.id} style={{ borderTop: '1px solid #000000' }}>
                          <td style={{ padding: '1rem' }}>
                            <div style={{ fontWeight: '500' }}>{item.product.name}</div>
                            <div style={{ fontSize: '0.875rem', color: '#000000' }}>
                              Stock disponible: {item.product.current_stock}
                            </div>
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'center', color: '#000000', fontWeight: 'bold' }}>
                            ${item.unit_price.toLocaleString('es-CL')}
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                              <button
                                onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                style={{
                                  padding: '0.5rem',
                                  backgroundColor: '#ef4444',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: '0.25rem',
                                  cursor: 'pointer'
                                }}
                              >
                                <Minus size={16} />
                              </button>
                              <span style={{ 
                                minWidth: '3rem', 
                                textAlign: 'center',
                                fontSize: '1.125rem',
                                fontWeight: 'bold',
                                color: '#000000'
                              }}>
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                disabled={item.quantity >= item.product.current_stock}
                                style={{
                                  padding: '0.5rem',
                                  backgroundColor: item.quantity >= item.product.current_stock ? '#9ca3af' : '#10b981',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: '0.25rem',
                                  cursor: item.quantity >= item.product.current_stock ? 'not-allowed' : 'pointer'
                                }}
                              >
                                <Plus size={16} />
                              </button>
                            </div>
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 'bold', fontSize: '1.125rem', color: '#000000' }}>
                            ${calculateSubtotal(item).toLocaleString('es-CL')}
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'center' }}>
                            <button
                              onClick={() => removeFromCart(item.product.id)}
                              style={{
                                padding: '0.5rem',
                                backgroundColor: '#ef4444',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '0.25rem',
                                cursor: 'pointer'
                              }}
                            >
                              <Trash size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Total y opciones de pago */}
                <div style={{
                  marginTop: '2rem',
                  paddingTop: '1rem',
                  borderTop: '2px solid #e5e7eb'
                }}>
                  <div style={{ 
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '1rem',
                    marginBottom: '1rem'
                  }}>
                    {/* Método de pago */}
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                        Método de Pago
                      </label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '0.5rem',
                          fontSize: '1rem'
                        }}
                      >
                        <option value="cash">Efectivo</option>
                        <option value="card">Tarjeta</option>
                        <option value="transfer">Transferencia</option>
                      </select>
                    </div>
                    
                    {/* Notas */}
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                        Notas (Opcional)
                      </label>
                      <input
                        type="text"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Agregar nota..."
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '0.5rem',
                          fontSize: '1rem'
                        }}
                      />
                    </div>
                  </div>
                  
                  {/* Total */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1rem',
                    backgroundColor: '#f9fafb',
                    borderRadius: '0.5rem',
                    marginBottom: '1rem'
                  }}>
                    <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>TOTAL:</span>
                    <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>
                      ${calculateTotal().toLocaleString('es-CL')}
                    </span>
                  </div>
                  
                  {/* Botón registrar venta */}
                  <button
                    onClick={handleRegisterSale}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      padding: '1rem',
                      backgroundColor: '#10b981',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '0.5rem',
                      fontSize: '1.125rem',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    <Check size={24} />
                    REGISTRAR VENTA
                  </button>
                </div>
              </>
            )}
          </div>
          
        </div>
      </main>
      
      {/* MODAL DE CONFIRMACIÓN */}
      {showConfirmModal && (
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
          zIndex: 2000,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '0.5rem',
            maxWidth: '500px',
            width: '100%',
            padding: '2rem',
            color: '#000000'
          }}>
            <h2 style={{ margin: '0 0 1rem 0' }}>Confirmar Venta</h2>
            
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                padding: '0.5rem 0',
                borderBottom: '1px solid #e5e7eb',
                color: '#000000'
              }}>
                <span>Productos:</span>
                <strong>{cart.length}</strong>
              </div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                padding: '0.5rem 0',
                borderBottom: '1px solid #e5e7eb'
              }}>
                <span>Método de pago:</span>
                <strong>
                  {paymentMethod === 'cash' ? 'Efectivo' : 
                   paymentMethod === 'card' ? 'Tarjeta' : 'Transferencia'}
                </strong>
              </div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                padding: '1rem 0',
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#10b981'
              }}>
                <span>Total:</span>
                <span>${calculateTotal().toLocaleString('es-CL')}</span>
              </div>
            </div>
            
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
              ¿Confirmar el registro de esta venta? El stock se reducirá automáticamente.
            </p>
            
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={confirmSale}
                disabled={processing}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  backgroundColor: '#10b981',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontWeight: 'bold',
                  cursor: processing ? 'not-allowed' : 'pointer'
                }}
              >
                {processing ? 'Procesando...' : 'Confirmar Venta'}
              </button>
              
              <button
                onClick={() => setShowConfirmModal(false)}
                disabled={processing}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#6b7280',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: processing ? 'not-allowed' : 'pointer'
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
      
    </div>
  )
}