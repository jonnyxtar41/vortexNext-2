'use client'; // <-- ¡AÑADE ESTA LÍNEA!

import React, { useEffect } from 'react';
import { useAuth } from '@/app/contexts/SupabaseAuthContext';
import LoginForm from '@/app/components/LoginForm'; 
import LoadingSpinner from '@/app/components/LoadingSpinner';
import { useRouter } from 'next/navigation';


export default function AdminLoginPage() {
    const { session, loading, isAdmin } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && session && isAdmin) {
            router.replace('/control-panel-7d8a2b3c4f5e/dashboard');
        }
    }, [session, loading, isAdmin, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    if (!session || !isAdmin) {
        return <LoginForm isAdminLogin={true} />;
    }

    return (
        <div className="min-h-screen flex items-center justify-center">
            <LoadingSpinner />
        </div>
    );
}