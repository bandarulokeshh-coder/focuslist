# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-09-19

### Added
- Persisted light/dark theme toggle with no flash of the wrong theme on load
  (pre-hydration init script + `prefers-color-scheme` fallback).
- Due dates per task, with **Overdue** detection and a dedicated stat card.
- Sorting options: newest, oldest, priority and due date.
- JSON export/import so tasks can be backed up and restored.
- Completion progress bar with `role="progressbar"` semantics.
- Undo snackbar (`aria-live="polite"`) giving a 6-second window to restore a
  deleted task.
- "Clear filters" shortcut and a live visible/total task counter.
- Empty state for the task list and cross-tab sync via `storage` events.
- GitHub Actions CI workflow running lint, type check and build.

### Changed
- **Architecture:** the 600-line single-file app was split into
  `types/`, `lib/`, `hooks/` and `components/` with a thin 110-line page.
- Task state now flows through a `useSyncExternalStore` store
  (`src/lib/task-storage.ts`), replacing manual `useEffect` persistence.
- Filtering/sorting and statistics run inside `useMemo`; list rows and panels
  are wrapped in `React.memo` with stable `useCallback` handlers.
- Accessibility: semantic `header`/`main`/`footer`/`section` landmarks, `ul`/`li`
  task list, labelled inputs, `aria-pressed` filter chips, descriptive
  `aria-label`s on icon buttons, visible focus rings and reduced-motion support.
- Responsive layout reworked for mobile (stacked form controls, fluid snackbar,
  2/4-column stat grid).
- Runtime validation of any task data read from `localStorage` or a backup file.

### Fixed
- HTTP 500 on page load caused by a malformed JSX expression and a missing
  `'use client'` directive.
- Priority selector on new tasks was ignored.
- Deprecated `onKeyPress` handler (now `onKeyDown`, supporting Enter/Escape).

## [1.0.0] - 2026-09-18

### Added
- Initial release: add, edit, complete and delete tasks.
- Priority levels (high/medium/low), search, status/priority filters.
- Statistics for total, completed and pending tasks.
- `localStorage` persistence.