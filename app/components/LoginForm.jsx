// app/components/LoginForm.jsx
'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { useToast } from '@/app/components/ui/use-toast';
import { useAuth } from '@/app/contexts/SupabaseAuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const LoginForm = ({ isAdminLogin = false }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { signIn } = useAuth();
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
                    description: signInError.message || 'Email o contraseña incorrectos.',
                    variant: 'destructive',
                });
            } else {
                toast({
                    title: '¡Éxito!',
                    description: 'Inicio de sesión completado.',
                });
                router.push(isAdminLogin ? '/control-panel-7d8a2b3c4f5e/dashboard' : '/');
                router.refresh();
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
        hidden: { opacity: 0, y: -50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
            <motion.div
                initial="hidden"
                animate="visible"
                variants={cardVariants}
                className="w-full max-w-md"
            >
                <form
                    onSubmit={handleLogin}
                    className="glass-effect p-8 rounded-2xl"
                >
                    <div className="text-center mb-8">
                        {!isAdminLogin && (
                            <Link href="/" className="inline-block mb-4">
                                <img src="/logo.svg" alt="Zona Vortex Logo" className="h-16" />
                            </Link>
                        )}
                        
                        {isAdminLogin ? (
                            <>
                                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent mb-2">
                                    Admin Login
                                </h1>
                                <p className="text-muted-foreground">Accede a tu panel de control</p>
                            </>
                        ) : (
                            <>
                                <h1 className="text-3xl font-bold text-foreground">
                                    Iniciar Sesión
                                </h1>
                                <p className="text-muted-foreground mt-2">
                                    Bienvenido de vuelta.
                                </p>
                            </>
                        )}
                    </div>

                    {error && (
                        <div className="bg-destructive/20 border border-destructive/50 text-destructive-foreground p-3 rounded-lg mb-6 flex items-center gap-3">
                            <AlertCircle className="w-5 h-5" />
                            <p className="text-sm">{error}</p>
                        </div>
                    )}

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder={isAdminLogin ? "admin@example.com" : "tu@email.com"}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={loading}
                                className="bg-input border-border"
                            />
                        </div>
                        <div className="space-y-2 relative">
                            <Label htmlFor="password">Contraseña</Label>
                            <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={loading}
                                className="bg-input border-border pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-9 text-muted-foreground"
                                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <div className="mt-6 mb-8 text-center text-sm">
                        <Link
                            href="/forgot-password"
                            className="font-semibold text-primary hover:underline"
                        >
                            ¿Olvidaste tu contraseña?
                        </Link>
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={loading}
                    >
                        {loading ? 'Iniciando sesión...' : (isAdminLogin ? 'Iniciar Sesión' : 'Ingresar')}
                    </Button>

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
