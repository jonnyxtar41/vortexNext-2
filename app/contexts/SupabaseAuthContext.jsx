'use client';
import React, { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { createClient } from '@/app/utils/supabase/client';
import { useToast } from '@/app/components/ui/use-toast';
import { logActivity } from '@/app/lib/supabase/log';
import { useRouter } from 'next/navigation';

const supabase = createClient();

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const { toast } = useToast();
  const router = useRouter();
  const authStateChangeRef = useRef(null);

  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setPermissions(null);
    setIsAdmin(false);
    router.push('/control-panel-7d8a2b3c4f5e');
  }, [router]);

  const handleSession = useCallback(async (currentSession) => {
    console.log('handleSession called, session:', currentSession);
    setSession(currentSession);
    const currentUser = currentSession?.user ?? null;
    setUser(currentUser);

    if (currentUser) {
        setIsAdmin(true);
        setIsSuperAdmin(true);
        setPermissions({
            'dashboard': true,
            'add-resource': true,
            'can_publish_posts': true,
            'manage-content': true,
            'analytics': true,
            'payments': true,
            'manage-users': true,
            'manage-roles': true,
            'manage-theme': true,
            'manage-site-content': true,
            'manage-ads': true,
            'manage-assets': true,
            'manage-resources': true,
            'manage-suggestions': true,
            'activity-log': true,
            'credentials': true,
        });
    } else {
      setPermissions(null);
      setIsSuperAdmin(false);
      setIsAdmin(false);
    }
  }, []);

  useEffect(() => {
    console.log('AuthProvider useEffect started');
    const getInitialSession = async () => {
      console.log('getInitialSession called');
      
      try {
        console.log('Calling supabase.auth.getSession()');
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('getSession timeout')), 5000)
        );

        const { data: { session: initialSession } } = await Promise.race([sessionPromise, timeoutPromise]);
        console.log('getSession completed, session:', initialSession);
        await handleSession(initialSession);
        console.log('getInitialSession completed');
      } catch (error) {
        console.error('Error during getInitialSession:', error);
        await handleSession(null);
      } finally {
        console.log('Setting loading to false');
        setLoading(false);
      }
    };

    getInitialSession();

    if (authStateChangeRef.current) {
        authStateChangeRef.current.unsubscribe();
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('onAuthStateChange event:', event, newSession);
        if (event === 'INITIAL_SESSION') {
          return;
        }
        if (event === 'SIGNED_IN') {
            if (!sessionStorage.getItem('loginLogged')) {
                logActivity(supabase, 'Usuario inició sesión');
                sessionStorage.setItem('loginLogged', 'true');
            }
            await handleSession(newSession);
        }
        if (event === 'SIGNED_OUT') {
            sessionStorage.removeItem('loginLogged');
            await handleSession(null);
        }
        if (event === 'TOKEN_REFRESHED' && newSession) {
            const currentTime = Math.floor(Date.now() / 1000);
            if (newSession.expires_at < currentTime - 10) { 
              await handleSignOut();
            } else {
                setSession(newSession);
                setUser(newSession.user);
            }
        }
      }
    );
    authStateChangeRef.current = subscription;

    return () => {
        if(authStateChangeRef.current) {
            authStateChangeRef.current.unsubscribe();
            authStateChangeRef.current = null;
        }
    };
  }, [handleSession, handleSignOut, toast]);

  const signUp = useCallback(async (email, password, options) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options,
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Sign up Failed",
        description: error.message || "Something went wrong",
      });
    }

    return { data, error };
  }, [toast]);

  const signIn = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Sign in Failed",
        description: error.message || "Something went wrong",
      });
    } else if (data.session) {
      await handleSession(data.session);
    }

    return { error };
  }, [toast, handleSession]);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      toast({
        variant: "destructive",
        title: "Sign out Failed",
        description: error.message || "Something went wrong",
      });
    } else {
      setUser(null);
      setSession(null);
      setPermissions(null);
      setIsAdmin(false);
      router.push('/control-panel-7d8a2b3c4f5e');
    }

    return { error };
  }, [toast, router]);

  const sendPasswordResetEmail = useCallback(async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });
    return { error };
  }, []);
  
  const updateUserPassword = useCallback(async (newPassword) => {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      return { error };
  }, []);

  const updateUserEmail = useCallback(async (newEmail) => {
    const { data, error } = await supabase.auth.updateUser({ email: newEmail });
    return { data, error };
  }, []);

  const value = useMemo(() => ({
    user,
    session,
    loading,
    permissions,
    isSuperAdmin,
    isAdmin,
    signUp,
    signIn,
    signOut,
    sendPasswordResetEmail,
    updateUserPassword,
    updateUserEmail,
  }), [user, session, loading, permissions, isSuperAdmin, isAdmin, signUp, signIn, signOut, sendPasswordResetEmail, updateUserPassword, updateUserEmail]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};