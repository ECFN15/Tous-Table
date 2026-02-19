# 💳 Guide d'activation de la Facturation (Compte Client)

Ce document explique comment transférer ou activer la facturation du projet **Tous à Table** sur le compte bancaire du client.

---

## 🏗️ Pré-requis
- Le client doit être **Propriétaire** du projet Firebase (déjà fait).
- Le client doit disposer d'une **Carte Bancaire** ou d'un **Compte Bancaire** pour les paiements.

---

## 🛠️ Étape 1 : Accéder au projet
1. Demander au client de se connecter à : **[console.firebase.google.com](https://console.firebase.google.com)**
2. Cliquer sur le projet : `tousatable-client` (Production).

---

## 🚀 Étape 2 : Passer au plan "Blaze" (Pay-as-you-go)
*Firebase est gratuit jusqu'à un certain seuil, mais les extensions et certaines fonctions demandent le plan Blaze.*

1. En bas à gauche de la console Firebase, repérez le texte **"Abonnement : Spark (Gratuit)"**.
2. Cliquez sur le bouton **Modifier** (ou **Passer au plan supérieur**).
3. Sélectionnez le plan **Blaze** (celui qui indique "Paiement à l'usage").

---

## 💳 Étape 3 : Configurer le compte de facturation Google Cloud
C'est ici que le client va créer son profil de paiement :

1. Une fenêtre s'ouvre pour lier un compte de facturation Google Cloud.
2. Si le client n'a pas de compte de facturation : Cliquez sur **"Créer un compte de facturation"**.
3. **Formulaire de paiement** :
   - **Type de compte** : "Particulier" ou "Entreprise" (selon son statut).
   - **Adresse** : Saisir les informations légales.
   - **Mode de paiement** : Ajouter la carte bancaire.
4. Cliquez sur **Valider / Confirmer**.

---

## 🔍 Étape 4 : Vérification finale
Une fois terminé, le client (ou toi) doit voir :
- En bas à gauche de Firebase : **"Plan : Blaze"**.
- Dans la [Console Google Cloud - Facturation](https://console.cloud.google.com/billing), le projet `tousatable-client` doit être lié au compte de facturation du client.

---

## ⚠️ Point d'attention : Ancienne facturation
Si ton propre compte de facturation était lié auparavant :
1. Va dans [Google Cloud Billing](https://console.cloud.google.com/billing).
2. Clique sur **"Gérer les comptes de facturation"**.
3. Vérifie que le projet `tousatable-client` n'est plus attaché à **ton** profil de paiement. Si c'est encore le cas, clique sur les trois petits points à côté du projet et sélectionne **"Changer la facturation"** pour choisir le nouveau compte du client.

---
*Ce document sert de preuve de transfert de responsabilité financière.*
