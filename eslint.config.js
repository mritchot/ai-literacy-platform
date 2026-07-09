// ESLint 10 flat config. The highest-value layer for this codebase is
// eslint-plugin-react-hooks — tsc alone cannot catch hook-order or
// dependency-array bugs (both classes appeared in the 02-07-2026 audit).
// Type-aware linting is deliberately NOT enabled (recommendedTypeChecked)
// to keep `npm run lint` fast; revisit if the codebase grows.

import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', 'node_modules'] },
  {
    files: ['src/**/*.{ts,tsx}', 'vite.config.ts'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // React-Compiler-era rules (v7): they flag sync-from-external-store
      // effects, render-time Date.now(), and mount-time ref reads — real
      // patterns in this codebase that predate the compiler contract and
      // behave correctly under classic React. Kept visible as warnings
      // (they're the punch list for a future React Compiler migration),
      // not errors that would force behavioral rewrites now.
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/purity': 'warn',
      'react-hooks/refs': 'warn',
      // Vite fast-refresh works best when component files export only
      // components; warn (not error) because a few files intentionally
      // co-export helpers (e.g. SectionContainer's getModuleOrThrow).
      'react-refresh/only-export-components': 'warn',
      // The project rule allows `any` only at documented Recharts
      // boundaries — those sites carry explicit eslint-disable comments,
      // so the rule can stay on as an error.
      '@typescript-eslint/no-explicit-any': 'error',
      // Match the compiler's unused-checks (underscore-prefix escape).
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  {
    // Deliberately-not-component modules: the route table and the three
    // 16-line series binders exist to export route/config wiring, not
    // components — fast-refresh semantics don't apply to them, and the
    // rule was contributing 34 of the lint run's warnings as pure noise.
    files: ['src/router.tsx', 'src/pages/*/chrome.tsx'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
);
