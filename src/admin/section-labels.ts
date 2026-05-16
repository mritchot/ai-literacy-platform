// Section labels for the admin Module Completion Table expanded detail view
// (4D §8.6). Static lookup — labels are admin-display-only and don't need to
// stay in lockstep with the actual sidebar titles. Counts must match the
// section counts in `data/program.ts` (M1: 8, M2: 8, M3: 11, M4: 10 = 37).

export type ModuleId = 1 | 2 | 3 | 4;

export const SECTION_LABELS: Record<ModuleId, string[]> = {
  1: [
    'S1 — Opening Hook',
    'S2 — Strategic Landscape',
    'S3 — Data Narrative (P1)',
    'S4 — Invisible Problem',
    'S5 — Stigma Reflection (P2)',
    'S6 — Program Framing',
    'S7 — Knowledge Check',
    'S8 — Transition',
  ],
  2: [
    'S1 — Opening Hook',
    'S2 — Five Patterns',
    'S3 — Aug/Auto Dashboard (P3)',
    'S4 — RCT Comparison',
    'S5 — Productivity Dashboard (P4)',
    'S6 — Bottleneck',
    'S7 — Knowledge Check',
    'S8 — Transition',
  ],
  3: [
    'S1 — Opening Hook',
    'S2 — Token Comparison',
    'S3 — Tokenizer (P5)',
    'S4 — Next-Token Prediction',
    'S5 — Prediction Demo (P6)',
    'S6 — Context & Memory',
    'S7 — Context Window (P7)',
    'S8 — Steerability',
    'S9 — Properties Collide',
    'S10 — Knowledge Check',
    'S11 — Transition',
  ],
  4: [
    'S1 — Opening Hook',
    'S2 — Task Decomposition (P8)',
    'S3 — Prompt Reformulation (P9)',
    'S4 — Knowledge Check',
    'S5 — Output Verification (P10)',
    'S6 — Iterative Refinement (P11)',
    'S7 — Knowledge Check',
    'S8 — Diligence Statement (P12)',
    'S9 — Program Closing',
    'S10 — Competency Profile',
  ],
};

// Total section count across the program (4D §7.5).
export const TOTAL_SECTIONS = Object.values(SECTION_LABELS).reduce(
  (acc, list) => acc + list.length,
  0,
);
