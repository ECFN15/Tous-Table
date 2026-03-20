---
name: "FRONTMASTER"
description: "Dictionnaire technique ultra-dense d'effets frontend premium (animations, layouts, interactions) à destination des agents IA. Recettes extraites de sites références Awwwards."
---
# 👑 FRONTMASTER — AGENT MASTER REFERENCE
Base de données d'effets visuels et techniques d'intégration haut de gamme. 7 sites Awwwards analysés. Chaque entrée ajoute une mécanique unique (zéro redondance).

## ⚙️ AGENT INSTRUCTIONS (LIRE EN PREMIER)
QUAND UTILISER CE FICHIER: Avant toute création/modification de composant visuel, section homepage, page produit ou animation. Scanner la section texte pour choisir un pattern, puis copier le snippet correspondant de la SNIPPET LIBRARY.
RÈGLE DE COMBINAISON: Jamais plus de 3 effets simultanés par section visible. Un scroll reveal (texte) + un parallaxe (image) + un thematic shift (fond) = le maximum. Au-delà, surcharge cognitive.
RÈGLE MOBILE: Désactiver parallaxe complexe et curseur custom sous 1024px. Remplacer par des fade-in simples (opacity+y:20) avec once:true. Conserver les color transitions et le grain.
RÈGLE PERFORMANCE: Toujours utiliser will-change:transform sur les éléments animés. Préférer transform/opacity (GPU) à width/height/margin (CPU). Limiter SplitText à max 200 caractères.

## 🎯 EASING PALETTE (Référence Universelle)
SNAPPY (Boutons/Micro): cubic-bezier(0.25,1,0.5,1) ou power3.out — Réponse nerveuse immédiate.
CINEMATIC (Reveals/Masks): power4.inOut — Accélération douce puis décélération lente. Feeling "rideau de théâtre".
ELASTIC (Curseurs/Physique): elastic.out(1,0.3) — Rebond organique. Exclusivement pour éléments suivant la souris.
SMOOTH (Parallaxe/Scrub): "none" avec scrub:true — Mouvement linéaire piloté par le scroll. Zéro courbe.
DRAMATIC (Hero/Preloader): expo.out — Départ explosif puis long atterrissage. Pour les entrées qui doivent impressionner.
BOUNCE (Feedback/Notification): back.out(1.7) — Léger dépassement puis retour. Pour confirmer une action utilisateur.

## 🔤 TYPOGRAPHY PAIRING GUIDE
MUSEUM (Leandra/Wrights/Damai): Serif Display (Cormorant Garamond, Playfair Display, DM Serif) pour H1/H2 + Sans-Serif neutre (Inter, Outfit) pour corps. Letter-spacing: titres -0.02em, corps 0.01em.
TECH (Inversa/MetaMask): Sans-Serif Bold Condensed (Neue Montreal, Archivo Black) pour H1 + Monospace (JetBrains Mono, Space Mono) pour labels techniques. Tabular-nums sur les compteurs.
EDITORIAL (Landa/Wrights): Serif avec italiques stratégiques (Cormorant Garamond Italic) pour les mots "âme". Contraste de scale extrême: H1 à 10-15vw, metadata à 10px avec letter-spacing:0.2em.
LIQUID (Outpost): Sans-Serif géométrique (Outfit, Plus Jakarta Sans) à très grande taille avec tracking négatif (-.05em). Tout en uppercase pour un rendu monolithique.

## [INVERSA.COM] - TECH BLEU-PRINT & CINEMATIQUE
HeroCinematicReveal: Vidéo BG fullscreen(100svh). Textes H1 massifs(10-15vw). ScrollTrigger avec scrub déplace H1 et bouttons yPercent:0 vers -50 et opacity vers 0. Un texte secondaire glitch: itération de caractères aléatoires(30ms/char) avant de solver le mot final.
CharScrambleGlitch: Algorithme de brouillage textuel. Une boucle JS remplace chaque caractère d'un mot par un aléatoire (String.fromCharCode(Math.floor(Math.random()*26)+65)) puis résout lettre par lettre (de gauche à droite) à intervalle de 30ms. Donne un effet "Décodage Matrix" au reveal.
GeometrikMasks: Bords d'images brisés via CSS clip-path:polygon(0% 0%,100% 0%,100% 85%,85% 100%,0% 100%) créant un onglet biseauté industriel (Blueprint style). Contraste fort avec typo épurée.
SplitLinesStagger: Paragraphes longs éclatés par lignes(ex: SplitType). Chaque ligne isolée par div(overflow:hidden). Trigger d'entrée: gsap.from(yPercent:100,stagger:0.1,duration:1.2,curve:power4.out). La typographie prend l'espace, texte respire sans fade simple.
PinnedHorizontalSequence: Section pin:true avec scroll horizontalisé. Compteur (001/003) visible. Le contenu défile latéralement(xPercent:-100*(nbSlides-1)) pendant que la page reste bloquée verticalement. Barre de progression horizontale scaleX(0->1) synchrone au scrub.
PinnedStoryTelling: Section position:sticky(top:0) fixant un asset central(SVG line-art). Le scroll déclenche une séquence d'étapes (001,002,003): données annexes fadeIn/Out. Animation tracés SVG (stroke-dashoffset proportionnel au scroll) simulant un scan technique.
SVGPathDraw: Animation de tracé vectoriel. Le stroke-dasharray est réglé sur la longueur totale du path(getTotalLength()). Le stroke-dashoffset descend de cette valeur à 0 sur un ScrollTrigger(scrub) simulant un dessin en temps réel façon blueprint.
NeonStackCarousel: Section citation typographie massive sur fond coloré fluo/neon. Au scroll, la slide courante scaleDown(0.9) et fade, tandis que la slide suivante overlay ou pousse depuis le bas(yPercent:100->0) créant un empilement (stacking).
ProgressScrubber: Indicateur vertical droit persistent. Ligne parent contenant enfant transform-origin:top, scaleY(0->1) mapé sur scrollTrigger(scrub:true) de la section active.
CinematicPreloader: Preloader custom sans spinner. Compteurs "PHASE" et "FREQ" animés en temps réel pendant le chargement. Pourcentage massif (0-100%) au centre. À completion le loader fait un yPercent:-100 avec power4.inOut dévoilant le Hero.
FullScreenMenuOverlay: Menu hamburger déclenchant un rideau plein écran (yPercent:-100->0 ou clipPath) avec les liens qui apparaissent en stagger depuis le bas. Fond souvent contrasté (noir sur site clair ou inverse).
GiantFooterReveal: Nom de marque occupant 100vw en footer. Parallaxe de footer: le footer est en dessous du contenu avec z-index inférieur et se dévoile par effet rideau lors du scroll de la dernière section div(margin-bottom:100vh).

