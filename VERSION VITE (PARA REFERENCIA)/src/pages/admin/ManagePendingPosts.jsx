import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { deletePost, updatePost } from '@/lib/supabase/posts';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { getPosts } from '@/lib/supabase/posts';

const StatusBadge = ({ status }) => {
    const statusStyles = {
        published: 'bg-green-500/20 text-green-400',
        draft: 'bg-yellow-500/20 text-yellow-400',
        scheduled: 'bg-blue-500/20 text-blue-400',
        pending_approval: 'bg-orange-500/20 text-orange-400',
    };
    const statusText = {
        published: 'Publicado',
        draft: 'Borrador',
        scheduled: 'Programado',
        pending_approval: 'Pendiente',
    };
    return (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusStyles[status] || 'bg-gray-500/20 text-gray-400'}`}>
            {statusText[status] || status}
        </span>
    );
};

const ManagePendingPosts = () => {
    const { toast } = useToast();
    const { permissions, isSuperAdmin } = useAuth();
    const navigate = useNavigate();
    const [pendingPosts, setPendingPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteCandidate, setDeleteCandidate] = useState(null);

    const canPublish = isSuperAdmin || permissions?.['can_publish_posts'];

    const fetchPendingPosts = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await getPosts({ includePending: true });
            if (error) throw error;
            setPendingPosts(data.filter(post => post.status === 'pending_approval'));
        } catch (error) {
            toast({ title: 'Error al cargar posts pendientes', description: error.message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchPendingPosts();
    }, [fetchPendingPosts]);

    const handleApprove = async (post) => {
        if (!canPublish) {
            toast({ title: 'Permiso denegado', description: 'No tienes permiso para aprobar posts.', variant: 'destructive' });
            return;
        }
        try {
            const { error } = await updatePost(post.id, { status: 'published', published_at: new Date().toISOString() });
            if (error) throw error;
            toast({ title: 'Post aprobado y publicado', description: `"${post.title}" ha sido publicado.` });
            fetchPendingPosts();
        } catch (error) {
            toast({ title: 'Error al aprobar post', description: error.message, variant: 'destructive' });
        }
    };

    const handleReject = async (post) => {
        if (!canPublish) {
            toast({ title: 'Permiso denegado', description: 'No tienes permiso para rechazar posts.', variant: 'destructive' });
            return;
        }
        try {
            const { error } = await updatePost(post.id, { status: 'draft' }); // Cambiar a borrador
            if (error) throw error;
            toast({ title: 'Post rechazado', description: `"${post.title}" ha sido movido a borrador.` });
            fetchPendingPosts();
        } catch (error) {
            toast({ title: 'Error al rechazar post', description: error.message, variant: 'destructive' });
        }
    };

    const handleDelete = async () => {
        if (!deleteCandidate) return;
        try {
            const { error } = await deletePost(deleteCandidate.id, deleteCandidate.title, true);
            if (error) throw error;
            toast({ title: 'Post eliminado', description: `"${deleteCandidate.title}" ha sido eliminado.` });
            fetchPendingPosts();
        } catch (error) {
            toast({ title: 'Error al eliminar post', description: error.message, variant: 'destructive' });
        } finally {
            setDeleteCandidate(null);
        }
    };

    const getPostPath = (post) => {
        const sectionSlug = post.sections?.slug || 'blog';
        return `/${sectionSlug}/${post.slug}`;
    };

    if (!canPublish) {
        return <p className="text-center text-red-500">No tienes permisos para gestionar posts pendientes.</p>;
    }

    return (
        <div className="space-y-4">
            <h2 className="text-3xl font-bold mb-8">Posts Pendientes de Aprobación</h2>
            {loading ? (
                <p>Cargando posts pendientes...</p>
            ) : pendingPosts.length > 0 ? (
                pendingPosts.map(post => (
                    <div key={post.id} className="glass-effect p-4 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex-grow">
                            <Link to={`/control-panel-7d8a2b3c4f5e/edit/${post.slug}`} className="font-bold text-lg hover:underline">{post.title}</Link>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                                <StatusBadge status={post.status} />
                                <span>{post.categories?.name || 'Sin categoría'}</span>
                                <span>{format(new Date(post.created_at), "d MMM yyyy", { locale: es })}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <Link to={getPostPath(post)} target="_blank" rel="noopener noreferrer">
                                <Button variant="outline" size="icon" className="h-9 w-9">
                                    <Eye className="w-4 h-4" />
                                </Button>
                            </Link>
                            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => navigate(`/control-panel-7d8a2b3c4f5e/edit/${post.slug}`)}>
                                <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="success" size="icon" className="h-9 w-9" onClick={() => handleApprove(post)}>
                                <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button variant="destructive" size="icon" className="h-9 w-9" onClick={() => handleReject(post)}>
                                <XCircle className="w-4 h-4" />
                            </Button>
                            <AlertDialog open={!!deleteCandidate && deleteCandidate.id === post.id} onOpenChange={(open) => !open && setDeleteCandidate(null)}>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="icon" className="h-9 w-9" onClick={() => setDeleteCandidate(post)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>¿Confirmas la eliminación?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Esta acción es irreversible y eliminará permanentemente el recurso "{post.title}".
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleDelete}>Eliminar</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>
                ))
            ) : (
                <p className="text-center text-muted-foreground py-10">No hay posts pendientes de aprobación.</p>
            )}
        </div>
    );
};

export default ManagePendingPosts;