import React from 'react';
import { useAppSelector } from './store/hooks';
import { LoginView } from './components/LoginView';
import { ModuleSelector } from './components/ModuleSelector';
import { HospitalLayout } from './components/hospital/HospitalLayout';
import { PharmacyLayout } from './components/pharmacy/PharmacyLayout';

export const App: React.FC = () => {
  const { isAuthenticated, activeModule } = useAppSelector((state) => state.auth);

  // 1. If not authenticated, always show the login portal
  if (!isAuthenticated) {
    return <LoginView />;
  }

  // 2. If logged in but hasn't picked a workspace (or chose to switch), show Module Selection Gateway
  if (activeModule === 'selection' || !activeModule) {
    return <ModuleSelector />;
  }

  // 3. Core Hospital Management Workspace
  if (activeModule === 'hospital') {
    return <HospitalLayout />;
  }

  // 4. Pharmacy Management & POS Workspace
  if (activeModule === 'pharmacy') {
    return <PharmacyLayout />;
  }

  return <ModuleSelector />;
};

export default App;
