import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppSelector } from './store/hooks';
import { LoginView } from './components/LoginView';
import { HospitalLayout } from './components/hospital/HospitalLayout';
import { HospitalDashboardView } from './components/hospital/HospitalDashboardView';
import { DepartmentsView } from './components/hospital/DepartmentsView';
import { DoctorsView } from './components/hospital/DoctorsView';
import { AppointmentsView } from './components/hospital/AppointmentsView';
import { PatientsView } from './components/hospital/PatientsView';
import { BillingView } from './components/hospital/BillingView';
import { ReportsView } from './components/hospital/ReportsView';
import { SettingsView } from './components/hospital/SettingsView';
import { PharmacyLayout } from './components/pharmacy/PharmacyLayout';

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
        <Route path="/" element={<LoginView />} />

        {/* Hospital Management Layout with Individual Route Paths */}
        <Route
          element={
            <ProtectedRoute>
              <HospitalLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<HospitalDashboardView />} />
          <Route path="/departments" element={<DepartmentsView />} />
          <Route path="/patients" element={<PatientsView />} />
          <Route path="/doctors" element={<DoctorsView />} />
          <Route path="/appointments" element={<AppointmentsView />} />
          <Route path="/billing" element={<BillingView />} />
          <Route path="/reports" element={<ReportsView />} />
          <Route path="/settings" element={<SettingsView />} />
        </Route>

        {/* Pharmacy Module */}
        <Route
          path="/pharmacy"
          element={
            <ProtectedRoute>
              <PharmacyLayout />
            </ProtectedRoute>
          }
        />

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
