'use client'; 

import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/app/components/ui/use-toast';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Trash2, Plus, Save } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/app/components/ui/alert-dialog";

import { createClient } from '@/app/utils/supabase/client';

const supabase = createClient();

const ManageRoles = () => {
    
    const { toast } = useToast();
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newRoleName, setNewRoleName] = useState('');
    const [deleteCandidate, setDeleteCandidate] = useState(null);
    const [editingRole, setEditingRole] = useState(null);
    const [permissions, setPermissions] = useState({});
    
    const allPermissions = [
        'dashboard', 'add-resource', 'manage-content', 'can_publish_posts',
        'analytics', 'payments', 'manage-users', 'manage-roles', 'manage-theme',
        'manage-site-content', 'manage-ads', 'manage-assets', 'manage-resources',
        'manage-suggestions', 'activity-log', 'credentials'
    ];

    // --- CORREGIDO (Lógica de Objeto) ---
    const fetchRolesAndPermissions = useCallback(async () => {
        setLoading(true);
        const { data: rolesData, error: rolesError } = await supabase.from('roles').select('id, name, permissions');

        if (rolesError) {
            toast({ title: "Error al cargar roles", description: rolesError.message, variant: "destructive" });
        } else {
            setRoles(rolesData || []);
            
            // Construimos el objeto de permisos
            const permsByRole = (rolesData || []).reduce((acc, role) => {
                // role.permissions es un objeto (ej: { "dashboard": true }) o null
                // Ya no necesitamos .reduce(), solo asignamos el objeto
                acc[role.id] = role.permissions || {}; // <-- ESTA ES LA CORRECCIÓN
                return acc;
            }, {});
            setPermissions(permsByRole);
        }
        
        setLoading(false);
    }, [supabase, toast]);

    useEffect(() => {
        fetchRolesAndPermissions();
    }, [fetchRolesAndPermissions]);

    // --- CORREGIDO (Lógica de Objeto) ---
    const handleAddNewRole = async () => {
        if (!newRoleName.trim()) {
            toast({ title: "Nombre inválido", description: "El nombre del rol no puede estar vacío.", variant: "destructive" });
            return;
        }

        const { data, error } = await supabase
            .from('roles')
            .insert({ 
                name: newRoleName,
                permissions: {} // <-- CORRECCIÓN: Insertamos un objeto vacío
            })
            .select()
            .single();

        if (error) {
            console.error("Error creating role:", JSON.stringify(error, null, 2));
            toast({ title: "Error al crear rol", description: error.message, variant: "destructive" });
        } else {
            toast({ title: "✅ Rol Creado", description: `El rol "${newRoleName}" ha sido añadido.` });
            setRoles([...roles, data]);
            setPermissions(prev => ({ ...prev, [data.id]: {} }));
            setNewRoleName('');
        }
    };

    // --- (Esta función ya era correcta) ---
    const handleDeleteRole = async () => {
        if (!deleteCandidate) return;

        const { error: roleError } = await supabase
            .from('roles')
            .delete()
            .eq('id', deleteCandidate.id);
        
        if (roleError) {
            toast({ title: "Error al eliminar rol", description: roleError.message, variant: "destructive" });
        } else {
            toast({ title: "🗑️ Rol eliminado", description: "El rol ha sido eliminado." });
            setRoles(roles.filter(r => r.id !== deleteCandidate.id));
            setPermissions(prev => {
                const newPerms = { ...prev };
                delete newPerms[deleteCandidate.id];
                return newPerms;
            });
        }
        setDeleteCandidate(null);
    };

    // --- CORREGIDO (Lógica de Objeto) ---
    const handleSavePermissions = async (roleId) => {
        // 1. Obtenemos el objeto del estado (ej: { dashboard: true, analytics: false })
        const rolePerms = permissions[roleId] || {};

        // 2. Creamos un *nuevo* objeto que solo contenga las keys con valor 'true'
        const permsToUpdate = Object.keys(rolePerms)
            .filter(perm => rolePerms[perm]) // Filtramos los que son 'true'
            .reduce((acc, perm) => {
                acc[perm] = true; // Construimos el objeto (ej: { dashboard: true })
                return acc;
            }, {});

        // 3. Actualizamos la BBDD con este nuevo objeto
        const { error } = await supabase
            .from('roles')
            .update({ permissions: permsToUpdate }) // <-- CORRECCIÓN: Guardamos el objeto
            .eq('id', roleId);

        if (error) {
            toast({ title: "Error al guardar permisos", description: error.message, variant: "destructive" });
            return;
        }

        toast({ title: "✅ Permisos Guardados", description: "Los permisos para este rol han sido actualizados." });
        setEditingRole(null);
        fetchRolesAndPermissions(); 
    };

    // --- (Esta función ya era correcta) ---
    const togglePermission = (roleId, permName) => {
        setPermissions(prev => ({
            ...prev,
            [roleId]: {
                ...prev[roleId],
                [permName]: !prev[roleId]?.[permName] // Alterna el valor
            }
        }));
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64">Cargando roles y permisos...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">Gestionar Roles y Permisos</h2>

            <div className="glass-effect p-4 rounded-lg mb-6 flex gap-2">
                <Input 
                    type="text" 
                    placeholder="Nombre del nuevo rol..."
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                />
                <Button onClick={handleAddNewRole}><Plus className="w-4 h-4 mr-2" /> Añadir Rol</Button>
            </div>

            <div className="space-y-4">
                {roles.map(role => (
                    <div key={role.id} className="glass-effect p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold">{role.name}</h3>
                            <div className="flex gap-2">
                                <Button 
                                    variant="outline"
                                    onClick={() => setEditingRole(editingRole === role.id ? null : role.id)}
                                >
                                    {editingRole === role.id ? 'Cerrar Permisos' : 'Editar Permisos'}
                                </Button>
                                {role.name !== 'superadmin' && (
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="destructive" size="icon" onClick={() => setDeleteCandidate(role)}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>¿Confirmas la eliminación?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Eliminar el rol "{role.name}" revocará el acceso a todos los usuarios que lo tengan. Esta acción no se puede deshacer.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel onClick={() => setDeleteCandidate(null)}>Cancelar</AlertDialogCancel>
                                                <AlertDialogAction onClick={handleDeleteRole}>Eliminar</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                )}
                            </div>
                        </div>

                        {editingRole === role.id && (
                            <div className="border-t border-border/10 pt-4">
                                <h4 className="font-semibold mb-3">Permisos para {role.name}</h4>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                                    {allPermissions.map(permName => (
                                        <label key={permName} className="flex items-center gap-2 text-sm p-2 rounded-md hover:bg-muted/50 cursor-pointer">
                                            <input 
                                                type="checkbox"
                                                className="form-checkbox h-4 w-4 rounded bg-background text-primary border-border focus:ring-primary"
                                                checked={!!permissions[role.id]?.[permName]}
                                                onChange={() => togglePermission(role.id, permName)}
                                                disabled={role.name === 'superadmin'}
                                            />
                                            {permName}
                                        </label>
                                    ))}
                                </div>
                                {role.name !== 'superadmin' && (
                                    <Button onClick={() => handleSavePermissions(role.id)}>
                                        <Save className="w-4 h-4 mr-2" /> Guardar Permisos
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ManageRoles;