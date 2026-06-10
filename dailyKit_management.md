# AGENT_TASK.md — Fluxday Personal Dashboard
> **Read this file first and follow it completely. Every section is a constraint. Do not deviate.**

---

## 🔒 AGENT LOCK-IN RULES (read before anything else)

These rules govern every decision you make in this project. If you are tempted to skip one, stop and re-read it.

1. **NEVER rename, restructure, or replace the app name.** The app is called **Fluxday**. Not "DailyKit", not "MyApp", not "PersonalHub". Always `Fluxday`.
2. **NEVER use plain HTML/CSS/JS.** All code must be written in **TypeScript with React + Vite** (see stack section). If you are about to write a `.html` file with inline `<script>` tags, stop.
3. **NEVER store data anywhere except `localStorage`** unless the user explicitly approves a backend. No Firebase, no Supabase, no external sync.
4. **NEVER add tools that are not in the approved feature list below.** If you want to suggest an addition, add it to the `PROPOSED_ADDITIONS` section at the bottom — do not implement it without user sign-off.
5. **NEVER generate ad revenue code.** There are no `<ins class="adsbygoogle">` blocks, no `ca-pub-` publisher IDs, no AdSense. This is a personal system, not a product.
6. **NEVER split logic into more files than necessary.** Each tool lives in `src/pages/tools/[toolName].tsx`. Shared state lives in `src/stores/`. No unplanned directories.
7. **NEVER leave placeholder text** like `TODO`, `FIXME`, `YOUR_VALUE_HERE`, or dummy Lorem Ipsum in committed code.
8. **ALWAYS write TypeScript with strict types.** No `any`. No `// @ts-ignore`. If you can't type it, ask first.
9. **ALWAYS keep the design system** defined in `src/lib/theme.css`. Never hardcode hex values inside component files.
10. **ALWAYS commit with a message that references a task from this file** (e.g. `feat(habit-tracker): add streak reset [TASK-08]`).

---

## 🎯 Project Identity

| Field | Value |
|---|---|
| **App Name** | Fluxday |
| **Tagline** | *Your day, in one place.* |
| **Purpose** | A personal daily operating system — not a product, not a SaaS. Built for one user (the owner). |
| **Audience** | The developer themselves. Productivity-focused, TypeScript-fluent. |
| **Tone** | Calm, minimal, purposeful. No gamification gimmicks outside the Games section. |
| **Name origin** | "Flux" = continuous change & daily flow. "day" = anchored to daily rhythm. Not in the dictionary as a compound noun — intentional. |

---

## 🛠 Tech Stack (LOCKED — do not change without updating this file)

| Layer | Choice | Reason |
|---|---|---|
| **Framework** | React 18 + Vite | Familiar, TypeScript-native, fast HMR, huge ecosystem |
| **Router** | React Router v6 | File-convention routing with nested layouts |
| **Language** | TypeScript (strict) | Type safety, familiar to owner, good IDE support everywhere |
| **Styling** | Plain CSS with custom properties (design tokens in `src/theme.css`) | Predictable, no build surprises, easy to override per-tool |
| **Fonts** | `Inter` (body) + `DM Mono` (data/numbers) via Google Fonts | Readable at small sizes, strong mono for budget/time data |
| **Data** | `localStorage` via typed wrappers in `src/utils/storage.ts` | No backend needed for personal use |
| **Icons** | Lucide React | Tree-shakeable, consistent, TypeScript-typed |
| **Canvas / Game** | Native Canvas API inside React components | No game library needed for 2D browser games |
| **Testing** | Vitest (unit) + Playwright (e2e, optional) | Matches Vite's native test setup |
| **Cross-platform** | Tauri v2 (optional wrapper) | Bundles as a desktop app on Windows/macOS/Linux — enable later |
| **Mobile** | PWA via `vite-plugin-pwa` | Installable on Android/iOS with offline support |

### Project scaffold command
```bash
npm create vite@latest fluxday -- --template react-ts
cd fluxday
npm install lucide-react react-router-dom
```

---

## 📁 Directory Structure (LOCKED)

