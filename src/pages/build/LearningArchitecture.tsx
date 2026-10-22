// Learning Architecture — interactive artifact page (`/#/build/learning-
// architecture`). Thin page shell: the shared build-series chrome (top bar,
// eyebrow, footer pager) around the intro prose, the titled prose sections,
// and the ported interactive diagram at the foot of the page. Prose is sliced
// from the co-located markdown (single source of truth, loaded via ?raw); the
// diagram and its data live in ./learning-architecture-interactive and
// ./learning-architecture-data.

import LA_MD from './content/01_learning-architecture.md?raw';
import { citedIds, renderMarkdown } from '../../components/shared/render-markdown';
import { SourcesList } from '../../components/shared/CitationNotes';
import { LearningArchitectureDiagram } from './learning-architecture-interactive';
import { ArtifactFooter, ArtifactHeader, ArtifactPage, ArtifactTopBar } from './chrome';

// Intro = the prose before the first `## `; the remaining `## ` blocks render
// as titled sections between the intro and the diagram.
const [INTRO_MD = '', ...REST] = LA_MD.replace(/\r\n/g, '\n').split(/\n## /);
const SECTIONS = REST.map((part) => {
  const nl = part.indexOf('\n');
  // Guard the heading-at-EOF case: nl === -1 would otherwise slice off
  // the heading's last character (ActionMap.tsx pattern).
  return {
    heading: (nl === -1 ? part : part.slice(0, nl)).trim(),
    body: nl === -1 ? '' : part.slice(nl + 1).trim(),
  };
});

function ProseSection({ heading, body }: { heading: string; body: string }): JSX.Element {
  return (
    <section className="mt-10">
      <h2 className="mb-3 font-sans text-h2 font-semibold text-ink">{heading}</h2>
      <div>{renderMarkdown(body)}</div>
    </section>
  );
}

export default function LearningArchitecture(): JSX.Element {
  return (
    <ArtifactPage width="interactive">
      <ArtifactTopBar pdfSlug="learning-architecture" />
      <ArtifactHeader label="Behind the build · Design" slug="learning-architecture" title="Learning Architecture" />

      <div>{renderMarkdown(INTRO_MD.trim())}</div>

      {SECTIONS.map((s) => (
        <ProseSection key={s.heading} heading={s.heading} body={s.body} />
      ))}

      <LearningArchitectureDiagram />

      <SourcesList ids={citedIds(LA_MD)} />

      <ArtifactFooter currentSlug="learning-architecture" />
    </ArtifactPage>
  );
}
