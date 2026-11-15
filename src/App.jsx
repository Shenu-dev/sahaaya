import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CareCircleProvider } from './context/CareCircleContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ElderlyDashboard from './pages/ElderlyDashboard';
import FamilyDashboard from './pages/FamilyDashboard';
import CaregiverDashboard from './pages/CaregiverDashboard';
import MedicationsPage from './pages/MedicationsPage';
import AppointmentsPage from './pages/AppointmentsPage';
import CareCirclePage from './pages/CareCirclePage';
import Navbar from './components/layout/Navbar';
import LoadingSpinner from './components/common/LoadingSpinner';

function MainApp() {
  const { user, profile, loading, signInAsDemo } = useAuth();
  const [authPage, setAuthPage] = useState('landing'); // 'landing' | 'login' | 'register'
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'medications' | 'appointments' | 'circle'

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <LoadingSpinner label="Securing connection to Saarthi..." size="lg" />
      </div>
    );
  }

  // Unauthenticated Flows
  if (!user) {
    if (authPage === 'login') {
      return <LoginPage onNavigate={setAuthPage} />;
    }
    if (authPage === 'register') {
      return <RegisterPage onNavigate={setAuthPage} />;
    }
    return (
      <LandingPage
        onNavigate={setAuthPage}
        onDemoLogin={(role) => signInAsDemo(role)}
      />
    );
  }

  // Authenticated Dashboard Layout
  const renderContent = () => {
    if (activeTab === 'medications') {
      return <MedicationsPage />;
    }
    if (activeTab === 'appointments') {
      return <AppointmentsPage />;
    }
    if (activeTab === 'circle') {
      return <CareCirclePage />;
    }

    // Default Dashboard depending on user role
    if (profile?.role === 'elderly') {
      return <ElderlyDashboard />;
    }
    if (profile?.role === 'caregiver') {
      return <CaregiverDashboard />;
    }
    // Default to Family Dashboard
    return <FamilyDashboard onNavigateTab={setActiveTab} />;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-teal-500 selection:text-white">
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 pb-16">{renderContent()}</main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CareCircleProvider>
        <MainApp />
      </CareCircleProvider>
    </AuthProvider>
  );
}
