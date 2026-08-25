import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // GitHub Pages serves the site from a project sub-path:
  // https://kelvin1586.github.io/devtools-pro/
  base: '/devtools-pro/',
  preview: {
    allowedHosts: true,
  },
  server: {
    allowedHosts: true,
  },
});
