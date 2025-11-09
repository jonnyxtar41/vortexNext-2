'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/app/lib/customSupabaseClient';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Lightbulb, Mail, Clock, RefreshCw, Trash2 } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { useAuth } from '@/app/contexts/SupabaseAuthContext';
import { useToast } from '@/app/components/ui/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/app/components/ui/alert-dialog";

const ManageSuggestions = () => {
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const { session } = useAuth();
    const { toast } = useToast();

    const fetchSuggestions = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('suggestions')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching suggestions:', error);
            toast({ title: 'Error al cargar sugerencias', description: error.message, variant: 'destructive' });
        } else {
            setSuggestions(data);
        }
        setLoading(false);
    }, [toast]);

    useEffect(() => {
        fetchSuggestions();
    }, [fetchSuggestions]);

    const callAdminFunction = async (action, payload) => {
        if (!session) throw new Error("No hay sesión activa.");
        const { data, error } = await supabase.functions.invoke('user-management', {
            body: JSON.stringify({ action, payload }),
            headers: { 'Authorization': `Bearer ${session.access_token}` }
        });
        if (error) throw error;
        return data;
    };

    const handleDelete = async (suggestionId) => {
        try {
            await callAdminFunction('deleteSuggestion', { suggestionId });
            toast({ title: 'Sugerencia eliminada', description: 'La sugerencia ha sido eliminada permanentemente.' });
            setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
        } catch (error) {
            toast({ title: 'Error al eliminar', description: error.message, variant: 'destructive' });
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
                    <Lightbulb className="w-8 h-8 text-primary" />
                    Buzón de Sugerencias
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                    Revisa las ideas y recomendaciones enviadas por los usuarios.
                </p>
            </div>

            <div className="flex justify-end mb-4">
                <Button onClick={fetchSuggestions} disabled={loading}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    {loading ? 'Actualizando...' : 'Actualizar'}
                </Button>
            </div>

            <div className="glass-effect p-6 rounded-2xl">
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                    {loading && suggestions.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">Cargando sugerencias...</p>
                    ) : suggestions.length > 0 ? (
                        suggestions.map(suggestion => (
                            <div key={suggestion.id} className="bg-background/50 p-6 rounded-lg flex items-start gap-4">
                                <div className="flex-grow">
                                    <p className="text-foreground mb-4">{suggestion.message}</p>
                                    <div className="text-sm text-muted-foreground flex items-center gap-6 pt-3 border-t border-border/10">
                                        <span className="flex items-center gap-1.5"><Mail className="w-3 h-3" /> {suggestion.email || 'Anónimo'}</span>
                                        <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {formatDistanceToNow(new Date(suggestion.created_at), { addSuffix: true, locale: es })}</span>
                                    </div>
                                </div>
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
                                                Esta acción es irreversible y eliminará la sugerencia permanentemente.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDelete(suggestion.id)}>Eliminar</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-muted-foreground py-8">No hay sugerencias por el momento.</p>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default ManageSuggestions;