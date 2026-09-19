# ✅ FocusList

A fast, accessible task manager built with **Next.js 16**, **React 19**, **TypeScript** and **Tailwind CSS 4**. FocusList keeps tasks, priorities and due dates organised — entirely in the browser, with no account, no backend and no tracking.

[![CI](https://github.com/bandarulokeshh-coder/focuslist/actions/workflows/ci.yml/badge.svg)](https://github.com/bandarulokeshh-coder/focuslist/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black.svg)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6.svg)](https://www.typescriptlang.org/)

**Live demo:** https://focuslist-cyan.vercel.app

---

##  Features

### Task management
- **Create** tasks with a title, a priority and an optional due date.
- **Complete** tasks with a single click; completed items are struck through.
- **Inline edit** a task's title and due date (with `Enter` to save, `Esc` to cancel).
- **Cycle priority** between high → medium → low straight from the row.
- **Delete with undo** — a snackbar offers a 6-second window to restore the task.

### Organise
- **Filter** by status (all / active / completed) and by priority.
- **Search** task titles instantly.
- **Sort** by newest, oldest, priority or due date (tasks without a due date sort last).
- **Overdue detection** highlights incomplete tasks past their due date.

### Insights & data
- Stat cards for **total, completed, pending and overdue** tasks.
- Live **completion progress bar** with ARIA progressbar semantics.
- **Export / import** the whole task list as a JSON backup, with runtime validation.
- **Cross-tab sync** — a second tab updates through `storage` events.

### Experience
- **Dark mode** that persists, follows the OS preference by default, and applies
  before first paint (no flash of the wrong theme).
- **Responsive** from 320 px phones up to desktop, with a masonry-free single column
  and stacked form controls on small screens.
- **Reduced-motion** support and visible focus rings throughout.

---

## 🛠 Tech stack

| Layer | Choice | Why |
| --- | --- | --- |
| Framework | Next.js 16 (App Router) | Server rendering, metadata API, zero-config deployment |
| UI | React 19 | Modern hooks (`useSyncExternalStore`, `useMemo`, `memo`) |
| Language | TypeScript (strict) | End-to-end types shared through `src/types.ts` |
| Styling | Tailwind CSS 4 | Utility-first styling with a class-based dark variant |
| State | Custom hook + external store | Smallest possible surface — no state library needed |
| Persistence | `localStorage` | Instant, offline-capable, private by design |
| CI | GitHub Actions | Lint + type check + production build on every push |
| Hosting | Vercel | Production deploys from the same commit as the code |

---

## 🚀 Getting started

```bash
# 1. Clone
git clone https://github.com/bandarulokeshh-coder/focuslist.git
cd focuslist

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the development server with hot reload |
| `npm run build` | Create an optimised production build |
| `npm start` | Serve the production build |
| `npm run lint` | Run ESLint (flat config, `next/core-web-vitals`) |
| `npm run typecheck` | Run `tsc --noEmit` |

### Deploy your own

The project deploys to Vercel with no configuration:

```bash
npm install -g vercel
vercel        # preview deployment
vercel --prod # production deployment
```

<details>
<summary>Manual deployment settings</summary>

| Setting | Value |
| --- | --- |
| Framework preset | Next.js |
| Build command | `npm run build` |
| Output directory | `.next` |
| Install command | `npm install` |
| Environment variables | none required |
</details>
---

## 📁 Project structure

The app follows a layered structure: a thin page composes feature components,
all shared logic lives in `lib/` and `hooks/`, and the data contract lives in
`types.ts`.

```
src/
├── app/
│   ├── layout.tsx          # Metadata, viewport, pre-paint theme init script
│   ├── page.tsx            # Thin page: composes components, owns filter state
│   └── globals.css         # Tailwind 4 entry, dark variant, reduced motion
├── components/
│   ├── AddTaskForm.tsx     # Create a task (title, priority, optional due date)
│   ├── TaskItem.tsx        # Task row: completion, inline edit, priority, delete
│   ├── TaskMeta.tsx        # Priority + due-date badges
│   ├── TaskList.tsx        # List rendering + empty state
│   ├── TaskFilters.tsx     # Search, filters, sort, export/import
│   ├── StatsPanel.tsx      # Stat cards + progress bar
│   ├── ProgressBar.tsx     # ARIA progressbar
│   ├── UndoSnackbar.tsx    # Undo window after a delete
│   └── ThemeToggle.tsx     # Dark mode switch
├── hooks/
│   ├── useTasks.ts         # All task state & actions (CRUD, undo, import/export)
│   └── useTheme.ts         # Persisted light/dark theme
├── lib/
│   ├── constants.ts        # Storage keys, labels, sort/filter option tables
│   ├── task-utils.ts       # Pure functions: filtering, sorting, stats
│   ├── task-storage.ts     # External store for tasks (localStorage + storage events)
│   └── theme-storage.ts    # External store for the theme
└── types.ts                # Task, Priority, SortBy, TaskStats contracts
```

## 🧠 Architecture notes

- **Single source of truth.** Tasks live in one external store
  (`task-storage.ts`) consumed with `useSyncExternalStore`. Components never
  touch `localStorage` directly, which keeps SSR/hydration correct (React uses
  the server snapshot during hydration) and gives cross-tab sync for free.
- **Pure, testable core.** Filtering, sorting and statistics are pure functions
  in `task-utils.ts` — no React imports, trivially unit-testable.
- **Derived, not stored.** `visibleTasks` and `stats` are `useMemo` results;
  nothing is duplicated in state.
- **Render performance.** List rows and panels are `React.memo`'d and receive
  stable `useCallback` handlers, so editing one row does not re-render the rest.
- **Runtime validation.** Anything parsed from storage or an uploaded backup is
  validated before it reaches React state, so corrupt or foreign JSON cannot
  crash the app.

### Data model

```ts
interface Task {
  id: string;            // `${Date.now()}-${random}`
  title: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  createdAt: number;     // epoch milliseconds
  dueDate?: string;      // ISO date string, e.g. "2026-09-30"
}
```

Persisted under the `focuslist-tasks` key; the theme under `focuslist-theme`.

## ♿ Accessibility

- Semantic landmarks (`header`, `main`, `footer`, `section`) and a real
  `ul`/`li` task list.
- Every icon-only button has a descriptive `aria-label` ("Delete \"Buy milk\"").
- Filter chips use `aria-pressed`; the theme toggle announces its state.
- Status changes (empty list, undo snackbar) use `role="status"` /
  `aria-live="polite"`.
- Visible `focus-visible` rings on every interactive element and
  `prefers-reduced-motion` support.

## 🗺 Roadmap

- [ ] Drag-and-drop reordering
- [ ] Recurring tasks
- [ ] Keyboard shortcuts (n = new task, / = search)
- [ ] Optional cloud sync (end-to-end encrypted)
- [ ] Unit tests for `task-utils` with Vitest

## 🤝 Contributing

Issues and pull requests are welcome. For anything larger, open an issue first
to discuss the change. Please run `npm run lint` and `npm run typecheck`
before submitting.

## 📄 License

Distributed under the [MIT License](LICENSE).