## [LEANDRA-ISLER.CH] - MUSEUM ATMOSPHERIC & ARCHITECTURAL
HighInertiaSmoothScroll: Utilisation globale de Lenis configuré pour une inertie "lourde". Sert de base à tous les ScrollTriggers(scrub:true) qui se lient au mouvement fluide.
GlobalAtmosphericGrain: Texture de bruit recouvrant tout le site. Produit par un pseudo-élément body::after, pointer-events:none, contenant soit un filtre SVG feTurbulence soit une image noise PNG (opacity:0.04). Donne un côté organique/papier.
MaskedCounterParallaxReveals: Images insérées dans des conteneurs overflow:hidden. Lors de la vue, le conteneur dévoile son contenu(hauteur 0->100% ou clip-path:inset) tandis que l'image interne subit une parallaxe inversée(par ex scale:1.2->1 ou yPercent:-10->0).
NegativeParallaxOverlap: Typographies massives Serif(H1/H2) superposées aux bordures d'images brisant la grille. Effet géré via position:absolute ou marges négatives, avec z-index supérieur et un delta de parallaxe différent de l'image (l'image avance plus lentement que le texte) créant une profondeur 3D marquée.
ChromaticSectionTransitions: Interpolation de couleur de fond (hex color shift). ScrollTrigger lié à la balise principale(main/body) change fluidement la couleur background-color(ex: Beige->Olive->OffWhite) au franchissement d'un cap de section.
StickyStoryTellingLayouts: Colonnes Flex/Grid avec un asset média(portrait/image massive) en position:sticky(top:10vh). L'image reste à l'écran et suit la progression du scroll pendant que le block de texte descriptif adjacent défile.
TypographicPaddings: Espacements extrêmes(padding-y:15vh-20vh). La typographie elle-même structure la section, un seul message massif occupe le viewport sans ligne de séparation physique.

## [WRIGHTSFERRYMANSION.ORG] - EDITORIAL SCRAPBOOK & HERITAGE
Scrapbook4LayerStack: Architecture de superposition en 4 couches strictes. Layer0(Sub-bg): pos:absolute, texture SVG/PNG, opacity:0.1, parallaxe lent y:-50. Layer1(AccentBlock): pos:absolute, bg:var(--accent), w:40vw, h:60vh, offset left:10%, top:20%. Layer2(MainAsset): pos:relative, z:10, image principale, margin-left:auto. Layer3(OverlaidText): pos:absolute, z:20, typographie Serif massive. L'ensemble crée un "musée" dense.
TextureParallaxAssets: Intégration d'éléments graphiques semi-transparents (vieux mots manuscrits SVG, motifs) positionnés en absolute derrière le texte. Ces éléments ont un parallaxe lent (ScrollTrigger scrub:0.2) simulant un empilement de documents historiques glissant sur un bureau.
AsymmetricClustering: Regroupement dense d'images de tailles variées serrées les unes contre les autres, contrairement au spacing aéré de The Damai. Crée un sentiment d'archive physique richement documentée.
ItalicInfusionSerif: Typographie hautement éditoriale (ex: Cormorant Garamond). Les titres immenses intègrent des mots clés en italique. L'animation d'entrée: SplitText avec gsap.from(y:20, rotateX:-30, opacity:0, stagger:0.05). L'effet de rotation X donne l'impression que le texte se "lève" comme une page qu'on tourne.
FluidThemeScrubber: Transition fine de couleur de fond. Le body transite de teintes sourdes (Vert Forêt -> Crème -> Sable) liées directement au scroll pour raconter l'histoire par chapitres colorimétriques.
InteractiveMouseCursor: Curseur personnalisé (ex: icône pulse) qui change de couleur d'accent (fill/stroke) pour correspondre au fond de la section en cours de survol, renforçant le polish global.
MicroHoverLinks: Soulignement via ::after avec scaleX(0) et transform-origin:right. Au hover, scaleX(1) et transform-origin passe à left créant une expansion directionnelle dynamique. Épaisseur 1-2px, couleur héritée de la section.

## [THEDAMAI.COM] - LUXURY RESORT & DEEP PARALLAX
AtmosphericKenBurnsHero: Image/Vidéo Hero subissant un zoom in/out infinitésimal et continu (ex: scale:1.1->1 sur 30s) pour rendre le fond vivant sans être distrayant. Couplé à un titre qui se révèle en unblur (filter:blur(10px)->blur(0)).
DeepLayeredParallax: Sensation 3D sans webGL. Superposition de typographie massive en arrière-plan (z-index faible, scroll lent y:-50) et d'images HD en premier plan (z-index fort, scroll rapide y:-200). Le décalage de vitesse crée une profondeur de champ énorme.
OrganicAsymmetricLayout: Rejet de la grille 12 colonnes. Les images et textes sont décalés de pourcentages aléatoires contrôlés (margin-left:7.5%, margin-top:-5vh) créant un style "collage" ou "journal de voyage". Certaines images ajoutent une rotation subtile en scrub (rotation:5) pour un dynamisme vivant.
PinnedImageGrow: Une image en position:sticky qui reste ancrée tandis que le bloc texte adjacent défile. L'image elle-même subit un expand progressif (clip-path:inset partant d'un cadre central vers fullscreen) synchronisé au scroll.
RevealMaskExpansion: À l'intersection, les conteneurs d'image s'ouvrent(width/height 0->100% ou clip-path grossissant) révélant l'image à l'intérieur qui reste fixe ou subit un très léger de-scale(1.1->1) pour lisser l'apparition.
BottomUpStaggeredSplitText: Les textes descriptifs n'utilisent pas de fondu. Ils sont découpés en lignes. Chaque conteneur de ligne a overflow:hidden. Le texte à l'intérieur translate de y:100% à y:0 avec un stagger:0.1 créant un déroulement naturel depuis le bas.
ScrubbedFractionalGallery: Sliders horizontaux (type Swiper) avec pagination stylisée (ex: "1 / 7") et effet parallax:true: les éléments internes à la slide (nom du plat, prix) bougent à des vitesses différentes du fond de la slide pendant le swipe. Transition cubic-bezier personnalisée sur le translateX.
HighContrastTypographicScale: Contraste extrême entre des Serif H1/H2 colossales utilisées pour l'émotion, et des Sans-Serif minuscules (10px) sur-espacées (letter-spacing:0.2em) pour les métadonnées techniques, le tout noyé dans des gutters (whitespaces) massifs donnant un aspect galerie d'art.
FooterParallaxReveal: Le footer est positionné sous le contenu principal. Le dernier conteneur a un margin-bottom:100vh. Le footer use position:fixed bottom:0 z-index:-1. Le contenu scroll au-dessus puis s'efface, dévoilant le footer déjà en place comme un rideau de théâtre.

