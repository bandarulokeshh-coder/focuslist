'use client';

import { useCallback, memo } from 'react';
import type { KeyboardEvent } from 'react';
import TaskItem from './TaskItem';
import { getNextPriority } from '@/lib/task-utils';
import type { TaskStore } from '@/hooks/useTasks';
import type { Task } from '@/types';

interface TaskListProps {
  tasks: Task[];
  store: TaskStore;
}

/** Renders the filtered task list, or an accessible empty state. */
function TaskList({ tasks, store }: TaskListProps) {
  const { updatePriority, saveEdit, cancelEdit } = store;

  const handleCyclePriority = useCallback(
    (task: Task) => {
      updatePriority(task.id, getNextPriority(task.priority));
    },
    [updatePriority]
  );

  const handleEditKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') saveEdit();
      else if (event.key === 'Escape') cancelEdit();
    },
    [saveEdit, cancelEdit]
  );

  if (tasks.length === 0) {
    return (
      <p
        role="status"
        className="py-12 text-center text-gray-500 dark:text-gray-400"
      >
        No tasks found. Try adjusting your filters or add a new task!
      </p>
    );
  }

  return (
    <ul className="space-y-3 sm:space-y-4">
      {tasks.map(task => (
        <TaskItem
          key={task.id}
          task={task}
          isEditing={store.editId === task.id}
          editValue={store.editValue}
          editDueDate={store.editDueDate}
          onEditValueChange={store.setEditValue}
          onEditDueDateChange={store.setEditDueDate}
          onEditKeyDown={handleEditKeyDown}
          onToggle={store.toggleTask}
          onStartEditing={store.startEditing}
          onSaveEdit={store.saveEdit}
          onCancelEdit={store.cancelEdit}
          onCyclePriority={handleCyclePriority}
          onDelete={store.deleteTask}
        />
      ))}
    </ul>
  );
}

export default memo(TaskList);