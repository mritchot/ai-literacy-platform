// Guard for the competency profile's "Where to focus next" panel.
//
// The panel routes each missed pre/post-assessment construct to the
// section that teaches it (src/data/construct-routing.ts). Two edits can
// break that silently: adding an item pair with a new constructKey, and
// moving or removing a section in src/data/program.ts. In both cases the
// panel would drop the construct or link to a section that is not there,
// and nothing on screen would say so. This check fails the build instead.
//
// The TypeScript sources are loaded through Vite's SSR loader, so no test
// runner or extra dependency is needed.

import { createServer } from 'vite';

const server = await createServer({
  appType: 'custom',
  logLevel: 'silent',
  server: { middlewareMode: true, hmr: false },
});

const errors = [];
try {
  const { CONSTRUCT_ROUTES } = await server.ssrLoadModule('/src/data/construct-routing.ts');
  const { MODULES } = await server.ssrLoadModule('/src/data/program.ts');
  const { PRE_ASSESSMENT_ITEMS } = await server.ssrLoadModule('/src/data/pre-assessment.ts');
  const { POST_ASSESSMENT_ITEMS } = await server.ssrLoadModule('/src/data/post-assessment.ts');

  const bankKeys = new Set(
    [...PRE_ASSESSMENT_ITEMS, ...POST_ASSESSMENT_ITEMS].map((item) => item.constructKey),
  );
  for (const key of bankKeys) {
    if (!CONSTRUCT_ROUTES[key]) {
      errors.push(`constructKey "${key}" has no entry in src/data/construct-routing.ts`);
    }
  }

  for (const [key, route] of Object.entries(CONSTRUCT_ROUTES)) {
    const mod = MODULES.find((m) => m.id === route.moduleId);
    const section = mod?.sections.find((s) => s.id === route.sectionId);
    if (!section) {
      errors.push(
        `"${key}" routes to Module ${route.moduleId}, Section ${route.sectionId}, which program.ts does not define`,
      );
    }
  }
} finally {
  await server.close();
}

if (errors.length > 0) {
  console.error('verify-construct-routing: FAILED');
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log('verify-construct-routing: every construct routes to a section that exists');
