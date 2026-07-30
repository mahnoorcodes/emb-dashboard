import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './lib/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Landing from './pages/Landing'
import CustomerSignup from './pages/CustomerSignup'
import CustomerLogin from './pages/CustomerLogin'
import CompanySignup from './pages/CompanySignup'
import CompanyLogin from './pages/CompanyLogin'
import Dashboard from './pages/Dashboard'

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
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
