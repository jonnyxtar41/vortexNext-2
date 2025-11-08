import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { getAdsConfig, saveAdsConfig } from '@/lib/ads';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Megaphone, Save, Search, Filter } from 'lucide-react';

const AdCard = ({ ad, onUpdate }) => {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="glass-effect p-6 rounded-2xl space-y-4"
        >
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-foreground">{ad.name}</h3>
                <Switch
                    checked={ad.visible}
                    onCheckedChange={(checked) => onUpdate(ad.id, 'visible', checked)}
                    aria-label={`Activar/desactivar ${ad.name}`}
                />
            </div>
            <p className="text-sm text-muted-foreground">ID del bloque: <code className="bg-muted px-1.5 py-0.5 rounded text-special">{ad.id}</code></p>
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor={`width-${ad.id}`}>Ancho (px o %)</Label>
                        <Input
                            id={`width-${ad.id}`}
                            value={ad.width}
                            onChange={(e) => onUpdate(ad.id, 'width', e.target.value)}
                            className="mt-1 bg-input"
                            placeholder="Ej: 300 o 100%"
                        />
                    </div>
                    <div>
                        <Label htmlFor={`height-${ad.id}`}>Alto (px)</Label>
                        <Input
                            id={`height-${ad.id}`}
                            value={ad.height}
                            onChange={(e) => onUpdate(ad.id, 'height', e.target.value)}
                            className="mt-1 bg-input"
                            placeholder="Ej: 250"
                        />
                    </div>
                </div>
                {ad.id === 'interstitial' && (
                    <div>
                        <Label htmlFor={`countdown-${ad.id}`}>Cuenta Regresiva (s)</Label>
                        <Input
                            id={`countdown-${ad.id}`}
                            type="number"
                            value={ad.countdown}
                            onChange={(e) => onUpdate(ad.id, 'countdown', parseInt(e.target.value, 10))}
                            className="mt-1 bg-input"
                            placeholder="Ej: 5"
                        />
                    </div>
                )}
                <div>
                    <Label htmlFor={`code-${ad.id}`}>Código del Anuncio</Label>
                    <Textarea
                        id={`code-${ad.id}`}
                        value={ad.code}
                        onChange={(e) => onUpdate(ad.id, 'code', e.target.value)}
                        className="mt-1 bg-input font-mono text-xs"
                        placeholder="Pega aquí tu código de AdSense o similar."
                        rows={6}
                    />
                </div>
            </div>
        </motion.div>
    );
};

const ManageAds = () => {
    const [adsConfig, setAdsConfig] = useState({});
    const [adsenseClientId, setAdsenseClientId] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [visibilityFilter, setVisibilityFilter] = useState('all');
    const { toast } = useToast();

    useEffect(() => {
        const config = getAdsConfig();
        setAdsConfig(config);
        setAdsenseClientId(config.adsenseClientId || '');
    }, []);

    const handleUpdateAd = (adId, key, value) => {
        setAdsConfig(prevConfig => ({
            ...prevConfig,
            [adId]: {
                ...prevConfig[adId],
                [key]: value
            }
        }));
    };

    const handleSaveChanges = () => {
        saveAdsConfig({ ...adsConfig, adsenseClientId });
        toast({
            title: "✅ Configuración Guardada",
            description: "La configuración de los anuncios ha sido actualizada.",
        });
    };

    const filteredAds = useMemo(() => {
        return Object.values(adsConfig).filter(ad => {
            if (typeof ad !== 'object' || !ad.id || ad.id === 'adsenseClientId') return false;
            const matchesSearch = (ad.name?.toLowerCase().includes(searchTerm.toLowerCase()) || ad.id?.toLowerCase().includes(searchTerm.toLowerCase())) ?? false;
            const matchesVisibility =
                visibilityFilter === 'all' ||
                (visibilityFilter === 'visible' && ad.visible) ||
                (visibilityFilter === 'hidden' && !ad.visible);
            return matchesSearch && matchesVisibility;
        });
    }, [adsConfig, searchTerm, visibilityFilter]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
        >
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4 flex items-center justify-center gap-3">
                    <Megaphone className="w-8 h-8 text-yellow-400" />
                    Gestionar Anuncios
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                    Controla la visibilidad, tamaño y código de cada bloque publicitario de tu sitio.
                </p>
            </div>

            <div className="mb-8 p-4 glass-effect rounded-lg">
                <h3 className="text-xl font-bold mb-4">Configuración General de AdSense</h3>
                <div className="space-y-2">
                    <Label htmlFor="adsense-client-id">ID de Cliente de Google AdSense (ca-pub-XXXXXXXXXXXXXXX)</Label>
                    <Input
                        id="adsense-client-id"
                        value={adsenseClientId}
                        onChange={(e) => setAdsenseClientId(e.target.value)}
                        className="bg-input border-border"
                        placeholder="Ej: ca-pub-1234567890123456"
                    />
                </div>
            </div>

            <div className="mb-8 p-4 glass-effect rounded-lg">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Filter className="w-5 h-5" />Filtros</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por nombre o ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 bg-input border-border"
                        />
                    </div>
                    <Select value={visibilityFilter} onValueChange={setVisibilityFilter}>
                        <SelectTrigger className="bg-input border-border">
                            <SelectValue placeholder="Visibilidad" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            <SelectItem value="visible">Visibles</SelectItem>
                            <SelectItem value="hidden">Ocultos</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
                {filteredAds.length > 0 ? filteredAds.map(ad => (
                    <AdCard key={ad.id} ad={ad} onUpdate={handleUpdateAd} />
                )) : (
                    <p className="text-muted-foreground text-center py-8 md:col-span-2">No se encontraron anuncios con los filtros actuales.</p>
                )}
            </div>

            <div className="text-center mt-8">
                <Button onClick={handleSaveChanges} size="lg" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white">
                    <Save className="w-5 h-5 mr-2" />
                    Guardar Cambios
                </Button>
            </div>
        </motion.div>
    );
};

export default ManageAds;