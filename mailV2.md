---
Title: Mise à Jour Email V2 - Ajout Destinataire Admin
Date: 25 Mars 2026
---

# 📧 Mise à Jour Email V2 - Ajout Destinataire Admin

## 🎯 Objectif
Ajouter `tousatablemadeinnormandie@gmail.com` en copie des emails de notification admin pour les nouvelles commandes, tout en gardant `matthis.fradin2@gmail.com` pour le monitoring pendant la période de migration.

---

## 🔧 Modification Effectuée

### Fichier modifié :
`functions/src/email/orderEmails.js` (ligne 50)

### Changement :
```javascript
// AVANT :
to: adminEmail,

// APRÈS :
to: `${adminEmail}, tousatablemadeinnormandie@gmail.com`,
```

---

## 📬 Résultat

### Emails envoyés lors d'une nouvelle commande :

1. **Email Admin** (envoyé aux DEUX destinataires) :
   - ✅ `matthis.fradin2@gmail.com` (développeur - monitoring)
   - ✅ `tousatablemadeinnormandie@gmail.com` (détenteur du site)

2. **Email Client** (inchangé) :
   - ✅ Envoyé uniquement au client qui a commandé

---

## 🚀 Déploiement

- **Statut** : ✅ Déployé avec succès
- **Date** : 25 Mars 2026
- **Fonctions mises à jour** : `onOrderCreated`, `onOrderUpdated`
- **Environnement** : Production (`tatmadeinnormandie`)

---

## � Configuration Finale des Environnements

### 🧪 SANDBOX (`tousatable-client`) - Tests :
- ✅ **Seulement** `matthis.fradin2@gmail.com` (développeur)
- ❌ `tousatablemadeinnormandie@gmail.com` retiré pour éviter les spams de test

### 🔧 PRODUCTION (`tatmadeinnormandie`) - Réel :
- ✅ `matthis.fradin2@gmail.com` (développeur - monitoring)
- ✅ `tousatablemadeinnormandie@gmail.com` (détenteur du site)

---

## � Emails de commande concernés

Les emails suivants sont maintenant envoyés aux deux destinataires admin **uniquement en production** :

1. **Nouvelle commande** (paiement différé ou manuel)
2. **Confirmation de paiement** (Stripe Elements : pending → paid)
3. **Mises à jour de statut** (expédition, livraison) - *uniquement envoyés au client*

### 🧪 En sandbox :
- Seul `matthis.fradin2@gmail.com` reçoit les emails de test
- Le détenteur du site n'est pas dérangé par les fausses commandes

---

## ✅ Vérification

Pour tester que tout fonctionne :
1. **Sandbox** : Faire une commande test → seul `matthis.fradin2@gmail.com` reçoit l'email
2. **Production** : Faire une commande test → les deux adresses reçoivent l'email
3. Le client doit recevoir son email de confirmation séparément dans les deux cas

---

**Note** : Les clients ne voient jamais les adresses admin - ils reçoivent uniquement leur propre email de confirmation.

---

## 🔄 Prochaines étapes (migration future)

Quand tu voudras finaliser la migration complète vers le compte du détenteur du site :

1. **Changer l'email expéditeur** :
   ```bash
   firebase functions:secrets:set GMAIL_EMAIL
   # Entrer : tousatablemadeinnormandie@gmail.com
   ```

2. **Générer un mot de passe d'application** pour ce compte Google :
   - Aller dans Sécurité > Mots de passe d'application
   - Créer un mot de passe pour "Firebase"

3. **Mettre à jour le mot de passe** :
   ```bash
   firebase functions:secrets:set GMAIL_PASSWORD
   # Entrer : le mot de passe de 16 caractères généré
   ```

4. **Retirer ton adresse** (optionnel) :
   Modifier la ligne 50 pour ne garder que `tousatablemadeinnormandie@gmail.com`

5. **Déployer** :
   ```bash
   firebase deploy --only functions
   ```
