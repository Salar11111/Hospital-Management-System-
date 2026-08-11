import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (
            /node_modules\/(react|react-dom|react-router|react-router-dom|scheduler|react-is|use-sync-external-store|@remix-run)\//.test(
              id
            )
          ) {
            return 'react-vendor';
          }
          if (/node_modules\/framer-motion|node_modules\/motion-(dom|utils)\//.test(id)) {
            return 'motion';
          }
          if (id.includes('node_modules/@tanstack')) return 'query';
          if (id.includes('node_modules/axios')) return 'axios';
          return 'vendor';
        },
      },
    },
  },
});
