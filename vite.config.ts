import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');

    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        proxy: {
          '/api': {
            target: env.VITE_API_BASE_URL || 'http://127.0.0.1:4000',
            changeOrigin: true,
          },
        },
      },
      plugins: [react()],
      build: {
        // FIX: was false causing stale JS chunks to accumulate in dist/assets/
        emptyOutDir: true,

        // Warn only when an individual chunk exceeds 1 MB
        chunkSizeWarningLimit: 1000,

        rollupOptions: {
          output: {
            // Split large vendor libraries into separate cached chunks.
            // Browser caches vendor chunks independently so it only re-downloads
            // them when the library version changes, not on every deploy.
            manualChunks(id) {
              if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
                return 'vendor-react';
              }
              if (id.includes('node_modules/@supabase')) {
                return 'vendor-supabase';
              }
              if (id.includes('node_modules/jspdf') || id.includes('node_modules/jspdf-autotable')) {
                return 'vendor-pdf';
              }
              if (id.includes('node_modules/xlsx')) {
                return 'vendor-xlsx';
              }
              if (id.includes('node_modules/lucide-react')) {
                return 'vendor-icons';
              }
            },
          },
        },
      },
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
