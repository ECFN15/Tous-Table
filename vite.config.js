import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Configuration pour que Vite comprenne parfaitement le React
export default defineConfig(({ mode }) => {
  const isProd = mode === 'production';

  return {
    plugins: [react()],
    build: {
      sourcemap: !isProd, // Maps activés en dev, désactivés en prod
      minify: 'esbuild',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom']
          }
        }
      }
    },
    esbuild: {
      // Ne supprimer les logs qu'en PRODUCTION
      drop: isProd ? ['console', 'debugger'] : [],
    }
  }
})