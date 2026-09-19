'use client';

import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import { UNDO_TIMEOUT_MS } from '@/lib/constants';
import {
  getTasksServerSnapshot,
  getTasksSnapshot,
  parseTaskList,
  subscribeToTasks,
  writeTasks,
} from '@/lib/task-storage';
import type { Priority, Task } from '@/types';

function createTaskId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Owns all task state: persistence and cross-tab sync (via an external
 * store), CRUD actions, inline editing, undo support and JSON import/export.
 */
export function useTasks() {
  const tasks = useSyncExternalStore(
    subscribeToTasks,
    getTasksSnapshot,
    getTasksServerSnapshot
  );

  const [lastDeleted, setLastDeleted] = useState<Task | null>(null);

  // Inline editing state
  const [editId, setEditId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [editDueDate, setEditDueDate] = useState('');

  /** Apply a pure update function to the persisted task list. */
  const updateStoredTasks = useCallback(
    (update: (previous: Task[]) => Task[]) => {
      writeTasks(update(getTasksSnapshot()));
    },
    []
  );

  // Auto-dismiss the undo snackbar after UNDO_TIMEOUT_MS
  useEffect(() => {
    if (!lastDeleted) return;
    const timer = setTimeout(() => setLastDeleted(null), UNDO_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [lastDeleted]);

  const addTask = useCallback(
    (title: string, priority: Priority, dueDate?: string) => {
      const trimmed = title.trim();
      if (!trimmed) return;

      const newTask: Task = {
        id: createTaskId(),
        title: trimmed,
        completed: false,
        priority,
        createdAt: Date.now(),
        dueDate: dueDate || undefined,
      };

      updateStoredTasks(previous => [newTask, ...previous]);
    },
    [updateStoredTasks]
  );

  const toggleTask = useCallback(
    (id: string) => {
      updateStoredTasks(previous =>
        previous.map(task =>
          task.id === id ? { ...task, completed: !task.completed } : task
        )
      );
    },
    [updateStoredTasks]
  );

  const deleteTask = useCallback(
    (id: string) => {
      const current = getTasksSnapshot();
      setLastDeleted(current.find(task => task.id === id) ?? null);
      writeTasks(current.filter(task => task.id !== id));
    },
    []
  );

  const dismissUndo = useCallback(() => setLastDeleted(null), []);

  const undoDelete = useCallback(() => {
    if (!lastDeleted) return;
    writeTasks([lastDeleted, ...getTasksSnapshot()]);
    setLastDeleted(null);
  }, [lastDeleted]);

  const updatePriority = useCallback(
    (id: string, priority: Priority) => {
      updateStoredTasks(previous =>
        previous.map(task => (task.id === id ? { ...task, priority } : task))
      );
    },
    [updateStoredTasks]
  );

  const startEditing = useCallback((id: string) => {
    const task = getTasksSnapshot().find(candidate => candidate.id === id);
    if (!task) return;
    setEditId(id);
    setEditValue(task.title);
    setEditDueDate(task.dueDate ?? '');
  }, []);

  const saveEdit = useCallback(() => {
    if (!editId) return;
    const trimmed = editValue.trim();
    if (!trimmed) return;

    updateStoredTasks(previous =>
      previous.map(task =>
        task.id === editId
          ? { ...task, title: trimmed, dueDate: editDueDate || undefined }
          : task
      )
    );
    setEditId(null);
    setEditValue('');
    setEditDueDate('');
  }, [editId, editValue, editDueDate, updateStoredTasks]);

  const cancelEdit = useCallback(() => {
    setEditId(null);
    setEditValue('');
    setEditDueDate('');
  }, []);

  /** Download all tasks as a JSON backup file. */
  const exportTasks = useCallback(() => {
    const blob = new Blob([JSON.stringify(tasks, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'focuslist-backup.json';
    anchor.click();
    URL.revokeObjectURL(url);
  }, [tasks]);

  /** Replace all tasks from a JSON backup file. */
  const importTasks = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = parseTaskList(JSON.parse(String(reader.result)));
        if (!parsed) {
          console.error('FocusList: backup file is not a valid task list');
          return;
        }
        writeTasks(parsed);
        setLastDeleted(null);
        setEditId(null);
      } catch (error) {
        console.error('FocusList: could not import the backup file', error);
      }
    };
    reader.onerror = () => console.error('FocusList: could not read the backup file');
    reader.readAsText(file);
  }, []);

  return {
    tasks,
    lastDeleted,
    addTask,
    toggleTask,
    deleteTask,
    undoDelete,
    dismissUndo,
    updatePriority,
    editId,
    editValue,
    editDueDate,
    setEditValue,
    setEditDueDate,
    startEditing,
    saveEdit,
    cancelEdit,
    exportTasks,
    importTasks,
  };
}

export type TaskStore = ReturnType<typeof useTasks>;