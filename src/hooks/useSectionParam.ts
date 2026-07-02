// useSectionParam — shared parse/clamp/normalize logic for the four
// module index routes. Replaces four copies of the same block whose
// clamp bounds were hardcoded (8/8/11/10) and could silently drift
// from the section lists in src/data/program.ts — the bound now comes
// from the module metadata itself.

import { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getModule } from '../data/program';

export function useSectionParam(moduleId: number): number {
  const { sectionId: sectionParam } = useParams<{ sectionId?: string }>();
  const navigate = useNavigate();
  const maxSection = getModule(moduleId)?.sections.length ?? 1;

  const sectionId = useMemo(() => {
    if (sectionParam === undefined) return 1;
    const parsed = Number.parseInt(sectionParam, 10);
    if (Number.isNaN(parsed) || parsed < 1 || parsed > maxSection) return 1;
    return parsed;
  }, [sectionParam, maxSection]);

  // Normalize bare /module/N to /module/N/section/1 so back/forward work.
  useEffect(() => {
    if (sectionParam === undefined) {
      navigate(`/module/${moduleId}/section/1`, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- normalize once per param change
  }, [sectionParam]);

  return sectionId;
}
