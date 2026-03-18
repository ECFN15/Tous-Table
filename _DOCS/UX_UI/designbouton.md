# 🎨 Design System : Les Bordures Néon "Atelier"

Ce document documente l'implémentation des effets de bordures animées (Serpent Néon) utilisés sur les composants stratégiques du site.

---

## 🏗️ 1. Concept Technique
L'effet repose sur trois couches superposées :
1. **Conteneur Parent** (`overflow-hidden`, `p-[Xpx]`) : Définit l'épaisseur de la bordure.
2. **Couche d'Animation** (`conic-gradient`) : Un disque rotatif qui simule le passage d'un serpent lumineux derrière le contenu.
3. **Contenu Enfant** (`z-10`, `bg-white` ou `backdrop-blur`) : Masque le centre du disque pour ne laisser apparaître que le liseret extérieur.

---

## 📧 2. Galerie : Newsletter Popup (Serpent Haute Intensité)

### 🌑 Logique de Design
*   **Couleurs** : Noir absolu vers Blanc pur pour un contraste maximal.
*   **Structure** : Double couche (Glow flou + Cœur net) pour une sensation de néon réaliste.
*   **Épaisseur** : 5px pour un impact visuel fort sur desktop.

### 💻 Code Source (NewsletterModal.jsx)
```jsx
{/* Conteneur avec padding 5px pour la bordure */}
<motion.div className="relative p-[5px] overflow-hidden rounded-[2rem]">

    {/* Couche 1 : Glow Arrière (Très flou) */}
    <motion.div
        animate={{ rotate: -360 }}
        transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
        className="absolute inset-[-150%] z-0 blur-2xl opacity-100"
        style={{
            background: "conic-gradient(from 0deg, transparent 40%, #000 50%, #444 80%, #fff 95%, transparent 100%)",
        }}
    />

    {/* Couche 2 : Cœur (Ligne nette) */}
    <motion.div
        animate={{ rotate: -360 }}
        transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
        className="absolute inset-[-120%] z-0"
        style={{
            background: "conic-gradient(from 0deg, transparent 40%, rgba(0,0,0,1) 50%, rgba(50,50,50,1) 80%, rgba(255,255,255,1) 95%, transparent 100%)",
        }}
    />

    {/* Couche 3 : Face Interne (Le contenu) */}
    <div className="relative w-full h-full rounded-[calc(2rem-5px)] bg-white z-10">
        {/* Contenu de la newsletter... */}
    </div>
</motion.div>
```

---

## 📱 3. Navigation Mobile : Boutons CTA (Néon Symétrique)

### 🌑 Logique de Design
*   **Objectif** : Inciter au clic sur les catégories non-sélectionnées.
*   **Style** : "Dash" symétrique (fondu -> point lumineux -> fondu) pour éviter les surépaisseurs dans les coins arrondis.
*   **Épaisseur** : 1.5px pour la finesse et l'élégance.

### 💻 Code Source (MarketplaceLayout.jsx)
```jsx
{/* Condition d'affichage : Seulement si la collection n'est pas active */}
<div className="relative p-[1.5px] rounded-full overflow-hidden">
    {activeCollection !== 'furniture' && (
        <motion.div
            animate={{ rotate: -360 }}
            transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
            className="absolute inset-[-150%] z-0"
            style={{
                background: "conic-gradient(from 0deg, transparent 30%, rgba(255,255,255,0) 35%, rgba(255,255,255,1) 50%, rgba(255,255,255,0) 65%, transparent 70%)",
            }}
        />
    )}
    <button className="relative z-10 bg-stone-100/90 backdrop-blur-md ...">
        Mobilier
    </button>
</div>
```

---

## 💡 4. Pourquoi ces choix ?
1. **Performance** : Utilisation de `rotate` sur un élément simplifié via GPU (`isolation-auto`).
2. **Accessibilité** : L'effet néon ne s'affiche que sur mobile et pour les éléments non-actifs, afin de guider l'utilisateur sans le fatiguer.
3. **Maintien du Thème** : Utilisation exclusive des tons `Stone` et `Zinc` pour rester dans l'esthétique "Musée" du projet Architectural.
