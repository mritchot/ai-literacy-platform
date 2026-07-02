# AUDIT — Pass 1 (02-07-2026)

Branch: `audit/cleanup-20260702`. Read-only sweep completed before any source edit.

## Method

Eight parallel audit agents (correctness, types, dead code, performance, a11y, security,
maintainability, tooling) + one Admin/course-info footprint inventory, run via workflow
orchestration (~1.7M tokens, 485 tool calls). The planned per-finding adversarial-verification
agents hit the session usage limit, so every finding marked APPLY below was instead verified
manually in the main session by reading the cited code. Findings that could not be confirmed
were dropped or kept PROPOSED.

## Baseline (before any edit)

| Check | Status |
|---|---|
| Lint | **NO LINT SCRIPT / NO ESLINT CONFIG** (tooling finding T-2) |
| `npx tsc --noEmit` | PASS — but **vacuous**: checks 0 files (tooling finding T-1) |
| `tsc -b` (inside `npm run build`) | PASS |
| `npm run build` | PASS — `dist/index.html` 5,239.65 kB (gzip 2,389.61 kB), 1,401 modules |
| `npm audit` | 6 vulns (1 low, 4 moderate, 1 high): @babel/core, dompurify (via jspdf), esbuild/vite, react-router open-redirect. Report-only. |

Baseline `.md` snapshot (must survive final cleanup): root `CLAUDE.md, DILIGENCE.md, MEMORY.md,
README.md, TODO.md, TODOARCHIVE.md`; `src/pages/{evaluation,needs-analysis}/content/*.md` (8 files);
`public/needs-analysis/README.md`.

## Authorized change plan (applied in this iteration's fix stage)

**#1 Admin → Portfolio consolidation.**
- `PlatformMode` shrinks to `'learner' | 'portfolio'`; tsc flags every stale comparison.
- `?admin=true` detection removed entirely (no alias; stale links land in learner mode).
- localStorage key `platform-mode` unchanged (frozen); stored legacy value `'admin'` is
  normalized to `'portfolio'` on read so an unlocked reviewer/owner state isn't silently relocked.
- Ctrl/Cmd+Shift+A kept, repointed: toggles learner ↔ portfolio.
- Dashboard kept, with demo/live toggle; default is now always demo. UI copy de-branded:
  overline "Admin Dashboard" → "Analytics", sidebar link "Admin dashboard" → "Analytics dashboard".
- Internal renames: `src/admin/` → `src/dashboard/`, `AdminDashboard` → `AnalyticsDashboard`,
  `AdminRoute` → `DashboardRoute`, `adminActive` → `dashboardActive`.
- Route path `/#/admin` KEPT (external links/bookmarks; renaming is PROPOSED, see P-16).
- xAPI/JSON export shape untouched, incl. frozen `exportedBy: 'admin-dashboard'` literal.
- `src/pages/evaluation/content/02_level-2-learning.md:41` "the admin view" → "the analytics
  dashboard" (only user-facing content string referencing admin).
- README modes section rewritten to two modes; structure tree updated.

**#2 course-info removal.** Folder is UNTRACKED (`.gitignore:27`), so no `git rm` applies —
deviation from the task's assumed procedure. Executed as: `mv ./course-info ~/Downloads/`
(date-suffix if exists), then one commit removing the now-stale `.gitignore` block (lines 21–27)
and the four dangling `course-info/...` path comments in tracked sources
(`LearnerProgressContext.tsx:135`, `pre-assessment.ts:10`, `post-assessment.ts:10`, `ActionMap.tsx:2`).
Untracked root `CLAUDE.md`/`MEMORY.md`/`TODO.md` still reference course-info paths — out of git
scope; flagged in final summary for Maverick.

## APPLY in this iteration (all verified in-session; mechanical / zero visual change)

