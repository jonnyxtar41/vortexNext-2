import React, { useState, useMemo } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Edit, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { addSubcategory, updateSubcategory, deleteSubcategory, getPostCountForSubcategory, reassignPostsSubcategory } from '@/lib/supabase/subcategories';

const ManageSubcategories = ({ categories, subcategories, onUpdate }) => {
    const { toast } = useToast();
    const [newSubcategoryName, setNewSubcategoryName] = useState('');
    const [newParentCategory, setNewParentCategory] = useState('');
    const [editingSubcategory, setEditingSubcategory] = useState(null);
    const [deleteCandidate, setDeleteCandidate] = useState(null);
    const [reassignTo, setReassignTo] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');

    const handleAddSubcategory = async (e) => {
        e.preventDefault();
        if (!newSubcategoryName.trim() || !newParentCategory) {
            toast({ title: "❌ Faltan datos", description: "Nombre y categoría son requeridos.", variant: "destructive" });
            return;
        }
        const { error } = await addSubcategory({ name: newSubcategoryName, category_id: newParentCategory });
        if (error) {
            toast({ title: "❌ Error al añadir", description: error.message, variant: "destructive" });
        } else {
            onUpdate();
            setNewSubcategoryName('');
            setNewParentCategory('');
            toast({ title: "✅ Subcategoría añadida" });
        }
    };

    const handleUpdateSubcategory = async () => {
        if (!editingSubcategory.name.trim()) {
            toast({ title: "❌ El nombre no puede estar vacío", variant: "destructive" });
            return;
        }
        const updates = { name: editingSubcategory.name, category_id: editingSubcategory.category_id };
        const { error } = await updateSubcategory(editingSubcategory.id, updates);
        if (error) {
            toast({ title: "❌ Error al actualizar", description: error.message, variant: "destructive" });
        } else {
            onUpdate();
            setEditingSubcategory(null);
            toast({ title: "✅ Subcategoría actualizada" });
        }
    };

    const attemptDelete = async (subcategory) => {
        const postCount = await getPostCountForSubcategory(subcategory.id);
        setDeleteCandidate({ ...subcategory, postCount });
    };

    const handleConfirmDelete = async () => {
        if (!deleteCandidate) return;
        if (deleteCandidate.postCount > 0) {
            if (!reassignTo) {
                toast({ title: "Reasignación requerida", description: "Debes seleccionar una nueva subcategoría.", variant: "destructive" });
                return;
            }
            const { error: reassignError } = await reassignPostsSubcategory(deleteCandidate.id, reassignTo);
            if (reassignError) {
                toast({ title: "Error al reasignar", description: reassignError.message, variant: "destructive" });
                return;
            }
        }
        const { error: deleteError } = await deleteSubcategory(deleteCandidate.id, deleteCandidate.name);
        if (deleteError) {
            toast({ title: "Error al eliminar", description: deleteError.message, variant: "destructive" });
        } else {
            toast({ title: "Subcategoría eliminada" });
            onUpdate();
        }
        setDeleteCandidate(null);
        setReassignTo('');
    };

    const filteredSubcategories = useMemo(() => {
        return subcategories
            .filter(sub => categoryFilter === 'all' || sub.category_id === parseInt(categoryFilter))
            .filter(sub => sub.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [subcategories, categoryFilter, searchTerm]);

    return (
        <div className="p-4 glass-effect rounded-lg">
            <h3 className="text-2xl font-bold mb-4">Gestionar Subcategorías</h3>
            <form onSubmit={handleAddSubcategory} className="space-y-4 mb-6">
                <Input value={newSubcategoryName} onChange={(e) => setNewSubcategoryName(e.target.value)} placeholder="Nombre de subcategoría" className="bg-input border-border" />
                <Select value={newParentCategory} onValueChange={setNewParentCategory}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar categoría padre" /></SelectTrigger>
                    <SelectContent>
                        {categories.map(cat => <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Button type="submit" className="w-full">Añadir Subcategoría</Button>
            </form>

            <div className="space-y-4 mb-4">
                <Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Buscar subcategoría..." className="bg-input border-border" />
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger><SelectValue placeholder="Filtrar por categoría" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todas las categorías</SelectItem>
                        {categories.map(cat => <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            
            <div className="space-y-3 max-h-60 overflow-y-auto pr-3">
                {filteredSubcategories.map(sub => (
                    <div key={sub.id} className="bg-background/50 p-3 rounded-lg flex justify-between items-center">
                        <div>
                            <p>{sub.name}</p>
                            <p className="text-xs text-gray-400">{sub.categories?.name || 'Categoría no encontrada'}</p>
                        </div>
                        <div className="flex gap-2">
                            <Dialog onOpenChange={(open) => !open && setEditingSubcategory(null)}>
                                <DialogTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingSubcategory({ ...sub, category_id: String(sub.category_id) })}><Edit className="w-4 h-4" /></Button></DialogTrigger>
                                {editingSubcategory && editingSubcategory.id === sub.id && (
                                    <DialogContent>
                                        <DialogHeader><DialogTitle>Editar Subcategoría</DialogTitle></DialogHeader>
                                        <div className="space-y-4">
                                            <Input value={editingSubcategory.name} onChange={(e) => setEditingSubcategory(c => ({ ...c, name: e.target.value }))} placeholder="Nombre" />
                                            <Select value={editingSubcategory.category_id} onValueChange={(value) => setEditingSubcategory(c => ({ ...c, category_id: value }))}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    {categories.map(cat => <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <DialogFooter>
                                            <DialogClose asChild><Button type="button" variant="secondary">Cancelar</Button></DialogClose>
                                            <Button onClick={handleUpdateSubcategory}>Guardar</Button>
                                        </DialogFooter>
                                    </DialogContent>
                                )}
                            </Dialog>
                            <AlertDialog open={!!deleteCandidate && deleteCandidate.id === sub.id} onOpenChange={(open) => { if (!open) { setDeleteCandidate(null); setReassignTo(''); } }}>
                                <AlertDialogTrigger asChild><Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => attemptDelete(sub)}><Trash2 className="w-4 h-4" /></Button></AlertDialogTrigger>
                                {deleteCandidate && deleteCandidate.id === sub.id && (
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>¿Confirmas la eliminación?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                {deleteCandidate.postCount > 0 ? `La subcategoría "${deleteCandidate.name}" tiene ${deleteCandidate.postCount} posts. Debes reasignarlos.` : `Se eliminará la subcategoría "${deleteCandidate.name}".`}
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        {deleteCandidate.postCount > 0 && (
                                            <div className="py-4 space-y-2">
                                                <Label>Reasignar a:</Label>
                                                <Select onValueChange={setReassignTo} value={reassignTo}>
                                                    <SelectTrigger><SelectValue placeholder="Selecciona subcategoría" /></SelectTrigger>
                                                    <SelectContent>
                                                        {subcategories.filter(s => s.id !== deleteCandidate.id && s.category_id === deleteCandidate.category_id).map(s => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
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

export default ManageSubcategories;