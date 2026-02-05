import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Configuration pour que Vite comprenne parfaitement le React
export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: false, // 1. Empêche le reverse-engineering facile (Source Code non visible)
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'] // Optimisation cache
        }
      }
    }
  },
  esbuild: {
    drop: ['console', 'debugger'], // 2. "NETTOYAGE NUCLÉAIRE" : Supprime tous les logs en prod
  }
})