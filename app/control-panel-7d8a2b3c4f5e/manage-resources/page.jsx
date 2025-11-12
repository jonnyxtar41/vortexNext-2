'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
// CORRECCIÓN 1: Importamos createClient desde la ruta correcta de Next.js
import { createClient } from '@/app/utils/supabase/client';
import { useToast } from '@/app/components/ui/use-toast';
import { useAuth } from '@/app/contexts/SupabaseAuthContext';
import { Database, Server, HardDrive, RefreshCw, AlertTriangle, CheckCircle, Table, Key, Link2, Share2 } from 'lucide-react';
import { Button } from '@/app/components/ui/button';

const StatCard = ({ title, value, icon, status, unit }) => {
    const statusColor = status === 'ok' ? 'text-green-400' : 'text-yellow-400';
    const StatusIcon = status === 'ok' ? CheckCircle : AlertTriangle;

    return (
        <div className="glass-effect p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-muted-foreground flex items-center gap-2">
                    {React.createElement(icon, { className: "w-6 h-6 text-primary" })}
                    {title}
                </h3>
                <div className={`flex items-center gap-2 text-sm ${statusColor}`}>
                    <StatusIcon className="w-4 h-4" />
                    <span>{status === 'ok' ? 'Operacional' : 'Advertencia'}</span>
                </div>
            </div>
            <p className="text-4xl font-bold text-foreground">{value} <span className="text-2xl text-muted-foreground">{unit}</span></p>
        </div>
    );
};

const FunctionCard = ({ name, status }) => {
    const statusColor = status === 'ACTIVE' ? 'bg-green-500' : 'bg-yellow-500';
    return (
        <div className="bg-background/50 p-4 rounded-lg flex justify-between items-center">
            <p className="font-mono text-foreground">{name}</p>
            <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${statusColor}`}></div>
                <span className="text-sm text-muted-foreground">{status}</span>
            </div>
        </div>
    );
};

const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const ManageResources = () => {
    const { toast } = useToast();
    const { session } = useAuth();
    const [healthData, setHealthData] = useState(null);
    const [dbSchema, setDbSchema] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // CORRECCIÓN 2: Instanciamos el cliente de Supabase aquí
    const supabase = createClient();

    const fetchData = useCallback(async () => {
        if (!session) return;
        setLoading(true);
        try {
            // Nota: Asegúrate de que estas Edge Functions ('system-health' y 'get-db-schema') 
            // estén desplegadas en tu proyecto de Supabase para que esto funcione.
            const [health, schema] = await Promise.all([
                supabase.functions.invoke('system-health'),
                supabase.functions.invoke('get-db-schema')
            ]);
            
            if (health.error) throw health.error;
            setHealthData(health.data);

            if (schema.error) throw schema.error;
            setDbSchema(schema.data);

        } catch (error) {
            console.error("Error fetching resources:", error);
            // Es posible que falle si las funciones no existen, manejamos el error visualmente
            toast({ title: 'Error al cargar los datos del sistema', description: error.message || 'Verifica que las Edge Functions estén activas', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    }, [session, toast, supabase]); // Agregamos supabase a las dependencias

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const dbSize = healthData?.database?.size || 'N/A';
    const storageSize = healthData?.storage?.size ? formatBytes(healthData.storage.size) : 'N/A';
    const functions = healthData?.functions?.list || [];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <h2 className="text-3xl font-bold">Herramientas de Recursos</h2>
                <Button onClick={fetchData} disabled={loading}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    {loading ? 'Actualizando...' : 'Actualizar'}
                </Button>
            </div>

            {loading && !healthData ? (
                <p className="text-center text-muted-foreground">Cargando estado del sistema...</p>
            ) : (
                <div className="space-y-8">
                    <div className="grid md:grid-cols-2 gap-6">
                        <StatCard
                            title="Base de Datos"
                            value={dbSize.split(' ')[0] || '0'}
                            unit={dbSize.split(' ')[1] || 'B'}
                            icon={Database}
                            status={healthData?.database?.status || 'warning'}
                        />
                        <StatCard
                            title="Almacenamiento"
                            value={storageSize.split(' ')[0] || '0'}
                            unit={storageSize.split(' ')[1] || 'B'}
                            icon={HardDrive}
                            status={healthData?.storage?.status || 'warning'}
                        />
                    </div>

                    <div className="glass-effect p-6 rounded-2xl">
                        <h3 className="text-lg font-semibold text-muted-foreground flex items-center gap-2 mb-4">
                            <Server className="w-6 h-6 text-primary" />
                            Funciones del Servidor (Edge Functions)
                        </h3>
                        <div className="space-y-3">
                            {functions.length > 0 ? (
                                functions.map(fn => <FunctionCard key={fn.name} name={fn.name} status={fn.status} />)
                            ) : (
                                <p className="text-muted-foreground">No se encontraron funciones activas o no se pudo conectar con el servicio.</p>
                            )}
                        </div>
                    </div>

                    <div className="glass-effect p-6 rounded-2xl">
                        <h3 className="text-lg font-semibold text-muted-foreground flex items-center gap-2 mb-4">
                            <Share2 className="w-6 h-6 text-primary" />
                            Esquema de la Base de Datos
                        </h3>
                        {dbSchema ? (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {dbSchema.tables?.map(table => (
                                    <div key={table.table_name} className="bg-background/50 p-4 rounded-lg">
                                        <h4 className="font-bold text-lg text-foreground flex items-center gap-2"><Table className="w-5 h-5 text-secondary-foreground" /> {table.table_name}</h4>
                                        <ul className="mt-2 space-y-1 text-sm text-muted-foreground pl-2 border-l-2 border-primary/30">
                                            {table.columns?.map(col => (
                                                <li key={col.column_name} className="flex items-center gap-2 font-mono">
                                                    {col.is_primary_key && <Key className="w-3 h-3 text-yellow-400" />}
                                                    {col.column_name}: <span className="text-text-subtle">{col.data_type}</span>
                                                </li>
                                            ))}
                                        </ul>
                                        {table.foreign_keys?.length > 0 && (
                                            <div className="mt-3 pt-3 border-t border-border/10">
                                                <h5 className="text-xs font-semibold uppercase text-text-subtle mb-2">Relaciones</h5>
                                                <ul className="space-y-2 text-sm">
                                                    {table.foreign_keys.map(fk => (
                                                        <li key={fk.constraint_name} className="flex items-center gap-2 text-cyan-400 font-mono">
                                                            <Link2 className="w-4 h-4" />
                                                            <span>{fk.column_name} → {fk.foreign_table_name}({fk.foreign_column_name})</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                             <p className="text-muted-foreground">No se pudo cargar el esquema o no está disponible.</p>
                        )}
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default ManageResources;