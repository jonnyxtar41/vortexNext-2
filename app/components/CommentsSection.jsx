import React, { useState, useEffect } from 'react';
import { getCommentsByPostId, addComment } from '@/app/lib/supabase/comments';
import { Button } from '@/app/components/ui/button';
import { Textarea } from '@/app/components/ui/textarea';
import { Input } from '@/app/components/ui/input';
import { useToast } from '@/app/components/ui/use-toast';
import { Loader2, Send } from 'lucide-react';
import { useAuth } from '@/app/contexts/SupabaseAuthContext';
import { createClient } from '@/app/utils/supabase/client';

const supabase = createClient();

const Comment = ({ comment, onReply }) => (
    <div className="p-4 my-4 bg-background/50 rounded-lg">
        <div className="flex justify-between items-center mb-2">
            <p className="font-bold text-foreground">{comment.author_name}</p>
            <p className="text-xs text-muted-foreground">{new Date(comment.created_at).toLocaleString()}</p>
        </div>
        <p className="text-muted-foreground">{comment.content}</p>
        <Button variant="link" size="sm" className="p-0 h-auto mt-2" onClick={() => onReply(comment)}>Responder</Button>
        
        {comment.replies && comment.replies.length > 0 && (
            <div className="pl-6 mt-4 border-l-2 border-border">
                {comment.replies.map(reply => (
                    <Comment key={reply.id} comment={reply} onReply={onReply} />
                ))}
            </div>
        )}
    </div>
);

const CommentsSection = ({ postId }) => {
    const { toast } = useToast();
    const { user } = useAuth();
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState('');
    const [authorName, setAuthorName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [replyingTo, setReplyingTo] = useState(null);

    useEffect(() => {
        if(user) {
            setAuthorName(user.user_metadata?.full_name || user.email);
        }
    }, [user]);

    const fetchComments = async () => {
        setLoading(true);
        const fetchedComments = await getCommentsByPostId(supabase, postId);
        setComments(fetchedComments);
        setLoading(false);
    };

    useEffect(() => {
        fetchComments();
    }, [postId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim() || !authorName.trim()) {
            toast({ title: "Nombre y comentario son requeridos", variant: "destructive" });
            return;
        }

        setIsSubmitting(true);
        const { error } = await addComment(supabase, {
            post_id: postId,
            content: newComment,
            author_name: authorName,
            parent_id: replyingTo ? replyingTo.id : null,
        });

        if (error) {
            toast({ title: "Error al enviar el comentario", variant: "destructive" });
        } else {
            toast({ title: "Comentario enviado" });
            setNewComment('');
            setReplyingTo(null);
            await fetchComments();
        }
        setIsSubmitting(false);
    };

    if (loading) return <Loader2 className="animate-spin my-8" />;

    return (
        <div className="mt-16 pt-12 border-t-2 border-border">
            <h2 className="text-3xl font-bold mb-8">Comentarios ({comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0)})</h2>
            
            <form onSubmit={handleSubmit} className="mb-12 p-6 glass-effect rounded-lg space-y-4">
                <h3 className="font-bold text-lg">{replyingTo ? `Respondiendo a ${replyingTo.author_name}` : 'Deja un comentario'}</h3>
                {!user && (
                    <div>
                        <Input 
                            type="text" 
                            placeholder="Tu nombre" 
                            value={authorName} 
                            onChange={(e) => setAuthorName(e.target.value)}
                            required
                        />
                    </div>
                )}
                <div>
                    <Textarea 
                        placeholder="Escribe tu comentario aquí..." 
                        value={newComment} 
                        onChange={(e) => setNewComment(e.target.value)}
                        required
                    />
                </div>
                <div className="flex justify-end gap-2">
                    {replyingTo && <Button variant="ghost" onClick={() => setReplyingTo(null)}>Cancelar respuesta</Button>}
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                        {isSubmitting ? 'Enviando...' : 'Enviar'}
                    </Button>
                </div>
            </form>

            <div className="space-y-6">
                {comments.map(comment => (
                    <Comment key={comment.id} comment={comment} onReply={(c) => setReplyingTo(c)} />
                ))}
                {comments.length === 0 && <p className="text-muted-foreground">Sé el primero en comentar.</p>}
            </div>
        </div>
    );
};

export default CommentsSection;