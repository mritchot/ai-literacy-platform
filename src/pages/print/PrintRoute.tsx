// PrintRoute — the `#/print/<family>/<param>` route component. Resolves
// the document from the registry and renders its content component inside
// PrintShell. Mounted as a top-level sibling of PlatformShell in
// src/router.tsx, so nothing of the app frame renders around it.
//
// The print routes are not in the sitemap (they are hash routes on the one
// indexable document, so a crawler never sees them as URLs; the sitemap
// assertion in scripts/verify-sitemap.mjs guards against one being added).

import { useParams } from 'react-router-dom';
import { PrintError, PrintShell } from './PrintShell';
import { isPrintFamily, resolvePrintDocument, type PrintFamily } from './print-documents';

export default function PrintRoute({ family }: { family: PrintFamily }): JSX.Element {
  const params = useParams();
  const param = params['slug'] ?? params['id'] ?? '';
  if (!isPrintFamily(family)) return <PrintError message={`Unknown print family "${family}"`} />;
  const doc = resolvePrintDocument(family, param);
  if (!doc) return <PrintError message={`No print document for ${family}/${param}`} />;
  const { Component } = doc;
  return (
    <PrintShell title={doc.title} label={doc.label} accent={doc.accent} position={doc.position} family={family}>
      <Component />
    </PrintShell>
  );
}
