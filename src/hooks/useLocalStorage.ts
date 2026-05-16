// Wraps localStorage reads/writes in try/catch so private-browsing or
// corp-restricted browsers don't crash the app (architecture Section 10d).

import { useCallback, useEffect, useState } from 'react';

function readStored<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

export function useLocalStorage<T>(key: string, initial: T): [T, (next: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => readStored<T>(key, initial));

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage may be unavailable; failing silently is the documented fallback.
    }
  }, [key, value]);

  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) =>
        typeof next === 'function' ? (next as (p: T) => T)(prev) : next,
      );
    },
    [],
  );

  return [value, set];
}
