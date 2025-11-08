'use client';
import React, { createContext, useState, useContext } from 'react';

const LayoutContext = createContext();

export const useLayout = () => {
  return useContext(LayoutContext);
};

export const LayoutProvider = ({ children }) => {
  const [isSidePanelOpen, setSidePanelOpen] = useState(false);

  const toggleSidePanel = () => {
    setSidePanelOpen(prev => !prev);
  };

  const value = {
    isSidePanelOpen,
    setSidePanelOpen,
    toggleSidePanel,
  };

  return (
    <LayoutContext.Provider value={value}>
      {children}
    </LayoutContext.Provider>
  );
};