
// Script pour injecter le rôle admin de force
// Usage: node scripts/set_admin_force.js <EMAIL_UTILISATEUR>
// Comme on est connecté via 'firebase login' sur le CLI, on peut utiliser les credentials par défaut du projet actif.

import admin from 'firebase-admin';
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// On va utiliser le service-account si présent, sinon on tente l'auth par défaut du CLI (Application Default Credentials)
// NOTE : Le plus sûr est d'aller chercher ta clé privée, mais pour aller vite on va feinter.
// On va plutôt te faire créer le document "users" manuellement si le script n'a pas les droits.

console.log("⚠️ Cette méthode demande une clé de service. On va plutôt utiliser la MÉTHODE CONSOLE MANUELLE qui marche à 100%.");
console.log("Rendez-vous dans la console Firestore.");
