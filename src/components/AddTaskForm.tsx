'use client';

import { memo, useState } from 'react';
import type { FormEvent } from 'react';
import type { Priority } from '@/types';

interface AddTaskFormProps {
  onAdd: (title: string, priority: Priority, dueDate?: string) => void;
}

/** Form for creating a task with a priority and an optional due date. */
function AddTaskForm({ onAdd }: AddTaskFormProps) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState('');

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim()) return;
    onAdd(title, priority, dueDate);
    setTitle('');
    setPriority('medium');
    setDueDate('');
  };

  return (
    <form
      onSubmit={submit}
      aria-label="Add a new task"
      className="mb-6 rounded-xl bg-white p-4 shadow-lg sm:mb-8 sm:p-6 dark:bg-gray-800"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="flex-[2]">
          <label htmlFor="new-task-title" className="sr-only">
            Task title
          </label>
          <input
            id="new-task-title"
            type="text"
            value={title}
            onChange={event => setTitle(event.target.value)}
            placeholder="Enter a new task..."
            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:focus:ring-indigo-400"
          />
        </div>

        <div className="sm:w-40">
          <label htmlFor="new-task-priority" className="sr-only">
            Task priority
          </label>
          <select
            id="new-task-priority"
            value={priority}
            onChange={event => setPriority(event.target.value as Priority)}
            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:focus:ring-indigo-400"
          >
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
        </div>

        <div className="sm:w-40">
          <label htmlFor="new-task-due" className="sr-only">
            Due date (optional)
          </label>
          <input
            id="new-task-due"
            type="date"
            value={dueDate}
            onChange={event => setDueDate(event.target.value)}
            title="Due date (optional)"
            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-[9px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:focus:ring-indigo-400"
          />
        </div>

        <div className="sm:w-36">
          <button
            type="submit"
            disabled={!title.trim()}
            className="w-full rounded-lg bg-indigo-600 px-4 py-3 font-medium text-white transition-colors hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:bg-indigo-300 disabled:dark:bg-gray-600 dark:bg-indigo-500 dark:hover:bg-indigo-400"
          >
            Add Task
          </button>
        </div>
      </div>
    </form>
  );
}

export default memo(AddTaskForm);