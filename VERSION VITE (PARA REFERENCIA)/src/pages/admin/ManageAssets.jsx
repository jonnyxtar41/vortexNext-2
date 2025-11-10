import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, Trash2, Copy, Search, RefreshCw, ImageOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { listSiteAssets, deleteSiteAsset, uploadSiteAsset } from '@/lib/supabase/assets';
import { getPostImageUrls } from '@/lib/supabase/posts'; // Import the new function
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const ManageAssets = () => {
    const { toast } = useToast();
    const [assets, setAssets] = useState([]);
    const [orphanAssets, setOrphanAssets] = useState([]); // New state for orphan assets
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [replacingAssetName, setReplacingAssetName] = useState(null);
    const fileInputRef = useRef(null);

    const fetchAssets = useCallback(async () => {
        setLoading(true);
        const { data: siteAssets, error: assetsError } = await listSiteAssets();
        const postImageUrls = await getPostImageUrls(); // Corrected: directly get the array

        if (assetsError) {
            toast({ title: 'Error al cargar archivos', description: assetsError.message, variant: 'destructive' });
            setLoading(false);
            return;
        }
        // No need for postsError check here, as getPostImageUrls handles its own errors and returns []

        const referencedUrlsSet = new Set(
            postImageUrls.filter(Boolean) // Ensure no null/undefined URLs
        );

        const currentSupabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const subfolder = 'post-main-images';

        const allAssetsWithPreview = siteAssets.map(asset => {
            const fullPathInBucket = `${subfolder}/${asset.name}`;
            const publicUrl = `${currentSupabaseUrl}/storage/v1/object/public/site-assets/${fullPathInBucket}`;
            return {
                ...asset,
                fullPath: publicUrl,
                previewUrl: `${publicUrl}?t=${new Date(asset.updated_at).getTime()}`
            };
        });

        const orphans = allAssetsWithPreview.filter(asset => !referencedUrlsSet.has(asset.fullPath));
        const regularAssets = allAssetsWithPreview.filter(asset => referencedUrlsSet.has(asset.fullPath));

        setAssets(regularAssets || []);
        setOrphanAssets(orphans || []);
        setLoading(false);
    }, [toast]);

    useEffect(() => {
        fetchAssets();
    }, [fetchAssets]);

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setUploading(true);
        const filePath = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;
        const url = await uploadSiteAsset(file, filePath);

        if (url) {
            toast({ title: 'Archivo subido', description: 'El archivo se ha subido correctamente.' });
            fetchAssets();
        } else {
            toast({ title: 'Error al subir', description: 'No se pudo subir el archivo.', variant: 'destructive' });
        }
        setUploading(false);
        event.target.value = '';
    };

    const handleReplaceClick = (assetName) => {
        setReplacingAssetName(assetName);
        fileInputRef.current.click();
    };

    const handleFileReplace = async (event) => {
        const file = event.target.files[0];
        if (!file || !replacingAssetName) return;

        setUploading(true);
        const url = await uploadSiteAsset(file, replacingAssetName);

        if (url) {
            toast({ title: 'Archivo reemplazado', description: 'El archivo se ha actualizado. Puede que necesites refrescar la página (CTRL+F5) para ver los cambios.' });
            fetchAssets();
        } else {
            toast({ title: 'Error al reemplazar', description: 'No se pudo subir el nuevo archivo.', variant: 'destructive' });
        }
        setUploading(false);
        setReplacingAssetName(null);
        event.target.value = ''; // Reset file input
    };

    const handleDelete = async (assetName) => {
        const { error } = await deleteSiteAsset(assetName);
        if (error) {
            toast({ title: 'Error al eliminar', description: error.message, variant: 'destructive' });
        } else {
            toast({ title: 'Archivo eliminado', description: 'El archivo ha sido eliminado.' });
            fetchAssets();
        }
    };

    const handleBulkDeleteOrphans = async () => {
        if (orphanAssets.length === 0) {
            toast({ title: 'No hay imágenes huérfanas para eliminar.' });
            return;
        }

        setLoading(true);
        const orphanNames = orphanAssets.map(asset => asset.name);
        const { error } = await deleteSiteAsset(orphanNames); // deleteSiteAsset can take an array

        if (error) {
            toast({ title: 'Error al eliminar imágenes huérfanas', description: error.message, variant: 'destructive' });
        } else {
            toast({ title: `✅ ${orphanAssets.length} imágenes huérfanas eliminadas.` });
            fetchAssets();
        }
        setLoading(false);
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast({ title: 'Copiado', description: 'URL copiada al portapapeles.' });
    };

    const filteredAssets = assets.filter(asset =>
        asset.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredOrphanAssets = orphanAssets.filter(asset =>
        asset.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="p-4 md:p-8"
        >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <h2 className="text-3xl font-bold">Gestionar Archivos</h2>
                <div className="flex gap-2">
                    <Button asChild className="cursor-pointer">
                        <label htmlFor="asset-upload">
                            <Upload className="mr-2 h-4 w-4" /> {uploading && !replacingAssetName ? 'Subiendo...' : 'Subir Archivo'}
                        </label>
                    </Button>
                    <Button variant="outline" onClick={fetchAssets} disabled={loading || uploading}>
                        <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refrescar
                    </Button>
                </div>
                <Input
                    id="asset-upload"
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={uploading}
                />
                <Input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleFileReplace}
                    disabled={uploading}
                />
            </div>

            <div className="mb-6 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                    placeholder="Buscar por nombre de archivo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-input border-border"
                />
            </div>

            {loading ? (
                <p>Cargando archivos...</p>
            ) : (
                <>
                    {/* Sección de Imágenes Huérfanas */}
                    {orphanAssets.length > 0 && (
                        <div className="mb-10 p-6 glass-effect rounded-lg border border-red-500/50">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-2xl font-bold text-red-400 flex items-center gap-2">
                                    <ImageOff className="h-6 w-6" /> Imágenes Huérfanas ({orphanAssets.length})
                                </h3>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" disabled={loading || uploading}>
                                            <Trash2 className="mr-2 h-4 w-4" /> Eliminar Todas las Huérfanas
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>¿Confirmas la eliminación masiva?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Esta acción eliminará permanentemente {orphanAssets.length} imágenes que no están referenciadas por ningún post.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                            <AlertDialogAction onClick={handleBulkDeleteOrphans}>Eliminar</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                            <p className="text-red-300 mb-4">Estas imágenes no están siendo utilizadas por ningún post y pueden ser eliminadas para liberar espacio.</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                <AnimatePresence>
                                    {filteredOrphanAssets.map((asset) => (
                                        <motion.div
                                            key={asset.id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                            className="glass-effect rounded-lg overflow-hidden group border border-red-500"
                                        >
                                                                            <div className="h-40 bg-background/50 flex items-center justify-center p-2">
                                                                                {asset.metadata && asset.metadata.mimetype && asset.metadata.mimetype.startsWith('image/') ? (
                                                                                    <img
                                                                                        src={asset.previewUrl}
                                                                                        alt={asset.name}
                                                                                        className="max-h-full max-w-full object-contain"
                                                                                    />
                                                                                ) : (
                                                                                    <p className="text-center text-sm text-gray-400 break-all p-2">{asset.name}</p>
                                                                                )}
                                                                            </div>                                            <div className="p-4">
                                                <p className="text-sm font-semibold truncate" title={asset.name}>{asset.name}</p>
                                                <p className="text-xs text-gray-400">{asset.metadata ? `${(asset.metadata.size / 1024).toFixed(2)} KB` : 'N/A'}</p>
                                                <div className="flex gap-2 mt-4">
                                                    <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => copyToClipboard(asset.fullPath)}>
                                                        <Copy className="w-4 h-4" />
                                                    </Button>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button size="icon" variant="destructive" className="h-8 w-8">
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>¿Confirmas la eliminación?</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Esta acción es irreversible y eliminará permanentemente el archivo "{asset.name}".
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => handleDelete(asset.name)}>Eliminar</AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>
                    )}

                    {/* Sección de Archivos en Uso */}
                    <h2 className="text-3xl font-bold mb-4">Archivos en Uso ({assets.length})</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        <AnimatePresence>
                            {filteredAssets.length > 0 ? filteredAssets.map((asset) => (
                                <motion.div
                                    key={asset.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    className="glass-effect rounded-lg overflow-hidden group"
                                >
                                    <div className="h-40 bg-background/50 flex items-center justify-center p-2">
                                        {asset.metadata && asset.metadata.mimetype && asset.metadata.mimetype.startsWith('image/') ? (
                                            <img
                                                src={asset.previewUrl}
                                                alt={asset.name}
                                                className="max-h-full max-w-full object-contain"
                                            />
                                        ) : (
                                            <p className="text-center text-sm text-gray-400 break-all p-2">{asset.name}</p>
                                        )}
                                    </div>
                                    <div className="p-4">
                                        <p className="text-sm font-semibold truncate" title={asset.name}>{asset.name}</p>
                                        <p className="text-xs text-gray-400">{asset.metadata ? `${(asset.metadata.size / 1024).toFixed(2)} KB` : 'N/A'}</p>
                                        <div className="flex gap-2 mt-4">
                                            <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => copyToClipboard(asset.fullPath)}>
                                                <Copy className="w-4 h-4" />
                                            </Button>
                                            <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => handleReplaceClick(asset.name)} disabled={uploading}>
                                                <RefreshCw className={`w-4 h-4 ${uploading && replacingAssetName === asset.name ? 'animate-spin' : ''}`} />
                                            </Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button size="icon" variant="destructive" className="h-8 w-8">
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>¿Confirmas la eliminación?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Esta acción es irreversible y eliminará permanentemente el archivo "{asset.name}".
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDelete(asset.name)}>Eliminar</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </div>
                                </motion.div>
                            )) : (
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-gray-400 col-span-full text-center py-10"
                                >
                                    No se encontraron archivos en uso.
                                </motion.p>
                            )}
                        </AnimatePresence>
                    </div>
                </>
            )}
        </motion.div>
    );
};

export default ManageAssets;