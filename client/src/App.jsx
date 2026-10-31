import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ScannerPage from './pages/ScannerPage';
import HistoryPage from './pages/HistoryPage';
import SettingsPage from './pages/SettingsPage';
import UrlVerifyPage from './pages/UrlVerifyPage';
import EmailVerifyPage from './pages/EmailVerifyPage';
import PhoneVerifyPage from './pages/PhoneVerifyPage';
import FileVerifyPage from './pages/FileVerifyPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ReportsPage from './pages/ReportsPage';
import NotificationsPage from './pages/NotificationsPage';
import AdminPage from './pages/AdminPage';
import PublicVerifyPage from './pages/PublicVerifyPage';
import HelpPage from './pages/HelpPage';
import DemoApp from './components/ui/demo';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Landing & Authentication */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<LoginPage />} />
        <Route path="/demo" element={<DemoApp />} />

        {/* Spatial Glass Cybersecurity Platform Shell */}
        <Route element={<Layout />}>
          {/* 1. Overview Dashboard */}
          <Route path="/dashboard" element={<DashboardPage />} />

          {/* 2. Verification Suite */}
          <Route path="/verify-url" element={<UrlVerifyPage />} />
          <Route path="/verify-email" element={<EmailVerifyPage />} />
          <Route path="/verify-phone" element={<PhoneVerifyPage />} />
          <Route path="/verify-file" element={<FileVerifyPage />} />

          {/* 3. Text Privacy Scanner & History */}
          <Route path="/scanner" element={<ScannerPage />} />
          <Route path="/history" element={<HistoryPage />} />

          {/* 4. Telemetry & Governance */}
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />

          {/* 5. Administration & IAM */}
          <Route path="/admin" element={<AdminPage />} />

          {/* 6. Public Verification Certificate Portal */}
          <Route path="/verify-public" element={<PublicVerifyPage />} />

          {/* 7. Help & Documentation */}
          <Route path="/help" element={<HelpPage />} />

          {/* 8. Settings & Compliance Policy */}
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        {/* Catch-all redirect to Landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
