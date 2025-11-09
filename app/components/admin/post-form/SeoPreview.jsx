// app/components/admin/post-form/SeoPreview.jsx
'use client';

import React from 'react';

const SeoPreview = ({ title, description, slug }) => {
  const siteUrl = "https://zonadex.es"; // Puedes cambiar esto o pasarlo como prop
  const postUrl = slug ? `${siteUrl}/${slug}` : `${siteUrl}/tu-post-slug`;

  // Google trunca por píxeles, pero usamos caracteres como una buena aproximación.
  const titleLimit = 60;
  const descriptionLimit = 160;
  const urlLimit = 50;

  // Limpia la descripción: quita el bloque de código Markdown y luego las etiquetas HTML.
  const plainDescription = description
    .replace(/^```html\n?/, '') // Quita el ```html del inicio
    .replace(/\n?```$/, '')   // Quita el ``` del final
    .replace(/<[^>]*>?/gm, ''); // Quita las etiquetas HTML restantes

  const truncatedTitle = title.length > titleLimit ? `${title.substring(0, titleLimit)}...` : title;
  const truncatedDescription = plainDescription.length > descriptionLimit ? `${plainDescription.substring(0, descriptionLimit)}...` : plainDescription;
  const truncatedUrl = postUrl.length > urlLimit ? `${postUrl.substring(0, urlLimit)}...` : postUrl;

  return (
    <div className="p-4 border border-gray-200 rounded-lg mt-6 bg-white dark:bg-gray-900 shadow-md">
      <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">Vista Previa de Google</h3>
      <div className="font-sans">
        <div>
          <span className="text-sm text-green-700 dark:text-green-500">{truncatedUrl}</span>
        </div>
        <h4 className="text-xl text-blue-800 dark:text-blue-500 font-medium hover:underline cursor-pointer truncate">
          {truncatedTitle || "Meta Título de la Publicación"}
        </h4>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {truncatedDescription || "Aquí aparecerá la meta descripción de tu publicación. Escribe una que sea atractiva para los usuarios."}
        </p>
      </div>
    </div>
  );
};

export default SeoPreview;