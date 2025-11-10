import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, AlertDialogFooter } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Trash2, KeyRound, Eye, EyeOff, Edit, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const callAdminFunction = async (action, payload, session) => {
    if (!session) {
        throw new Error("No hay sesión activa para realizar la acción de administrador.");
    }
    const response = await supabase.functions.invoke('user-management', {
        body: JSON.stringify({ action, payload }),
        headers: {
            'Authorization': `Bearer ${session.access_token}`
        }
    });

    if (response.error) {
        throw new Error(response.error.message);
    }

    let responseData = response.data;
    if (typeof responseData === 'string') {
        try {
            responseData = JSON.parse(responseData);
        } catch (e) {
            // Not JSON
        }
    }

    if (responseData && responseData.error) {
        throw new Error(responseData.error.message || 'Error en la función de administrador.');
    }

    return responseData;
};


const ManageUsers = () => {
    const { toast } = useToast();
    const { session, user: currentUser, isSuperAdmin } = useAuth();
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);

    const [newUserEmail, setNewUserEmail] = useState('');
    const [newUserPassword, setNewUserPassword] = useState('');
    const [newUserRoleId, setNewUserRoleId] = useState('');
    const [showNewUserPassword, setShowNewUserPassword] = useState(false);
    const [isAddUserDialogOpen, setAddUserDialogOpen] = useState(false);

    const [editingUser, setEditingUser] = useState(null);
    const [newPassword, setNewPassword] = useState('');
    const [showEditPassword, setShowEditPassword] = useState(false);
    const [isEditPasswordDialogOpen, setEditPasswordDialogOpen] = useState(false);
    const [isEditRoleDialogOpen, setEditRoleDialogOpen] = useState(false);
    const [editingUserRoleId, setEditingUserRoleId] = useState('');

    const [deleteCandidate, setDeleteCandidate] = useState(null);

    const fetchUsersAndRoles = useCallback(async () => {
        if (!session) return;
        setLoading(true);
        try {
            const { users: authUsers } = await callAdminFunction('listUsers', {}, session);

            const userIds = authUsers.map(u => u.id);
            const { data: userRolesData, error: rolesError } = await supabase
                .from('user_roles')
                .select('user_id, roles(id, name)')
                .in('user_id', userIds);

            if (rolesError) throw rolesError;

            const usersWithRoles = authUsers.map(user => {
                const roleInfo = userRolesData?.find(r => r.user_id === user.id);
                return { ...user, role: roleInfo?.roles };
            });

            setUsers(usersWithRoles);

            const { data: rolesData, error: rolesListError } = await supabase.from('roles').select('*');
            if (rolesListError) throw rolesListError;
            setRoles(rolesData);

        } catch (error) {
            toast({ title: 'Error al cargar datos', description: error.message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    }, [toast, session]);

    useEffect(() => {
        fetchUsersAndRoles();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleAddUser = async () => {
        if (!newUserEmail || !newUserPassword || !newUserRoleId) {
            toast({ title: 'Campos requeridos', description: 'Email, contraseña y rol son obligatorios.', variant: 'destructive' });
            return;
        }

        try {
            const { user } = await callAdminFunction('createUser', { email: newUserEmail, password: newUserPassword }, session);
            if (user) {
                const { error: roleError } = await supabase
                    .from('user_roles')
                    .insert({ user_id: user.id, role_id: newUserRoleId });

                if (roleError) {
                    toast({ title: 'Error al asignar rol', description: roleError.message, variant: 'destructive' });
                    await callAdminFunction('deleteUser', { userId: user.id, userEmail: user.email }, session);
                } else {
                    toast({ title: 'Usuario creado', description: `El usuario ${user.email} ha sido creado.` });
                    setNewUserEmail('');
                    setNewUserPassword('');
                    setNewUserRoleId('');
                    setAddUserDialogOpen(false);
                    fetchUsersAndRoles();
                }
            }
        } catch (error) {
            toast({ title: 'Error al crear usuario', description: error.message, variant: 'destructive' });
        }
    };

    const attemptDelete = async (user) => {
        try {
            const { hasPosts } = await callAdminFunction('checkUserDependencies', { userId: user.id }, session);
            setDeleteCandidate({ ...user, hasPosts });
        } catch (error) {
            toast({ title: 'Error al verificar dependencias', description: error.message, variant: 'destructive' });
        }
    };

    const handleConfirmDelete = async () => {
        if (!deleteCandidate) return;

        try {
            await callAdminFunction('deleteUser', { userId: deleteCandidate.id, userEmail: deleteCandidate.email }, session);
            toast({ title: 'Usuario eliminado', description: 'El usuario ha sido eliminado correctamente.' });
            fetchUsersAndRoles();
        } catch (error) {
            toast({ title: 'Error al eliminar usuario', description: error.message, variant: 'destructive' });
        } finally {
            setDeleteCandidate(null);
        }
    };


    const handleUpdatePassword = async () => {
        if (!editingUser || !newPassword) {
            toast({ title: 'Campos requeridos', description: 'La nueva contraseña es obligatoria.', variant: 'destructive' });
            return;
        }
        try {
            const { user } = await callAdminFunction('updateUser', { userId: editingUser.id, updates: { password: newPassword } }, session);
            toast({ title: 'Contraseña actualizada', description: `La contraseña para ${user.email} ha sido actualizada.` });
            setNewPassword('');
            setEditingUser(null);
            setEditPasswordDialogOpen(false);
        } catch (error) {
            toast({ title: 'Error al actualizar contraseña', description: error.message, variant: 'destructive' });
        }
    };

    const handleUpdateRole = async () => {
        if (!editingUser || !editingUserRoleId) {
            toast({ title: 'Rol requerido', variant: 'destructive' });
            return;
        }
        try {
            const { error } = await supabase
                .from('user_roles')
                .update({ role_id: editingUserRoleId })
                .eq('user_id', editingUser.id);
            if (error) throw error;
            toast({ title: 'Rol actualizado' });
            setEditingUser(null);
            setEditRoleDialogOpen(false);
            fetchUsersAndRoles();
        } catch (error) {
            toast({ title: 'Error al actualizar rol', description: error.message, variant: 'destructive' });
        }
    };

    const handleTransferSuperAdmin = async (newAdminId) => {
        try {
            const { data: returnedId, error } = await supabase.rpc('transfer_super_admin', { new_admin_id: newAdminId });

            if (error) {
                throw error;
            }

            if (returnedId === newAdminId) {
                toast({
                    title: 'Transferencia Exitosa',
                    description: 'El rol de SuperAdmin ha sido transferido. La página se recargará.',
                });
                setTimeout(() => window.location.reload(), 3000);
            } else {
                throw new Error('La base de datos no confirmó la transferencia. ID devuelto: ' + returnedId);
            }

        } catch (error) {
            toast({
                title: 'Error en la Transferencia',
                description: error.message,
                variant: 'destructive',
            });
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold">Gestionar Usuarios</h2>
                <Dialog open={isAddUserDialogOpen} onOpenChange={setAddUserDialogOpen}>
                    <DialogTrigger asChild>
                        <Button><UserPlus className="mr-2 h-4 w-4" /> Añadir Usuario</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Añadir Nuevo Usuario</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} />
                            </div>
                            <div className="space-y-2 relative">
                                <Label htmlFor="password">Contraseña</Label>
                                <Input id="password" type={showNewUserPassword ? 'text' : 'password'} value={newUserPassword} onChange={(e) => setNewUserPassword(e.target.value)} />
                                <Button variant="ghost" size="icon" className="absolute right-1 top-[26px] h-8 w-8" onClick={() => setShowNewUserPassword(!showNewUserPassword)}>
                                    {showNewUserPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </Button>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="role">Rol</Label>
                                <Select value={newUserRoleId} onValueChange={setNewUserRoleId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar rol" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {roles.map(role => <SelectItem key={role.id} value={String(role.id)}>{role.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setAddUserDialogOpen(false)}>Cancelar</Button>
                            <Button onClick={handleAddUser}>Crear Usuario</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="space-y-4">
                {loading ? <p>Cargando usuarios...</p> : users.map(user => (
                    <div key={user.id} className="glass-effect p-4 rounded-lg flex justify-between items-center">
                        <div>
                            <p className="font-bold">{user.email}</p>
                            <p className="text-sm text-muted-foreground">Rol: {user.role?.name || 'No asignado'}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Dialog open={isEditRoleDialogOpen && editingUser?.id === user.id} onOpenChange={(isOpen) => { if (!isOpen) setEditingUser(null); setEditRoleDialogOpen(isOpen); }}>
                                <DialogTrigger asChild>
                                    <Button variant="ghost" size="icon" onClick={() => { setEditingUser(user); setEditingUserRoleId(user.role?.id); setEditRoleDialogOpen(true); }} disabled={user.id === currentUser.id && user.role?.name === 'admin'}>
                                        <Edit className="w-4 h-4" />
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader><DialogTitle>Editar Rol para {editingUser?.email}</DialogTitle></DialogHeader>
                                    <div className="py-4">
                                        <Select value={String(editingUserRoleId)} onValueChange={setEditingUserRoleId}>
                                            <SelectTrigger><SelectValue placeholder="Seleccionar rol" /></SelectTrigger>
                                            <SelectContent>
                                                {roles.map(role => <SelectItem key={role.id} value={String(role.id)}>{role.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <DialogFooter>
                                        <Button variant="outline" onClick={() => setEditRoleDialogOpen(false)}>Cancelar</Button>
                                        <Button onClick={handleUpdateRole}>Actualizar Rol</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>

                            <Dialog open={isEditPasswordDialogOpen && editingUser?.id === user.id} onOpenChange={(isOpen) => { if (!isOpen) { setEditingUser(null); setShowEditPassword(false); } setEditPasswordDialogOpen(isOpen); }}>
                                <DialogTrigger asChild>
                                    <Button variant="ghost" size="icon" onClick={() => { setEditingUser(user); setEditPasswordDialogOpen(true); }}>
                                        <KeyRound className="w-4 h-4" />
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader><DialogTitle>Cambiar contraseña para {editingUser?.email}</DialogTitle></DialogHeader>
                                    <div className="space-y-2 py-4 relative">
                                        <Label htmlFor="new-password">Nueva Contraseña</Label>
                                        <Input id="new-password" type={showEditPassword ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                                        <Button variant="ghost" size="icon" className="absolute right-1 top-[42px] h-8 w-8" onClick={() => setShowEditPassword(!showEditPassword)}>
                                            {showEditPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </Button>
                                    </div>
                                    <DialogFooter>
                                        <Button variant="outline" onClick={() => setEditPasswordDialogOpen(false)}>Cancelar</Button>
                                        <Button onClick={handleUpdatePassword}>Actualizar</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>

                            <AlertDialog open={!!deleteCandidate && deleteCandidate.id === user.id} onOpenChange={(open) => !open && setDeleteCandidate(null)}>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="icon" onClick={() => attemptDelete(user)} disabled={user.id === currentUser.id}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </AlertDialogTrigger>
                                {deleteCandidate && deleteCandidate.id === user.id && (
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                {deleteCandidate.hasPosts
                                                    ? `Este usuario tiene posts asociados. Si lo eliminas, los posts permanecerán pero no tendrán un autor asignado. ¿Deseas continuar?`
                                                    : `Esta acción no se puede deshacer. Esto eliminará permanentemente al usuario ${user.email}.`
                                                }
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                            <AlertDialogAction onClick={handleConfirmDelete}>Eliminar</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                )}
                            </AlertDialog>

                            {isSuperAdmin && (
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="outline" size="icon" title="Transferir SuperAdmin" disabled={user.id === currentUser.id}>
                                            <ShieldCheck className="w-4 h-4 text-yellow-500" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>¿Confirmar Transferencia de SuperAdmin?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Esta acción es irreversible. Transferirás todos tus privilegios de SuperAdmin a <span className="font-bold">{user.email}</span>.
                                                Perderás el acceso a esta función y la página se recargará.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleTransferSuperAdmin(user.id)}>Confirmar Transferencia</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ManageUsers;