'use client';

import { memo } from 'react';
import type { TaskStats } from '@/types';

interface ProgressBarProps {
  stats: TaskStats;
}

/** Overall completion progress shown as an accessible progress bar. */
function ProgressBar({ stats }: ProgressBarProps) {
  const percent = stats.total === 0 ? 0 : Math.round((stats.completed / stats.total) * 100);

  return (
    <div className="mt-4">
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="font-medium text-gray-700 dark:text-gray-300">Progress</span>
        <span className="text-gray-500 dark:text-gray-400">{percent}% complete</span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Task completion progress"
        className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700"
      >
        <div
          className="h-full rounded-full bg-indigo-600 transition-all duration-500 dark:bg-indigo-400"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

export default memo(ProgressBar);