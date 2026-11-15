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
  
  const [authPage, setAuthPage] = useState(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      if (path === '/login') return 'login';
      if (path === '/register') return 'register';
    }
    return 'landing';
  });

  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '').toLowerCase();
      if (['medications', 'appointments', 'circle'].includes(hash)) {
        return hash;
      }
    }
    return 'dashboard';
  });

  const handleNavigateAuth = (page) => {
    setAuthPage(page);
    if (typeof window !== 'undefined') {
      const newPath = page === 'landing' ? '/' : `/${page}`;
      if (window.location.pathname !== newPath) {
        window.history.pushState({}, '', newPath);
      }
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      const newHash = tab === 'dashboard' ? '' : `#${tab}`;
      if (window.location.hash !== newHash) {
        window.history.replaceState(null, '', window.location.pathname + newHash);
      }
    }
  };

  React.useEffect(() => {
    const handlePopState = () => {
      if (typeof window !== 'undefined') {
        const path = window.location.pathname.toLowerCase();
        if (path === '/login') setAuthPage('login');
        else if (path === '/register') setAuthPage('register');
        else setAuthPage('landing');

        const hash = window.location.hash.replace('#', '').toLowerCase();
        if (['medications', 'appointments', 'circle'].includes(hash)) {
          setActiveTab(hash);
        } else {
          setActiveTab('dashboard');
        }
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);
  
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
      return <LoginPage onNavigate={handleNavigateAuth} />;
    }
    if (authPage === 'register') {
      return <RegisterPage onNavigate={handleNavigateAuth} />;
    }
    return (
      <LandingPage
        onNavigate={handleNavigateAuth}
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
    return <FamilyDashboard onNavigateTab={handleTabChange} />;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-teal-500 selection:text-white">
      <Navbar activeTab={activeTab} onTabChange={handleTabChange} />
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
