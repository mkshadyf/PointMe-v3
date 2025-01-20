import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Dashboard from './components/Dashboard'
import PublicBusinessPage from './components/PublicBusinessPage'
import LoginForm from './components/LoginForm'
import Home from './components/Home'
 import ProtectedRoute from './components/ProtectedRoute'

export default function AppRouter() {
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null)
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null)

  const handleSelectBusiness = (businessId: string | null) => {
    setSelectedBusinessId(businessId)
    // Reset service selection when business changes
    setSelectedServiceId(null)
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginForm />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard
                selectedBusinessId={selectedBusinessId}
                selectedServiceId={selectedServiceId}
                onSelectBusiness={handleSelectBusiness}
                setSelectedServiceId={setSelectedServiceId}
              />
            </ProtectedRoute>
          }
        />
        <Route path="/business/:id" element={<PublicBusinessPage />} />
      </Routes>
    </Router>
  )
}