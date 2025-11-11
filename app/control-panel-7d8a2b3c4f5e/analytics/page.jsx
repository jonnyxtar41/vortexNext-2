'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@/app/utils/supabase/client';
import { getAllPostStats, getPosts } from '@/app/lib/supabase/client';
import { getCategories } from '@/app/lib/supabase/categories';
import { getSections } from '@/app/lib/supabase/sections';
import { BarChart as BarChartIcon, Eye, Download, Search, Filter, TrendingUp, FileText, Hash, Star } from 'lucide-react';
import { Input } from '@/app/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { useToast } from '@/app/components/ui/use-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { format, subDays } from 'date-fns';
import { es } from 'date-fns/locale';

const supabase = createClient();

const StatCard = ({ title, value, icon, color }) => (
    <div className="glass-effect p-6 rounded-2xl flex items-center justify-between">
        <div>
            <p className="text-muted-foreground text-sm">{title}</p>
            <p className="text-4xl font-bold text-foreground">{value}</p>
        </div>
        {React.createElement(icon, { className: `w-12 h-12 ${color}` })}
    </div>
);

const Analytics = () => {
    const [stats, setStats] = useState([]);
    const [posts, setPosts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [sections, setSections] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState('visits-desc');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [sectionFilter, setSectionFilter] = useState('all');
    const [dateRange, setDateRange] = useState('all');
    const { toast } = useToast();

    const fetchData = useCallback(async () => {
        try {
            const [fetchedStats, postsData, categoriesData, sectionsData] = await Promise.all([
                getAllPostStats(supabase),
                getPosts(supabase, { limit: 1000 }),
                getCategories(supabase),
                getSections(supabase),
            ]);
            setStats(fetchedStats);
            setPosts(postsData.data || []);
            setCategories(categoriesData || []);
            setSections(sectionsData || []);
        } catch (error) {
            console.error("Error fetching analytics data:", error);
            toast({
                title: "Error al cargar estadísticas",
                description: "No se pudieron obtener los datos de Supabase.",
                variant: "destructive",
            });
        }
    }, [toast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const statsMap = useMemo(() => {
        return stats.reduce((acc, stat) => {
            acc[stat.post_id] = { visits: stat.visits, downloads: stat.downloads, updated_at: stat.updated_at };
            return acc;
        }, {});
    }, [stats]);

    const combinedData = useMemo(() => {
        return posts.map(post => ({
            ...post,
            stats: statsMap[post.id] || { visits: 0, downloads: 0, updated_at: null }
        }));
    }, [posts, statsMap]);

    const filteredAndSortedData = useMemo(() => {
        let filtered = combinedData;

        if (searchTerm) {
            filtered = filtered.filter(item =>
                item.title.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        if (sectionFilter !== 'all') {
            filtered = filtered.filter(item => item.section_id === parseInt(sectionFilter));
        }
        if (categoryFilter !== 'all') {
            filtered = filtered.filter(item => item.category_id === parseInt(categoryFilter));
        }
        if (dateRange !== 'all') {
            const range = parseInt(dateRange);
            const limitDate = subDays(new Date(), range);
            filtered = filtered.filter(item => item.stats.updated_at && new Date(item.stats.updated_at) >= limitDate);
        }

        return [...filtered].sort((a, b) => {
            switch (sortOrder) {
                case 'visits-asc': return a.stats.visits - b.stats.visits;
                case 'downloads-desc': return b.stats.downloads - a.stats.downloads;
                case 'downloads-asc': return a.stats.downloads - b.stats.downloads;
                case 'visits-desc': default: return b.stats.visits - a.stats.visits;
            }
        });
    }, [combinedData, searchTerm, sortOrder, categoryFilter, sectionFilter, dateRange]);

    const totalVisits = useMemo(() => Object.values(statsMap).reduce((sum, post) => sum + (post.visits || 0), 0), [statsMap]);
    const totalDownloads = useMemo(() => Object.values(statsMap).reduce((sum, post) => sum + (post.downloads || 0), 0), [statsMap]);
    const totalPosts = posts.length;
    const totalCategories = categories.length;
    const avgVisitsPerPost = totalPosts > 0 ? (totalVisits / totalPosts).toFixed(1) : 0;

    const categoryStats = useMemo(() => {
        const data = categories.map(cat => {
            const postsInCategory = combinedData.filter(p => p.category_id === cat.id);
            const visits = postsInCategory.reduce((sum, p) => sum + p.stats.visits, 0);
            const downloads = postsInCategory.reduce((sum, p) => sum + p.stats.downloads, 0);
            return { name: cat.name, visits, downloads };
        }).sort((a, b) => b.visits - a.visits);
        return data;
    }, [combinedData, categories]);

    const timeSeriesData = useMemo(() => {
        const days = dateRange === 'all' ? 30 : parseInt(dateRange);
        const data = Array.from({ length: days }, (_, i) => {
            const date = subDays(new Date(), i);
            return { date: format(date, 'd MMM', { locale: es }), visits: 0, downloads: 0 };
        }).reverse();

        stats.forEach(stat => {
            const statDate = new Date(stat.updated_at);
            const diffDays = (new Date() - statDate) / (1000 * 60 * 60 * 24);
            if (diffDays < days) {
                const formattedDate = format(statDate, 'd MMM', { locale: es });
                const dayData = data.find(d => d.date === formattedDate);
                if (dayData) {
                    dayData.visits += stat.visits;
                    dayData.downloads += stat.downloads;
                }
            }
        });
        return data;
    }, [stats, dateRange]);

    return (
        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4 flex items-center justify-center gap-3">
                    <BarChartIcon className="w-8 h-8 text-primary" />
                    Estadísticas del Sitio
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">Un resumen profesional del rendimiento de tu contenido.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
                <StatCard title="Visitas Totales" value={totalVisits.toLocaleString()} icon={Eye} color="text-blue-400" />
                <StatCard title="Descargas Totales" value={totalDownloads.toLocaleString()} icon={Download} color="text-green-400" />
                <StatCard title="Recursos Totales" value={totalPosts} icon={FileText} color="text-purple-400" />
                <StatCard title="Categorías" value={totalCategories} icon={Hash} color="text-yellow-400" />
                <StatCard title="Visitas / Recurso" value={avgVisitsPerPost} icon={TrendingUp} color="text-pink-400" />
            </div>

            <div className="grid lg:grid-cols-2 gap-8 mb-12">
                <div className="glass-effect p-6 rounded-2xl">
                    <h3 className="text-xl font-bold mb-4">Visitas y Descargas ({dateRange === 'all' ? 'Últimos 30 días' : `Últimos ${dateRange} días`})</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={timeSeriesData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                            <YAxis stroke="#9ca3af" fontSize={12} />
                            <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
                            <Legend />
                            <Area type="monotone" dataKey="visits" name="Visitas" stroke="#60a5fa" fill="#60a5fa" fillOpacity={0.3} />
                            <Area type="monotone" dataKey="downloads" name="Descargas" stroke="#4ade80" fill="#4ade80" fillOpacity={0.3} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
                <div className="glass-effect p-6 rounded-2xl">
                    <h3 className="text-xl font-bold mb-4">Rendimiento por Categoría</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={categoryStats.slice(0, 5)}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                            <YAxis stroke="#9ca3af" fontSize={12} />
                            <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
                            <Legend />
                            <Bar dataKey="visits" name="Visitas" fill="#60a5fa" />
                            <Bar dataKey="downloads" name="Descargas" fill="#4ade80" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div>
                <h3 className="text-2xl font-bold mb-6">Análisis Detallado de Recursos</h3>
                <div className="mb-6 p-4 glass-effect rounded-lg">
                    <h4 className="text-lg font-bold mb-4 flex items-center gap-2"><Filter className="w-5 h-5" />Filtros y Orden</h4>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="relative lg:col-span-3">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <Input placeholder="Buscar por título..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 bg-input border-border" />
                        </div>
                        <Select value={sectionFilter} onValueChange={setSectionFilter}>
                            <SelectTrigger className="bg-input border-border"><SelectValue placeholder="Sección" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas las secciones</SelectItem>
                                {sections.map(sec => <SelectItem key={sec.id} value={String(sec.id)}>{sec.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                            <SelectTrigger className="bg-input border-border"><SelectValue placeholder="Categoría" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas las categorías</SelectItem>
                                {categories.map(cat => <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Select value={dateRange} onValueChange={setDateRange}>
                            <SelectTrigger className="bg-input border-border"><SelectValue placeholder="Rango de Fechas" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Desde siempre</SelectItem>
                                <SelectItem value="7">Últimos 7 días</SelectItem>
                                <SelectItem value="30">Últimos 30 días</SelectItem>
                                <SelectItem value="90">Últimos 90 días</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={sortOrder} onValueChange={setSortOrder}>
                            <SelectTrigger className="bg-input border-border lg:col-span-3"><SelectValue placeholder="Ordenar por" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="visits-desc">Más vistos</SelectItem>
                                <SelectItem value="visits-asc">Menos vistos</SelectItem>
                                <SelectItem value="downloads-desc">Más descargados</SelectItem>
                                <SelectItem value="downloads-asc">Menos descargados</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-8">
                    <div className="glass-effect p-6 rounded-2xl">
                        <h4 className="text-xl font-bold mb-4 flex items-center gap-2"><Star className="w-5 h-5 text-yellow-400" />Top 5 Recursos</h4>
                        <div className="space-y-4">
                            {filteredAndSortedData.slice(0, 5).map((item, index) => (
                                <div key={item.id} className="flex items-center gap-4">
                                    <span className="text-lg font-bold text-primary">#{index + 1}</span>
                                    <div className="flex-1">
                                        <p className="font-semibold truncate">{item.title}</p>
                                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                            <span><Eye className="inline w-3 h-3 mr-1"/>{item.stats.visits.toLocaleString()}</span>
                                            <span><Download className="inline w-3 h-3 mr-1"/>{item.stats.downloads.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="glass-effect p-6 rounded-2xl">
                        <h4 className="text-xl font-bold mb-4">Lista Completa</h4>
                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                            {filteredAndSortedData.length > 0 ? filteredAndSortedData.map(item => (
                                <div key={item.id} className="p-4 rounded-lg flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-background/50">
                                    <h4 className="font-bold text-lg flex-1 truncate">{item.title}</h4>
                                    <div className="flex items-center gap-6 text-sm">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Eye className="w-5 h-5 text-blue-400" />
                                            <span className="font-semibold">{(item.stats.visits || 0).toLocaleString()}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Download className="w-5 h-5 text-green-400" />
                                            <span className="font-semibold">{(item.stats.downloads || 0).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-muted-foreground text-center py-8">No se encontraron estadísticas con los filtros actuales.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default Analytics;
