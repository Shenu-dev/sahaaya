import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CareCircleProvider, useCareCircle } from './context/CareCircleContext';
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
import AcceptInvitationModal from './components/common/AcceptInvitationModal';
import NoCareCircleView from './components/common/NoCareCircleView';

function MainApp() {
  const { user, profile, loading, signInAsDemo } = useAuth();
  const { hasCareCircle, circleLoading, isDemo, activeViewRole } = useCareCircle();
  const [authPage, setAuthPage] = useState('landing'); // 'landing' | 'login' | 'register'
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'medications' | 'appointments' | 'circle'
  
  // Detect invitation token in URL (FUNC-HIGH-03)
  const [inviteToken, setInviteToken] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('token');
    }
    return null;
  });
  const [showInviteModal, setShowInviteModal] = useState(Boolean(inviteToken));

  if (loading || circleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <LoadingSpinner label="Securing connection to Sahaaya..." size="lg" />
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
    // If authenticated real user has no care circle yet, isolate them completely from demo data
    if (!isDemo && !hasCareCircle) {
      return <NoCareCircleView />;
    }

    if (activeTab === 'medications') {
      return <MedicationsPage />;
    }
    if (activeTab === 'appointments') {
      return <AppointmentsPage />;
    }
    if (activeTab === 'circle') {
      return <CareCirclePage />;
    }

    // Effective dashboard view: allows real users to view their own Care Circle from Senior, Family, or Caregiver perspective
    const effectiveRole = isDemo ? profile?.role : (activeViewRole || profile?.role || 'family');

    if (effectiveRole === 'elderly') {
      return <ElderlyDashboard />;
    }
    if (effectiveRole === 'caregiver') {
      return <CaregiverDashboard />;
    }
    // Default to Family Dashboard
    return <FamilyDashboard onNavigateTab={setActiveTab} />;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-teal-500 selection:text-white">
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 pb-16">{renderContent()}</main>

      {/* Cryptographic Care Circle Invitation Acceptance Modal (FUNC-HIGH-03) */}
      {inviteToken && (
        <AcceptInvitationModal
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          token={inviteToken}
        />
      )}
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
