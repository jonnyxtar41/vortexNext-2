'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/app/contexts/SupabaseAuthContext';
import LoginForm from '@/app/components/LoginForm';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/app/components/LoadingSpinner';

export default function AdminLoginPage() {
    const { session, isAdmin, loading } = useAuth();
    const router = useRouter();


    useEffect(() => {
        if (!loading && session && isAdmin) {
            router.replace('/control-panel-7d8a2b3c4f5e/dashboard');
        }
    }, [session, isAdmin, loading, router]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <LoadingSpinner />
            </div>
        );
    }

    if (session && isAdmin) {
        // Still loading the dashboard, show a spinner
        return (
            <div className="flex justify-center items-center h-screen">
                <LoadingSpinner />
            </div>
        );
    }

    // If not loading, and not an admin or no session, show login
    return <LoginForm isAdminLogin={true} />;
}