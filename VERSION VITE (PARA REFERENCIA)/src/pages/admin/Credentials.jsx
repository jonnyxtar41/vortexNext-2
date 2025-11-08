import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { KeyRound, Mail, Save } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const Credentials = () => {
    const { user, updateUser } = useAuth();
    const { toast } = useToast();
    const [newEmail, setNewEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loadingEmail, setLoadingEmail] = useState(false);
    const [loadingPassword, setLoadingPassword] = useState(false);

    const handleEmailChange = async (e) => {
        e.preventDefault();
        setLoadingEmail(true);
        const { error } = await updateUser({ email: newEmail });
        if (!error) {
            toast({
                title: '✅ Verificación de correo enviada',
                description: 'Revisa tu nueva bandeja de entrada para confirmar el cambio de correo electrónico.',
            });
            setNewEmail('');
        }
        setLoadingEmail(false);
    };
    
    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setLoadingPassword(true);
        const { error } = await updateUser({ password: newPassword });
        if (!error) {
            setNewPassword('');
        }
        setLoadingPassword(false);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
        >
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4 flex items-center justify-center gap-3">
                    <KeyRound className="w-8 h-8 text-primary" />
                    Gestionar Credenciales
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                    Actualiza tu correo electrónico y contraseña de administrador.
                </p>
            </div>

            <div className="max-w-2xl mx-auto grid md:grid-cols-1 gap-12">
                <motion.div 
                    className="glass-effect p-8 rounded-2xl"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                        <Mail className="w-6 h-6 text-accent" />
                        Cambiar Correo Electrónico
                    </h3>
                    <p className="text-muted-foreground mb-2 text-sm">
                        Correo actual: <span className="font-semibold text-white">{user?.email}</span>
                    </p>
                    <p className="text-muted-foreground mb-6 text-sm">
                        Para cambiar tu correo, ingresa uno nuevo. Recibirás un enlace de confirmación en ambas direcciones (antigua y nueva) para completar el proceso.
                    </p>
                    <form onSubmit={handleEmailChange} className="space-y-4">
                        <div>
                            <Label htmlFor="new-email">Nuevo Correo Electrónico</Label>
                            <Input
                                id="new-email"
                                type="email"
                                placeholder="nuevo@email.com"
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                required
                                className="mt-1 bg-input border-border"
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={loadingEmail}>
                            {loadingEmail ? 'Enviando...' : 'Cambiar Correo'}
                            <Save className="w-4 h-4 ml-2" />
                        </Button>
                    </form>
                </motion.div>

                <motion.div 
                    className="glass-effect p-8 rounded-2xl"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                >
                    <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                        <KeyRound className="w-6 h-6 text-accent" />
                        Cambiar Contraseña
                    </h3>
                     <p className="text-muted-foreground mb-6 text-sm">
                       Ingresa una nueva contraseña segura para tu cuenta. Se recomienda una combinación de letras, números y símbolos.
                    </p>
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                        <div>
                            <Label htmlFor="new-password">Nueva Contraseña</Label>
                            <Input
                                id="new-password"
                                type="password"
                                placeholder="••••••••••••"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                className="mt-1 bg-input border-border"
                                minLength="6"
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={loadingPassword}>
                            {loadingPassword ? 'Guardando...' : 'Cambiar Contraseña'}
                             <Save className="w-4 h-4 ml-2" />
                        </Button>
                    </form>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default Credentials;