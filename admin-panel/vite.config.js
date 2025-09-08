import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
  base: '/',
  css: {
    postcss: './postcss.config.js', // Explicitly point to PostCSS config
  },
});