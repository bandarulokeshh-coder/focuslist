export type Priority = 'high' | 'medium' | 'low';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: Priority;
  createdAt: number;
  /** ISO date string (yyyy-mm-dd), undefined when no due date is set */
  dueDate?: string;
}

export type SortBy = 'newest' | 'oldest' | 'priority' | 'due';

export type FilterStatus = 'all' | 'active' | 'completed';

export type FilterPriority = 'all' | Priority;

export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
}
