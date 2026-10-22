// RACI Matrix — interactive artifact page (`/#/build/raci`). Thin page shell
// around the intro prose, the interactive grid, and the closing prose sections.
// The grid and all data live in ./raci-grid and ./raci-data; prose is sliced
// from the co-located markdown (via ?raw).

import RACI_MD from './content/05_raci.md?raw';
import { renderMarkdown } from '../../components/shared/render-markdown';
import { RaciGrid } from './raci-grid';
import { ArtifactFooter, ArtifactHeader, ArtifactPage, ArtifactTopBar } from './chrome';

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
    <ArtifactPage width="interactive">
      <ArtifactTopBar pdfSlug="raci" />
      <ArtifactHeader label="Behind the build · Project Management" slug="raci" title="RACI Matrix" />

      <div>{renderMarkdown(INTRO_MD.trim())}</div>

      <RaciGrid />

      {SECTIONS.map((s) => (
        <section key={s.heading} className="mt-10">
          <h2 className="mb-3 font-sans text-h2 font-semibold text-ink">{s.heading}</h2>
          <div>{renderMarkdown(s.body)}</div>
        </section>
      ))}

      <ArtifactFooter currentSlug="raci" />
    </ArtifactPage>
  );
}
