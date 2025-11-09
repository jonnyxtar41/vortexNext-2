'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/app/lib/customSupabaseClient';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { List, User, Clock, RefreshCw, Trash2, ShieldAlert } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { useAuth } from '@/app/contexts/SupabaseAuthContext';
import { useToast } from '@/app/components/ui/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/app/components/ui/alert-dialog";
import { Switch } from '@/app/components/ui/switch';
import { Label } from '@/app/components/ui/label';

const ActivityLog = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [silentDelete, setSilentDelete] = useState(false);
    const { session, isSuperAdmin } = useAuth();
    const { toast } = useToast();
    const isAdmin = isSuperAdmin;

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('activity_log')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(100);

        if (error) {
            console.error('Error fetching activity logs:', error);
            toast({ title: 'Error al cargar los registros', description: error.message, variant: 'destructive' });
        } else {
            setLogs(data);
        }
        setLoading(false);
    }, [toast]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);
    
    const callAdminFunction = async (action, payload) => {
        if (!session) throw new Error("No hay sesión activa.");
        const { data, error } = await supabase.functions.invoke('user-management', {
            body: JSON.stringify({ action, payload }),
            headers: { 'Authorization': `Bearer ${session.access_token}` }
        });
        if (error) throw error;
        return data;
    };

    const handleDeleteLog = async (logId) => {
        try {
            await callAdminFunction('deleteLog', { logId, shouldLog: !silentDelete });
            toast({ title: 'Registro eliminado', description: 'El registro de actividad ha sido eliminado.' });
            setLogs(prevLogs => prevLogs.filter(log => log.id !== logId));
        } catch (error) {
            toast({ title: 'Error al eliminar', description: error.message, variant: 'destructive' });
        }
    };


    const getActionIcon = (action) => {
        if (action.includes('creó')) return '📝';
        if (action.includes('actualizó')) return '🔄';
        if (action.includes('eliminó')) return '🗑️';
        if (action.includes('inició sesión')) return '🔑';
        if (action.includes('cerró sesión')) return '🚪';
        if (action.includes('aprobó')) return '✅';
        if (action.includes('rechazó')) return '❌';
        if (action.includes('sugerencia')) return '💡';
        return '⚙️';
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
        >
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4 flex items-center justify-center gap-3">
                    <List className="w-8 h-8 text-primary" />
                    Registro de Actividad
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                    Un historial de las acciones importantes realizadas en la plataforma.
                </p>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                {isAdmin && (
                    <div className="flex items-center space-x-2 p-3 bg-background/50 rounded-lg">
                        <ShieldAlert className="w-5 h-5 text-yellow-400" />
                        <Label htmlFor="silent-delete-switch" className="font-bold">Eliminación Silenciosa</Label>
                        <Switch
                            id="silent-delete-switch"
                            checked={silentDelete}
                            onCheckedChange={setSilentDelete}
                        />
                    </div>
                )}
                <Button onClick={fetchLogs} disabled={loading} className={!isAdmin ? 'w-full' : ''}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    {loading ? 'Actualizando...' : 'Actualizar'}
                </Button>
            </div>

            <div className="glass-effect p-6 rounded-2xl">
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                    {loading && logs.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">Cargando registros...</p>
                    ) : logs.length > 0 ? (
                        logs.map(log => (
                            <div key={log.id} className="bg-background/50 p-4 rounded-lg flex items-start gap-4">
                                <span className="text-xl mt-1">{getActionIcon(log.action)}</span>
                                <div className="flex-grow">
                                    <p className="font-semibold text-foreground">{log.action}</p>
                                    <div className="text-sm text-muted-foreground flex items-center gap-4 mt-1 flex-wrap">
                                        <span className="flex items-center gap-1.5"><User className="w-3 h-3" /> {log.user_email || 'Sistema'}</span>
                                        <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {formatDistanceToNow(new Date(log.created_at), { addSuffix: true, locale: es })}</span>
                                    </div>
                                    {log.details && (
                                        <pre className="mt-2 text-xs bg-black/30 p-2 rounded-md overflow-x-auto text-muted-foreground">
                                            {JSON.stringify(log.details, null, 2)}
                                        </pre>
                                    )}
                                </div>
                                {isAdmin && (
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="destructive" size="icon" className="h-8 w-8 flex-shrink-0">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>¿Confirmas la eliminación?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Esta acción es irreversible. El registro de actividad será eliminado permanentemente.
                                                    {silentDelete && <span className="block mt-2 font-bold text-yellow-400">La eliminación no será registrada.</span>}
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDeleteLog(log.id)}>Eliminar</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                )}
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-muted-foreground py-8">No hay actividad registrada todavía.</p>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default ActivityLog;