# AI Literacy for the Modern Workforce

[![Code license: MIT](https://img.shields.io/badge/code-MIT-yellow.svg)](LICENSE)
[![Content license: CC BY-NC-SA 4.0](https://img.shields.io/badge/content-CC_BY--NC--SA_4.0-lightgrey.svg)](licenses/LICENSE-CONTENT)

A four-module interactive learning platform teaching AI literacy to mid-career knowledge workers. Built as a portfolio piece demonstrating end-to-end L&D program development — from needs analysis and instructional design through custom platform engineering and Kirkpatrick evaluation architecture.

Live: [ai-literacy.ritchot.me](https://ai-literacy.ritchot.me)

Best viewed on desktop. Mobile is fully functional, but the data dashboards and multi-panel practice activities are designed for larger screens.

## Program structure

The curriculum grew out of my M.Ed. in Education Technology and Instructional Design, where I built a module that teaches AI through one of its mechanics, tokenization, and the errors it predicts, not just its outputs. The four modules:

| Module | Focus | Sections | Duration |
|--------|-------|----------|----------|
| 1: Why AI Literacy Matters Now | Business case and adoption landscape | 8 | 15–20 min |
| 2: How AI Is Actually Being Used at Work | Real-world task patterns and productivity data | 8 | 15–20 min |
| 3: Understanding How Language Models Work | Tokenization, prediction, attention, steerability | 11 | 20–30 min |
| 4: Evaluating AI Outputs and Working Responsibly | Delegation, prompting, verification, diligence | 10 | 30–40 min |

37 sections total, 90–120 minutes end to end including the 10-item pre/post assessments. 12 practice activities (P1–P12). 7 downloadable reference items (R1–R7). 16 scenario-based knowledge checks.

## Tech stack

- **Framework:** React 18 + TypeScript (strict mode)
- **Build:** Vite 5 with `vite-plugin-singlefile` — produces a single `index.html` (no server required; works via `file://`)
- **Styling:** Tailwind CSS 3 with a custom design system aligned to [ritchot.me](https://ritchot.me) — Source Serif 4 / IBM Plex Sans / IBM Plex Mono typography, warm washi light mode and sumi dark mode on CSS-variable tokens, square hairline geometry, 4D competency color palette
- **Charts:** Recharts (interactive data visualizations across Modules 1–2, the analytics dashboard, and the Behind-the-Build pages)
- **Routing:** React Router v6 HashRouter (compatible with static hosting and `file://`)
- **State:** React Context (`LearnerProgressContext`) with localStorage persistence
- **Special:** `gpt-tokenizer` for the client-side tokenizer playground (Module 3), `jsPDF` for the completion profile PDF export (Module 4)
- **Deployment:** Cloudflare Pages (static, no backend)

## Platform modes

The platform supports two access modes, activated via URL parameter or keyboard shortcut and persisted in localStorage:

- **Learner** (default) — sequential section gating, inline sources hidden until the learner turns them on, no dashboard access
- **Portfolio** (`?portfolio=true` or Ctrl/Cmd+Shift+A) — free navigation, inline sources shown by default, analytics dashboard at `/#/dashboard` (demo data by default, with a live-data toggle)

## Getting started

Prerequisites: Node.js 20+ (see `.nvmrc`) and npm.

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

Output: `dist/index.html` (single file, ~4.6 MB ungzipped / ~1.9 MB gzipped) plus the downloadable PDF sets — `dist/reference/` (7 reference items), `dist/needs-analysis/` (4), `dist/evaluation/` (4), and `dist/build/` (7).

The single-file architecture means the entire platform — React app, fonts, styles, chart libraries — is inlined into one HTML file. This enables `file://` delivery with zero infrastructure, at the cost of code-splitting (not possible with `vite-plugin-singlefile`).

## Project structure

```
src/
├── dashboard/        Learning analytics dashboard (Component 4D)
├── components/
│   ├── shared/       Platform-wide components (SectionContainer, Citation,
│   │                 KnowledgeCheck, LandingPage, PlatformShell, Sidebar)
│   ├── assessment/   Pre/post assessment flow (items, results, growth view)
│   └── reference/    R1–R7 reference panel components
├── contexts/         React contexts (LearnerProgress, Analytics)
├── data/             JSON datasets, citation registry, program structure,
│                     pre/post assessment item banks
├── hooks/            Custom hooks (useTheme, usePlatformMode, useCitations,
│                     useChartTokens, useExpandableSet, useLocalStorage,
│                     useReducedMotion, useSectionParam, useViewport)
├── modules/
│   ├── module1/      Data narratives, geographic scatter, adoption charts
│   ├── module2/      Augmentation/automation dashboard, productivity dashboard
│   ├── module3/      Tokenizer playground, next-token demo, context window sim
│   └── module4/      Task decomposition, prompt reformulation, output verification,
│                     iterative refinement, diligence statement, completion summary
├── pages/            Standalone pages: needs-analysis, evaluation, and
│                     Behind-the-Build artifact series, assessments, ThankYou
├── styles/           Global CSS (variables, keyframes, utilities)
└── utils/            Helpers (module-gating, chart-config, motion)
```

## Design decisions

**Single-file build.** The platform must work when opened directly from disk (`file://` protocol) — this enables offline distribution and removes hosting as a dependency for portfolio reviewers. The tradeoff is ~700 KB of inlined font binaries (the self-hosted web faces plus the PDF exporter's TTF subsets) and no lazy-loading of route chunks.

**No backend.** All state lives in localStorage. Analytics events are captured client-side and exportable as JSON/xAPI from the analytics dashboard. This keeps deployment to a single static file with zero ongoing infrastructure cost.

**Sequential gating in Learner mode.** Sections unlock only when the preceding section is complete (scroll + interaction). This models the instructional design principle that each section builds on prior knowledge — but Portfolio mode removes the gate for non-sequential reviewers.

**Scenario-based assessment.** All knowledge checks use "Given this situation, what should you do?" stems rather than definitional recall. Feedback is consequence-based (each option leads to a realistic outcome) rather than correct/incorrect labels.

## Research corpus

Content traces to specific findings from:

- Handa et al. (2025) — task-level AI adoption patterns
- Appel, McCrory & Tamkin (2025) — geographic adoption disparities
- Tamkin & McCrory (2025) — productivity gains measurement
- Appel, Massenkoff & McCrory (2026) — Economic Primitives: task complexity, success rates, and the November 2025 adoption wave
- Massenkoff & McCrory (2026) — observed AI exposure and early labor-market evidence
- Handa et al., Dec 2025 — Anthropic Interviewer: professional attitudes and stigma
- Huang et al. (Dec 2025) — How AI Is Transforming Work at Anthropic: what its engineers delegate and what stays human
- WEF Future of Jobs Report (2025) — skill demand projections, employer transformation barriers, AI workforce strategies, and GenAI substitution capacity
- Tinkoff et al., McKinsey (2026) — The state of AI in 2026: enterprise adoption, returns, and impact measurement
- Yee et al., McKinsey Global Institute (2025) — Agents, robots, and us: skill partnerships in the age of AI (United States)
- Johansson et al., McKinsey Global Institute (2026) — Agents, robots, and us: how AI reshapes work and skills in Europe
- Chatterji et al., OpenAI (2026) — How Organizations Use AI: enterprise adoption evidence from ChatGPT
- MIT Ad Hoc Committee (2026) — AI use in teaching, learning, and research training: institutional policy, disclosure, and acceptable-use precedent
- Aubakirova et al., OpenRouter and a16z (2025) — routed-usage telemetry: prompt length, reasoning-model share, programming share
- Evans (2025–2026) — *AI eats the world* slide decks; analyst commentary used for industry framing, with each chart's primary source named in the citation registry
- Ritchot (2025) — Token-Level Abstraction: the WGU capstone module this program grew from
- Dakan & Feller (2025) — Framework for AI Fluency, Version 1.1, as taught in Anthropic's AI Fluency: Framework & Foundations course
- Reuters/UBS (Feb 2023) — ChatGPT's early user-growth estimate
- Bick, Blandin & Deming (NBER 2024) — The Rapid Adoption of Generative AI: workforce adoption survey
- Hsieh et al. (2024) — RULER: effective versus claimed context length
- Modarressi et al. (2025) — NoLiMa: long-context evaluation beyond literal matching
- OpenAI tiktoken documentation — tokenizer reference for Module 3
- Zell & Krizan (2014) — metasynthesis of self-insight into one's own abilities
- Kruger & Dunning (1999) — overestimation by the least skilled
- Gignac & Zajenkowski (2020) — the Dunning–Kruger effect as a statistical artifact
- Svenson (1981) — the better-than-average driver finding
- Barber & Odean (2001) — overconfidence in common stock investment
- Vendor model documentation (Anthropic, OpenAI, Google, 2026) — current model and context-window specifications
- Qwen Team (2025) — Qwen3-8B model card
- Hardman — transfer research and practice-based methods

These are the anchor sources; the in-module citation registry and the artifact pages' linked bibliographies extend the set (Lee et al. CHI 2025, Mollick 2012, the Anthropic Economic Index reports, and others).

## License

This project uses a dual license:

- **Code** (`LICENSE`): MIT License
- **Content** (`licenses/LICENSE-CONTENT`): CC BY-NC-SA 4.0

The competency taxonomy is adapted from Anthropic's [AI Fluency: Framework & Foundations](https://anthropic.skilljar.com/ai-fluency-framework-foundations) course (2025, CC BY-NC-SA 4.0; Copyright 2025 Rick Dakan, Joseph Feller, and Anthropic), which teaches the [4D AI Fluency Framework](https://ringling.libguides.com/ai/framework) (Dakan & Feller, 2025, CC BY-NC-ND 4.0). Commercial use of course content requires a separate agreement — contact michael@ritchot.me.

## Author

Michael Ritchot — [ritchot.me](https://ritchot.me) — [LinkedIn](https://www.linkedin.com/in/mritchot/) — [X](https://x.com/MichaelRitchot)
