// Wraps localStorage reads/writes in try/catch so private-browsing or
// corp-restricted browsers don't crash the app (architecture Section 10d).
//
// Read-side hardening: JSON.parse alone proves the stored string was
// valid JSON, not that it has the shape T. A corrupted or hand-edited
// value (e.g. `null` under 'ail.progress', `{}` under 'ail.analytics')
// would otherwise crash the first consumer that touches it. Callers can
// pass `validate` to gate the parsed value; anything failing the guard
// falls back to `initial`. Storage keys and written shapes are unchanged.

import { useCallback, useEffect, useState } from 'react';

interface UseLocalStorageOptions<T> {
  /** Shape guard applied to the parsed value; failures fall back to
   *  `initial`. Keep it structural (not exhaustive) — it exists to
   *  prevent crash-on-corrupt, not to re-validate every field. */
  validate?: (v: unknown) => v is T;
  /** One-time transform applied to the successfully-read value before
   *  it becomes React state (e.g. legacy-shape migration). Runs at
   *  mount only; the migrated value is what consumers and subsequent
   *  writes see. */
  migrate?: (v: T) => T;
}

function readStored<T>(key: string, fallback: T, options?: UseLocalStorageOptions<T>): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    const parsed: unknown = JSON.parse(raw);
    if (options?.validate && !options.validate(parsed)) return fallback;
    return parsed as T;
  } catch {
    return fallback;
  }
}

export function useLocalStorage<T>(
  key: string,
  initial: T,
  options?: UseLocalStorageOptions<T>,
): [T, (next: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => {
    const stored = readStored<T>(key, initial, options);
    return options?.migrate ? options.migrate(stored) : stored;
  });

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
