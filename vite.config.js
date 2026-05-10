import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Configuration pour que Vite comprenne parfaitement le React
export default defineConfig(({ mode }) => {
  const isOptimizedBuild = mode === 'production' || mode === 'prod';
  const isProdTarget = mode === 'prod';
  const env = loadEnv(mode, process.cwd(), '');

  if (isProdTarget) {
    const prodEnvErrors = [];
    const cardPaymentsEnabled = env.VITE_STRIPE_CARD_PAYMENTS_ENABLED !== 'false';

    if (env.VITE_FIREBASE_PROJECT_ID !== 'tousatable-client') {
      prodEnvErrors.push('VITE_FIREBASE_PROJECT_ID doit pointer vers tousatable-client');
    }

    if (cardPaymentsEnabled && !env.VITE_STRIPE_PUBLIC_KEY?.startsWith('pk_live_')) {
      prodEnvErrors.push('VITE_STRIPE_PUBLIC_KEY doit etre une cle publishable Stripe live');
    }

    if (prodEnvErrors.length > 0) {
      throw new Error(`Build prod bloque:\n- ${prodEnvErrors.join('\n- ')}`);
    }
  }

  return {
    plugins: [react()],
    build: {
      sourcemap: !isOptimizedBuild, // Maps activés en dev, désactivés en prod
      minify: 'esbuild',
      rollupOptions: {
        output: {
          manualChunks(id) {
            // 1. React core → un seul chunk "vendor"
            if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/')) {
              return 'vendor';
            }
            // 2. Toutes les icônes Lucide → un seul chunk "icons"
            // (Empêche la création de 600+ micro-fichiers)
            if (id.includes('node_modules/lucide-react')) {
              return 'icons';
            }
            // 3. Firebase SDK → un seul chunk "firebase"
            if (id.includes('node_modules/firebase') || id.includes('node_modules/@firebase')) {
              return 'firebase';
            }
            // 4. GSAP → un seul chunk "gsap"
            if (id.includes('node_modules/gsap')) {
              return 'gsap';
            }
            // 5. Three.js → un seul chunk "three"
            if (id.includes('node_modules/three')) {
              return 'three';
            }
            // 6. XLSX (Admin seulement) → isolé
            if (id.includes('node_modules/xlsx') || id.includes('node_modules/sheetjs')) {
              return 'xlsx';
            }
          }
        }
      }
    },
    esbuild: {
      // Ne supprimer les logs qu'en PRODUCTION
      drop: isOptimizedBuild ? ['console', 'debugger'] : [],
    }
  }
})
