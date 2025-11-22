'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '@/app/components/ui/use-toast';
import  Button  from '@/app/components/ui/button';
import  Input  from '@/app/components/ui/input';
import  Label  from '@/app/components/ui/label';
import { Palette, Save, PlusCircle, Trash2, Edit } from 'lucide-react';
import { predefinedThemes, getCustomThemes, saveCustomThemes } from '@/app/lib/themes';
import { useTheme } from 'next-themes';
import { HexColorPicker } from 'react-colorful';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/app/components/ui/alert-dialog';

// HSL to Hex and Hex to HSL conversion functions remain the same...
const hslToHex = (hsl) => {
    try {
        const [h, s, l] = hsl.split(' ').map(val => parseFloat(val.replace('%', '')));
        const l_norm = l / 100;
        const a = (s * Math.min(l_norm, 1 - l_norm)) / 100;
        const f = n => {
            const k = (n + h / 30) % 12;
            const color = l_norm - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
            return Math.round(255 * color).toString(16).padStart(2, '0');
        };
        return `#${f(0)}${f(8)}${f(4)}`;
    } catch (e) {
        return '#000000';
    }
};

const hexToHsl = (hex) => {
    try {
        let r = 0, g = 0, b = 0;
        if (hex.length === 4) {
            r = parseInt(hex[1] + hex[1], 16);
            g = parseInt(hex[2] + hex[2], 16);
            b = parseInt(hex[3] + hex[3], 16);
        } else if (hex.length === 7) {
            r = parseInt(hex.substring(1, 3), 16);
            g = parseInt(hex.substring(3, 5), 16);
            b = parseInt(hex.substring(5, 7), 16);
        }
        r /= 255; g /= 255; b /= 255;
        let cmin = Math.min(r,g,b), cmax = Math.max(r,g,b), delta = cmax - cmin, h = 0, s = 0, l = 0;
        if (delta === 0) h = 0;
        else if (cmax === r) h = ((g - b) / delta) % 6;
        else if (cmax === g) h = (b - r) / delta + 2;
        else h = (r - g) / delta + 4;
        h = Math.round(h * 60);
        if (h < 0) h += 360;
        l = (cmax + cmin) / 2;
        s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
        s = +(s * 100).toFixed(1);
        l = +(l * 100).toFixed(1);
        return `${Math.round(h)} ${Math.round(s)}% ${Math.round(l)}%`;
    } catch (e) {
        return '0 0% 0%';
    }
}

