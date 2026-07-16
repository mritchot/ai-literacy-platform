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
// markdown wins — and the citation links in the traces are preserved by
// rendering them through the inline markdown renderer. The delivery note,
// Traceability Summary, Scope notes, and Sources are rendered verbatim
// from that same markdown file.
//
// This file is the page shell/prose. The static content tables live in
// action-map-data.ts; the interactive quadrant map (with its keyboard/
// dark-mode fixes over the prototype) lives in action-map-interactive.tsx.

import ACTION_MAP_MD from './content/04_action-map.md?raw';
import { renderMarkdown } from '../../components/shared/render-markdown';
import { InteractiveMap } from './action-map-interactive';
import { ArtifactFooter, ArtifactTopBar, SeriesEyebrow } from './chrome';

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
// under the document subtitle). Traceability / Scope / Sources are their own
// H2 sections.
const INTRO_MD = stripTrailingRule(AM_SECTIONS['AI Literacy for the Modern Workforce'] ?? '');
const TRACEABILITY_MD = stripTrailingRule(AM_SECTIONS['Traceability Summary'] ?? '');
const SCOPE_MD = stripTrailingRule(AM_SECTIONS['Scope and Feasibility Notes'] ?? '');
const SOURCES_MD = stripTrailingRule(AM_SECTIONS['Sources'] ?? '');

// ─── Prose section wrapper ─────────────────────────────────────────────

function ProseSection({ heading, body }: { heading: string; body: string }): JSX.Element | null {
  if (!body) return null;
  return (
    <section className="mt-10">
      <h2 className="mb-3 font-sans text-h2 font-semibold text-ink">{heading}</h2>
      <div className="prose-longform max-w-reading">{renderMarkdown(body)}</div>
    </section>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────

export default function ActionMap(): JSX.Element {
  return (
    <div className="mx-auto max-w-interactive px-4 py-12 sm:px-8 lg:px-16 lg:py-14">
      <ArtifactTopBar pdfSlug="action-map" />
      <SeriesEyebrow label="Needs Analysis · Interactive" />

      <h1 className="m-0 mb-2 font-display text-display font-normal text-ink">Action Map</h1>
      <p className="m-0 mb-6 font-sans text-h3 font-normal text-secondary">
        AI Literacy for the Modern Workforce
      </p>

      {/* Framing line + dual-platform delivery note, verbatim from the md. */}
      <div className="prose-longform max-w-reading">{renderMarkdown(INTRO_MD)}</div>

      <InteractiveMap />

      <ProseSection heading="Traceability Summary" body={TRACEABILITY_MD} />
      <ProseSection heading="Scope and Feasibility Notes" body={SCOPE_MD} />
      <ProseSection heading="Sources" body={SOURCES_MD} />

      <ArtifactFooter currentSlug="action-map" />
    </div>
  );
}
