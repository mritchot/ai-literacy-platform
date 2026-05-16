// module-gating — pure helper that computes sequential-progression lock
// state for modules and sections, given the resolved module list and the
// current platform mode.
//
// In `portfolio` and `admin` modes nothing is ever locked (free
// navigation). In `learner` mode:
//   • Module M is locked unless it's the first module OR the immediately
//     preceding module is fully complete (all its sections `done`).
//   • Section N is locked if its module is locked, OR it's not the first
//     section of its module and the immediately preceding section isn't
//     `done`.
//
// This keeps the sidebar's section sub-list and the landing page's module
// cards consistent: a locked module's sections are all locked, and within
// an unlocked module sections open up one at a time as they're completed.
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

const UNLOCKED: ModuleGating = {
  isModuleLocked: () => false,
  isSectionLocked: () => false,
};

export function computeGating(modules: ModuleMeta[], mode: PlatformMode): ModuleGating {
  // Portfolio + admin modes: free navigation, nothing locked.
  if (mode !== 'learner') return UNLOCKED;

  // Typed as Map<number, …> so the helpers can be called with plain
  // `number` ids — `ModuleMeta['id']` is the literal union `1 | 2 | 3 | 4`,
  // which a default `new Map(...)` would otherwise infer as the key type.
  const byId = new Map<number, ModuleMeta>(modules.map((m) => [m.id, m]));

  const isModuleComplete = (id: number): boolean => {
    const m = byId.get(id);
    return Boolean(m && m.sections.length > 0 && m.sections.every((s) => s.state === 'done'));
  };

  // First module is always open; every later module waits on the one
  // before it being fully complete.
  const isModuleLocked = (id: number): boolean => id > 1 && !isModuleComplete(id - 1);

  const isSectionLocked = (moduleId: number, sectionId: number): boolean => {
    if (isModuleLocked(moduleId)) return true;
    const m = byId.get(moduleId);
    if (!m) return false;
    const idx = m.sections.findIndex((s) => s.id === sectionId);
    // Unknown section or the module's first section — unlocked (the
    // module itself is unlocked, since isModuleLocked returned false).
    if (idx <= 0) return false;
    // Otherwise: open only once the previous section is complete.
    return m.sections[idx - 1].state !== 'done';
  };

  return { isModuleLocked, isSectionLocked };
}
