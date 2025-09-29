import React, { createContext, useContext } from 'react';

export interface NavbarContextValue {
  setActions: (actions: React.ReactNode) => void;
}

export const NavbarContext = createContext<NavbarContextValue | undefined>(undefined);

export function useNavbar(): NavbarContextValue {
  const context = useContext(NavbarContext);
  if (!context) {
    throw new Error('useNavbar must be used within a NavbarContext provider');
  }
  return context;
}
