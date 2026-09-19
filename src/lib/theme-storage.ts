import { THEME_STORAGE_KEY } from './constants';

export type Theme = 'light' | 'dark';

const listeners = new Set<() => void>();
let cachedTheme: Theme | null = null;

function readStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === 'dark' || stored === 'light') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function emit(): void {
  listeners.forEach(listener => listener());
}

/** Keep the `dark` class and `color-scheme` in sync with the active theme. */
function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  root.classList.toggle('dark', theme === 'dark');
  root.style.colorScheme = theme;
}

export function getThemeSnapshot(): Theme {
  if (cachedTheme === null) cachedTheme = readStoredTheme();
  return cachedTheme;
}

export function getThemeServerSnapshot(): Theme {
  return 'light';
}

export function setTheme(theme: Theme): void {
  cachedTheme = theme;
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (error) {
    console.error('FocusList: could not save the theme preference', error);
  }
  applyTheme(theme);
  emit();
}

/** React to OS colour-scheme changes and cross-tab preference updates. */
export function subscribeToTheme(listener: () => void): () => void {
  listeners.add(listener);

  const media = window.matchMedia('(prefers-color-scheme: dark)');
  const handleMediaChange = () => {
    if (window.localStorage.getItem(THEME_STORAGE_KEY)) return; // explicit choice wins
    cachedTheme = readStoredTheme();
    applyTheme(cachedTheme);
    emit();
  };
  const handleStorage = (event: StorageEvent) => {
    if (event.key !== THEME_STORAGE_KEY) return;
    cachedTheme = readStoredTheme();
    applyTheme(cachedTheme);
    emit();
  };

  media.addEventListener('change', handleMediaChange);
  window.addEventListener('storage', handleStorage);
  return () => {
    listeners.delete(listener);
    media.removeEventListener('change', handleMediaChange);
    window.removeEventListener('storage', handleStorage);
  };
}