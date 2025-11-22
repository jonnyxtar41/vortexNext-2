
import { supabase } from '../src/lib/customSupabaseClient.js';

const findPostBySlug = async () => {
  const slugToFind = 'html-h1el-auge-de-la-inteligencia-artificial-impacto-tendencias-y-futuro-h1-h2por-que-la-ia-esta-transformando-el-mundo-h2-pla-inteligencia-artificial-ia-ha-experimentado-un-crecimiento-exponencial-en-los-ultimos-anos-impactando-profundamente-en-diversas-industrias-y-aspectos-de-nuestra-vida-cotidiana-desde-asistentes-virtuales-hasta-vehiculos-autonomos-la-ia-se-esta-integrando-cada-vez-mas-en-el-tejido-de-la-sociedad-p-h3tendencias-clave-en-el-uso-de-la-ia-h3-ul-listrongautomatizacion-de-tareas-strong-la-ia-automatiza-tareas-repetitivas-y-laboriosas-liberando-a-los-humanos-para-enfocarse-en-actividades-mas-creativas-y-estrategicas-li-listronganalisis-predictivo-strong-permite-predecir-tendencias-y-comportamientos-optimizando-la-toma-de-decisiones-en-areas-como-marketing-finanzas-y-logistica-li-listrongpersonalizacion-strong-la-ia-facilita-la-creacion-de-experiencias-personalizadas-para-los-usuarios-mejorando-la-satisfaccion-y-la-lealtad-del-cliente-li-listrongavances-en-el-aprendizaje-profundo-deep-learning-strong-el-aprendizaje-profundo-ha-impulsado-significativamente-el-desarrollo-de-la-ia-permitiendo-a-las-maquinas-aprender-y-mejorar-por-si-mismas-li-ul-h4el-impacto-de-la-ia-en-diferentes-sectores-h4-pla-ia-esta-revolucionando-sectores-como-la-salud-la-educacion-el-transporte-y-el-entretenimiento-en-la-salud-por-ejemplo-la-ia-ayuda-a-diagnosticar-enfermedades-desarrollar-nuevos-tratamientos-y-personalizar-la-atencion-al-paciente-p-pen-el-futuro-se-espera-que-la-ia-continue-evolucionando-y-transformando-el-mundo-de-maneras-aun-mas-profundas-es-fundamental-comprender-las-implicaciones-eticas-y-sociales-de-esta-tecnologia-para-garantizar-su-uso-responsable-y-beneficioso-para-la-humanidad-p';

  const { data, error } = await supabase
    .from('posts')
    .select('id, title, slug')
    .eq('slug', slugToFind)
    .single();

  if (error) {
    console.error('Error fetching post:', error);
    process.exit(1);
  }

  if (data) {
    console.log('Found post:');
  } else {
    console.log('Post not found.');
  }
  
  process.exit(0);
};

findPostBySlug();
