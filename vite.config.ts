import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(({ command }) => {
  // Automatically determine base path:
  // If BASE_PATH is supplied by actions/configure-pages, use it.
  // Otherwise, if GITHUB_REPOSITORY is a user site (e.g. username.github.io), base is '/'
  // If it's a project repository (e.g. Galina-agency), base is '/<repo>/'
  let defaultBase = '/';
  if (process.env.GITHUB_REPOSITORY) {
    const parts = process.env.GITHUB_REPOSITORY.split('/');
    const repo = parts[1];
    if (repo && !repo.endsWith('.github.io')) {
      defaultBase = `/${repo}/`;
    }
  }

  const base = process.env.BASE_PATH 
    ? (process.env.BASE_PATH.endsWith('/') ? process.env.BASE_PATH : `${process.env.BASE_PATH}/`)
    : (command === 'build' ? defaultBase : '/');

  return {
    base,
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    build: {
      outDir: 'dist',
      rollupOptions: {
        output: {
          entryFileNames: 'assets/app.js',
          chunkFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name].[ext]',
        },
      },
    },
  };
});
