'use client';

import { useCallback, useSyncExternalStore } from 'react';
import {
  getThemeServerSnapshot,
  getThemeSnapshot,
  setTheme,
  subscribeToTheme,
} from '@/lib/theme-storage';
import type { Theme } from '@/lib/theme-storage';

export type { Theme };

/**
 * Persisted light/dark theme, applied via a `dark` class on <html>.
 * Falls back to the user's OS colour-scheme preference.
 */
export function useTheme() {
  const theme = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    getThemeServerSnapshot
  );

  const toggleTheme = useCallback(() => {
    setTheme(getThemeSnapshot() === 'dark' ? 'light' : 'dark');
  }, []);

  return { theme, isDark: theme === 'dark', toggleTheme };
}