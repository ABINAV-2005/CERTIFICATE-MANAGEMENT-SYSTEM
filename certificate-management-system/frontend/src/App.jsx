import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Toaster } from './components/ui/toaster';

// Layouts
import MainLayout from './components/layout/MainLayout';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyPage from './pages/VerifyPage';
import Dashboard from './pages/Dashboard';
import CertificatesPage from './pages/CertificatesPage';
import CreateCertificatePage from './pages/CreateCertificatePage';
import TemplatesPage from './pages/TemplatesPage';
import CreateTemplatePage from './pages/CreateTemplatePage';
import UsersPage from './pages/UsersPage';
import ProfilePage from './pages/ProfilePage';
import AnalyticsPage from './pages/AnalyticsPage';
import UploadCertificatePage from './pages/UploadCertificatePage';
import ActivityPage from './pages/ActivityPage';
import VerifierToolsPage from './pages/VerifierToolsPage';
import SocialPage from './pages/SocialPage';
import './services/socket';

import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
          }}
        >
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify/:certificateId?" element={<VerifyPage />} />

            {/* Protected Routes */}
            <Route path="/app" element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/app/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="certificates" element={<CertificatesPage />} />
              <Route path="certificates/create" element={<CreateCertificatePage />} />
              {/* FIXED PATH TO MATCH DASHBOARD LINK */}
              <Route path="certificates/upload" element={<UploadCertificatePage />} />
              <Route path="templates" element={<TemplatesPage />} />
              <Route path="templates/create" element={<CreateTemplatePage />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="activity" element={<ActivityPage />} />
              <Route path="verifier-tools" element={<VerifierToolsPage />} />
              <Route path="social" element={<SocialPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
