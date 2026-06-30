// Shared layout for the four reading artifacts (the Kirkpatrick levels:
// reaction, learning, behavior, results). Each page is a thin wrapper
// that imports its finalized markdown via `?raw` and hands it here; this
// component supplies the "artifact treatment" frame — toolbar, series
// eyebrow, the rendered document at reading width, and the footer links.
// Renders inside PlatformShell exactly like ThankYou (standalone page, not
// part of the learner module nav).

import { renderMarkdown } from '../../components/shared/render-markdown';
import { ArtifactFooter, ArtifactTopBar, SeriesEyebrow } from './chrome';

export function ReadingArtifact({
  markdown,
  pdfSlug,
}: {
  markdown: string;
  pdfSlug: string;
}): JSX.Element {
  return (
    <div className="mx-auto max-w-reading px-4 py-12 sm:px-8 lg:px-16 lg:py-14">
      <ArtifactTopBar pdfSlug={pdfSlug} />
      <SeriesEyebrow label="Evaluation framework · Reading" />
      {/* The document's own H1/H2 carry the title; the renderer zeroes the
          first heading's top margin so it sits flush under the eyebrow. */}
      <article>{renderMarkdown(markdown)}</article>
      <ArtifactFooter currentSlug={pdfSlug} />
    </div>
  );
}
