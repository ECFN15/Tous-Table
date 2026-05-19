# Guide A a Z — Integrer Google AdSense sur Tous a Table

Date : 17 mai 2026

Objectif : permettre au site `tousatable-madeinnormandie.fr` d'afficher des publicites Google dans les emplacements prepares sur les pages detail produit.

> Important : pour afficher des publicites et monetiser le site, le produit Google a utiliser est **Google AdSense**. **Google Ads** sert principalement a acheter de la publicite pour promouvoir une marque ou un site.

## 1. Etat actuel du projet

### Fichiers concernes

- `index.html` : document HTML racine Vite, endroit ou ajouter le script global AdSense dans `<head>`.
- `public/` : dossier public servi a la racine du site, endroit ou creer `ads.txt`.
- `src/designs/architectural/ArchitecturalProductDetail.jsx` : page detail produit contenant les placeholders publicitaires.
- `_DOCS/AUDITS/product_detail_hero_ads.md` : audit UI des emplacements publicitaires deja crees.

### Emplacements publicitaires deja prepares

Dans `ArchitecturalProductDetail.jsx`, le composant placeholder actuel est :

```jsx
const ProductDetailAdSlot = ({ className = "", orientation = "horizontal", darkMode = false }) => (
    <div
        className={`flex shrink-0 items-center justify-center border border-dashed ${darkMode ? 'border-white/15 bg-white/[0.015] text-stone-500' : 'border-stone-300/70 bg-white/30 text-stone-500'} ${className}`}
        data-google-ad-slot={`product-detail-${orientation}`}
    >
        <div className="text-center">
            <p className="text-[8px] font-black uppercase tracking-[0.34em] opacity-45">Annonce</p>
            <p className="mt-1 font-serif text-sm italic opacity-80">Google Ads</p>
        </div>
    </div>
);
```

Emplacements actuels :

| Zone | Device | Taille UI prevue | Orientation actuelle |
| --- | --- | --- | --- |
| Au-dessus image principale | desktop | `728 x 90` | `top` |
| Lateral gauche image | desktop | largeur `120px`, hauteur fluide | `left` |
| Lateral droit image | desktop | largeur `120px`, hauteur fluide | `right` |
| Apres description/prix/specs | mobile uniquement | `320 x 100` | `mobile` |
| Entre Tuto Atelier et Quatre piliers | mobile + desktop | `320 x 100` mobile, `970 x 90` desktop | `between-sections` |

## 2. Formats Google recommandes pour ce site

### Formats desktop utiles

- `970 x 90` : large leaderboard. Tres adapte entre deux sections larges.
- `728 x 90` : leaderboard classique. Adapte au-dessus d'un contenu ou dans un hero.
- `120 x 600` : skyscraper. Minimum vertical compatible avec les colonnes laterales actuelles.
- `160 x 600` : wide skyscraper. Potentiellement meilleur inventaire, mais demande plus de largeur laterale.
- `300 x 250` : medium rectangle. Tres courant, mais moins adapte aux colonnes fines creees autour de l'image.

### Formats mobile utiles

- `320 x 100` : mobile large banner. Recommande car il peut aussi laisser concourir des annonces `320 x 50`.
- `320 x 50` : mobile banner. Moins haut, moins visible.
- `300 x 250` : rectangle mobile. Performant mais plus intrusif, a eviter dans une zone deja dense sauf besoin explicite.

### Regles AdSense fixed-size a retenir

D'apres les guidelines AdSense fixed-size :

- largeur minimale : `120px` ;
- hauteur minimale : `50px` ;
- une seule dimension peut depasser `450px` ;
- aucune dimension ne doit depasser `1200px`.

## 3. Prerequis cote Google

### 3.1 Creer ou ouvrir le compte AdSense

1. Aller sur `https://www.google.com/adsense`.
2. Se connecter avec le compte Google du client.
3. Verifier les informations de paiement, pays, adresse, fiscalite.
4. Ajouter le site : `https://tousatable-madeinnormandie.fr`.

### 3.2 Connecter le site a AdSense

Google propose plusieurs methodes :

- script AdSense dans le `<head>` ;
- `ads.txt` ;
- meta tag `google-adsense-account`.

Pour ce projet, la methode recommandee est :

1. script global dans `index.html` ;
2. fichier `public/ads.txt` ;
3. eventuellement meta tag si Google le demande.

