# 🪄 Bibliothèque d'Animations Premium

Bienvenue dans la bibliothèque des animations et effets visuels premium du projet **Tous à Table**. 
Ce document référence les concepts d'UI/UX avancés, explique leur fonctionnement technique et garde trace des composants réutilisables pour assurer une expérience utilisateur magique et fluide.

---

## 🌟 1. Neon Border Selection (Bordure Néon Rotative)

### 📝 Description
Un effet de sélection premium appliqué aux cartes d'interface (utilisé notamment sur les choix de moyens de paiement du Checkout). 
Lorsqu'une carte est sélectionnée, une bordure lumineuse (façon néon) apparaît et tourne infiniment le long de ses contours, offrant un rendu futuriste, fluide et très élégant.

### 🎨 Rendu Visuel
- **État au repos** : Une carte minimaliste avec un fond subtil (ou transparent) et un effet de hover discret.
- **État sélectionné** : Le fond de la carte devient totalement opaque et une bordure néon fluide tourne en boucle. L'apparition du faisceau lumineux se fait en douceur (*fade-in*).

### 🛠️ Technologies Utilisées
- **React** (Composants JSX)
- **Tailwind CSS** (Pour le positionnement absolu, les masques, le padding et les opacités)
- **Framer Motion** (Pour l'animation de rotation continue et les fondus d'apparition/disparition)

### ⚙️ Fonctionnement Technique (Le Secret)
L'effet est basé sur la technique classique du **"Conic Gradient Masking"** :

1. **Le Conteneur Principal (`overflow-hidden`, `p-[1.5px]`)** : 
   Sert de cadre global. Le "padding" très léger (1.5px) correspond à l'épaisseur finale de la bordure lumineuse que l'on souhaite afficher.
   
2. **La Couche Néon (Le faisceau tournant)** : 
   C'est un composant `<motion.div>` gigantesque (`w-[300%] aspect-square`), centré en arrière-plan. Son fond est un `conic-gradient` qui dessine une ligne blanche lumineuse s'estompant dans la transparence. Ce div géant tourne sur lui-même à l'infini (`rotate: -360`).
   
3. **Le Masque Interne (`relative z-10`, Fond Opaque)** : 
   C'est la carte qui contient le texte et les icônes. Elle se superpose exactement par-dessus le néon. Étant opaque à 100%, elle cache entièrement le centre chaotique du `conic-gradient`. La lumière ne déborde et n'est visible **que** dans les 1.5px de marge (le padding) laissés par le parent, créant l'illusion d'une ligne qui court sur le bord de la carte.

> **💡 L'astuce du "Fade-In Delay" (Le Fix du "Triangle Flash") :**
> Lors du clic pour sélectionner la carte, le masque interne met environ 150ms à changer de fond (passant de transparent à noir) à cause de la classe `transition-all`. 
> Si le néon apparaît immédiatement, l'utilisateur voit un éclat de lumière au centre du bouton à travers la transparence le temps de l'animation CSS.
> **La solution :** Le néon est animé avec `initial={{ opacity: 0 }}` et un petit délai (`delay: 0.1`). Ainsi, le rayon n'apparaît doucement qu'une fois que la carte intérieure est parfaitement opaque, garantissant une transition visuelle parfaite !

### 💻 Code Snippet (Composant de base)

```jsx
import { useState } from 'react';
import { motion } from 'framer-motion';

export const NeonSelectionCard = ({ selected, onClick, children, darkMode = true }) => {
    return (
        <div 
            onClick={onClick}
            // 1. Conteneur : Le padding défini l'épaisseur de la bordure néon
            className="relative group p-[1.5px] rounded-[1.125rem] overflow-hidden cursor-pointer w-full transition-all"
        >
            {/* 2. La roue lumineuse (Néon) animée via Framer Motion */}
            {selected && (
                <motion.div
                    initial={{ opacity: 0, rotate: 0 }}
                    animate={{ opacity: 1, rotate: -360 }}
                    transition={{ 
                        opacity: { duration: 0.3, delay: 0.1 }, // DELAY VITAL : Cache le néon pendant la transition de fond !
                        rotate: { repeat: Infinity, duration: 6, ease: "linear" } 
                    }}
                    className="absolute top-1/2 left-1/2 w-[300%] aspect-square -translate-x-1/2 -translate-y-1/2 z-0"
                    style={{
                        background: "conic-gradient(from 0deg, transparent 30%, rgba(255,255,255,0) 35%, rgba(255,255,255,1) 50%, rgba(255,255,255,0) 65%, transparent 70%)",
                    }}
                />
            )}

            {/* Bordure par défaut (carte non sélectionnée) */}
            {!selected && (
                <div className={`absolute inset-0 z-0 rounded-[1.125rem] border-2 transition-colors ${darkMode ? 'border-stone-800' : 'border-stone-200'}`} />
            )}

            {/* 3. Masque opaque contenant le vrai contenu */}
            <div className={`relative z-10 w-full h-full p-4 rounded-2xl flex flex-col gap-6 backdrop-blur-md transition-all ${
                selected 
                    ? (darkMode ? 'bg-stone-900' : 'bg-white') // Opaque à 100% indispensable pour masquer le centre
                    : (darkMode ? 'bg-transparent group-hover:bg-white/5' : 'bg-transparent group-hover:bg-black/5')
            }`}>
                {children}
            </div>
        </div>
    );
};
```

---
