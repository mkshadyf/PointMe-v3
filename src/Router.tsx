import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import PublicBusinessPage from './components/PublicBusinessPage';
import ProtectedRoute from './components/ProtectedRoute';

const Router: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/business/:businessId" element={<PublicBusinessPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Router;