```
fluxday/
├── src/
│   ├── main.tsx                  # React entry point
│   ├── App.tsx                   # Root router + layout
│   ├── index.css                 # global resets only
│   ├── theme.css                 # ALL design tokens (colors, spacing, radii, fonts)
│   ├── stores/
│   │   ├── habits.ts             # Habit tracker store (custom hook + localStorage)
│   │   ├── budget.ts             # Budget tracker store
│   │   ├── journal.ts            # Daily journal store
│   │   ├── todos.ts              # Master todo + project store
│   │   ├── focus.ts              # Focus timer store
│   │   └── games.ts              # Game high scores store
│   ├── components/
│   │   ├── Sidebar.tsx           # Global navigation
│   │   ├── Header.tsx            # Page header with date
│   │   ├── Card.tsx              # Reusable card shell
│   │   ├── Badge.tsx             # Status badge
│   │   └── ProgressRing.tsx      # SVG circular progress
│   ├── utils/
│   │   ├── date.ts               # Date helpers (today, streak math)
│   │   ├── storage.ts            # Typed localStorage wrapper
│   │   └── format.ts             # Currency, duration formatters
│   └── pages/
│       ├── Dashboard.tsx         # Dashboard home (today overview)
│       └── tools/
│           ├── Todos.tsx
│           ├── Habits.tsx
│           ├── Journal.tsx
│           ├── Budget.tsx
│           ├── Focus.tsx
│           ├── Notes.tsx
│           ├── QR.tsx
│           ├── games/
│           │   ├── Games.tsx            # Game hub
│           │   ├── CoinRush.tsx
│           │   └── TypeDash.tsx         # NEW GAME (see TASK-10b)
│           └── Settings.tsx
├── public/
│   ├── manifest.json             # PWA manifest
│   └── icons/                    # PWA icons (192, 512)
├── AGENT_TASK.md                 # THIS FILE — always in root
├── vite.config.ts
└── tsconfig.json
```

---

## ✅ Feature List — Tools to Build

> Each task has an ID. Use it in commit messages.

### TASK-01 — Dashboard Home (`/`)
- Shows today's date and a greeting based on time of day
- Summary widgets: habits streak, todos due today count, budget balance, current focus session
- "Quick add" shortcut: single-line todo input that saves to todos store
- Shows last journal entry preview (first 80 chars)
- No ads, no external calls

### TASK-02 — Master Todo + Projects (`/tools/todos`)
- Tasks have: `id`, `title`, `notes`, `dueDate`, `project`, `priority` (low/mid/high), `done`, `createdAt`
- Projects are just string tags — no separate project object needed
- Views: Today, Upcoming, All, by Project
- Keyboard shortcut: `N` = new task, `Enter` = save, `Escape` = cancel
- Stores in `localStorage` key: `fx_todos`

### TASK-03 — Habit Tracker (`/tools/habits`)
- Habits have: `id`, `name`, `emoji`, `color`, `targetDays` (array of 0–6), `log` (date strings)
- Streak is calculated from consecutive logged days up to today
- Grid view: 7-day rolling week per habit
- Mark complete = tap/click the day cell
- Stores in `localStorage` key: `fx_habits`

### TASK-04 — Daily Journal (`/tools/journal`)
- One entry per calendar day — keyed by `YYYY-MM-DD`
- Editor: plain `<textarea>` with `font-family: DM Mono` — minimal, distraction-free
- Mood selector: 5 emoji options stored alongside entry text
- Past entries browsable by month calendar
- Stores in `localStorage` key: `fx_journal`

### TASK-05 — Daily Budget Tracker (`/tools/budget`)
- Entries have: `id`, `amount`, `label`, `type` (income/expense), `category`, `date`
- Shows: daily balance, running monthly total, category breakdown (bar chart in CSS, no library)
- Income shown in `--color-success`, expense in `--color-danger`
- Stores in `localStorage` key: `fx_budget`

### TASK-06 — Focus Timer (`/tools/focus`)
- Pomodoro-style: 25 min work / 5 min break — configurable
- Visual: circular progress ring (SVG, not Canvas)
- Plays a soft audio cue on session end (Web Audio API tone, no external audio file)
- Logs session history: date, duration, label
- Stores settings + history in `localStorage` key: `fx_focus`

### TASK-07 — Quick Notes / Scratchpad (`/tools/notes`)
- Multiple named notes (like tabs)
- Auto-saves on every keystroke (debounced 500ms)
- Each note: `id`, `title`, `content`, `updatedAt`
- Stores in `localStorage` key: `fx_notes`

