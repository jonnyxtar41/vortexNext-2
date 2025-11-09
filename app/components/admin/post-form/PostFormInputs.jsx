// app/components/admin/post-form/PostFormInputs.jsx
'use client';

import React, { useRef } from 'react';
import { Input } from '@/app/components/ui/input'; // Adjusted path
import { Textarea } from '@/app/components/ui/textarea'; // Adjusted path
import { Label } from '@/app/components/ui/label'; // Adjusted path
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select'; // Adjusted path
import { Button } from '@/app/components/ui/button'; // Adjusted path
import { Sparkles } from 'lucide-react';
import useAutosizeTextArea from '@/app/hooks/useAutosizeTextArea'; // Adjusted path

const PostFormInputs = ({ 
    title, setTitle, 
    postSection, setPostSection, sections,
    postCategory, setPostCategory, availableCategories, 
    postSubcategory, setPostSubcategory, availableSubcategories, 
    excerpt, setExcerpt,
    onAiAction, isAiLoading
}) => {
    const excerptRef = useRef(null);
    useAutosizeTextArea(excerptRef.current, excerpt);

    return (
        <div className="space-y-6">
            <div>
                <Label htmlFor="title">Título del Recurso</Label>
                <div className="relative mt-2">
                    <Input 
                        id="title" 
                        value={title} 
                        onChange={(e) => setTitle(e.target.value)} 
                        placeholder="Ej: Guía Completa de Tiempos Verbales" 
                        className="bg-black/30 border-white/20 pr-10" 
                    />
                    <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                        onClick={() => onAiAction('generate-title')}
                        disabled={isAiLoading || !title}
                    >
                        <Sparkles className="w-4 h-4 text-yellow-400" />
                    </Button>
                </div>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
                <div>
                    <Label htmlFor="section">Sección</Label>
                    <Select value={postSection} onValueChange={setPostSection}>
                        <SelectTrigger id="section" className="mt-2 w-full bg-black/30 border-white/20">
                            <SelectValue placeholder="Selecciona una sección" />
                        </SelectTrigger>
                        <SelectContent>
                            {sections && sections.map(sec => (
                                <SelectItem key={sec.id} value={String(sec.id)}>{sec.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label htmlFor="category">Categoría</Label>
                    <Select value={postCategory} onValueChange={setPostCategory} disabled={!postSection || !availableCategories || availableCategories.length === 0}>
                        <SelectTrigger id="category" className="mt-2 w-full bg-black/30 border-white/20">
                            <SelectValue placeholder="Selecciona una categoría" />
                        </SelectTrigger>
                        <SelectContent>
                            {availableCategories && availableCategories.map(cat => (
                                <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label htmlFor="subcategory">Subcategoría</Label>
                    <Select value={postSubcategory} onValueChange={setPostSubcategory} disabled={!postCategory || !availableSubcategories || availableSubcategories.length === 0}>
                        <SelectTrigger id="subcategory" className="mt-2 w-full bg-black/30 border-white/20">
                            <SelectValue placeholder="Selecciona una subcategoría" />
                        </SelectTrigger>
                        <SelectContent>
                            {Array.isArray(availableSubcategories) && availableSubcategories.map(sub => (
                                <SelectItem key={sub.id} value={String(sub.id)}>{sub.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div>
                <div className="flex justify-between items-center">
                    <Label htmlFor="excerpt">Resumen (Extracto)</Label>
                    <Button variant="ghost" size="sm" onClick={() => onAiAction('generate-excerpt')} disabled={isAiLoading}>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generar con IA
                    </Button>
                </div>
                <Textarea ref={excerptRef} id="excerpt" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="Un resumen corto y atractivo del recurso." className="mt-2 bg-black/30 border-white/20" />
            </div>
        </div>
    );
};

export default PostFormInputs;