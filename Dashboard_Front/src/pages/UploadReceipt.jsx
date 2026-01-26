"use client"

import { useState, useRef } from 'react';
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, Users} from "lucide-react"
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
  Search
} from 'lucide-react';
import axios from 'axios';

export default function UploadReceipt() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState("dashboard")
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  

  const sidebarItems = [
    { id: "home", label: "Inicio", icon: LayoutDashboard, path: "/dashboard" },
    { id: "users", label: "Usuarios", icon: Users, path: "/create-user" },
    { id: "Upload", label: "Boleta", icon: Upload, path: "/upload-receipt" },
    { id: "settings", label: "Configuración", icon: Settings, path: "/settings" },
    { id: "Logout", label: "Cerrar Sesión", icon: LogOut, path: "/", isLogout: true },
  ]

  // Validar que el archivo sea PDF y no exceda 10MB
  const validateFile = (file) => {
    if (!file) {
      setError('Por favor selecciona un archivo');
      return false;
    }

    if (file.type !== 'application/pdf') {
      setError('Solo se permiten archivos PDF');
      return false;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setError('El archivo no debe superar los 10MB');
      return false;
    }

    setError(null);
    return true;
  };

  // Manejar selección de archivo
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file)) {
      setSelectedFile(file);
      setSuccess(null);
    }
  };

  // Manejar drag and drop
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files[0];
    if (file && validateFile(file)) {
      setSelectedFile(file);
      setSuccess(null);
    }
  };

  // Subir archivo al backend
  const handleUpload = async () => {
  if (!selectedFile) {
    setError('Por favor selecciona un archivo');
    return;
  }

  setUploading(true);
  setError(null);
  setUploadProgress(0);

  const formData = new FormData();
  formData.append('pdf_file', selectedFile);
  
  // Obtener el usuario actual desde localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  formData.append('user', user.id);

  try {
    const response = await axios.post(
      'http://127.0.0.1:8000/api/v1/receipts/',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        },
      }
    );

    const data = response.data;
    
    setSuccess({
      message: 'Boleta procesada exitosamente',
      receiptId: data.id,
      status: data.status,
      itemsCount: data.items_count || 0,
      needsReview: data.items_needing_review || 0,
      supplier: data.supplier,
      date: data.receipt_date,
      items: data.items || []
    });

    // Limpiar después de 3 segundos
    setTimeout(() => {
      setSelectedFile(null);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }, 3000);

  } catch (err) {
    console.error('Error al subir boleta:', err);
    
    // Manejar diferentes tipos de errores
    if (err.response) {
      // El servidor respondió con un código de error
      const errorMessage = err.response.data?.detail 
        || err.response.data?.error 
        || JSON.stringify(err.response.data)
        || 'Error al procesar la boleta';
      setError(errorMessage);
    } else if (err.request) {
      // La petición se hizo pero no hubo respuesta
      setError('No se pudo conectar con el servidor. Verifica que el backend esté corriendo en http://127.0.0.1:8000');
    } else {
      // Algo pasó al configurar la petición
      setError(err.message || 'Error al procesar la boleta');
    }
    
    setUploadProgress(0);
  } finally {
    setUploading(false);
  }
};

  // Remover archivo seleccionado
  const handleRemoveFile = () => {
    setSelectedFile(null);
    setError(null);
    setSuccess(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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
      <main className="dashboard-main">
        {/* Header */}
        <header className="dashboard-header">
          <nav className="dashboard-nav">
            <button className="nav-link">Dashboard</button>
            <button className="nav-link">Inventario</button>
            <button className="nav-link">Boletas</button>
          </nav>
          <div className="dashboard-actions">
            <button className="header-icon-btn">
              <Search size={18} />
            </button>
            <button className="header-icon-btn">
              <Bell size={18} />
            </button>
            <button className="user-avatar">
              <span className="avatar-text">U</span>
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="dashboard-content">
          <div className="dashboard-page">
            {/* Page Header */}
            <div className="page-header">
              <div>
                <h1 className="page-title">Subir Boleta</h1>
                <p className="page-subtitle">
                  Sube una boleta en formato PDF para procesarla automáticamente
                </p>
              </div>
            </div>

            {/* Main Upload Card */}
            <div className="upload-card">
              <div className="upload-card-header">
                <div className="upload-card-icon">
                  <FileCheck size={24} />
                </div>
                <div>
                  <h2 className="upload-card-title">Cargar Archivo PDF</h2>
                  <p className="upload-card-description">
                    El sistema extraerá automáticamente los productos, cantidades, fecha y proveedor
                  </p>
                </div>
              </div>

              <div className="upload-card-content">
                {/* Drop Zone */}
                <div
                  className={`upload-dropzone ${dragActive ? 'active' : ''} ${selectedFile ? 'has-file' : ''}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => !selectedFile && fileInputRef.current?.click()}
                >
                  {!selectedFile ? (
                    <div className="dropzone-content">
                      <div className="dropzone-icon">
                        <Upload size={40} />
                      </div>
                      <div className="dropzone-text">
                        <p className="dropzone-title">Arrastra tu archivo PDF aquí</p>
                        <p className="dropzone-subtitle">o haz clic para seleccionar un archivo</p>
                      </div>
                      <div className="dropzone-hint">
                        <FileText size={16} />
                        <span>Máximo 10MB • Solo archivos PDF</span>
                      </div>
                    </div>
                  ) : (
                    <div className="file-preview">
                      <div className="file-preview-info">
                        <div className="file-icon">
                          <FileText size={32} />
                        </div>
                        <div className="file-details">
                          <p className="file-name">{selectedFile.name}</p>
                          <p className="file-size">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        className="file-remove-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFile();
                        }}
                        disabled={uploading}
                      >
                        <X size={20} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden-input"
                />

                {/* Progress Bar */}
                {uploading && (
                  <div className="upload-progress">
                    <div className="progress-header">
                      <span className="progress-label">Procesando boleta...</span>
                      <span className="progress-value">{uploadProgress}%</span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="progress-hint">Extrayendo productos y datos de la boleta</p>
                  </div>
                )}

                {/* Error Alert */}
                {error && (
                  <div className="alert alert-error">
                    <AlertCircle size={18} />
                    <span>{error}</span>
                  </div>
                )}

                {/* Success Alert */}
                {success && (
                  <div className="alert alert-success">
                    <CheckCircle2 size={18} />
                    <div className="alert-content">
                      <p className="alert-title">{success.message}</p>
                      
                      {success.supplier && (
                        <p className="alert-info">
                          <strong>Proveedor:</strong> {success.supplier}
                        </p>
                      )}
                      {success.date && (
                        <p className="alert-info">
                          <strong>Fecha:</strong> {new Date(success.date).toLocaleDateString('es-CL')}
                        </p>
                      )}

                      {success.items && success.items.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="font-medium text-green-800 dark:text-green-200">
                        Productos detectados:
                      </p>
                      <div className="max-h-40 overflow-y-auto bg-green-100/50 dark:bg-green-900/20 rounded-md p-3">
                        <ul className="space-y-1 text-sm">
                          {success.items.map((item, index) => (
                            <li key={index} className="flex justify-between items-center text-green-700 dark:text-green-300">
                              <span className="flex items-center gap-2">
                                <span className="w-5 h-5 flex items-center justify-center bg-green-200 dark:bg-green-800 rounded-full text-xs">
                                  {index + 1}
                                </span>
                                {item.detected_product_name}
                              </span>
                              <span className="font-medium">
                                 - Cantidad: {item.detected_quantity}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                      <div className="alert-badges">
                        <span className="badge badge-success">
                          {success.itemsCount} {success.itemsCount === 1 ? 'producto detectado' : 'productos detectados'}
                        </span>
                        {success.needsReview && success.needsReview > 0 && (
                          <span className="badge badge-warning">
                            {success.needsReview} {success.needsReview === 1 ? 'requiere' : 'requieren'} revisión
                          </span>
                        )}
                      </div>

                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => navigate(`/receipts/${success.receiptId}/validate`)}
                      >
                        <FileCheck size={16} />
                        Ir a validar boleta
                      </button>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="upload-actions">
                  <button
                    className="btn btn-outline"
                    onClick={() => navigate('/dashboard')}
                    disabled={uploading}
                  >
                    Cancelar
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={handleUpload}
                    disabled={!selectedFile || uploading}
                  >
                    {uploading ? (
                      <>
                        <Loader2 size={18} className="spin" />
                        Procesando...
                      </>
                    ) : (
                      <>
                        <Upload size={18} />
                        Subir y Procesar
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Info Cards */}
            <div className="info-cards-grid">
              <div className="info-card">
                <h3 className="info-card-title">¿Qué hace el sistema?</h3>
                <ul className="info-card-list">
                  <li>
                    <CheckCircle2 size={14} className="icon-primary" />
                    <span>Extrae automáticamente productos y cantidades</span>
                  </li>
                  <li>
                    <CheckCircle2 size={14} className="icon-primary" />
                    <span>Identifica la fecha y proveedor</span>
                  </li>
                  <li>
                    <CheckCircle2 size={14} className="icon-primary" />
                    <span>Hace matching con tu inventario existente</span>
                  </li>
                  <li>
                    <CheckCircle2 size={14} className="icon-primary" />
                    <span>Detecta items que requieren revisión manual</span>
                  </li>
                </ul>
              </div>

              <div className="info-card">
                <h3 className="info-card-title">Formato esperado</h3>
                <ul className="info-card-list">
                  <li>
                    <FileText size={14} className="icon-blue" />
                    <span>Boletas con formato tabla</span>
                  </li>
                  <li>
                    <FileText size={14} className="icon-blue" />
                    <span>Columnas: Producto | Cantidad</span>
                  </li>
                  <li>
                    <FileText size={14} className="icon-blue" />
                    <span>Texto legible (no escaneado borroso)</span>
                  </li>
                  <li>
                    <FileText size={14} className="icon-blue" />
                    <span>Incluir fecha y proveedor si es posible</span>
                  </li>
                </ul>
              </div>

              <div className="info-card">
                <h3 className="info-card-title">Próximos pasos</h3>
                <ul className="info-card-list">
                  <li>
                    <AlertCircle size={14} className="icon-amber" />
                    <span>Revisar productos detectados</span>
                  </li>
                  <li>
                    <AlertCircle size={14} className="icon-amber" />
                    <span>Corregir coincidencias incorrectas</span>
                  </li>
                  <li>
                    <AlertCircle size={14} className="icon-amber" />
                    <span>Validar cantidades</span>
                  </li>
                  <li>
                    <AlertCircle size={14} className="icon-amber" />
                    <span>Confirmar para actualizar inventario</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export { UploadReceipt }