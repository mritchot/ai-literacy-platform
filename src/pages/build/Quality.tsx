// QA Dashboard — interactive artifact page (`/#/build/quality`). Thin page
// shell around the intro prose, the four-panel dashboard, and the closing
// prose section. The dashboard and data live in ./quality-dashboard and
// ./quality-data; prose is sliced from the co-located markdown (via ?raw).

import QA_MD from './content/08_quality.md?raw';
import { renderMarkdown } from '../../components/shared/render-markdown';
import { QualityDashboard } from './quality-dashboard';
import { ArtifactFooter, ArtifactTopBar, SeriesEyebrow } from './chrome';

const [INTRO_MD = '', ...REST] = QA_MD.replace(/\r\n/g, '\n').split(/\n## /);
const SECTIONS = REST.map((part) => {
  const nl = part.indexOf('\n');
  // Guard the heading-at-EOF case: nl === -1 would otherwise slice off
  // the heading's last character (ActionMap.tsx pattern).
  return {
    heading: (nl === -1 ? part : part.slice(0, nl)).trim(),
    body: nl === -1 ? '' : part.slice(nl + 1).trim(),
  };
});

export default function Quality(): JSX.Element {
  return (
    <div className="mx-auto max-w-interactive px-4 py-12 sm:px-8 lg:px-16 lg:py-14">
      <ArtifactTopBar pdfSlug="quality" />
      <SeriesEyebrow label="Behind the build · Project Management" />

      <h1 className="m-0 mb-2 font-display text-display font-normal text-ink">QA Dashboard</h1>
      <p className="m-0 mb-6 font-sans text-h3 font-normal text-secondary">AI Literacy for the Modern Workforce</p>

      <div className="prose-longform max-w-reading">{renderMarkdown(INTRO_MD.trim())}</div>

      <QualityDashboard />

      {SECTIONS.map((s) => (
        <section key={s.heading} className="mt-10">
          <h2 className="mb-3 font-sans text-h2 font-semibold text-ink">{s.heading}</h2>
          <div className="prose-longform max-w-reading">{renderMarkdown(s.body)}</div>
        </section>
      ))}

      <ArtifactFooter currentSlug="quality" />
    </div>
  );
}
