'use client';

import React, { createContext, useContext } from 'react';

interface PortalContextType {
  isActive: boolean;
}

const PortalContext = createContext<PortalContextType>({ isActive: true });

export const PortalProvider: React.FC<{ isActive: boolean; children: React.ReactNode }> = ({ isActive, children }) => {
  return (
    <PortalContext.Provider value={{ isActive }}>
      {children}
    </PortalContext.Provider>
  );
};

export const usePortalContext = () => useContext(PortalContext);