### TASK-08 — QR Code Generator (`/tools/qr`)
- Input: URL or any text
- Renders QR via `qrcode` npm package (typed, no CDN)
- Download as PNG
- History: last 10 generated (with timestamp + label)
- Stores in `localStorage` key: `fx_qr`
- **REMOVE**: wedding invitation, rental contract, birthday card, event RSVP, invoice generator, business name generator — these are not personal daily tools

### TASK-09 — Settings (`/tools/settings`)
- Theme toggle: Light / Dark / System
- Export all data: single JSON file download of all `localStorage` keys prefixed `fx_`
- Import data: restore from exported JSON
- Clear data: per-tool or full reset (with confirmation modal)
- Set user name (used in dashboard greeting)

---

## 🎮 Games Section (`/tools/games`)

> Games are free-time tools. Keep them fun but non-addictive. No dark patterns.

### TASK-10a — CoinRush (Ported from original)
- Port from plain JS Canvas to a Svelte component with TypeScript
- Same mechanics: dodge + collect, increasing speed
- High score stored in `fx_games` store key `coinrush_best`
- **REMOVE** all AdSense interstitial ad blocks (`#betweenAd`) — there are no ads in Fluxday
- Game over screen shows only: score, best score, restart button

### TASK-10b — TypeDash (NEW GAME) ← priority build
**Concept:** A typing speed game where words fall from the top of the screen. Type the word before it reaches the bottom to destroy it. Miss too many = game over.

**Mechanics:**
- Words sourced from a hardcoded list of 200 common English words (no API)
- Difficulty increases every 30 seconds: words fall faster, more spawn at once
- Score = words typed correctly. Combo multiplier for consecutive correct words (x1 → x2 → x3 → x4 max)
- Miss 5 words = game over
- Input: single `<input>` at the bottom. Submit on `Space` or `Enter`. Auto-clears.
- Canvas-based rendering with `requestAnimationFrame`
- High score stored in `fx_games` store key `typedash_best`
- Show WPM at end (words typed ÷ elapsed minutes)

**TypeScript types to define:**
```typescript
interface FallingWord {
  id: string;
  text: string;
  x: number;        // canvas x position
  y: number;        // canvas y position (increases over time)
  speed: number;    // pixels per frame
  color: string;    // from design token palette
}

interface TypeDashState {
  words: FallingWord[];
  score: number;
  combo: number;
  misses: number;
  startTime: number;
  phase: 'idle' | 'playing' | 'gameover';
}
```

---

## 🎨 Design System (theme.css — define before building any component)

All values below go into `src/lib/theme.css`. **Never hardcode these anywhere else.**

```css
:root {
  /* Core palette — Fluxday dark mode default */
  --color-bg:          #0f1117;   /* near-black canvas */
  --color-surface:     #1a1d27;   /* card / panel background */
  --color-border:      #2a2d3a;   /* subtle dividers */
  --color-text:        #e2e4ed;   /* primary text */
  --color-muted:       #6b7080;   /* secondary / placeholder text */
  --color-accent:      #7b68ee;   /* medium slate-purple — Fluxday signature */
  --color-accent-dim:  #3d3570;   /* accent at low opacity */
  --color-success:     #4ade80;   /* income, done states */
  --color-danger:      #f87171;   /* expense, miss states */
  --color-warning:     #fbbf24;   /* due-soon, streak at risk */

  /* Light mode overrides */
  &.light {
    --color-bg:      #f5f5f8;
    --color-surface: #ffffff;
    --color-border:  #e0e0ea;
    --color-text:    #1a1d27;
    --color-muted:   #888aaa;
  }

  /* Spacing scale */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 24px;
  --space-6: 32px;
  --space-7: 48px;
  --space-8: 64px;

  /* Radii */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;

  /* Typography */
  --font-body: 'Inter', system-ui, sans-serif;
  --font-mono: 'DM Mono', 'Fira Code', monospace;
  --font-size-xs:  11px;
  --font-size-sm:  13px;
  --font-size-md:  15px;
  --font-size-lg:  18px;
  --font-size-xl:  24px;
  --font-size-2xl: 32px;

  /* Transitions */
  --transition-fast: 120ms ease;
  --transition-base: 200ms ease;
}
```

---

## 🔑 localStorage Key Map (LOCKED)

All keys use the `fx_` prefix. Do not invent new prefixes.

