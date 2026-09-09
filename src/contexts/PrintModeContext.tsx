// PrintModeContext — a boolean the `#/print/...` routes set to true so the
// shared page components render as a static document: the artifact-series
// chrome (top bar, eyebrow, pager, download links, Expand-all toggle)
// renders nothing, every disclosure is forced open, and the disclosure
// chevrons are omitted. Default false, so the web app is unaffected;
// only src/pages/print/PrintShell.tsx mounts the provider.

import { createContext, useContext, type ReactNode } from 'react';

const PrintModeContext = createContext<boolean>(false);

export function PrintModeProvider({ children }: { children: ReactNode }): JSX.Element {
  return <PrintModeContext.Provider value={true}>{children}</PrintModeContext.Provider>;
}

/** True inside the print shell; false everywhere else. */
export function usePrintMode(): boolean {
  return useContext(PrintModeContext);
}
