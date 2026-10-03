import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(({ command }) => {
  const repoName = process.env.GITHUB_REPOSITORY 
    ? process.env.GITHUB_REPOSITORY.split('/')[1] 
    : 'Galina-agency';

  // When building for production/GitHub Pages, ensure the repository subpath is used (/Galina-agency/)
  // so that asset URLs are absolute (/Galina-agency/assets/...) and never 404.
  const base = process.env.BASE_PATH 
    ? (process.env.BASE_PATH.endsWith('/') ? process.env.BASE_PATH : `${process.env.BASE_PATH}/`)
    : (command === 'build' ? `/${repoName}/` : '/');

  return {
    base,
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
