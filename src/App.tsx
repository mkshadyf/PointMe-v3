import { Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { SWRConfig } from 'swr'
import { Toaster } from './components/ui/toaster'
import { AuthProvider } from './lib/auth/AuthProvider'
import { ThemeProvider, createTheme } from '@mui/material'
import { LoadingSpinner } from './components/ui/loading'
import { ErrorBoundary } from './components/ErrorBoundary'

// Pages
import Home from './pages/Home'
import Login from './components/auth/Login'
import Register from './components/auth/Register'
import ForgotPassword from './components/auth/ForgotPassword'
import ResetPassword from './components/auth/ResetPassword'
import Dashboard from './pages/Dashboard'
import BusinessProfile from './pages/business/BusinessProfile'
import BusinessSettings from './pages/business/BusinessSettings'
import Appointments from './pages/appointments/Appointments'
import AppointmentDetails from './pages/appointments/[id]'
import AppointmentPayment from './pages/appointments/[id]/payment'
import AdminSettings from './pages/admin/AdminSettings'
import NotFound from './pages/NotFound'
import Unauthorized from './components/auth/Unauthorized'
import VerifyEmail from './components/auth/VerifyEmail'
import Profile from './pages/Profile'
import AdminDashboard from './pages/admin/AdminDashboard'

// Protected route wrapper
import { ProtectedRoute } from './lib/auth/ProtectedRoute'
import { MainLayout } from './layouts/MainLayout'

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
})

export default function App() {
  return (
    <ErrorBoundary>
      <SWRConfig
        value={{
          revalidateOnFocus: false,
          shouldRetryOnError: false,
        }}
      >
        <ThemeProvider theme={theme}>
          <AuthProvider>
            <Router>
              <Suspense fallback={<LoadingSpinner />}>
                <Routes>
                  {/* Public routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/unauthorized" element={<Unauthorized />} />
                  <Route path="/verify-email" element={<VerifyEmail />} />

                  {/* Protected routes */}
                  <Route element={<MainLayout />}>
                    <Route
                      element={
                        <ProtectedRoute>
                          <Routes>
                            <Route path="/" element={<Navigate to="/dashboard" replace />} />
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/profile" element={<Profile />} />
                            <Route path="/appointments" element={<Appointments />} />
                            <Route path="/business">
                              <Route path="profile" element={<BusinessProfile />} />
                              <Route path="settings" element={<BusinessSettings />} />
                            </Route>
                            <Route path="/admin">
                              <Route path="dashboard" element={<AdminDashboard />} />
                              <Route path="settings" element={<AdminSettings />} />
                            </Route>
                          </Routes>
                        </ProtectedRoute>
                      }
                    />
                  </Route>

                  {/* 404 route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </Router>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </SWRConfig>
    </ErrorBoundary>
  )
}