| # | file:line | Finding | Commit group |
|---|---|---|---|
| A-1 | `src/components/reference/R{1-7}Trigger.tsx` (7 pdfPath), `src/pages/needs-analysis/config.ts:67-70`, `src/pages/evaluation/config.ts:56-59`, `ReferencePanel.tsx:14` comment | Root-absolute public-asset URLs (`/reference/...`) 404 under `file://` and sub-path hosting — violates the stated load-bearing `file://` constraint. Relative paths are byte-identical in current root-hosted deploy. | fix: relative asset paths |
| A-2 | `CompletionSummary.tsx:146,153`; `AssessmentResults.tsx:79`; `TokenizerPlayground.tsx` GuidedRound `:278-289` | Hooks called after conditional early returns (Rules of Hooks). Hoisting verified safe per-site. | fix: hooks order |
| A-3 | `AnalyticsContext.tsx:20,37-47` | `download()` dead API — never consumed (export lives in ExportControls). | refactor: dead code |
| A-4 | `LearnerProgressContext.tsx` | Dead value members: `isSectionScrolled`, `isSectionInteractionComplete`, `getViewedTabCount`, `isEngaged`, `addActiveTime` (context-internal only). | refactor: dead code |
| A-5 | `useTheme.ts:72` | `setPreference` never consumed. | refactor: dead code |
| A-6 | `program.ts:27-28` + `SectionContainer.tsx:194` | `ModuleMeta.locked`/`active` vestigial (locked always false; active never read). | refactor: dead code |
| A-7 | `post-assessment.ts:13,15` | Dead type re-export (`AssessmentBlock`, `AssessmentOption`) — consumers import from pre-assessment. | refactor: dead code |
| A-8 | `Icon.tsx` | `refresh` glyph never rendered. | refactor: dead code |
| A-9 | `module-gating.ts:37-63` | Optional `assessments` param + `?? true` fallbacks dead (both callers pass it); stale migration comment. | refactor: dead code |
| A-10 | `styles/index.css:76` | `--ease` custom property unreferenced. | refactor: dead code |
| A-11 | `src/routes/` | Empty directory (untracked); remove. | (fs only) |
| A-12 | `.gitignore:37-40` | Stale `claude-code/*.md` block — folder removed 24-06-2026. | chore: gitignore |
| A-13 | `package.json:10` | `typecheck` is a no-op (`tsc --noEmit` on solution-style root checks 0 files — verified with `--listFiles`). → `tsc -b`. | fix: typecheck script |
| A-14 | `ExportControls.tsx:44,53,64` | `VERB_MAP` Record annotation erases literal keys, forcing `!`. → `satisfies`, delete `!`. Type-only. | refactor: types |
| A-15 | `kc-metadata.ts:37+` + `KCResponseAnalysis.tsx:41,62` | Same pattern: `satisfies` + `KCId`/`ICId` unions remove `!` at consumers. Type-only. | refactor: types |
| A-16 | `GeographicAdoptionChart.tsx:531-536` | Undocumented `as any` at Recharts boundary — add the rationale comment (project rule). | refactor: types |
| A-17 | `render-markdown.tsx:40` | `renderInline` emits `href` without scheme allowlist (`javascript:` passes). All current content is build-time, so zero visual change; hardening only. | fix: markdown scheme allowlist |
| A-18 | `AdoptionTrendChart.tsx:63,70`; `GeographicAdoptionChart.tsx:698` | Chart data arrays rebuilt per render → Recharts full re-layout + 400ms animation restart on every parent re-render (incl. 10s heartbeat). `useMemo` on stable props. | perf |
| A-19 | `TokenizerPlayground.tsx:53-82` | `initialResults`/`initialStage` memos recompute (re-tokenize) on every progress write but feed only `useState` initializers — recomputations discarded. → lazy `useState` initializers. Verified no other readers. | perf |
| A-20 | `AugAutoDashboard.tsx:79`, `ProductivityDashboard.tsx:63`, `NextTokenDemo.tsx:59`, `ContextWindowScenario.tsx:205`, `PromptComparison.tsx:508` | Roving-tabindex contract broken: arrow keys change active tab but never move focus — third tab unreachable by keyboard (completion-blocking in NextTokenDemo). Fix mirrors in-repo DataSourceToggle pattern. | a11y: tabs |
| A-21 | `ArtifactViewerModal.tsx:97,40-48` | Body scroll region not keyboard-scrollable; Tab handler pins focus to footer Close, making header X unreachable (comment "single focusable element" is false). Add `tabIndex=0 role=region` body + cycle focus. | a11y: scroll regions |
| A-22 | `ReferencePanel.tsx:207` | Drawer body scroll region not focusable → keyboard-unscrollable for long items. `tabIndex=0 role=region aria-labelledby`. | a11y: scroll regions |
| A-23 | `src/dashboard/index.tsx:145+`, `EventTimeline.tsx:128` | Dashboard section titles are Overline divs, not headings (h1 with no h2s). Wrap in `<h2 className="m-0">` — exact LandingPage pattern, zero visual change. | a11y: structure |
| A-24 | `R2DelegationGuide.tsx:624`, `R3PromptTemplate.tsx:264`, `R4VerificationChecklist.tsx:236`, `R6DiligenceTemplate.tsx:363,413`, `R7PolicyStarter.tsx:524` | Heading levels skip (panel h2 → h4/h5). → h3, classes unchanged (Tailwind preflight ⇒ zero visual change). | a11y: structure |
| A-25 | `KnowledgeCheck.tsx:304` | "See all responses" disclosure lacks `aria-expanded` (sibling InterpretationCheck:266 has it). | a11y: structure |
| A-26 | `IterativeRefinement.tsx:752` | Refinement textarea placeholder-only accessible name → `aria-label`. | a11y: structure |
| A-27 | `styles/index.css:252` | Range-slider focus ring is webkit-only; `:focus-visible{outline:none}` leaves Firefox with zero indicator → add `::-moz-range-thumb` rule. | a11y: structure |

