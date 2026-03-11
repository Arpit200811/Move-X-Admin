import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { OrderProvider, useOrders } from './context/OrderContext';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import MaintenanceRecalibration from './components/dashboard/MaintenanceRecalibration';
import PartnerDashboard from './pages/PartnerDashboard';
import { Toaster } from 'react-hot-toast';
import './App.css';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, loading, currentUser } = useOrders() || {};
  
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-indigo-400 font-mono">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4 mx-auto"></div>
        <p>Initializing Secure Session...</p>
      </div>
    </div>
  );
  
  const token = localStorage.getItem('movex_token');
  if (!isAuthenticated && !token) return <Navigate to="/login" replace />;
  
  if (currentUser && allowedRoles && !allowedRoles.includes(currentUser.role)) {
    if (currentUser.role === 'partner') return <Navigate to="/partner" replace />;
    if (currentUser.role === 'admin') return <Navigate to="/dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
};

function AppContent() {
  const ordersContext = useOrders() || {};
  const { isMaintenance, currentUser } = ordersContext;

  if (isMaintenance && currentUser?.role !== 'admin') {
    return <MaintenanceRecalibration />;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/partner/*"
          element={
            <ProtectedRoute allowedRoles={['partner']}>
              <PartnerDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <OrderProvider>
      <Toaster position="top-right" />
      <AppContent />
    </OrderProvider>
  );
}

export default App;
