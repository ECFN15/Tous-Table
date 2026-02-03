# 🌐 Guide : Acheter et Configurer un Nom de Domaine pour "Tous à Table"

Ce guide vous explique étape par étape comment acquérir votre propre adresse web (ex: `atelier-tousatable.fr`) et la relier à votre site actuel (`tatmadeinnormandie.web.app`).

---

## 1. Où acheter son nom de domaine ?

Il existe de nombreux "Registrars" (bureau d'enregistrement). Voici les plus recommandés pour la France et la facilité d'utilisation :

*   **OVH** (Recommandé pour `.fr`) : Le leader français. Interface un peu austère mais très fiable et support technique en français.
*   **IONOS (1&1)** : Souvent des offres très peu chères la première année (ex: 1€), mais attention au prix de renouvellement.
*   **Hostinger** : Interface moderne et simple.
*   **Google Domains** (Racheté par Squarespace) : N'est plus recommandé car la migration vers Squarespace complique les choses.

---

## 2. Vérifier la disponibilité

Avant d'acheter, il faut vérifier si le nom est libre.

1.  Allez sur le site d'un registrar (ex: [ovhcloud.com](https://www.ovhcloud.com/fr/domains/)).
2.  Dans la barre de recherche, tapez le nom souhaité (ex: `atelier-tous-a-table`).
3.  Le site vous dira ce qui est disponible :
    *   ✅ **Disponible** : Vous pouvez l'acheter.
    *   ❌ **Indisponible** : Déjà pris par quelqu'un d'autre.
    *   💰 **Premium** : Disponible mais vendu très cher (à éviter).

### 💡 Conseils pour choisir :
*   Privilégiez le **.fr** pour une clientèle française (inspire confiance) ou le **.com** pour l'international.
*   Évitez les tirets si possible, mais pour "tous-a-table", c'est souvent plus lisible avec.
*   Gardez-le court et mémorisable.

---

## 3. L'Achat (La commande)

1.  Ajoutez le domaine choisi au panier.
2.  On vous proposera souvent des "Hébergements", "Mails pro", etc.
    *   ⚠️ **REFUSEZ l'hébergement web** (Hosting). Votre site est déjà hébergé gratuitement et très rapidement chez Google (Firebase). Vous n'avez besoin *que* du domaine.
    *   📧 **Mails** : Acceptez l'offre "Email" (souvent incluse ou pour 1-2€) si vous voulez une adresse comme `contact@votre-domaine.fr`.
3.  Créez votre compte, payez.
4.  Attendez l'email de confirmation (peut prendre de 15min à 24h pour l'activation).

---

## 4. Connecter le Domaine à Firebase (Votre site)

C'est l'étape la plus technique, mais elle ne se fait qu'une fois.

### Étape A : Sur Firebase
1.  Allez sur la [Console Firebase](https://console.firebase.google.com/).
2.  Ouvrez votre projet **"Tous à Table"** -> Menu gauche **Hosting**.
3.  Cliquez sur le bouton **"Ajouter un domaine personnalisé"**.
4.  Entrez votre nouveau domaine (ex: `www.atelier-tousatable.fr`).
5.  Firebase vous donnera des **enregistrements DNS** à copier.

### Étape B : Chez votre Registrar (ex: OVH)
1.  Connectez-vous à votre compte OVH (ou autre).
2.  Allez dans la gestion de votre domaine -> Onglet **Zone DNS**.
3.  Vous devez ajouter/modifier les lignes demandées par Firebase :
    *   **Enregistrement TXT** (Pour prouver que c'est à vous) : Copiez la valeur de Firebase et créez une entrée TXT.
    *   **Enregistrement A** (Pour diriger le trafic) : Firebase vous donnera une adresse IP (ex: `199.36.158.100`). Créez une entrée de type `A` qui pointe vers cette IP.

### Étape C : Validation
1.  Retournez sur Firebase et cliquez sur **"Vérifier"**.
2.  Une fois validé, Firebase générera automatiquement un **certificat SSL** (le petit cadenas 🔒 HTTPS). Cela peut prendre jusqu'à 24h, mais c'est souvent fait en 1h.

---

## 5. Résumé des coûts
*   **Nom de domaine** : ~10€ à 15€ / an.
*   **Hébergement (Firebase)** : Gratuit (tant que le trafic reste raisonnable).
*   **Certificat SSL (HTTPS)** : Gratuit (géré par Firebase).

Le coût total pour maintenir votre site pro sera donc d'environ **15€ par an**.

tousatable-normandie.fr 
