# 🔨 Dossier Favicon : Étude & Code

Dernière mise à jour : 2026-02-11
État actuel : **Vectoriel (SVG) - Version "Wood" (Bois)**

---

## 💡 Leçon Apprise : Pourquoi le Vectoriel ?
Nous avons testé des images PNG (pixels) et le résultat était "flou" ou baveux une fois réduit dans l'onglet du navigateur.
La solution professionnelle adoptée par les grandes marques (Spotify, Firebase, Apple) est le **SVG Vectoriel**.
- **Poids** : ~1Ko (vs 50Ko pour une image).
- **Netteté** : Infinie (pas de pixels), ultra-sharp sur écran Retina/4K.
- **Transparence** : Parfaite, pas de "carré blanc" autour.

---

## 🎨 Version Actuelle (En Ligne)
C'est la version "Atelier Brut", simulant une teinte bois (Marron) avec un dégradé subtil.

### Code SVG (favicon_wood.svg)
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs>
    <!-- Dégradé bois / marron premium -->
    <linearGradient id="woodGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#8D6E63"/>
      <stop offset="100%" stop-color="#4E342E"/>
    </linearGradient>
  </defs>

  <!-- Rotation inversée -->
  <g fill="url(#woodGradient)" transform="rotate(18 32 32)">
    <!-- Tête du marteau -->
    <rect x="18" y="10" width="28" height="14" rx="4"/>

    <!-- Manche --> 
    <rect x="29" y="22" width="6" height="30" rx="3"/>
  </g>
</svg>
```

---

## 🔮 Pistes d'Amélioration (À Peaufiner)
Bien que le vectoriel soit la bonne techno, le design peut être ajusté :
1.  **Contraste** : Le marron sur fond noir (Chrome Dark Mode) manque parfois de "peps". Peut-être éclaircir le marron ou ajouter un fin contour clair ?
2.  **Cercle ou Pas ?** : La version "Nexus" (Cercle Noir + Marteau Ivoire) donnait un aspect plus "Icone d'App" (Spotify-like). À reconsidérer si on veut un look plus "Tech".
3.  **Détails** : Ajouter une nervure de bois stylisée dans le SVG ?

---

**Pour modifier le favicon :**
1.  Éditer ce fichier SVG.
2.  Le convertir/tester sur le site.
3.  Toujours viser la lisibilité maximale en 16x16 pixels.
