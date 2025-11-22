'use client';

import { useState } from 'react';
import { useAuth } from '@/app/contexts/SupabaseAuthContext';
import Button  from '@/app/components/ui/button';
import Input from '@/app/components/ui/input';
import Label  from '@/app/components/ui/label';
import { motion } from 'framer-motion';
import Link from 'next/link';



const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const { resetPasswordForEmail } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        await resetPasswordForEmail(email);
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md glass-effect p-8 rounded-2xl"
            >
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold gradient-text mb-2">Recuperar Contraseña</h1>
                    <p className="text-muted-foreground">Ingresa tu correo para recibir un enlace de recuperación.</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="tu@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="bg-input border-border"
                        />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'Enviando...' : 'Enviar Correo de Recuperación'}
                    </Button>
                </form>
                <div className="mt-6 text-center text-sm">
                    <Link href="/control-panel-7d8a2b3c4f5e" className="font-semibold text-primary hover:underline">
                        Volver al Inicio de Sesión
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
