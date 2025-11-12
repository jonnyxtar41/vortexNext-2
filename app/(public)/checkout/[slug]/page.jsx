'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/app/components/ui/use-toast';
import { Button } from '@/app/components/ui/button';
import { createClient } from '@/app/utils/supabase/client';
import { getAllSiteContent, addPayment, getPostBySlug } from '@/app/lib/supabase/client';
import { ShoppingCart, CreditCard, Loader2, Tag } from 'lucide-react';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import { useAuth } from '@/app/contexts/SupabaseAuthContext';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { useCallback } from 'react';

const supabase = createClient();

const CheckoutPage = () => {
    const params = useParams();
    const postSlug = params.slug;
    const router = useRouter();
    const { toast } = useToast();
    const { user } = useAuth();
    const [post, setPost] = useState(null);
    const [config, setConfig] = useState({});
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        console.log('CheckoutPage useEffect started');
        const fetchData = async () => {
            console.log('fetchData called');
            try {
                console.log('Calling getPostBySlug and getAllSiteContent');
                const [postData, allContent] = await Promise.all([
                    getPostBySlug(supabase, postSlug),
                    getAllSiteContent(supabase),
                ]);
                console.log('getPostBySlug and getAllSiteContent completed');

                if (!postData || !postData.is_premium) {
                    toast({ title: 'Recurso no válido', description: 'Este recurso no está a la venta.', variant: 'destructive' });
                    router.push('/');
                    return;
                }
                
                setPost(postData);
                const contentMap = allContent.reduce((acc, item) => {
                     // Aseguramos que los valores booleanos se manejen correctamente
                    if (item.key.startsWith('enable_')) {
                        acc[item.key] = item.value === 'true';
                    } else {
                        acc[item.key] = item.value;
                    }
                    return acc;
                }, {});
                
                setConfig(contentMap);
                


                if (user) {
                    setName(user.user_metadata?.full_name || '');
                    setEmail(user.email || '');
                }

            } catch (error) {
                console.error('Error during fetchData:', error);
                toast({ title: 'Error', description: 'No se pudo cargar la información del producto.', variant: 'destructive' });
                router.push('/');
            } finally {
                console.log('Setting loading to false');
                setLoading(false);
            }
        };
        fetchData();
    }, [postSlug, router, toast, user]);

    const finalAmount = useMemo(() => {
        if (!post) return 0;
        if (post.is_discount_active && post.discount_percentage > 0) {
            const discount = (post.price * post.discount_percentage) / 100;
            return (post.price - discount).toFixed(2);
        }
        return parseFloat(post.price).toFixed(2);
    }, [post]);

    const setupPayPal = useCallback(() => {
        if (!config.paypal_client_id || !document.getElementById('paypal-button-container') || window.paypal || !config.enable_paypal) return;

        const script = document.createElement("script");
        script.src = `https://www.paypal.com/sdk/js?client-id=${config.paypal_client_id}&currency=${post.currency}&intent=capture`;
        script.onload = () => {
            if (window.paypal) {
                window.paypal.Buttons({
                    createOrder: (data, actions) => {
                        if (finalAmount <= 0) {
                            toast({ title: '💰 El monto debe ser mayor a cero.', variant: 'destructive' });
                            return Promise.reject(new Error('El monto debe ser mayor a cero.'));
                        }
                        return actions.order.create({
                            purchase_units: [{
                                amount: { value: String(finalAmount) },
                                custom_id: post.id,
                                description: `Compra de: ${post.title}`
                            }]
                        });
                    },
                    onApprove: (data, actions) => actions.order.capture().then(async (details) => {
                        await addPayment({
                            user_id: user?.id,
                            email: details.payer.email_address,
                            amount: details.purchase_units[0].amount.value,
                            currency: details.purchase_units[0].amount.currency_code,
                            payment_provider: 'paypal',
                            provider_payment_id: details.id,
                            status: 'succeeded',
                            item_type: 'post',
                            item_id: post.id,
                            donor_name: `${details.payer.name.given_name} ${details.payer.name.surname}`,
                        });
                        toast({ title: '💖 ¡Compra con PayPal exitosa!', description: `Gracias por tu compra, ${details.payer.name.given_name}!` });
                        router.push(`/post/${post.slug}?status=success`);
                    }),
                    onError: (err) => {
                        console.error("PayPal Button Error:", err);
                        toast({ title: '❌ Error de PayPal', description: 'Ocurrió un error al procesar el pago. Por favor, inténtalo de nuevo.', variant: 'destructive' });
                    }
                }).render('#paypal-button-container').catch(err => {
                    console.error("PayPal render error:", err)
                    // Opcional: Mostrar un mensaje al usuario si los botones no se pueden renderizar
                });
            }
        };
        script.onerror = () => {
            console.error("Error al cargar el script de PayPal SDK.");
            toast({ title: '❌ Error de Carga', description: 'No se pudo cargar el script de PayPal. Revisa tu conexión o la configuración.', variant: 'destructive' });
        };
        document.body.appendChild(script);

    }, [config.paypal_client_id, config.enable_paypal, post, finalAmount, toast, user, router]);

    useEffect(() => {
        if (!loading && post) {
            setupPayPal();
        }
    }, [loading, post, setupPayPal]);
    
    // Función para crear PaymentIntent para Stripe
    const createPaymentIntent = async (e) => {
        e.preventDefault();
        if (!name || !email) {
            toast({ title: 'Información requerida', description: 'Por favor, ingresa tu nombre y correo electrónico.', variant: 'destructive' });
            return;
        }
        
        if (!config.stripe_publishable_key || config.enable_stripe !== true) {
            toast({ title: 'Método no disponible', description: 'El pago con tarjeta no está activo o configurado.', variant: 'destructive' });
            return;
        }

        setIsProcessing(true);
        try {
            const { data, error } = await supabase.functions.invoke('create-payment-intent', {
                body: {
                    amount: Math.round(finalAmount * 100),
                    currency: post.currency,
                    name,
                    email,
                    metadata: {
                        product_id: post.id,
                        product_name: post.title,
                        type: 'premium_content',
                    },
                },
            });

            if (error) throw error;
            if (data.error) throw new Error(data.error);

            setClientSecret(data.clientSecret);
        } catch (error) {
            console.error('Error creating payment intent:', error);
            toast({ title: 'Error al iniciar pago', description: 'No se pudo conectar con el servicio de pago. Inténtalo de nuevo.', variant: 'destructive' });
        } finally {
            setIsProcessing(false);
        }
    };
    
    // --- FUNCIÓN MEJORADA PARA PAYPHONE (LLAMADA A SUPABASE EDGE FUNCTION) ---
    const handlePayPhoneCheckout = async () => {
        if (!config.payphone_app_id || config.enable_payphone !== true) {
            toast({ title: 'Método no disponible', description: 'El pago con PayPhone no está activo o configurado.', variant: 'destructive' });
            return;
        }
        
        if (!name || !email) {
            toast({ title: 'Información requerida', description: 'Por favor, ingresa tu nombre y correo electrónico.', variant: 'destructive' });
            return;
        }
        
        setIsProcessing(true);
        toast({ title: 'Iniciando PayPhone...', description: 'Creando la orden de pago, por favor espera un momento.', variant: 'info' });

        try {
            // Llamar a la función de Supabase para crear la orden en PayPhone
            const { data, error } = await supabase.functions.invoke('create-payphone-order', {
                body: {
                    amount: finalAmount, 
                    currency: post.currency,
                    name,
                    email,
                    itemType: 'post', // Tipo explícito para la mejora
                    itemId: post.id,   // ID del post para la mejora
                    returnUrl: window.location.origin, 
                    payphoneAppId: config.payphone_app_id,
                },
            });

            if (error) throw error;
            if (data.error) throw new Error(data.error);
            
            // Redirigir al usuario a la URL proporcionada por PayPhone
            window.location.href = data.redirectUrl;

        } catch (error) {
            console.error('PayPhone Checkout Error:', error);
            toast({ title: 'Error de PayPhone', description: error.message || 'No se pudo crear la orden de pago. Verifica la configuración.', variant: 'destructive' });
        } finally {
            setIsProcessing(false);
        }
    };


    if (loading) {
        return <div className="w-full h-screen flex items-center justify-center bg-background"><LoadingSpinner /></div>;
    }
    
    if (!post) {
    return null;
    }


    
    const isStripeActive = config.enable_stripe === true && config.stripe_publishable_key;
    const isPayPhoneActive = config.enable_payphone === true && config.payphone_app_id;
    const isPayPalActive = config.enable_paypal === true && config.paypal_client_id;

    return (
        <>
            <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="container mx-auto px-4 py-16 sm:py-24">
                <div className="max-w-2xl mx-auto text-center">
                    <ShoppingCart className="mx-auto h-12 w-12 text-primary" />
                    <h1 className="mt-6 text-4xl font-bold tracking-tight gradient-text">Finalizar Compra</h1>
                    <p className="mt-4 text-lg text-muted-foreground">Estás a punto de adquirir "{post.title}".</p>
                </div>

                <div className="mt-12 max-w-lg mx-auto">
                    <div className="glass-effect p-8 rounded-2xl shadow-lg">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-xl font-semibold text-white">{post.title}</h2>
                                <p className="text-sm text-muted-foreground">{post.categories?.name}</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                                {post.is_discount_active && (
                                    <p className="text-lg text-gray-400 line-through">${parseFloat(post.price).toFixed(2)} {post.currency}</p>
                                )}
                                <p className="text-3xl font-bold text-primary">${finalAmount} {post.currency}</p>
                                {post.is_discount_active && (
                                    <p className="text-sm font-bold text-green-400 flex items-center justify-end gap-1 mt-1">
                                        <Tag size={14}/> {post.discount_percentage}% OFF
                                    </p>
                                )}
                            </div>
                        </div>

                        <form onSubmit={e => e.preventDefault()} className="space-y-6">
                            <div>
                                <Label htmlFor="name">Nombre Completo</Label>
                                <Input id="name" type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Tu nombre" className="mt-1" disabled={isProcessing} />
                            </div>
                            <div>
                                <Label htmlFor="email">Correo Electrónico</Label>
                                <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="tu@email.com" className="mt-1" disabled={isProcessing} />
                            </div>

                            {isStripeActive ? (
                                <p className="text-center text-yellow-400">El pago con tarjeta no está disponible en este momento. Por favor, utiliza otro método.</p>
                            ) : null}


                            <div className="relative my-4">
                                <div className="absolute inset-0 flex items-center" aria-hidden="true"><div className="w-full border-t border-white/20" /></div>
                                {(isStripeActive || isPayPhoneActive) && <div className="relative flex justify-center"><span className="bg-gray-800 px-2 text-sm text-muted-foreground">o</span></div>}
                            </div>

                            <div className="space-y-4">
                                {isPayPalActive && <div id="paypal-button-container"></div>}

                                {isPayPhoneActive && (
                                    <Button
                                        type="button"
                                        onClick={handlePayPhoneCheckout}
                                        className="w-full bg-green-500 hover:bg-green-600 text-white text-lg py-6"
                                        size="lg"
                                        disabled={isProcessing || !isPayPhoneActive}
                                    >
                                        {isProcessing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'Pagar con PayPhone (Ecuador)'}
                                    </Button>
                                )}
                            </div>
                            

                            {!isStripeActive && !isPayPhoneActive && !isPayPalActive && (
                                <p className="text-center text-red-400">Error: No hay métodos de pago activos. Por favor, contacta al soporte.</p>
                            )}
                        </form>

                        <p className="text-xs text-center text-muted-foreground mt-4">
                            Transacción segura. Para pagos con tarjeta (Stripe) se requiere un *Payment Intent* para cargar el formulario.
                        </p>
                    </div>
                </div>
            </motion.main>
        </>
    );
};

export default CheckoutPage;
