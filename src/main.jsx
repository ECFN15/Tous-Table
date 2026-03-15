import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.jsx';

import { HelmetProvider } from 'react-helmet-async';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

// Initialisation de Stripe (Clé publique depuis .env)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

// On récupère l'élément "root" de ton fichier index.html
const rootElement = document.getElementById('root');

// Petite sécurité : on vérifie que l'élément existe bien avant de lancer le site
if (!rootElement) {
  console.error("Erreur : L'élément avec l'id 'root' est introuvable dans index.html. Vérifie ton fichier HTML !");
} else {
  // Ce fichier fait le lien entre ton code React et ta page HTML
  ReactDOM.createRoot(rootElement).render(
    <HelmetProvider>
      <Elements stripe={stripePromise}>
        <App />
      </Elements>
    </HelmetProvider>
  );
}