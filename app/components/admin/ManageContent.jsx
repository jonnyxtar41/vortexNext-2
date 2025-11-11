// app/components/admin/ManageContent.jsx
'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Input } from '@/app/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import ManagePostsList from '@/app/components/admin/ManagePostsList';
import ManageCategories from '@/app/components/admin/ManageCategories';
import ManageSubcategories from '@/app/components/admin/ManageSubcategories';
import ManageSections from '@/app/components/admin/ManageSections';
import { Search, Filter, Check, X, ShieldAlert, Loader2, Edit } from 'lucide-react';
import { useAuth } from '@/app/contexts/SupabaseAuthContext';

import { getPosts, getPendingEdits } from '@/app/lib/supabase/client';
import { updatePostEditStatusAction } from '@/app/actions/posts';
import { updatePost } from '@/app/lib/actions/post-actions';
import { getCategories } from '@/app/lib/supabase/categories';
import { getSections } from '@/app/lib/supabase/sections';
import { Button } from '@/app/components/ui/button';
import { useToast } from '@/app/components/ui/use-toast';
import { getSubcategories } from '@/app/lib/supabase/subcategories';
import { Switch } from '@/app/components/ui/switch';
import { Label } from '@/app/components/ui/label';
import Link from 'next/link';
import { createClient } from '@/app/utils/supabase/client';

const supabase = createClient();

const ManageContent = () => {
    const { toast } = useToast();
    const { user, permissions } = useAuth();
    
    // Data states
    const [posts, setPosts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [sections, setSections] = useState([]);
    const [pendingEdits, setPendingEdits] = useState([]);
    const [subcategories, setSubcategories] = useState([]);

    // UI/Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortOrder, setSortOrder] = useState('date-desc');
    const [silentDelete, setSilentDelete] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const isAdmin = permissions?.['manage-content'];

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [postsData, categoriesData, sectionsData, subcategoriesData] = await Promise.all([
                getPosts(supabase, { limit: 1000, includeDrafts: true, includePending: true }),
                getCategories(supabase),
                getSections(supabase),
                getSubcategories(supabase)
            ]);
            setPosts(postsData.data || []);
            setCategories(categoriesData || []);
            setSections(sectionsData || []);
            setSubcategories(subcategoriesData || []);

            if (isAdmin) {
                const edits = await getPendingEdits(supabase);
                setPendingEdits(edits);
            }
        } catch (error) {
            toast({ title: "Error al cargar datos", description: error.message, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }, [isAdmin, toast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleUpdateAll = () => {
        fetchData();
    };

    const handleReview = async (edit, newStatus) => {
        const { error: updateError } = await updatePostEditStatusAction(edit.id, newStatus);
        if (updateError) {
            toast({ title: 'Error al revisar la edición', description: updateError.message, variant: 'destructive' });
            return;
        }

        if (newStatus === 'approved') {
            const { error: publishError } = await updatePost(edit.post_id, { content: edit.content, status: 'published' });
            if (publishError) {
                toast({ title: 'Error al aplicar y publicar la edición', description: publishError.message, variant: 'destructive' });
                // Revert the status on failure
                await updatePostEditStatusAction(edit.id, 'pending');
                return;
            }
        }
        
        toast({ title: `Edición ${newStatus === 'approved' ? 'aprobada y publicada' : 'rechazada'}`, description: 'La revisión se ha completado.' });
        handleUpdateAll();
    };

    const filteredAndSortedPosts = useMemo(() => {
        let filtered = posts;

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
    }, [posts, searchTerm, categoryFilter, statusFilter, sortOrder, isAdmin, user]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="ml-4 text-muted-foreground">Cargando contenido...</p>
            </div>
        );
    }

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
                                    <Link href={`/control-panel-7d8a2b3c4f5e/edit-post/${edit.posts.slug}`}>
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
                                        {categories.map(cat => (
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
                    <ManagePostsList posts={filteredAndSortedPosts} onUpdate={handleUpdateAll} silentDelete={silentDelete} />
                </div>
                {isAdmin && (
                  <div className="space-y-8">
                    <ManageSections sections={sections} onUpdate={handleUpdateAll} />
                    <ManageCategories categories={categories} sections={sections} onUpdate={handleUpdateAll} />
                    <ManageSubcategories categories={categories} subcategories={subcategories} onUpdate={handleUpdateAll} />
                  </div>
                )}
            </div>
        </div>
    );
};

export default ManageContent;
