import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppSelector } from './store/hooks';
import { LoginView } from './components/LoginView';
import { HospitalLayout } from './components/hospital/HospitalLayout';

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

        {/* /dashboard route: Protected Hospital Management Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <HospitalLayout />
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
