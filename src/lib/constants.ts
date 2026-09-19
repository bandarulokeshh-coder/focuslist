import type { FilterPriority, FilterStatus, Priority, SortBy } from '@/types';

/** localStorage key used to persist tasks */
export const STORAGE_KEY = 'focuslist-tasks';

/** localStorage key used to persist the theme preference */
export const THEME_STORAGE_KEY = 'focuslist-theme';

/** How long the undo snackbar stays visible (ms) */
export const UNDO_TIMEOUT_MS = 6000;

/** Numeric weight used to sort tasks by priority */
export const PRIORITY_ORDER: Record<Priority, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
};

/** Options for the status filter buttons: [value, label] */
export const STATUS_OPTIONS: [FilterStatus, string][] = [
  ['all', 'All'],
  ['active', 'Active'],
  ['completed', 'Completed'],
];

/** Options for the priority filter buttons: [value, label] */
export const PRIORITY_FILTER_OPTIONS: [FilterPriority, string][] = [
  ['all', 'All'],
  ['high', 'High'],
  ['medium', 'Medium'],
  ['low', 'Low'],
];

/** Options for the sort dropdown: [value, label] */
export const SORT_OPTIONS: [SortBy, string][] = [
  ['newest', 'Newest first'],
  ['oldest', 'Oldest first'],
  ['priority', 'Priority'],
  ['due', 'Due date'],
];
