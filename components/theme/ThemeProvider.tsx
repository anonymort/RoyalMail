'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  mounted: boolean;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = 'rmdt-theme';

const applyTheme = (theme: Theme) => {
  if (typeof document === 'undefined') {
    return;
  }

  const root = document.documentElement;
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);
  const [hasStoredPreference, setHasStoredPreference] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const stored = window.localStorage.getItem(STORAGE_KEY);
    const persisted = stored === 'light' || stored === 'dark' ? stored : null;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const systemTheme: Theme = mediaQuery.matches ? 'dark' : 'light';
    const initialTheme: Theme = persisted ?? systemTheme;

    setThemeState(initialTheme);
    setHasStoredPreference(persisted !== null);
    applyTheme(initialTheme);
    setMounted(true);

    const handleMediaChange = (event: MediaQueryListEvent) => {
      if (window.localStorage.getItem(STORAGE_KEY)) {
        return;
      }

      const nextTheme: Theme = event.matches ? 'dark' : 'light';
      setThemeState(nextTheme);
      applyTheme(nextTheme);
    };

    mediaQuery.addEventListener('change', handleMediaChange);

    return () => mediaQuery.removeEventListener('change', handleMediaChange);
  }, []);

  useEffect(() => {
    if (!mounted) {
      return;
    }

    applyTheme(theme);

    if (hasStoredPreference) {
      window.localStorage.setItem(STORAGE_KEY, theme);
    }
  }, [theme, mounted, hasStoredPreference]);

  const setTheme = useCallback((nextTheme: Theme) => {
    setHasStoredPreference(true);
    setThemeState(nextTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setHasStoredPreference(true);
    setThemeState((current) => (current === 'dark' ? 'light' : 'dark'));
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, toggleTheme, setTheme, mounted }),
    [theme, toggleTheme, setTheme, mounted]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
};
