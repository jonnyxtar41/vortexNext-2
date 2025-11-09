// app/components/admin/ManageSections.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '@/app/components/ui/use-toast';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Edit, Trash2, GripVertical, PlusCircle, Save } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogClose } from '@/app/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/app/components/ui/alert-dialog";
import { addSection, updateSection, deleteSection, getPostCountForSection, getCategoryCountForSection, updateMultipleSections } from '@/app/lib/supabase/sections';
import { Switch } from '@/app/components/ui/switch';
import { Label } from '@/app/components/ui/label';
import * as Icons from 'lucide-react';

const ManageSections = ({ sections: initialSections, onUpdate }) => {
    const { toast } = useToast();
    const [sections, setSections] = useState(initialSections);
    const [newSectionName, setNewSectionName] = useState('');
    const [newSectionSlug, setNewSectionSlug] = useState('');
    const [newSectionIcon, setNewSectionIcon] = useState('FileText');
    const [editingSection, setEditingSection] = useState(null);
    const [deleteCandidate, setDeleteCandidate] = useState(null);

    useEffect(() => {
        setSections(initialSections.sort((a, b) => a.order - b.order));
    }, [initialSections]);

    const generateSlug = (str) => str.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');

    useEffect(() => {
        setNewSectionSlug(generateSlug(newSectionName));
    }, [newSectionName]);

    const handleAddSection = async (e) => {
        e.preventDefault();
        if (!newSectionName.trim() || !newSectionSlug.trim()) {
            toast({ title: "❌ Datos incompletos", variant: "destructive" });
            return;
        }
        const { error } = await addSection({ name: newSectionName, slug: newSectionSlug, icon: newSectionIcon, order: sections.length });
        if (error) {
            toast({ title: "❌ Error al añadir sección", description: error.message, variant: "destructive" });
        } else {
            onUpdate();
            setNewSectionName('');
            setNewSectionSlug('');
            setNewSectionIcon('FileText');
            toast({ title: "✅ Sección añadida" });
        }
    };

    const handleUpdateSection = async () => {
        if (!editingSection.name.trim()) {
            toast({ title: "❌ El nombre no puede estar vacío", variant: "destructive" });
            return;
        }
        const { error } = await updateSection(editingSection.id, { name: editingSection.name, slug: editingSection.slug, icon: editingSection.icon });
        if (error) {
            toast({ title: "❌ Error al actualizar", description: error.message, variant: "destructive" });
        } else {
            onUpdate();
            setEditingSection(null);
            toast({ title: "✅ Sección actualizada" });
        }
    };

    const attemptDelete = async (section) => {
        const postCount = await getPostCountForSection(section.id);
        const categoryCount = await getCategoryCountForSection(section.id);
        if (postCount > 0 || categoryCount > 0) {
            setDeleteCandidate({ ...section, postCount, categoryCount, error: true });
        } else {
            setDeleteCandidate({ ...section, postCount: 0, categoryCount: 0, error: false });
        }
    };

    const handleConfirmDelete = async () => {
        if (!deleteCandidate || deleteCandidate.error) return;
        const { error } = await deleteSection(deleteCandidate.id, deleteCandidate.name);
        if (error) {
            toast({ title: "Error al eliminar", description: error.message, variant: "destructive" });
        } else {
            toast({ title: "Sección eliminada" });
            onUpdate();
        }
        setDeleteCandidate(null);
    };

    const handleIsMainChange = (id, is_main) => {
        const mainCount = sections.filter(s => s.is_main).length;
        if (is_main && mainCount >= 3) {
            toast({ title: "Límite alcanzado", description: "Solo puedes tener 3 secciones principales.", variant: "destructive" });
            return;
        }
        setSections(sections.map(s => s.id === id ? { ...s, is_main } : s));
    };

    const handleSaveChanges = async () => {
        const mainCount = sections.filter(s => s.is_main).length;
        if (mainCount !== 3) {
            toast({ title: "Selección inválida", description: "Debes seleccionar exactamente 3 secciones principales.", variant: "destructive" });
            return;
        }
        const sectionsToUpdate = sections.map((s, index) => ({ ...s, order: index }));
        const { error } = await updateMultipleSections(sectionsToUpdate);
        if (error) {
            toast({ title: "Error al guardar cambios", description: error.message, variant: "destructive" });
        } else {
            toast({ title: "✅ Cambios guardados", description: "El orden y las secciones principales han sido actualizados." });
            onUpdate();
        }
    };

    const iconList = Object.keys(Icons).filter(key => !['createReactComponent', 'icons', 'LucideProps', 'LucideIcon'].includes(key));

    return (
        <div className="p-4 glass-effect rounded-lg">
            <h3 className="text-2xl font-bold mb-4">Gestionar Secciones</h3>
            
            <div className="space-y-3 mb-6">
                {sections.map(sec => (
                    <div key={sec.id} className="bg-background/50 p-3 rounded-lg flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <GripVertical className="w-5 h-5 text-gray-400 cursor-grab" />
                            <Switch id={`main-${sec.id}`} checked={sec.is_main} onCheckedChange={(checked) => handleIsMainChange(sec.id, checked)} />
                            <p>{sec.name}</p>
                        </div>
                        <div className="flex gap-2">
                            <Dialog onOpenChange={(open) => !open && setEditingSection(null)}>
                                <DialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingSection({...sec})}><Edit className="w-4 h-4" /></Button>
                                </DialogTrigger>
                                {editingSection && editingSection.id === sec.id && (
                                    <DialogContent>
                                        <DialogHeader><DialogTitle>Editar Sección</DialogTitle></DialogHeader>
                                        <div className="space-y-4">
                                            <Input value={editingSection.name} onChange={(e) => setEditingSection(s => ({...s, name: e.target.value, slug: generateSlug(e.target.value)}))} placeholder="Nombre" />
                                            <Input value={editingSection.slug} disabled placeholder="Slug" />
                                            <Label>Icono</Label>
                                            <select value={editingSection.icon} onChange={(e) => setEditingSection(s => ({...s, icon: e.target.value}))} className="w-full p-2 bg-input border-border rounded-md">
                                                {iconList.map(iconName => <option key={iconName} value={iconName}>{iconName}</option>)}
                                            </select>
                                        </div>
                                        <DialogFooter>
                                            <DialogClose asChild><Button type="button" variant="secondary">Cancelar</Button></DialogClose>
                                            <Button onClick={handleUpdateSection}>Guardar</Button>
                                        </DialogFooter>
                                    </DialogContent>
                                )}
                            </Dialog>
                            <AlertDialog open={!!deleteCandidate && deleteCandidate.id === sec.id} onOpenChange={(open) => !open && setDeleteCandidate(null)}>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => attemptDelete(sec)}><Trash2 className="w-4 h-4" /></Button>
                                </AlertDialogTrigger>
                                {deleteCandidate && deleteCandidate.id === sec.id && (
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>¿Confirmas la eliminación?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                {deleteCandidate.error ? `No se puede eliminar. La sección tiene ${deleteCandidate.postCount} posts y ${deleteCandidate.categoryCount} categorías.` : `Se eliminará la sección "${deleteCandidate.name}".`}
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                            {!deleteCandidate.error && <AlertDialogAction onClick={handleConfirmDelete}>Eliminar</AlertDialogAction>}
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                )}
                            </AlertDialog>
                        </div>
                    </div>
                ))}
            </div>
            <Button onClick={handleSaveChanges} className="w-full mb-6"><Save className="w-4 h-4 mr-2" /> Guardar Orden y Principales</Button>

            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="outline" className="w-full"><PlusCircle className="w-4 h-4 mr-2" /> Añadir Nueva Sección</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader><DialogTitle>Añadir Nueva Sección</DialogTitle></DialogHeader>
                    <form onSubmit={handleAddSection} className="space-y-4">
                        <Input value={newSectionName} onChange={(e) => setNewSectionName(e.target.value)} placeholder="Nombre de la sección" />
                        <Input value={newSectionSlug} disabled placeholder="Slug (auto-generado)" />
                        <Label>Icono</Label>
                        <select value={newSectionIcon} onChange={(e) => setNewSectionIcon(e.target.value)} className="w-full p-2 bg-input border-border rounded-md">
                            {iconList.map(iconName => <option key={iconName} value={iconName}>{iconName}</option>)}
                        </select>
                        <DialogFooter>
                            <DialogClose asChild><Button type="button" variant="secondary">Cancelar</Button></DialogClose>
                            <Button type="submit">Añadir</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ManageSections;
