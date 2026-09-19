'use client';

import { memo } from 'react';
import { useTheme } from '@/hooks/useTheme';

/** Accessible light/dark mode switch persisted across sessions. */
function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      aria-pressed={isDark}
      title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      className="rounded-lg border border-gray-300 bg-white/80 px-3 py-2 text-sm shadow-sm transition-colors hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800/80 dark:hover:bg-gray-800"
    >
      <span aria-hidden="true">{isDark ? '☀️' : '🌙'}</span>
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}

export default memo(ThemeToggle);