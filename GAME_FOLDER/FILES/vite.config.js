import { defineConfig } from 'vite';

export default defineConfig({
  root: './',          // your index.html is in the root
  build: {
    outDir: 'dist',    // where Vercel expects output
  }
});
