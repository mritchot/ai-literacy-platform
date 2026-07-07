// Stakeholder Communications — artifact page (`/#/build/communications`). Two
// samples in the L&D-Manager voice, reproduced in full and framed as an
// organizational-context simulation: a weekly status update (with a muted
// status table) and a design-review summary (with a decision list), each
// followed by a communication-design note. Data lives in ./communications-data;
// the framing intro is sliced from the co-located markdown.

import COMMS_MD from './content/07_communications.md?raw';
import { renderMarkdown } from '../../components/shared/render-markdown';
import { Overline } from '../../components/shared/Overline';
import {
  SAMPLE1_BODY_MD,
  SAMPLE1_META,
  SAMPLE1_NOTE,
  SAMPLE1_STATUS,
  SAMPLE2_BODY_MD,
  SAMPLE2_DECISIONS,
  SAMPLE2_INTRO,
  SAMPLE2_META,
  SAMPLE2_NOTE,
  type MemoMeta,
  type StatusTone,
} from './communications-data';
import { ArtifactFooter, ArtifactTopBar, SeriesEyebrow } from './chrome';

const INTRO_MD = COMMS_MD.replace(/\r\n/g, '\n').trim();

const TONE: Record<StatusTone, { bg: string; color: string }> = {
  success: { bg: 'rgb(var(--success-light))', color: 'rgb(var(--success))' },
  caution: { bg: 'rgb(var(--caution-light))', color: 'rgb(var(--caution))' },
  neutral: { bg: 'rgb(var(--surface))', color: 'rgb(var(--tertiary))' },
};

function StatusBadge({ label, tone }: { label: string; tone: StatusTone }): JSX.Element {
  const t = TONE[tone];
  return (
    <span
      className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full font-mono text-[10.5px] font-semibold"
      style={{ background: t.bg, color: t.color, padding: '3px 10px' }}
    >
      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full" style={{ background: t.color }} />
      {label}
    </span>
  );
}

function MemoHeader({ eyebrow, title, meta }: { eyebrow: string; title: string; meta: MemoMeta }): JSX.Element {
  const rows: [string, string][] = [
    ['To', meta.to],
    ['From', meta.from],
    ['Date', meta.date],
    ['Re', meta.re],
  ];
  return (
    <header className="border-b border-border-light pb-4">
      <Overline className="mb-1.5">{eyebrow}</Overline>
      <h3 className="m-0 mb-3 font-sans text-h3 font-semibold text-ink">{title}</h3>
      <dl className="m-0 grid gap-x-3 gap-y-1" style={{ gridTemplateColumns: 'auto 1fr' }}>
        {rows.map(([k, v]) => (
          <div key={k} className="contents">
            <dt className="font-mono text-[10px] font-bold uppercase text-tertiary" style={{ letterSpacing: '0.08em', paddingTop: 2 }}>
              {k}
            </dt>
            <dd className="m-0 font-sans text-[12.5px] text-body">{v}</dd>
          </div>
        ))}
      </dl>
    </header>
  );
}

function MemoCard({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <article className="rounded-xl" style={{ background: 'rgb(var(--white))', border: '1px solid rgb(var(--border))', padding: '22px 24px' }}>
      {children}
    </article>
  );
}

function DesignNote({ text }: { text: string }): JSX.Element {
  return (
    <aside
      className="mt-3 rounded-lg"
      style={{ background: 'rgb(var(--surface-warm))', border: '1px solid rgb(var(--border-light))', borderLeft: '3px solid rgb(var(--info))', padding: '14px 18px' }}
    >
      <Overline className="mb-1.5" style={{ color: 'rgb(var(--info))' }}>
        Communication design
      </Overline>
      <p className="m-0 max-w-reading font-sans text-body-sm text-body" style={{ lineHeight: 1.6 }}>
        {text}
      </p>
    </aside>
  );
}

