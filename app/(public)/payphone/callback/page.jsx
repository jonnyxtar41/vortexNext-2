'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';

const PayPhoneCallbackPage = () => {
    const searchParams = useSearchParams();
    const { toast } = useToast();

    useEffect(() => {
        const id = searchParams.get('id');
        const clientTransactionId = searchParams.get('clientTransactionId');

        // Here you would typically make a request to your backend to verify the transaction
        // and update the order status in your database.

        toast({
            title: "Transacción de PayPhone",
            description: `ID: ${id}, Client Transaction ID: ${clientTransactionId}`,
        });

    }, [searchParams, toast]);

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-4">Procesando pago de PayPhone...</h1>
            <p>Por favor, espera un momento.</p>
        </div>
    );
};

export default PayPhoneCallbackPage;
