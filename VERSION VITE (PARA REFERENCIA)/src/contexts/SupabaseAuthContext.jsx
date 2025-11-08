import React, { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { logActivity } from '@/lib/supabase/log';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const authStateChangeRef = useRef(null);

  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setPermissions(null);
    navigate('/control-panel-7d8a2b3c4f5e');
  }, [navigate]);

  const handleSession = useCallback(async (currentSession) => {
    setSession(currentSession);
    const currentUser = currentSession?.user ?? null;
    setUser(currentUser);

    if (currentUser) {
        try {
            const { data, error } = await supabase
                .rpc('get_user_permissions', { p_user_id: currentUser.id });

            if (error) {
                console.error('Error fetching user permissions:', error);
                setPermissions({});
            } else {
                setPermissions(data || {});
            }
        } catch (e) {
            console.error('Catastrophic error fetching permissions', e)
            setPermissions({});
        }

        try {
            const { data: superAdminStatus, error: superAdminError } = await supabase.rpc('is_super_admin');
            if (superAdminError) {
                console.error('Error checking SuperAdmin status:', superAdminError);
                setIsSuperAdmin(false);
            } else {
                setIsSuperAdmin(superAdminStatus);
            }
        } catch (e) {
            console.error('Catastrophic error checking SuperAdmin status', e);
            setIsSuperAdmin(false);
        }
    } else {
      setPermissions(null);
      setIsSuperAdmin(false);
    }
  }, []);

  useEffect(() => {
    const getInitialSession = async () => {
      setLoading(true);
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      await handleSession(initialSession);
      setLoading(false);
    };

    getInitialSession();

    if (authStateChangeRef.current) {
        authStateChangeRef.current.unsubscribe();
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (event === 'INITIAL_SESSION') {
          return;
        }
        if (event === 'SIGNED_IN') {
            if (!sessionStorage.getItem('loginLogged')) {
                logActivity('Usuario inició sesión');
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
            // Solo cierra la sesión si el token ha expirado, con un pequeño margen.
            if (newSession.expires_at < currentTime - 10) { 
              await handleSignOut();
            } else {
                // Actualiza la sesión sin forzar un re-renderizado si no es necesario
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
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Sign in Failed",
        description: error.message || "Something went wrong",
      });
    }

    return { error };
  }, [toast]);

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
      navigate('/control-panel-7d8a2b3c4f5e');
    }

    return { error };
  }, [toast, navigate]);

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
    signUp,
    signIn,
    signOut,
    sendPasswordResetEmail,
    updateUserPassword,
    updateUserEmail,
  }), [user, session, loading, permissions, signUp, signIn, signOut, sendPasswordResetEmail, updateUserPassword, updateUserEmail]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};