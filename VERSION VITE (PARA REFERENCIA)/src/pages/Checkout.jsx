import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/customSupabaseClient';
import { getAllSiteContent, addPayment } from '@/lib/supabase/siteContent';
import { getPostBySlug, incrementPostStat } from '@/lib/supabase/posts';
import { ShoppingCart, CreditCard, Loader2, Tag } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';



const Checkout = () => {
    const { postSlug } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { user } = useAuth();
    const [post, setPost] = useState(null);
    const [config, setConfig] = useState({});
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [postData, allContent] = await Promise.all([
                    getPostBySlug(postSlug),
                    getAllSiteContent(),
                ]);

                if (!postData || !postData.is_premium) {
                    toast({ title: 'Recurso no válido', description: 'Este recurso no está a la venta.', variant: 'destructive' });
                    navigate('/');
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
                toast({ title: 'Error', description: 'No se pudo cargar la información del producto.', variant: 'destructive' });
                navigate('/');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [postSlug, navigate, toast, user]);

    const finalAmount = useMemo(() => {
        if (!post) return 0;
        if (post.is_discount_active && post.discount_percentage > 0) {
            const discount = (post.price * post.discount_percentage) / 100;
            return (post.price - discount).toFixed(2);
        }
        return parseFloat(post.price).toFixed(2);
    }, [post]);
    
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

    return (
        <>
            <Helmet>
                <title>Comprar: {post.title}</title>
                <meta name="description" content={`Página de pago para adquirir ${post.title}.`} />
            </Helmet>
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


                            {/* --- OPCIÓN DE PAGO CON PAYPHONE --- */}
                            {isPayPhoneActive && (
                                <>
                                    <div className="relative my-4">
                                        <div className="absolute inset-0 flex items-center" aria-hidden="true"><div className="w-full border-t border-white/20" /></div>
                                        {isStripeActive && <div className="relative flex justify-center"><span className="bg-gray-800 px-2 text-sm text-muted-foreground">o</span></div>}
                                    </div>
                                    <Button
                                        type="button"
                                        onClick={handlePayPhoneCheckout}
                                        className="w-full bg-green-500 hover:bg-green-600 text-white text-lg py-6"
                                        size="lg"
                                        disabled={isProcessing || !isPayPhoneActive}
                                    >
                                        {isProcessing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'Pagar con PayPhone (Ecuador)'}
                                    </Button>
                                </>
                            )}
                            {/* --- FIN OPCIÓN DE PAGO CON PAYPHONE --- */}

                            {!isStripeActive && !isPayPhoneActive && (
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

export default Checkout;