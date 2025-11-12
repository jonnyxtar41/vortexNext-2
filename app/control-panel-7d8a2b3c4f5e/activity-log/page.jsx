'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react'; // 1. Importar useRef
import { motion } from 'framer-motion';
// 2. Importar el cliente correcto de Next.js
import { createClient } from '@/app/utils/supabase/client'; 
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { BookUser, Clock, RefreshCw, Search, AlertTriangle } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { useToast } from '@/app/components/ui/use-toast';
import { Badge } from '@/app/components/ui/badge'; // (Asumo que tienes este componente de UI)

const ActivityLog = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { toast } = useToast();
    // 3. Crear la instancia de Supabase usando useRef
    const supabaseRef = useRef(createClient());

    const fetchLogs = useCallback(async (term = '') => {
        setLoading(true);
        const supabase = supabaseRef.current; // 4. Obtener la instancia

        let query = supabase
            .from('activity_log')
            .select('*')
            .order('created_at', { ascending: false });

        if (term) {
            // Buscamos en el mensaje, el ID de usuario o el metadata
            query = query.or(`message.ilike.%${term}%,user_id.ilike.%${term}%,metadata->>status.ilike.%${term}%`);
        }

        const { data, error } = await query.limit(100);

        if (error) {
            console.error('Error fetching activity logs:', error);
            toast({ title: 'Error al cargar registros', description: error.message, variant: 'destructive' });
        } else {
            setLogs(data);
        }
        setLoading(false);
    }, [toast]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const handleSearch = () => {
        fetchLogs(searchTerm);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'published': return 'bg-green-500';
            case 'draft': return 'bg-yellow-500';
            case 'pending_approval': return 'bg-blue-500';
            case 'error': return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
        >
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4 flex items-center justify-center gap-3">
                    <BookUser className="w-8 h-8 text-primary" />
                    Registro de Actividad
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                    Historial de eventos importantes en la plataforma.
                </p>
            </div>

            <div className="flex justify-between mb-6 gap-4">
                <div className="flex-grow flex gap-2">
                    <Input
                        placeholder="Buscar por mensaje, usuario, estado..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        className="bg-input border-border"
                    />
                    <Button onClick={handleSearch} disabled={loading}>
                        <Search className="w-4 h-4 mr-2" /> Buscar
                    </Button>
                </div>
                <Button onClick={() => fetchLogs()} disabled={loading}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    {loading ? 'Actualizando...' : 'Actualizar'}
                </Button>
            </div>

            <div className="glass-effect p-6 rounded-2xl">
                <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2">
                    {loading && logs.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">Cargando registros...</p>
                    ) : logs.length > 0 ? (
                        logs.map(log => (
                            <div key={log.id} className="bg-background/50 p-4 rounded-lg flex items-start gap-4">
                                <AlertTriangle className="w-5 h-5 text-yellow-400 mt-1" />
                                <div className="flex-grow">
                                    <p className="text-foreground mb-2">{log.message}</p>
                                    <div className="text-sm text-muted-foreground flex items-center gap-4 flex-wrap">
                                        <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {formatDistanceToNow(new Date(log.created_at), { addSuffix: true, locale: es })}</span>
                                        {log.user_id && <span className="text-xs">Usuario: {log.user_id}</span>}
                                        {log.metadata?.status && (
                                            <Badge variant="outline" className={getStatusColor(log.metadata.status)}>
                                                {log.metadata.status}
                                            </Badge>
                                        )}
                                        {log.metadata?.postId && <span className="text-xs">Post ID: {log.metadata.postId}</span>}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-muted-foreground py-8">No hay registros de actividad que coincidan con la búsqueda.</p>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default ActivityLog;