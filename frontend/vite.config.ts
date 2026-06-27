import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path';

const devApiProxyTarget =
  process.env.VITE_DEV_API_PROXY_TARGET ?? 'http://localhost:8080';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: "configure-response-headers",
      configureServer: (server) => {
        server.middlewares.use((_req, res, next) => {
          res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
          res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
          next();
        });
      },
    },
  ],
  server: {
    proxy: {
      '/api': {
        target: devApiProxyTarget,
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    manifest: true,
    rollupOptions: {
      output: {
        assetFileNames: "assets/[name][extname]",
      }
    }
  },
  worker: {
    rollupOptions: {
      output: {
        entryFileNames: "assets/[name].js",
        chunkFileNames: "assets/[name].js",
        assetFileNames: "assets/[name][extname]",
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/vitest.setup.ts'
  }
})
