'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';

export const metadata = {
  title: 'Verificando...',
};

const AuthCallback = () => {
    const router = useRouter();
    const { toast } = useToast();

    useEffect(() => {
        toast({
            title: '✅ ¡Cuenta confirmada!',
            description: 'Tu correo ha sido verificado. Ahora puedes iniciar sesión.',
        });
        const timer = setTimeout(() => {
            router.push('/login');
        }, 3000);

        return () => clearTimeout(timer);
    }, [router, toast]);

    return (
        <div className="w-full h-screen flex flex-col items-center justify-center bg-background text-foreground">
            <h1 className="text-3xl font-bold mb-4">Verificando tu cuenta...</h1>
            <p className="text-muted-foreground">Serás redirigido a la página de inicio de sesión en unos segundos.</p>
        </div>
    );
};

export default AuthCallback;
