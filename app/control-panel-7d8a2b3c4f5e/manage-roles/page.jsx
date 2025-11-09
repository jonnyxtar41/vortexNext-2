'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/app/lib/customSupabaseClient';
import { useToast } from '@/app/components/ui/use-toast';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Checkbox } from '@/app/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/app/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, AlertDialogFooter } from '@/app/components/ui/alert-dialog';
import { Plus, Trash2, Edit } from 'lucide-react';

const permissionsMap = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'add-resource', label: 'Añadir Recurso' },
    { id: 'manage-content', label: 'Gestionar Contenido' },
    { id: 'analytics', label: 'Estadísticas' },
    { id: 'payments', label: 'Monetización' },
    { id: 'manage-users', label: 'Gestionar Usuarios' },
    { id: 'manage-theme', label: 'Gestionar Tema' },
    { id: 'manage-site-content', label: 'Contenido del Sitio' },
    { id: 'manage-ads', label: 'Gestionar Anuncios' },
    { id: 'manage-assets', label: 'Gestionar Archivos' },
    { id: 'manage-resources', label: 'Herramientas de Recursos' },
    { id: 'manage-suggestions', label: 'Sugerencias' },
    { id: 'activity-log', label: 'Registro de Actividad' },
    { id: 'credentials', label: 'Credenciales' },
    { id: 'manage-roles', label: 'Gestionar Roles' },
    { id: 'can_publish_posts', label: 'Puede publicar posts' },
];

const ManageRoles = () => {
    const { toast } = useToast();
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setDialogOpen] = useState(false);
    const [editingRole, setEditingRole] = useState(null);
    const [roleName, setRoleName] = useState('');
    const [permissions, setPermissions] = useState({});
    const [deleteCandidate, setDeleteCandidate] = useState(null);

    const fetchRoles = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase.from('roles').select('*');
            if (error) throw error;
            setRoles(data);
        } catch (error) {
            toast({ title: 'Error al cargar roles', description: error.message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchRoles();
    }, [fetchRoles]);

    const handleOpenDialog = (role = null) => {
        setEditingRole(role);
        if (role) {
            setRoleName(role.name);
            setPermissions(role.permissions);
        } else {
            setRoleName('');
            const initialPermissions = permissionsMap.reduce((acc, p) => ({ ...acc, [p.id]: false }), {});
            setPermissions(initialPermissions);
        }
        setDialogOpen(true);
    };

    const handlePermissionChange = (permissionId) => {
        setPermissions(prev => ({ ...prev, [permissionId]: !prev[permissionId] }));
    };

    const handleSubmit = async () => {
        if (!roleName) {
            toast({ title: 'Nombre de rol requerido', variant: 'destructive' });
            return;
        }

        try {
            if (editingRole) {
                const { error } = await supabase.from('roles').update({ name: roleName, permissions }).eq('id', editingRole.id);
                if (error) throw error;
                toast({ title: 'Rol actualizado' });
            } else {
                const { error } = await supabase.from('roles').insert({ name: roleName, permissions });
                if (error) throw error;
                toast({ title: 'Rol creado' });
            }
            setDialogOpen(false);
            fetchRoles();
        } catch (error) {
            toast({ title: 'Error al guardar el rol', description: error.message, variant: 'destructive' });
        }
    };

    const handleDelete = async () => {
        if (!deleteCandidate) return;
        try {
            const { count, error: countError } = await supabase.from('user_roles').select('*', { count: 'exact', head: true }).eq('role_id', deleteCandidate.id);
            if (countError) throw countError;
            if (count > 0) {
                toast({ title: 'No se puede eliminar', description: `Hay ${count} usuarios con este rol.`, variant: 'destructive' });
                setDeleteCandidate(null);
                return;
            }

            const { error } = await supabase.from('roles').delete().eq('id', deleteCandidate.id);
            if (error) throw error;
            toast({ title: 'Rol eliminado' });
            fetchRoles();
        } catch (error) {
            toast({ title: 'Error al eliminar el rol', description: error.message, variant: 'destructive' });
        } finally {
            setDeleteCandidate(null);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold">Gestionar Roles</h2>
                <Button onClick={() => handleOpenDialog()}><Plus className="mr-2 h-4 w-4" /> Añadir Rol</Button>
            </div>

            <div className="space-y-4">
                {loading ? <p>Cargando roles...</p> : roles.map(role => (
                    <div key={role.id} className="glass-effect p-4 rounded-lg flex justify-between items-center">
                        <p className="font-bold">{role.name}</p>
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(role)} disabled={role.name === 'admin'}>
                                <Edit className="w-4 h-4" />
                            </Button>
                            <AlertDialog open={!!deleteCandidate && deleteCandidate.id === role.id} onOpenChange={(open) => !open && setDeleteCandidate(null)}>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="icon" onClick={() => setDeleteCandidate(role)} disabled={['admin', 'co-admin'].includes(role.name)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Esta acción no se puede deshacer. Esto eliminará permanentemente el rol.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleDelete}>Eliminar</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>
                ))}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingRole ? 'Editar Rol' : 'Añadir Nuevo Rol'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="role-name">Nombre del Rol</Label>
                            <Input id="role-name" value={roleName} onChange={(e) => setRoleName(e.target.value)} disabled={editingRole?.name === 'admin'} />
                        </div>
                        <div className="space-y-2">
                            <Label>Permisos</Label>
                            <div className="grid grid-cols-2 gap-4 p-4 border rounded-md">
                                {permissionsMap.map(p => (
                                    <div key={p.id} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`perm-${p.id}`}
                                            checked={permissions[p.id] || false}
                                            onCheckedChange={() => handlePermissionChange(p.id)}
                                            disabled={editingRole?.name === 'admin'}
                                        />
                                        <Label htmlFor={`perm-${p.id}`} className="font-normal">{p.label}</Label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                        <Button onClick={handleSubmit} disabled={editingRole?.name === 'admin'}>Guardar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ManageRoles;