// useViewport — current breakpoint flags (mobile / tablet / desktop) based on
// the three-tier scheme defined in architecture Section 10e.

import { useEffect, useState } from 'react';

type Viewport = 'mobile' | 'tablet' | 'desktop';

function classify(width: number): Viewport {
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

export function useViewport(): Viewport {
  const [viewport, setViewport] = useState<Viewport>(() =>
    typeof window === 'undefined' ? 'desktop' : classify(window.innerWidth),
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handler = () => setViewport(classify(window.innerWidth));
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  return viewport;
}
