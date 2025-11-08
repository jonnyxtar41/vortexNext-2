import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useToast } from '@/components/ui/use-toast';

const RequestPasswordReset = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const { sendPasswordResetEmail } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();

    const handleResetRequest = async (e) => {
        e.preventDefault();
        setLoading(true);
        const { error } = await sendPasswordResetEmail(email);
        if (error) {
            toast({
                title: "❌ Error",
                description: error.message,
                variant: "destructive",
            });
        } else {
            toast({
                title: "✅ Correo enviado",
                description: "Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.",
            });
            navigate('/control-panel-7d8a2b3c4f5e');
        }
        setLoading(false);
    };

    return (
        <>
            <Helmet>
                <title>Restablecer Contraseña - Admin Panel</title>
            </Helmet>
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <motion.div
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md glass-effect p-8 rounded-2xl"
                >
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold gradient-text mb-2">Restablecer Contraseña</h1>
                        <p className="text-muted-foreground">Introduce tu correo para recibir un enlace de recuperación.</p>
                    </div>
                    <form onSubmit={handleResetRequest} className="space-y-6">
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
                            {loading ? 'Enviando...' : 'Enviar Enlace de Recuperación'}
                        </Button>
                    </form>
                    <div className="mt-6 text-center text-sm">
                        <Link to="/control-panel-7d8a2b3c4f5e" className="font-semibold text-primary hover:underline">
                            Volver al inicio de sesión
                        </Link>
                    </div>
                </motion.div>
            </div>
        </>
    );
};

export default RequestPasswordReset;