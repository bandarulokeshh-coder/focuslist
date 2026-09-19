'use client';

import { memo } from 'react';
import type { Task } from '@/types';

interface UndoSnackbarProps {
  deleted: Task | null;
  onUndo: () => void;
  onDismiss: () => void;
}

/** Floating snackbar that offers a short window to undo a deletion. */
function UndoSnackbar({ deleted, onUndo, onDismiss }: UndoSnackbarProps) {
  if (!deleted) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 items-center justify-between gap-4 rounded-lg bg-gray-900 px-4 py-3 text-white shadow-xl sm:bottom-6 sm:w-auto dark:bg-gray-700"
    >
      <span className="truncate text-sm">
        Deleted: <span className="font-medium">{deleted.title}</span>
      </span>
      <div className="flex flex-shrink-0 items-center gap-3">
        <button
          type="button"
          onClick={onUndo}
          className="text-sm font-semibold text-indigo-300 hover:text-indigo-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
        >
          Undo
        </button>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss notification"
          className="text-gray-400 hover:text-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300"
        >
          <span aria-hidden="true">✕</span>
        </button>
      </div>
    </div>
  );
}

export default memo(UndoSnackbar);