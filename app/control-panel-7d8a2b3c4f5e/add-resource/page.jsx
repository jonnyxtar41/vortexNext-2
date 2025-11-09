'use client';

import React, { useState, useEffect, useCallback } from 'react';
import PostForm from '@/components/admin/PostForm';
import { getSections } from '@/lib/supabase/sections';
import { addPost } from '@/lib/supabase/posts';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const AddResourcePage = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [sections, setSections] = useState([]);

    const fetchData = useCallback(async () => {
        const sectionsData = await getSections();
        setSections(sectionsData || []);
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handlePostSave = async (postData) => {
        try {
            await addPost({ ...postData, user_id: user.id });
            toast({ title: "✅ Recurso añadido", description: "El nuevo recurso ha sido guardado." });
            fetchData(); // Refetch data to update any related components
            return true;
        } catch (error) {
            toast({ title: "❌ Error al guardar", description: error.message, variant: "destructive" });
            return false;
        }
    };

    const handleNewPost = () => {
        fetchData();
    };

    return (
        <PostForm 
            sections={sections} 
            onSave={handlePostSave} 
            onNewPost={handleNewPost} 
        />
    );
};

export default AddResourcePage;