const ThemeEditorForm = ({ themeData, onSave, onCancel, isEditing }) => {
    const [theme, setTheme] = useState(themeData);
    const [activeColorPicker, setActiveColorPicker] = useState(null);

    const handleChange = (field, value) => {
        setTheme(prev => ({ ...prev, [field]: value }));
    };

    const handleColorChange = (colorVar, value) => {
        setTheme(prev => ({
            ...prev,
            colors: {
                ...prev.colors,
                [colorVar]: value
            }
        }));
    };
    
    const handleSave = () => {
        onSave(theme);
    };

    return (
        <div className="glass-effect p-6 rounded-2xl space-y-4 relative">
            <h3 className="text-xl font-bold">{isEditing ? 'Editar Tema' : 'Crear Nuevo Tema'}</h3>
             {activeColorPicker && (
                <div className="absolute z-10 top-0 right-full mr-4 bg-background p-2 rounded-lg shadow-lg border border-border">
                     <HexColorPicker 
                        color={hslToHex(theme.colors[activeColorPicker])} 
                        onChange={(hex) => handleColorChange(activeColorPicker, hexToHsl(hex))}
                     />
                     <Button variant="ghost" size="sm" onClick={() => setActiveColorPicker(null)} className="w-full mt-2">Cerrar</Button>
                </div>
            )}
            <Input
                placeholder="Nombre del Tema (ej: mi-tema-cool)"
                value={theme.name}
                onChange={(e) => handleChange('name', e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                className="bg-input"
                disabled={isEditing}
            />
            <Input
                placeholder="Etiqueta del Tema (ej: Mi Tema Cool)"
                value={theme.label}
                onChange={(e) => handleChange('label', e.target.value)}
                className="bg-input"
            />
            <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                {Object.entries(theme.colors).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                        <Label className="text-sm">{key}</Label>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-mono">{value}</span>
                            <div
                                className="w-8 h-8 rounded border-2 border-border cursor-pointer"
                                style={{ backgroundColor: `hsl(${value})` }}
                                onClick={() => setActiveColorPicker(key)}
                            />
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex gap-4">
                <Button onClick={onCancel} variant="outline" className="w-full">Cancelar</Button>
                <Button onClick={handleSave} className="w-full"><Save className="w-4 h-4 mr-2" />{isEditing ? 'Guardar Cambios' : 'Guardar Tema'}</Button>
            </div>
        </div>
    );
}

const ManageTheme = () => {
    const { toast } = useToast();
    const { theme, setTheme } = useTheme();
    const [customThemes, setCustomThemes] = useState([]);
    const [editorState, setEditorState] = useState({
        isOpen: false,
        isEditing: false,
        themeData: null,
    });

    useEffect(() => {
        // Load custom themes from localStorage on mount
        setCustomThemes(getCustomThemes());
    }, []);
    
    const handleSaveChanges = () => {
        // The theme is already live-previewed by calling setTheme.
        // This function could persist the final choice if needed, but next-themes handles persistence.
        toast({
            title: "✅ Tema Aplicado",
            description: `El tema ha sido aplicado a todo el sitio.`,
        });
    };
    
    const openEditor = (themeToEdit = null) => {
        if (themeToEdit) {
            setEditorState({
                isOpen: true,
                isEditing: true,
                themeData: { ...themeToEdit, isPredefined: false },
            });
        } else {
            setEditorState({
                isOpen: true,
                isEditing: false,
                themeData: {
                    name: '',
                    label: '',
                    colors: { ...predefinedThemes[0].colors },
                    isPredefined: false,
                },
            });
        }
    };

    const closeEditor = () => {
        setEditorState({ isOpen: false, isEditing: false, themeData: null });
    };

    const handleSaveTheme = (themeData) => {
        if (!themeData.name || !themeData.label) {
            toast({ title: "Error", description: "El nombre y la etiqueta del tema son obligatorios.", variant: "destructive" });
            return;
        }

        let updatedCustomThemes;
        if (editorState.isEditing) {
             const isAlsoPredefined = predefinedThemes.some(t => t.name === themeData.name);
             const alreadyCustom = customThemes.some(t => t.name === themeData.name);

             if (isAlsoPredefined && !alreadyCustom) {
                updatedCustomThemes = [...customThemes, themeData];
             } else {
                updatedCustomThemes = customThemes.map(t => t.name === themeData.name ? themeData : t);
             }
            toast({ title: "✅ Tema Actualizado", description: `El tema "${themeData.label}" ha sido modificado.` });
        } else {
            if (customThemes.some(t => t.name === themeData.name) || predefinedThemes.some(t => t.name === themeData.name)) {
                toast({ title: "Error", description: "Ya existe un tema con ese nombre.", variant: "destructive" });
                return;
            }
            updatedCustomThemes = [...customThemes, themeData];
            toast({ title: "🎉 Tema Personalizado Guardado", description: `El tema "${themeData.label}" ha sido añadido.` });
        }

        setCustomThemes(updatedCustomThemes);
        saveCustomThemes(updatedCustomThemes);
        
        // If the currently active theme was the one being edited, re-apply it.
        if (theme === themeData.name) {
            setTheme(themeData.name);
        }

        closeEditor();
    };

    const handleDeleteCustomTheme = (themeName) => {
        const updatedCustomThemes = customThemes.filter(t => t.name !== themeName);
        setCustomThemes(updatedCustomThemes);
        saveCustomThemes(updatedCustomThemes);
        if (theme === themeName) {
            setTheme('cosmic-latte'); // Fallback to a default theme
        }
        toast({ title: "🗑️ Tema Eliminado", description: `El tema personalizado ha sido eliminado.` });
    }

    const allThemes = [...predefinedThemes, ...customThemes.filter(ct => !predefinedThemes.some(pt => pt.name === ct.name))];

    return (
        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4 flex items-center justify-center gap-3">
                    <Palette className="w-8 h-8 text-accent" />
                    Personalización de Tema
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                    Selecciona un tema para previsualizarlo. Los cambios se aplicarán al instante en todo el sitio.
                </p>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-16">
                <div>
                    <h3 className="text-2xl font-bold mb-6">Selector de Tema</h3>
                    <div className="space-y-4">
                        {allThemes.map(themeOption => {
                            const isCustom = !themeOption.isPredefined || customThemes.some(ct => ct.name === themeOption.name);
                            const displayTheme = customThemes.find(ct => ct.name === themeOption.name) || themeOption;

                            return (
                                <div
                                    key={displayTheme.name}
                                    onClick={() => setTheme(displayTheme.name)} // Use setTheme from next-themes
                                    className={`p-4 rounded-lg cursor-pointer border-2 transition-all ${theme === displayTheme.name ? 'border-primary' : 'border-border'}`}
                                >
                                    <div className="flex justify-between items-center">
                                        <span className="font-semibold">{displayTheme.label}</span>
                                        <div className='flex items-center gap-2'>
                                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); openEditor(displayTheme); }}>
                                                <Edit className="w-4 h-4 text-blue-400" />
                                            </Button>
                                            {isCustom && !displayTheme.isPredefined && (
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                                                            <Trash2 className="w-4 h-4 text-destructive"/>
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Esta acción eliminará permanentemente el tema "{displayTheme.label}".
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDeleteCustomTheme(displayTheme.name)}>Eliminar</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-2 mt-2">
                                        {Object.values(displayTheme.colors).map((color, i) => (
                                            <div key={i} className="w-full h-8 rounded" style={{ backgroundColor: `hsl(${color})` }} />
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                     <Button onClick={handleSaveChanges} size="lg" className="mt-8 w-full bg-gradient-to-r from-blue-500 to-purple-600">
                        <Save className="w-5 h-5 mr-2" />
                        Guardar Tema Activo
                    </Button>
                </div>

                <div>
                    <h3 className="text-2xl font-bold mb-6">Creador de Temas</h3>
                    {!editorState.isOpen ? (
                         <Button onClick={() => openEditor()} className="w-full" variant="outline">
                            <PlusCircle className="w-5 h-5 mr-2" />
                            Crear Nuevo Tema Personalizado
                        </Button>
                    ) : (
                        <ThemeEditorForm 
                            themeData={editorState.themeData}
                            onSave={handleSaveTheme}
                            onCancel={closeEditor}
                            isEditing={editorState.isEditing}
                        />
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default ManageTheme;