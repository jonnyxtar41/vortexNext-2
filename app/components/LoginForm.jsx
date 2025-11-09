// app/components/LoginForm.jsx
'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn, Mail, Lock, AlertCircle } from 'lucide-react';
import { Button } from '@/app/components/ui/button'; // Ruta actualizada
import { Input } from '@/app/components/ui/input'; // Ruta actualizada
import { Label } from '@/app/components/ui/label'; // Ruta actualizada
import { useToast } from '@/app/components/ui/use-toast'; // Ruta actualizada
import { useSupabaseAuth } from '@/app/contexts/SupabaseAuthContext'; // Ruta actualizada
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Este componente recibe 'isAdminLogin' para saber cómo comportarse
const LoginForm = ({ isAdminLogin = false }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { signIn } = useSupabaseAuth();
    const { toast } = useToast();
    const router = useRouter();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { error: signInError } = await signIn(email, password);

            if (signInError) {
                setError(signInError.message);
                toast({
                    title: 'Error de inicio de sesión',
                    description: 'Email o contraseña incorrectos.',
                    variant: 'destructive',
                });
            } else {
                toast({
                    title: '¡Éxito!',
                    description: 'Inicio de sesión completado.',
                });
                // Redirige al panel de admin si es login de admin, o al inicio si es público
                router.push(isAdminLogin ? '/control-panel-7d8a2b3c4f5e' : '/');
                router.refresh(); // Refresca para actualizar la sesión en el layout
            }
        } catch (err) {
            setError('Ocurrió un error inesperado. Inténtalo de nuevo.');
            toast({
                title: 'Error',
                description: 'Ocurrió un error inesperado.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 50, scale: 0.9 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, type: 'spring' } }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
            <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                className="w-full max-w-md"
            >
                <form 
                    onSubmit={handleLogin} 
                    className="glass-effect p-8 rounded-2xl shadow-2xl border border-border/20"
                >
                    <div className="text-center mb-8">
                        <Link href="/" className="inline-block mb-4">
                            <img src="/logo.svg" alt="Zona Vortex Logo" className="h-16" />
                        </Link>
                        <h1 className="text-3xl font-bold text-foreground">
                            {isAdminLogin ? 'Panel de Control' : 'Iniciar Sesión'}
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            {isAdminLogin ? 'Acceso exclusivo para administradores.' : 'Bienvenido de vuelta.'}
                        </p>
                    </div>

                    {error && (
                        <div className="bg-destructive/20 border border-destructive/50 text-destructive-foreground p-3 rounded-lg mb-6 flex items-center gap-3">
                            <AlertCircle className="w-5 h-5" />
                            <p className="text-sm">{error}</p>
                        </div>
                    )}

                    <div className="space-y-6">
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <Input
                                id="email"
                                type="email"
                                placeholder="tu@email.com"
                                className="pl-10"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••••"
                                className="pl-10"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between mt-6 mb-8">
                        {/* No mostramos 'olvidé contraseña' en el login de admin */}
                        {!isAdminLogin && (
                            <Link 
                                href="/forgot-password" 
                                className="text-sm text-primary hover:text-primary/80 transition-colors"
                            >
                                ¿Olvidaste tu contraseña?
                            </Link>
                        )}
                        {/* Espaciador si es login de admin */}
                        {isAdminLogin && <div />}
                    </div>

                    <Button 
                        type="submit" 
                        className="w-full font-semibold text-lg py-6" 
                        disabled={loading}
                    >
                        {loading ? 'Ingresando...' : (
                            <>
                                <LogIn className="w-5 h-5 mr-2" />
                                {isAdminLogin ? 'Acceder' : 'Ingresar'}
                            </>
                        )}
                    </Button>

                    {/* No mostramos 'registrar' en el login de admin */}
                    {!isAdminLogin && (
                        <p className="text-center text-sm text-muted-foreground mt-8">
                            ¿No tienes cuenta?{' '}
                            <Link href="/register" className="text-primary hover:text-primary/80 font-medium">
                                Regístrate aquí
                            </Link>
                        </p>
                    )}
                </form>
            </motion.div>
        </div>
    );
};

export default LoginForm;