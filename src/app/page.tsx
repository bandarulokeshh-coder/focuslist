'use client';

import { useState, useEffect, useCallback } from 'react';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  createdAt: number;
  dueDate?: string; // ISO date string (yyyy-mm-dd)
}

type SortBy = 'newest' | 'oldest' | 'priority' | 'due';

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 } as const;

const PRIORITY_LABELS = {
  high: 'High',
  medium: 'Medium',
  low: 'Low'
};

const PRIORITY_COLORS = {
  high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
};

export default function FocusList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('all');
  const [filterPriority, setFilterPriority] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [editId, setEditId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [newPriority, setNewPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [newDueDate, setNewDueDate] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('newest');
  const [lastDeleted, setLastDeleted] = useState<Task | null>(null);

  // Load tasks from localStorage on init
  useEffect(() => {
    const savedTasks = localStorage.getItem('focuslist-tasks');
    if (savedTasks) {
      try {
        setTasks(JSON.parse(savedTasks));
      } catch (e) {
        console.error('Failed to parse tasks from localStorage', e);
      }
    }
  }, []);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('focuslist-tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Add new task
  const addTask = useCallback(() => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    const newTask: Task = {
      id: Date.now().toString(),
      title: trimmed,
      completed: false,
      priority: newPriority,
      createdAt: Date.now(),
      dueDate: newDueDate || undefined
    };

    setTasks(prev => [newTask, ...prev]);
    setInputValue('');
    setNewDueDate('');
  }, [inputValue, newPriority, newDueDate]);

  // Toggle task completion
  const toggleTask = useCallback((id: string) => {
    setTasks(prev => prev.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  }, []);

  // Delete task (with undo)
  const deleteTask = useCallback((id: string) => {
    const removed = tasks.find(task => task.id === id);
    if (removed) setLastDeleted(removed);
    setTasks(prev => prev.filter(task => task.id !== id));
  }, [tasks]);

  const undoDelete = useCallback(() => {
    if (lastDeleted) {
      setTasks(prev => [lastDeleted, ...prev]);
      setLastDeleted(null);
    }
  }, [lastDeleted]);

  // Auto-dismiss the undo snackbar after 6 seconds
  useEffect(() => {
    if (!lastDeleted) return;
    const timer = setTimeout(() => setLastDeleted(null), 6000);
    return () => clearTimeout(timer);
  }, [lastDeleted]);

  // Export tasks as a JSON backup file
  const exportTasks = useCallback(() => {
    const blob = new Blob([JSON.stringify(tasks, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'focuslist-backup.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [tasks]);

  // Import tasks from a JSON backup file
  const importTasks = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (Array.isArray(parsed)) {
          setTasks(parsed);
          setLastDeleted(null);
        } else {
          console.error('Invalid backup file: expected an array of tasks');
        }
      } catch (err) {
        console.error('Failed to import tasks', err);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }, []);

  // Edit task
  const startEditing = useCallback((id: string) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      setEditId(id);
      setEditValue(task.title);
      setEditDueDate(task.dueDate || '');
    }
  }, [tasks]);

  const saveEdit = useCallback((id: string) => {
    const trimmed = editValue.trim();
    if (!trimmed) return;

    setTasks(prev => prev.map(task =>
      task.id === id ? { ...task, title: trimmed, dueDate: editDueDate || undefined } : task
    ));
    setEditId(null);
    setEditValue('');
    setEditDueDate('');
  }, [editValue, editDueDate]);

  const cancelEdit = useCallback(() => {
    setEditId(null);
    setEditValue('');
    setEditDueDate('');
  }, []);

  // Update task priority
  const updatePriority = useCallback((id: string, priority: 'high' | 'medium' | 'low') => {
    setTasks(prev => prev.map(task =>
      task.id === id ? { ...task, priority } : task
    ));
  }, []);

  // Is a task past its due date?
  const isOverdue = (task: Task) =>
    !!task.dueDate &&
    !task.completed &&
    new Date(`${task.dueDate}T23:59:59`) < new Date();

  // Filter, then sort tasks
  const filteredTasks = useCallback(() => {
    const filtered = tasks.filter(task => {
      // Status filter
      const statusMatch =
        filterStatus === 'all' ||
        (filterStatus === 'active' && !task.completed) ||
        (filterStatus === 'completed' && task.completed);

      // Priority filter
      const priorityMatch =
        filterPriority === 'all' ||
        task.priority === filterPriority;

      // Search filter
      const searchMatch =
        searchTerm === '' ||
        task.title.toLowerCase().includes(searchTerm.toLowerCase());

      return statusMatch && priorityMatch && searchMatch;
    });

    const sorted = [...filtered];
    switch (sortBy) {
      case 'oldest':
        sorted.sort((a, b) => a.createdAt - b.createdAt);
        break;
      case 'priority':
        sorted.sort((a, b) =>
          PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority] ||
          b.createdAt - a.createdAt
        );
        break;
      case 'due':
        sorted.sort((a, b) => {
          if (!a.dueDate) return 1;   // tasks without due date go last
          if (!b.dueDate) return -1;
          return a.dueDate.localeCompare(b.dueDate);
        });
        break;
      default: // newest
        sorted.sort((a, b) => b.createdAt - a.createdAt);
    }
    return sorted;
  }, [tasks, filterStatus, filterPriority, searchTerm, sortBy]);

  // Statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const overdueCount = tasks.filter(isOverdue).length;

  // Handle Enter key in input
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addTask();
    }
  };

  // Handle Enter key in edit input
  const handleEditKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveEdit(editId as string);
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            FocusList
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Manage your daily tasks with priority levels
          </p>
        </header>

        {/* Add Task Form */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="flex-[2]">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Enter a new task..."
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all duration-200"
              />
            </div>
            <div className="sm:w-40">
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as Task['priority'])}
                title="Task priority"
                className="w-full px-3 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>
            <div className="sm:w-40">
              <input
                type="date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                title="Due date (optional)"
                className="w-full px-3 py-[9px] rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div className="sm:w-36">
              <button
                onClick={addTask}
                disabled={!inputValue.trim()}
                className="w-full px-4 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 dark:bg-indigo-500 dark:hover:bg-indigo-400 disabled:dark:bg-gray-600 text-white font-medium transition-colors duration-200 flex items-center justify-center gap-2"
              >
                Add Task
              </button>
            </div>
          </div>
        </div>

        {/* Edit Task Form (appears when editing) */}
        {editId !== null && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <div className="flex-[2]">
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={handleEditKeyPress}
                  autoFocus
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all duration-200"
                />
              </div>
              <div className="sm:w-40">
                <input
                  type="date"
                  value={editDueDate}
                  onChange={(e) => setEditDueDate(e.target.value)}
                  title="Due date (optional)"
                  className="w-full px-3 py-[9px] rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div className="flex gap-2 sm:w-56">
                <button
                  onClick={() => saveEdit(editId as string)}
                  className="flex-1 px-4 py-3 rounded-lg bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-400 text-white font-medium transition-colors duration-200"
                >
                  Save
                </button>
                <button
                  onClick={cancelEdit}
                  className="flex-1 px-4 py-3 rounded-lg bg-gray-600 hover:bg-gray-700 dark:bg-gray-500 dark:hover:bg-gray-400 text-white font-medium transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filter Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Search Tasks
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by task title..."
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Filter by Status
              </label>
              <div className="flex space-x-2">
                {[['all', 'All'], ['active', 'Active'], ['completed', 'Completed']].map(([value, label]) => (
                  <button
                    key={value}
                    onClick={() => setFilterStatus(value as any)}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      filterStatus === value
                        ? 'bg-indigo-600 text-white dark:bg-indigo-500'
                        : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Priority Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Filter by Priority
              </label>
              <div className="flex space-x-2">
                {[['all', 'All'], ['high', 'High'], ['medium', 'Medium'], ['low', 'Low']].map(([value, label]) => (
                  <button
                    key={value}
                    onClick={() => setFilterPriority(value as any)}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${filterPriority === value ? 'bg-indigo-600 text-white dark:bg-indigo-500' : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Task Statistics */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Tasks</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalTasks}</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Completed Tasks</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{completedTasks}</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Tasks</p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{pendingTasks}</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Overdue</p>
              <p className={`text-2xl font-bold ${overdueCount > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-gray-100'}`}>{overdueCount}</p>
            </div>
          </div>
        </div>

        {/* Tasks List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          {/* Sort, Export and Import toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <label htmlFor="sort-by" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Sort by
              </label>
              <select
                id="sort-by"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
                className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="priority">Priority</option>
                <option value="due">Due date</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={exportTasks}
                className="px-3 py-2 rounded-lg bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 text-sm font-medium transition-colors"
                title="Export tasks as JSON backup"
              >
                ⬇ Export
              </button>
              <label
                className="px-3 py-2 rounded-lg bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 text-sm font-medium transition-colors cursor-pointer"
                title="Import tasks from a JSON backup"
              >
                ⬆ Import
                <input
                  type="file"
                  accept="application/json"
                  className="hidden"
                  onChange={importTasks}
                />
              </label>
            </div>
          </div>
          {filteredTasks().length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                No tasks found. Try adjusting your filters or add a new task!
              </p>
            </div>
          ) : (
            <ul className="space-y-4">
              {filteredTasks().map((task) => (
                <li
                  key={task.id}
                  className="flex items-start space-x-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  {/* Task Checkbox */}
                  <div className="flex-shrink-0 mt-1">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleTask(task.id)}
                      className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 dark:focus:ring-indigo-400"
                    />
                  </div>

                  {/* Task Content */}
                  <div className="flex-1 space-y-2">
                    {/* Task Title and Actions */}
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        {editId === task.id ? (
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyPress={handleEditKeyPress}
                            autoFocus
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          />
                        ) : (
                          <span
                            className={`${task.completed ? 'line-through' : ''} block text-lg font-medium ${
                              task.completed
                                ? 'text-gray-400 dark:text-gray-500'
                                : 'text-gray-900 dark:text-gray-100'
                            }`}
                          >
                            {task.title}
                          </span>
                        )}
                      </div>

                      {/* Task Actions */}
                      <div className="flex space-x-2 mt-1">
                        {editId !== task.id && (
                          <>
                            <button
                              onClick={() => startEditing(task.id)}
                              className="p-2 rounded-lg bg-blue-500 hover:bg-blue-600 dark:bg-blue-400 dark:hover:bg-blue-300 text-white text-sm"
                              title="Edit task"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => updatePriority(task.id, task.priority === 'high' ? 'medium' : task.priority === 'medium' ? 'low' : 'high')}
                              className="p-2 rounded-lg bg-indigo-100 text-indigo-800 hover:bg-indigo-200 dark:bg-indigo-900 dark:text-indigo-200 dark:hover:bg-indigo-800 text-sm"
                              title="Change priority"
                            >
                              {task.priority.charAt(0).toUpperCase()}
                            </button>
                            <button
                              onClick={() => deleteTask(task.id)}
                              className="p-2 rounded-lg bg-red-500 hover:bg-red-600 dark:bg-red-400 dark:hover:bg-red-300 text-white text-sm"
                              title="Delete task"
                            >
                              🗑️
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Priority Badge */}
                    <div className="flex items-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${PRIORITY_COLORS[task.priority]}`}
                      >
                        {PRIORITY_LABELS[task.priority]}
                      </span>
                    </div>

                    {/* Due Date Badge */}
                    {task.dueDate && (
                      <div className="flex items-center">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            isOverdue(task)
                              ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200'
                              : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {isOverdue(task) ? '⚠ Overdue: ' : '📅 Due: '}
                          {new Date(`${task.dueDate}T00:00:00`).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Undo Delete Snackbar */}
        {lastDeleted && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 dark:bg-gray-700 text-white px-5 py-3 rounded-lg shadow-xl flex items-center gap-4 z-50">
            <span className="text-sm">Task deleted</span>
            <button
              onClick={undoDelete}
              className="text-sm font-semibold text-indigo-300 hover:text-indigo-200"
            >
              Undo
            </button>
          </div>
        )}
      </div>
    </div>
  );
}