import React, { useState, useRef, useCallback } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Image as ImageIcon, Sparkles, Edit } from 'lucide-react';
import KeywordInput from './KeywordInput';
import { Button } from '@/components/ui/button';
import SeoPreview from './SeoPreview';
import useAutosizeTextArea from '@/hooks/useAutosizeTextArea';
import { Input } from '@/components/ui/input';
import ImageCropperModal from '@/components/ImageCropperModal';
import { uploadBase64Image } from '@/lib/supabase/assets';
import { useToast } from '@/components/ui/use-toast';

const PostFormSeo = ({
    title, // Prop para el título principal
    excerpt, // Prop para el resumen principal
    metaTitle,
    setMetaTitle,
    slug,
    onSlugChange,
    setIsSlugManuallyEdited,
    generateSlug,
    metaDescription,
    setMetaDescription,
    mainImagePreview,
    setMainImage,
    setMainImagePreview,
    keywords,
    setKeywords,
    onAiAction,
    isAiLoading,
}) => {
    const [isSlugLocked, setIsSlugLocked] = useState(true);
    const [isCropperOpen, setIsCropperOpen] = useState(false);
    const [imageToCrop, setImageToCrop] = useState(null);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const metaTitleRef = useRef(null);
    const metaDescriptionRef = useRef(null);
    const { toast } = useToast();

    useAutosizeTextArea(metaTitleRef.current, metaTitle);
    useAutosizeTextArea(metaDescriptionRef.current, metaDescription);

    const handleMainImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setImageToCrop(reader.result);
                setIsCropperOpen(true);
            };
            reader.readAsDataURL(file);
        }
    };

    const onImageCropped = useCallback(async (croppedImageUrl) => {
        setIsUploadingImage(true);
        toast({ title: "Subiendo imagen..." });
        try {
            const publicUrl = await uploadBase64Image(croppedImageUrl);
            if (publicUrl) {
                setMainImage(publicUrl);
                setMainImagePreview(publicUrl);
                setImageToCrop(null);
                toast({ title: "✅ Imagen principal actualizada" });
            } else {
                toast({ title: "❌ Error al subir la imagen", description: "No se pudo obtener la URL pública.", variant: "destructive" });
            }
        } catch (error) {
            console.error("Error uploading cropped image:", error);
            toast({ title: "❌ Error al subir la imagen", description: error.message, variant: "destructive" });
        } finally {
            setIsUploadingImage(false);
        }
    }, [setMainImage, setMainImagePreview, toast]);

    const defaultKeywords = [
        "React", "JavaScript", "Tutorial", "Desarrollo Web", "Guía", "TailwindCSS", "Vite", "Frontend"
    ];

    return (
        <div className="grid lg:grid-cols-3 gap-8 pt-8 border-t border-white/20">
            <div className="lg:col-span-2 space-y-6">
                <h3 className="text-2xl font-bold">Optimización SEO</h3>
                
                {/* Meta Título y Slug */}
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <div className="flex justify-between items-center">
                            <Label htmlFor="metaTitle">Meta Título</Label>
                            <Button variant="ghost" size="sm" onClick={() => onAiAction('generate-meta-title')} disabled={isAiLoading || !title}>
                                <Sparkles className="w-4 h-4 mr-2" />
                                Generar
                            </Button>
                        </div>
                        <Textarea ref={metaTitleRef} id="metaTitle" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} placeholder="Título para SEO (máx 60 caracteres)" className="mt-2 bg-black/30 border-white/20" />
                    </div>
                    <div>
                        <Label htmlFor="slug">Slug (URL amigable)</Label>
                        <div className="relative flex items-center mt-2">
                            <Input 
                                id="slug" 
                                value={slug} 
                                onChange={onSlugChange} 
                                placeholder="ej-url-amigable" 
                                className="bg-black/30 border-white/20 pr-10"
                                disabled={isSlugLocked}
                            />
                            {isSlugLocked && (
                                <Button 
                                    type="button" 
                                    variant="ghost" 
                                    size="icon" 
                                    className="absolute right-1 h-8 w-8"
                                    onClick={() => {
                                        setIsSlugLocked(false);
                                        setIsSlugManuallyEdited(true);
                                    }}
                                >
                                    <Edit className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Meta Descripción */}
                <div>
                    <div className="flex justify-between items-center">
                        <Label htmlFor="metaDescription">Meta Descripción</Label>
                        <Button variant="ghost" size="sm" onClick={() => onAiAction('generate-meta-description')} disabled={isAiLoading || !title || !excerpt}>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Generar
                        </Button>
                    </div>
                    <Textarea ref={metaDescriptionRef} id="metaDescription" value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} placeholder="Descripción para SEO (máx 160 caracteres)" className="mt-2 bg-black/30 border-white/20" />
                </div>

                {/* Vista Previa SEO */}
                <SeoPreview title={metaTitle} description={metaDescription} slug={slug} />

                {/* Palabras Clave */}
                <div>
                    <div className="flex justify-between items-center">
                        <Label htmlFor="keywords">Palabras Clave (Keywords)</Label>
                        <Button variant="ghost" size="sm" onClick={() => onAiAction('generate-keywords')} disabled={isAiLoading || !title}>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Generar
                        </Button>
                    </div>
                    <KeywordInput
                        keywords={keywords}
                        setKeywords={setKeywords}
                        defaultKeywords={defaultKeywords}
                    />
                </div>
            </div>
            <div className="space-y-6">
                 <h3 className="text-2xl font-bold">Imagen Principal</h3>
                <div className="w-full aspect-video bg-black/30 rounded-lg border-2 border-dashed border-white/20 flex items-center justify-center mb-4 overflow-hidden">
                    {mainImagePreview ? (
                        <img src={mainImagePreview} alt="Vista previa" className="w-full h-full object-cover" />
                    ) : (
                        <div className="text-center text-gray-400">
                            <ImageIcon className="mx-auto h-12 w-12" />
                            <p>Sube una imagen</p>
                        </div>
                    )}
                </div>
                <Input id="mainImage" type="file" accept="image/*" onChange={handleMainImageChange} className="bg-black/30 border-white/20 file:text-white" />
            </div>

            <ImageCropperModal
                imageUrl={imageToCrop}
                open={isCropperOpen}
                onOpenChange={setIsCropperOpen}
                onCropComplete={onImageCropped}
                isUploading={isUploadingImage}
                // No initialAspectRatio prop is passed, so it defaults to freeform
            />
        </div>
    );
};

export default PostFormSeo;