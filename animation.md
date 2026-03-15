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

## 💎 2. Premium Action Button (Spotlight Magnétique & Sweep Loading)

### 📝 Description
Un bouton d'appel à l'action (CTA) ultra-premium inspiré des standards les plus élevés du web moderne (Apple, Vercel, Linear). Contrairement aux boutons classiques qui grossissent au survol, celui-ci reste purement statique et majestueux. Son interaction repose entièrement sur un système de **lumières magnétiques qui suivent la souris** (Spotlight Effect) et une transition de chargement où un rayon néon court sur tout le périmètre du bouton.

### 🎨 Rendu Visuel
- **Survol (Hover) : Zéro Scale** : Le bouton ne change pas de taille. À la place, un double projecteur lumineux caché sous le bouton suit les coordonnées exactes du curseur, révélant dynamiquement le contour et le fond du bouton là où se trouve la souris.
- **Top Highlight (3D Edge)** : Le bord supérieur du bouton est continuellement éclairé par un très fin reflet, simulant une touche de lumière rasante sur un objet matériel en 3D.
- **Clic (Tap)** : Une compression physique ultra-serrée (`scale: 0.985`) avec une physique de type "ressort" tendu (Spring) pour imiter la densité d'un vrai bouton mécanique.
- **Chargement (Transition de validation)** : Le texte s'efface en douceur. Au lieu de rétrécir bêtement en cercle (ce qui créerait des distorsions), le bouton garde sa largeur. La bordure s'active soudainement sous forme d'un rayon laser balayant tout le périmètre extérieur (le bouton lui-même devient la barre de chargement), pendant qu'une icône de cadenas apparaît au centre.

### 🛠️ Technologies Utilisées
- **React (useRef, useState)** : Pour intercepter et stocker en temps réel les coordonnées X et Y de la souris relatives à la position du bouton.
- **Framer Motion (`useMotionValue` ou state local)** : Pour animer la position des lueurs (`radial-gradient`) de manière parfaitement fluide.
- **CSS Avançé (`clip-path` ou `mask-image`)** : Pour sculpter le reflet 3D sur le rebord supérieur.

### ⚙️ Fonctionnement Technique (Le Secret des Lumières)

L'effet "Magnetic Spotlight" est obtenu en empilant de multiples couches `absolute` à l'intérieur du bouton, toutes en `pointer-events-none` :

1. **La Couche Bordure (Border Glow)** : 
   Une `div` avec un padding de `2px` (`p-[2px]`), contenant elle-même le masque central. Le fond de cette `div` n'est pas une couleur unie, mais un `radial-gradient` (halo) dont le centre est mappé sur `mousePosition.x` et `y`.
   
2. **La Couche Lumière Interne (Inner Glow)** : 
   Un second `radial-gradient` posé par-dessus, plus petit et très très doux (ex: `rgba(255,255,255,0.06)`), pour donner l'impression que la lumière traverse le matériau du bouton (effet verre poli).
   
3. **Le Top Highlight 3D** :
   Un simple gradient linéaire blanc vers transparent, posé en `absolute inset-0`, qui est littéralement tronqué/effacé à 95% par un `mask-image` (qui masque tout sauf le haut de la div).

> **💡 L'astuce du Neon Perimeter Sweep :**
> Lors du chargement de l'API (Stripe par exemple), on réutilise exactement la même technique du *Conic Gradient Masking* (vue dans l'astuce 🌟 1). Sauf qu'ici, on ralentit l'animation (`duration: 2.5s`) pour que le faisceau blanc ait le temps de balayer le très long rectangle. Le résultat donne l'illusion qu'un fil de lumière court physiquement le long du câble périmétrique !

### 💻 Code Snippet (Composant PremiumActionBtn)

