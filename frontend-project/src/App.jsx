import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';

import LandingPage from './pages/LandingPage';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Cars from './pages/Cars';
import Services from './pages/Services';
import ServiceRecords from './pages/ServiceRecords';
import Payments from './pages/Payments';
import Reports from './pages/Report';

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Layout><Dashboard /></Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/cars"
        element={
          <PrivateRoute>
            <Layout><Cars /></Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/services"
        element={
          <PrivateRoute>
            <Layout><Services /></Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/service-records"
        element={
          <PrivateRoute>
            <Layout><ServiceRecords /></Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/payments"
        element={
          <PrivateRoute>
            <Layout><Payments /></Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <PrivateRoute>
            <Layout><Reports /></Layout>
          </PrivateRoute>
        }
      />

      {/* Landing page */}
      <Route path="/" element={<LandingPage />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
