// app/control-panel-7d8a2b3c4f5e/manage-site-content/page.jsx

import { createClient } from '@/app/utils/supabase/server'; // 1. Importar el cliente de SERVIDOR
import { getAllSiteContent } from '@/app/lib/supabase/siteContent';
import { getSections } from '@/app/lib/supabase/sections';
import ManageSiteContentClient from './ManageSiteContentClient';

// Esta es la página (Componente de Servidor)
export default async function ManageSiteContentPage() {
    
    // 2. Crear una instancia del cliente de Supabase para el servidor
    const supabase = createClient();

    // 3. ¡Pasar el cliente a las funciones de fetching!
    const [allContentData, sectionsData] = await Promise.all([
        getAllSiteContent(supabase),
        getSections(supabase),
    ]);

    // Mapeamos el contenido como en tu lógica original
    const contentMap = (allContentData || []).reduce((acc, item) => {
        acc[item.key] = item.value;
        return acc;
    }, {});

    // 4. Pasamos los datos iniciales al componente de cliente
    return (
        <ManageSiteContentClient 
            initialContent={contentMap} 
            initialSections={sectionsData || []} 
        />
    );
}