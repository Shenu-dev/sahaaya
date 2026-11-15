import React, { useState } from 'react';
import { Heart, Lock, Mail, User, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../lib/constants';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

export default function RegisterPage({ onNavigate }) {
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(ROLES.ELDERLY);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await signUp(email, password, fullName, role);
      if (res.error) {
        setError(res.error.message || 'Registration failed.');
      } else {
        setIsSuccess(true);
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F9] flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-bento-lime selection:text-slate-950 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <button
          onClick={() => onNavigate('landing')}
          className="inline-flex items-center gap-3 focus:outline-none group mb-4"
        >
          <div className="w-11 h-11 rounded-full bg-slate-900 flex items-center justify-center text-white shadow-sm">
            <Heart className="w-5 h-5 fill-bento-lime text-bento-lime" />
          </div>
          <span className="text-3xl font-black tracking-tight text-slate-950 font-sans">Sahaaya</span>
        </button>
        <h2 className="text-2xl font-black text-slate-950 tracking-tight">Create your Care Circle</h2>
        <p className="mt-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Free, secure healthcare management for the entire family
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-card rounded-[32px] sm:rounded-[36px] border border-slate-200/90 sm:px-10 space-y-6">
          {error && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700">
              {error}
            </div>
          )}

          {isSuccess ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 bg-bento-mint text-emerald-900 rounded-full flex items-center justify-center mx-auto border border-bento-mint-border">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-slate-950">Account Created!</h3>
              <p className="text-xs font-semibold text-slate-600">
                Your account is ready. Proceed to sign in to access your dashboard.
              </p>
              <Button
                variant="electric"
                size="md"
                className="w-full text-xs font-bold uppercase tracking-wider"
                onClick={() => onNavigate('login')}
              >
                Go to Sign In
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Aarav Gupta"
                required
              />

              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. aarav@example.com"
                required
              />

              <Input
                label="Password (min 6 characters)"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
              />

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                  I am registering as:
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setRole(ROLES.ELDERLY)}
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      role === ROLES.ELDERLY
                        ? 'border-bento-lavender-border bg-bento-lavender text-slate-950 font-black shadow-xs'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-lg block mb-0.5">👵</span>
                    <span className="text-xs font-bold">Elderly</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole(ROLES.FAMILY)}
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      role === ROLES.FAMILY
                        ? 'border-bento-peach-border bg-bento-peach text-slate-950 font-black shadow-xs'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-lg block mb-0.5">👨‍👦</span>
                    <span className="text-xs font-bold">Family</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole(ROLES.CAREGIVER)}
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      role === ROLES.CAREGIVER
                        ? 'border-bento-mint-border bg-bento-mint text-slate-950 font-black shadow-xs'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-lg block mb-0.5">👩‍⚕️</span>
                    <span className="text-xs font-bold">Caregiver</span>
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                variant="electric"
                size="md"
                className="w-full mt-4 text-xs font-bold uppercase tracking-wider shadow-sm"
                isLoading={isLoading}
              >
                Create Account
              </Button>
            </form>
          )}

          <div className="text-center pt-2">
            <p className="text-xs text-slate-600">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => onNavigate('login')}
                className="font-bold text-slate-950 hover:underline"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
