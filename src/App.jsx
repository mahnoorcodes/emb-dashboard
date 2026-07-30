import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './lib/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Landing from './pages/Landing'
import CustomerSignup from './pages/CustomerSignup'
import CustomerLogin from './pages/CustomerLogin'
import CompanySignup from './pages/CompanySignup'
import CompanyLogin from './pages/CompanyLogin'
import Dashboard from './pages/Dashboard'
import DashboardAdmin from './pages/DashboardAdmin'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import ResetPassword from './pages/ResetPassword'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename="/emb-dashboard">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/customer/signup" element={<CustomerSignup />} />
          <Route path="/customer/login" element={<CustomerLogin />} />
          <Route path="/company/signup" element={<CompanySignup />} />
          <Route path="/company/login" element={<CompanyLogin />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/dashboard/admin" element={<ProtectedRoute><DashboardAdmin /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}