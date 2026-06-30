/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// `base` must match the GitHub Pages subpath: https://calvintirrell.github.io/take-home-pay/
// In dev the base is irrelevant; in the production build it rewrites asset URLs.
export default defineConfig({
  base: '/take-home-pay/',
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
  },
})
