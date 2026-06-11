// Evaluation Framework hub (`/#/evaluation`) — the short landing page that
// frames the four Kirkpatrick-level artifacts and links to each one (and to
// its PDF, when available). Standalone page inside PlatformShell, reachable
// in every platform mode. Linked from the thank-you page; the artifacts are
// also reached directly from the blog after deploy.

import { ARTIFACTS, EVALUATION_WRITEUP_URL, SERIES_ACCENT, type ArtifactMeta } from './config';
import { PdfDownload } from './chrome';

const TEXT_LINK =
  'inline-flex items-center gap-1.5 font-sans text-[13px] font-medium text-secondary no-underline transition-colors hover:text-ink';

export default function EvaluationHub(): JSX.Element {
  const showWriteup = EVALUATION_WRITEUP_URL.trim().length > 0;

  return (
    <div className="mx-auto max-w-[820px] px-4 py-12 sm:px-8 lg:px-16 lg:py-14">
      <div className="mb-8 border-b border-border-light pb-5">
        <a href="#/thank-you" className={TEXT_LINK}>
          <span aria-hidden="true">←</span> About this course
        </a>
      </div>

      <div className="mb-5 flex items-center gap-2.5">
        <span
          aria-hidden="true"
          className="block h-[3px] w-8 rounded-full"
          style={{ background: SERIES_ACCENT }}
        />
        <span
          className="font-mono text-overline font-semibold uppercase text-tertiary"
          style={{ letterSpacing: '0.12em' }}
        >
          Behind the course
        </span>
      </div>

      <h1 className="m-0 mb-4 font-display text-display font-normal text-ink">
        The evaluation framework
      </h1>

      <div className="space-y-4 font-sans text-body text-body">
        <p className="m-0 max-w-reading">
          A course is only as good as the evidence that it works. These four documents are the
          evaluation framework behind <em className="italic">AI Literacy for the Modern Workforce</em>,
          built on the four Kirkpatrick levels (reaction, learning, behavior, and results) and
          designed before the modules, so success was defined before anything existed to produce
          it. Level 2 carries real validation data; the other three are instrument designs
          awaiting a first deployment cohort, and each says so plainly.
        </p>
      </div>

      {showWriteup && (
        <div className="mt-7">
          <a
            href={EVALUATION_WRITEUP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-md font-sans text-[13px] font-semibold text-ink no-underline hover:bg-surface"
            style={{ background: 'transparent', border: '1.5px solid rgb(var(--border))', padding: '9px 18px' }}
          >
            Read the write-up <span aria-hidden="true">→</span>
          </a>
          <p className="m-0 mt-2.5 font-sans text-caption text-tertiary" style={{ lineHeight: 1.5 }}>
            A longer piece on how the framework came together.
          </p>
        </div>
      )}

      <div className="mt-10 space-y-4">
        {ARTIFACTS.map((a, i) => (
          <ArtifactCard key={a.slug} artifact={a} index={i} />
        ))}
      </div>

      <div className="mt-12 border-t border-border-light pt-6">
        <a href="#/" className={TEXT_LINK}>
          Back to the course <span aria-hidden="true">→</span>
        </a>
      </div>
    </div>
  );
}

function ArtifactCard({ artifact, index }: { artifact: ArtifactMeta; index: number }): JSX.Element {
  const { slug, route, title, blurb, type } = artifact;
  const href = `#/${route}`;
  const openLabel = type === 'Interactive' ? 'Open the calculator' : 'Read';
  const num = String(index + 1).padStart(2, '0');

  return (
    <article
      className="rounded-lg bg-[rgb(var(--white))] transition-colors hover:bg-surface"
      style={{ border: '1px solid rgb(var(--border))', borderTop: `3px solid ${SERIES_ACCENT}`, padding: '20px 22px' }}
    >
      <div className="mb-2 flex items-center gap-2.5">
        <span className="font-mono text-[11px] font-bold text-tertiary">{num}</span>
        <span
          className="font-mono text-overline font-semibold uppercase text-tertiary"
          style={{ letterSpacing: '0.1em' }}
        >
          {type}
        </span>
      </div>

      <h2 className="m-0 mb-2 font-sans text-h3 font-semibold" style={{ letterSpacing: '-0.005em' }}>
        <a href={href} className="text-ink no-underline hover:underline">
          {title}
        </a>
      </h2>

      <p className="m-0 mb-4 font-sans text-body-sm text-body" style={{ lineHeight: 1.6 }}>
        {blurb}
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <a
          href={href}
          className="inline-flex items-center gap-1.5 font-sans text-[13px] font-semibold text-action no-underline hover:underline"
        >
          {openLabel} <span aria-hidden="true">→</span>
        </a>
        <PdfDownload slug={slug} />
      </div>
    </article>
  );
}
