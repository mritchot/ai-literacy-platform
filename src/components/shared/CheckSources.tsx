// CheckSources — citation chips appended after check feedback and
// debriefs. Feedback renders as plain strings, so sources travel beside
// the text as registry ids and follow the platform-wide Sources toggle
// through <Citation> instead of sitting in the text as (Author, Year).

import { Citation } from './Citation';

export interface CheckSource {
  /** One or more ids from the `CITATIONS` registry. */
  ids: string | string[];
  /** Key into the first id's `pages` map. */
  pageKey?: string | undefined;
}

export function CheckSources({
  sources,
}: {
  sources?: CheckSource[] | undefined;
}): JSX.Element | null {
  if (!sources || sources.length === 0) return null;
  return (
    <>
      {sources.map((s) => (
        <Citation
          key={`${Array.isArray(s.ids) ? s.ids.join('+') : s.ids}#${s.pageKey ?? ''}`}
          ids={s.ids}
          pageKey={s.pageKey}
        />
      ))}
    </>
  );
}
