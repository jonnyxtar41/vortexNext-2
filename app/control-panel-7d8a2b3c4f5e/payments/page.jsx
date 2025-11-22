'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '@/app/components/ui/use-toast';
import { createClient } from '@/app/utils/supabase/client';
import { getPayments, getAllSiteContent, updateSiteContent } from '@/app/lib/supabase/client';
import { DollarSign, CheckCircle, XCircle, Clock, Save, CreditCard, Info, Heart, Filter, Download, Repeat, MessageSquare, Banknote, Bitcoin } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import  Button  from '@/app/components/ui/button';
import  Input  from '@/app/components/ui/input';
import  Label  from '@/app/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/app/components/ui/alert";
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Switch } from '@/app/components/ui/switch';

const supabase = createClient();

const ManagePayments = () => {
    const { toast } = useToast();
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingConfig, setLoadingConfig] = useState(true);
    const [paymentConfig, setPaymentConfig] = useState({
        paypal_client_id: '',
        stripe_publishable_key: '',
        // stripe_secret_key is removed for security
        donation_page_title: '',
        donation_page_description: '',
        donation_options: '',
        donation_currency: 'USD',
        enable_stripe: true,
        enable_paypal: true,
        enable_bank_transfer: false,
        enable_crypto: false,
        enable_recurring_donations: true,
        donation_thank_you_title: '¡Gracias por tu donación!',
        donation_thank_you_message: 'Tu apoyo nos ayuda a seguir adelante. Hemos enviado un recibo a tu correo electrónico.',
        // --- NUEVOS CAMPOS AÑADIDOS ---
        enable_payphone: false, 
        payphone_app_id: '',
        // ------------------------------
    });
    const [filters, setFilters] = useState({
        provider: 'all',
        status: 'all',
        currency: 'all',
        startDate: '',
        endDate: '',
    });

    const fetchAllData = async () => {
        setLoading(true);
        setLoadingConfig(true);
        try {
            const [paymentsData, siteContentData] = await Promise.all([
                getPayments(supabase),
                getAllSiteContent(supabase)
            ]);
            setPayments(paymentsData);
            
            const config = siteContentData.reduce((acc, item) => {
                // Modificado para incluir 'payphone_'
                if (item.key.startsWith('paypal_') || item.key.startsWith('stripe_') || item.key.startsWith('donation_') || item.key.startsWith('enable_') || item.key.startsWith('payphone_')) {
                    if (['true', 'false'].includes(item.value)) {
                        acc[item.key] = item.value === 'true';
                    } else {
                        acc[item.key] = item.value;
                    }
                }
                return acc;
            }, {});
            setPaymentConfig(prev => ({...prev, ...config}));

        } catch (error) {
            toast({
                title: '❌ Error al cargar datos',
                description: 'No se pudieron obtener los datos de pagos y configuración.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
            setLoadingConfig(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, [toast]);

    const handleConfigChange = (key, value) => {
        setPaymentConfig(prev => ({ ...prev, [key]: value }));
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleSaveConfig = async () => {
        setLoadingConfig(true);
        try {
            // Secret key is no longer managed here
            const { stripe_secret_key, ...configToSave } = paymentConfig;

            await Promise.all(
                Object.entries(configToSave).map(([key, value]) => 
                    updateSiteContent(supabase, key, String(value))
                )
            );
            toast({
                title: '✅ Configuración Guardada',
                description: 'La configuración de monetización ha sido actualizada.',
            });
        } catch (error) {
            toast({
                title: '❌ Error al guardar',
                description: 'No se pudo guardar la configuración de monetización.',
                variant: 'destructive',
            });
        } finally {
            setLoadingConfig(false);
        }
    };
    const filteredPayments = useMemo(() => {
        return payments.filter(p => {
            const providerMatch = filters.provider === 'all' || p.payment_provider.toLowerCase() === filters.provider;
            const statusMatch = filters.status === 'all' || p.status.toLowerCase() === filters.status;
            const currencyMatch = filters.currency === 'all' || p.currency.toLowerCase() === filters.currency;
            const date = new Date(p.created_at);
            const startDateMatch = !filters.startDate || date >= new Date(filters.startDate);
            const endDateMatch = !filters.endDate || date <= new Date(filters.endDate + 'T23:59:59');
            return providerMatch && statusMatch && currencyMatch && startDateMatch && endDateMatch;
        });
    }, [payments, filters]);

    const getStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case 'succeeded': case 'paid': case 'complete':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'failed':
                return <XCircle className="w-5 h-5 text-red-500" />;
            case 'pending':
                return <Clock className="w-5 h-5 text-yellow-500" />;
            default: return null;
        }
    };
    
    const handleExport = (format) => {
        toast({
            title: "🚧 ¡Función en desarrollo!",
            description: `La exportación a ${format.toUpperCase()} estará disponible pronto.`,
        });
    };

    return (
        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4 flex items-center justify-center gap-3">
                    <DollarSign className="w-8 h-8 text-primary" />
                    Gestión de Monetización
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                    Configura tus métodos de pago, personaliza las donaciones y revisa el historial de transacciones.
                </p>
            </div>

            <Tabs defaultValue="history" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="history">Historial</TabsTrigger>
                    <TabsTrigger value="gateways">Pasarelas de Pago</TabsTrigger>
                    <TabsTrigger value="donations">Donaciones</TabsTrigger>
                </TabsList>
                <TabsContent value="history">
                    <div className="glass-effect p-6 rounded-2xl mt-6">
                        <div className="mb-6 p-4 glass-effect rounded-lg">
                            <h4 className="text-lg font-bold mb-4 flex items-center gap-2"><Filter className="w-5 h-5" />Filtros de Historial</h4>
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                <Select value={filters.provider} onValueChange={(v) => handleFilterChange('provider', v)}>
                                    <SelectTrigger className="bg-input border-border"><SelectValue placeholder="Proveedor" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos los proveedores</SelectItem>
                                        <SelectItem value="stripe">Stripe</SelectItem>
                                        <SelectItem value="paypal">PayPal</SelectItem>
                                        <SelectItem value="payphone">PayPhone</SelectItem> {/* Agregado PayPhone */}
                                    </SelectContent>
                                </Select>
                                <Select value={filters.status} onValueChange={(v) => handleFilterChange('status', v)}>
                                    <SelectTrigger className="bg-input border-border"><SelectValue placeholder="Estado" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos los estados</SelectItem>
                                        <SelectItem value="succeeded">Exitoso (Stripe)</SelectItem>
                                        <SelectItem value="complete">Completo (PayPal)</SelectItem>
                                        <SelectItem value="pending">Pendiente</SelectItem>
                                        <SelectItem value="failed">Fallido</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={filters.currency} onValueChange={(v) => handleFilterChange('currency', v)}>
                                    <SelectTrigger className="bg-input border-border"><SelectValue placeholder="Moneda" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todas las monedas</SelectItem>
                                        <SelectItem value="usd">USD</SelectItem>
                                        <SelectItem value="eur">EUR</SelectItem>
                                        <SelectItem value="mxn">MXN</SelectItem>
                                    </SelectContent>
                                </Select>
                                <div>
                                    <Label htmlFor="startDate">Fecha Inicio</Label>
                                    <Input type="date" id="startDate" value={filters.startDate} onChange={(e) => handleFilterChange('startDate', e.target.value)} className="bg-input border-border mt-1" />
                                </div>
                                <div>
                                    <Label htmlFor="endDate">Fecha Fin</Label>
                                    <Input type="date" id="endDate" value={filters.endDate} onChange={(e) => handleFilterChange('endDate', e.target.value)} className="bg-input border-border mt-1" />
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 mb-4">
                            <Button variant="outline" onClick={() => handleExport('csv')}><Download className="w-4 h-4 mr-2" /> Exportar CSV</Button>
                            <Button variant="outline" onClick={() => handleExport('pdf')}><Download className="w-4 h-4 mr-2" /> Exportar PDF</Button>
                        </div>
                        {loading ? <p>Cargando historial...</p> : filteredPayments.length === 0 ? (
                            <p className="text-muted-foreground text-center py-8">No se han registrado pagos con los filtros actuales.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-white/20">
                                            <th className="p-3">Fecha</th>
                                            <th className="p-3">Donante/Cliente</th>
                                            <th className="p-3">Email</th>
                                            <th className="p-3">Monto</th>
                                            <th className="p-3">Tipo</th>
                                            <th className="p-3">Estado</th>
                                            <th className="p-3">Proveedor</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredPayments.map((payment) => (
                                            <tr key={payment.id} className="border-b border-white/10 hover:bg-white/5">
                                                <td className="p-3 text-sm text-muted-foreground">{format(new Date(payment.created_at), "d MMM yyyy, HH:mm", { locale: es })}</td>
                                                <td className="p-3">{payment.donor_name || 'N/A'}</td>
                                                <td className="p-3">{payment.email || 'N/A'}</td>
                                                <td className="p-3 font-medium">{new Intl.NumberFormat('en-US', { style: 'currency', currency: payment.currency }).format(payment.amount)}</td>
                                                <td className="p-3 capitalize text-muted-foreground">{payment.item_type || 'Donación'}</td>
                                                <td className="p-3"><div className="flex items-center gap-2">{getStatusIcon(payment.status)}<span className="capitalize">{payment.status}</span></div></td>
                                                <td className="p-3 capitalize text-muted-foreground">{payment.payment_provider}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </TabsContent>
                <TabsContent value="gateways">
                     <div className="glass-effect p-6 rounded-2xl mt-6 space-y-8">
                        {loadingConfig ? <p>Cargando configuración...</p> : (
                            <>
                                {/* Configuración de PayPal */}
                                <div className="space-y-4">
                                    <h3 className="text-xl font-semibold flex items-center gap-2"><img alt="PayPal logo" className="w-6 h-6" src="https://images.unsplash.com/photo-1642132652860-471b4228023e" /> Configuración de PayPal</h3>
                                    <div>
                                        <Label htmlFor="paypal_client_id">PayPal Client ID</Label>
                                        <Input id="paypal_client_id" value={paymentConfig.paypal_client_id || ''} onChange={(e) => handleConfigChange('paypal_client_id', e.target.value)} className="mt-2 bg-black/30 border-white/20" placeholder="A-Z, 0-9..." />
                                    </div>
                                </div>

                                {/* Configuración de Stripe */}
                                <div className="space-y-4">
                                    <h3 className="text-xl font-semibold flex items-center gap-2"><CreditCard className="w-6 h-6" /> Configuración de Stripe</h3>
                                    <Alert>
                                        <Info className="h-4 w-4" />
                                        <AlertTitle>¡Importante!</AlertTitle>
                                        <AlertDescription>
                                            Tu Clave Secreta de Stripe debe ser configurada como una variable de entorno en tu proyecto de Supabase para mayor seguridad. No la gestiones desde aquí.
                                        </AlertDescription>
                                    </Alert>
                                    <div>
                                        <Label htmlFor="stripe_publishable_key">Stripe Publishable Key</Label>
                                        <Input id="stripe_publishable_key" value={paymentConfig.stripe_publishable_key || ''} onChange={(e) => handleConfigChange('stripe_publishable_key', e.target.value)} className="mt-2 bg-black/30 border-white/20" placeholder="pk_live_..." />
                                    </div>
                                </div>

                                {/* Configuración de PayPhone (NUEVO) */}
                                <div className="space-y-4">
                                    <h3 className="text-xl font-semibold flex items-center gap-2">PayPhone (Ecuador)</h3>
                                    <Alert variant="destructive">
                                        <Info className="h-4 w-4" />
                                        <AlertTitle>¡Configuración de Backend Requerida!</AlertTitle>
                                        <AlertDescription>
                                            El **Token de Autenticación** de PayPhone (el secreto) DEBE configurarse como la variable de entorno `PAYPHONE_API_TOKEN` en Supabase Edge Functions. El ID de aplicación a continuación es público.
                                        </AlertDescription>
                                    </Alert>
                                    <div>
                                        <Label htmlFor="payphone_app_id">PayPhone App ID (ID de Aplicación)</Label>
                                        <Input id="payphone_app_id" value={paymentConfig.payphone_app_id || ''} onChange={(e) => handleConfigChange('payphone_app_id', e.target.value)} className="mt-2 bg-black/30 border-white/20" placeholder="Inserta tu ID de aplicación de PayPhone" />
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </TabsContent>
                <TabsContent value="donations">
                    <div className="glass-effect p-6 rounded-2xl mt-6 space-y-8">
                        {loadingConfig ? <p>Cargando configuración...</p> : (
                            <>
                                <div className="space-y-6">
                                    <h3 className="text-xl font-semibold flex items-center gap-2"><Heart className="w-6 h-6 text-red-500" /> Página de Donaciones</h3>
                                    <div>
                                        <Label htmlFor="donation_page_title">Título de la página</Label>
                                        <Input id="donation_page_title" value={paymentConfig.donation_page_title || ''} onChange={(e) => handleConfigChange('donation_page_title', e.target.value)} className="mt-2 bg-black/30 border-white/20" placeholder="Apoya Nuestro Proyecto" />
                                    </div>
                                    <div>
                                        <Label htmlFor="donation_page_description">Descripción de la página</Label>
                                        <Textarea id="donation_page_description" value={paymentConfig.donation_page_description || ''} onChange={(e) => handleConfigChange('donation_page_description', e.target.value)} className="mt-2 bg-black/30 border-white/20" placeholder="Tu generosidad nos permite seguir creando..." />
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <Label htmlFor="donation_options">Opciones de montos</Label>
                                            <Input id="donation_options" value={paymentConfig.donation_options || ''} onChange={(e) => handleConfigChange('donation_options', e.target.value)} className="mt-2 bg-black/30 border-white/20" placeholder="5, 10, 25, 50, 100" />
                                            <p className="text-xs text-muted-foreground mt-1">Valores separados por comas.</p>
                                        </div>
                                        <div>
                                            <Label htmlFor="donation_currency">Moneda por defecto</Label>
                                            <Select value={paymentConfig.donation_currency || 'USD'} onValueChange={(value) => handleConfigChange('donation_currency', value)}>
                                                <SelectTrigger id="donation_currency" className="mt-2 w-full bg-black/30 border-white/20">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="USD">USD - Dólar estadounidense</SelectItem>
                                                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                                                    <SelectItem value="MXN">MXN - Peso mexicano</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-xl font-semibold flex items-center gap-2"><CreditCard className="w-6 h-6" /> Métodos de Pago Activos</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="flex items-center space-x-2"><Switch id="enable_stripe" checked={paymentConfig.enable_stripe} onCheckedChange={(v) => handleConfigChange('enable_stripe', v)} /><Label htmlFor="enable_stripe" className="flex items-center gap-2"><CreditCard className="w-4 h-4"/> Tarjeta</Label></div>
                                        <div className="flex items-center space-x-2"><Switch id="enable_paypal" checked={paymentConfig.enable_paypal} onCheckedChange={(v) => handleConfigChange('enable_paypal', v)} /><Label htmlFor="enable_paypal" className="flex items-center gap-2"><img alt="PayPal" className="w-4 h-4" src="https://images.unsplash.com/photo-1642132652860-471b4228023e" /> PayPal</Label></div>
                                        <div className="flex items-center space-x-2"><Switch id="enable_bank_transfer" checked={paymentConfig.enable_bank_transfer} onCheckedChange={(v) => handleConfigChange('enable_bank_transfer', v)} /><Label htmlFor="enable_bank_transfer" className="flex items-center gap-2"><Banknote className="w-4 h-4"/> Transferencia</Label></div>
                                        <div className="flex items-center space-x-2"><Switch id="enable_crypto" checked={paymentConfig.enable_crypto} onCheckedChange={(v) => handleConfigChange('enable_crypto', v)} /><Label htmlFor="enable_crypto" className="flex items-center gap-2"><Bitcoin className="w-4 h-4"/> Crypto</Label></div>
                                        {/* --- NUEVO BOTÓN DE SWITCH DE PAYPHONE --- */}
                                        <div className="flex items-center space-x-2"><Switch id="enable_payphone" checked={paymentConfig.enable_payphone} onCheckedChange={(v) => handleConfigChange('enable_payphone', v)} /><Label htmlFor="enable_payphone" className="flex items-center gap-2">PayPhone</Label></div>
                                        {/* --- FIN NUEVO BOTÓN DE SWITCH DE PAYPHONE --- */}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-xl font-semibold flex items-center gap-2"><Repeat className="w-6 h-6" /> Donaciones Recurrentes</h3>
                                    <div className="flex items-center space-x-2">
                                        <Switch id="enable_recurring_donations" checked={paymentConfig.enable_recurring_donations} onCheckedChange={(v) => handleConfigChange('enable_recurring_donations', v)} />
                                        <Label htmlFor="enable_recurring_donations">Permitir donaciones mensuales</Label>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-xl font-semibold flex items-center gap-2"><MessageSquare className="w-6 h-6" /> Mensaje de Agradecimiento</h3>
                                    <div>
                                        <Label htmlFor="donation_thank_you_title">Título del mensaje</Label>
                                        <Input id="donation_thank_you_title" value={paymentConfig.donation_thank_you_title || ''} onChange={(e) => handleConfigChange('donation_thank_you_title', e.target.value)} className="mt-2 bg-black/30 border-white/20" />
                                    </div>
                                    <div>
                                        <Label htmlFor="donation_thank_you_message">Contenido del mensaje</Label>
                                        <Textarea id="donation_thank_you_message" value={paymentConfig.donation_thank_you_message || ''} onChange={(e) => handleConfigChange('donation_thank_you_message', e.target.value)} className="mt-2 bg-black/30 border-white/20" />
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </TabsContent>
            </Tabs>

            <div className="text-center mt-8">
                <Button onClick={handleSaveConfig} size="lg" disabled={loadingConfig} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white">
                    <Save className="w-5 h-5 mr-2" />
                    {loadingConfig ? 'Guardando...' : 'Guardar Toda la Configuración'}
                </Button>
            </div>
        </motion.div>
    );
};

export default ManagePayments;
