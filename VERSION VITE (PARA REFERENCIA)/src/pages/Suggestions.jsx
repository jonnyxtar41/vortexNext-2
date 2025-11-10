
    import React, { useState } from 'react';
    import { Helmet } from 'react-helmet-async';
    import { motion } from 'framer-motion';
    import { Input } from '@/components/ui/input';
    import { Textarea } from '@/components/ui/textarea';
    import { Button } from '@/components/ui/button';
    import { Label } from '@/components/ui/label';
    import { useToast } from '@/components/ui/use-toast';
    import { supabase } from '@/lib/customSupabaseClient';
    import { logActivity } from '@/lib/supabase/log';
    import { Send, Mail, MessageSquare } from 'lucide-react';

    const Suggestions = () => {
        const [email, setEmail] = useState('');
        const [message, setMessage] = useState('');
        const [loading, setLoading] = useState(false);
        const { toast } = useToast();

        const handleSubmit = async (e) => {
            e.preventDefault();
            if (!message) {
                toast({
                    title: 'Mensaje vacío',
                    description: 'Por favor, escribe tu sugerencia antes de enviar.',
                    variant: 'destructive',
                });
                return;
            }

            setLoading(true);
            const { error } = await supabase
                .from('suggestions')
                .insert([{ email: email || null, message }]);

            if (error) {
                toast({
                    title: 'Error al enviar',
                    description: 'Hubo un problema al enviar tu sugerencia. Por favor, inténtalo de nuevo.',
                    variant: 'destructive',
                });
            } else {
                toast({
                    title: '¡Gracias por tu sugerencia!',
                    description: 'Hemos recibido tu mensaje y lo tendremos en cuenta.',
                });
                setEmail('');
                setMessage('');
            }
            setLoading(false);
        };

        return (
            <>
                <Helmet>
                    <title>Sugerencias y Recomendaciones - Zona Vortex</title>
                    <meta name="description" content="Envíanos tus sugerencias y recomendaciones para mejorar Zona Vortex. ¡Tu opinión es importante para nosotros!" />
                </Helmet>
                <div className="container mx-auto px-6 py-20 min-h-[calc(100vh-200px)] flex items-center">
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="w-full max-w-2xl mx-auto"
                    >
                        <div className="text-center mb-12">
                            <h1 className="text-4xl lg:text-5xl font-bold mb-4">
                                Sugerencias y <span className="gradient-text">Recomendaciones</span>
                            </h1>
                            <p className="text-lg text-gray-300">
                                ¿Tienes alguna idea para mejorar? ¡Nos encantaría escucharla! Tu feedback nos ayuda a crecer.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="glass-effect p-8 rounded-2xl space-y-6">
                            <div>
                                <Label htmlFor="email" className="flex items-center gap-2 mb-2"><Mail className="w-4 h-4" /> Correo electrónico (Opcional)</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="tu@correo.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="bg-black/30 border-white/20"
                                />
                            </div>
                            <div>
                                <Label htmlFor="message" className="flex items-center gap-2 mb-2"><MessageSquare className="w-4 h-4" /> Tu mensaje</Label>
                                <Textarea
                                    id="message"
                                    placeholder="Escribe aquí tu sugerencia..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    rows={6}
                                    className="bg-black/30 border-white/20"
                                    required
                                />
                            </div>
                            <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700" disabled={loading}>
                                {loading ? 'Enviando...' : (
                                    <>
                                        <Send className="w-4 h-4 mr-2" />
                                        Enviar Sugerencia
                                    </>
                                )}
                            </Button>
                        </form>
                    </motion.div>
                </div>
            </>
        );
    };

    export default Suggestions;
  