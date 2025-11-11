// app/components/admin/post-form/PostFormSidebar.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { Label } from '@/app/components/ui/label'; // Adjusted path
import { Switch } from '@/app/components/ui/switch'; // Adjusted path
import { RadioGroup, RadioGroupItem } from '@/app/components/ui/radio-group'; // Adjusted path
import { Input } from '@/app/components/ui/input'; // Adjusted path
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select'; // Adjusted path
import { useAuth } from '@/app/contexts/SupabaseAuthContext'; // Adjusted path
import { DollarSign, Percent, CalendarClock, Save, Book, Trash2, Loader2, MessageSquare, Star } from 'lucide-react';
import { Button } from '@/app/components/ui/button'; // Adjusted path
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/app/components/ui/dialog'; // Adjusted path
import { useToast } from '@/app/components/ui/use-toast'; // Adjusted path
import { createClient } from '@/app/utils/supabase/client';
import { getTemplates, saveTemplate, deleteTemplate } from '@/app/lib/supabase/templates'; // Adjusted path

const supabase = createClient();

const PostFormSidebar = ({
    hasDownload, setHasDownload,
    downloadType, setDownloadType,
    downloadUrl, setDownloadUrl,
    setDownloadFile, initialData,
    customAuthorName, setCustomAuthorName,
    showAuthor, setShowAuthor,
    showDate, setShowDate,
    showMainImageInPost, setShowMainImageInPost,
    mainImageSizeInPost, setMainImageSizeInPost,
    isPremium, setIsPremium,
    price, setPrice, currency, setCurrency,
    isDiscountActive, setIsDiscountActive,
    discountPercentage, setDiscountPercentage,
    isScheduled, setIsScheduled,
    publishedAt, setPublishedAt,
    isFeatured, setIsFeatured,
    onLoadTemplate,
    getTemplateData,
    commentsEnabled, setCommentsEnabled,
}) => {
    const { permissions } = useAuth();
    const { toast } = useToast();
    const canManageContent = permissions?.['manage-content'];
    const [templates, setTemplates] = useState([]);
    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
    const [newTemplateName, setNewTemplateName] = useState('');
    const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);

    const fetchTemplates = async () => {
        setIsLoadingTemplates(true);
        const data = await getTemplates(supabase);
        setTemplates(data);
        setIsLoadingTemplates(false);
    };

    useEffect(() => {
        fetchTemplates();
    }, []);

    const handleSaveTemplate = async () => {
        if (!newTemplateName) {
            toast({ title: 'Nombre de plantilla requerido', variant: 'destructive' });
            return;
        }
        const templateData = getTemplateData();
        const { error } = await saveTemplate(supabase, newTemplateName, templateData);
        if (error) {
            toast({ title: 'Error al guardar plantilla', description: error.message, variant: 'destructive' });
        } else {
            toast({ title: 'Plantilla guardada con éxito' });
            setNewTemplateName('');
            setIsTemplateModalOpen(false);
            fetchTemplates();
        }
    };
    
    const handleDeleteTemplate = async (templateId) => {
        const { error } = await deleteTemplate(supabase, templateId);
        if (error) {
            toast({ title: 'Error al eliminar plantilla', variant: 'destructive' });
        } else {
            toast({ title: 'Plantilla eliminada' });
            fetchTemplates();
        }
    };

    return (
        <div className="space-y-6 glass-effect p-6 rounded-lg">
            {canManageContent && (
                <>
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Publicación</h3>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="is-featured" className="flex items-center gap-2"><Star className="w-4 h-4 text-yellow-400" />Marcar como destacado</Label>
                            <Switch id="is-featured" checked={isFeatured} onCheckedChange={setIsFeatured} />
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-border/50">
                            <Label htmlFor="is-scheduled">Programar Publicación</Label>
                            <Switch id="is-scheduled" checked={isScheduled} onCheckedChange={setIsScheduled} />
                        </div>
                        {isScheduled && (
                            <div className="space-y-2">
                                <Label htmlFor="published-at">Fecha y Hora</Label>
                                <Input
                                    id="published-at"
                                    type="datetime-local"
                                    value={publishedAt}
                                    onChange={(e) => setPublishedAt(e.target.value)}
                                    className="bg-input"
                                />
                            </div>
                        )}
                         <div className="flex items-center justify-between pt-4 border-t border-border/50">
                            <Label htmlFor="comments-enabled" className="flex items-center gap-2"><MessageSquare className="w-4 h-4"/>Habilitar Comentarios</Label>
                            <Switch id="comments-enabled" checked={commentsEnabled} onCheckedChange={setCommentsEnabled} />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Plantillas</h3>
                        <div className="space-y-2">
                            <Select onValueChange={(templateId) => onLoadTemplate(templates.find(t => t.id === parseInt(templateId)))}>
                                <SelectTrigger className="bg-input">
                                    <SelectValue placeholder="Cargar desde plantilla" />
                                </SelectTrigger>
                                <SelectContent>
                                    {isLoadingTemplates ? <div className="p-2"><Loader2 className="w-4 h-4 animate-spin" /></div> : templates.map(t => (
                                        <SelectItem key={t.id} value={String(t.id)}>
                                            <div className="flex justify-between items-center w-full">
                                                <span>{t.name}</span>
                                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); handleDeleteTemplate(t.id); }}>
                                                    <Trash2 className="w-3 h-3 text-destructive" />
                                                </Button>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button variant="outline" className="w-full" onClick={() => setIsTemplateModalOpen(true)}>
                                <Save className="w-4 h-4 mr-2" />
                                Guardar como Plantilla
                            </Button>
                        </div>
                    </div>
                </>
            )}

            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Opciones de Autor</h3>
                <div className="flex items-center justify-between">
                    <Label htmlFor="show-author">Mostrar Autor</Label>
                    <Switch id="show-author" checked={showAuthor} onCheckedChange={setShowAuthor} />
                </div>
                {showAuthor && (
                    <div>
                        <Label htmlFor="custom-author-name">Nombre Personalizado</Label>
                        <Input id="custom-author-name" value={customAuthorName} onChange={(e) => setCustomAuthorName(e.target.value)} placeholder="Por defecto: email del autor" className="mt-1 bg-input" />
                    </div>
                )}
            </div>

            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Visualización del Post</h3>
                <div className="flex items-center justify-between">
                    <Label htmlFor="show-date">Mostrar Fecha</Label>
                    <Switch id="show-date" checked={showDate} onCheckedChange={setShowDate} />
                </div>
                <div className="flex items-center justify-between">
                    <Label htmlFor="show-main-image">Mostrar Imagen Principal</Label>
                    <Switch id="show-main-image" checked={showMainImageInPost} onCheckedChange={setShowMainImageInPost} />
                </div>
                {showMainImageInPost && (
                    <div>
                        <Label>Tamaño de Imagen</Label>
                        <Select value={mainImageSizeInPost} onValueChange={setMainImageSizeInPost}>
                            <SelectTrigger className="mt-1 bg-input"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="small">Pequeño</SelectItem>
                                <SelectItem value="medium">Mediano</SelectItem>
                                <SelectItem value="large">Grande</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                )}
            </div>

            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Descarga</h3>
                <div className="flex items-center justify-between">
                    <Label htmlFor="has-download">Habilitar Descarga</Label>
                    <Switch id="has-download" checked={hasDownload} onCheckedChange={setHasDownload} />
                </div>
                {hasDownload && (
                     <div className="space-y-4 pt-4">
                        <RadioGroup value={downloadType} onValueChange={setDownloadType}>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="url" id="url" />
                                <Label htmlFor="url">URL Externa</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="file" id="file" />
                                <Label htmlFor="file">Subir Archivo</Label>
                            </div>
                        </RadioGroup>
                        {downloadType === 'url' ? (
                            <Input type="text" placeholder="https://ejemplo.com/descarga" value={downloadUrl} onChange={(e) => setDownloadUrl(e.target.value)} className="bg-input"/>
                        ) : (
                            <div>
                                <Input type="file" onChange={(e) => setDownloadFile(e.target.files[0])} className="bg-input"/>
                                {initialData?.download?.type === 'file' && initialData?.download?.url && (
                                    <p className="text-xs text-muted-foreground mt-1">Archivo actual: {initialData.download.url.split('/').pop()}.</p>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {canManageContent && (
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Monetización</h3>
                    <div className="flex items-center justify-between">
                        <Label htmlFor="is-premium">Recurso Premium (de pago)</Label>
                        <Switch id="is-premium" checked={isPremium} onCheckedChange={setIsPremium} />
                    </div>
                    {isPremium && (
                        <div className="space-y-4 pt-4 border-t border-border">
                            <div className="space-y-2">
                                <Label htmlFor="price">Precio</Label>
                                <div className="flex items-center gap-2">
                                    <DollarSign className="h-5 w-5 text-muted-foreground" />
                                    <Input id="price" type="number" step="0.01" min="0" placeholder="19.99" value={price} onChange={(e) => setPrice(e.target.value)} className="bg-input" />
                                    <Select value={currency} onValueChange={setCurrency}>
                                        <SelectTrigger className="w-[120px] bg-input"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="USD">USD</SelectItem>
                                            <SelectItem value="EUR">EUR</SelectItem>
                                            <SelectItem value="MXN">MXN</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="flex items-center justify-between pt-4">
                                <Label htmlFor="is-discount-active">Aplicar Descuento</Label>
                                <Switch id="is-discount-active" checked={isDiscountActive} onCheckedChange={setIsDiscountActive} />
                            </div>
                            {isDiscountActive && (
                                <div className="space-y-2">
                                    <Label htmlFor="discount">Porcentaje de Descuento</Label>
                                    <div className="flex items-center gap-2">
                                        <Percent className="h-5 w-5 text-muted-foreground" />
                                        <Input id="discount" type="number" step="1" min="1" max="100" placeholder="Ej: 25" value={discountPercentage} onChange={(e) => setDiscountPercentage(e.target.value)} className="bg-input" />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
            
            <Dialog open={isTemplateModalOpen} onOpenChange={setIsTemplateModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Guardar Plantilla</DialogTitle>
                        <DialogDescription>Dale un nombre a tu nueva plantilla para usarla más tarde.</DialogDescription>
                    </DialogHeader>
                    <Input value={newTemplateName} onChange={(e) => setNewTemplateName(e.target.value)} placeholder="Ej: Plantilla para Guías"/>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsTemplateModalOpen(false)}>Cancelar</Button>
                        <Button onClick={handleSaveTemplate}>Guardar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default PostFormSidebar;
