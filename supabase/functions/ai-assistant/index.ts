// Configuración de cabeceras CORS para permitir peticiones desde tu frontend
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// URL de la API de Gemini
// NOTA: Si 'gemini-2.0-flash' te da error 404, prueba cambiarlo a 'gemini-1.5-flash'
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`;

Deno.serve(async (req) => {
  // 1. Manejo de la solicitud pre-vuelo (preflight) de CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 2. Obtener la API Key de las variables de entorno
    const GOOGLE_API_KEY = Deno.env.get("GOOGLE_API_KEY");

    if (!GOOGLE_API_KEY) {
      throw new Error("El secreto GOOGLE_API_KEY no está configurado en tu panel de Supabase Self-Hosted.");
    }

    // 3. Obtener el body de la petición
    const { prompt } = await req.json();

    if (!prompt) {
      return new Response(JSON.stringify({ error: "El 'prompt' es requerido" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // 4. Preparar el prompt del sistema (Tu modificación para HTML)
    const systemPrompt = `
      Eres un asistente experto en SEO y redacción de contenido para blogs.
      Tu tarea es generar contenido basado en el prompt del usuario.
      IMPORTANTE: Formatea tu respuesta directamente en HTML. Utiliza exclusivamente las siguientes etiquetas: <h1>, <h2>, <h3>, <h4>, <p>, <strong> para negritas, y <ul> con <li> para listas. No uses markdown.
      No incluyas etiquetas <html>, <head>, o <body>. La respuesta debe ser solo el fragmento de contenido HTML listo para ser insertado en un editor.

      Prompt del usuario: "${prompt}"
    `;

    // 5. Llamada a la API de Google Gemini
    const response = await fetch(`${API_URL}?key=${GOOGLE_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: systemPrompt }]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error de la API de Google AI:", errorData);
      throw new Error(errorData.error?.message || "Falló la llamada a la API de Google AI");
    }

    const data = await response.json();
    const aiResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!aiResponse) {
      console.error("Estructura de respuesta inválida desde la API de IA:", data);
      throw new Error("La API de IA no devolvió contenido válido.");
    }

    // 6. Devolver la respuesta generada
    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error en la Edge function:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});