## 4. Variables et identifiants a recuperer

Dans AdSense, recuperer :

- **Publisher ID** : format `pub-0000000000000000`.
- **Client ID dans le script** : format `ca-pub-0000000000000000`.
- **Ad slot IDs** : identifiants numeriques differents pour chaque bloc publicitaire, si vous creez plusieurs unites.

> Ne jamais mettre de vraie valeur secrete dans une doc publique ou dans un message partage. Ici, utiliser les placeholders jusqu'a integration finale.

## 5. Ajouter `ads.txt`

### 5.1 Creer le fichier

Creer :

```txt
public/ads.txt
```

Contenu attendu, a adapter avec le vrai publisher ID :

```txt
google.com, pub-0000000000000000, DIRECT, f08c47fec0942fa0
```

### 5.2 Verifier apres deploy

Apres deploy production, ouvrir :

```txt
https://tousatable-madeinnormandie.fr/ads.txt
```

Le navigateur doit afficher exactement la ligne `google.com, pub-..., DIRECT, f08c47fec0942fa0`.

### 5.3 Delai Google

Google indique que la prise en compte de `ads.txt` peut prendre quelques jours, parfois plus si le site fait peu de requetes publicitaires.

## 6. Ajouter le script global AdSense

Dans `index.html`, dans `<head>`, ajouter le script fourni par AdSense.

Emplacement recommande : apres les meta SEO principales ou avant `</head>`.

Exemple avec placeholder :

```html
<script
  async
  src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-0000000000000000"
  crossorigin="anonymous">
</script>
```

Option possible si Google demande une verification meta :

```html
<meta name="google-adsense-account" content="ca-pub-0000000000000000">
```

## 7. Creer les unites publicitaires dans AdSense

Dans AdSense :

1. Aller dans `Ads`.
2. Choisir `By ad unit`.
3. Cliquer `Display ads`.
4. Creer une unite avec un nom explicite.
5. Privilegier `Responsive`, sauf si vous voulez forcer un format fixe.
6. Cliquer `Save and get code`.
7. Recuperer le `data-ad-client` et le `data-ad-slot`.

### Nommage recommande

| Nom AdSense | Zone site | Format UI attendu |
| --- | --- | --- |
| `TAT Product Detail Hero Top` | haut image detail produit | `728 x 90` |
| `TAT Product Detail Hero Left` | lateral gauche desktop | `120 x 600` ou responsive vertical |
| `TAT Product Detail Hero Right` | lateral droit desktop | `120 x 600` ou responsive vertical |
| `TAT Product Detail Mobile Info` | apres prix/specs mobile | `320 x 100` |
| `TAT Product Detail Between Sections` | entre tuto et piliers | `320 x 100` mobile, `970 x 90` desktop |

## 8. Remplacer les placeholders React par de vraies pubs

### 8.1 Strategie recommandee

Ne pas mettre le code AdSense brut partout dans le JSX. Creer un composant reutilisable, par exemple :

```txt
src/components/ads/GoogleAdSlot.jsx
```

Ce composant doit :

- recevoir `adSlot`, `format`, `className`, `style` ;
- ne rien afficher si l'identifiant manque ;
- eviter de charger en local si souhaitable ;
- appeler `window.adsbygoogle.push({})` apres le rendu ;
- ne pas planter si un bloqueur de pub est actif.

### 8.2 Exemple de composant React

```jsx
import { useEffect } from 'react';

const ADSENSE_CLIENT_ID = import.meta.env.VITE_ADSENSE_CLIENT_ID;
const ADSENSE_ENABLED = import.meta.env.VITE_ADSENSE_ENABLED === 'true';

const GoogleAdSlot = ({ adSlot, className = '', style, format = 'auto', responsive = true }) => {
  useEffect(() => {
    if (!ADSENSE_ENABLED || !ADSENSE_CLIENT_ID || !adSlot) return;
    try {
      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.push({});
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('AdSense slot init skipped', error);
      }
    }
  }, [adSlot]);

  if (!ADSENSE_ENABLED || !ADSENSE_CLIENT_ID || !adSlot) {
    return null;
  }

  return (
    <ins
      className={`adsbygoogle ${className}`}
      style={{ display: 'block', ...style }}
      data-ad-client={ADSENSE_CLIENT_ID}
      data-ad-slot={adSlot}
      data-ad-format={format}
      data-full-width-responsive={responsive ? 'true' : 'false'}
    />
  );
};

export default GoogleAdSlot;
```

