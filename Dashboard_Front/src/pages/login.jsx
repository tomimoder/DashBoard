"use client"

import React from "react"

import { useState } from "react"
import { Eye, EyeOff, Mail, Lock } from "lucide-react"
import { set } from "date-fns"
import { useNavigate } from "react-router-dom"
import axios from "axios"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const navigate = useNavigate()
  const [error, setError] = useState("")

 const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {

        const response = await axios.post('http://127.0.0.1:8000/api/v1/login/', { email, password })
        
        // Guardar datos del usuario en localStorage
        localStorage.setItem('user', JSON.stringify(response.data.user))
        localStorage.setItem('isAuthenticated', 'true')

        // Redirigir segun el rol del usuario 
        if (response.data.user.role === true) {
            navigate('/dashboard')
        }


    } catch (error) {
        console.error('Error durante el inicio de sesión:', error)

        if (error.response){
            setError(error.response.data.message || 'Error de autenticación. Por favor, verifica tus credenciales.')
        } else if (error.request){
            setError('No se recibió respuesta del servidor. Por favor, intenta nuevamente más tarde.')
        } else{
            setError('Ocurrió un error inesperado. Por favor, intenta nuevamente.')
        }
    } finally {
        setLoading(false)
    }

 } 

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Logo / Brand */}
        <div className="login-header">
          <div className="login-logo">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <rect width="40" height="40" rx="8" fill="#5b9cff"/>
              <path d="M12 20H28M20 12V28" stroke="white" strokeWidth="3" strokeLinecap="round"/>
            </svg>
          </div>
          <h1 className="login-title">Welcome back</h1>
          <p className="login-subtitle">Sign in to your account to continue</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="login-form">
          {/* Email Field */}
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email address</label>
            <div className="input-wrapper">
              <Mail size={18} className="input-icon" />
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="form-input"
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="form-input"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="form-options">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="checkbox-input"
              />
              <span className="checkbox-custom"></span>
              <span className="checkbox-text">Remember me</span>
            </label>
            <a href="/forgot-password" className="forgot-link">Forgot password?</a>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="login-button"
          >
            {isLoading ? (
              <span className="button-loader"></span>
            ) : (
              "Sign in"
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export { LoginPage } 
