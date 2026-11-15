import React, { useState } from 'react';
import { Heart, LogOut, Users, Pill, Calendar, Bell, Shield, UserCheck, RotateCcw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCareCircle } from '../../context/CareCircleContext';
import Badge from '../common/Badge';

export default function Navbar({ activeTab, onTabChange }) {
  const { profile, signOut, signInAsDemo } = useAuth();
  const { 
    careCircle, 
    notifications, 
    isDemo, 
    resetDemoData, 
    hasCareCircle,
    activeViewRole,
    setActiveViewRole 
  } = useCareCircle();
  const [resetFeedback, setResetFeedback] = useState('');

  // Active role displayed: in demo mode tracks demo persona; in real account tracks perspective within user's circle
  const currentRole = isDemo ? profile?.role : (activeViewRole || profile?.role || 'family');
  const isElderly = currentRole === 'elderly';
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleRoleSwitch = (roleKey) => {
    if (isDemo) {
      signInAsDemo(roleKey);
    } else {
      setActiveViewRole(roleKey);
    }
  };

  const handleResetDemo = () => {
    resetDemoData();
    setResetFeedback('Reset Done!');
    setTimeout(() => setResetFeedback(''), 2200);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#F5F5F9]/95 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2">
        <div className="bg-white/90 rounded-2xl sm:rounded-full border border-slate-200/80 shadow-subtle px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
          {/* Logo & Care Circle Identifier */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onTabChange('dashboard')}
              className="flex items-center gap-3 text-left focus:outline-none focus-visible:ring-3 focus-visible:ring-bento-lime/60 rounded-full"
            >
              <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white shadow-sm">
                <Heart className="w-5 h-5 fill-bento-lime text-bento-lime" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-extrabold tracking-tight text-slate-900 block leading-tight font-sans">Sahaaya</span>
                  {isDemo ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-bento-lime text-slate-950 border border-lime-400" title="Interactive Demonstration Mode">
                      Demo
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-bento-mint text-emerald-900 border border-bento-mint-border">
                      Live
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 truncate max-w-[130px] sm:max-w-[180px] block">
                  {careCircle?.name || 'CareCircle Ecosystem'}
                </span>
              </div>
            </button>
          </div>

          {/* Center Navigation Links (Only shown when Care Circle is active) */}
          {hasCareCircle && (
            <nav className="hidden xl:flex items-center gap-1 bg-slate-100/90 p-1 rounded-full border border-slate-200/80">
              <button
                onClick={() => onTabChange('dashboard')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === 'dashboard'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {isElderly ? "Schedule" : 'Overview'}
              </button>
              <button
                onClick={() => onTabChange('medications')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === 'medications'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Medications
              </button>
              <button
                onClick={() => onTabChange('appointments')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === 'appointments'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Appointments
              </button>
              <button
                onClick={() => onTabChange('circle')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === 'circle'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Care Circle
              </button>
            </nav>
          )}

          {/* Right Action Bar */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Persona Switcher for Demo / Perspective Switcher for Real Accounts */}
            {(isDemo || hasCareCircle) && (
              <div className="hidden md:flex items-center gap-2 shrink-0">
                <span className="font-extrabold text-[10px] uppercase tracking-wider text-slate-400 select-none hidden 2xl:inline-block pr-0.5">
                  {isDemo ? 'Persona:' : 'View:'}
                </span>
                
                {/* Segmented Persona Capsule */}
                <div className="flex items-center bg-slate-100/90 p-1 rounded-full border border-slate-200/80 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => handleRoleSwitch('elderly')}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                      currentRole === 'elderly'
                        ? 'bg-bento-lavender text-slate-950 border border-bento-lavender-border shadow-xs'
                        : 'text-slate-600 hover:text-slate-950'
                    }`}
                    title={isDemo ? "Switch to Elderly demo persona" : "View your Care Circle from Senior's perspective"}
                  >
                    Elderly
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRoleSwitch('family')}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                      currentRole === 'family'
                        ? 'bg-bento-peach text-slate-950 border border-bento-peach-border shadow-xs'
                        : 'text-slate-600 hover:text-slate-950'
                    }`}
                    title={isDemo ? "Switch to Family Admin demo persona" : "View your Care Circle from Family overview perspective"}
                  >
                    Family
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRoleSwitch('caregiver')}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                      currentRole === 'caregiver'
                        ? 'bg-bento-mint text-slate-950 border border-bento-mint-border shadow-xs'
                        : 'text-slate-600 hover:text-slate-950'
                    }`}
                    title={isDemo ? "Switch to Caregiver demo persona" : "View your Care Circle from Caregiver shift perspective"}
                  >
                    Caregiver
                  </button>
                </div>

                {/* Reset Demo Button - Standalone Pill */}
                {isDemo && (
                  <button
                    type="button"
                    onClick={handleResetDemo}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-slate-700 hover:text-slate-950 bg-white hover:bg-slate-50 rounded-full font-bold text-xs whitespace-nowrap transition-all border border-slate-200/90 shadow-2xs active:scale-95 shrink-0"
                    title="Reset demo data to initial seed state"
                  >
                    <RotateCcw className={`w-3.5 h-3.5 shrink-0 ${resetFeedback ? 'text-indigo-600 animate-spin' : ''}`} />
                    <span>{resetFeedback || 'Reset'}</span>
                  </button>
                )}
              </div>
            )}

            {/* Profile Pill */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200/80">
              <div 
                className="w-8 h-8 rounded-full bg-slate-100 border border-slate-300 text-slate-900 flex items-center justify-center font-bold text-xs uppercase shrink-0"
                title={`${profile?.full_name || 'Member'} (${profile?.role || 'User'})`}
              >
                {profile?.full_name?.substring(0, 2) || 'ME'}
              </div>
              <div className="hidden 2xl:block text-left text-xs leading-tight">
                <span className="font-bold text-slate-900 block truncate max-w-[100px]">
                  {profile?.full_name || 'Member'}
                </span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">{profile?.role || 'User'}</span>
              </div>
            </div>

            {/* Sign Out */}
            <button
              onClick={signOut}
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-none"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>

        {/* Mobile / Tablet Sub-Navigation Bar (Only shown when Care Circle is active and top center nav is hidden) */}
        {hasCareCircle && (
          <div className="xl:hidden flex items-center justify-around py-2 px-1 text-xs font-bold uppercase tracking-wider">
            <button
              onClick={() => onTabChange('dashboard')}
              className={`px-3 py-1.5 rounded-full min-h-[36px] transition-all ${
                activeTab === 'dashboard' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isElderly ? 'Schedule' : 'Overview'}
            </button>
            <button
              onClick={() => onTabChange('medications')}
              className={`px-3 py-1.5 rounded-full min-h-[36px] transition-all ${
                activeTab === 'medications' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Meds
            </button>
            <button
              onClick={() => onTabChange('appointments')}
              className={`px-3 py-1.5 rounded-full min-h-[36px] transition-all ${
                activeTab === 'appointments' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Visits
            </button>
            <button
              onClick={() => onTabChange('circle')}
              className={`px-3 py-1.5 rounded-full min-h-[36px] transition-all ${
                activeTab === 'circle' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Circle
            </button>
          </div>
        )}

        {/* Mobile Persona / View Switcher */}
        {(isDemo || hasCareCircle) && (
          <div className="md:hidden flex items-center justify-between px-3 py-2 bg-slate-100/90 rounded-2xl my-1 border border-slate-200/80 text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold uppercase tracking-wider text-[10px] text-slate-500">{isDemo ? 'Persona:' : 'View:'}</span>
              {isDemo && (
                <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-bento-lime text-slate-950 border border-lime-400">
                  Demo
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleRoleSwitch('elderly')}
                className={`px-2.5 py-1 rounded-full font-bold ${
                  currentRole === 'elderly' ? 'bg-bento-lavender text-slate-950 border border-bento-lavender-border shadow-2xs' : 'text-slate-600 bg-white/70'
                }`}
              >
                Elderly
              </button>
              <button
                type="button"
                onClick={() => handleRoleSwitch('family')}
                className={`px-2.5 py-1 rounded-full font-bold ${
                  currentRole === 'family' ? 'bg-bento-peach text-slate-950 border border-bento-peach-border shadow-2xs' : 'text-slate-600 bg-white/70'
                }`}
              >
                Family
              </button>
              <button
                type="button"
                onClick={() => handleRoleSwitch('caregiver')}
                className={`px-2.5 py-1 rounded-full font-bold ${
                  currentRole === 'caregiver' ? 'bg-bento-mint text-slate-950 border border-bento-mint-border shadow-2xs' : 'text-slate-600 bg-white/70'
                }`}
              >
                Caregiver
              </button>
              {isDemo && (
                <button
                  type="button"
                  onClick={handleResetDemo}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-slate-700 hover:text-slate-950 font-bold ml-1 rounded-full bg-white border border-slate-200 shadow-2xs text-[10px]"
                  title="Reset Demo Data"
                  aria-label="Reset Demo Data"
                >
                  <RotateCcw className={`w-3 h-3 ${resetFeedback ? 'text-indigo-600 animate-spin' : ''}`} />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