### 8.3 Variables d'environnement recommandees

Creer localement un `.env.local` non versionne :

```env
VITE_ADSENSE_ENABLED=false
VITE_ADSENSE_CLIENT_ID=ca-pub-0000000000000000
VITE_ADSENSE_SLOT_PRODUCT_HERO_TOP=0000000001
VITE_ADSENSE_SLOT_PRODUCT_HERO_LEFT=0000000002
VITE_ADSENSE_SLOT_PRODUCT_HERO_RIGHT=0000000003
VITE_ADSENSE_SLOT_PRODUCT_MOBILE_INFO=0000000004
VITE_ADSENSE_SLOT_PRODUCT_BETWEEN_SECTIONS=0000000005
```

En production, configurer les memes variables dans l'hebergeur / pipeline de build.

> Ne jamais commiter `.env.local` avec les vraies valeurs.

## 9. Mapper les slots existants

Dans `ArchitecturalProductDetail.jsx`, remplacer progressivement les `ProductDetailAdSlot` par `GoogleAdSlot`.

### Hero top desktop

UI actuelle :

```jsx
<ProductDetailAdSlot className="hidden h-[90px] w-full lg:w-[728px] lg:max-w-[728px] lg:flex" orientation="top" darkMode={darkMode} />
```

Future integration :

```jsx
<GoogleAdSlot
  adSlot={import.meta.env.VITE_ADSENSE_SLOT_PRODUCT_HERO_TOP}
  className="hidden h-[90px] w-full lg:block lg:w-[728px] lg:max-w-[728px]"
  style={{ width: '728px', height: '90px' }}
  format=""
  responsive={false}
/>
```

### Lateraux desktop

Pour les lateraux `120 x 600`, utiliser des slots fixes ou responsive verticaux selon ce que donne AdSense.

```jsx
<GoogleAdSlot
  adSlot={import.meta.env.VITE_ADSENSE_SLOT_PRODUCT_HERO_LEFT}
  className="hidden h-full w-[120px] lg:block"
  style={{ width: '120px', minHeight: '600px' }}
  format=""
  responsive={false}
/>
```

### Mobile apres prix/specs

```jsx
<GoogleAdSlot
  adSlot={import.meta.env.VITE_ADSENSE_SLOT_PRODUCT_MOBILE_INFO}
  className="mx-auto mb-6 mt-1 h-[100px] w-full max-w-[320px] lg:hidden"
  style={{ width: '320px', height: '100px' }}
  format=""
  responsive={false}
/>
```

### Inter-sections

```jsx
<GoogleAdSlot
  adSlot={import.meta.env.VITE_ADSENSE_SLOT_PRODUCT_BETWEEN_SECTIONS}
  className="mx-auto h-[100px] w-full max-w-[320px] lg:h-[90px] lg:max-w-[970px]"
  style={{ minHeight: '90px' }}
  format="auto"
  responsive
/>
```

## 10. Gestion RGPD / consentement cookies

Avant d'activer AdSense en production, verifier :

- presence d'une politique de confidentialite ;
- presence d'une politique cookies ;
- mecanisme de consentement si requis ;
- configuration CMP si AdSense le demande pour l'Europe.

AdSense peut demander de choisir une **CMP** lors de la review ou apres activation. Pour un site francais, ne pas ignorer ce point.

## 11. Attention UX et politiques AdSense

A respecter :

- ne pas pousser l'utilisateur a cliquer sur les pubs ;
- ne pas libeller les pubs autrement que `Annonce` / `Publicite` ;
- ne pas superposer une pub avec un bouton, un menu, le WhatsApp flottant ou une navigation ;
- ne pas mettre trop de pubs au-dessus du contenu principal ;
- eviter les formats intrusifs qui degradent l'experience mobile ;
- garder assez d'espacement autour des CTA d'achat pour eviter les clics accidentels.

## 12. Tests locaux

En local, garder :

```env
VITE_ADSENSE_ENABLED=false
```

Pourquoi :

- AdSense peut ne pas servir de vraies pubs en local ;
- les bloqueurs de pub peuvent creer des erreurs console ;
- charger de vraies pubs en dev n'apporte pas grand-chose.

Tester plutot :

```bash
npm run build
```

