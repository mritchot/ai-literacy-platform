// module-gating — pure helper that computes sequential-progression lock
// state for modules and sections, given the resolved module list, the
// current platform mode, and (when in learner mode) the pre/post
// assessment completion flags.
//
// In `portfolio` mode nothing is ever locked (free navigation). In
// `learner` mode:
//   • Module 1 is locked unless the pre-assessment is complete.
//   • Module M (M > 1) is locked unless the previous module is fully
//     complete.
//   • Section N is locked if its module is locked, OR it's not the
//     first section of its module and the immediately preceding
//     section isn't `done`.
//   • M4 S10 (the competency profile) carries an additional gate:
//     it's locked until the post-assessment is complete, even when
//     M4 S1–S9 are all done. This is the bookend that mirrors the
//     pre-assessment gate on M1.
//
// This keeps the sidebar's section sub-list, the landing page's
// module cards, and the SectionContainer "Next" gate consistent:
// a locked module's sections are all locked, and within an unlocked
// module sections open up one at a time as they're completed.
//
// Consumed by Sidebar.tsx (section + module lock state) and
// LandingPage.tsx (module-card lock state).

import type { ModuleMeta } from '../data/program';
import type { PlatformMode } from '../hooks/usePlatformMode';

export interface ModuleGating {
  /** True when the module should render locked (not navigable). */
  isModuleLocked: (moduleId: number) => boolean;
  /** True when the section should render locked (not navigable). */
  isSectionLocked: (moduleId: number, sectionId: number) => boolean;
}

/** Assessment-completion view passed into computeGating; consulted
 *  only in learner mode (portfolio mode is never locked). */
export interface AssessmentGatingInput {
  preComplete: boolean;
  postComplete: boolean;
}

const UNLOCKED: ModuleGating = {
  isModuleLocked: () => false,
  isSectionLocked: () => false,
};

export function computeGating(
  modules: ModuleMeta[],
  mode: PlatformMode,
  assessments: AssessmentGatingInput,
): ModuleGating {
  // Portfolio mode: free navigation, nothing locked. We
  // intentionally exempt portfolio mode from the assessment gates so a
  // portfolio reviewer can land on any module without first taking the
  // pre-assessment — the comparative results component handles the
  // missing-data case with its own placeholder.
  if (mode !== 'learner') return UNLOCKED;

  const { preComplete, postComplete } = assessments;

  // Typed as Map<number, …> so the helpers can be called with plain
  // `number` ids — `ModuleMeta['id']` is the literal union `1 | 2 | 3 | 4`,
  // which a default `new Map(...)` would otherwise infer as the key type.
  const byId = new Map<number, ModuleMeta>(modules.map((m) => [m.id, m]));

  const isModuleComplete = (id: number): boolean => {
    const m = byId.get(id);
    return Boolean(m && m.sections.length > 0 && m.sections.every((s) => s.state === 'done'));
  };

  // Module 1 is gated on the pre-assessment; every later module waits
  // on the one before it being fully complete.
  const isModuleLocked = (id: number): boolean => {
    if (id === 1) return !preComplete;
    return !isModuleComplete(id - 1);
  };

  const isSectionLocked = (moduleId: number, sectionId: number): boolean => {
    if (isModuleLocked(moduleId)) return true;
    const m = byId.get(moduleId);
    if (!m) return false;
    // M4 S10 — the competency profile — is gated on the
    // post-assessment in addition to the standard previous-section
    // check. This is the bookend that matches the pre-assessment gate
    // on Module 1.
    if (moduleId === 4 && sectionId === 10 && !postComplete) return true;
    const idx = m.sections.findIndex((s) => s.id === sectionId);
    // Unknown section or the module's first section — unlocked (the
    // module itself is unlocked, since isModuleLocked returned false).
    if (idx <= 0) return false;
    // Otherwise: open only once the previous section is complete.
    return m.sections[idx - 1].state !== 'done';
  };

  return { isModuleLocked, isSectionLocked };
}
