import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ManagePostsList from '@/pages/admin/ManagePostsList';
import ManageCategories from '@/pages/admin/ManageCategories';
import ManageSubcategories from '@/pages/admin/ManageSubcategories';
import ManageSections from '@/pages/admin/ManageSections';
import { Search, Filter, Check, X, ShieldAlert, Loader2, Edit } from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { getPendingEdits, updatePostEditStatus, updatePost } from '@/lib/supabase/posts';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { getSubcategories } from '@/lib/supabase/subcategories';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Link } from 'react-router-dom';

const ManageContent = ({ posts, categories, sections, onUpdate }) => {
    const { toast } = useToast();
    const { user, permissions } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortOrder, setSortOrder] = useState('date-desc');
    const [pendingEdits, setPendingEdits] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [silentDelete, setSilentDelete] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const isAdmin = permissions?.['manage-content'];

    const fetchSubcategories = useCallback(async () => {
        const allSubcategories = await getSubcategories();
        setSubcategories(allSubcategories);
    }, []);

    const fetchPendingEdits = useCallback(async () => {
        if (isAdmin) {
            const edits = await getPendingEdits();
            setPendingEdits(edits);
        }
    }, [isAdmin]);

    useEffect(() => {
        fetchPendingEdits();
        fetchSubcategories();
    }, [fetchPendingEdits, fetchSubcategories]);

    const handleUpdateAll = () => {
        onUpdate();
        fetchSubcategories();
    };

    const handleReview = async (edit, newStatus) => {
        const { data: updatedEdit, error: updateError } = await updatePostEditStatus(edit.id, newStatus, user.id);
        if (updateError) {
            toast({ title: 'Error al revisar la edición', description: updateError.message, variant: 'destructive' });
            return;
        }

        if (newStatus === 'approved') {
            const finalData = { ...edit.proposed_data, status: 'published' };
            const { error: postUpdateError } = await updatePost(edit.post_id, finalData);
            if (postUpdateError) {
                toast({ title: 'Error al aplicar y publicar la edición', description: postUpdateError.message, variant: 'destructive' });
                await updatePostEditStatus(edit.id, 'pending', null);
                return;
            }
        }
        
        toast({ title: `Edición ${newStatus === 'approved' ? 'aprobada y publicada' : 'rechazada'}`, description: 'La revisión se ha completado.' });
        fetchPendingEdits();
        onUpdate();
    };

    const safePosts = Array.isArray(posts) ? posts : [];
    const safeCategories = Array.isArray(categories) ? categories : [];

    useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm, categoryFilter, statusFilter, sortOrder]);


    const filteredAndSortedPosts = useMemo(() => {
        let filtered = safePosts;

        if (!isAdmin) {
            filtered = filtered.filter(post => post.user_id === user.id);
        }

        if (searchTerm) {
            filtered = filtered.filter(post =>
                post.title.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (categoryFilter !== 'all') {
            filtered = filtered.filter(post => post.category_id === parseInt(categoryFilter));
        }

        if (statusFilter !== 'all') {
            filtered = filtered.filter(post => post.status === statusFilter);
        }

        const sorted = [...filtered].sort((a, b) => {
            switch (sortOrder) {
                case 'date-asc':
                    return new Date(a.created_at) - new Date(b.created_at);
                case 'title-asc':
                    return a.title.localeCompare(b.title);
                case 'title-desc':
                    return b.title.localeCompare(a.title);
                case 'date-desc':
                default:
                    return new Date(b.created_at) - new Date(a.created_at);
            }
        });

        return sorted;
    }, [safePosts, searchTerm, categoryFilter, statusFilter, sortOrder, isAdmin, user]);

    return (
        <div>
            <h2 className="text-3xl font-bold mb-8 text-center">Gestionar Contenido Existente</h2>
            
            {isAdmin && pendingEdits.length > 0 && (
                <div className="mb-8 p-4 glass-effect rounded-lg">
                    <h3 className="text-xl font-bold mb-4">Ediciones Pendientes de Revisión ({pendingEdits.length})</h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                        {pendingEdits.map(edit => (
                            <div key={edit.id} className="bg-background/50 p-3 rounded-md flex justify-between items-center">
                                <div>
                                    <p><span className="font-bold">{edit.posts.title}</span></p>
                                    <p className="text-sm text-gray-400">Editado por: {edit.editor.email}</p>
                                </div>
                                <div className="flex gap-2">
                                    <Link to={`/control-panel-7d8a2b3c4f5e/edit/${edit.posts.slug}`}>
                                        <Button size="sm" variant="outline"><Edit className="w-4 h-4 mr-2" />Revisar y Editar</Button>
                                    </Link>
                                    <Button size="sm" variant="default" onClick={() => handleReview(edit, 'approved')}><Check className="w-4 h-4 mr-2" />Aprobar y Publicar</Button>
                                    <Button size="sm" variant="destructive" onClick={() => handleReview(edit, 'rejected')}><X className="w-4 h-4 mr-2" />Rechazar</Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid lg:grid-cols-3 gap-16">
                <div className="lg:col-span-2">
                    <div className="mb-6 p-4 glass-effect rounded-lg">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Filter className="w-5 h-5" />Filtros y Búsqueda</h3>
                        <div className="space-y-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar por título..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 bg-input border-border"
                                />
                            </div>
                            <div className="grid sm:grid-cols-3 gap-4">
                                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                    <SelectTrigger className="bg-input border-border">
                                        <SelectValue placeholder="Categoría" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todas las categorías</SelectItem>
                                        {safeCategories.map(cat => (
                                            <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="bg-input border-border">
                                        <SelectValue placeholder="Estado" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos los estados</SelectItem>
                                        <SelectItem value="published">Publicado</SelectItem>
                                        <SelectItem value="draft">Borrador</SelectItem>
                                        {isAdmin && <SelectItem value="scheduled">Programado</SelectItem>}
                                        {isAdmin && <SelectItem value="pending_approval">Pendiente</SelectItem>}
                                    </SelectContent>
                                </Select>
                                <Select value={sortOrder} onValueChange={setSortOrder}>
                                    <SelectTrigger className="bg-input border-border">
                                        <SelectValue placeholder="Ordenar por" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="date-desc">Más recientes</SelectItem>
                                        <SelectItem value="date-asc">Más antiguos</SelectItem>
                                        <SelectItem value="title-asc">Título (A-Z)</SelectItem>
                                        <SelectItem value="title-desc">Título (Z-A)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                             {isAdmin && (
                                <div className="flex items-center space-x-2 pt-4 border-t border-border/50">
                                    <ShieldAlert className="w-5 h-5 text-yellow-400" />
                                    <Label htmlFor="silent-delete-switch" className="font-bold">Eliminación Silenciosa</Label>
                                    <Switch
                                        id="silent-delete-switch"
                                        checked={silentDelete}
                                        onCheckedChange={setSilentDelete}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                    {isLoading ? (
                        <div className="flex justify-center items-center h-40">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            <p className="ml-4 text-muted-foreground">Cargando recursos...</p>
                        </div>
                    ) : (
                        <ManagePostsList posts={filteredAndSortedPosts} onUpdate={onUpdate} silentDelete={silentDelete} />
                    )}
                </div>
                {isAdmin && (
                  <div className="space-y-8">
                    <ManageSections sections={sections} onUpdate={handleUpdateAll} />
                    <ManageCategories categories={safeCategories} sections={sections} onUpdate={handleUpdateAll} />
                    <ManageSubcategories categories={safeCategories} subcategories={subcategories} onUpdate={fetchSubcategories} />
                  </div>
                )}
            </div>
        </div>
    );
};

export default ManageContent;