import React from 'react';
import { 
  Heart, 
  ShieldCheck, 
  Clock, 
  Users, 
  Calendar, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles,
  PhoneCall,
  Bell,
  Activity,
  Smile
} from 'lucide-react';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';

export default function LandingPage({ onNavigate, onDemoLogin }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-teal-500 selection:text-white">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-teal-600 flex items-center justify-center text-white shadow-md shadow-teal-600/20">
              <Heart className="w-6 h-6 fill-white" />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-slate-900">Saarthi</span>
              <span className="block text-xs font-semibold text-teal-600 tracking-wider uppercase">Care Ecosystem</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('login')}
              className="text-sm font-semibold text-slate-700 hover:text-teal-700 px-4 py-2 rounded-xl transition-colors"
            >
              Sign In
            </button>
            <Button
              variant="primary"
              size="md"
              onClick={() => onNavigate('register')}
              className="shadow-md shadow-teal-600/20"
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Mission & Hook */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs sm:text-sm font-semibold">
                <Sparkles className="w-4 h-4 text-teal-600" />
                <span>Empowering Elderly Healthcare Independence</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-950 tracking-tight leading-[1.15]">
                Dignity, simplicity, and <span className="text-teal-600 underline decoration-teal-300 decoration-wavy decoration-2">peace of mind</span> for the whole family.
              </h1>

              <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
                Saarthi connects elderly individuals with their children and caregivers through a calm, high-contrast interface. Never miss a vital medication dose, doctor visit, or care alert again.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => onNavigate('register')}
                  icon={ArrowRight}
                  className="w-full sm:w-auto shadow-lg shadow-teal-600/25"
                >
                  Create Your Free Care Circle
                </Button>
                <button
                  type="button"
                  onClick={() => onDemoLogin('elderly')}
                  className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-xl border border-slate-300 bg-white text-slate-800 font-semibold hover:bg-slate-50 transition-all shadow-sm"
                >
                  Explore Judge Demo (1-Click)
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 border-t border-slate-200/70 grid grid-cols-3 gap-4 text-left max-w-lg mx-auto lg:mx-0">
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-slate-900">100% Free</div>
                  <div className="text-xs text-slate-500 font-medium">₹0 cost to run</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-slate-900">WCAG AAA</div>
                  <div className="text-xs text-slate-500 font-medium">Accessible for seniors</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-slate-900">Strict RLS</div>
                  <div className="text-xs text-slate-500 font-medium">Secure patient data</div>
                </div>
              </div>
            </div>

            {/* Right Column: Dual Interface Preview Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200/90 ring-1 ring-slate-100">
                {/* Header Badge */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Elderly View • Live Preview</span>
                  </div>
                  <Badge variant="demo" size="sm">Demo Persona</Badge>
                </div>

                {/* Simulated Senior UI Card */}
                <div className="mt-5 space-y-4">
                  <div className="bg-teal-50/70 rounded-2xl p-4 border border-teal-100">
                    <span className="text-xs font-bold text-teal-800 uppercase tracking-wider">Today's Morning Medication</span>
                    <h3 className="text-2xl font-black text-slate-900 mt-1">Amlodipine 5mg</h3>
                    <p className="text-sm font-medium text-slate-600 mt-0.5">Take 1 tablet after breakfast with water</p>
                    <div className="mt-3 flex items-center justify-between text-xs text-slate-500 font-medium">
                      <span>Scheduled: 8:00 AM</span>
                      <span className="text-amber-700 font-bold bg-amber-100 px-2.5 py-0.5 rounded-full">Due Now</span>
                    </div>
                  </div>

                  {/* Big High-Contrast Touch Target Button */}
                  <div className="pt-1">
                    <button
                      type="button"
                      className="w-full touch-target-elderly bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xl rounded-2xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-3 transition-transform active:scale-95"
                    >
                      <CheckCircle2 className="w-7 h-7" />
                      <span>I HAVE TAKEN THIS</span>
                    </button>
                    <p className="text-center text-xs text-slate-500 mt-2 font-medium">
                      Large 56px touch target • Clear confirmation
                    </p>
                  </div>

                  {/* Connected Family & Caregiver Mini Bar */}
                  <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center text-xs font-bold">
                        RS
                      </div>
                      <div className="text-xs">
                        <span className="font-bold text-slate-900 block">Rohan Sharma (Son)</span>
                        <span className="text-slate-500">Care Circle Admin</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">
                      Connected
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillars */}
      <section className="py-16 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">Built for Real Life</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2">
              Three tailored experiences, one shared circle
            </h2>
            <p className="text-base text-slate-600 mt-3">
              Most health apps overwhelm seniors with small text and complicated charts. Saarthi gives each member the exact view they need.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Elderly Individual */}
            <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200/80 hover:border-teal-300 transition-all shadow-subtle hover:shadow-card">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-6">
                <Smile className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Elderly Independence</h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Large, high-contrast cards. Instant single-tap dose confirmation. Quick doctor visit reminders and emergency contacts at their fingertips.
              </p>
              <ul className="mt-4 space-y-2 text-xs font-semibold text-slate-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>56px+ touch target buttons</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Never auto-marks doses</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>One-tap emergency dialing</span>
                </li>
              </ul>
            </div>

            {/* Family Members */}
            <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200/80 hover:border-teal-300 transition-all shadow-subtle hover:shadow-card">
              <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center mb-6">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Family Peace of Mind</h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Stay confident even from miles away. Monitor daily adherence scores, get alerts for missed medications, and coordinate doctor visits.
              </p>
              <ul className="mt-4 space-y-2 text-xs font-semibold text-slate-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  <span>Adherence trend analysis</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  <span>Missed dose alerts in real-time</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  <span>Complete audit log of care updates</span>
                </li>
              </ul>
            </div>

            {/* Caregivers */}
            <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200/80 hover:border-teal-300 transition-all shadow-subtle hover:shadow-card">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mb-6">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Caregiver Precision</h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Assigned patient schedules, clinical instructions, and dose administration logging with custom notes for seamless handover between shifts.
              </p>
              <ul className="mt-4 space-y-2 text-xs font-semibold text-slate-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  <span>Structured dose administration</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  <span>Shift notes & observations</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  <span>Strict permission boundaries</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center text-white">
              <Heart className="w-5 h-5 fill-white" />
            </div>
            <span className="text-lg font-bold text-white">Saarthi</span>
          </div>
          <p className="text-xs text-slate-500 text-center sm:text-right">
            Empowering elderly healthcare management & family wellness.
          </p>
        </div>
      </footer>
    </div>
  );
}
