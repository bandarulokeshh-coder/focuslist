'use client';

import { memo } from 'react';
import type { KeyboardEvent } from 'react';
import TaskMeta from './TaskMeta';
import type { Task } from '@/types';

interface TaskItemProps {
  task: Task;
  isEditing: boolean;
  editValue: string;
  editDueDate: string;
  onEditValueChange: (value: string) => void;
  onEditDueDateChange: (value: string) => void;
  onEditKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  onToggle: (id: string) => void;
  onStartEditing: (id: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onCyclePriority: (task: Task) => void;
  onDelete: (id: string) => void;
}

/** A single task row: checkbox, title (or inline edit form) and action buttons. */
function TaskItem({
  task,
  isEditing,
  editValue,
  editDueDate,
  onEditValueChange,
  onEditDueDateChange,
  onEditKeyDown,
  onToggle,
  onStartEditing,
  onSaveEdit,
  onCancelEdit,
  onCyclePriority,
  onDelete,
}: TaskItemProps) {
  return (
    <li className="flex items-start gap-3 rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50 sm:gap-4 sm:p-4 dark:border-gray-700 dark:hover:bg-gray-700">
      {/* Completion checkbox */}
      <div className="mt-1 flex-shrink-0">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => onToggle(task.id)}
          aria-label={`Mark "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`}
          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:focus:ring-indigo-400"
        />
      </div>

      <div className="min-w-0 flex-1 space-y-2">
        {/* Title or inline edit form */}
        {isEditing ? (
          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="sr-only" htmlFor={`edit-title-${task.id}`}>
              Task title
            </label>
            <input
              id={`edit-title-${task.id}`}
              type="text"
              value={editValue}
              onChange={event => onEditValueChange(event.target.value)}
              onKeyDown={onEditKeyDown}
              autoFocus
              className="flex-1 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:focus:ring-indigo-400"
            />
            <label className="sr-only" htmlFor={`edit-due-${task.id}`}>
              Due date
            </label>
            <input
              id={`edit-due-${task.id}`}
              type="date"
              value={editDueDate}
              onChange={event => onEditDueDateChange(event.target.value)}
              className="rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:focus:ring-indigo-400"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onSaveEdit}
                className="rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 dark:bg-green-500 dark:hover:bg-green-400"
              >
                Save
              </button>
              <button
                type="button"
                onClick={onCancelEdit}
                className="rounded-lg bg-gray-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 dark:bg-gray-500 dark:hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <span
            className={`block break-words text-base font-medium sm:text-lg ${
              task.completed
                ? 'text-gray-400 line-through dark:text-gray-500'
                : 'text-gray-900 dark:text-gray-100'
            }`}
          >
            {task.title}
          </span>
        )}

        <TaskMeta task={task} />
      </div>

      {/* Row actions */}
      {!isEditing && (
        <div className="flex flex-shrink-0 gap-2">
          <button
            type="button"
            onClick={() => onStartEditing(task.id)}
            aria-label={`Edit "${task.title}"`}
            title="Edit task"
            className="rounded-lg bg-blue-500 px-2.5 py-2 text-sm text-white transition-colors hover:bg-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:bg-blue-400 dark:hover:bg-blue-300"
          >
            <span aria-hidden="true">✏️</span>
          </button>
          <button
            type="button"
            onClick={() => onCyclePriority(task)}
            aria-label={`Change priority of "${task.title}" (currently ${task.priority})`}
            title="Change priority"
            className="rounded-lg bg-indigo-100 px-2.5 py-2 text-sm text-indigo-800 transition-colors hover:bg-indigo-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:bg-indigo-900 dark:text-indigo-200 dark:hover:bg-indigo-800"
          >
            <span aria-hidden="true">{task.priority.charAt(0).toUpperCase()}</span>
          </button>
          <button
            type="button"
            onClick={() => onDelete(task.id)}
            aria-label={`Delete "${task.title}"`}
            title="Delete task"
            className="rounded-lg bg-red-500 px-2.5 py-2 text-sm text-white transition-colors hover:bg-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 dark:bg-red-400 dark:hover:bg-red-300"
          >
            <span aria-hidden="true">🗑️</span>
          </button>
        </div>
      )}
    </li>
  );
}

export default memo(TaskItem);