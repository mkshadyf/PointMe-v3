import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Home from './components/Home'
import Login from './components/Login'
import UserDashboard from './components/UserDashboard'
import BusinessDashboard from './components/BusinessDashboard'
import AdminDashboard from './components/AdminDashboard'
import BusinessSetup from './components/BusinessSetup'
import CategoryManagement from './components/CategoryManagement'
import PublicBusinessPage from './components/PublicBusinessPage'
import RoleBasedRoute from './components/RoleBasedRoute'
import { useAuthStore } from './stores/authStore'
import AdminLayout from './layouts/AdminLayout'
import BusinessLayout from './layouts/BusinessLayout'
import CustomerLayout from './layouts/CustomerLayout'
import ErrorBoundary from './components/common/ErrorBoundary'
import ErrorFallback from './components/common/ErrorFallback'
import AppointmentManagement from './components/appointments/AppointmentManagement'

const Router: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore()

  // Helper function to redirect based on user role
  const getInitialRoute = () => {
    if (!isAuthenticated || !user) return '/login'
    
    switch (user.role) {
      case 'admin':
        return '/admin'
      case 'business_owner':
        return '/business'
      default:
        return '/'
    }
  }

  return (
    <BrowserRouter>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/business/:businessId" element={<PublicBusinessPage />} />

          {/* Customer routes */}
          <Route
            path="/"
            element={
              <RoleBasedRoute allowedRoles={['user', 'business_owner', 'admin']}>
                <CustomerLayout />
              </RoleBasedRoute>
            }
          >
            <Route index element={<Home />} />
            <Route path="dashboard" element={<UserDashboard />} />
            <Route path="appointments" element={<AppointmentManagement />} />
          </Route>

          {/* Business owner routes */}
          <Route
            path="/business"
            element={
              <RoleBasedRoute allowedRoles={['business_owner']}>
                <BusinessLayout />
              </RoleBasedRoute>
            }
          >
            <Route index element={<BusinessDashboard />} />
            <Route path="setup" element={<BusinessSetup />} />
            <Route path="appointments" element={<AppointmentManagement />} />
          </Route>

          {/* Admin routes */}
          <Route
            path="/admin"
            element={
              <RoleBasedRoute allowedRoles={['admin']}>
                <AdminLayout />
              </RoleBasedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="categories" element={<CategoryManagement />} />
          </Route>

          {/* Redirect to appropriate dashboard based on role */}
          <Route path="*" element={<Navigate to={getInitialRoute()} replace />} />
        </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  )
}

export default Router
