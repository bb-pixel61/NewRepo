import { defineConfig } from 'vite';

// Served from https://<user>.github.io/NewRepo/ on GitHub Pages,
// so assets must resolve relative to that subpath.
export default defineConfig({
  base: '/NewRepo/',
});
