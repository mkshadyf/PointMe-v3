import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material'
import { AuthProvider } from './lib/auth/AuthProvider'
import { ProtectedRoute } from './lib/auth/ProtectedRoute'
import { MainLayout } from './layouts/MainLayout'
import { registerServiceWorker, setupNetworkStatusHandlers } from './lib/pwa/registerSW'

// Pages
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ResetPassword from './pages/auth/ResetPassword'
import VerifyEmail from './pages/auth/VerifyEmail'
import Dashboard from './pages/Dashboard'
import Appointments from './pages/appointments/Appointments'
import Profile from './pages/profile/Profile'
import BusinessProfile from './pages/business/BusinessProfile'
import BusinessSettings from './pages/business/BusinessSettings'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminSettings from './pages/admin/AdminSettings'
import Unauthorized from './pages/auth/Unauthorized'

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: 12,
        },
      },
    },
  },
});

function App() {
  useEffect(() => {
    registerServiceWorker();
    setupNetworkStatusHandlers();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Protected routes */}
            <Route element={<MainLayout />}>
              {/* Customer routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/appointments"
                element={
                  <ProtectedRoute>
                    <Appointments />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />

              {/* Business routes */}
              <Route
                path="/business-profile"
                element={
                  <ProtectedRoute requiredRole={['business', 'admin']}>
                    <BusinessProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/business-settings"
                element={
                  <ProtectedRoute requiredRole={['business', 'admin']}>
                    <BusinessSettings />
                  </ProtectedRoute>
                }
              />

              {/* Admin routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute requiredRole={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/settings"
                element={
                  <ProtectedRoute requiredRole={['admin']}>
                    <AdminSettings />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
