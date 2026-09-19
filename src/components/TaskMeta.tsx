'use client';

import { memo } from 'react';
import { PRIORITY_COLORS, PRIORITY_LABELS } from '@/lib/constants';
import { formatDueDate, isOverdue } from '@/lib/task-utils';
import type { Task } from '@/types';

interface TaskMetaProps {
  task: Task;
}

/** Priority and due-date badges for a single task. */
function TaskMeta({ task }: TaskMetaProps) {
  const overdue = isOverdue(task);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span
        className={`rounded-full px-2 py-1 text-xs font-medium ${PRIORITY_COLORS[task.priority]}`}
      >
        {PRIORITY_LABELS[task.priority]}
      </span>

      {task.dueDate && (
        <span
          className={`rounded-full px-2 py-1 text-xs font-medium ${
            overdue
              ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200'
              : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
          }`}
        >
          <span aria-hidden="true">{overdue ? '⚠ ' : ' '}</span>
          {overdue ? 'Overdue: ' : 'Due: '}
          <time dateTime={task.dueDate}>{formatDueDate(task.dueDate)}</time>
        </span>
      )}
    </div>
  );
}

export default memo(TaskMeta);