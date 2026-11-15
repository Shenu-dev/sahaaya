import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { DEMO_ACCOUNTS, ROLES } from '../lib/constants';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(!isSupabaseConfigured);

  // Fetch public.profiles record for authenticated user
  const fetchProfile = async (userId) => {
    if (!supabase || !userId) return null;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error.message);
      }
      return data || null;
    } catch (err) {
      console.error('Exception fetching profile:', err);
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      if (!isSupabaseConfigured || !supabase) {
        setLoading(false);
        setIsDemoMode(true);
        return;
      }

      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        if (!mounted) return;

        setSession(initialSession);
        setUser(initialSession?.user || null);

        if (initialSession?.user) {
          const userProfile = await fetchProfile(initialSession.user.id);
          if (mounted) {
            setProfile(userProfile);
            setIsDemoMode(Boolean(initialSession.user.email?.includes('.demo')));
          }
        }
      } catch (err) {
        console.warn('Supabase auth session initialization notice:', err);
      } finally {
        if (mounted) setLoading(false);
      }

      // Listen to auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, newSession) => {
          if (!mounted) return;
          setSession(newSession);
          setUser(newSession?.user || null);

          if (newSession?.user) {
            const userProfile = await fetchProfile(newSession.user.id);
            if (mounted) {
              setProfile(userProfile);
              setIsDemoMode(Boolean(newSession.user.email?.includes('.demo')));
            }
          } else {
            if (mounted) {
              setProfile(null);
              setIsDemoMode(false);
            }
          }
          setLoading(false);
        }
      );

      return () => {
        mounted = false;
        subscription?.unsubscribe();
      };
    }

    initAuth();
  }, []);

  // Standard Login
  const signIn = async (email, password) => {
    if (!isSupabaseConfigured || !supabase) {
      // In local sandbox without active DB, fallback to mock login matching demo credentials
      const matchingRole = Object.keys(DEMO_ACCOUNTS).find(
        (key) => DEMO_ACCOUNTS[key].email.toLowerCase() === email.toLowerCase()
      );
      if (matchingRole) {
        const demo = DEMO_ACCOUNTS[matchingRole];
        const mockUser = { id: `mock-demo-${demo.role}`, email: demo.email, is_demo: true };
        const mockProfile = { id: mockUser.id, full_name: demo.name, email: demo.email, role: demo.role };
        setUser(mockUser);
        setProfile(mockProfile);
        setIsDemoMode(true);
        return { data: { user: mockUser }, error: null };
      }
      return { data: null, error: new Error('Supabase project not connected. Use Demo Quick-Login below.') };
    }

    const res = await supabase.auth.signInWithPassword({ email, password });
    if (res.data?.user) {
      const p = await fetchProfile(res.data.user.id);
      setProfile(p);
      setIsDemoMode(email.includes('.demo'));
    }
    return res;
  };

  // Standard Sign Up
  const signUp = async (email, password, fullName, role = ROLES.ELDERLY) => {
    if (!isSupabaseConfigured || !supabase) {
      const localUser = { id: `local-user-${Date.now()}`, email, is_demo: false };
      const localProfile = { id: localUser.id, full_name: fullName, email, role };
      setUser(localUser);
      setProfile(localProfile);
      setIsDemoMode(false);
      return { data: { user: localUser }, error: null };
    }

    return await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role,
        },
      },
    });
  };

  // Sign In as Pre-Seeded Hackathon Demo Persona
  const signInAsDemo = async (roleKey) => {
    const demoInfo = DEMO_ACCOUNTS[roleKey.toUpperCase()];
    if (!demoInfo) return;

    if (isSupabaseConfigured && supabase) {
      // Attempt real authentication against Supabase
      try {
        const res = await supabase.auth.signInWithPassword({
          email: demoInfo.email,
          password: demoInfo.password,
        });

        if (res.data?.user) {
          const p = await fetchProfile(res.data.user.id);
          setProfile(p);
          setIsDemoMode(true);
          return res;
        }
      } catch (err) {
        console.warn('Real demo account login failed, using sandbox fallback:', err);
      }
    }

    // Interactive Demo Sandbox Fallback
    const mockUser = {
      id: `demo-${demoInfo.role}-id`,
      email: demoInfo.email,
      is_demo: true,
    };
    const mockProfile = {
      id: mockUser.id,
      full_name: demoInfo.name,
      email: demoInfo.email,
      role: demoInfo.role,
      phone: '+91 98765 43210',
    };
    setUser(mockUser);
    setProfile(mockProfile);
    setIsDemoMode(true);
    return { data: { user: mockUser }, error: null };
  };

  // Sign Out
  const signOut = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setProfile(null);
    setSession(null);
    setIsDemoMode(false);
  };

  const refreshProfile = async () => {
    if (user?.id) {
      const p = await fetchProfile(user.id);
      setProfile(p);
    }
  };

  const contextValue = useMemo(() => ({
    user,
    profile,
    session,
    loading,
    isDemoMode,
    isSupabaseConfigured,
    signIn,
    signUp,
    signInAsDemo,
    signOut,
    refreshProfile,
  }), [
    user,
    profile,
    session,
    loading,
    isDemoMode,
    isSupabaseConfigured,
  ]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
