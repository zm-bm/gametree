import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    manifest: true,
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts'
  }
})
