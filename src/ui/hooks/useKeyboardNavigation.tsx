import React, { createContext, useContext, useEffect } from 'react';

interface KeyboardNavigationContextProps {
  registerShortcut: (key: string, callback: () => void) => void;
}

const KeyboardNavigationContext = createContext<KeyboardNavigationContextProps | undefined>(undefined);

export const KeyboardNavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const shortcuts: Record<string, () => void> = {};

  const registerShortcut = (key: string, callback: () => void) => {
    shortcuts[key] = callback;
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (shortcuts[key]) {
        event.preventDefault();
        shortcuts[key]();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);

  return (
    <KeyboardNavigationContext.Provider value={{ registerShortcut }}>
      {children}
    </KeyboardNavigationContext.Provider>
  );
};

export const useKeyboardNavigation = () => {
  const context = useContext(KeyboardNavigationContext);
  if (!context) {
    throw new Error('useKeyboardNavigation must be used within a KeyboardNavigationProvider');
  }
  return context;
};
