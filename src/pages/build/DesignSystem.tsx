// Design System — interactive artifact page (`/#/build/design-system`). The
// living style guide: swatches, type specimens, and a live component gallery
// with a light/dark toggle, all rendered from the platform's own tokens. Thin
// page shell around the intro prose, the gallery, and a closing note; prose is
// sliced from the co-located markdown (single source of truth, via ?raw). The
// gallery and token data live in ./design-system-gallery and
// ./design-system-data.

import DS_MD from './content/02_design-system.md?raw';
import { renderMarkdown } from '../../components/shared/render-markdown';
import { DesignSystemGallery } from './design-system-gallery';
import { ArtifactFooter, ArtifactHeader, ArtifactPage, ArtifactTopBar } from './chrome';

const [INTRO_MD = '', ...REST] = DS_MD.replace(/\r\n/g, '\n').split(/\n## /);
const SECTIONS = REST.map((part) => {
  const nl = part.indexOf('\n');
  // Guard the heading-at-EOF case: nl === -1 would otherwise slice off
  // the heading's last character (ActionMap.tsx pattern).
  return {
    heading: (nl === -1 ? part : part.slice(0, nl)).trim(),
    body: nl === -1 ? '' : part.slice(nl + 1).trim(),
  };
});

export default function DesignSystem(): JSX.Element {
  return (
    <ArtifactPage width="interactive">
      <ArtifactTopBar pdfSlug="design-system" />
      <ArtifactHeader label="Behind the build · Design" slug="design-system" title="Design System" />

      <div className="max-w-reading">{renderMarkdown(INTRO_MD.trim())}</div>

      <DesignSystemGallery />

      {SECTIONS.map((s) => (
        <section key={s.heading} className="mt-10">
          <h2 className="mb-3 font-sans text-h2 font-semibold text-ink">{s.heading}</h2>
          <div className="max-w-reading">{renderMarkdown(s.body)}</div>
        </section>
      ))}

      <ArtifactFooter currentSlug="design-system" />
    </ArtifactPage>
  );
}
