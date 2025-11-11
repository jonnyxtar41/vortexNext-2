// app/control-panel-7d8a2b3c4f5e/manage-assets/page.jsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '@/app/components/ui/use-toast';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Upload, Trash2, Image as ImageIcon, FileText, Download, Link as LinkIcon, Eye, Folder, AlertTriangle } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/app/components/ui/alert-dialog";
import { createClient } from '@/app/utils/supabase/client'; 
import { uploadSiteAsset, listSiteAssets, deleteSiteAsset } from '@/app/lib/supabase/assets';

const BUCKET_NAME = 'site-assets';

const ASSET_URL_PREFIX = process.env.NEXT_PUBLIC_SUPABASE_URL + '/storage/v1/object/public/' + BUCKET_NAME + '/';

const ManageAssets = () => {
    const { toast } = useToast();
    const [assets, setAssets] = useState([]);
    const [orphanAssets, setOrphanAssets] = useState([]); // 1. Estado para huérfanos
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [file, setFile] = useState(null);
    const fileInputRef = useRef(null);
    const supabaseRef = useRef(createClient());


 const fetchAssets = async () => {
        setLoading(true);
        const supabase = supabaseRef.current;
        
        // Obtener todos los assets
        const { data: assetsData, error: assetsError } = await listSiteAssets(supabase, BUCKET_NAME);

        if (assetsError) {
            toast({ title: "❌ Error al cargar archivos", description: assetsError.message, variant: "destructive" });
            setLoading(false);
            return;
        }

        const allAssets = assetsData || [];

        // Obtener todos los posts para buscar imágenes en uso
        const { data: allPosts, error: postsError } = await supabase.from('posts').select('content, main_image_url');
        
        if (postsError) {
            console.error("Error fetching posts:", postsError);
            toast({ title: "⚠️ Error parcial", description: "No se pudieron verificar los posts para buscar huérfanos.", variant: "destructive" });
        }

        const inUseImages = new Set();
        if (allPosts) {
            allPosts.forEach(post => {
                // Añadir imagen principal
                if (post.main_image_url) {
                    inUseImages.add(post.main_image_url);
                }
                // Buscar imágenes en el contenido (Tiptap/JSON)
                if (post.content && post.content.content) {
                    try {
                        post.content.content.forEach(node => {
                            if (node.type === 'image' && node.attrs?.src) {
                                inUseImages.add(node.attrs.src);
                            }
                            if (node.content) {
                                node.content.forEach(innerNode => {
                                    if (innerNode.type === 'image' && innerNode.attrs?.src) {
                                        inUseImages.add(innerNode.attrs.src);
                                    }
                                });
                            }
                        });
                    } catch (e) {
                        console.warn("Error parsing post content for images:", e);
                    }
                }
            });
        }

        // Filtrar assets huérfanos y no huérfanos
        const orphanData = [];
        const nonOrphanData = [];

        allAssets.forEach(asset => {
            const assetUrl = ASSET_URL_PREFIX + asset.name;
            const isImage = asset.metadata?.mimetype?.startsWith('image/');
            
            if (isImage && !inUseImages.has(assetUrl)) {
                orphanData.push(asset);
            } else {
                nonOrphanData.push(asset);
            }
        });

        // Ordenar la lista principal (no huérfanos)
        const sortedData = nonOrphanData.sort((a, b) => {
            const aIsFolder = !a.metadata;
            const bIsFolder = !b.metadata;
            if (aIsFolder && !bIsFolder) return -1;
            if (!aIsFolder && bIsFolder) return 1;
            return a.name.localeCompare(b.name);
        });
        
        setAssets(sortedData);
        setOrphanAssets(orphanData); // Asignar huérfanos
        setLoading(false);
    };

    useEffect(() => {
        fetchAssets();
    }, []);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

  
    const handleUpload = async () => {
        if (!file) {
            toast({ title: "❌ No hay archivo", description: "Por favor, selecciona un archivo para subir.", variant: "destructive" });
            return;
        }
        
        setUploading(true);
        const supabase = supabaseRef.current;
        const filePath = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9_.-]/g, '_')}`;

        const { data: imageUrl, error } = await uploadSiteAsset(supabase, file, filePath);

        if (imageUrl && !error) {
            toast({ title: "✅ Archivo Subido" });
            setFile(null);
            if(fileInputRef.current) fileInputRef.current.value = "";
            await fetchAssets(); // Refrescar ambas listas
        } else {
            toast({ title: "❌ Error al subir", description: error?.message, variant: "destructive" });
        }
        setUploading(false);
    };

    const handleDelete = async (assetPath) => {
        const supabase = supabaseRef.current; 
        const { error } = await deleteSiteAsset(supabase, BUCKET_NAME, assetPath);
        if (error) { /* ... */ } else {
            toast({ title: "🗑️ Archivo eliminado" });
            await fetchAssets(); // Refrescar ambas listas
        }
    };

    const copyToClipboard = (url) => {
        navigator.clipboard.writeText(url);
        toast({ title: "📋 Enlace copiado al portapapeles" });
    };


    const getFileIcon = (metadata) => {
        if (!metadata) return <Folder className="w-5 h-5 text-yellow-400" />; // Carpeta
        return <FileText className="w-5 h-5 text-gray-400" />; // Otro tipo de archivo
    };

    // 3. Función para renderizar el asset (idéntica a Vite)
    const renderAssetCard = (asset) => (
        <div key={asset.id} className="flex items-center justify-between p-3 bg-black/20 rounded-lg gap-2">
            <div className="flex items-center gap-3 overflow-hidden">
                {asset.metadata?.mimetype?.startsWith('image/') ? (
                    <img 
                        src={ASSET_URL_PREFIX + asset.name} 
                        alt={asset.name} 
                        className="w-10 h-10 object-cover rounded-md flex-shrink-0" 
                    />
                ) : (
                    getFileIcon(asset.metadata)
                )}
                <span className="font-medium truncate" title={asset.name}>{asset.name}</span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
                <Button variant="ghost" size="icon" onClick={() => copyToClipboard(ASSET_URL_PREFIX + asset.name)} title="Copiar enlace">
                    <LinkIcon className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" asChild title="Ver archivo">
                    <a href={ASSET_URL_PREFIX + asset.name} target="_blank" rel="noopener noreferrer">
                        <Eye className="w-4 h-4" />
                    </a>
                </Button>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="icon" title="Eliminar archivo">
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                            <AlertDialogDescription>Esta acción no se puede deshacer. Esto eliminará permanentemente: {asset.name}</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(asset.name)}>Eliminar</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    );

    return (
        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="space-y-8">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4 flex items-center justify-center gap-3">
                    <Upload className="w-8 h-8 text-primary" />
                    Gestionar Archivos (Assets)
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                    Sube y administra imágenes, documentos y otros archivos para tu sitio.
                </p>
            </div>

            <div className="glass-effect p-6 rounded-2xl">
                <h3 className="text-xl font-semibold mb-4">Subir Nuevo Archivo</h3>
                <div className="flex flex-col sm:flex-row gap-4">
                    <Input 
                        type="file" 
                        onChange={handleFileChange} 
                        ref={fileInputRef}
                        className="flex-grow bg-black/30 border-white/20" 
                    />
                    <Button onClick={handleUpload} disabled={uploading || !file}>
                        {uploading ? 'Subiendo...' : <><Upload className="w-4 h-4 mr-2" /> Subir</>}
                    </Button>
                </div>
                {file && <p className="text-sm text-muted-foreground mt-2">Archivo seleccionado: {file.name}</p>}
            </div>

            {/* 4. SECCIÓN DE HUÉRFANOS AÑADIDA (idéntica a Vite) */}
            <div className="glass-effect p-6 rounded-2xl">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-yellow-400">
                    <AlertTriangle className="w-5 h-5" />
                    Archivos Huérfanos
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                    Estas imágenes están en el bucket pero no parecen estar en uso en ningún post.
                    Revísalas antes de eliminarlas.
                </p>
                <div className="space-y-3">
                    {loading ? (
                        <p>Buscando huérfanos...</p>
                    ) : (
                        orphanAssets.length > 0 ? (
                            orphanAssets.map(renderAssetCard) // Reutilizamos la función de render
                        ) : (
                            <p className="text-muted-foreground text-center py-4">¡Genial! No se encontraron archivos huérfanos.</p>
                        )
                    )}
                </div>
            </div>

            {/* 5. SECCIÓN DE ASSETS PRINCIPALES (idéntica a Vite) */}
            <div className="glass-effect p-6 rounded-2xl">
                <h3 className="text-xl font-semibold mb-4">Archivos en Uso y Documentos</h3>
                <div className="space-y-3">
                    {loading ? (
                        <p>Cargando archivos...</p>
                    ) : (
                        assets.length > 0 ? (
                            assets.map(renderAssetCard) // Reutilizamos la función de render
                        ) : (
                             <p className="text-muted-foreground text-center py-4">No hay archivos en uso, carpetas o documentos.</p>
                        )
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default ManageAssets;