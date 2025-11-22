'use client';

import React, { useState } from 'react';
import { useToast } from '@/app/components/ui/use-toast';
import { useAuth } from '@/app/contexts/SupabaseAuthContext';
import  Button  from '@/app/components/ui/button';
import Link from 'next/link';
import { Eye, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from "@/app/components/ui/alert-dialog";

// Importamos SOLO las Server Actions para mutaciones
import { updatePost, deletePost } from '@/app/lib/actions/post-actions';

const StatusBadge = ({ status }) => {
    const statusStyles = {
        published: 'bg-green-500/20 text-green-400',
        draft: 'bg-yellow-500/20 text-yellow-400',
        scheduled: 'bg-blue-500/20 text-blue-400',
        pending: 'bg-orange-500/20 text-orange-400',
    };
    const statusText = {
        published: 'Publicado',
        draft: 'Borrador',
        scheduled: 'Programado',
        pending: 'Pendiente de Aprobación',
    };

    return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[status] || 'bg-gray-500/20 text-gray-400'}`}>
            {statusText[status] || status}
        </span>
    );
};

// 1. Recibimos initialPosts como prop
const ManagePendingPosts = ({ initialPosts }) => {
    const { user, permissions } = useAuth();
    const { toast } = useToast();
    // 2. Inicializamos el estado con los datos recibidos del servidor
    const [posts, setPosts] = useState(initialPosts || []);
    const [deleteCandidate, setDeleteCandidate] = useState(null);

    // 3. ELIMINADO: useEffect para fetchData. Ya no es necesario.

    const handleApprove = async (post) => {
        try {
            const result = await updatePost(post.id, { ...post, status: 'published' });
            if (result.error) throw new Error(result.error.message);

            toast({ title: "✅ Post Aprobado", description: "El recurso ha sido publicado exitosamente." });
            // Actualizamos la lista localmente
            setPosts(posts.filter(p => p.id !== post.id));
        } catch (error) {
            toast({ title: "❌ Error", description: error.message, variant: "destructive" });
        }
    };

    const handleReject = async (post) => {
        // Podrías querer cambiar el estado a 'draft' en lugar de eliminarlo directamente si lo rechazas.
        // Para este ejemplo, asumiré que rechazar = devolver a borrador.
        try {
             const result = await updatePost(post.id, { ...post, status: 'draft' });
             if (result.error) throw new Error(result.error.message);
             toast({ title: "↩️ Post Rechazado", description: "El recurso ha sido devuelto a borradores." });
             setPosts(posts.filter(p => p.id !== post.id));
        } catch (error) {
            toast({ title: "❌ Error", description: error.message, variant: "destructive" });
        }
    };

    const handleDelete = async () => {
        if (!deleteCandidate) return;
        try {
            const result = await deletePost(deleteCandidate.id);
            if (result.error) throw new Error(result.error.message);

            toast({ title: "🗑️ Recurso eliminado", description: "El post ha sido eliminado permanentemente." });
            setPosts(posts.filter(p => p.id !== deleteCandidate.id));
        } catch (error) {
            toast({ title: "❌ Error al eliminar", description: error.message, variant: "destructive" });
        } finally {
            setDeleteCandidate(null);
        }
    };

    if (!permissions?.can_publish_posts) {
        return <div className="text-red-500">No tienes permisos para gestionar posts pendientes.</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-white tracking-tight">Posts Pendientes</h2>
            </div>

            {posts.length > 0 ? (
                <div className="grid gap-4">
                    {posts.map(post => (
                        <div key={post.id} className="bg-card/50 p-4 rounded-lg border border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <h3 className="text-xl font-semibold text-foreground">{post.title}</h3>
                                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                                    <span>Por: {post.profiles?.full_name || post.profiles?.email || 'Desconocido'}</span>
                                    <span>•</span>
                                    <span>{format(new Date(post.created_at), "d MMM, yyyy", { locale: es })}</span>
                                    <StatusBadge status={post.status} />
                                </div>
                            </div>

                            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                                <Link href={`/control-panel-7d8a2b3c4f5e/edit-post/${post.id}`}>
                                    <Button variant="ghost" size="icon" title="Ver/Editar">
                                        <Eye className="w-5 h-5" />
                                    </Button>
                                </Link>

                                <Button onClick={() => handleApprove(post)} className="bg-green-600 hover:bg-green-700 text-white" size="sm" title="Aprobar y Publicar">
                                    <CheckCircle className="w-4 h-4 mr-2" /> Aprobar
                                </Button>

                                <Button onClick={() => handleReject(post)} variant="secondary" size="sm" title="Devolver a Borradores">
                                    <XCircle className="w-4 h-4 mr-2" /> Rechazar
                                </Button>

                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" size="icon" className="h-9 w-9" onClick={() => setDeleteCandidate(post)} title="Eliminar Permanentemente">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>¿Confirmas la eliminación?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Esta acción es irreversible y eliminará permanentemente el recurso "{deleteCandidate?.title}".
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Eliminar</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 px-4 rounded-2xl border-2 border-dashed border-gray-700/50 bg-card/10">
                    <CheckCircle className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
                    <h3 className="text-xl font-medium text-foreground mb-2">Todo al día</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                        No hay posts esperando aprobación en este momento.
                    </p>
                </div>
            )}
        </div>
    );
};

export default ManagePendingPosts;