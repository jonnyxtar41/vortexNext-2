// app/control-panel-7d8a2b3c4f5e/manage-site-content/ManageSiteContentClient.jsx
'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '@/app/components/ui/use-toast';
import Button  from '@/app/components/ui/button';
import Label  from '@/app/components/ui/label';
import  Input  from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Save, FileText, PlusCircle, Trash2, Upload, Bell, Image as ImageIcon, Search } from 'lucide-react';
import { getAllSiteContent, updateSiteContent } from '@/app/lib/supabase/siteContent';
import { uploadSiteAsset } from '@/app/lib/supabase/assets';
import { getSections, addSection, updateSection, deleteSection } from '@/app/lib/supabase/sections';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/app/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { allIcons } from '@/app/lib/icons.js';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import TiptapEditor from '@/app/components/TiptapEditor';

// 1. Aceptamos los datos iniciales como props
const ManageSiteContentClient = ({ initialContent, initialSections, onUpdate }) => {
    const { toast } = useToast();
    
    // 2. Hidratamos el estado con las props del servidor
    const [content, setContent] = useState(initialContent);
    const [sections, setSections] = useState(initialSections);
    
    // 3. El 'loading' inicial ya no es para la carga, solo para 'Guardando...'
    const [loading, setLoading] = useState(false); 
    
    const [editingSection, setEditingSection] = useState(null);
    const [iconImageFile, setIconImageFile] = useState(null);
    const [iconImagePreview, setIconImagePreview] = useState('');
    const [isIconSelectorOpen, setIsIconSelectorOpen] = useState(false);
    const [iconSearchTerm, setIconSearchTerm] = useState('');

    // Esta función se mantiene para *refrescar* los datos después de una acción
    const fetchAllData = async () => {
        setLoading(true);
        const [allContent, sectionsData] = await Promise.all([
            getAllSiteContent(),
            getSections(),
        ]);
        const contentMap = allContent.reduce((acc, item) => {
            acc[item.key] = item.value;
            return acc;
        }, {});
        setContent(contentMap);
        setSections(sectionsData);
        setLoading(false);
    };

    // 4. El useEffect de carga inicial SE ELIMINA
    // useEffect(() => {
    //     fetchAllData();
    // }, []);

    const handleContentChange = (key, value) => {
        setContent(prev => ({ ...prev, [key]: value }));
    };

    const handleSaveChanges = async () => {
        setLoading(true);
        try {
            await Promise.all(
                Object.entries(content).map(([key, value]) =>
                    updateSiteContent(key, value)
                )
            );
            toast({
                title: "✅ Contenido Guardado",
                description: "El contenido del sitio ha sido actualizado.",
            });
            if (onUpdate) onUpdate();
        } catch (error) {
            toast({
                title: "❌ Error al guardar",
                description: "No se pudo actualizar el contenido del sitio.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };
    
    const handleSectionFormChange = (e) => {
        const { name, value } = e.target;
        setEditingSection(prev => ({ ...prev, [name]: value }));
    };
    
    const generateSlug = (str) => {
      if (!str) return '';
      return str.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
    };

    const handleIconImageFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setIconImageFile(file);
            const previewUrl = URL.createObjectURL(file);
            setIconImagePreview(previewUrl);
            setEditingSection(prev => ({ ...prev, icon_image_url: '', icon: '' }));
        }
    };

    const handleSaveSection = async () => {
        if (!editingSection.name) {
            toast({ title: "❌ Falta el nombre", description: "El nombre de la sección es requerido.", variant: "destructive" });
            return;
        }
        if (!editingSection.icon && !editingSection.icon_image_url && !iconImageFile) {
            toast({ title: "❌ Falta el icono", description: "Debes seleccionar un icono o subir una imagen.", variant: "destructive" });
            return;
        }

        let sectionData = { ...editingSection };

        if (iconImageFile) {
            const imageUrl = await uploadSiteAsset(iconImageFile, `section-icons/${Date.now()}-${iconImageFile.name}`);
            if (imageUrl) {
                sectionData.icon_image_url = imageUrl;
                sectionData.icon = null; // Prioritize image over icon
            } else {
                toast({ title: "❌ Error al subir imagen", description: "No se pudo subir la imagen del icono.", variant: "destructive" });
                return;
            }
        }

        sectionData.slug = sectionData.slug ? generateSlug(sectionData.slug) : generateSlug(sectionData.name);
        
        let error;
        if (sectionData.id) {
            ({ error } = await updateSection(sectionData.id, sectionData));
        } else {
            ({ error } = await addSection(sectionData));
        }

        if (error) {
            toast({ title: "❌ Error", description: error.message, variant: "destructive" });
        } else {
            toast({ title: "✅ Sección guardada", description: `La sección "${sectionData.name}" ha sido guardada.` });
            setEditingSection(null);
            setIconImageFile(null);
            setIconImagePreview('');
            await fetchAllData(); // Refresca los datos
            if(onUpdate) onUpdate();
        }
    };

    const handleDeleteSection = async (sectionId, sectionName) => {
        const { error } = await deleteSection(sectionId, sectionName);
        if (error) {
            toast({ title: "❌ Error", description: "No se pudo eliminar la sección.", variant: "destructive" });
        } else {
            toast({ title: "🗑️ Sección eliminada" });
            await fetchAllData(); // Refresca los datos
            if(onUpdate) onUpdate();
        }
    };
    
    const openEditDialog = (section) => {
        setEditingSection(section);
        setIconImageFile(null);
        setIconImagePreview(section.icon_image_url || '');
    };

    const openNewDialog = () => {
        setEditingSection({ name: '', slug: '', icon: '', icon_image_url: '' });
        setIconImageFile(null);
        setIconImagePreview('');
    };
    
    const filteredIcons = useMemo(() => {
        return Object.entries(allIcons).filter(([name]) => 
            name.toLowerCase().includes(iconSearchTerm.toLowerCase())
        );
    }, [iconSearchTerm]);

    // 5. El estado de carga inicial SE ELIMINA
    // if (loading && Object.keys(content).length === 0) {
    //     return <p>Cargando contenido del sitio...</p>;
    // }

    const SelectedIcon = editingSection?.icon ? allIcons[editingSection.icon] : null;

    // Todo el JSX se mantiene 100% igual
    return (
        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4 flex items-center justify-center gap-3">
                    <FileText className="w-8 h-8 text-primary" />
                    Contenido y Estructura del Sitio
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                    Edita textos, secciones y configuraciones generales de tu plataforma.
                </p>
            </div>

            <div className="space-y-8">
                 <div className="glass-effect p-6 rounded-2xl">
                    <h3 className="text-xl font-semibold mb-4">Imágenes Globales</h3>
                    <div className="space-y-6">
                        <div className="grid md:grid-cols-[1fr_auto] items-center gap-4">
                            <div>
                                <Label htmlFor="site_logo">URL del Logo del Sitio</Label>
                                <Input id="site_logo" value={content.site_logo || ''} onChange={(e) => handleContentChange('site_logo', e.target.value)} className="mt-2 bg-black/30 border-white/20" />
                            </div>
                            {content.site_logo ? <img src={content.site_logo} alt="Logo Preview" className="h-10 w-auto bg-slate-700 p-1 rounded" /> : <div className="h-10 w-24 bg-slate-700 rounded flex items-center justify-center"><ImageIcon className="w-5 h-5 text-muted-foreground"/></div>}
                        </div>
                         <div className="grid md:grid-cols-[1fr_auto] items-center gap-4">
                            <div>
                                <Label htmlFor="site_favicon">URL del Favicon</Label>
                                <Input id="site_favicon" value={content.site_favicon || ''} onChange={(e) => handleContentChange('site_favicon', e.target.value)} className="mt-2 bg-black/30 border-white/20" />
                            </div>
                            {content.site_favicon ? <img src={content.site_favicon} alt="Favicon Preview" className="h-10 w-10 bg-slate-700 p-1 rounded" /> : <div className="h-10 w-10 bg-slate-700 rounded flex items-center justify-center"><ImageIcon className="w-5 h-5 text-muted-foreground"/></div>}
                        </div>
                        <div className="grid md:grid-cols-[1fr_auto] items-center gap-4">
                            <div>
                                <Label htmlFor="hero_image_url">URL de Imagen Principal (Home)</Label>
                                <Input id="hero_image_url" value={content.hero_image_url || ''} onChange={(e) => handleContentChange('hero_image_url', e.target.value)} className="mt-2 bg-black/30 border-white/20" />
                            </div>
                            {content.hero_image_url ? <img src={content.hero_image_url} alt="Hero Preview" className="h-10 w-auto bg-slate-700 p-1 rounded" /> : <div className="h-10 w-24 bg-slate-700 rounded flex items-center justify-center"><ImageIcon className="w-5 h-5 text-muted-foreground"/></div>}
                        </div>
                    </div>
                </div>

                <div className="glass-effect p-6 rounded-2xl">
                    <h3 className="text-xl font-semibold mb-4">Gestionar Secciones</h3>
                    <div className="space-y-4">
                        {sections.map(sec => (
                            <div key={sec.id} className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                                <div className="flex items-center gap-3">
                                  {sec.icon_image_url ? (
                                    <img src={sec.icon_image_url} alt={sec.name} className="w-5 h-5 object-contain" />
                                  ) : (
                                    sec.icon && allIcons[sec.icon] && React.createElement(allIcons[sec.icon], { className: "w-5 h-5 text-accent" })
                                  )}
                                  <span className="font-medium">{sec.name}</span>
                                  <span className="text-xs text-muted-foreground">/{sec.slug}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="sm" onClick={() => openEditDialog(sec)}>Editar</Button>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild><Button variant="destructive" size="sm">Eliminar</Button></AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader><AlertDialogTitle>¿Estás seguro?</AlertDialogTitle><AlertDialogDescription>Esta acción no se puede deshacer. Esto eliminará permanentemente la sección.</AlertDialogDescription></AlertDialogHeader>
                                            <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteSection(sec.id, sec.name)}>Eliminar</AlertDialogAction></AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </div>
                        ))}
                    </div>
                    <Button variant="outline" className="mt-6" onClick={openNewDialog}>
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Añadir Nueva Sección
                    </Button>
                </div>
                
                <Dialog open={!!editingSection} onOpenChange={(isOpen) => !isOpen && setEditingSection(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingSection?.id ? 'Editando' : 'Nueva'} Sección</DialogTitle>
                        </DialogHeader>
                        {editingSection && (
                            <div className="space-y-4 py-4">
                                <Input name="name" placeholder="Nombre de la sección" value={editingSection.name} onChange={handleSectionFormChange} className="bg-black/30 border-white/20" />
                                <Input name="slug" placeholder="Slug (auto-generado)" value={editingSection.slug} onChange={handleSectionFormChange} className="bg-black/30 border-white/20" />
                                
                                <div className="space-y-2">
                                    <Label>Icono</Label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Dialog open={isIconSelectorOpen} onOpenChange={setIsIconSelectorOpen}>
                                            <DialogTrigger asChild>
                                                <Button variant="outline" className="flex items-center gap-2">
                                                    {SelectedIcon ? <SelectedIcon className="w-4 h-4" /> : 'Seleccionar'}
                                                    <span>{editingSection.icon || 'Seleccionar icono'}</span>
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-2xl">
                                                <DialogHeader>
                                                    <DialogTitle>Seleccionar Icono</DialogTitle>
                                                </DialogHeader>
                                                <div className="relative">
                                                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                                     <Input placeholder="Buscar icono..." value={iconSearchTerm} onChange={(e) => setIconSearchTerm(e.target.value)} className="pl-10"/>
                                                </div>
                                                <div className="grid grid-cols-6 gap-2 max-h-96 overflow-y-auto mt-4 pr-3">
                                                    {filteredIcons.map(([name, IconComponent]) => (
                                                        <Button key={name} variant="outline" className="flex flex-col h-20" onClick={() => {
                                                            setEditingSection(prev => ({...prev, icon: name, icon_image_url: ''}));
                                                            setIsIconSelectorOpen(false);
                                                            setIconSearchTerm('');
                                                        }}>
                                                            <IconComponent className="w-6 h-6 mb-1" />
                                                            <span className="text-xs truncate">{name}</span>
                                                        </Button>
                                                    ))}
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                        <Button asChild variant="outline"><label htmlFor="icon-upload" className="cursor-pointer w-full"><Upload className="w-4 h-4 mr-2" /> Subir Imagen<Input id="icon-upload" type="file" className="hidden" accept="image/*" onChange={handleIconImageFileChange} /></label></Button>
                                    </div>
                                    {(iconImagePreview || editingSection.icon_image_url) && <img src={iconImagePreview || editingSection.icon_image_url} alt="Icono" className="w-8 h-8 mt-2 rounded object-contain bg-slate-700 p-1" />}
                                </div>

                                <div className="flex justify-end gap-2 pt-4">
                                    <Button variant="ghost" onClick={() => setEditingSection(null)}>Cancelar</Button>
                                    <Button onClick={handleSaveSection}>Guardar Sección</Button>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>

                <div className="glass-effect p-6 rounded-2xl">
                    <Label htmlFor="site_name" className="text-xl font-semibold">Nombre de la Web</Label>
                    <Input id="site_name" value={content.site_name || ''} onChange={(e) => handleContentChange('site_name', e.target.value)} className="mt-2 bg-black/30 border-white/20" placeholder="Ej: Mi increíble blog" />
                </div>
                <div className="glass-effect p-6 rounded-2xl">
                    <Label htmlFor="license_text" className="text-xl font-semibold">Texto de Licencia (Footer)</Label>
                    <Textarea id="license_text" value={content.license_text || ''} onChange={(e) => handleContentChange('license_text', e.target.value)} className="mt-2 bg-black/30 border-white/20" rows={4} />
                </div>
                <div className="glass-effect p-6 rounded-2xl">
                    <Label htmlFor="notification_prompt_frequency_days" className="text-xl font-semibold flex items-center gap-2">
                        <Bell className="w-5 h-5" />
                        Frecuencia de Notificaciones (Días)
                    </Label>
                    <Input 
                        id="notification_prompt_frequency_days" 
                        type="number"
                        value={content.notification_prompt_frequency_days || '30'} 
                        onChange={(e) => handleContentChange('notification_prompt_frequency_days', e.target.value)} 
                        className="mt-2 bg-black/30 border-white/20" 
                        placeholder="Ej: 30" 
                    />
                    <p className="text-sm text-muted-foreground mt-2">Días a esperar antes de volver a pedir permiso para notificaciones si el usuario lo ignora.</p>
                </div>
                <div className="glass-effect p-6 rounded-2xl">
                    <Label className="text-xl font-semibold">Contenido de la Página de Políticas</Label>
                    <div className="mt-2">
                        <TiptapEditor
                            content={content.policies_page_content || ''}
                            onChange={(newContent) => handleContentChange('policies_page_content', newContent)}
                            placeholder="Escribe el contenido de las políticas aquí..."
                        />
                    </div>
                </div>
            </div>

            <div className="text-center mt-12">
                <Button onClick={handleSaveChanges} size="lg" disabled={loading} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white">
                    <Save className="w-5 h-5 mr-2" />
                    {loading ? 'Guardando...' : 'Guardar Cambios Generales'}
                </Button>
            </div>
        </motion.div>
    );
};

export default ManageSiteContentClient;