import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.jsx';

import { HelmetProvider } from 'react-helmet-async';

// Stripe is loaded only when card payments are explicitly configured.
const cardPaymentsEnabled = import.meta.env.VITE_STRIPE_CARD_PAYMENTS_ENABLED !== 'false';
const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
export const stripePromise = cardPaymentsEnabled && stripePublicKey?.startsWith('pk_')
  ? import('@stripe/stripe-js').then(({ loadStripe }) => loadStripe(stripePublicKey))
  : Promise.resolve(null);

// On recupere l'element "root" de ton fichier index.html.
const rootElement = document.getElementById('root');

// Petite securite : on verifie que l'element existe bien avant de lancer le site.
if (!rootElement) {
  console.error("Erreur : L'element avec l'id 'root' est introuvable dans index.html. Verifie ton fichier HTML !");
} else {
  // Ce fichier fait le lien entre ton code React et ta page HTML.
  ReactDOM.createRoot(rootElement).render(
    <HelmetProvider>
      <App />
    </HelmetProvider>
  );
}
