/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    // Zona fija: en UTC, "hoy" local y "hoy" UTC coinciden y los tests de fechas pasarían contra el bug (spec 0008).
    env: { TZ: 'America/Argentina/Buenos_Aires' },
  },
})
