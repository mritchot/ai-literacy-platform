// EndnotesContext — the print document's endnote order. The print shell
// mounts EndnotesProvider; <PrintNotes> (CitationNotes.tsx) writes the
// note keys it reads from the rendered document, and each print-mode
// <Citation> reads its numbers through useNoteNumbers. Outside the print
// shell there is no provider and the numbers are empty.

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

export const NoteKeysContext = createContext<{
  keys: readonly string[];
  setKeys: (next: string[]) => void;
} | null>(null);

/** Holds the document's note order; mounted by the print shell only. */
export function EndnotesProvider({ children }: { children: ReactNode }): JSX.Element {
  const [keys, setKeysState] = useState<readonly string[]>([]);
  const setKeys = useCallback(
    (next: string[]) =>
      setKeysState((prev) => (prev.join('\n') === next.join('\n') ? prev : next)),
    [],
  );
  const value = useMemo(() => ({ keys, setKeys }), [keys, setKeys]);
  return <NoteKeysContext.Provider value={value}>{children}</NoteKeysContext.Provider>;
}

/** The endnote numbers ("1,3") for a chip's note keys; empty outside print. */
export function useNoteNumbers(keys: readonly string[]): string {
  const ctx = useContext(NoteKeysContext);
  if (!ctx) return '';
  return keys
    .map((k) => ctx.keys.indexOf(k))
    .filter((n) => n >= 0)
    .map((n) => String(n + 1))
    .join(',');
}
