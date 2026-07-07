// Design-system gallery — the live style guide surface. A light/dark toggle
// drives a `.ds-preview` scope whose token variables are re-declared for both
// modes (see design-system-data.previewScopeCss), so every swatch, type
// specimen, and live component renders in the chosen mode regardless of the
// app's global theme. The 4D-competency-only constraint is demonstrated inline.
//
// The gallery renders the real shared components (CompetencyDot, KnowledgeCheck,
// ReflectionPrompt) — not facsimiles — so the guide can never drift from what
// the platform ships. The live components use synthetic module id 0 so their
// state stays isolated from real learner progress.

import { useState } from 'react';
import { CompetencyDot } from '../../components/shared/CompetencyDot';
import { Overline } from '../../components/shared/Overline';
import { KnowledgeCheck, type KnowledgeCheckItemData } from '../../components/shared/KnowledgeCheck';
import { ReflectionPrompt } from '../../components/shared/ReflectionPrompt';
import {
  ACTION_TOKENS,
  COMPETENCY_SWATCHES,
  FEEDBACK_TOKENS,
  NEUTRAL_TOKENS,
  TYPE_SPECS,
  previewScopeCss,
  tripleToHex,
  type CompetencySpec,
  type TokenSpec,
  type TypeSpec,
} from './design-system-data';

type Mode = 'light' | 'dark';

// ─── Swatches ──────────────────────────────────────────────────────────

function Swatch({ token, mode }: { token: TokenSpec; mode: Mode }): JSX.Element {
  const triple = token[mode];
  return (
    <div className="overflow-hidden rounded-md" style={{ border: '1px solid rgb(var(--border))', background: 'rgb(var(--white))' }}>
      <div className="h-11" style={{ background: `rgb(${triple})` }} />
      <div style={{ padding: '8px 10px' }}>
        <div className="font-mono text-[11px] font-semibold text-ink">--{token.name}</div>
        <div className="font-mono text-[10px] text-tertiary">{tripleToHex(triple)}</div>
        <div className="mt-1 font-sans text-[10.5px] text-muted" style={{ lineHeight: 1.4 }}>
          {token.usage}
        </div>
        {token.note && (
          <div className="mt-1 font-sans text-[10px] italic" style={{ color: 'rgb(var(--caution))', lineHeight: 1.4 }}>
            {token.note}
          </div>
        )}
      </div>
    </div>
  );
}

function SwatchGrid({ tokens, mode }: { tokens: TokenSpec[]; mode: Mode }): JSX.Element {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {tokens.map((t) => (
        <Swatch key={t.name} token={t} mode={mode} />
      ))}
    </div>
  );
}

