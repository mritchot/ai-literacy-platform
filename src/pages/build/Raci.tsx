// RACI Matrix — interactive artifact page (`/#/build/raci`). Thin page shell
// around the intro prose, the interactive grid, and the closing prose sections.
// The grid and all data live in ./raci-grid and ./raci-data; prose is sliced
// from the co-located markdown (via ?raw).

import RACI_MD from './content/05_raci.md?raw';
import { renderMarkdown } from '../../components/shared/render-markdown';
import { RaciGrid } from './raci-grid';
import { ArtifactFooter, ArtifactTopBar, SeriesEyebrow } from './chrome';

const [INTRO_MD = '', ...REST] = RACI_MD.replace(/\r\n/g, '\n').split(/\n## /);
const SECTIONS = REST.map((part) => {
  const nl = part.indexOf('\n');
  // Guard the heading-at-EOF case: nl === -1 would otherwise slice off
  // the heading's last character (ActionMap.tsx pattern).
  return {
    heading: (nl === -1 ? part : part.slice(0, nl)).trim(),
    body: nl === -1 ? '' : part.slice(nl + 1).trim(),
  };
});

export default function Raci(): JSX.Element {
  return (
    <div className="mx-auto max-w-interactive px-4 py-12 sm:px-8 lg:px-16 lg:py-14">
      <ArtifactTopBar pdfSlug="raci" />
      <SeriesEyebrow label="Behind the build · Project Management" />

      <h1 className="m-0 mb-2 font-display text-display font-normal text-ink">RACI Matrix</h1>
      <p className="m-0 mb-6 font-sans text-h3 font-normal text-secondary">AI Literacy for the Modern Workforce</p>

      <div className="prose-longform max-w-reading">{renderMarkdown(INTRO_MD.trim())}</div>

      <RaciGrid />

      {SECTIONS.map((s) => (
        <section key={s.heading} className="mt-10">
          <h2 className="mb-3 font-sans text-h2 font-semibold text-ink">{s.heading}</h2>
          <div className="prose-longform max-w-reading">{renderMarkdown(s.body)}</div>
        </section>
      ))}

      <ArtifactFooter currentSlug="raci" />
    </div>
  );
}