| Key | Tool | Type |
|---|---|---|
| `fx_todos` | Todo list | `Todo[]` |
| `fx_habits` | Habit tracker | `Habit[]` |
| `fx_journal` | Daily journal | `Record<string, JournalEntry>` |
| `fx_budget` | Budget tracker | `BudgetEntry[]` |
| `fx_focus` | Focus timer | `FocusData` |
| `fx_notes` | Quick notes | `Note[]` |
| `fx_qr` | QR history | `QREntry[]` |
| `fx_games` | Game scores | `GameScores` |
| `fx_settings` | App settings | `AppSettings` |

---

## 🚫 Removed from DailyKit (do not rebuild these)

These tools existed in the original project and are explicitly **out of scope** for Fluxday. Do not rebuild them, do not reference them, do not port them.

| Removed Tool | Reason |
|---|---|
| 💍 E-Wedding Invitation | One-time event tool, not daily |
| 🏠 Rental Contract Generator | Legal doc, not daily |
| 🎂 Birthday Card Maker | One-time event tool, not daily |
| 📋 Event RSVP Manager | One-time event tool, not daily |
| 🧾 Invoice Generator | Business tool, not personal daily use |
| 💡 Business Name Generator | One-time brainstorm tool |
| 📈 Google AdSense integration | Not applicable — personal system |
| 📊 Google Analytics | Not applicable — personal system |
| 🏗 Progress Tracker (old `dk_todos_v3`) | Replaced by TASK-02 (proper Todo system) |

---

## 📋 Build Order (follow this sequence)

Completing in this order prevents rework:

```
Phase 1 — Foundation
  [x] Scaffold React + Vite + TypeScript project
  [x] Define theme.css (design tokens)
  [x] Build Sidebar + Header + Card components
  [x] Write typed localStorage wrapper (src/utils/storage.ts)

Phase 2 — Core Daily Tools  
  [x] TASK-02: Todo list (most-used daily driver)
  [x] TASK-03: Habit tracker
  [x] TASK-04: Daily journal
  [x] TASK-01: Dashboard home (depends on all stores existing)

Phase 3 — Supporting Tools
  [x] TASK-05: Budget tracker
  [x] TASK-06: Focus timer
  [x] TASK-07: Quick notes
  [x] TASK-08: QR generator

Phase 4 — Games
  [x] TASK-10a: CoinRush port
  [x] checked: TASK-10b: TypeDash (new game)

Phase 5 — Polish
  [x] TASK-09: Settings (export/import/theme)
  [x] PWA manifest + icons
  [x] Keyboard navigation audit
  [x] Mobile layout pass (min width: 360px)
```

---

## ⚠️ Common Deviations to Watch For

These are patterns where AI agents tend to drift. If you catch yourself doing any of these, stop and correct.

| Drift Pattern | Correct Behavior |
|---|---|
| Adding a new tool not in the list | Add it to `PROPOSED_ADDITIONS` below, do not implement |
| Using SvelteKit/Vue/Angular | This project uses **React + Vite only** |
| Importing a UI component library (shadcn, DaisyUI, MUI, etc.) | Use only Lucide for icons, build all UI from scratch with theme.css |
| Writing `any` in TypeScript | Define a proper interface. Ask if unsure. |
| Adding AdSense, Analytics, or tracking scripts | This is a personal offline-first tool. No tracking. |
| Using a CDN for any library | Use `npm install` only |
| Storing data in a global JS variable | Use custom React hooks backed by localStorage |
| Creating files outside the approved directory structure | Propose the new path in this file first |
| Hardcoding colors like `#ff0000` in component CSS | Use `var(--color-danger)` from theme.css |
| Fetching data from the internet at runtime | All data is local. No runtime API calls. |

---

## 💡 PROPOSED_ADDITIONS (staging area — not yet approved)

> Add ideas here. Do not implement until the owner moves them to the Feature List above.

- [ ] Water intake tracker (daily counter + goal)
- [ ] Weekly review template (prompted journaling)
- [ ] Countdown timer tool (event countdowns)
- [ ] Tauri v2 desktop wrapper (offline-first desktop app)
- [ ] SnakeTyper game variant (snake game but words power growth)

---

## 🔏 Sign-off

This file was authored by the project owner and reviewed before any AI agent begins work.
Any modification to the locked sections (Tech Stack, Directory Structure, Feature List, Design System) requires the owner to update the version stamp below.

**Last updated:** 2026-06-11  
**Owner:** Wiznysht_  
**Version:** 1.1.0 — Tech stack changed from SvelteKit to React + Vite (owner request)