function CompetencyRow({ spec, mode }: { spec: CompetencySpec; mode: Mode }): JSX.Element {
  const tints: { label: string; hex: string }[] = [
    { label: 'bg', hex: spec.bg },
    { label: 'light', hex: spec.lightHex[mode] },
    { label: 'mid', hex: spec.mid },
    { label: 'text', hex: spec.textHex[mode] },
  ];
  return (
    <div className="rounded-lg" style={{ background: 'rgb(var(--white))', border: '1px solid rgb(var(--border))', padding: '14px 16px' }}>
      <div className="mb-3">
        <CompetencyDot competency={spec.key} />
      </div>
      <div className="grid grid-cols-4 gap-2">
        {tints.map((t) => (
          <div key={t.label}>
            <div className="h-9 rounded-sm" style={{ background: t.hex, border: '1px solid rgb(var(--border-light))' }} />
            <div className="mt-1 font-mono text-[9.5px] font-semibold text-secondary">{t.label}</div>
            <div className="font-mono text-[9px] text-tertiary">{t.hex.toUpperCase()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── The one constraint ────────────────────────────────────────────────

function CompetencyConstraint(): JSX.Element {
  return (
    <div
      className="rounded-lg"
      style={{ background: 'rgb(var(--surface-warm))', border: '1px solid rgb(var(--border))', borderLeft: '3px solid rgb(var(--info))', padding: '16px 20px' }}
    >
      <Overline className="mb-2" style={{ color: 'rgb(var(--info))' }}>
        The one rule
      </Overline>
      <p className="m-0 mb-4 max-w-reading font-sans text-body-sm text-body" style={{ lineHeight: 1.6 }}>
        The 4D competency colors are reserved for competency tagging — pills, dots, tags, and
        competency-scoped accents. They are <strong className="text-ink">never</strong> used for
        general UI: buttons, links, and navigation use the dedicated <span className="font-mono">--action</span>{' '}
        teal instead. This is what keeps the colors semantic: when a learner sees olive, it always means
        Delegation.
      </p>
      <div className="flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[13px] font-bold" style={{ color: 'rgb(var(--success))' }}>
            ✓
          </span>
          <CompetencyDot competency="delegation" />
          <span className="font-sans text-[11px] text-tertiary">competency tag</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[13px] font-bold" style={{ color: 'rgb(var(--error))' }}>
            ✗
          </span>
          <span
            aria-hidden="true"
            className="rounded-md font-sans text-[12px] font-semibold text-white"
            style={{ background: '#6B7F5E', padding: '8px 16px', opacity: 0.55 }}
          >
            Continue
          </span>
          <span className="font-sans text-[11px] text-tertiary">never a button</span>
        </div>
      </div>
    </div>
  );
}

// ─── Typography ────────────────────────────────────────────────────────

function TypeSpecimen({ spec }: { spec: TypeSpec }): JSX.Element {
  return (
    <div className="flex flex-col gap-1.5 border-b border-border-light py-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
      <div className={`${spec.className} min-w-0 flex-1`}>{spec.sample}</div>
      <div className="shrink-0 font-mono text-[10.5px] text-tertiary sm:text-right">
        <span className="text-secondary">--{spec.token}</span> · {spec.family} · {spec.spec}
      </div>
    </div>
  );
}

// ─── Component specimens ───────────────────────────────────────────────

function PillSpecimens(): JSX.Element {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      {COMPETENCY_SWATCHES.map((c, i) => {
        const active = i === 0; // show the first as the active state
        return (
          <span
            key={c.key}
            className="rounded-full font-sans text-[12px] font-semibold"
            style={{
              padding: '5px 14px',
              border: `1.5px solid ${c.bg}`,
              background: active ? c.bg : 'transparent',
              color: active ? '#fff' : `rgb(var(--${c.key}-text))`,
              letterSpacing: '0.02em',
            }}
          >
            {c.label}
          </span>
        );
      })}
      <span className="ml-1 font-sans text-[11px] text-muted">(first = active)</span>
    </div>
  );
}

function CardSpecimens(): JSX.Element {
  const cards: { label: string; radius: string; pad: string; bg: string }[] = [
    { label: 'Large card · rounded-xl', radius: '14px', pad: '20px 24px', bg: 'rgb(var(--white))' },
    { label: 'Medium card · rounded-lg', radius: '10px', pad: '16px', bg: 'rgb(var(--surface))' },
    { label: 'Small card · rounded-md', radius: '8px', pad: '12px 16px', bg: 'rgb(var(--surface))' },
  ];
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {cards.map((c) => (
        <div key={c.label} style={{ background: c.bg, border: '1px solid rgb(var(--border))', borderRadius: c.radius, padding: c.pad }}>
          <div className="font-sans text-[12.5px] font-semibold text-ink">{c.label}</div>
          <div className="mt-1 font-sans text-[11.5px] text-body" style={{ lineHeight: 1.5 }}>
            Bordered surface, no shadow. Elevation comes from borders and surface color, not drop shadows.
          </div>
        </div>
      ))}
    </div>
  );
}

function ButtonSpecimens(): JSX.Element {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        className="rounded-md bg-action font-sans text-[12.5px] font-semibold text-[rgb(var(--white))] hover:bg-action-hover"
        style={{ padding: '10px 24px' }}
      >
        Primary
      </button>
      <button
        type="button"
        className="rounded-md font-sans text-[12.5px] font-semibold text-ink hover:bg-surface"
        style={{ background: 'transparent', border: '1px solid rgb(var(--border))', padding: '10px 24px' }}
      >
        Secondary
      </button>
      <button
        type="button"
        className="rounded-md font-sans text-[12.5px] font-semibold text-tertiary hover:bg-surface hover:text-secondary"
        style={{ background: 'transparent', padding: '8px 16px' }}
      >
        Ghost
      </button>
    </div>
  );
}

// Self-referential knowledge check demonstrating the live component.
const DEMO_KC: KnowledgeCheckItemData = {
  id: 'ds-demo',
  objectiveRef: 'DS',
  stem: 'A reviewer opens the platform in dark mode and notices the four competency colors look identical to their light-mode values. What is the best explanation?',
  options: [
    {
      id: 'a',
      text: 'The competency bg and mid values are mid-tone by design and hold contrast on both light and dark surfaces, so they are intentionally unchanged; only the light wash and text tints flip.',
      isPreferred: true,
      feedbackTitle: 'Correct — this is the design decision',
      feedbackText:
        'Exactly. The palette was chosen so the primary and border tints stay stable across modes, which keeps a competency’s color recognizable everywhere. Only the wash surfaces and on-tint text shift.',
      feedbackTone: 'success',
    },
    {
      id: 'b',
      text: 'It is a rendering bug — every color should shift in dark mode.',
      isPreferred: false,
      feedbackTitle: 'Not a bug',
      feedbackText:
        'Shifting the competency primaries would break recognition across modes. The stable bg/mid values are deliberate; the tokens that do need to change (washes, text) already do.',
      feedbackTone: 'error',
    },
    {
      id: 'c',
      text: 'Dark mode only affects neutral tokens and never touches semantic color.',
      isPreferred: false,
      feedbackTitle: 'Partly — but not quite',
      feedbackText:
        'Feedback colors and the action color do shift in dark mode for legibility. It is specifically the competency bg/mid that stay fixed, while their light/text tints adapt.',
      feedbackTone: 'caution',
    },
  ],
};

// ─── Section wrapper ───────────────────────────────────────────────────

function GallerySection({ label, children, note }: { label: string; children: React.ReactNode; note?: string }): JSX.Element {
  return (
    <section className="mt-8">
      <div className="mb-4 border-b border-border-light pb-2">
        <Overline>{label}</Overline>
        {note && <p className="m-0 mt-1.5 font-sans text-[12px] text-tertiary">{note}</p>}
      </div>
      {children}
    </section>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────

export function DesignSystemGallery(): JSX.Element {
  const [mode, setMode] = useState<Mode>('light');

  return (
    <div className="mt-8">
      {/* Scoped token stylesheet — declares both modes for `.ds-preview`. */}
      <style>{previewScopeCss()}</style>

      {/* Mode toggle — a control, so it follows the app's global theme. */}
      <div className="mb-4 flex items-center gap-3">
        <span className="font-mono text-overline font-bold uppercase text-tertiary" style={{ letterSpacing: '0.1em' }}>
          Preview
        </span>
        <div
          role="group"
          aria-label="Preview color mode"
          className="inline-flex overflow-hidden rounded-md"
          style={{ border: '1px solid rgb(var(--border))' }}
        >
          {(['light', 'dark'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              aria-pressed={mode === m}
              className="font-sans text-[12px] font-semibold capitalize transition-colors"
              style={{
                padding: '6px 16px',
                background: mode === m ? 'rgb(var(--action))' : 'transparent',
                color: mode === m ? 'rgb(var(--white))' : 'rgb(var(--secondary))',
              }}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* The themed preview surface. */}
      <div
        className="ds-preview rounded-xl"
        data-theme={mode}
        aria-label={`Design system preview in ${mode} mode`}
        style={{ border: '1px solid rgb(var(--border))', padding: '24px 26px' }}
      >
        <GallerySection label="Color · 4D competency" note="The platform's primary semantic palette. bg and mid are stable across modes; light and text flip.">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {COMPETENCY_SWATCHES.map((c) => (
              <CompetencyRow key={c.key} spec={c} mode={mode} />
            ))}
          </div>
          <div className="mt-4">
            <CompetencyConstraint />
          </div>
        </GallerySection>

        <GallerySection label="Color · Neutrals" note="Warm neutrals — no pure grays. Every value carries the same warm undertone in both modes.">
          <SwatchGrid tokens={NEUTRAL_TOKENS} mode={mode} />
        </GallerySection>

        <GallerySection label="Color · Feedback" note="Muted, earthy — not saturated traffic-light colors. Used only for knowledge-check feedback and system states.">
          <SwatchGrid tokens={FEEDBACK_TOKENS} mode={mode} />
        </GallerySection>

        <GallerySection label="Color · Action" note="A dedicated interactive teal, outside the 4D palette — so competency colors never do double duty as buttons.">
          <SwatchGrid tokens={ACTION_TOKENS} mode={mode} />
        </GallerySection>

        <GallerySection label="Typography" note="DM Serif Display for the two top heading levels; DM Sans for everything functional; DM Mono for anything countable or codified.">
          <div>
            {TYPE_SPECS.map((s) => (
              <TypeSpecimen key={s.token} spec={s} />
            ))}
          </div>
        </GallerySection>

        <GallerySection label="Components · Pills & tags">
          <div className="space-y-5">
            <div>
              <div className="mb-2 font-mono text-[10px] font-bold uppercase text-tertiary" style={{ letterSpacing: '0.1em' }}>
                Pills (competency filters)
              </div>
              <PillSpecimens />
            </div>
            <div>
              <div className="mb-2 font-mono text-[10px] font-bold uppercase text-tertiary" style={{ letterSpacing: '0.1em' }}>
                Tags (CompetencyDot)
              </div>
              <div className="flex flex-wrap gap-2">
                {COMPETENCY_SWATCHES.map((c) => (
                  <CompetencyDot key={c.key} competency={c.key} />
                ))}
              </div>
            </div>
          </div>
        </GallerySection>

        <GallerySection label="Components · Cards">
          <CardSpecimens />
        </GallerySection>

        <GallerySection label="Components · Buttons">
          <ButtonSpecimens />
        </GallerySection>

        <GallerySection label="Components · Knowledge check" note="The live shared component — select a response to see consequence-based feedback.">
          <KnowledgeCheck moduleId={0} sectionId={1} item={DEMO_KC} itemNumber={1} totalItems={1} />
        </GallerySection>

        <GallerySection label="Components · Reflection prompt" note="The live shared component — a private, ungraded reflection with the Diligence accent.">
          <ReflectionPrompt
            moduleId={0}
            sectionId={1}
            promptId="ds-demo"
            promptText="Where in your own work do you let color carry meaning that a label should carry instead? Note one place you could add a text or icon cue."
          />
        </GallerySection>
      </div>
    </div>
  );
}
