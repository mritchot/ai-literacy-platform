import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
  // Relative base so the build can be served from any path (file://,
  // a CDN subdirectory, a static host with arbitrary mount point).
  base: './',
  plugins: [
    react(),
    // Inline all JS + CSS into a single index.html so the build works
    // when opened directly via file:// (no local server needed). The
    // public/reference/*.pdf assets stay as separate files because
    // they're downloaded, not bundled — keep them in `dist/reference/`
    // alongside the inlined index.html.
    viteSingleFile({ removeViteModuleLoader: true }),
  ],
});
