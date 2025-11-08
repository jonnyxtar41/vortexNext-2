
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = document.cookie.split('; ').find(row => row.startsWith('cookie_consent='));
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    const expires = new Date();
    expires.setDate(expires.getDate() + 365);
    document.cookie = `cookie_consent=true; expires=${expires.toUTCString()}; path=/`;
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: '0%' }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 200, damping: 25 }}
          className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 flex items-center justify-between shadow-lg z-50"
        >
          <p className="text-sm">
            Utilizamos cookies de terceros para generar estadísticas de audiencia y mostrar publicidad personalizada analizando tu navegación. Si sigues navegando estarás aceptando su uso. {' '}
            <Link to="/politicas" className="font-bold text-orange-400 hover:text-orange-300 transition-colors underline">
              Más información
            </Link>
          </p>
          <button
            onClick={handleAccept}
            className="p-2 rounded-full hover:bg-gray-700 transition-colors"
            aria-label="Aceptar y cerrar aviso de cookies"
          >
            <X className="h-5 w-5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieConsent;
