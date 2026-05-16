# AI Literacy for the Modern Workforce

A four-module interactive learning platform teaching AI literacy to mid-career knowledge workers. Built as a portfolio piece demonstrating end-to-end L&D program development — from needs analysis and instructional design through custom platform engineering and Kirkpatrick evaluation architecture.

Live: [ai-literacy.ritchot.me](https://ai-literacy.ritchot.me)

## Program structure

The curriculum is organized around four competency dimensions adapted from Anthropic's 4D AI Fluency Framework:

| Module | Focus | Sections | Duration |
|--------|-------|----------|----------|
| 1: Why AI Literacy Matters Now | Business case and adoption landscape | 8 | ~15 min |
| 2: How AI Is Actually Being Used at Work | Real-world task patterns and productivity data | 8 | ~20 min |
| 3: Understanding How Language Models Work | Tokenization, prediction, attention, steerability | 11 | ~25 min |
| 4: Evaluating AI Outputs and Working Responsibly | Delegation, prompting, verification, diligence | 10 | ~32 min |

37 sections total. 12 practice activities (P1–P12). 7 downloadable reference items (R1–R7). 16 scenario-based knowledge checks.

## Tech stack

- **Framework:** React 18 + TypeScript (strict mode)
- **Build:** Vite 5 with `vite-plugin-singlefile` — produces a single `index.html` (no server required; works via `file://`)
- **Styling:** Tailwind CSS 3 with a custom design system (DM Sans / DM Serif Display / DM Mono typography, 4D competency color palette, CSS-variable-driven dark mode)
- **Charts:** Recharts (6 interactive data visualizations across Modules 1–2)
- **Routing:** React Router v6 HashRouter (compatible with static hosting and `file://`)
- **State:** React Context (`LearnerProgressContext`) with localStorage persistence
- **Special:** `gpt-tokenizer` for the client-side tokenizer playground (Module 3), `jsPDF` for the completion profile PDF export (Module 4)
- **Deployment:** Cloudflare Pages (static, no backend)

## Platform modes

The platform supports three access modes, activated via URL parameters and persisted in localStorage:

- **Learner** (default) — sequential section gating, no admin access
- **Portfolio** (`?portfolio=true`) — free navigation, demo analytics dashboard
- **Admin** (`?admin=true` or Ctrl/Cmd+Shift+A) — free navigation, live analytics dashboard

## Getting started

Prerequisites: Node.js 18+ and npm.

```
git clone <repo-url>
cd ai-literacy-platform
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

## Build

```
npm run build
```

Output: `dist/index.html` (single file, ~4.7 MB ungzipped / ~1.9 MB gzipped) plus `dist/reference/*.pdf` (7 downloadable reference items).

The single-file architecture means the entire platform — React app, fonts, styles, chart libraries — is inlined into one HTML file. This enables `file://` delivery with zero infrastructure, at the cost of code-splitting (not possible with `vite-plugin-singlefile`).

## Project structure

```
src/
├── admin/            Admin dashboard (Component 4D)
├── assets/           Static assets (SVG icons)
├── components/
│   ├── shared/       Platform-wide components (SectionContainer, Citation,
│   │                 KnowledgeCheck, LandingPage, PlatformShell, Sidebar)
│   └── reference/    R1–R7 reference panel components
├── contexts/         React contexts (LearnerProgress, Analytics)
├── data/             JSON datasets, citation registry, program structure
├── hooks/            Custom hooks (useTheme, usePlatformMode, useCitations,
│                     useChartTokens, useAnalytics)
├── modules/
│   ├── module1/      Data narratives, geographic scatter, adoption charts
│   ├── module2/      Augmentation/automation dashboard, productivity dashboard
│   ├── module3/      Tokenizer playground, next-token demo, context window sim
│   └── module4/      Task decomposition, prompt reformulation, output verification,
│                     iterative refinement, diligence statement, completion summary
├── pages/            Standalone pages (ThankYou)
├── styles/           Global CSS (variables, keyframes, utilities)
└── utils/            Helpers (module-gating, chart-config)
```

## Design decisions

**Single-file build.** The platform must work when opened directly from disk (`file://` protocol) — this enables offline distribution and removes hosting as a dependency for portfolio reviewers. The tradeoff is ~585 KB of inlined font binaries and no lazy-loading of route chunks.

**No backend.** All state lives in localStorage. Analytics events are captured client-side and exportable as JSON/xAPI from the admin dashboard. This keeps deployment to a single static file with zero ongoing infrastructure cost.

**Sequential gating in Learner mode.** Sections unlock only when the preceding section is complete (scroll + interaction). This models the instructional design principle that each section builds on prior knowledge — but Portfolio mode removes the gate for non-sequential reviewers.

**Scenario-based assessment.** All knowledge checks use "Given this situation, what should you do?" stems rather than definitional recall. Feedback is consequence-based (each option leads to a realistic outcome) rather than correct/incorrect labels.

## Research corpus

Content traces to specific findings from:

- Handa et al. (2025) — task-level AI adoption patterns
- Appel, McCrory & Tamkin (2025) — geographic adoption disparities
- Tamkin & McCrory (2025) — productivity gains measurement
- Anthropic Interviewer (2025) — professional attitudes and stigma
- WEF Future of Jobs Report (2025) — skill demand projections
- Hardman — transfer research and practice-based methods

This is the v1 minimum-viable corpus. Additional research will be added in future iterations of the course.

## License

This project uses a dual license:

- **Code** (`LICENSE-CODE`): MIT License
- **Content** (`LICENSE-CONTENT`): CC BY-NC-SA 4.0

The competency taxonomy is adapted from Anthropic's 4D AI Fluency Framework, licensed under CC BY-NC-SA 4.0. Commercial use of course content requires a separate agreement — contact michael@ritchot.me.

## Author

Michael Ritchot — [ritchot.me](https://ritchot.me) — [LinkedIn](https://www.linkedin.com/in/mritchot/)
