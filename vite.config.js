import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Configuration pour que Vite comprenne parfaitement le React
export default defineConfig({
  plugins: [react()],
})