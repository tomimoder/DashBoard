import { Routes, Route } from "react-router-dom"
import { AdminCreateUser } from "./pages/admin-create-user.jsx"
import { DashboardLayout } from "./pages/DashboardLayout.jsx"
import { Dashboard } from "./pages/dashboard.jsx"
import { LoginPage } from "./pages/login.jsx"
import ProtectedRoute from "./components/ProtectedRoute.jsx"
import { UploadReceipt } from "./pages/UploadReceipt.jsx"
import ValidateReceipt from "./pages/ValidateReceipt.jsx"
import Inventory from "./pages/Inventory.jsx"
import "./index.css"

function App() {
  return (
      <Routes>
        <Route path="/" element={<LoginPage />} />

        <Route path="/create-user" element={
          <ProtectedRoute adminOnly>
            <AdminCreateUser />
          </ProtectedRoute>
          } />

        <Route path="/validate-receipt/:id" element={
          <ProtectedRoute adminOnly>
            <ValidateReceipt />
          </ProtectedRoute>
          } />

        <Route path="/inventory" element={
          <ProtectedRoute>
            <Inventory />
          </ProtectedRoute>
          } />

        <Route path="/upload-receipt" element={
          <ProtectedRoute adminOnly>
            <UploadReceipt />
          </ProtectedRoute>
          } />

        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
          }>
          <Route index element={
            <ProtectedRoute>
            <Dashboard />
            </ProtectedRoute>} />
        </Route>

        <Route path="/dashboard1" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
          } />
      </Routes>
  )
}

export default App
