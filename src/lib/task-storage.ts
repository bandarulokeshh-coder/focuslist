import { STORAGE_KEY } from './constants';
import type { Priority, Task } from '@/types';

const PRIORITIES: Priority[] = ['high', 'medium', 'low'];

/** Stable empty snapshot returned during SSR/hydration and for empty storage. */
const SERVER_SNAPSHOT: Task[] = [];

let cachedTasks: Task[] | null = null;
const listeners = new Set<() => void>();

/** Runtime-validate a single value coming from localStorage or a backup file. */
function isTask(value: unknown): value is Task {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.title === 'string' &&
    typeof candidate.completed === 'boolean' &&
    typeof candidate.createdAt === 'number' &&
    PRIORITIES.includes(candidate.priority as Priority) &&
    (candidate.dueDate === undefined || typeof candidate.dueDate === 'string')
  );
}

/** Validate an untrusted value (e.g. a parsed backup file) as a task list. */
export function parseTaskList(value: unknown): Task[] | null {
  if (!Array.isArray(value) || !value.every(isTask)) return null;
  return value as Task[];
}

function readTasksFromStorage(): Task[] {
  if (typeof window === 'undefined') return SERVER_SNAPSHOT;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return SERVER_SNAPSHOT;
    return parseTaskList(JSON.parse(raw)) ?? SERVER_SNAPSHOT;
  } catch (error) {
    console.error('FocusList: could not read tasks from localStorage', error);
    return SERVER_SNAPSHOT;
  }
}

function emit(): void {
  listeners.forEach(listener => listener());
}

/** Client snapshot — lazily hydrated from localStorage and cached. */
export function getTasksSnapshot(): Task[] {
  if (cachedTasks === null) cachedTasks = readTasksFromStorage();
  return cachedTasks;
}

/** Server snapshot — React uses this for SSR and the hydration render. */
export function getTasksServerSnapshot(): Task[] {
  return SERVER_SNAPSHOT;
}

/** Persist a new task list and notify every subscribed component. */
export function writeTasks(next: Task[]): void {
  cachedTasks = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch (error) {
    console.error('FocusList: could not save tasks to localStorage', error);
  }
  emit();
}

/** Subscribe to local writes and to cross-tab `storage` events. */
export function subscribeToTasks(listener: () => void): () => void {
  listeners.add(listener);

  const handleStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    cachedTasks = readTasksFromStorage();
    emit();
  };

  window.addEventListener('storage', handleStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', handleStorage);
  };
}