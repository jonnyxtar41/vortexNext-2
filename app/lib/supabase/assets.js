import { supabase } from '@/app/lib/customSupabaseClient';

export const listSiteAssets = async () => {
    const { data, error } = await supabase.storage
        .from('site-assets')
        .list('post-main-images', { // List files from the 'post-main-images' subfolder
            limit: 100,
            offset: 0,
            sortBy: { column: 'created_at', order: 'desc' },
        });

    return { data, error };
};

export const deleteSiteAsset = async (assetNames) => {
    const subfolder = 'post-main-images';
    let pathsToDelete = [];

    if (Array.isArray(assetNames)) {
        pathsToDelete = assetNames.map(name => `${subfolder}/${name}`);
    } else {
        pathsToDelete = [`${subfolder}/${assetNames}`];
    }

    const { data, error } = await supabase.storage
        .from('site-assets')
        .remove(pathsToDelete);

    return { data, error };
};

export const uploadSiteAsset = async (file, path) => {
    const { data, error } = await supabase.storage
      .from('site-assets')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (error) {
      console.error('Error uploading asset:', error);
      return null;
    }

    const { data: publicUrlData } = supabase.storage
      .from('site-assets')
      .getPublicUrl(data.path);
      
    return publicUrlData.publicUrl;
};

export const uploadDownloadableAsset = async (file) => {
    if (!file) return null;

    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { data, error } = await supabase.storage
      .from('downloadable-assets')
      .upload(filePath, file);

    if (error) {
      console.error('Error uploading downloadable asset:', error);
      return null;
    }
    
    const { data: publicUrlData } = supabase.storage
      .from('downloadable-assets')
      .getPublicUrl(data.path);

    return publicUrlData.publicUrl;
};

export const uploadPostImage = async (file) => {
    if (!file) return null;

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `post-images/${fileName}`; // Upload to a 'post-images' folder

    const { data, error } = await supabase.storage
      .from('site-assets') // Use the 'site-assets' bucket
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false, // Don't upsert to avoid overwriting files
      });

    if (error) {
      console.error('Error uploading post image:', error);
      return null;
    }

    const { data: publicUrlData } = supabase.storage
      .from('site-assets')
      .getPublicUrl(data.path);
      
    return publicUrlData.publicUrl;
};

export const uploadBase64Image = async (dataUrl, folder = 'post-main-images') => {
    if (!dataUrl) return null;

    // Extract MIME type and base64 data
    const arr = dataUrl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg'; // Default to jpeg if not found
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }

    const file = new Blob([u8arr], { type: mime });

    const fileExt = mime.split('/')[1];
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { data, error } = await supabase.storage
        .from('site-assets') // Changed from 'assets' to 'site-assets'
        .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
        });

    if (error) {
        console.error('Error uploading base64 image to site-assets bucket:', error);
        return null;
    }

    const { data: publicUrlData, error: publicUrlError } = supabase.storage
        .from('site-assets')
        .getPublicUrl(data.path);

    if (publicUrlError) {
        console.error('Error getting public URL for uploaded image:', publicUrlError);
        return null;
    }
    console.log('Supabase public URL data:', publicUrlData);

    return publicUrlData.publicUrl;
};