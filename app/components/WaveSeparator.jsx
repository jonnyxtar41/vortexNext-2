'use client';
import React from 'react';
import { motion } from 'framer-motion';

const WaveSeparator = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      // Aplica un margen negativo para superponer la onda sobre la sección Hero 
      // y ajusta la altura para darle forma a la onda.
      className="relative w-full h-[60px] md:h-[120px] -mt-16 sm:-mt-20 overflow-hidden" 
    >
      <svg
        viewBox="0 0 1440 100"
        className="w-full h-full absolute top-0 left-0"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* El path define la forma de la onda. 
            El fill usa la variable de CSS para que el color se adapte al tema. */}
        <path
          d="M0,50 C240,150 480,-50 720,50 C960,150 1200,-50 1440,50 L1440,100 L0,100 Z"
          fill="#C7C7C7"
              
        ></path>
      </svg>
    </motion.div>
  );
};

export default WaveSeparator;