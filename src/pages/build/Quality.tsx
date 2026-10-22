// QA Dashboard — interactive artifact page (`/#/build/quality`). Thin page
// shell around the intro prose, the four-panel dashboard, and the closing
// prose section. The dashboard and data live in ./quality-dashboard and
// ./quality-data; prose is sliced from the co-located markdown (via ?raw).

import QA_MD from './content/08_quality.md?raw';
import { citedIds, renderMarkdown } from '../../components/shared/render-markdown';
import { SourcesList } from '../../components/shared/CitationNotes';
import { QualityDashboard } from './quality-dashboard';
import { VALIDATED_FILES } from './quality-data';
import { ArtifactFooter, ArtifactHeader, ArtifactPage, ArtifactTopBar } from './chrome';

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

// Sources cited on the page, in reading order: intro, the validated-files
// table, then the closing sections.
const SOURCE_IDS = [
  ...new Set([
    ...citedIds(INTRO_MD),
    ...VALIDATED_FILES.flatMap((f) => (f.sources ?? []).flatMap((s) => (typeof s.ids === 'string' ? [s.ids] : s.ids))),
    ...citedIds(...SECTIONS.map((s) => s.body)),
  ]),
];

export default function Quality(): JSX.Element {
  return (
    <ArtifactPage width="interactive">
      <ArtifactTopBar pdfSlug="quality" />
      <ArtifactHeader label="Behind the build · Project Management" slug="quality" title="QA Dashboard" />

      <div className="max-w-reading">{renderMarkdown(INTRO_MD.trim())}</div>

      <QualityDashboard />

      {SECTIONS.map((s) => (
        <section key={s.heading} className="mt-10">
          <h2 className="mb-3 font-sans text-h2 font-semibold text-ink">{s.heading}</h2>
          <div className="max-w-reading">{renderMarkdown(s.body)}</div>
        </section>
      ))}

      <SourcesList ids={SOURCE_IDS} />

      <ArtifactFooter currentSlug="quality" />
    </ArtifactPage>
  );
}