Puis verifier visuellement avec les placeholders avant activation reelle.

## 13. Tests apres deploy production

Apres deploy, verifier :

1. `https://tousatable-madeinnormandie.fr/ads.txt` affiche la bonne ligne.
2. Le code source HTML contient le script AdSense dans `<head>`.
3. Les pages detail produit se chargent sans erreur console bloquante.
4. Les emplacements pubs ne cassent pas :
   - desktop `1920 x 1080` ;
   - laptop ;
   - mobile vertical ;
   - mobile horizontal.
5. Le WhatsApp flottant ne recouvre pas les pubs mobiles.
6. Les CTA restent accessibles.
7. Dans AdSense, le site passe au statut `Ready`.
8. Les premieres pubs peuvent prendre quelques minutes a une heure apres activation.

## 14. Checklist de mise en production

Avant deploy :

- [ ] compte AdSense cree et valide ;
- [ ] publisher ID recupere ;
- [ ] ad units creees et slots notes ;
- [ ] `public/ads.txt` cree avec le vrai publisher ID ;
- [ ] script global ajoute a `index.html` ;
- [ ] composant `GoogleAdSlot` cree ;
- [ ] placeholders remplaces ou mode fallback conserve ;
- [ ] variables de production configurees ;
- [ ] RGPD/CMP/politique confidentialite verifies ;
- [ ] `npm run build` OK ;
- [ ] accord explicite utilisateur obtenu avant deploy prod.

Apres deploy :

- [ ] verifier `/ads.txt` ;
- [ ] verifier le HTML public ;
- [ ] verifier les pages produit desktop/mobile ;
- [ ] surveiller Search Console / PageSpeed si necessaire ;
- [ ] surveiller AdSense pour erreurs `ads.txt`, site non approuve, slots inactifs.

## 15. Ordre d'integration recommande pour ce projet

1. Creer le compte AdSense et ajouter le site.
2. Creer `public/ads.txt` avec le vrai publisher ID.
3. Ajouter le script AdSense global dans `index.html`.
4. Creer les unites publicitaires dans AdSense.
5. Ajouter `GoogleAdSlot.jsx`.
6. Remplacer un seul emplacement d'abord : slot inter-sections.
7. Deploy staging/prod apres accord explicite.
8. Verifier que la pub apparait sans casser l'UX.
9. Remplacer ensuite les autres placeholders un par un.
10. Ajuster les formats selon les performances AdSense.

## 16. Sources officielles consultees

- Google AdSense — Connect your site to AdSense : `https://support.google.com/adsense/answer/7584263`
- Google AdSense — Ads.txt guide : `https://support.google.com/adsense/answer/12171612`
- Google AdSense — Create a display ad unit : `https://support.google.com/adsense/answer/9274025`
- Google AdSense — Responsive display ad units : `https://support.google.com/adsense/answer/9183362`
- Google AdSense — Fixed-sized display ad unit guidelines : `https://support.google.com/adsense/answer/9185043`
- Google Ad Manager — Supported ad sizes : `https://support.google.com/admanager/answer/1100453`

## 17. Notes projet

- Le fichier `public/ads.txt` existe depuis le 17 mai 2026 et a ete mis a jour le 19 mai 2026 avec la ligne `google.com, pub-4972786970339791, DIRECT, f08c47fec0942fa0`; apres deploy, verifier que `/ads.txt` renvoie uniquement cette ligne et non `index.html`.
- `index.html` contient le script global AdSense et la balise meta `google-adsense-account`; le client actif depuis le 19 mai 2026 est `ca-pub-4972786970339791`, pour la validation de propriete du site.
- Le site possede deja une verification Google dans `public/google72f08140b6217ed3.html`, probablement liee a Search Console.
- Les placeholders UI sont prets, mais ne chargent pas encore de vraies pubs.
- Les placeholders de detail produit sont visibles uniquement en local/dev, ou avec `VITE_SHOW_AD_PLACEHOLDERS=true`, afin de ne pas afficher des blocs "Annonce / Google Ads" vides aux visiteurs en production.
- La CSP Hosting autorise les domaines AdSense essentiels (`pagead2.googlesyndication.com`, `googleads.g.doubleclick.net`, `tpc.googlesyndication.com`) depuis le 17 mai 2026, sinon le navigateur bloque le script AdSense meme si le HTML le contient.
