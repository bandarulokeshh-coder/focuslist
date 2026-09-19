'use client';

import { memo } from 'react';
import ProgressBar from './ProgressBar';
import type { TaskStats } from '@/types';

interface StatsPanelProps {
  stats: TaskStats;
}

const CARD_BASE =
  'rounded-lg bg-gray-50 p-3 text-center transition-colors sm:p-4 dark:bg-gray-700/50';

/** Summary statistics with a completion progress bar. */
function StatsPanel({ stats }: StatsPanelProps) {
  return (
    <section
      aria-label="Task statistics"
      className="mb-6 rounded-xl bg-white p-4 shadow-lg sm:mb-8 sm:p-6 dark:bg-gray-800"
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <div className={CARD_BASE}>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Tasks</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</p>
        </div>
        <div className={CARD_BASE}>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Completed</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {stats.completed}
          </p>
        </div>
        <div className={CARD_BASE}>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending</p>
          <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {stats.pending}
          </p>
        </div>
        <div className={CARD_BASE}>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Overdue</p>
          <p
            className={`text-2xl font-bold ${
              stats.overdue > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-gray-100'
            }`}
          >
            {stats.overdue}
          </p>
        </div>
      </div>

      <ProgressBar stats={stats} />
    </section>
  );
}

export default memo(StatsPanel);