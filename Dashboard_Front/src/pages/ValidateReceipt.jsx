// src/pages/ValidateReceipt.jsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
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
} from 'lucide-react';
import { LayoutDashboard, Users } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast';

// ============================================================================
// ICONOS SVG
// ============================================================================


// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function ValidateReceipt() {
  const { id } = useParams()
  const navigate = useNavigate()

  // Estado principal
  const [receipt, setReceipt] = useState(null)
  const [items, setItems] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [activeTab, setActiveTab] = useState('validate')
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Modal de crear producto
  const [showCreateProductModal, setShowCreateProductModal] = useState(false)
  const [newProduct, setNewProduct] = useState({
    name: '',
    sku: '',
    unit: 'unidad',
    current_stock: 0,
  })
  const [creatingProduct, setCreatingProduct] = useState(false)

  // Cargar datos al inicio
  useEffect(() => {
    loadData()
  }, [id])

  // ============================================================================
  // FUNCIONES DE CARGA
  // ============================================================================

  const loadData = async () => {
    try {
      setLoading(true)

      // Cargar boleta con items
      const receiptResponse = await axios.get(
        `http://127.0.0.1:8000/api/v1/receipts/${id}/`
      )
      setReceipt(receiptResponse.data)
      setItems(receiptResponse.data.items || [])

      // Cargar catálogo de productos
      const productsResponse = await axios.get(
        'http://127.0.0.1:8000/api/v1/products/'
      )
      setProducts(productsResponse.data)

    } catch (error) {
      console.error('Error al cargar datos:', error)
      toast.error('Error al cargar la boleta')
    } finally {
      setLoading(false)
    }
  }

  // ============================================================================
  // FUNCIONES DE EDICIÓN DE ITEMS
  // ============================================================================

  const startEditItem = (item) => {
    setEditingItem({
      ...item,
      corrected_product_name: item.corrected_product_name || item.detected_product_name,
      corrected_quantity: item.corrected_quantity || item.detected_quantity,
      matched_product_id: item.matched_product?.id || null
    })
  }

  const cancelEdit = () => {
    setEditingItem(null)
  }

  const saveItem = async (itemId) => {
    try {
      setSaving(true)

      await axios.post(
        `http://127.0.0.1:8000/api/v1/receipt-items/${itemId}/validate_item/`,
        {
          corrected_product_name: editingItem.corrected_product_name,
          corrected_quantity: editingItem.corrected_quantity,
          matched_product_id: editingItem.matched_product_id,
          validation_notes: editingItem.validation_notes
        }
      )

      await loadData()
      setEditingItem(null)

    } catch (error) {
      console.error('Error al guardar item:', error)
      toast.error('Error al guardar los cambios')
    } finally {
      setSaving(false)
    }
  }

  // ============================================================================
  // FUNCIONES DE CREACIÓN DE PRODUCTO
  // ============================================================================

  const openCreateProductModal = (item) => {
    setNewProduct({
      name: item.corrected_product_name || item.detected_product_name,
      sku: '',
      category: '',
      unit: 'unidad',
      current_stock: 0,
      price: 0
    })
    setShowCreateProductModal(true)
  }

  const createNewProduct = async () => {
    if (!newProduct.name.trim()) {
      toast.warning('El nombre del producto es obligatorio')
      return
    }

    try {
      setCreatingProduct(true)

      const response = await axios.post(
        'http://127.0.0.1:8000/api/v1/products/',
        newProduct
      )

      toast.success(`✅ Producto "${response.data.name}" creado exitosamente`)

      // Recargar productos
      await loadData()

      // Asignar automáticamente al item editando
      if (editingItem) {
        setEditingItem({
          ...editingItem,
          matched_product_id: response.data.id
        })
      }

      setShowCreateProductModal(false)

    } catch (error) {
      console.error('Error al crear producto:', error)
      toast.error('Error al crear el producto: ' + (error.response?.data?.message || error.message))
    } finally {
      setCreatingProduct(false)
    }
  }

  // ============================================================================
  // FUNCIONES DE VALIDACIÓN DE BOLETA
  // ============================================================================

  const validateReceipt = async () => {
    const hasUnvalidated = items.some(item => !item.is_validated)

    if (hasUnvalidated) {
      toast.warning('Debes validar todos los items antes de completar la boleta')
      return
    }

    try {
      setSaving(true)

      await axios.post(
        `http://127.0.0.1:8000/api/v1/receipts/${id}/validate/`
      )

      toast.success('✅ Boleta validada exitosamente')
      await loadData()

    } catch (error) {
      console.error('Error al validar boleta:', error)
      toast.error('Error al validar la boleta: ' + (error.response?.data?.error || error.message))
    } finally {
      setSaving(false)
    }
  }

  const applyToInventory = async () => {
    setShowConfirmModal(false);

    try {
      setSaving(true)

      await axios.post(
        `http://127.0.0.1:8000/api/v1/receipts/${id}/apply_to_inventory/`
      )

      toast.success('✅ Inventario actualizado exitosamente')
      navigate('/inventory')

    } catch (error) {
      console.error('Error al aplicar al inventario:', error)
      toast.error('Error al actualizar el inventario: ' + (error.response?.data?.error || error.message))
    } finally {
      setSaving(false)
    }
  }

  const sidebarItems = [
    { id: "home", label: "Inicio", icon: LayoutDashboard, path: "/dashboard" },
    { id: "inventory", label: "Inventario", icon: Package, path: "/inventory" },
    { id: "users", label: "Usuarios", icon: Users, path: "/create-user" },
    { id: "Upload", label: "Boleta", icon: Upload, path: "/upload-receipt" },
    { id: "settings", label: "Configuración", icon: Settings, path: "/settings" },
    { id: "logout", label: "Cerrar Sesión", icon: LogOut, isLogout: true },
  ]

  // ============================================================================
  // RENDER - LOADING
  // ============================================================================

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div className="spinner"></div>
        <p>Cargando boleta...</p>
      </div>
    )
  }

  if (!receipt) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <AlertCircle />
        <p>Boleta no encontrada</p>
      </div>
    )
  }


  // ============================================================================
  // RENDER PRINCIPAL
  // ============================================================================

  return (
    <div className="dashboard-layout">
      <Toaster position="top-right" />
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
      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>

        {/* HEADER */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Package />
            Validar Boleta #{receipt.id}
          </h1>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginTop: '1rem',
            padding: '1rem',
            backgroundColor: '#f3f4f6',
            borderRadius: '0.5rem'
          }}>
            <div>
              <strong>Estado:</strong>
              <span style={{
                marginLeft: '0.5rem',
                padding: '0.25rem 0.5rem',
                borderRadius: '0.25rem',
                backgroundColor: receipt.status === 'validated' ? '#d1fae5' :
                  receipt.status === 'completed' ? '#10b981' : '#fef3c7',
                color: receipt.status === 'validated' ? '#065f46' :
                  receipt.status === 'completed' ? '#fff' : '#92400e'
              }}>
                {receipt.status}
              </span>
            </div>

            {receipt.supplier && (
              <div>
                <strong>Proveedor:</strong> {receipt.supplier}
              </div>
            )}

            {receipt.receipt_date && (
              <div>
                <strong>Fecha:</strong> {receipt.receipt_date}
              </div>
            )}

            <div>
              <strong>Items:</strong> {items.length}
            </div>
          </div>
        </div>

        {/* LISTA DE ITEMS */}
        <div style={{ marginBottom: '2rem' }}>
          <h2>Productos Detectados</h2>

          {items.length === 0 ? (
            <div style={{
              padding: '2rem',
              textAlign: 'center',
              backgroundColor: '#f9fafb',
              borderRadius: '0.5rem'
            }}>
              <p>No se detectaron productos en esta boleta</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {items.map((item) => (
                <div
                  key={item.id}
                  style={{
                    border: `2px solid ${item.needs_review ? '#f59e0b' : item.is_validated ? '#10b981' : '#d1d5db'}`,
                    borderRadius: '0.5rem',
                    padding: '1.5rem',
                    backgroundColor: '#fff'
                  }}
                >
                  {/* Header del Item */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'start',
                    marginBottom: '1rem'
                  }}>
                    <div>
                      <h3 style={{ margin: 0, marginBottom: '0.5rem' }}>
                        {item.detected_product_name}
                      </h3>
                      <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>
                        Texto original: "{item.raw_text}"
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {item.is_validated ? (
                        <span style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          padding: '0.5rem 1rem',
                          backgroundColor: '#d1fae5',
                          color: '#065f46',
                          borderRadius: '0.5rem',
                          fontWeight: 'bold'
                        }}>
                          <CheckCircle size={16} />
                          Validado
                        </span>
                      ) : item.needs_review ? (
                        <span style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          padding: '0.5rem 1rem',
                          backgroundColor: '#fef3c7',
                          color: '#92400e',
                          borderRadius: '0.5rem',
                          fontWeight: 'bold'
                        }}>
                          <AlertCircle size={16} />
                          Necesita Revisión
                        </span>
                      ) : (
                        <span style={{
                          padding: '0.5rem 1rem',
                          backgroundColor: '#e5e7eb',
                          color: '#374151',
                          borderRadius: '0.5rem'
                        }}>
                          Pendiente
                        </span>
                      )}
                    </div>
                  </div>

                  {/* MODO VISTA */}
                  {editingItem?.id !== item.id ? (
                    <div>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                        gap: '1rem',
                        marginBottom: '1rem'
                      }}>
                        <div>
                          <strong>Cantidad Detectada:</strong>
                          <p style={{ margin: '0.25rem 0 0 0', fontSize: '1.25rem' }}>
                            {item.detected_quantity}
                          </p>
                        </div>

                        {item.matched_product ? (
                          <div>
                            <strong>Producto Encontrado:</strong>
                            <p style={{ margin: '0.25rem 0 0 0' }}>
                              {item.matched_product_name}
                            </p>
                            {item.confidence_score && (
                              <p style={{
                                margin: '0.25rem 0 0 0',
                                fontSize: '0.875rem',
                                color: '#6b7280'
                              }}>
                                Confianza: {item.confidence_score.toFixed(1)}%
                              </p>
                            )}
                          </div>
                        ) : (
                          <div>
                            <strong>Producto:</strong>
                            <p style={{ margin: '0.25rem 0 0 0', color: '#ef4444' }}>
                              ⚠️ No se encontró match automático
                            </p>
                          </div>
                        )}

                        {item.corrected_product_name && (
                          <div>
                            <strong>Nombre Corregido:</strong>
                            <p style={{ margin: '0.25rem 0 0 0' }}>
                              {item.corrected_product_name}
                            </p>
                          </div>
                        )}

                        {item.corrected_quantity && (
                          <div>
                            <strong>Cantidad Corregida:</strong>
                            <p style={{ margin: '0.25rem 0 0 0', fontSize: '1.25rem' }}>
                              {item.corrected_quantity}
                            </p>
                          </div>
                        )}
                      </div>

                      {!item.is_validated && (
                        <button
                          onClick={() => startEditItem(item)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.5rem 1rem',
                            backgroundColor: '#3b82f6',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '0.5rem',
                            cursor: 'pointer'
                          }}
                        >
                          <Edit size={16} />
                          Editar
                        </button>
                      )}
                    </div>

                  ) : (

                    /* MODO EDICIÓN */
                    <div>
                      <div style={{
                        display: 'grid',
                        gap: '1rem',
                        marginBottom: '1rem'
                      }}>

                        {/* ALERTA: Producto no existe */}
                        {!editingItem.matched_product_id && (
                          <div style={{
                            padding: '1rem',
                            backgroundColor: '#fef3c7',
                            border: '1px solid #f59e0b',
                            borderRadius: '0.5rem'
                          }}>
                            <p style={{ margin: '0 0 0.5rem 0', color: '#92400e', fontWeight: '500' }}>
                              ⚠️ Este producto no existe en el inventario
                            </p>
                            <button
                              type="button"
                              onClick={() => openCreateProductModal(editingItem)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.5rem 1rem',
                                backgroundColor: '#10b981',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '0.5rem',
                                cursor: 'pointer',
                                fontSize: '0.875rem'
                              }}
                            >
                              <Plus size={16} />
                              Crear Producto Nuevo
                            </button>
                          </div>
                        )}

                        {/* Selector de Producto */}
                        <div>
                          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                            Producto:
                          </label>
                          <select
                            value={editingItem.matched_product_id || ''}
                            onChange={(e) => setEditingItem({
                              ...editingItem,
                              matched_product_id: e.target.value ? parseInt(e.target.value) : null
                            })}
                            style={{
                              width: '100%',
                              padding: '0.5rem',
                              border: '1px solid #d1d5db',
                              borderRadius: '0.5rem'
                            }}
                          >
                            <option value="">-- Seleccionar producto --</option>
                            {products.map(product => (
                              <option key={product.id} value={product.id}>
                                {product.name} (Stock: {product.current_stock})
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Nombre del Producto */}
                        <div>
                          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                            Nombre del Producto:
                          </label>
                          <input
                            type="text"
                            value={editingItem.corrected_product_name}
                            onChange={(e) => setEditingItem({
                              ...editingItem,
                              corrected_product_name: e.target.value
                            })}
                            style={{
                              width: '100%',
                              padding: '0.5rem',
                              border: '1px solid #d1d5db',
                              borderRadius: '0.5rem'
                            }}
                          />
                        </div>

                        {/* Cantidad */}
                        <div>
                          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                            Cantidad:
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={editingItem.corrected_quantity}
                            onChange={(e) => setEditingItem({
                              ...editingItem,
                              corrected_quantity: e.target.value
                            })}
                            style={{
                              width: '100%',
                              padding: '0.5rem',
                              border: '1px solid #d1d5db',
                              borderRadius: '0.5rem'
                            }}
                          />
                        </div>

                        {/* Notas */}
                        <div>
                          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                            Notas:
                          </label>
                          <textarea
                            value={editingItem.validation_notes || ''}
                            onChange={(e) => setEditingItem({
                              ...editingItem,
                              validation_notes: e.target.value
                            })}
                            rows={2}
                            style={{
                              width: '100%',
                              padding: '0.5rem',
                              border: '1px solid #d1d5db',
                              borderRadius: '0.5rem'
                            }}
                          />
                        </div>
                      </div>

                      {/* Botones de Guardar/Cancelar */}
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => saveItem(item.id)}
                          disabled={saving}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.5rem 1rem',
                            backgroundColor: '#10b981',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '0.5rem',
                            cursor: saving ? 'not-allowed' : 'pointer'
                          }}
                        >
                          <Save size={16} />
                          {saving ? 'Guardando...' : 'Guardar'}
                        </button>

                        <button
                          onClick={cancelEdit}
                          disabled={saving}
                          style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: '#6b7280',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '0.5rem',
                            cursor: saving ? 'not-allowed' : 'pointer'
                          }}
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* BOTONES DE ACCIÓN */}
        {items.length > 0 && (
          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'flex-end',
            padding: '1rem',
            borderTop: '2px solid #e5e7eb'
          }}>
            {receipt.status === 'needs_validation' && (
              <button
                onClick={validateReceipt}
                disabled={saving || items.some(item => !item.is_validated)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  backgroundColor: items.some(item => !item.is_validated) ? '#9ca3af' : '#3b82f6',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  cursor: items.some(item => !item.is_validated) ? 'not-allowed' : 'pointer'
                }}
              >
                <CheckCircle size={20} />
                Validar Boleta
              </button>
            )}

            {receipt.status === 'validated' && (
              <button
                onClick={() => setShowConfirmModal(true)}
                disabled={saving}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#10b981',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  cursor: saving ? 'not-allowed' : 'pointer'
                }}
              >
                <Package size={20} />
                {saving ? 'Aplicando...' : 'Aplicar al Inventario'}
              </button>
            )}
            {/* Modal de confirmación */}
            {showConfirmModal && (
              <div
                style={{
                  position: 'fixed',
                  inset: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1000,
                  backdropFilter: 'blur(4px)'
                }}
                onClick={() => setShowConfirmModal(false)}
              >
                <div
                  style={{
                    backgroundColor: '#fff',
                    borderRadius: '1rem',
                    padding: '2rem',
                    maxWidth: '400px',
                    width: '90%',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                    animation: 'fadeIn 0.2s ease-out'
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Icono de advertencia */}
                  <div
                    style={{
                      width: '60px',
                      height: '60px',
                      backgroundColor: '#fef3c7',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 1.5rem'
                    }}
                  >
                    <svg
                      width="28"
                      height="28"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                      <line x1="12" y1="9" x2="12" y2="13" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                  </div>

                  {/* Título */}
                  <h3
                    style={{
                      fontSize: '1.25rem',
                      fontWeight: '600',
                      color: '#1f2937',
                      textAlign: 'center',
                      marginBottom: '0.75rem'
                    }}
                  >
                    Confirmar acción
                  </h3>

                  {/* Mensaje */}
                  <p
                    style={{
                      color: '#6b7280',
                      textAlign: 'center',
                      marginBottom: '2rem',
                      lineHeight: '1.5'
                    }}
                  >
                    ¿Aplicar estos cambios al inventario?
                    <br />
                    <span style={{ color: '#ef4444', fontWeight: '500' }}>
                      Esta acción no se puede deshacer.
                    </span>
                  </p>

                  {/* Botones */}
                  <div
                    style={{
                      display: 'flex',
                      gap: '1rem',
                      justifyContent: 'center'
                    }}
                  >
                    <button
                      onClick={() => setShowConfirmModal(false)}
                      style={{
                        padding: '0.75rem 1.5rem',
                        backgroundColor: '#f3f4f6',
                        color: '#374151',
                        border: 'none',
                        borderRadius: '0.5rem',
                        fontSize: '1rem',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseOver={(e) => e.target.style.backgroundColor = '#e5e7eb'}
                      onMouseOut={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={applyToInventory}
                      style={{
                        padding: '0.75rem 1.5rem',
                        backgroundColor: '#10b981',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '0.5rem',
                        fontSize: '1rem',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseOver={(e) => e.target.style.backgroundColor = '#059669'}
                      onMouseOut={(e) => e.target.style.backgroundColor = '#10b981'}
                    >
                      Sí, aplicar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* MODAL DE CREAR PRODUCTO */}
        {showCreateProductModal && (
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
              maxHeight: '90vh',
              overflow: 'auto'
            }}>
              {/* Header */}
              <div style={{
                padding: '1.5rem',
                borderBottom: '1px solid #e5e7eb',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <h2 style={{ margin: 0 }}>Crear Producto Nuevo</h2>
                <button
                  onClick={() => setShowCreateProductModal(false)}
                  disabled={creatingProduct}
                  style={{
                    padding: '0.5rem',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <X size={24} />
                </button>
              </div>

              {/* Formulario */}
              <div style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                  {/* Nombre */}
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                      Nombre del Producto *
                    </label>
                    <input
                      type="text"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                      placeholder="Ej: Pan Integral 500g"
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.5rem'
                      }}
                    />
                  </div>

                  {/* SKU */}
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                      SKU (Código)
                    </label>
                    <input
                      type="text"
                      value={newProduct.sku}
                      onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                      placeholder="Ej: PAN-INT-001"
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.5rem'
                      }}
                    />
                  </div>

                  {/* Unidad */}
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                      Unidad de Medida *
                    </label>
                    <select
                      value={newProduct.unit}
                      onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.5rem'
                      }}
                    >
                      <option value="unidad">Unidad</option>
                      <option value="kilogramo">Kilogramo</option>
                      <option value="gramo">Gramo</option>
                      <option value="litro">Litro</option>
                      <option value="mililitro">Mililitro</option>
                      <option value="caja">Caja</option>
                      <option value="paquete">Paquete</option>
                    </select>
                  </div>

                  {/* Stock Inicial */}
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                      Stock Inicial
                    </label>
                    <input
                      type="number"
                      value={newProduct.current_stock}
                      onChange={(e) => setNewProduct({ ...newProduct, current_stock: parseInt(e.target.value) || 0 })}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.5rem'
                      }}
                    />
                    <small style={{ color: '#6b7280' }}>
                      Normalmente 0 si es un producto nuevo
                    </small>
                  </div>

                </div>

                {/* Botones */}
                <div style={{
                  display: 'flex',
                  gap: '0.5rem',
                  marginTop: '1.5rem'
                }}>
                  <button
                    onClick={createNewProduct}
                    disabled={creatingProduct || !newProduct.name}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      backgroundColor: newProduct.name ? '#10b981' : '#9ca3af',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '0.5rem',
                      cursor: newProduct.name ? 'pointer' : 'not-allowed',
                      fontWeight: 'bold'
                    }}
                  >
                    {creatingProduct ? 'Creando...' : 'Crear Producto'}
                  </button>

                  <button
                    onClick={() => setShowCreateProductModal(false)}
                    disabled={creatingProduct}
                    style={{
                      padding: '0.75rem 1.5rem',
                      backgroundColor: '#6b7280',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '0.5rem',
                      cursor: 'pointer'
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export { ValidateReceipt }