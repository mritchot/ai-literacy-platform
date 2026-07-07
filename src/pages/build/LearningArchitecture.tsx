// Learning Architecture — interactive artifact page (`/#/build/learning-
// architecture`). Thin page shell: the shared build-series chrome (top bar,
// eyebrow, footer pager) around the intro prose, the ported interactive
// diagram, and the closing prose sections. Prose is sliced from the co-located
// markdown (single source of truth, loaded via ?raw); the diagram and its data
// live in ./learning-architecture-interactive and ./learning-architecture-data.

import LA_MD from './content/01_learning-architecture.md?raw';
import { renderMarkdown } from '../../components/shared/render-markdown';
import { LearningArchitectureDiagram } from './learning-architecture-interactive';
import { ArtifactFooter, ArtifactTopBar, SeriesEyebrow } from './chrome';

// Intro = the prose before the first `## `; the remaining `## ` blocks render
// below the diagram as titled sections.
const [INTRO_MD = '', ...REST] = LA_MD.replace(/\r\n/g, '\n').split(/\n## /);
const SECTIONS = REST.map((part) => {
  const nl = part.indexOf('\n');
  return { heading: part.slice(0, nl).trim(), body: part.slice(nl + 1).trim() };
});

function ProseSection({ heading, body }: { heading: string; body: string }): JSX.Element {
  return (
    <section className="mt-10">
      <h2 className="mb-3 font-sans text-h2 font-semibold text-ink">{heading}</h2>
      <div className="max-w-reading">{renderMarkdown(body)}</div>
    </section>
  );
}

export default function LearningArchitecture(): JSX.Element {
  return (
    <div className="mx-auto max-w-interactive px-4 py-12 sm:px-8 lg:px-16 lg:py-14">
      <ArtifactTopBar pdfSlug="learning-architecture" />
      <SeriesEyebrow label="Behind the build · Design" />

      <h1 className="m-0 mb-2 font-display text-display font-normal text-ink">Learning Architecture</h1>
      <p className="m-0 mb-6 font-sans text-h3 font-normal text-secondary">AI Literacy for the Modern Workforce</p>

      <div className="max-w-reading">{renderMarkdown(INTRO_MD.trim())}</div>

      <LearningArchitectureDiagram />

      {SECTIONS.map((s) => (
        <ProseSection key={s.heading} heading={s.heading} body={s.body} />
      ))}

      <ArtifactFooter currentSlug="learning-architecture" />
    </div>
  );
}
