'use client';

import { useCallback, useMemo, useState } from 'react';
import AddTaskForm from '@/components/AddTaskForm';
import StatsPanel from '@/components/StatsPanel';
import TaskFilters from '@/components/TaskFilters';
import TaskList from '@/components/TaskList';
import ThemeToggle from '@/components/ThemeToggle';
import UndoSnackbar from '@/components/UndoSnackbar';
import { useTasks } from '@/hooks/useTasks';
import { computeStats, filterAndSortTasks } from '@/lib/task-utils';
import type { FilterPriority, FilterStatus, SortBy } from '@/types';

export default function HomePage() {
  const store = useTasks();
  const { tasks } = store;

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterPriority, setFilterPriority] = useState<FilterPriority>('all');
  const [sortBy, setSortBy] = useState<SortBy>('newest');

  // Derived data: only recomputed when tasks or the filter/sort inputs change
  const visibleTasks = useMemo(
    () => filterAndSortTasks(tasks, { searchTerm, filterStatus, filterPriority, sortBy }),
    [tasks, searchTerm, filterStatus, filterPriority, sortBy]
  );

  const stats = useMemo(() => computeStats(tasks), [tasks]);

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setFilterStatus('all');
    setFilterPriority('all');
    setSortBy('newest');
  }, []);

  const hasActiveFilters =
    searchTerm !== '' || filterStatus !== 'all' || filterPriority !== 'all';

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-6 transition-colors sm:py-10 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3 sm:mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-gray-50">
              <span aria-hidden="true">✅</span> FocusList
            </h1>
            <p className="mt-1 text-sm text-gray-600 sm:text-base dark:text-gray-400">
              Stay organised, stay focused — tasks, priorities and due dates in one place.
            </p>
          </div>
          <ThemeToggle />
        </header>

        <main>
          <AddTaskForm onAdd={store.addTask} />
          <StatsPanel stats={stats} />
          <TaskFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filterStatus={filterStatus}
            onStatusChange={setFilterStatus}
            filterPriority={filterPriority}
            onPriorityChange={setFilterPriority}
            sortBy={sortBy}
            onSortChange={setSortBy}
            onExport={store.exportTasks}
            onImport={store.importTasks}
          />

          <section
            aria-label="Your tasks"
            className="rounded-xl bg-white p-4 shadow-lg sm:p-6 dark:bg-gray-800"
          >
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-100">
                Your Tasks{' '}
                <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                  ({visibleTasks.length}
                  {visibleTasks.length !== tasks.length ? ` of ${tasks.length}` : ''} shown)
                </span>
              </h2>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="rounded-lg px-3 py-1 text-sm font-medium text-indigo-600 transition-colors hover:bg-indigo-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-indigo-400 dark:hover:bg-gray-700"
                >
                  Clear filters
                </button>
              )}
            </div>

            <TaskList tasks={visibleTasks} store={store} />
          </section>
        </main>

        <footer className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Tasks are stored locally in your browser — nothing is uploaded.</p>
        </footer>
      </div>

      <UndoSnackbar
        deleted={store.lastDeleted}
        onUndo={store.undoDelete}
        onDismiss={store.dismissUndo}
      />
    </div>
  );
}