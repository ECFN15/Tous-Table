# Documentation : Stratégie de Vérification et d'Automatisation (Tests)

**Projet** : Tous à Table Made in Normandie
**Date** : Mars 2026

Ce document est le mode d'emploi de "l'atelier de mécanique" de votre site. Son but est d'expliquer comment on s'assure que tout fonctionne parfaitement sur le site **sans avoir à tout vérifier à la main à chaque mise à jour**.

L'automatisation des tests est le secret d'une application professionnelle robuste et évolutive : un "robot" vérifie à votre place en quelques secondes que le site, les paiements, l'authentification et les pages s'affichent correctement.

---

## 🛠️ 1. L'arsenal actuel (Ce que nous avons déjà)

Vos outils de test se trouvent rangés dans le dossier `/scripts/` de votre projet.

### A. Le robot navigateur (`test-puppeteer.cjs`)
**Qu'est-ce que c'est ?** 
Puppeteer est un programme développé par Google. C'est littéralement un "faux navigateur Chrome" contrôlé par du code.
**À quoi ça sert aujourd'hui ?**
Il ouvre une page internet invisiblement, clique à des endroits précis de la page, et vérifie que les éléments (titres, boutons) sont bien présents. C'est l'équivalent d'avoir un stagiaire qui vérifie chaque page de la boutique 100 fois par seconde.

### B. Le scanner d'adresses (`test-urls.cjs`)
**Qu'est-ce que c'est ?**
C'est un script de diagnostic de santé des liens.
**À quoi ça sert aujourd'hui ?**
Il parcourt la liste des URL de votre site et s'assure que chacune d'entre elles retourne bien un statut "200" (Succès). S'il tombe sur une page "404 Non trouvée", il sonne l'alarme dans le terminal. Cela évite qu'un utilisateur clique sur un lien de la boutique et tombe sur un écran d'erreur.

---

## 🚀 2. La Roadmap : Évoluer vers une usine "Copilot" 100% automatisée

L'objectif est d'avoir un "bouton rouge" (une seule commande, par exemple `npm run test:all`) qui lance une batterie de robots pour valider votre site *avant chaque déploiement sur la vraie production*.

Voici les 3 étapes recommandées pour transformer ce projet en une forteresse :

### Phase 1 : Tests "End-to-End" (Bout en Bout) du parcours d'achat
**Outil recommandé :** [Playwright](https://playwright.dev/) (le remplaçant moderne de Puppeteer) ou [Cypress](https://www.cypress.io/).
Nous devons écrire un script "Copilot" qui va simuler l'action la plus critique de votre site : **L'Achat**.
1. Le robot s'authentifie sur la Sandbox (Environnement de test).
2. Il va sur la galerie et sélectionne un meuble.
3. Il clique sur "Ajouter au panier".
4. Il ouvre le panier et clique sur "Procéder au paiement".
5. Il remplit un faux numéro de carte Stripe (les cartes de test `4242 4242...`).
6. **Le résultat :** Il génère une facture et nous confirme que tout le parcours d'achat fonctionne.
*Bénéfice :* Vous avez la garantie à 100% que l'argent de vos clients n'est jamais bloqué par un bug technique.

### Phase 2 : Tests des "Règles métier" (Tests Unitaires)
**Outil recommandé :** [Vitest](https://vitest.dev/) (le standard avec React & Vite).
Il s'agit de tester non pas le visuel, mais le "cerveau" de l'application (le code métier).
1. Un test qui vérifie mathématiquement que la fonction qui calcule le total du panier (TVA comprise) ne se trompe jamais d'un centime, même si on ajoute 3 meubles et 2 planches.
2. Un test qui s'assure que si un meuble a `quantity: 0`, la pastille rouge "VENDU" s'allume bien dans la base de données.
*Bénéfice :* Ces tests s'exécutent en moins d'une seconde. Ils sont cruciaux pour les algorithmes (prix, remises, enchères).

### Phase 3 : Validation des Securités (Cloud Functions & Firestore)
**Outil recommandé :** Firebase Local Emulator Suite.
Vos Cloud Functions (le code caché sur les serveurs Google qui sécurise les stocks, Stripe, et Firestore) sont le cœur du système.
Il faut créer des tests qui attaquent ces règles de sécurité :
1. Essayer d'acheter un meuble avec un faux stock pour voir si Firestore bloque l'opération.
2. Simuler un "faux paiement" Stripe sans la bonne clé secrète pour vérifier que la base de données rejette l'ordre.
*Bénéfice :* Cela vous protège contre le piratage, l'altération des commandes, et surtout les "surventes" (comme l'erreur corrigée récemment sur le double achat d'un meuble unique).

---

## 📊 3. Génération d'un Rapport d'Audit (Le vrai truc de "Copilot")

Pour que cela vous serve (en tant qu'administrateur), le terminal noir du développeur n'est pas suffisant.

L'objectif de cette automatisation est d'ajouter un outil comme **"Allure Report"** ou les rapports HTML natifs de Playwright.

À la fin du test du robot, vous obtiendrez un **Dashboard web visuel** (une page HTML) qui vous affichera :
- 🟢 **8/8 Tests réussis**
- 🛒 [OK] Parcours d'achat Stripe.
- 🔐 [OK] Connexion Google.
- 📱 [OK] L'interface mobile ne déborde pas (le robot peut prendre des captures d'écran (screenshots) du site sur "iPhone" et sur "Desktop" et vous les montrer côte à côte).
- 🛑 [ERREUR] Lien de la page "CGV" introuvable (Erreur 404).

### Comment mettre ça en place ? (Action pour le développeur)
1. Exécuter `npm init playwright@latest` dans le dossier.
2. Déplacer la logique obsolète de Puppeteer vers Playwright.
3. Coder le parcours "Achat Complet" sur la Sandbox.
4. Mettre à jour `package.json` avec la commande `"test": "playwright test --reporter=html"`.
5. Vous exécutez `npm run test`, vous prenez un café ☕ pendant 20 secondes, et la page de rapport de santé de votre boutique s'ouvrira automatiquement devant vous !