'use client';
import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';

interface HeaderConfig {
  searchPlaceholder: string;
  addNewLabel: string | null;
  onAddNew: (() => void) | null;
  onSearchChange: ((q: string) => void) | null;
}

interface HeaderContextValue extends HeaderConfig {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  setHeaderConfig: (config: Partial<HeaderConfig>) => void;
  resetHeader: () => void;
}

const EMPTY: HeaderConfig = {
  searchPlaceholder: 'Search...',
  addNewLabel: null,
  onAddNew: null,
  onSearchChange: null,
};

const HeaderContext = createContext<HeaderContextValue>({
  ...EMPTY,
  searchQuery: '',
  setSearchQuery: () => {},
  setHeaderConfig: () => {},
  resetHeader: () => {},
});

export function usePageHeader(config?: Partial<HeaderConfig>) {
  const ctx = useContext(HeaderContext);
  useEffect(() => {
    if (config) {
      ctx.setHeaderConfig(config);
    }
    return () => ctx.resetHeader();
  }, []);
  return ctx;
}

export function HeaderProvider({ children }: { children: ReactNode }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [config, setConfig] = useState<HeaderConfig>(EMPTY);

  const setHeaderConfig = useCallback((partial: Partial<HeaderConfig>) => {
    setConfig(prev => ({ ...prev, ...partial }));
  }, []);

  const resetHeader = useCallback(() => {
    setConfig(EMPTY);
    setSearchQuery('');
  }, []);

  return (
    <HeaderContext.Provider
      value={{
        ...config,
        searchQuery,
        setSearchQuery,
        setHeaderConfig,
        resetHeader,
      }}
    >
      {children}
    </HeaderContext.Provider>
  );
}
