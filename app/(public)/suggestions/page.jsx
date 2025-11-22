'use client';

import { useState } from 'react';
import { useToast } from '@/app/components/ui/use-toast';
import  Button  from '@/app/components/ui/button';
import  Input from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import  Label from '@/app/components/ui/label';


import { createClient } from '@/app/utils/supabase/client'; 

const supabase = createClient(); 

const SuggestionsPage = () => {
    const { toast } = useToast();
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const { error } = await supabase.from('suggestions').insert({ email, message });
        if (error) {
            toast({ title: 'Error al enviar la sugerencia', description: error.message, variant: 'destructive' });
        } else {
            toast({ title: '¡Sugerencia enviada!', description: 'Gracias por tu feedback.' });
            setEmail('');
            setMessage('');
        }
        setLoading(false);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Buzón de Sugerencias</h1>
            <form onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-4">
                <div>
                    <Label htmlFor="email">Tu correo (opcional)</Label>
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div>
                    <Label htmlFor="message">Sugerencia</Label>
                    <Textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} required />
                </div>
                <Button type="submit" disabled={loading}>{loading ? 'Enviando...' : 'Enviar Sugerencia'}</Button>
            </form>
        </div>
    );
};

export default SuggestionsPage;