Note on A-20/21/22: these change keyboard/AT behavior only, by making the pattern already
promised by the markup (roving tabindex, scrollable dialog) actually work; visual rendering and
mouse behavior are untouched. Grouped in `a11y:` commits for easy revert if judged out of scope.

## PROPOSED (recorded only — needs judgment or has behavioral effect)

| # | Sev | file:line | Issue / recommendation |
|---|---|---|---|
| P-1 | **HIGH** | `module1/index.tsx:471-478` (+ module2:521, module3:730, module4:210,319) | KC-completion effects guard on legacy `completedSections` (never written) with deps whose identity churns on every progress write → once all KCs answered, duplicate `kc_module_N_complete` analytics events fire on every heartbeat/write while on the section, unboundedly corrupting the frozen `ail.analytics` store, dashboard counts, and exports. Fix: guard on `state.interactionCompleteSections[key]` (verified equivalent incl. legacy migration). Changes emitted event stream → left PROPOSED, but **apply this first** next time you accept a behavioral fix. |
| P-2 | **HIGH** | `LandingPage.tsx:56-64,252-255` | Resume CTA / M4 card deep-link into post-assessment-locked M4 S10 in learner mode (bypasses the bookend gate the sidebar + S9 redirect enforce). Fix: skip `gating.isSectionLocked` sections; route to `/post-assessment` when S10 is the target. |
| P-3 | **HIGH** | `LearnerProgressContext.tsx:431-471` | 10s active-time heartbeat re-renders every progress consumer (incl. Recharts trees) and re-serializes all of `ail.progress`, for data only the dashboard reads. Fix: accumulate in a ref; flush on section change/visibility/pagehide/cap. Shape stays byte-identical. |
| P-4 | MED | `LearnerProgressContext.tsx:209-251` | Migration useMemo rebuilds all nine nested maps with fresh identities on every write, defeating all downstream memoization. Fix: migrate once at load (lazy init), not per render. |
| P-5 | MED | `AnalyticsContext.tsx:26-54` | Every `track()` re-renders all consumers + O(n) JSON.stringify of the unbounded event array per event. Fix: split stable-actions / events-data contexts. |
| P-6 | MED | `useTheme.ts` (+ `useChartTokens`) | Per-instance theme state desyncs 7 consumers — charts keep stale palette after toggle; stray matchMedia listeners fight explicit choices. Fix: module-level store + `useSyncExternalStore` (pattern already in usePlatformMode/useCitations); also removes theme prop-drilling through PlatformShell. |
| P-7 | MED | `TokenizerPlayground.tsx:7` (+ TokenComparisonDiagram, StickerAnalogyDiagram) | `gpt-tokenizer` root import = o200k_base: ~2.2 MB rank data + ~200k-entry map built at startup of the single file; docs/comments verify counts against **cl100k_base** — runtime encoding disagrees with documented one. Fix: import `gpt-tokenizer/encoding/cl100k_base` (halves payload, aligns with docs) — changes displayed token counts → needs content sign-off. |
| P-8 | MED | `ContextWindowScenario.tsx:49,130` | P7 re-entry restore reads `engagedFlags['3.7.p7_verification_started']` that nothing writes (`markEngaged` never called) → phase resets to setup on re-entry; duplicate `p7_items_correct` events on revisit. Fix: call `markEngaged(3,7,...)` in Begin onClick. |
| P-9 | MED | `useLocalStorage.ts:9` | `JSON.parse(raw) as T` unvalidated — corrupt `ail.progress`/`ail.analytics` crashes consumers. Add optional validator param, read-side only (keys frozen). |
| P-10 | MED | `font-loader.ts:80`; `CompletionSummary.tsx:213-216` | Rejected font-fetch promise is cached forever → PDF download permanently dead after one transient failure; download click has no try/catch. |
| P-11 | MED | a11y batch | Skip link (PlatformShell, WCAG 2.4.1); focus/scroll management on route change for non-module routes; KnowledgeCheck/AssessmentItem radio-group semantics (currently aria-pressed toggles); aria-live feedback region mounted-with-content (announcement unreliable); ActionMap `<div onClick>` behavior cards (keyboard-inoperable core interaction); EventTimeline filter radiogroup without arrow keys; AssessmentItem h2 wrapping block content. |
| P-12 | MED | contrast tokens | Dark-mode `--ghost` #464038 ≈1.4:1 vs card (radio rings invisible); selected-state TIER1 #A0AEB8 ≈2.2:1 in light mode; ActionMap hardcoded #888/#999 at 10.5px + full light-palette island in dark mode. Token changes → design judgment. |
| P-13 | MED | `chart-config.ts:56` | TOKEN_HEX→useChartTokens migration incomplete: 10 module-2/3 components (32 refs) still hardcode light-mode hexes → low-contrast in dark mode. |
| P-14 | MED | tsconfig | `noUncheckedIndexedAccess` (57 errors, 3 files), `exactOptionalPropertyTypes` (14 errors, 8 files), `noPropertyAccessFromIndexSignature` (3); `noImplicitOverride` + `verbatimModuleSyntax` compile clean today (0 errors) — all strictness increases are propose-only per task. |
| P-15 | MED | `package.json` | No ESLint: add eslint@9 flat config + typescript-eslint + eslint-plugin-react-hooks (would have caught A-2/P-1 classes). Concrete config in pass-1 notes. |
| P-16 | LOW | `router.tsx:96` | Route path `/#/admin` retains admin naming; renaming to `/#/analytics` breaks bookmarks unless a redirect route is kept. Decide post-consolidation. |
| P-17 | LOW | misc | NextTokenDemo temperature slider tracks every step (~19 events/drag; debounce like geo search); GeographicAdoptionChart re-animates per keystroke in All-Countries search; blind union casts on persisted `selectedOptionId` (TaskDecomposition:63, ContextWindowScenario:41); `as unknown as` double casts (module2/index.tsx:36, CompletionSummary:187); citation popovers accumulate on keyboard Tab (Citation.tsx:146 no onBlur); PDF excerpt unconditional ellipsis (generate-completion-pdf.ts:999). |
| P-18 | LOW | structure | Copy-paste page families needs-analysis/evaluation (~350 dup lines, already diverging); section-param boilerplate ×4 module indexes with hardcoded max sections; storage-key literals scattered (5 sites); 4D palette hexes re-declared in ~23 files; oversized files with clean seams (generate-completion-pdf 1539, ActionMap 880, GDPCorrelationScatter 838, Sidebar 752); RxTrigger ×7 registry consolidation; ReferenceTriggerButton dead 'inline' variant (kept per comment — needs human call); tailwind unused tokens + 285 arbitrary text-[Npx]; `@/*` alias configured but unused. |
| P-19 | LOW | deploy/meta | `public/needs-analysis/README.md` (internal workflow doc) ships into dist; no OG/Twitter meta on a portfolio site; npm audit items (report-only): react-router open-redirect fixable via `npm audit fix` (dep upgrade = proposal). |

## Dropped after verification

- "AssessmentBlock re-import needed for noUnusedLocals" nuance (finder's fix note) — simplified: both re-exported types deletable from import outright.
- No committed secrets, no `dangerouslySetInnerHTML`, no missing `rel="noopener noreferrer"` (all `target="_blank"` links carry it), no unused npm dependencies found — clean.
