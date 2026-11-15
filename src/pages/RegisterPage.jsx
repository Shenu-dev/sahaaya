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
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-teal-500 selection:text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <button
          onClick={() => onNavigate('landing')}
          className="inline-flex items-center gap-3 focus:outline-none group mb-4"
        >
          <div className="w-11 h-11 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-md shadow-teal-600/20 group-hover:bg-teal-700 transition-colors">
            <Heart className="w-6 h-6 fill-white" />
          </div>
          <span className="text-3xl font-black tracking-tight text-slate-900">Saarthi</span>
        </button>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Create your Care Circle</h2>
        <p className="mt-1 text-sm text-slate-500">
          Free, secure healthcare management for the entire family
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-card rounded-2xl sm:rounded-3xl border border-slate-200/90 sm:px-10 space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700">
              {error}
            </div>
          )}

          {isSuccess ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Account Created!</h3>
              <p className="text-sm text-slate-600">
                Your account is ready. Proceed to sign in to access your dashboard.
              </p>
              <Button
                variant="primary"
                size="md"
                className="w-full"
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
                placeholder="e.g. Kamla Sharma"
                required
              />

              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. kamla@example.com"
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
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  I am registering as:
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole(ROLES.ELDERLY)}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      role === ROLES.ELDERLY
                        ? 'border-teal-600 bg-teal-50 text-teal-800 font-bold shadow-sm'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-xl block mb-1">👵</span>
                    <span className="text-xs">Elderly</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole(ROLES.FAMILY)}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      role === ROLES.FAMILY
                        ? 'border-teal-600 bg-teal-50 text-teal-800 font-bold shadow-sm'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-xl block mb-1">👨‍👦</span>
                    <span className="text-xs">Family</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole(ROLES.CAREGIVER)}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      role === ROLES.CAREGIVER
                        ? 'border-teal-600 bg-teal-50 text-teal-800 font-bold shadow-sm'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-xl block mb-1">👩‍⚕️</span>
                    <span className="text-xs">Caregiver</span>
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full mt-2 shadow-md shadow-teal-600/20"
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
                className="font-bold text-teal-700 hover:text-teal-900 underline"
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
