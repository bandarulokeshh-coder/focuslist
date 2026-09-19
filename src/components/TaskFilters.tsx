'use client';

import { memo } from 'react';
import {
  PRIORITY_FILTER_OPTIONS,
  SORT_OPTIONS,
  STATUS_OPTIONS,
} from '@/lib/constants';
import type { FilterPriority, FilterStatus, SortBy } from '@/types';

interface TaskFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterStatus: FilterStatus;
  onStatusChange: (value: FilterStatus) => void;
  filterPriority: FilterPriority;
  onPriorityChange: (value: FilterPriority) => void;
  sortBy: SortBy;
  onSortChange: (value: SortBy) => void;
  onExport: () => void;
  onImport: (file: File) => void;
}

const CHIP_ACTIVE = 'bg-indigo-600 text-white dark:bg-indigo-500';
const CHIP_IDLE =
  'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600';
const CHIP_BASE =
  'rounded-full px-3 py-1 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500';

const FIELD_LABEL =
  'mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300';
const FIELD_INPUT =
  'w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:focus:ring-indigo-400';
const BACKUP_BUTTON =
  'flex-1 rounded-lg bg-gray-200 px-3 py-2 text-sm font-medium text-gray-800 transition-colors hover:bg-gray-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600';

/** Search box, status/priority filters and the sort dropdown. */
function TaskFilters({
  searchTerm,
  onSearchChange,
  filterStatus,
  onStatusChange,
  filterPriority,
  onPriorityChange,
  sortBy,
  onSortChange,
  onExport,
  onImport,
}: TaskFiltersProps) {
  return (
    <section
      aria-label="Search, filter and sort tasks"
      className="mb-6 rounded-xl bg-white p-4 shadow-lg sm:mb-8 sm:p-6 dark:bg-gray-800"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Search */}
        <div>
          <label htmlFor="task-search" className={FIELD_LABEL}>
            Search Tasks
          </label>
          <input
            id="task-search"
            type="search"
            value={searchTerm}
            onChange={event => onSearchChange(event.target.value)}
            placeholder="Search by task title..."
            className={FIELD_INPUT}
          />
        </div>

        {/* Status filter */}
        <div>
          <span className={FIELD_LABEL}>Filter by Status</span>
          <div role="group" aria-label="Filter by status" className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => onStatusChange(value)}
                aria-pressed={filterStatus === value}
                className={`${CHIP_BASE} ${filterStatus === value ? CHIP_ACTIVE : CHIP_IDLE}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Priority filter */}
        <div>
          <span className={FIELD_LABEL}>Filter by Priority</span>
          <div role="group" aria-label="Filter by priority" className="flex flex-wrap gap-2">
            {PRIORITY_FILTER_OPTIONS.map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => onPriorityChange(value)}
                aria-pressed={filterPriority === value}
                className={`${CHIP_BASE} ${filterPriority === value ? CHIP_ACTIVE : CHIP_IDLE}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
{/* Sort + JSON backup */}
        <div>
          <label htmlFor="sort-by" className={FIELD_LABEL}>
            Sort by
          </label>
          <select
            id="sort-by"
            value={sortBy}
            onChange={event => onSortChange(event.target.value as SortBy)}
            className={`${FIELD_INPUT} text-sm`}
          >
            {SORT_OPTIONS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={onExport}
              title="Export tasks as JSON backup"
              className={BACKUP_BUTTON}
            >
              Export JSON
            </button>
            <label title="Import tasks from a JSON backup" className={`${BACKUP_BUTTON} cursor-pointer text-center`}>
              Import JSON
              <input
                type="file"
                accept="application/json"
                className="sr-only"
                aria-label="Import tasks from a JSON backup"
                onChange={event => {
                  const file = event.target.files?.[0];
                  if (file) onImport(file);
                  event.target.value = '';
                }}
              />
            </label>
          </div>
        </div>
      </div>
    </section>
  );
}

export default memo(TaskFilters);