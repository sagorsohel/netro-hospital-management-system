import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppSelector } from './store/hooks';
import { LoginPage } from './pages/auth/LoginPage';
import { HospitalLayout } from './components/hospital/HospitalLayout';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { DepartmentPage } from './pages/department/DepartmentPage';
import { DoctorsPage } from './pages/doctors/DoctorsPage';
import { DoctorFormPage } from './pages/doctors/DoctorFormPage';
import { ExpensesPage } from './pages/expenses/ExpensesPage';
import { ExpenseFormPage } from './pages/expenses/ExpenseFormPage';

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
        {/* Login Page */}
        <Route path="/" element={<LoginPage />} />

        {/* Protected Hospital Management Layout */}
        <Route
          element={
            <ProtectedRoute>
              <HospitalLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/departments" element={<DepartmentPage />} />
          <Route path="/doctors" element={<DoctorsPage />} />
          <Route path="/doctors/new" element={<DoctorFormPage />} />
          <Route path="/doctors/edit/:id" element={<DoctorFormPage />} />
          <Route path="/expenses" element={<ExpensesPage />} />
          <Route path="/expenses/new" element={<ExpenseFormPage />} />
          <Route path="/expenses/edit/:id" element={<ExpenseFormPage />} />
        </Route>

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