function StatusUpdate(): JSX.Element {
  return (
    <MemoCard>
      <MemoHeader eyebrow="Sample 1 · Status update (simulated)" title="Weekly Project Status Update" meta={SAMPLE1_META} />
      <div className="mt-4 overflow-x-auto">
        <table className="w-full border-collapse text-left" style={{ minWidth: 520 }}>
          <thead>
            <tr>
              {['Workstream', 'Status', 'Notes'].map((h) => (
                <th key={h} className="border-b border-border px-3 py-2 font-sans text-label font-semibold uppercase text-ink-secondary">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SAMPLE1_STATUS.map((r) => (
              <tr key={r.workstream}>
                <th scope="row" className="border-b border-border-light px-3 py-2.5 align-top font-sans text-[13px] font-semibold text-ink" style={{ minWidth: 130 }}>
                  {r.workstream}
                </th>
                <td className="border-b border-border-light px-3 py-2.5 align-top">
                  <StatusBadge label={r.status} tone={r.tone} />
                </td>
                <td className="border-b border-border-light px-3 py-2.5 align-top font-sans text-[12.5px] text-body" style={{ lineHeight: 1.55 }}>
                  {r.notes}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-2">{renderMarkdown(SAMPLE1_BODY_MD)}</div>
    </MemoCard>
  );
}

function DesignReview(): JSX.Element {
  return (
    <MemoCard>
      <MemoHeader eyebrow="Sample 2 · Design review (simulated)" title="Phase 2 Design Review: Decisions and Action Items" meta={SAMPLE2_META} />
      <p className="m-0 mt-4 max-w-reading font-sans text-body text-body" style={{ lineHeight: 1.65 }}>
        {SAMPLE2_INTRO}
      </p>
      <div className="mt-4 space-y-2.5">
        {SAMPLE2_DECISIONS.map((d) => (
          <div key={d.n} className="rounded-lg" style={{ background: 'rgb(var(--surface))', border: '1px solid rgb(var(--border-light))', padding: '13px 16px' }}>
            <div className="mb-2 flex flex-wrap items-center gap-2.5">
              <span className="inline-flex h-5 min-w-[22px] items-center justify-center rounded font-mono text-[11px] font-bold text-[rgb(var(--white))]" style={{ background: 'rgb(var(--secondary))' }}>
                {d.n}
              </span>
              <StatusBadge label={d.status} tone={d.tone} />
              <span className="ml-auto font-mono text-[10.5px] text-tertiary">Owner · {d.owner}</span>
            </div>
            <p className="m-0 mb-1.5 font-sans text-[13px] font-semibold text-ink" style={{ lineHeight: 1.5 }}>
              <span className="mr-1.5 font-mono text-[10px] uppercase text-tertiary">Raised</span>
              {d.item}
            </p>
            <p className="m-0 font-sans text-[12.5px] text-body" style={{ lineHeight: 1.6 }}>
              <span className="mr-1.5 font-mono text-[10px] uppercase text-tertiary">Decision</span>
              {d.decision}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-2">{renderMarkdown(SAMPLE2_BODY_MD)}</div>
    </MemoCard>
  );
}

export default function Communications(): JSX.Element {
  return (
    <div className="mx-auto max-w-interactive px-4 py-12 sm:px-8 lg:px-16 lg:py-14">
      <ArtifactTopBar pdfSlug="communications" />
      <SeriesEyebrow label="Behind the build · Project Management" />

      <h1 className="m-0 mb-2 font-display text-display font-normal text-ink">Stakeholder Communications</h1>
      <p className="m-0 mb-6 font-sans text-h3 font-normal text-secondary">AI Literacy for the Modern Workforce</p>

      <div className="max-w-reading">{renderMarkdown(INTRO_MD)}</div>

      <div className="mt-8 space-y-3">
        <StatusUpdate />
        <DesignNote text={SAMPLE1_NOTE} />
      </div>

      <div className="mt-8 space-y-3">
        <DesignReview />
        <DesignNote text={SAMPLE2_NOTE} />
      </div>

      <ArtifactFooter currentSlug="communications" />
    </div>
  );
}
