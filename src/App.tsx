import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppSelector } from './store/hooks';
import { LoginPage } from './pages/auth/LoginPage';
import { HospitalLayout } from './components/hospital/HospitalLayout';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { DepartmentPage } from './pages/department/DepartmentPage';
import { PatientsPage } from './pages/patients/PatientsPage';
import { DoctorsPage } from './pages/doctors/DoctorsPage';
import { AppointmentsPage } from './pages/appointments/AppointmentsPage';
import { BillingPage } from './pages/billing/BillingPage';
import { ReportsPage } from './pages/reports/ReportsPage';
import { SettingsPage } from './pages/settings/SettingsPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* / route: Login Page */}
        <Route path="/" element={<LoginPage />} />

        {/* Hospital Management Layout with Individual Route Paths */}
        <Route
          element={
            <ProtectedRoute>
              <HospitalLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/departments" element={<DepartmentPage />} />
          <Route path="/patients" element={<PatientsPage />} />
          <Route path="/doctors" element={<DoctorsPage />} />
          <Route path="/appointments" element={<AppointmentsPage />} />
          <Route path="/billing" element={<BillingPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
