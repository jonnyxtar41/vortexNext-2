'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { KeyRound } from 'lucide-react';

const ManageCredentials = () => {
    const { user, updateUserPassword } = useAuth();
    const { toast } = useToast();

    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    
    const [loading, setLoading] = useState({
        password: false,
    });

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmNewPassword) {
            toast({ title: "❌ Las contraseñas no coinciden", variant: "destructive" });
            return;
        }
        if (newPassword.length < 6) {
            toast({ title: "❌ Contraseña demasiado corta", description: "Debe tener al menos 6 caracteres.", variant: "destructive" });
            return;
        }
        setLoading(prev => ({ ...prev, password: true }));
        const { error } = await updateUserPassword(newPassword);
        if (error) {
            toast({ title: "❌ Error al cambiar la contraseña", description: error.message, variant: "destructive" });
        } else {
            toast({ title: "✅ Contraseña actualizada", description: "Tu contraseña ha sido cambiada exitosamente." });
            setNewPassword('');
            setConfirmNewPassword('');
        }
        setLoading(prev => ({ ...prev, password: false }));
    };

    return (
        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            
            <div className="max-w-md mx-auto">
                <div className="glass-effect p-6 rounded-2xl space-y-4">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2"><KeyRound/> Cambiar Mi Contraseña</h3>
                    <p className="text-sm text-gray-400">Correo actual: <span className="font-semibold">{user?.email}</span></p>
                    <form onSubmit={handleUpdatePassword} className="space-y-4">
                        <div>
                            <Label htmlFor="new-password">Nueva Contraseña</Label>
                            <Input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="mt-1 bg-black/30 border-white/20" />
                        </div>
                        <div>
                            <Label htmlFor="confirm-password">Confirmar Nueva Contraseña</Label>
                            <Input id="confirm-password" type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} className="mt-1 bg-black/30 border-white/20" />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading.password}>{loading.password ? 'Actualizando...' : 'Actualizar Contraseña'}</Button>
                    </form>
                </div>
            </div>
        </motion.div>
    );
};

export default ManageCredentials;