import React from 'react';
import { useToast } from '@/components/ui/use-toast';
import { deletePost } from '@/lib/supabase/posts';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Eye, Edit, Trash2, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

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

const ManagePostsList = ({ posts, onUpdate, silentDelete }) => {
    const { toast } = useToast();
    const { permissions } = useAuth();
    const isAdmin = permissions?.['manage-content'];

    const handleDelete = async (postId, postTitle) => {
        const { error } = await deletePost(postId, postTitle, !silentDelete);
        if (error) {
            toast({ title: 'Error al eliminar', description: error.message, variant: 'destructive' });
        } else {
            toast({ title: 'Recurso eliminado', description: `"${postTitle}" ha sido eliminado.` });
            onUpdate();
        }
    };
    
    const getPostPath = (post) => {
        const sectionSlug = post.sections?.slug || 'blog'; // Fallback a 'blog' si no hay sección
        return `/${sectionSlug}/${post.slug}`;
    };

    return (
        <div className="space-y-4">
            {posts.length > 0 ? (
                posts.map(post => (
                    <div key={post.id} className="glass-effect p-4 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex-grow">
                            <Link to={`/control-panel-7d8a2b3c4f5e/edit/${post.slug}`} className="font-bold text-lg hover:underline">{post.title}</Link>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                                <StatusBadge status={post.status} />
                                <span>{post.categories?.name || 'Sin categoría'}</span>
                                <span>{format(new Date(post.created_at), "d MMM yyyy", { locale: es })}</span>
                                {post.status === 'scheduled' && post.published_at && (
                                    <span className="flex items-center gap-1 text-blue-400">
                                        <Clock className="w-3 h-3" /> 
                                        {format(new Date(post.published_at), "d MMM yyyy, HH:mm", { locale: es })}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <Link to={getPostPath(post)} target="_blank" rel="noopener noreferrer">
                                <Button variant="outline" size="icon" className="h-9 w-9">
                                    <Eye className="w-4 h-4" />
                                </Button>
                            </Link>
                            <Link to={`/control-panel-7d8a2b3c4f5e/edit/${post.slug}`}>
                                <Button variant="ghost" size="icon" className="h-9 w-9">
                                    <Edit className="w-4 h-4" />
                                </Button>
                            </Link>
                            {isAdmin && (
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" size="icon" className="h-9 w-9">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>¿Confirmas la eliminación?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Esta acción es irreversible y eliminará permanentemente el recurso "{post.title}".
                                                {silentDelete && <span className="block mt-2 font-bold text-yellow-400">La eliminación no será registrada.</span>}
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDelete(post.id, post.title)}>Eliminar</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            )}
                        </div>
                    </div>
                ))
            ) : (
                <p className="text-center text-muted-foreground py-10">No se encontraron recursos con los filtros actuales.</p>
            )}
        </div>
    );
};

export default ManagePostsList;