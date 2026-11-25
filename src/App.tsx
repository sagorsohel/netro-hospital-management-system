import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from './store/hooks';
import { LoginPage } from './pages/auth/LoginPage';
import { HospitalLayout } from './components/hospital/HospitalLayout';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { DepartmentPage } from './pages/department/DepartmentPage';
import { DoctorsPage } from './pages/doctors/DoctorsPage';
import { DoctorFormPage } from './pages/doctors/DoctorFormPage';
import { ExpensesPage } from './pages/expenses/ExpensesPage';
import { ExpenseFormPage } from './pages/expenses/ExpenseFormPage';
import { StaffPage } from './pages/staff/StaffPage';
import { EquipmentPage } from './pages/equipment/EquipmentPage';
import { SettingsPage } from './pages/settings/SettingsPage';
import { PatientsPage } from './pages/patients/PatientsPage';
import { PatientProfilePage } from './pages/patients/PatientProfilePage';
import { AdmissionsPage } from './pages/admissions/AdmissionsPage';
import { NewAdmissionPOSPage } from './pages/admissions/NewAdmissionPOSPage';
import { TestPOSPage } from './pages/tests/TestPOSPage';
import { DiagnosticInvoicesPage } from './pages/tests/DiagnosticInvoicesPage';
import { LabWorkstationPage } from './pages/tests/LabWorkstationPage';
import { DoctorSerialsPage } from './pages/serials/DoctorSerialsPage';
import { ShareholdersPage } from './pages/shareholders/ShareholdersPage';
import { ShareholderFormPage } from './pages/shareholders/ShareholderFormPage';
import { SharePlansPage } from './pages/shareholders/SharePlansPage';
import { MySharesPage } from './pages/shareholders/MySharesPage';
import { homePathForRole, isPathAllowedForRole } from './lib/roleAccess';
import { PharmaciesPage } from './pages/pharmacies/PharmaciesPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const role = useAppSelector((state) => state.auth.user?.role);
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  // Restricted roles (e.g. shareholder) are sent back to their allowed pages
  if (!isPathAllowedForRole(role, location.pathname)) {
    return <Navigate to={homePathForRole(role)} replace />;
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
          <Route path="/patients" element={<PatientsPage />} />
          <Route path="/patients/:id" element={<PatientProfilePage />} />
          <Route path="/serials" element={<DoctorSerialsPage />} />
          <Route path="/admissions" element={<AdmissionsPage />} />
          <Route path="/admissions/new" element={<NewAdmissionPOSPage />} />
          <Route path="/tests/pos" element={<TestPOSPage />} />
          <Route path="/tests/lab-workstation" element={<LabWorkstationPage />} />
          <Route path="/tests/invoices" element={<DiagnosticInvoicesPage />} />
          <Route path="/shareholders" element={<ShareholdersPage />} />
          <Route path="/shareholders/plans" element={<SharePlansPage />} />
          <Route path="/my-shares" element={<MySharesPage />} />
          <Route path="/shareholders/new" element={<ShareholderFormPage />} />
          <Route path="/shareholders/edit/:id" element={<ShareholderFormPage />} />
          <Route path="/pharmacies" element={<PharmaciesPage />} />
          <Route path="/departments" element={<DepartmentPage />} />
          <Route path="/doctors" element={<DoctorsPage />} />
          <Route path="/doctors/new" element={<DoctorFormPage />} />
          <Route path="/doctors/edit/:id" element={<DoctorFormPage />} />
          <Route path="/expenses" element={<ExpensesPage />} />
          <Route path="/expenses/new" element={<ExpenseFormPage />} />
          <Route path="/expenses/edit/:id" element={<ExpenseFormPage />} />
          <Route path="/staff" element={<StaffPage />} />
          <Route path="/equipment" element={<EquipmentPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
