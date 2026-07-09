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

  // Normalize the URL so back/forward and the mobile TopBar label agree
  // with what actually renders: bare /module/N and any invalid or
  // out-of-range section param (e.g. /section/99, /section/abc) both
  // replace to the section that is really shown. Previously only the
  // missing-param case normalized, so /module/1/section/99 rendered
  // Section 1 under a URL — and a TopBar "S99" cue — claiming otherwise.
  useEffect(() => {
    const parsed = sectionParam === undefined ? NaN : Number.parseInt(sectionParam, 10);
    const outOfRange = Number.isNaN(parsed) || parsed < 1 || parsed > maxSection;
    if (sectionParam === undefined || outOfRange) {
      navigate(`/module/${moduleId}/section/${sectionId}`, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- normalize once per param change
  }, [sectionParam]);

  return sectionId;
}
