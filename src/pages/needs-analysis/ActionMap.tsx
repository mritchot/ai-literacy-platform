// Action Map — interactive artifact. Ported from the design-phase JSX
// prototype (02c_action-map.jsx, Phase 1 planning corpus) into a typed
// route component that lives inside PlatformShell.
//
// Changes from the prototype, all to fit the platform: the Google-Fonts
// <link> is dropped (the platform self-hosts its fonts via @fontsource — no
// outbound requests), the full-bleed 100vh wrapper and its own page header
// are replaced by the shared artifact chrome, and the behavior grid uses a
// responsive Tailwind column count. The behavior metadata (gap traces,
// module traces, the center goal) is reconciled to the finalized
// `04_action-map.md` — where the prototype's inline text diverged, the
// markdown wins — and the traces' `{{cite:…}}` tokens render as citation
// chips through the inline markdown renderer. The delivery note,
// Traceability Summary, and Scope notes are rendered verbatim from that
// same markdown file; the Sources list is generated from the registry
// entries the markdown and the map data cite (SourcesList).
//
// This file is the page shell/prose. The static content tables live in
// action-map-data.ts; the interactive quadrant map (with its keyboard/
// dark-mode fixes over the prototype) lives in action-map-interactive.tsx.

import ACTION_MAP_MD from './content/04_action-map.md?raw';
import { citedIds, renderMarkdown } from '../../components/shared/render-markdown';
import { SourcesList } from '../../components/shared/CitationNotes';
import { InteractiveMap } from './action-map-interactive';
import { BEHAVIORS, GOAL_NOTE } from './action-map-data';
import { ArtifactFooter, ArtifactHeader, ArtifactPage, ArtifactTopBar } from './chrome';

// ─── Prose sections sliced from the finalized markdown ─────────────────

const AM_SECTIONS: Record<string, string> = (() => {
  const out: Record<string, string> = {};
  for (const part of ACTION_MAP_MD.replace(/\r\n/g, '\n').split(/\n## /)) {
    const nl = part.indexOf('\n');
    const head = (nl === -1 ? part : part.slice(0, nl)).trim();
    out[head] = nl === -1 ? '' : part.slice(nl + 1).trim();
  }
  return out;
})();

function stripTrailingRule(s: string): string {
  return s.replace(/\n*-{3,}\s*$/, '').trim();
}

// Intro = the framing line + the dual-platform delivery note (the blockquote
// under the document subtitle). Traceability / Scope are their own H2
// sections.
// The framing line and delivery note sit before the first `## ` heading,
// so their key is the document's H1 line (`# Action Map`).
const INTRO_MD = stripTrailingRule(AM_SECTIONS['# Action Map'] ?? '');
const TRACEABILITY_MD = stripTrailingRule(AM_SECTIONS['Traceability Summary'] ?? '');
const SCOPE_MD = stripTrailingRule(AM_SECTIONS['Scope and Feasibility Notes'] ?? '');

// Every registry entry the page cites, in order of first citation: the
// markdown (which carries the same gap traces the map renders), then the
// map's own strings.
const SOURCE_IDS = citedIds(
  ACTION_MAP_MD,
  ...Object.values(BEHAVIORS).flatMap((list) => list.flatMap((b) => [b.gap, b.module])),
  GOAL_NOTE,
);

// ─── Prose section wrapper ─────────────────────────────────────────────

function ProseSection({ heading, body }: { heading: string; body: string }): JSX.Element | null {
  if (!body) return null;
  return (
    <section className="mt-10">
      <h2 className="mb-3 font-sans text-h2 font-semibold text-ink">{heading}</h2>
      <div className="max-w-reading">{renderMarkdown(body)}</div>
    </section>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────

export default function ActionMap(): JSX.Element {
  return (
    <ArtifactPage width="interactive">
      <ArtifactTopBar pdfSlug="action-map" />
      <ArtifactHeader label="Needs Analysis · Interactive" slug="action-map" title="Action Map" />

      {/* Framing line + dual-platform delivery note, verbatim from the md. */}
      <div className="max-w-reading">{renderMarkdown(INTRO_MD)}</div>

      <InteractiveMap />

      <ProseSection heading="Traceability Summary" body={TRACEABILITY_MD} />
      <ProseSection heading="Scope and Feasibility Notes" body={SCOPE_MD} />
      <div className="max-w-reading">
        <SourcesList ids={SOURCE_IDS} />
      </div>

      <ArtifactFooter currentSlug="action-map" />
    </ArtifactPage>
  );
}
