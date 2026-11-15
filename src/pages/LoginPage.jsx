import React, { useState } from 'react';
import { Heart, Lock, Mail, ArrowRight, ShieldCheck, Sparkles, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { DEMO_ACCOUNTS } from '../lib/constants';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Badge from '../components/common/Badge';

export default function LoginPage({ onNavigate }) {
  const { signIn, signInAsDemo } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await signIn(email, password);
      if (res.error) {
        setError(res.error.message || 'Invalid email or password.');
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred during login.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoClick = async (roleKey) => {
    setError('');
    setIsLoading(true);
    try {
      await signInAsDemo(roleKey);
    } catch (err) {
      setError('Could not initialize demo account: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-teal-500 selection:text-white">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <button
          onClick={() => onNavigate('landing')}
          className="inline-flex items-center gap-3 focus:outline-none group mb-4"
        >
          <div className="w-11 h-11 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-md shadow-teal-600/20 group-hover:bg-teal-700 transition-colors">
            <Heart className="w-6 h-6 fill-white" />
          </div>
          <span className="text-3xl font-black tracking-tight text-slate-900">Sahaaya</span>
        </button>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Sign in to your Care Ecosystem</h2>
        <p className="mt-1 text-sm text-slate-500">
          Connecting elderly individuals, family, and caregivers
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-card rounded-2xl sm:rounded-3xl border border-slate-200/90 sm:px-10 space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. name@example.com"
              required
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full mt-2 shadow-md shadow-teal-600/20"
              isLoading={isLoading}
            >
              Sign In
            </Button>
          </form>

          {/* Quick Demo Login Box for Judges */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Judge 1-Click Demo Logins
              </span>
            </div>

            <div className="grid gap-2.5">
              <button
                type="button"
                onClick={() => handleDemoClick('elderly')}
                className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-teal-50/70 hover:border-teal-300 transition-all text-left group"
              >
                <div>
                  <span className="text-xs font-bold text-slate-900 block group-hover:text-teal-900">
                    👵 Kamla Sharma (Elderly Individual)
                  </span>
                  <span className="text-xs text-slate-500">Accessible high-contrast 1-tap view</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition-transform group-hover:translate-x-0.5" />
              </button>

              <button
                type="button"
                onClick={() => handleDemoClick('family')}
                className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-teal-50/70 hover:border-teal-300 transition-all text-left group"
              >
                <div>
                  <span className="text-xs font-bold text-slate-900 block group-hover:text-teal-900">
                    👨‍👦 Rohan Sharma (Family Admin)
                  </span>
                  <span className="text-xs text-slate-500">Adherence charts, alerts & appointments</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition-transform group-hover:translate-x-0.5" />
              </button>

              <button
                type="button"
                onClick={() => handleDemoClick('caregiver')}
                className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-teal-50/70 hover:border-teal-300 transition-all text-left group"
              >
                <div>
                  <span className="text-xs font-bold text-slate-900 block group-hover:text-teal-900">
                    👩‍⚕️ Nurse Priya Rao (Caregiver)
                  </span>
                  <span className="text-xs text-slate-500">Dose administration & shift notes</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>

          <div className="text-center pt-2">
            <p className="text-xs text-slate-600">
              New to Sahaaya?{' '}
              <button
                type="button"
                onClick={() => onNavigate('register')}
                className="font-bold text-teal-700 hover:text-teal-900 underline"
              >
                Create your Care Circle
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
