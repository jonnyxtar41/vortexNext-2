import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';

// Componente para manejar el callback de PayPhone después de un intento de pago.
// 'verify-payphone-payment' que usa el PAYPHONE_API_TOKEN para consultar el estado real
// de la transacción en la API de PayPhone.

const PayPhoneCallback = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [searchParams] = useSearchParams();
    
    const [status, setStatus] = useState('verifying');
    const [message, setMessage] = useState('Verificando el estado de tu pago con PayPhone. Esto puede tardar unos segundos...');

    // El transactionId (txid) debe ser el parámetro de retorno de PayPhone.
    const transactionId = searchParams.get('txid');

    useEffect(() => {
        if (!transactionId) {
            setStatus('error');
            setMessage('Error: No se encontró el ID de transacción en la URL. Contacta a soporte.');
            toast({ title: 'Error', description: 'Transacción inválida.', variant: 'destructive' });
            return;
        }

        const verifyPayment = async () => {
            try {
                // Llama a la función de servidor para verificar la transacción de forma segura
                const { data, error } = await supabase.functions.invoke('verify-payphone-payment', {
                    body: { transactionId },
                });

                if (error || data.error) {
                    // Si hay un error de comunicación del servidor o en la función
                    throw new Error(error?.message || data.error || 'Verificación fallida en el servidor.');
                }
                
                // data.status debe ser el estado devuelto por la API de PayPhone (e.g., 'succeeded')
                // data.postDownloadUrl debe ser la URL del archivo premium si el pago fue exitoso
                
                if (data.status === 'succeeded' && data.postDownloadUrl) {
                    setStatus('success');
                    setMessage('¡Pago confirmado! Tu descarga iniciará automáticamente. Revisa tu correo electrónico.');

                    toast({ title: '✅ Pago Exitoso', description: '¡Gracias por tu compra!' });
                    
                    // Iniciar la descarga y redirigir
                    setTimeout(() => {
                        window.open(data.postDownloadUrl, '_blank', 'noopener,noreferrer');
                        navigate(`/`);
                    }, 3000);

                } else {
                    // Pago no completado, fallido o pendiente
                    setStatus('error');
                    setMessage(`El pago no se completó. Estado: ${data.status || 'fallido'}. Por favor, inténtalo de nuevo o contacta a soporte.`);
                    toast({ title: '❌ Pago Fallido', description: 'Hubo un error con la transacción.', variant: 'destructive' });
                }

            } catch (err) {
                setStatus('error');
                setMessage(`Error de comunicación: ${err.message}. Por favor, contacta a soporte para verificar tu pago.`);
                toast({ title: 'Error', description: 'Error al verificar el pago.', variant: 'destructive' });
            }
        };

        verifyPayment();

    }, [transactionId, navigate, toast]);

    let displayIcon;
    let iconColor;
    if (status === 'verifying') {
        displayIcon = <Loader2 className="w-16 h-16 animate-spin text-primary" />;
        iconColor = 'text-primary';
    } else if (status === 'success') {
        displayIcon = <CheckCircle className="w-16 h-16 text-green-500" />;
        iconColor = 'text-green-500';
    } else {
        displayIcon = <XCircle className="w-16 h-16 text-red-500" />;
        iconColor = 'text-red-500';
    }

    return (
        <>
            <Helmet>
                <title>Estado de Pago PayPhone</title>
            </Helmet>
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md glass-effect p-8 rounded-2xl text-center space-y-6"
                >
                    <div className="flex justify-center">
                        {displayIcon}
                    </div>
                    <h1 className={`text-2xl font-bold ${iconColor}`}>{status === 'success' ? 'Pago Exitoso' : status === 'error' ? 'Transacción Fallida' : 'Procesando...'}</h1>
                    <p className="text-muted-foreground">{message}</p>
                    {status !== 'verifying' && (
                        <Button onClick={() => navigate('/')} className="w-full">
                            Volver al Inicio
                        </Button>
                    )}
                </motion.div>
            </div>
        </>
    );
};

export default PayPhoneCallback;
