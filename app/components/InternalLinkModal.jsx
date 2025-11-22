import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/app/utils/supabase/client';
import  Input from '@/app/components/ui/input';
import  Button  from '@/app/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Search } from 'lucide-react';

const supabase = createClient();

const InternalLinkModal = ({ open, onOpenChange, onSelectPost }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchPosts = useCallback(async () => {
    if (searchTerm.length < 3) {
      setResults([]);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from('posts')
      .select('id, title, slug, sections(slug)')
      .or(`title.ilike.%${searchTerm}%,excerpt.ilike.%${searchTerm}%`)
      .eq('status', 'published')
      .limit(10);

    if (!error) {
      setResults(data);
    }
    setLoading(false);
  }, [searchTerm]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      searchPosts();
    }, 500);
    return () => clearTimeout(debounce);
  }, [searchTerm, searchPosts]);

  const handleSelect = (post) => {
    const url = `/${post.sections?.slug || 'blog'}/${post.slug}`;
    onSelectPost(url);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enlazar a un recurso existente</DialogTitle>
        </DialogHeader>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Busca por título o contenido..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
          {loading && <p>Buscando...</p>}
          {results.map((post) => (
            <div
              key={post.id}
              className="p-2 rounded-md hover:bg-accent cursor-pointer"
              onClick={() => handleSelect(post)}
            >
              <p className="font-semibold">{post.title}</p>
            </div>
          ))}
          {!loading && searchTerm.length >= 3 && results.length === 0 && (
            <p className="text-muted-foreground">No se encontraron resultados.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InternalLinkModal;