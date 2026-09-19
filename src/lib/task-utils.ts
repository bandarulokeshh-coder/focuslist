import { PRIORITY_ORDER } from './constants';
import type { FilterPriority, FilterStatus, SortBy, Task, TaskStats } from '@/types';

/** Whether a task is incomplete and past its due date */
export function isOverdue(task: Task): boolean {
  return (
    !!task.dueDate &&
    !task.completed &&
    new Date(`${task.dueDate}T23:59:59`) < new Date()
  );
}

/** Cycle a task's priority high -> medium -> low -> high */
export function getNextPriority(priority: Task['priority']): Task['priority'] {
  return priority === 'high' ? 'medium' : priority === 'medium' ? 'low' : 'high';
}

/** Format a task due date for display */
export function formatDueDate(dueDate: string): string {
  return new Date(`${dueDate}T00:00:00`).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

interface FilterOptions {
  searchTerm: string;
  filterStatus: FilterStatus;
  filterPriority: FilterPriority;
  sortBy: SortBy;
}

/** Filter tasks by search/status/priority, then sort them */
export function filterAndSortTasks(tasks: Task[], options: FilterOptions): Task[] {
  const { searchTerm, filterStatus, filterPriority, sortBy } = options;
  const term = searchTerm.trim().toLowerCase();

  const filtered = tasks.filter(task => {
    const statusMatch =
      filterStatus === 'all' ||
      (filterStatus === 'active' && !task.completed) ||
      (filterStatus === 'completed' && task.completed);

    const priorityMatch = filterPriority === 'all' || task.priority === filterPriority;

    const searchMatch = term === '' || task.title.toLowerCase().includes(term);

    return statusMatch && priorityMatch && searchMatch;
  });

  const sorted = [...filtered];
  switch (sortBy) {
    case 'oldest':
      sorted.sort((a, b) => a.createdAt - b.createdAt);
      break;
    case 'priority':
      sorted.sort(
        (a, b) =>
          PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority] ||
          b.createdAt - a.createdAt
      );
      break;
    case 'due':
      sorted.sort((a, b) => {
        if (!a.dueDate) return 1; // tasks without a due date go last
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      });
      break;
    default: // newest
      sorted.sort((a, b) => b.createdAt - a.createdAt);
  }
  return sorted;
}

/** Aggregate task statistics for the stats panel */
export function computeStats(tasks: Task[]): TaskStats {
  const total = tasks.length;
  const completed = tasks.filter(task => task.completed).length;
  return {
    total,
    completed,
    pending: total - completed,
    overdue: tasks.filter(isOverdue).length,
  };
}
