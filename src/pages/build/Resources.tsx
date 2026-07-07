// Resource & Budget Plan — interactive artifact page (`/#/build/resources`).
// The $160 solo direct cost against the $191K–271K organizational budget, the
// per-role FTE allocation, the budget breakdown with labor at 82–85% of the
// total, and the custom-vs-Articulate rationale as an expandable panel. Data
// lives in ./resources-data; prose is sliced from the co-located markdown.

import { useState } from 'react';
import RES_MD from './content/06_resources.md?raw';
import { renderMarkdown } from '../../components/shared/render-markdown';
import { Overline } from '../../components/shared/Overline';
import {
  BUDGET_LINES,
  BUDGET_TOTAL,
  FTE_ALLOC,
  LABOR_SHARE,
  RATIONALE,
  SOLO_COSTS,
  SOLO_TOTAL,
} from './resources-data';
import { SERIES_ACCENT } from './config';
import { ArtifactFooter, ArtifactTopBar, SeriesEyebrow } from './chrome';

const [INTRO_MD = '', ...REST] = RES_MD.replace(/\r\n/g, '\n').split(/\n## /);
const SECTIONS = REST.map((part) => {
  const nl = part.indexOf('\n');
  return { heading: part.slice(0, nl).trim(), body: part.slice(nl + 1).trim() };
});

function CostContrast(): JSX.Element {
  return (
    <section aria-label="Cost contrast" className="mt-8 grid gap-4 sm:grid-cols-2">
      <div className="rounded-xl" style={{ background: 'rgb(var(--white))', border: '1px solid rgb(var(--border))', borderTop: `3px solid ${SERIES_ACCENT}`, padding: '20px 22px' }}>
        <Overline className="mb-1">Solo direct cost</Overline>
        <div className="font-mono font-bold" style={{ fontSize: 40, lineHeight: 1.1, color: SERIES_ACCENT }}>
          {SOLO_TOTAL}
        </div>
        <p className="m-0 mt-1.5 font-sans text-caption text-tertiary" style={{ lineHeight: 1.5 }}>
          Excludes uncosted labor (~150–160 focused hours). Everything but the AI subscription ran on free tiers.
        </p>
      </div>
      <div className="rounded-xl" style={{ background: 'rgb(var(--white))', border: '1px solid rgb(var(--border))', borderTop: '3px solid rgb(var(--border))', padding: '20px 22px' }}>
        <Overline className="mb-1">Organizational estimate</Overline>
        <div className="font-mono font-bold text-ink" style={{ fontSize: 40, lineHeight: 1.1 }}>
          {BUDGET_TOTAL.low}–{BUDGET_TOTAL.high}
        </div>
        <p className="m-0 mt-1.5 font-sans text-caption text-tertiary" style={{ lineHeight: 1.5 }}>
          Full development cost for a five-person team delivering the same scope to 200 participants.
        </p>
      </div>
    </section>
  );
}

function DataRow({ label, value, note, emphasis }: { label: string; value: string; note?: string; emphasis?: boolean }): JSX.Element {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border-light py-2.5 last:border-0">
      <div className="min-w-0">
        <div className={`font-sans text-[13.5px] ${emphasis ? 'font-bold text-ink' : 'font-semibold text-ink'}`}>{label}</div>
        {note && (
          <div className="mt-0.5 font-sans text-[11.5px] text-tertiary" style={{ lineHeight: 1.5 }}>
            {note}
          </div>
        )}
      </div>
      <div className={`shrink-0 text-right font-mono text-[13px] ${emphasis ? 'font-bold' : 'font-semibold'} text-ink`}>{value}</div>
    </div>
  );
}

function DataCard({ label, children }: { label: string; children: React.ReactNode }): JSX.Element {
  return (
    <div className="rounded-lg" style={{ background: 'rgb(var(--white))', border: '1px solid rgb(var(--border))', padding: '16px 20px' }}>
      <Overline className="mb-3">{label}</Overline>
      {children}
    </div>
  );
}

function CustomVsArticulate(): JSX.Element {
  const [open, setOpen] = useState(false);
  return (
    <section
      className="mt-10 overflow-hidden rounded-lg"
      style={{ background: 'rgb(var(--white))', border: '1px solid rgb(var(--border))', borderLeft: `3px solid ${SERIES_ACCENT}` }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="custom-articulate-panel"
        className="flex w-full items-center justify-between gap-3 text-left hover:bg-surface"
        style={{ padding: '16px 20px' }}
      >
        <span className="font-sans text-h4 font-semibold text-ink">Why a custom platform, not Articulate?</span>
        <span aria-hidden="true" className="text-tertiary transition-transform" style={{ transform: open ? 'rotate(180deg)' : 'none' }}>
          ▾
        </span>
      </button>
      {open && (
        <div id="custom-articulate-panel" className="border-t border-border-light" style={{ padding: '18px 20px' }}>
          {RATIONALE.map((block) => (
            <div key={block.heading} className="mb-5 last:mb-0">
              <h4 className="mb-2 font-sans text-h4 font-semibold text-ink-secondary">{block.heading}</h4>
              {block.paragraphs.map((p, i) => (
                <p key={i} className="m-0 mb-2.5 max-w-reading font-sans text-body-sm text-body last:mb-0" style={{ lineHeight: 1.65 }}>
                  {p}
                </p>
              ))}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default function Resources(): JSX.Element {
  return (
    <div className="mx-auto max-w-interactive px-4 py-12 sm:px-8 lg:px-16 lg:py-14">
      <ArtifactTopBar pdfSlug="resources" />
      <SeriesEyebrow label="Behind the build · Project Management" />

      <h1 className="m-0 mb-2 font-display text-display font-normal text-ink">Resource &amp; Budget Plan</h1>
      <p className="m-0 mb-6 font-sans text-h3 font-normal text-secondary">AI Literacy for the Modern Workforce</p>

      <div className="max-w-reading">{renderMarkdown(INTRO_MD.trim())}</div>

      <CostContrast />

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <DataCard label="Actual build — direct costs">
          {SOLO_COSTS.map((c) => (
            <DataRow key={c.item} label={c.item} value={c.cost} note={c.note} />
          ))}
          <DataRow label="Total direct cost" value={SOLO_TOTAL} emphasis />
        </DataCard>

        <DataCard label="Organizational — headcount (FTE)">
          {FTE_ALLOC.map((f) => (
            <DataRow key={f.role} label={f.role} value={`${f.fte} FTE`} note={`${f.duration} — ${f.note}`} />
          ))}
        </DataCard>
      </div>

      <div className="mt-4">
        <DataCard label="Organizational — budget estimate">
          {BUDGET_LINES.map((b) => (
            <DataRow key={b.category} label={b.category} value={`${b.low}–${b.high}`} note={b.note} />
          ))}
          <DataRow label="Total" value={`${BUDGET_TOTAL.low}–${BUDGET_TOTAL.high}`} emphasis />
          <p className="m-0 mt-3 font-sans text-caption text-tertiary" style={{ lineHeight: 1.5 }}>
            Labor is <strong className="text-secondary">{LABOR_SHARE}</strong> of the total — consistent with L&amp;D
            industry benchmarks. The front-end developer is the single largest line item.
          </p>
        </DataCard>
      </div>

      <CustomVsArticulate />

      {SECTIONS.map((s) => (
        <section key={s.heading} className="mt-10">
          <h2 className="mb-3 font-sans text-h2 font-semibold text-ink">{s.heading}</h2>
          <div className="max-w-reading">{renderMarkdown(s.body)}</div>
        </section>
      ))}

      <ArtifactFooter currentSlug="resources" />
    </div>
  );
}
