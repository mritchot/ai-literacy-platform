# AUDIT — Pass 2 (02-07-2026)

Scope: orphan hunt after the Admin→Portfolio consolidation, regression review of every
iteration-1 diff, and re-sweep of areas pass 1 covered thinly (hooks, listeners/timers,
TopBar, useCitations/useViewport). Run in the main session (subagent capacity still
rate-limited). tsc -b and build PASS at pass start.

## Verified intentional remnants (no action)

- Route path `/#/admin` (router.tsx:96, Sidebar links, README) — kept deliberately for
  existing external links; rename remains PROPOSED P-16.
- `normalizeStoredMode` maps legacy stored `'admin'` → `'portfolio'` (usePlatformMode.ts:43) —
  the documented migration shim.
- `exportedBy: 'admin-dashboard'` ×3 (ExportControls) — frozen export shape.
- "three modes" mentions in PlatformShell/Sidebar/useTheme refer to the THEME's
  system/light/dark — not the platform mode system. Module 3 content "three modes" is
  instructional copy. All correct as-is.
- "admin/administrative" in JSON data + evaluation content = occupation names and ordinary
  English.

## APPLY in this iteration

| # | file:line | Finding |
|---|---|---|
| B-1 | `src/dashboard/kc-metadata.ts:4`, `src/dashboard/AssessmentResponseAnalysis.tsx:38`, `src/dashboard/KCResponseAnalysis.tsx:127`, `src/dashboard/section-labels.ts:2`, `src/dashboard/DataSourceToggle.tsx:3` | Five comments still say "admin chunk / admin-only / admin surface / AdminDashboard" — stale naming left behind by the consolidation. Comment-only rewording. |

## Regression review of iteration-1 diffs — CLEAN

- Tab-focus fix: ids `p6-tab-N` / `p7-doctab-*` / `p11-comparetab-*` all match their
  handlers; NextTokenDemo map variable confirmed to be the stem number.
- ArtifactViewerModal focus cycle: three stops resolve; backdrop intentionally excluded
  (Escape + click still close); type-predicate error caught by tsc and fixed pre-commit.
- render-markdown `safeHref`: disallowed scheme renders a non-navigating anchor; all current
  content unaffected (verified https/mailto/# only).
- Citation.tsx listeners/timers: cleanup verified present (clearTimeout + removeEventListener
  in effect returns) — no missing-cleanup findings anywhere in src; module-level listeners
  (useCitations, usePlatformMode ×2) are intentional singletons.
- Dead-code removals: no dangling imports; tsc/build green throughout.

## PROPOSED (new this pass)

| # | Sev | file:line | Issue |
|---|---|---|---|
| P2-1 | LOW | `src/components/shared/Overline.tsx:13` | Overline renders a `<div>`; wrapping it in `<h2>` (LandingPage's pre-existing pattern, now also dashboard sections) nests flow content inside a heading. Works in practice for browsers/AT; an `as?: 'span'` prop would make the content model strictly valid. |
| P2-2 | LOW | `DiligenceStatement.tsx:98`, `IterativeRefinement.tsx:158,183` | scrollIntoView setTimeout(…,100) not cleared on unmount. Harmless today (optional-chained refs on unmounted nodes no-op); clearing would be strictness, not a bug fix. |
| P2-3 | LOW | `demo-data.ts:193,202`, `ReferencePanel.tsx:98-99`, `NextTokenDemo.tsx:78` | Remaining non-null assertions, all bounds-guaranteed by construction. Would be resolved naturally by the P-14 `noUncheckedIndexedAccess` adoption; not worth churn alone. |
| P2-4 | LOW | `src/hooks/useCitations.ts:8-10` | Design-note comment claims useTheme has "exactly one instance" — stale (useChartTokens creates six more; that's the P-6 desync bug). The note's own conclusion is unaffected; folding the correction into the P-6 refactor beats editing a comment P-6 rewrites anyway. |

All pass-1 PROPOSED items (P-1…P-19) remain open and unchanged.
