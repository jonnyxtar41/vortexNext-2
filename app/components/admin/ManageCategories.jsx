// app/components/admin/ManageCategories.jsx
'use client';

import React, { useState } from 'react';
import { useToast } from '@/app/components/ui/use-toast';
import  Button  from '@/app/components/ui/button';
import  Input from '@/app/components/ui/input';
import  Label from '@/app/components/ui/label';
import { Edit, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogClose } from '@/app/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/app/components/ui/alert-dialog";
import { addCategory, updateCategory, deleteCategory, getPostCountForCategory, reassignPostsCategory } from '@/app/lib/supabase/categories';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';

const ManageCategories = ({ categories, sections, onUpdate }) => {
    const { toast } = useToast();
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategorySection, setNewCategorySection] = useState('');
    const [editingCategory, setEditingCategory] = useState(null);
    const [deleteCandidate, setDeleteCandidate] = useState(null);
    const [reassignTo, setReassignTo] = useState('');

    const handleAddCategory = async (e) => {
        e.preventDefault();
        if (!newCategoryName.trim() || !newCategorySection) {
            toast({ title: "❌ Datos incompletos", description: "El nombre y la sección son obligatorios.", variant: "destructive" });
            return;
        }
        const { error } = await addCategory({ name: newCategoryName, gradient: 'from-indigo-500 to-purple-500', section_id: newCategorySection });
        if (error) {
            toast({ title: "❌ Error al añadir categoría", description: error.message, variant: "destructive" });
        } else {
            onUpdate();
            setNewCategoryName('');
            setNewCategorySection('');
            toast({ title: "✅ Categoría añadida" });
        }
    };

    const handleUpdateCategory = async () => {
        if (!editingCategory.name.trim()) {
            toast({ title: "❌ El nombre no puede estar vacío", variant: "destructive" });
            return;
        }
        const { error } = await updateCategory(editingCategory.id, { name: editingCategory.name, section_id: editingCategory.section_id });
        if (error) {
            toast({ title: "❌ Error al actualizar", description: error.message, variant: "destructive" });
        } else {
            onUpdate();
            setEditingCategory(null);
            toast({ title: "✅ Categoría actualizada" });
        }
    };

    const attemptDelete = async (category) => {
        const postCount = await getPostCountForCategory(category.id);
        if (postCount > 0) {
            setDeleteCandidate({ ...category, postCount });
        } else {
            setDeleteCandidate({ ...category, postCount: 0 });
        }
    };

    const handleConfirmDelete = async () => {
        if (!deleteCandidate) return;

        if (deleteCandidate.postCount > 0) {
            if (!reassignTo) {
                toast({ title: "Reasignación requerida", description: "Debes seleccionar una nueva categoría para los posts.", variant: "destructive" });
                return;
            }
            const { error: reassignError } = await reassignPostsCategory(deleteCandidate.id, reassignTo);
            if (reassignError) {
                toast({ title: "Error al reasignar posts", description: reassignError.message, variant: "destructive" });
                return;
            }
            toast({ title: "Posts reasignados", description: `Los ${deleteCandidate.postCount} posts han sido movidos.` });
        }
        
        const { error: deleteError } = await deleteCategory(deleteCandidate.id, deleteCandidate.name);
        if (deleteError) {
            toast({ title: "Error al eliminar", description: deleteError.message, variant: "destructive" });
        } else {
            toast({ title: "Categoría eliminada", description: `La categoría "${deleteCandidate.name}" ha sido eliminada.` });
            onUpdate();
        }
        setDeleteCandidate(null);
        setReassignTo('');
    };

    return (
        <div className="p-4 glass-effect rounded-lg">
            <h3 className="text-2xl font-bold mb-4">Gestionar Categorías</h3>
            <form onSubmit={handleAddCategory} className="space-y-4 mb-6">
                <Input value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="Nombre de la nueva categoría" className="bg-input border-border" />
                <Select value={newCategorySection} onValueChange={setNewCategorySection}>
                    <SelectTrigger>
                        <SelectValue placeholder="Selecciona una sección" />
                    </SelectTrigger>
                    <SelectContent>
                        {sections.map(sec => (
                            <SelectItem key={sec.id} value={String(sec.id)}>{sec.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Button type="submit" className="w-full">Añadir Categoría</Button>
            </form>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-3">
                {categories.map(cat => (
                    <div key={cat.id} className="bg-background/50 p-3 rounded-lg flex justify-between items-center">
                        <div>
                            <p>{cat.name}</p>
                            <p className="text-xs text-gray-400">{cat.sections?.name || 'Sin sección'}</p>
                        </div>
                        <div className="flex gap-2">
                            <Dialog onOpenChange={(open) => !open && setEditingCategory(null)}>
                                <DialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingCategory({...cat, section_id: String(cat.section_id)})}><Edit className="w-4 h-4" /></Button>
                                </DialogTrigger>
                                {editingCategory && editingCategory.id === cat.id && (
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Editar Categoría</DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4">
                                            <Input value={editingCategory.name} onChange={(e) => setEditingCategory(c => ({...c, name: e.target.value}))} className="bg-input border-border" placeholder="Nombre de categoría" />
                                            <Select value={editingCategory.section_id} onValueChange={(value) => setEditingCategory(c => ({ ...c, section_id: value }))}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecciona una sección" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {sections.map(sec => (
                                                        <SelectItem key={sec.id} value={String(sec.id)}>{sec.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <DialogFooter>
                                            <DialogClose asChild><Button type="button" variant="secondary">Cancelar</Button></DialogClose>
                                            <Button onClick={handleUpdateCategory}>Guardar Cambios</Button>
                                        </DialogFooter>
                                    </DialogContent>
                                )}
                            </Dialog>
                            <AlertDialog open={!!deleteCandidate && deleteCandidate.id === cat.id} onOpenChange={(open) => {if(!open) {setDeleteCandidate(null); setReassignTo('');}}}>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => attemptDelete(cat)}><Trash2 className="w-4 h-4" /></Button>
                                </AlertDialogTrigger>
                                {deleteCandidate && deleteCandidate.id === cat.id && (
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>¿Confirmas la eliminación?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                {deleteCandidate.postCount > 0 ? (
                                                    <span>
                                                        La categoría <strong>"{deleteCandidate.name}"</strong> tiene <strong>{deleteCandidate.postCount}</strong> posts asociados. Debes reasignarlos a otra categoría antes de eliminarla.
                                                    </span>
                                                ) : (
                                                    <span>Esta acción eliminará permanentemente la categoría <strong>"{deleteCandidate.name}"</strong>.</span>
                                                )}
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        
                                        {deleteCandidate.postCount > 0 && (
                                            <div className="py-4 space-y-2">
                                                <Label htmlFor="reassign-category">Reasignar posts a:</Label>
                                                <Select onValueChange={setReassignTo} value={reassignTo}>
                                                    <SelectTrigger id="reassign-category">
                                                        <SelectValue placeholder="Selecciona una categoría" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {categories.filter(c => c.id !== deleteCandidate.id).map(c => (
                                                            <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}

                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                            <AlertDialogAction onClick={handleConfirmDelete} disabled={deleteCandidate.postCount > 0 && !reassignTo}>
                                                {deleteCandidate.postCount > 0 ? 'Reasignar y Eliminar' : 'Eliminar'}
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                )}
                            </AlertDialog>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ManageCategories;
