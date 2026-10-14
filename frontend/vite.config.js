import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // Ship source maps so the shipped bundle stays debuggable
    // (also clears Lighthouse's "missing source maps" audit).
    sourcemap: true,
  },
})