## [OUTPOST.DESIGN] - LIQUID MINIMALISM & PHYSICS
InterlockingWebGLContinuity: Un élément WebGL continu (ex: logo vaporeux ou gradient sphere) vit en background(canvas absolu). Il mute (scale, position x/y, warp shader via uTime/uScroll) selon la section active offrant un fil rouge liquide sans changer de page. L'effet ChromaticAberration (décalage RGB dans le shader fragment) ajoute un halo de couleur pulsant.
MassiveMacroParallax: Typographie colossale H1(ex: "TAKING BRANDS FURTHER") qui "écrase" l'écran mais subit un lag de scroll(yPercent:-30 sur ScrollTrigger scrub). Letter-spacing négatif (tracking:-.05em) pour un rendu "monolithique". La macro-typo agit comme un arrière-plan texturé.
AtmosphericHUD: Header/Navigation en position:fixed(top/mix-blend-mode:difference). Les éléments d'UI vitaux restent toujours à l'écran mais changent de contraste organiquement en survolant des images ou des fonds sombres/clairs.
FluidStaggeredMediaCards: Méthode de révélation d'image/vidéo "Dossier qui s'ouvre". Le conteneur overflow:hidden scale(Y/X 0->100%) pendant que le média interne de-scale(1.2->1) crantant une tension élastique. Contraste Bold Sans-Serif titres + Serif italic subtitles.
SeamlessColorFieldTransitions: Changement radical et lissé du thème global (ex: Light Gray #F0F0F0 -> Total Black #161818). Utilisation de callbacks GSAP onEnter/onLeave sur des divs invisibles pour tweeter fluidement le CSS variable --bg-color du main.
MagneticLiquidCTA: Bouton de call-to-action (ex: Contact) qui attire le curseur à proximité (calcul de distance mousemove, seuil 50px, force deltaX*0.2). Au hover, remplissage par flood: pseudo-élément ::after avec scaleY(0->1) et border-radius full. Courbe: power3.out.
FloodFillHover: Technique générique de hover button. Un ::after en absolute, bg accent, scaleY(0), transform-origin:bottom. Au :hover, scaleY(1) avec transition 0.4s cubic-bezier(0.25,1,0.5,1). Le texte passe en z-index supérieur et change de couleur.

## [LANDA.AS] - GEOMETRIC PHYSICALITY & EDITORIAL THEATER
ArcTransitionMask: Transition de section sous forme de portail géométrique. Un masque SVG ou clip-path:circle() s'élargit depuis le bas de l'écran pendant le scroll(scrub), dévoilant le chapitre suivant avec une couleur fortement contrastée (ex: Rouge sang vers Beige).
FullBleedColorInterlude: Sections narratives entières sur fond rouge saturé vibrant, servant de "chapitre" émotionnel entre les sections détaillées beige/crème. Typographie Serif Monumentale apparaissant lettre par lettre sur le scroll. Contraste maximal pour forcer l'attention.
RotationalTypographicRing: Élément de type "sceau" textuel (ex: "ENJOY YOUR STAY") entourant un bloc. Construit avec un SVG <textPath>. L'attribut startOffset du texte (ou la rotation du conteneur) est animé proportionnellement au défilement vertical via un transform:rotate() lié au scrub, créant de l'inertie rotative.
ScatteredEditorialHero: Destruction de l'alignement classique. Les lettres du logotype agissent comme des acteurs indépendants empilés au-dessus de l'image de couverture. Elles sont décalées (position:absolute, inclinaison subtile) et scrolent à des vitesses légèrement différentes pour un rendu "magazine déstructuré". Image centrale aux coins arrondis avec vignette douce.
CollageOverlapLayout: Variante du Scrapbook: images de tailles variées se chevauchent via absolute positioning et des marges négatives à l'intérieur d'un conteneur relatif. L'ensemble évoque un scan de magazine de luxe ou un tableau de liège d'architecte. Chaque image a un stagger d'entrée différent.
TripleColumnParallaxStagger: Affichage d'images HD en 3 colonnes. Entrée asynchrone (stagger:0.15) et parallaxe différentielle par colonne (ex: Col1 y:-15%, Col2 y:10%, Col3 y:-5%), donnant l'échelle de la grille sans la rendre rigide.
ConcaveTactileButtons: Boutons asymétriques poussant sur la physicalité. Au hover, au lieu d'un fill plat, utilisation combinée d'ombres internes (inset box-shadow transitionnées) et de filtres pour simuler une surface concave qui s'enfonce dans l'écran.
ZebraDynamicStrip: Bandeau diagonal texturé (rayures contrastées, ex: Rouge/Blanc) utilisé sporadiquement pour casser la verticalité/horizontalité. Se déplace latéralement (xPercent:-50) au défilement, servant de signal visuel brutal et luxueux pour les actions décisives (Shop/Booking).

## [METAMASK.IO] - CYBER-ORGANIC & WEB3 PRECISION
NormalizedGazeTracking: Un modèle 3D (ex: le renard) suit le curseur via une interpolation fluide (lerp) sur les axes X/Y. Une contrainte mathématique (clamp/normalization) empêche les déformations extrêmes, gardant l'objet ancré dans son espace physique virtuel.
SchematicGridOverlay: L'utilisation de lignes fines (1px) et de grilles répétées (repeating-linear-gradient) pour créer un fond "Blueprint/Plan d'architecte" dynamique. Un masque radial (mask-image) lié à la position de la souris peut révéler cette grille pour un effet lampe-torche technique.
BlockyTextStrokeReveal: Apparition de typographie agressive ("Maximum Security") où le texte commence par n'être qu'un contour fin (webkit-text-stroke: 1px) et transparent, avant de se remplir d'encre solide depuis le bas.

## [GLOBAL PREMIUM MICRO-POLISH] - OMITTED MASTER DETAILS
MediaCursorReveal: Survoler un lien texte ou un item de liste fait apparaitre une image absolue (pointer-events:none) qui suit la souris de manière fluide via gsap.quickTo(x,y). Le lien textuel devient une lentille vers le visuel.
HairlineArchitecture: L'abandon total des blocks avec background pour la structure. L'espace massif est seulement découpé par des lignes de 1px ultra-fines (border: 1px solid rgba(255,255,255,0.05)), séparant les vastes zones de contenu tel un plan d'architecte.
SoftGradientViewportMasking: Application de CSS mask-image: linear-gradient(to bottom, transparent, black 10%, black 90%, transparent) sur les listes ou conteneurs scrollables. Les éléments semblent se dissoudre dans l'airbag/le vide juste avant de toucher les bords physiques de l'écran. 
KineticSpringCursor: Remplacement du curseur pointeur natif (OS) par deux éléments SVG. Un point dur, et un grand cercle (stroke) qui traîne derrière avec un algorithme de "Spring Physics" (ease:elastic.out), donnant une sensation tactile et "liquide" à la simple exploration.
ScrubbableScrollVideo: Des séquences vidéos (souvent extraites en frames HD ou manipulant currentTime) qui ne jouent pas avec le temps, mais avec le défilement. Descendre avance la vidéo, remonter la rebobine, donnant le contrôle charnel à l'utilisateur.
InfiniteTickerMarquee: Bandeaux de typographie (ex: Nom de domaine / Métier) défilant horizontalement à l'infini (boucle GSAP ou CSS). L'astuce premium: la vitesse et le sens (reverse) réagissent dynamiquement à la vélocité et direction du scroll.
CuratedPreloaderSequence: Pas de spinner. Une séquence d'attente typographique (ex: compteurs massifs 0-100% ou animations de lignes vectorielles) liée au temps de calcul/chargement des grosses textures GL. À 100%, le loader glisse (yPercent:-100) avec une courbe power4.inOut, ouvrant le rideau sur un Hero déjà parfaitement rendu.

# 💻 EXHAUSTIVE SNIPPET LIBRARY (REACT + GSAP + FRAMER)
Base technique déduite des 7 sites référents. Strictement orientée composabilité IA.

## 1. TYPOGRAPHY KINETICS

### 1.1 Line Stagger Masking (Inversa / The Damai)
```jsx
// Révélation de texte massive par ligne (Bottom-Up)
import { useGSAP } from "@gsap/react";
import SplitType from "split-type";
useGSAP(() => {
  const split = new SplitType(".hero-txt", { types: "lines" });
  split.lines.forEach(l => gsap.set(l, { yPercent: 100 })); // Init
  split.lines.forEach(l => {
    const wrap = document.createElement("div"); wrap.style.overflow = "hidden";
    l.parentNode.insertBefore(wrap, l); wrap.appendChild(l);
  });
  gsap.to(split.lines, { yPercent: 0, stagger: 0.1, duration: 1.2, ease: "power4.out", scrollTrigger: ".hero-txt" });
});
```

### 1.2 Editorial Page Turn (Wright's Ferry)
```jsx
// Rotation X des caractères simulant une page de vieux livre
const EditorialReveal = () => {
  useGSAP(() => {
    const split = new SplitType(".serif-title", { types: "chars, words" });
    gsap.from(split.chars, { y: 30, rotateX: -60, opacity: 0, stagger: 0.02, duration: 1, ease: "back.out(1.2)" });
  });
  return <h1 className="serif-title italic">L'Élégance du Temps</h1>;
}
```

### 1.3 Fluid Velocity Marquee (Outpost)
```jsx
// Bandeau infini (Marquee) accélérant selon la force du scroll
useGSAP(() => {
  const loop = gsap.to(".marquee-inner", { xPercent: -50, duration: 10, ease: "none", repeat: -1 });
  ScrollTrigger.create({
    onUpdate: (self) => { // Multiplicateur de vélocité
      gsap.to(loop, { timeScale: 1 + Math.abs(self.getVelocity() / 100), overwrite: true });
      gsap.to(loop, { timeScale: 1, delay: 0.5, overwrite: "auto" }); // Reset à vitesse normale
    }
  });
});
```

### 1.4 Rotational Sceau Ring (Landa.as)
```jsx
// Anneau SVG tournant lié au scroll
// Layout: <svg viewBox="0 0 100 100"><path id="circle"/><text><textPath href="#circle">...</textPath>
useGSAP(() => {
  gsap.to(".text-ring", { rotation: 360, ease: "none", scrollTrigger: { scrub: 0.5 } });
});
```

## 2. SPATIAL & PARALLAX ENGINE

### 2.1 Differential Velocity Depth (The Damai)
```jsx
// Pseudo-3D : Typo lente en fond vs Image rapide au premier plan
useGSAP(() => {
  gsap.to(".bg-typo", { yPercent: -30, scrollTrigger: { trigger: ".wrap", scrub: true }});
  gsap.to(".fg-image", { yPercent: -120, scrollTrigger: { trigger: ".wrap", scrub: true }});
});
// HTML: <div class="wrap relative"><h2 class="bg-typo absolute z-0"/> <img class="fg-image z-10"/></div>
```

### 2.2 Asymmetric Triple Column Parallax (Landa.as)
```jsx
// Grille de 3 colonnes de photos défilant à vitesses opposées (Masonry destructuré)
useGSAP(() => {
  const tl = gsap.timeline({ scrollTrigger: { trigger: ".gallery", scrub: 0.5 }});
  tl.to(".col-1", { yPercent: -15 }, 0)
    .to(".col-2", { yPercent: 10 }, 0) // Contre-sens !
    .to(".col-3", { yPercent: -5 }, 0);
});
```

### 2.3 Atmospheric Ken Burns (The Damai / Inversa)
```css
/* Animation infinie CSS pour donner de la vie au fond héro */
@keyframes kenburns { 0% { transform: scale(1.1); filter: blur(10px); } 100% { transform: scale(1); filter: blur(0px); } }
.hero-bg-living { animation: kenburns 30s ease-out forwards; }
```

## 3. LAYOUT & MASKS

### 3.1 Elastic Folder Reveal (Outpost)
```jsx
// Le masque s'ouvre(clip-path/scale), l'image dé-zoome pour contrer
useGSAP(() => {
  const tl = gsap.timeline({ scrollTrigger: ".reveal-wrap" });
  tl.fromTo(".reveal-mask", { clipPath: "inset(100% 0 0 0)" }, { clipPath: "inset(0 0 0 0)", duration: 1.5, ease: "power4.inOut" })
    .fromTo(".reveal-img", { scale: 1.2 }, { scale: 1, duration: 1.5, ease: "power4.inOut" }, "<");
});
```

### 3.2 Arc Portal Transition (Landa.as)
```jsx
// Transition fluide entre deux sections: un cercle gigantesque lèche l'écran
useGSAP(() => {
  gsap.fromTo(".portal-mask", 
    { clipPath: "circle(0% at 50% 100%)" }, 
    { clipPath: "circle(150% at 50% 100%)", scrollTrigger: { trigger: ".next-section", scrub: true, start: "top bottom", end: "top center" }}
  );
});
```

## 4. CURSOR & PHYSICAL INTERACTION

### 4.1 Liquid Magnetic CTA (Outpost / Framer)
```jsx
// Bouton attiré par la souris avec physique à ressort (Framer Motion)
import { motion, useMotionValue } from "framer-motion";
const MagneticBtn = ({ children }) => {
  const x = useMotionValue(0); const y = useMotionValue(0);
  const handleMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - (rect.left + rect.width / 2));
    y.set(e.clientY - (rect.top + rect.height / 2));
  };
  return (
    <motion.button onMouseMove={handleMove} onMouseLeave={() => { x.set(0); y.set(0); }} 
      style={{ x, y }} transition={{ type: "spring", stiffness: 150, damping: 15 }}>
      {children}
    </motion.button>
  );
}
```

### 4.2 Lens Content Cursor (Global Polish)
```jsx
// Image absolue qui se téléporte au curseur sans latence
useGSAP(() => {
  const xTo = gsap.quickTo(".cursor-img", "x", { duration: 0.4, ease: "power3" });
  const yTo = gsap.quickTo(".cursor-img", "y", { duration: 0.4, ease: "power3" });
  window.addEventListener("mousemove", (e) => { xTo(e.clientX); yTo(e.clientY); });
});
// Requis: <img className="cursor-img fixed pointer-events-none -translate-x-1/2 -translate-y-1/2" />
```

### 4.3 Normalized Gaze Tracking (MetaMask)
```jsx
// Modèle 3D regardant le curseur (Moteur de rotation clamping)
useGSAP(() => {
  window.addEventListener("mousemove", (e) => {
    const nx = (e.clientX / window.innerWidth - 0.5) * 2; // de -1 à 1
    const ny = (e.clientY / window.innerHeight - 0.5) * 2;
    gsap.to(modelRef.current.rotation, { y: nx * 0.5, x: -ny * 0.5, duration: 0.8 });
  });
});
```

## 5. THEMATIC DOM SHIFTS

### 5.1 Scroll-Bound Color Interpolation (Leandra.ch)
```jsx
// Hack 0 coupure: Change le fond global (<section data-bg="#fff">)
useGSAP(() => {
  document.querySelectorAll("[data-bg]").forEach(sec => {
    ScrollTrigger.create({
      trigger: sec, start: "top 50%", end: "bottom 50%",
      onEnter: () => gsap.to("body", { backgroundColor: sec.dataset.bg }),
      onEnterBack: () => gsap.to("body", { backgroundColor: sec.dataset.bg })
    });
  });
});
```

### 5.2 Schematic Flashlight Grid (MetaMask)
```css
/* Plan d'architecte révélé uniquement par la lampe torche de la souris */
.web3-grid {
  background-image: linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px);
  background-size: 50px 50px;
  mask-image: radial-gradient(circle at var(--mouse-x) var(--mouse-y), black 0%, transparent 50%);
}
```

### 5.3 Blocky Stroke Reveal (MetaMask)
```jsx
// Apparition typographique Cypher (Stroke -> Fill)
useGSAP(() => {
  gsap.fromTo(".stroke-text", 
    { WebkitTextStroke: "1px rgba(255,255,255,0.2)", color: "transparent" },
    { WebkitTextStroke: "0px", color: "white", duration: 1.5, scrollTrigger: ".stroke-text" }
  );
});
```

## 6. ADVANCED EFFECTS

### 6.1 Character Scramble Glitch (Inversa)
```jsx
// Texte qui se décode comme un terminal ("XKBV" -> "HOME")
const useCharScramble = (ref, finalText, speed = 30) => {
  useEffect(() => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let iteration = 0;
    const interval = setInterval(() => {
      ref.current.innerText = finalText.split("").map((char, i) => {
        if (i < iteration) return finalText[i]; // Lettres déjà résolues
        return chars[Math.floor(Math.random() * chars.length)]; // Aléatoire
      }).join("");
      if (iteration >= finalText.length) clearInterval(interval);
      iteration += 1 / 3; // Vitesse de résolution
    }, speed);
    return () => clearInterval(interval);
  }, [finalText]);
};
```

### 6.2 Horizontal Pinned Scroll (Inversa)
```jsx
// Section pin qui transforme le scroll vertical en défilement horizontal
useGSAP(() => {
  const slides = gsap.utils.toArray(".h-slide");
  gsap.to(slides, {
    xPercent: -100 * (slides.length - 1),
    ease: "none",
    scrollTrigger: {
      trigger: ".h-container", pin: true, scrub: 1,
      end: () => "+="  + document.querySelector(".h-container").offsetWidth
    }
  });
});
// HTML: <div class="h-container flex w-[300vw]"><div class="h-slide w-screen"/><div class="h-slide w-screen"/>...
```

### 6.3 SVG Path Drawing (Inversa / Blueprint)
```jsx
// Tracé vectoriel qui se dessine au scroll (Blueprint scan)
useGSAP(() => {
  document.querySelectorAll(".draw-path").forEach(path => {
    const length = path.getTotalLength();
    gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
    gsap.to(path, { strokeDashoffset: 0, scrollTrigger: { trigger: path, scrub: true }});
  });
});
```

### 6.4 Scrapbook 4-Layer Stack (Wright's Ferry)
```jsx
// Structure de section "Musée" multi-couche
const ScrapbookSection = ({ texture, accentColor, image, title }) => (
  <section className="relative min-h-screen py-[15vh] overflow-hidden">
    {/* Layer 0: Texture de fond (parallaxe lent) */}
    <div className="layer-texture absolute inset-0 opacity-[0.06] bg-cover" style={{backgroundImage:`url(${texture})`}} />
    {/* Layer 1: Bloc d'accent coloré */}
    <div className="absolute w-[40vw] h-[60vh] left-[10%] top-[20%]" style={{backgroundColor:accentColor}} />
    {/* Layer 2: Image principale */}
    <img className="relative z-10 w-[50vw] ml-auto" src={image} />
    {/* Layer 3: Titre superposé */}
    <h2 className="absolute z-20 top-1/2 left-[5%] text-[8vw] font-serif italic">{title}</h2>
  </section>
);
// + GSAP: gsap.to(".layer-texture", { y: -50, scrollTrigger: { scrub: 0.2 } });
```

### 6.5 Concave Tactile Button (Landa.as)
```css
/* Bouton qui s'enfonce physiquement au survol */
.btn-concave {
  position: relative; border-radius: 999px; padding: 1rem 2.5rem;
  background: var(--accent); transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15), inset 0 -2px 4px rgba(0,0,0,0.05);
}
.btn-concave:hover {
  box-shadow: 0 1px 4px rgba(0,0,0,0.1), inset 0 3px 8px rgba(0,0,0,0.2);
  transform: translateY(2px); /* Enfoncement physique */
}
```

### 6.6 Directional Underline Link (Wright's Ferry)
```css
/* Soulignement qui balaye de droite à gauche au hover */
.fancy-link { position: relative; display: inline-block; }
.fancy-link::after {
  content: ''; position: absolute; bottom: 0; left: 0; width: 100%; height: 1px;
  background: currentColor; transform: scaleX(0); transform-origin: right;
  transition: transform 0.5s cubic-bezier(0.25, 1, 0.5, 1);
}
.fancy-link:hover::after { transform: scaleX(1); transform-origin: left; }
```

### 6.7 Cinematic Preloader (Inversa)
```jsx
// Preloader avec compteur massif 0-100% puis rideau
const Preloader = ({ onComplete }) => {
  const [pct, setPct] = useState(0);
  useGSAP(() => {
    gsap.to({ val: 0 }, { val: 100, duration: 2.5, ease: "power2.inOut",
      onUpdate: function() { setPct(Math.round(this.targets()[0].val)); },
      onComplete: () => {
        gsap.to(".preloader", { yPercent: -100, duration: 0.8, ease: "power4.inOut", onComplete });
      }
    });
  });
  return <div className="preloader fixed inset-0 z-50 bg-black flex items-center justify-center">
    <span className="text-[20vw] font-mono text-white">{pct}%</span>
  </div>;
};
```

### 6.8 Spring Physics Cursor (Global Polish)
```jsx
// Double curseur SVG avec physique élastique("trailing circle")
const SpringCursor = () => {
  useGSAP(() => {
    const dot = document.querySelector(".cursor-dot");
    const ring = document.querySelector(".cursor-ring");
    const xDot = gsap.quickTo(dot, "x", { duration: 0.1 });
    const yDot = gsap.quickTo(dot, "y", { duration: 0.1 });
    const xRing = gsap.quickTo(ring, "x", { duration: 0.6, ease: "elastic.out(1, 0.3)" });
    const yRing = gsap.quickTo(ring, "y", { duration: 0.6, ease: "elastic.out(1, 0.3)" });
    window.addEventListener("mousemove", (e) => {
      xDot(e.clientX); yDot(e.clientY); xRing(e.clientX); yRing(e.clientY);
    });
  });
  return <>
    <div className="cursor-dot fixed w-2 h-2 bg-white rounded-full pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2" />
    <div className="cursor-ring fixed w-10 h-10 border border-white/50 rounded-full pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2" />
  </>;
};
```

### 6.9 Full Screen Menu Overlay (Inversa)
```jsx
// Menu rideau plein écran avec stagger des liens
const MenuOverlay = ({ isOpen, links }) => (
  <motion.nav initial={{ clipPath: "circle(0% at 95% 5%)" }}
    animate={{ clipPath: isOpen ? "circle(150% at 95% 5%)" : "circle(0% at 95% 5%)" }}
    transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
    className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center">
    {links.map((link, i) => (
      <motion.a key={i} initial={{ y: 80, opacity: 0 }}
        animate={{ y: isOpen ? 0 : 80, opacity: isOpen ? 1 : 0 }}
        transition={{ delay: isOpen ? 0.3 + i * 0.1 : 0, duration: 0.6 }}
        className="text-[8vw] text-white font-serif">{link}</motion.a>
    ))}
  </motion.nav>
);
```

### 6.10 Flood Fill Button Hover (Outpost)
```css
/* Remplissage liquide du bouton par pseudo-élément */
.btn-flood { position: relative; overflow: hidden; z-index: 1; }
.btn-flood::after {
  content: ''; position: absolute; inset: 0; z-index: -1;
  background: var(--accent); transform: scaleY(0); transform-origin: bottom;
  transition: transform 0.5s cubic-bezier(0.25, 1, 0.5, 1);
}
.btn-flood:hover::after { transform: scaleY(1); }
.btn-flood:hover { color: white; }
```

### 6.11 Pinned Sticky Image Grow (The Damai)
```jsx
// Image sticky qui grandit d'un cadre central vers full w quand on défile
useGSAP(() => {
  gsap.fromTo(".sticky-img",
    { clipPath: "inset(20% 30%)" },  // Cadre central
    { clipPath: "inset(0% 0%)", scrollTrigger: { trigger: ".sticky-section", start: "top top", end: "bottom bottom", scrub: true, pin: ".sticky-img" }}
  );
});
```

### 6.12 Atmospheric Grain Overlay (Leandra.ch)
```css
/* Texture de bruit permanente sur tout le site */
.grain-overlay::after {
  content: ''; position: fixed; inset: 0; z-index: 9998; pointer-events: none;
  opacity: 0.04; mix-blend-mode: overlay;
  background: url('/noise.png') repeat; /* ou SVG filter feTurbulence */
}
```

### 6.13 Viewport Edge Dissolve (Global Polish)
```css
/* Dissolution douce des éléments aux bords du viewport */
.edge-dissolve {
  mask-image: linear-gradient(to bottom, transparent, black 10%, black 90%, transparent);
  -webkit-mask-image: linear-gradient(to bottom, transparent, black 10%, black 90%, transparent);
}
```

## 7. REUSABLE HOOKS (Composabilité maximale pour l'Agent)

### 7.1 useScrollReveal — Hook universel d'entrée au scroll
```jsx
// S'applique à TOUT élément qui doit apparaitre au scroll. Remplace les IntersectionObserver manuels.
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
const useScrollReveal = (options = {}) => {
  const ref = useRef(null);
  const { y = 40, opacity = 0, duration = 1, ease = "power4.out", start = "top 85%", delay = 0 } = options;
  useGSAP(() => {
    if (!ref.current) return;
    gsap.from(ref.current, { y, opacity, duration, ease, delay, scrollTrigger: { trigger: ref.current, start, once: true }});
  });
  return ref;
};
// Usage: const ref = useScrollReveal({ y: 60, delay: 0.2 }); <div ref={ref}>...</div>
```

### 7.2 useParallax — Hook de parallaxe configurable
```jsx
// Applique un décalage vertical proportionnel au scroll sur n'importe quel élément.
const useParallax = (speed = -20) => {
  const ref = useRef(null);
  useGSAP(() => {
    if (!ref.current) return;
    gsap.to(ref.current, { yPercent: speed, ease: "none", scrollTrigger: { trigger: ref.current, scrub: 0.5 }});
  });
  return ref;
};
// Usage: const imgRef = useParallax(-30); <img ref={imgRef} />
```

### 7.3 useLenis — Smooth Scroll global (Leandra.ch)
```jsx
// Initialisation globale de Lenis pour le smooth scroll haute inertie.
// À appeler UNE SEULE FOIS dans le layout principal (App.jsx ou Layout.jsx)
import Lenis from "@studio-freight/lenis";
const useLenis = () => {
  useEffect(() => {
    const lenis = new Lenis({ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
    // Sync avec GSAP ScrollTrigger
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
    return () => lenis.destroy();
  }, []);
};
```

### 7.4 useResponsiveAnimation — Guard Mobile
```jsx
// Wrapper conditionnel: n'exécute l'animation que sur Desktop (>1024px)
const useDesktopOnly = (animationFn) => {
  useGSAP(() => {
    if (window.innerWidth < 1024) return; // Mobile: RIEN ne s'exécute
    animationFn();
  });
};
// Usage: useDesktopOnly(() => { gsap.to(".parallax", { yPercent: -50, scrollTrigger: { scrub: true }}); });
```

## 8. MISSING PATTERN SNIPPETS

### 8.1 Neon Stack Carousel (Inversa)
```jsx
// Carousel de citations par empilement (slide courante scale down, suivante monte)
useGSAP(() => {
  const slides = gsap.utils.toArray(".stack-slide");
  slides.forEach((slide, i) => {
    if (i === 0) return;
    ScrollTrigger.create({
      trigger: slide, start: "top bottom", end: "top top",
      onEnter: () => {
        gsap.to(slides[i - 1], { scale: 0.9, opacity: 0.3, duration: 0.6 });
        gsap.fromTo(slide, { yPercent: 100 }, { yPercent: 0, duration: 0.8, ease: "power4.out" });
      }
    });
  });
});
```

### 8.2 Footer Curtain Reveal (The Damai / Inversa)
```jsx
// Footer fixé sous le contenu qui se dévoile naturellement
// CSS: .footer-reveal { position: fixed; bottom: 0; z-index: -1; width: 100%; }
// CSS: .main-content { position: relative; z-index: 1; margin-bottom: 100vh; }
// Aucun JS nécessaire. Le main scroll par-dessus puis disparaît, révélant le footer.
// Pour un GSAP polish: ajouter un scale(0.95) sur le footer qui passe à scale(1) au reveal.
useGSAP(() => {
  gsap.fromTo(".footer-reveal", { scale: 0.95 }, { scale: 1, scrollTrigger: { trigger: ".main-content", start: "bottom bottom", scrub: true }});
});
```

### 8.3 Scrubbable Scroll Video (Global Polish)
```jsx
// Vidéo HTML5 controllée par le scroll (avance/recule)
useGSAP(() => {
  const video = document.querySelector(".scroll-video");
  video.pause();
  ScrollTrigger.create({
    trigger: ".video-section", start: "top top", end: "bottom bottom", scrub: 0.5,
    onUpdate: (self) => {
      if (video.duration) video.currentTime = video.duration * self.progress;
    }
  });
});
// HTML: <section class="video-section h-[300vh]"><video class="scroll-video sticky top-0 w-full h-screen object-cover" src="..." muted />
```

### 8.4 Negative Parallax Overlap (Leandra.ch)
```jsx
// Typographie massive qui chevauche une image avec profondeur
const OverlapSection = () => {
  const textRef = useParallax(-15); // Texte: parallaxe léger
  const imgRef = useParallax(-40);  // Image: parallaxe fort (plus lent visuellement)
  return (
    <div className="relative h-[120vh]">
      <img ref={imgRef} className="absolute w-[60vw] top-[10vh] left-[20%]" src="..." />
      <h2 ref={textRef} className="absolute z-10 text-[12vw] font-serif -bottom-[5vh] left-[5%]" style={{marginTop:"-8vh"}}>
        Savoir-Faire
      </h2>
    </div>
  );
};
```

### 8.5 Sticky StoryTelling Column (Leandra.ch / Wrights)
```jsx
// Image sticky à gauche, texte qui défile à droite
const StickyStory = ({ image, paragraphs }) => (
  <section className="flex min-h-[200vh]">
    <div className="w-1/2 sticky top-[10vh] h-[80vh] self-start">
      <img className="w-full h-full object-cover" src={image} />
    </div>
    <div className="w-1/2 py-[20vh] px-[5vw] space-y-[10vh]">
      {paragraphs.map((p, i) => <p key={i} className="text-lg leading-relaxed">{p}</p>)}
    </div>
  </section>
);
```

### 8.6 Progress Scrubber Bar (Inversa)
```jsx
// Barre verticale de progression liée à la section active
useGSAP(() => {
  gsap.to(".progress-fill", {
    scaleY: 1, transformOrigin: "top",
    scrollTrigger: { trigger: ".tracked-section", start: "top top", end: "bottom bottom", scrub: true }
  });
});
// HTML: <div class="progress-bar fixed right-4 top-1/4 w-[2px] h-1/2 bg-white/20">
//         <div class="progress-fill w-full h-full bg-white" style="transform: scaleY(0)"></div></div>
```

### 8.7 Zebra Animated Strip (Landa.as)
```css
/* Bandeau rayé diagonal qui se déplace latéralement au scroll */
.zebra-strip {
  background: repeating-linear-gradient(45deg, var(--accent) 0px, var(--accent) 20px, white 20px, white 40px);
  height: 80px; width: 200%; /* Déborde volontairement */
  animation: zebra-slide 8s linear infinite;
}
@keyframes zebra-slide { to { transform: translateX(-50%); } }
/* Pour lier au scroll: remplacer l'animation CSS par gsap.to(".zebra-strip", { xPercent: -50, scrollTrigger: { scrub: true }}); */
```

### 8.8 Collage Overlap Layout (Landa.as)
```jsx
// Composition magazine de luxe avec images chevauchantes
const CollageLayout = ({ images }) => (
  <section className="relative h-[120vh] overflow-hidden">
    {images.map((img, i) => (
      <img key={i} src={img.src} className="absolute object-cover"
        style={{
          width: img.w || "35vw", height: img.h || "45vh",
          top: img.top || `${20 + i * 15}%`, left: img.left || `${10 + i * 25}%`,
          zIndex: i, transform: `rotate(${img.rot || (i % 2 ? 3 : -2)}deg)`
        }} />
    ))}
  </section>
);
// GSAP: Ajouter un stagger d'entrée différent par image et un scrub de parallaxe par z-index.
```

# 🌊 9. SCROLL TRANSITION & TEXT ANIMATION MEGA-LIBRARY
Bibliothèque exhaustive de transitions visuelles au scroll. Chaque animation porte un NOM TECHNIQUE pour faciliter la communication. Classement par catégorie.

## CAT.A — TEXT REVEALS (15 Variantes)

### A.01 MaskSlideUp — La Base Premium (Inversa/Damai)
```jsx
// Chaque ligne monte depuis derrière un masque overflow:hidden
useGSAP(() => {
  const split = new SplitType(".a01", { types: "lines" });
  split.lines.forEach(l => { const w = document.createElement("div"); w.style.overflow = "hidden"; l.parentNode.insertBefore(w, l); w.appendChild(l); });
  gsap.from(split.lines, { yPercent: 100, stagger: 0.08, duration: 1.2, ease: "power4.out", scrollTrigger: { trigger: ".a01", start: "top 80%" }});
});
```

### A.02 BlurFadeIn — L'Effet Cinéma (Damai Hero)
```jsx
// Le texte apparaît en se défloutant et en montant légèrement
gsap.from(".a02", { filter: "blur(12px)", opacity: 0, y: 30, duration: 1.5, ease: "expo.out", scrollTrigger: ".a02" });
```

### A.03 CharCascade — La Pluie de Caractères (Landa)
```jsx
// Chaque lettre tombe indépendamment avec un timing aléatoire
const split = new SplitType(".a03", { types: "chars" });
gsap.from(split.chars, { y: -80, opacity: 0, rotateZ: () => gsap.utils.random(-15, 15),
  stagger: { each: 0.03, from: "random" }, duration: 0.8, ease: "back.out(1.7)", scrollTrigger: ".a03" });
```

### A.04 WordByWordFade — Le Narratif (Wrights)
```jsx
// Les mots apparaissent un à un, comme lus à voix haute
const split = new SplitType(".a04", { types: "words" });
gsap.from(split.words, { opacity: 0, y: 15, stagger: 0.05, duration: 0.6, ease: "power2.out", scrollTrigger: ".a04" });
```

### A.05 LetterSpacingCrush — La Compression Typographique (Outpost)
```jsx
// Le texte commence super espacé puis se compresse en place
gsap.from(".a05", { letterSpacing: "0.5em", opacity: 0, duration: 1.8, ease: "power4.inOut", scrollTrigger: ".a05" });
```

### A.06 TypewriterCursor — La Machine à Écrire
```jsx
// Frappe lettre par lettre avec curseur clignotant (Framer Motion)
import { motion } from "framer-motion";
const Typewriter = ({ text }) => (
  <span>{text.split("").map((c, i) => (
    <motion.span key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      transition={{ delay: i * 0.05 }}>{c}</motion.span>
  ))}<motion.span animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }}>|</motion.span></span>
);
```

### A.07 GradientWipe — Le Reveal par Dégradé
```jsx
// Le texte se dévoile via un gradient-mask qui balaye de gauche à droite
gsap.fromTo(".a07", 
  { backgroundImage: "linear-gradient(90deg, #000 0%, transparent 0%)", WebkitBackgroundClip: "text", color: "transparent" },
  { backgroundImage: "linear-gradient(90deg, #000 100%, transparent 100%)", duration: 1.5, ease: "power2.inOut", scrollTrigger: ".a07" }
);
// Alternative CSS: mask-image avec animation de position
```

### A.08 ZAxisPerspective — Le Texte qui Vient Vers Toi
```jsx
// Le texte arrive depuis une profondeur 3D (z-axis) comme s'il fonçait vers l'écran
gsap.from(".a08", { z: -500, opacity: 0, rotateX: 30, transformPerspective: 800,
  duration: 1.5, ease: "expo.out", scrollTrigger: ".a08" });
```

### A.09 ElasticBounceWords — Le Rebond Ludique
```jsx
// Chaque mot rebondit en arrivant (elastic overshoot)
const split = new SplitType(".a09", { types: "words" });
gsap.from(split.words, { y: 60, opacity: 0, stagger: 0.06, duration: 1, ease: "elastic.out(1, 0.5)", scrollTrigger: ".a09" });
```

### A.10 DiagonalSlashReveal — La Tranche Oblique
```jsx
// Le texte se révèle via un clip-path diagonal animé
gsap.fromTo(".a10",
  { clipPath: "polygon(0 0, 0 0, 0 100%, 0 100%)" },
  { clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)", duration: 1.2, ease: "power4.inOut", scrollTrigger: ".a10" }
);
```

### A.11 CounterRollUp — Le Compteur Animé (Inversa)
```jsx
// Nombre qui roule de 0 à la valeur cible
const CounterRoll = ({ target }) => {
  const ref = useRef(null);
  useGSAP(() => {
    gsap.to({ val: 0 }, { val: target, duration: 2, ease: "power2.out", scrollTrigger: ref.current,
      onUpdate: function() { ref.current.textContent = Math.round(this.targets()[0].val); }
    });
  });
  return <span ref={ref}>0</span>;
};
```

### A.12 ScaleFromGiant — Le Zoom Arrière (Outpost Macro)
```jsx
// Texte initialement gigantesque (scale:3) qui zoom out vers sa taille normale
gsap.from(".a12", { scale: 3, opacity: 0, duration: 1.5, ease: "power4.out", scrollTrigger: { trigger: ".a12", start: "top 90%" }});
```

### A.13 SkewDistortion — L'Entrée Biaisée
```jsx
// Le texte arrive avec un skew qui se remet à plat
gsap.from(".a13", { skewX: 15, skewY: 3, x: -50, opacity: 0, duration: 1, ease: "power3.out", scrollTrigger: ".a13" });
```

### A.14 ColorSweepFill — Le Remplissage de Couleur
```jsx
// Le texte se remplit de couleur comme un tube de peinture (gauche -> droite)
gsap.fromTo(".a14",
  { backgroundSize: "0% 100%" },
  { backgroundSize: "100% 100%", duration: 1.2, ease: "power2.inOut", scrollTrigger: ".a14" }
);
// CSS requis: .a14 { background: linear-gradient(90deg, var(--accent) 50%, currentColor 50%); background-clip: text; -webkit-background-clip: text; color: transparent; background-repeat: no-repeat; }
```

### A.15 FlipCardReveal — Le Retournement 3D
```jsx
// Le mot se retourne sur l'axe Y comme une carte
const split = new SplitType(".a15", { types: "chars" });
gsap.from(split.chars, { rotateY: 90, opacity: 0, stagger: 0.03, duration: 0.8,
  ease: "power3.out", transformPerspective: 600, scrollTrigger: ".a15" });
```

## CAT.B — SECTION TRANSITIONS (10 Variantes)

### B.01 CirclePortal — Le Portail Circulaire (Landa)
```jsx
// Une section se dévoile par un cercle grandissant depuis le bas
gsap.fromTo(".b01-next", { clipPath: "circle(0% at 50% 100%)" },
  { clipPath: "circle(150% at 50% 100%)", scrollTrigger: { trigger: ".b01-trigger", scrub: true, start: "top bottom", end: "top 20%" }});
```

### B.02 DiagonalWipe — La Tranche Diagonale
```jsx
// Transition oblique qui "coupe" la section courante
gsap.fromTo(".b02-next",
  { clipPath: "polygon(100% 0, 100% 0, 100% 100%, 100% 100%)" },
  { clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)", scrollTrigger: { trigger: ".b02-trigger", scrub: true }});
```

### B.03 CurtainSplit — Le Rideau Théâtral
```jsx
// Deux moitiés s'écartent comme un rideau (gauche et droite)
const tl = gsap.timeline({ scrollTrigger: { trigger: ".b03-trigger", scrub: true }});
tl.to(".b03-left", { xPercent: -100 }, 0).to(".b03-right", { xPercent: 100 }, 0);
// HTML: <div class="b03-left absolute left-0 w-1/2 h-full bg-black"/> <div class="b03-right absolute right-0 w-1/2 h-full bg-black"/>
```

### B.04 ScaleAway — L'Éloignement en Profondeur
```jsx
// La section courante rétrécit et s'estompe, la suivante apparaît dessous
gsap.to(".b04-current", { scale: 0.85, opacity: 0, filter: "blur(8px)",
  scrollTrigger: { trigger: ".b04-current", start: "center center", end: "bottom top", scrub: true, pin: true }});
```

### B.05 HorizontalSlide — Le Glissement Latéral
```jsx
// La section suivante pousse la courante vers la gauche
gsap.fromTo(".b05-next", { xPercent: 100 }, { xPercent: 0,
  scrollTrigger: { trigger: ".b05-trigger", scrub: true, pin: true }});
```

### B.06 VerticalAccordionFold — Le Pliage
```jsx
// La section se replie sur elle-même (perspective 3D)
gsap.to(".b06-current", { rotateX: -90, transformOrigin: "top center", transformPerspective: 1000, opacity: 0,
  scrollTrigger: { trigger: ".b06-current", start: "top top", end: "bottom top", scrub: true }});
```

### B.07 FadeThoughColor — Le Fondu par Couleur
```jsx
// Un écran de couleur solide apparaît brièvement entre deux sections
const tl = gsap.timeline({ scrollTrigger: { trigger: ".b07-trigger", scrub: true, start: "top center", end: "bottom center" }});
tl.to(".b07-overlay", { opacity: 1, duration: 0.5 })
  .to(".b07-overlay", { opacity: 0, duration: 0.5 });
// CSS: .b07-overlay { position: fixed; inset: 0; background: black; opacity: 0; pointer-events: none; z-index: 50; }
```

### B.08 DiamondExpand — L'Expansion Losange
```jsx
// La prochaine section se révèle par un losange/diamant grandissant
gsap.fromTo(".b08-next",
  { clipPath: "polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)" },
  { clipPath: "polygon(50% -50%, 150% 50%, 50% 150%, -50% 50%)", scrollTrigger: { trigger: ".b08-trigger", scrub: true }});
```

### B.09 InsetFrameShrink — Le Cadre qui Rétrécit
```jsx
// La section suivante est masquée par un inset qui s'ouvre vers l'extérieur
gsap.fromTo(".b09-next",
  { clipPath: "inset(40% 40% 40% 40% round 2rem)" },
  { clipPath: "inset(0% 0% 0% 0% round 0rem)", scrollTrigger: { trigger: ".b09-trigger", scrub: true }});
```

### B.10 PixelDissolve — La Dissolution Pixelisée
```css
/* Transition SVG filter basée sur le déplacement de pixels */
.pixel-dissolve { filter: url(#dissolve); transition: filter 0.8s; }
/* SVG à inclure: <filter id="dissolve"><feTurbulence baseFrequency="0.03"/><feDisplacementMap in="SourceGraphic" scale="100"/></filter> */
/* GSAP: Animer le 'scale' du feDisplacementMap de 0 à 200 au scroll */
```

### B.11 Pinned Scrollytelling Sequence — L'Expérience Cinématique
```jsx
// La section se fige (Pin) et l'utilisateur scrolle pour déclencher une série d'animations séquencées au lieu de faire défiler la page.
const tl = gsap.timeline({
    scrollTrigger: {
        trigger: ".b11-container",
        start: "top top",
        end: "+=300%", // La durée (en hauteur d'écran) de la séquence
        pin: true,
        scrub: 1.5, // Lissage vital pour le Scrollytelling
    }
});
// Step 1: Arrive et repart
tl.to(".b11-step1", { opacity: 1, duration: 1 })
  .to({}, { duration: 0.5 }) // Pause
  .to(".b11-step1", { scale: 1.5, opacity: 0, filter: "blur(20px)", duration: 1 })
// Step 2: Prend le relais
  .to(".b11-step2", { opacity: 1, y: 0, duration: 1 }, "-=0.5")
  .to({}, { duration: 0.5 })
  .to(".b11-step2", { opacity: 0, y: -50, duration: 1 });
// Requis: Les steps (b11-step1, b11-step2) doivent être en "position: absolute" empilés au centre du conteneur.
```

## CAT.C — SCROLL INTERSECTION EFFECTS (10 Variantes)

### C.01 StaggerFanDeck — L'Éventail de Cartes
```jsx
// Les cartes apparaissent en éventail avec rotation
gsap.from(".c01-card", { y: 100, opacity: 0, rotateZ: (i) => (i - 2) * 5, scale: 0.9,
  stagger: 0.1, duration: 1, ease: "power4.out", scrollTrigger: { trigger: ".c01-grid", start: "top 75%" }});
```

### C.02 ZigzagStagger — L'Entrée en Zigzag
```jsx
// Les éléments arrivent alternativement de gauche et droite
gsap.from(".c02-item", { x: (i) => i % 2 === 0 ? -100 : 100, opacity: 0,
  stagger: 0.08, duration: 0.8, ease: "power3.out", scrollTrigger: ".c02-wrap" });
```

### C.03 BlurToFocus — Du Flou au Net
```jsx
// L'élément passe de totalement flou à parfaitement net (effet de mise au point caméra)
gsap.from(".c03", { filter: "blur(20px)", opacity: 0, scale: 1.1,
  duration: 1.2, ease: "power2.out", scrollTrigger: ".c03" });
```

### C.04 Flip3DEntry — L'Entrée par Rotation 3D
```jsx
// L'élément se retourne depuis l'arrière (comme une porte)
gsap.from(".c04", { rotateY: -90, opacity: 0, transformOrigin: "left center", transformPerspective: 1000,
  duration: 1, ease: "power4.out", scrollTrigger: ".c04" });
```

### C.05 ScaleSpringPop — L'Apparition Élastique
```jsx
// L'élément pop depuis scale:0 avec un rebond élastique
gsap.from(".c05", { scale: 0, opacity: 0, duration: 1, ease: "elastic.out(1, 0.4)", scrollTrigger: ".c05" });
```

### C.06 DrawBorder — La Bordure qui se Dessine
```jsx
// Un cadre se dessine autour de l'élément au scroll
gsap.fromTo(".c06-border", { strokeDashoffset: 1000, strokeDasharray: 1000 },
  { strokeDashoffset: 0, duration: 1.5, ease: "power2.inOut", scrollTrigger: ".c06-border" });
// SVG: <rect class="c06-border" fill="none" stroke="white" stroke-width="1" width="100%" height="100%"/>
```

### C.07 MorphClipShape — La Transformation de Forme
```jsx
// L'image change de forme (cercle -> rectangle) à l'intersection
gsap.fromTo(".c07",
  { clipPath: "circle(30% at 50% 50%)" },
  { clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)", duration: 1.2, ease: "power4.inOut", scrollTrigger: ".c07" });
```

### C.08 ParallaxSkewCards — L'Inclinaison Dynamique
```jsx
// Les cartes se penchent légèrement selon la vélocité du scroll
ScrollTrigger.create({
  onUpdate: (self) => {
    const skew = Math.min(Math.max(self.getVelocity() / -300, -10), 10);
    gsap.to(".c08-card", { skewY: skew, duration: 0.3, ease: "power3.out" });
  }
});
// Reset au repos: gsap.to(".c08-card", { skewY: 0, delay: 0.5 });
```

### C.09 CounterRotateEntry — L'Entrée Tourbillonnante
```jsx
// L'élément arrive en tournant puis se stabilise (premium pour icons/logos)
gsap.from(".c09", { rotation: 180, scale: 0.5, opacity: 0, duration: 1, ease: "back.out(1.4)", scrollTrigger: ".c09" });
```

### C.10 SplitScreenWipe — L'Apparition en Split
```jsx
// L'image se révèle par deux moitiés qui s'ouvrent (haut et bas)
const tl = gsap.timeline({ scrollTrigger: { trigger: ".c10-wrap", start: "top 70%" }});
tl.fromTo(".c10-top", { yPercent: 0 }, { yPercent: -100, duration: 0.8, ease: "power4.inOut" })
  .fromTo(".c10-bottom", { yPercent: 0 }, { yPercent: 100, duration: 0.8, ease: "power4.inOut" }, "<");
// HTML: Deux div overlay couvrant chacun 50% de l'image (position:absolute top:0 h-1/2 et bottom:0 h-1/2)
```

## CAT.D — COMPOSITION MATRIX (Comment Combiner)
Chaque ligne est une recette de combinaison testée et équilibrée. Format: [TextReveal] + [SectionTransition] + [IntersectionFx] = Résultat.
MaskSlideUp + CirclePortal + BlurToFocus = MUSEUM CLASSIQUE (Leandra/Wrights). Sobre, élégant, zéro fatigue visuelle.
CharCascade + DiagonalWipe + StaggerFanDeck = EDITORIAL DYNAMIQUE (Landa). Énergique, théâtral, fort contraste.
BlurFadeIn + ScaleAway + ParallaxSkewCards = CINEMATIC IMMERSIF (Damai/Inversa). Profondeur 3D, narration lente.
LetterSpacingCrush + FadeThoughColor + ScaleSpringPop = TECH MINIMAL (Outpost/MetaMask). Nerveux, géométrique, moderne.
TypewriterCursor + InsetFrameShrink + ZigzagStagger = VINTAGE EDITORIAL (Wrights). Nostalgique, texturé, artisanal.
ZAxisPerspective + DiamondExpand + Flip3DEntry = AVANT-GARDE EXPÉRIMENTAL. Maximum de 3D, réservé aux pages de présentation courtes.
GradientWipe + HorizontalSlide + DrawBorder = PORTFOLIO CRÉATIF. Clean, dynamique, professionnel.

# 📐 10. RESPONSIVE ARCHITECTURE & COMPONENT HUGGING (Shrink-Wrap Logic)
Règles de construction structurelles pour garantir un rendu fluide sur 100% des Breakpoints (façon Apple/Linear), en évitant la compression de contenu (Squishing) et les vides structurels (Ghost Columns).

## 10.1 The Anti-Squish Rule (Proscrire les pourcentages enfants)
Ne JAMAIS utiliser de largeur relative fixe (ex: `md:w-1/2` ou `md:w-[50%]`) sur un conteneur qui risque de devenir l'enfant d'une grille CSS parente aux breakpoints supérieurs (`lg`).
Si le parent passe d'un affichage pleine-page à une vue "Colonne étroite" (ex: 500px), l'enfant demandera 50% de ces 500px, aboutissant à un écrasement illisible (250px) et ruinant l'UI.
**Solution Premium (Clamping) :** Utiliser des dimensions maximales absolues.
```jsx
// ❌ MAUVAIS : Crash visuel garanti sur la transition Laptop
<div className="w-full md:w-[calc(50%+1rem)]">

// ✅ PARFAIT : Mobile fluide 100%, stoppé et verrouillé à une taille ergonomique parfaite sur Desktop, peu importe la largeur de la colonne parente.
<div className="w-full md:max-w-[400px]">
```

## 10.2 Dynamic Shrink-Wrap Engine (L'Art d'Epouser l'UI)
Lors du développement de composants "Conditionnels" (ex: des cartes de choix où une option peut ne pas s'afficher), conserver un moteur Grid vide crée des trous béants sur l'écran. L'arrière-plan du module étire le vide.
**Solution Premium :** Switcher dynamiquement le moteur de Layout (`Grid` -> `Flex`).
```jsx
// Enveloppe globale : On clamp si on a une seule option pour ne pas étirer l'écran.
<div className={`card-background ${!hasMultiOptions ? 'w-full md:max-w-[400px]' : ''}`}>
  
  {/* Switch du Moteur : Grille si tout est là, Flex exclusif si un seul */}
  <div className={hasMultiOptions ? 'grid sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4' : 'flex flex-col'}>
     <CardOptionA />
     {hasMultiOptions && <CardOptionB />}
  </div>

</div>
```
**Résultat :** Le conteneur "Background" va s'écraser physiquement sur le composant solitaire (shrink-wrap/hugging). Le rendu restera massif et intentionnel, validant l'expérience premium.
