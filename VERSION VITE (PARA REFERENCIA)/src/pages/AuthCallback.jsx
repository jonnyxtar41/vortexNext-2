import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { Helmet } from 'react-helmet-async';

const AuthCallback = () => {
    const navigate = useNavigate();
    const { toast } = useToast();

    useEffect(() => {
        toast({
            title: '✅ ¡Cuenta confirmada!',
            description: 'Tu correo ha sido verificado. Ahora puedes iniciar sesión.',
        });
        const timer = setTimeout(() => {
            navigate('/login');
        }, 3000);

        return () => clearTimeout(timer);
    }, [navigate, toast]);

    return (
        <>
            <Helmet>
                <title>Verificando...</title>
            </Helmet>
            <div className="w-full h-screen flex flex-col items-center justify-center bg-background text-foreground">
                <h1 className="text-3xl font-bold mb-4">Verificando tu cuenta...</h1>
                <p className="text-muted-foreground">Serás redirigido a la página de inicio de sesión en unos segundos.</p>
            </div>
        </>
    );
};

export default AuthCallback;