```jsx
import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock } from 'lucide-react';

const PremiumActionBtn = ({ children, isLoading, disabled, onClick, darkMode = true }) => {
    const buttonRef = useRef(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);

    // Fonction de Mouse Tracking
    const handleMouseMove = (e) => {
        if (!buttonRef.current || disabled) return;
        const rect = buttonRef.current.getBoundingClientRect();
        setMousePosition({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        });
    };

    const bgColor = darkMode ? 'bg-stone-900' : 'bg-[#1a1a1a]';

    return (
        <motion.button
            ref={buttonRef}
            onClick={onClick}
            disabled={disabled || isLoading}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            whileHover={{}} // IMPORTANT : PAS DE SCALE AU SURVOL !
            whileTap={!disabled && !isLoading ? { scale: 0.985 } : {}}
            transition={{ type: "spring", stiffness: 450, damping: 35 }}
            className={`relative overflow-hidden font-black uppercase text-sm tracking-widest flex items-center justify-center mx-auto transition-colors duration-700 outline-none w-full h-[64px] py-0 px-4 rounded-[1.25rem]
                ${isLoading ? 'cursor-wait' : 'cursor-pointer'}
                ${disabled 
                    ? 'opacity-60 cursor-not-allowed bg-stone-900/50 text-stone-600'
                    : \`\${bgColor} text-white shadow-[0_8px_30px_rgba(0,0,0,0.15)]\`
                }
            `}
        >
            {/* 1. MAGNETIC SPOTLIGHT BORDER GLOW (Liseré dynamique de 2px suivant la souris) */}
            {!disabled && !isLoading && (
                <motion.div
                    className="absolute inset-0 pointer-events-none z-0 p-[2px] rounded-[1.25rem]"
                    animate={{ opacity: isHovered ? 1 : 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    style={{
                        background: \`radial-gradient(160px circle at \${mousePosition.x}px \${mousePosition.y}px, rgba(255,255,255,0.7), transparent 60%)\`,
                    }}
                >
                    {/* Le masque opaque garantit que seule la bordure de 2px s'illumine */}
                    <div className={\`w-full h-full rounded-[calc(1.25rem-2px)] \${bgColor}\`} />
                </motion.div>
            )}

            {/* 2. INNER MAGNETIC GLOW (Halo interne très diffus) */}
            {!disabled && !isLoading && (
                <motion.div
                    className="absolute inset-0 pointer-events-none z-10 rounded-[1.25rem]"
                    animate={{ opacity: isHovered ? 1 : 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    style={{
                        background: \`radial-gradient(100px circle at \${mousePosition.x}px \${mousePosition.y}px, rgba(255,255,255,0.06), transparent 50%)\`,
                    }}
                />
            )}

            {/* 3. NEON PERIMETER SWEEP (Liseré de chargement qui court sur la bordure) */}
            <AnimatePresence>
                {isLoading && (
                    <motion.div
                        key="neon-spinner"
                        className="absolute inset-0 pointer-events-none z-0 p-[2px] rounded-[1.25rem] overflow-hidden"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        {/* Le faisceau lumineux rotatif extra-large (w-[300%]) */}
                        <motion.div 
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
                            className="absolute top-1/2 left-1/2 w-[300%] aspect-square -translate-x-1/2 -translate-y-1/2 z-0"
                            style={{
                                background: "conic-gradient(from 0deg, transparent 0%, rgba(255,255,255,0) 25%, rgba(255,255,255,1) 50%, rgba(255,255,255,0) 75%, transparent 100%)",
                            }}
                        />
                        <div className={\`relative z-10 w-full h-full rounded-[calc(1.25rem-2px)] \${bgColor}\`} />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 4. APPLE-STYLE 3D TOP HIGHLIGHT (Ligne lumineuse encastrée sur le dessus) */}
            {!disabled && !isLoading && (
                <div 
                    className="absolute inset-0 pointer-events-none z-10 rounded-[1.25rem] bg-gradient-to-b from-white/10 to-transparent opacity-60" 
                    style={{ maskImage: 'linear-gradient(to bottom, black 5%, transparent 30%)' }} 
                />
            )}

            {/* CONTENT MORPHING (Remplacement du texte par l'icône de chargement) */}
            <AnimatePresence mode="wait">
                {isLoading ? (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                        className="flex items-center justify-center absolute inset-0 z-20 gap-3"
                    >
                        <Lock size={18} className="text-white/80" />
                        <span className="text-white/80">Sécurisation...</span>
                    </motion.div>
                ) : (
                    <motion.div
                        key="text"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                        className="relative z-20 flex items-center justify-center w-full whitespace-nowrap gap-3"
                    >
                        {children}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.button>
    );
};
```

---
