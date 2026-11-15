import React, { useState } from 'react';
import LandingPage from './pages/LandingPage';

export default function App() {
  const [currentPage, setCurrentPage] = useState('landing');

  const handleNavigate = (page) => {
    setCurrentPage(page);
  };

  const handleDemoLogin = (role) => {
    // In Phase 1, guide the user to the auth view or show setup
    alert(`Starting demo session for ${role} role. Supabase authentication integration follows in Phase 2 & 3.`);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {currentPage === 'landing' && (
        <LandingPage
          onNavigate={handleNavigate}
          onDemoLogin={handleDemoLogin}
        />
      )}
      {currentPage !== 'landing' && (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-white p-8 rounded-3xl shadow-elevated max-w-md w-full border border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">View: {currentPage}</h2>
            <p className="text-sm text-slate-600 mb-6">
              This route will be activated with Supabase Authentication in Phase 3.
            </p>
            <button
              onClick={() => setCurrentPage('landing')}
              className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl transition-colors"
            >
              Back to Landing Page
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
