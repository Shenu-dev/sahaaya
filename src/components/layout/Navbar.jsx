import React from 'react';
import { Heart, LogOut, Users, Pill, Calendar, Bell, Shield, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCareCircle } from '../../context/CareCircleContext';
import Badge from '../common/Badge';

export default function Navbar({ activeTab, onTabChange }) {
  const { profile, signOut, signInAsDemo } = useAuth();
  const { careCircle, notifications } = useCareCircle();

  const isElderly = profile?.role === 'elderly';
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/90 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Care Circle Identifier */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => onTabChange('dashboard')}
              className="flex items-center gap-3 text-left focus:outline-none"
            >
              <div className="w-11 h-11 rounded-2xl bg-teal-600 flex items-center justify-center text-white shadow-md shadow-teal-600/20">
                <Heart className="w-6 h-6 fill-white" />
              </div>
              <div>
                <span className="text-xl font-black tracking-tight text-slate-900 block leading-tight">Saarthi</span>
                <span className="text-xs font-semibold text-teal-700 truncate max-w-[150px] sm:max-w-xs block">
                  {careCircle?.name || 'Care Ecosystem'}
                </span>
              </div>
            </button>

            {careCircle?.is_demo && (
              <Badge variant="demo" size="sm" className="hidden md:inline-flex">
                Judge Demo Environment
              </Badge>
            )}
          </div>

          {/* Center Navigation Links (Adjusted for Elderly vs Standard) */}
          <nav className="hidden lg:flex items-center gap-1.5 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/60">
            <button
              onClick={() => onTabChange('dashboard')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-white text-teal-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isElderly ? "Today's Schedule" : 'Overview'}
            </button>
            <button
              onClick={() => onTabChange('medications')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'medications'
                  ? 'bg-white text-teal-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Pill className="w-4 h-4" />
              <span>Medications</span>
            </button>
            <button
              onClick={() => onTabChange('appointments')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'appointments'
                  ? 'bg-white text-teal-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Appointments</span>
            </button>
            <button
              onClick={() => onTabChange('circle')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'circle'
                  ? 'bg-white text-teal-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Care Circle</span>
            </button>
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Persona Switcher Dropdown / Quick Switch for Judges */}
            <div className="hidden sm:flex items-center gap-1.5 bg-teal-50/80 border border-teal-200/80 px-2.5 py-1 rounded-xl text-xs">
              <span className="font-semibold text-teal-800">Demo Persona:</span>
              <button
                onClick={() => signInAsDemo('elderly')}
                className={`px-2 py-0.5 rounded font-bold transition-all ${
                  profile?.role === 'elderly' ? 'bg-teal-700 text-white shadow-xs' : 'text-teal-700 hover:bg-teal-100'
                }`}
                title="Switch to Elderly individual view"
              >
                Elderly
              </button>
              <button
                onClick={() => signInAsDemo('family')}
                className={`px-2 py-0.5 rounded font-bold transition-all ${
                  profile?.role === 'family' ? 'bg-teal-700 text-white shadow-xs' : 'text-teal-700 hover:bg-teal-100'
                }`}
                title="Switch to Family member view"
              >
                Family
              </button>
              <button
                onClick={() => signInAsDemo('caregiver')}
                className={`px-2 py-0.5 rounded font-bold transition-all ${
                  profile?.role === 'caregiver' ? 'bg-teal-700 text-white shadow-xs' : 'text-teal-700 hover:bg-teal-100'
                }`}
                title="Switch to Caregiver view"
              >
                Caregiver
              </button>
            </div>

            {/* Profile Pill */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
              <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-xs uppercase">
                {profile?.full_name?.substring(0, 2) || 'ME'}
              </div>
              <div className="hidden xl:block text-left text-xs">
                <span className="font-bold text-slate-900 block truncate max-w-[120px]">
                  {profile?.full_name || 'Member'}
                </span>
                <span className="text-slate-500 capitalize">{profile?.role || 'User'}</span>
              </div>
            </div>

            {/* Sign Out */}
            <button
              onClick={signOut}
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="lg:hidden flex items-center justify-around py-2.5 border-t border-slate-100 text-xs font-semibold">
          <button
            onClick={() => onTabChange('dashboard')}
            className={`px-3 py-1.5 rounded-lg ${
              activeTab === 'dashboard' ? 'bg-teal-50 text-teal-800 font-bold' : 'text-slate-600'
            }`}
          >
            {isElderly ? 'Today' : 'Overview'}
          </button>
          <button
            onClick={() => onTabChange('medications')}
            className={`px-3 py-1.5 rounded-lg ${
              activeTab === 'medications' ? 'bg-teal-50 text-teal-800 font-bold' : 'text-slate-600'
            }`}
          >
            Meds
          </button>
          <button
            onClick={() => onTabChange('appointments')}
            className={`px-3 py-1.5 rounded-lg ${
              activeTab === 'appointments' ? 'bg-teal-50 text-teal-800 font-bold' : 'text-slate-600'
            }`}
          >
            Appointments
          </button>
          <button
            onClick={() => onTabChange('circle')}
            className={`px-3 py-1.5 rounded-lg ${
              activeTab === 'circle' ? 'bg-teal-50 text-teal-800 font-bold' : 'text-slate-600'
            }`}
          >
            Care Circle
          </button>
        </div>
      </div>
    </header>
  );
}
