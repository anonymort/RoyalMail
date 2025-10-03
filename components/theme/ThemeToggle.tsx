'use client';

import { useMemo } from 'react';
import { useTheme } from './ThemeProvider';

const iconBase = 'h-5 w-5 transition-transform duration-300';

const SunIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    className={iconBase}
    aria-hidden
  >
    <circle cx="12" cy="12" r="4" />
    <path d="M12 3v2" />
    <path d="M12 19v2" />
    <path d="M21 12h-2" />
    <path d="M5 12H3" />
    <path d="m18.364 5.636-1.414 1.414" />
    <path d="m7.05 16.95-1.414 1.414" />
    <path d="m18.364 18.364-1.414-1.414" />
    <path d="m7.05 7.05-1.414-1.414" />
  </svg>
);

const MoonIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    className={iconBase}
    aria-hidden
  >
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
  </svg>
);

export function ThemeToggle() {
  const { theme, toggleTheme, mounted } = useTheme();

  const { label, icon } = useMemo(() => {
    const isDark = theme === 'dark';
    return {
      label: isDark ? 'Switch to light mode' : 'Switch to dark mode',
      icon: isDark ? <MoonIcon /> : <SunIcon />
    };
  }, [theme]);

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-cat-surface2 bg-cat-surface0 text-cat-subtext0 transition hover:border-cat-overlay1 hover:text-cat-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cat-sky"
    >
      {mounted ? icon : <span className="block h-5 w-5" />}
    </button>
  );
}
