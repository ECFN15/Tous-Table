# GEMINI.md — Journal de bord technique & Notes d'Architecture

*Ce journal trace les grandes décisions d'architecture et les explications techniques complexes liées aux interactions avec l'IA Gemini.*

---

## 30 mars 2026 — Architecture Firestore Multi-Environnement dynamique (`{appId}`)

**Fichier concerné** : `firestore.rules`

**Objectif** : Documenter la transition d'un chemin de base de données écrit "en dur" (`tat-made-in-normandie`) vers une variable dynamique (`{appId}`) pour supporter nativement le fonctionnement Multi-Environnement.

**Solution : Règle "Write Once, Deploy Anywhere"**
1. **Passage au Paramètre `{appId}`** : Le chemin d'accès `match /artifacts/tat-made-in-normandie/...` est devenu `match /artifacts/{appId}/...`. Firestore ne bloque plus sur le nom précis du projet parent.
2. **Isolation des Environnements** : La Sandbox (`https://tatmadeinnormandie.web.app/`) et la Production (`https://tousatable-madeinnormandie.fr/`) peuvent désormais utiliser des bases de données complètement cloisonnées tout en partageant 100% de la même couverture de sécurité fonctionnelle.
3. **Mise en place DRY (Don't Repeat Yourself)** : Fin du risque de déployer des règles qui verrouilleraient la base de prod parce que le nom de la sandbox y était écrit en dur. L'infrastructure est maintenant *"Future-Proof"*.

**Documentation Associée** : Un fichier complet a été créé (`architecture_firestore_rules.md`) pour archiver précisément le "Avant/Après" technique de ce nouveau standard.

---

## 30 mars 2026 — Migration Firestore de Prod vers Sandbox & Bypass de Firebase App Check

**Fichiers concernés** : `migrationfirestore.md`, `src/features/admin/AdminShop.jsx`

**Objectif** : Migrer 44 produits de la production hautement sécurisée vers la sandbox, avec impossibilité absolue de le faire via une requête client web.

**Bilan technique (Le "Videur" App Check)** :
- Une tentative de migration "Front-End" via une seconde instance Firebase a été violemment bloquée par une erreur `403 Permission Denied`.
- Il a été statué que cette restriction est la **meilleure nouvelle possible pour la Production**, prouvant que le module Google App Check (reCAPTCHA / Attestation) remplit son rôle : tout appel non signé par le vrai nom de domaine `tousatable.fr` est rejeté. Impossible donc pour un tiers de scraper ou de siphonner la base de données même en possédant les clés API.
- La migration a dû être effectuée via les outils "Root" de l’agent (Firebase Admin SDK / Model Context Protocol), prouvant qu'un cloisonnement étanche existe entre les environnements et qu'ils ne communiquent pas sans une intervention absolue côté Serveur.
