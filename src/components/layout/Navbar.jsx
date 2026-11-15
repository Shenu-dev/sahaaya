import React, { useState } from 'react';
import { Heart, LogOut, Users, Pill, Calendar, Bell, Shield, UserCheck, RotateCcw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCareCircle } from '../../context/CareCircleContext';
import Badge from '../common/Badge';

export default function Navbar({ activeTab, onTabChange }) {
  const { profile, signOut, signInAsDemo } = useAuth();
  const { careCircle, notifications, isDemo, resetDemoData } = useCareCircle();
  const [resetFeedback, setResetFeedback] = useState('');

  const isElderly = profile?.role === 'elderly';
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleResetDemo = () => {
    resetDemoData();
    setResetFeedback('Reset Done!');
    setTimeout(() => setResetFeedback(''), 2200);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Logo & Care Circle Identifier */}
          <div className="flex items-center gap-3.5 shrink-0">
            <button
              onClick={() => onTabChange('dashboard')}
              className="flex items-center gap-3 text-left focus:outline-none focus-visible:ring-3 focus-visible:ring-teal-500/30 rounded-xl"
            >
              <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-sm shadow-teal-600/30">
                <Heart className="w-5 h-5 fill-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-extrabold tracking-tight text-slate-900 block leading-tight">Sahaaya</span>
                  {isDemo && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200" title="Interactive Demonstration Mode">
                      Demo
                    </span>
                  )}
                </div>
                <span className="text-xs font-semibold text-teal-700 truncate max-w-[130px] sm:max-w-[180px] block">
                  {careCircle?.name || 'Care Ecosystem'}
                </span>
              </div>
            </button>
          </div>

          {/* Center Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1.5 bg-slate-100/90 p-1.5 rounded-xl border border-slate-200/80">
            <button
              onClick={() => onTabChange('dashboard')}
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === 'dashboard'
                  ? 'bg-white text-teal-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isElderly ? "Today's Schedule" : 'Overview'}
            </button>
            <button
              onClick={() => onTabChange('medications')}
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'medications'
                  ? 'bg-white text-teal-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Pill className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
              <span>Medications</span>
            </button>
            <button
              onClick={() => onTabChange('appointments')}
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'appointments'
                  ? 'bg-white text-teal-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
              <span>Appointments</span>
            </button>
            <button
              onClick={() => onTabChange('circle')}
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'circle'
                  ? 'bg-white text-teal-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
              <span>Care Circle</span>
            </button>
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Persona Switcher Dropdown / Quick Switch for Judges */}
            <div className="hidden md:flex items-center gap-1.5 bg-slate-50 border border-slate-200/90 px-3 py-1.5 rounded-xl text-xs">
              <span className="font-semibold text-slate-500 mr-0.5">Persona:</span>
              <button
                onClick={() => signInAsDemo('elderly')}
                className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                  profile?.role === 'elderly'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-slate-200/70'
                }`}
                title="Switch to Elderly individual view"
              >
                Elderly
              </button>
              <button
                onClick={() => signInAsDemo('family')}
                className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                  profile?.role === 'family'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-slate-200/70'
                }`}
                title="Switch to Family member view"
              >
                Family
              </button>
              <button
                onClick={() => signInAsDemo('caregiver')}
                className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                  profile?.role === 'caregiver'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-slate-200/70'
                }`}
                title="Switch to Caregiver view"
              >
                Caregiver
              </button>

              {isDemo && (
                <button
                  type="button"
                  onClick={handleResetDemo}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-slate-600 hover:text-teal-800 hover:bg-slate-200/70 rounded-md font-semibold transition-all border-l border-slate-200 pl-2.5 ml-1"
                  title="Reset demo data to initial seed state"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${resetFeedback ? 'text-teal-600 animate-spin' : ''}`} />
                  <span>{resetFeedback || 'Reset'}</span>
                </button>
              )}
            </div>

            {/* Profile Pill */}
            <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
              <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                {profile?.full_name?.substring(0, 2) || 'ME'}
              </div>
              <div className="hidden xl:block text-left text-xs">
                <span className="font-bold text-slate-900 block truncate max-w-[110px]">
                  {profile?.full_name || 'Member'}
                </span>
                <span className="text-slate-500 capitalize">{profile?.role || 'User'}</span>
              </div>
            </div>

            {/* Sign Out */}
            <button
              onClick={signOut}
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-none"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="lg:hidden flex items-center justify-around py-2 border-t border-slate-100 text-xs font-semibold">
          <button
            onClick={() => onTabChange('dashboard')}
            className={`px-3 py-1.5 rounded-lg min-h-[36px] ${
              activeTab === 'dashboard' ? 'bg-teal-50 text-teal-800 font-bold' : 'text-slate-600'
            }`}
          >
            {isElderly ? 'Today' : 'Overview'}
          </button>
          <button
            onClick={() => onTabChange('medications')}
            className={`px-3 py-1.5 rounded-lg min-h-[36px] ${
              activeTab === 'medications' ? 'bg-teal-50 text-teal-800 font-bold' : 'text-slate-600'
            }`}
          >
            Meds
          </button>
          <button
            onClick={() => onTabChange('appointments')}
            className={`px-3 py-1.5 rounded-lg min-h-[36px] ${
              activeTab === 'appointments' ? 'bg-teal-50 text-teal-800 font-bold' : 'text-slate-600'
            }`}
          >
            Appointments
          </button>
          <button
            onClick={() => onTabChange('circle')}
            className={`px-3 py-1.5 rounded-lg min-h-[36px] ${
              activeTab === 'circle' ? 'bg-teal-50 text-teal-800 font-bold' : 'text-slate-600'
            }`}
          >
            Care Circle
          </button>
        </div>

        {/* Mobile Persona Quick Switcher */}
        <div className="sm:hidden flex items-center justify-between px-3 py-2 bg-teal-50/80 border-t border-teal-100 text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-teal-900">Persona:</span>
            {isDemo && (
              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-teal-100 text-teal-800">
                Demo
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => signInAsDemo('elderly')}
              className={`px-2 py-0.5 rounded font-bold ${
                profile?.role === 'elderly' ? 'bg-teal-700 text-white' : 'text-teal-800 bg-white border border-teal-200'
              }`}
            >
              Elderly
            </button>
            <button
              onClick={() => signInAsDemo('family')}
              className={`px-2 py-0.5 rounded font-bold ${
                profile?.role === 'family' ? 'bg-teal-700 text-white' : 'text-teal-800 bg-white border border-teal-200'
              }`}
            >
              Family
            </button>
            <button
              onClick={() => signInAsDemo('caregiver')}
              className={`px-2 py-0.5 rounded font-bold ${
                profile?.role === 'caregiver' ? 'bg-teal-700 text-white' : 'text-teal-800 bg-white border border-teal-200'
              }`}
            >
              Caregiver
            </button>
            {isDemo && (
              <button
                type="button"
                onClick={handleResetDemo}
                className="p-1 text-slate-600 hover:text-teal-800 font-bold ml-1 rounded hover:bg-teal-100/60"
                title="Reset Demo Data"
                aria-label="Reset Demo Data"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${resetFeedback ? 'text-teal-600 animate-spin' : ''}`} />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
