import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';
import { Hammer, Menu, X, ArrowRight, Instagram, ArrowDown, Star, Zap, Plus, Minus } from 'lucide-react';
import StackedCards from '../components/StackedCards'; // New Import

// Lazy Load Three.js to improve initial bundle size
const ThreeBackground = React.lazy(() => import('../components/ThreeBackground'));
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';

// --- COMPOSANT : REVEAL TEXT (CORRIGÉ & ÉLARGI) ---
const RevealText = ({ text, className, delay = 0 }) => {
  return (
    <span className={`block overflow-hidden w-fit pb-[0.2em] pr-6 -mr-6 md:pr-32 md:-mr-32 whitespace-nowrap ${className}`}>
      <span
        className="reveal-inner inline-block translate-y-[110%] will-change-transform"
        data-delay={delay}
      >
        {text}
      </span>
    </span>
  );
};

// --- COMPOSANT : ROTATING SYMBOL (HEADER) ---
const RotatingSymbol = ({ className, size = 120, text = "TOUS À TABLE • 2024 •" }) => {
  return (
    <div className={`relative flex items-center justify-center pointer-events-none select-none ${className}`}>
      <svg width={size} height={size} viewBox="0 0 100 100" className="animate-spin-extremely-slow">
        <path id="circlePath" d="M 50, 50 m -40, 0 a 40,40 0 1,1 80,0 a 40,40 0 1,1 -80,0" fill="transparent" />
        <text className="text-[8px] uppercase tracking-[0.2em] font-medium fill-current opacity-40">
          <textPath xlinkHref="#circlePath">{text}</textPath>
        </text>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <Star size={size / 5} className="opacity-20 text-[#9C8268]" />
      </div>
    </div>
  );
};

// --- COMPOSANT : BOUTON DÉCOUVRIR (MARTEAU FLOTTANT SANS FOND) ---
const RotatingButton = ({ id }) => {
  const pathId = `btnPath-${id}`;
  return (
    <div className="relative w-16 h-16 md:w-24 md:h-24 flex items-center justify-center select-none group-hover:scale-110 transition-transform duration-500">
      {/* Texte rotatif */}
      <div className="absolute inset-0 animate-spin-slow">
        <svg width="100%" height="100%" viewBox="0 0 100 100">
          <defs>
            <path id={pathId} d="M 50, 50 m -34, 0 a 34,34 0 1,1 68,0 a 34,34 0 1,1 -68,0" fill="transparent" />
          </defs>
          <text className="text-[10px] uppercase font-bold tracking-[0.25em] fill-current">
            <textPath xlinkHref={`#${pathId}`} startOffset="0%">
              TOUS À TABLE • TOUS À TABLE •
            </textPath>
          </text>
        </svg>
      </div>

      {/* Marteau Central - SANS CERCLE BLANC */}
      <div className="absolute inset-0 flex items-center justify-center">
        <Hammer size={20} className="text-current md:w-6 md:h-6" strokeWidth={1.5} />
      </div>
    </div>
  );
};

// --- COMPOSANT : ACCORDION ITEM (POUR LA FAQ - RESSERRÉ) ---
const AccordionItem = ({ question, answer, isOpen, onClick }) => {
  const contentRef = useRef(null);

  return (
    <div className="border-b border-black/10 last:border-none">
      <button
        onClick={onClick}
        className="w-full py-4 md:py-5 flex justify-between items-center text-left group hover:pl-4 transition-all duration-300"
      >
        <h4 className="font-serif text-lg md:text-xl lg:text-2xl xl:text-3xl text-[#1a1a1a] font-light italic pr-6 md:pr-8">{question}</h4>
        <div className={`w-8 h-8 rounded-full border border-black/10 flex items-center justify-center transition-all duration-500 flex-shrink-0 ${isOpen ? 'bg-[#1a1a1a] text-white rotate-45' : 'bg-transparent text-[#1a1a1a] group-hover:bg-[#1a1a1a] group-hover:text-white'}`}>
          <Plus size={16} />
        </div>
      </button>
      <div
        ref={contentRef}
        style={{ height: isOpen ? contentRef.current?.scrollHeight : 0 }}
        className="overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
      >
        <div className="pb-4 md:pb-6 text-sm md:text-base text-[#1a1a1a]/60 leading-relaxed max-w-lg font-light pr-8 md:pr-0">
          {answer}
        </div>
      </div>
    </div>
  );
};

const App = ({ onEnterMarketplace, onStartMarketplaceTransition, darkMode }) => {
  // canvasRef removed (moved to ThreeBackground)
  const cursorRef = useRef(null);
  const componentRef = useRef(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuInteracted, setMenuInteracted] = useState(false); // Prevents initial transition flash
  const [scriptsLoaded, setScriptsLoaded] = useState(false);
  const [homepageImages, setHomepageImages] = useState({});

  // --- FETCH DYNAMIC IMAGES ---
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'sys_metadata', 'homepage_images'), (doc) => {
      if (doc.exists()) {
        setHomepageImages(doc.data());
      }
    });
    return () => unsub();
  }, []);

  // State pour la FAQ
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 1024 : false;

  // ... (Keep existing Navigation logic) ...

  // --- DONNÉES UTILISANT LES IMAGES DYNAMIQUES ---
  const featuredItems = [
    {
      id: 1,
      bgTitle: "Voltaire",
      subtitle: "Exposition Temporaire",
      title: ["Le Voltaire", "Signature"],
      desc: "\"Une renaissance historique pour l'époque contemporaine.\"",
      img: homepageImages.featured_1 || "https://images.unsplash.com/photo-1567016432779-094069958ea5?q=80&w=1200",
      bgColor: "#FFFEFA",
      textColor: "#1a1a1a",
      subColor: "#9C8268",
      faintColor: "rgba(0,0,0,0.03)"
    },
    {
      id: 2,
      bgTitle: "Console",
      subtitle: "Collection Permanente",
      title: ["Console", "Héritage"],
      desc: "\"Formes épurées et assemblage traditionnel. L'équilibre parfait entre passé et présent.\"",
      img: homepageImages.featured_2 || "https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?q=80&w=1200",
      bgColor: "#FAF4EB",
      textColor: "#1a1a1a",
      subColor: "#9C8268",
      faintColor: "rgba(0,0,0,0.03)"
    },
    {
      id: 3,
      bgTitle: "Secrétaire",
      subtitle: "Pièce Unique",
      title: ["Le Secrétaire", "Secret"],
      desc: "\"Bois de rose et marqueterie complexe. Un gardien de correspondances oubliées.\"",
      img: homepageImages.featured_3 || "https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?q=80&w=1200",
      bgColor: "#F2E6D8",
      textColor: "#1a1a1a",
      subColor: "#9C8268",
      faintColor: "rgba(0,0,0,0.03)"
    },
    {
      id: 4,
      bgTitle: "Bibliothèque",
      subtitle: "Nouvelle Acquisition",
      title: ["Bibliothèque", "Céleste"],
      desc: "\"Chêne massif et échelles en laiton. Une structure qui élève l'esprit.\"",
      img: homepageImages.featured_4 || "https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?q=80&w=1200",
      bgColor: "#E6D0B8",
      textColor: "#1a1a1a",
      subColor: "#9C8268",
      faintColor: "rgba(0,0,0,0.04)"
    }
  ];

  // --- NAVIGATION SMOOTH V2 ---
  const handleNavigation = (selector) => {
    // 1. Transition vers Marketplace (Sync avec le Menu & App.jsx)
    if (selector === 'marketplace') {
      const { gsap } = window;
      if (!gsap) {
        onEnterMarketplace();
        return;
      }

      // SIGNAL PRELOAD: On pré-monte la Marketplace en arrière-plan
      if (onStartMarketplaceTransition) onStartMarketplaceTransition();

      const tl = gsap.timeline({
        onComplete: () => {
          if (onEnterMarketplace) onEnterMarketplace();
        }
      });

      // Sortie Éclair (Snappy Exit)
      tl.to('.menu-link', {
        y: -100,
        opacity: 0,
        duration: 0.4,
        stagger: 0.05,
        ease: "expo.in",
        overwrite: true
      })
        .to('.menu-overlay', {
          backgroundColor: '#000',
          opacity: 1,
          duration: 0.3,
          ease: "power2.inOut"
        }, "-=0.25");

      return;
    }

    // 2. Navigation Standard (Scroll interne)
    setIsMenuOpen(false);
    setTimeout(() => {
      const element = document.querySelector(selector);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      } else {
        const feat = document.querySelector('.featured-section');
        if (feat) feat.scrollIntoView({ behavior: 'smooth' });
      }
    }, 500);
  };

  // --- CHARGEMENT DYNAMIQUE DES SCRIPTS ---
  useEffect(() => {
    const loadScript = (src) => {
      return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        document.head.appendChild(script);
      });
    };

    Promise.all([
      loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js'),
      loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js'),
      loadScript('https://unpkg.com/@studio-freight/lenis@1.0.42/dist/lenis.min.js')
    ]).then(() => {
      window.gsap.registerPlugin(window.ScrollTrigger);

      // PRE-WARM: Force GPU layer creation & position calculation
      // This runs while the preloader is still visible, so user won't see any visual glitches
      const warmUpAnimations = () => {
        // 1. Force GPU layers on key animated elements
        const animatedElements = document.querySelectorAll(
          '.card-visual, .process-card, .manifesto-item, .team-section, .data-section'
        );
        animatedElements.forEach(el => {
          if (el) {
            el.style.willChange = 'transform, opacity';
            el.style.transform = 'translate3d(0, 0, 0)';
            el.style.backfaceVisibility = 'hidden';
          }
        });

        // 2. Ghost scroll to trigger initial calculations (invisible under preloader)
        window.scrollTo(0, 1);
        requestAnimationFrame(() => {
          window.scrollTo(0, 0);
          // 3. First ScrollTrigger refresh to calculate all positions
          if (window.ScrollTrigger) {
            window.ScrollTrigger.refresh(true);
          }
        });

        // 4. Pre-load critical images (first 2 featured cards)
        const criticalImages = [
          'https://images.unsplash.com/photo-1567016432779-094069958ea5?q=80&w=1200',
          'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?q=80&w=1200'
        ];
        criticalImages.forEach(src => {
          const img = new Image();
          img.src = src;
        });
      };

      // Execute warm-up after a short delay to let DOM stabilize
      setTimeout(warmUpAnimations, 100);

      setScriptsLoaded(true);
    });
  }, []);

  // --- PRELOADER STATE ---
  const [isLoading, setIsLoading] = useState(() => {
    return typeof window !== 'undefined' ? !window.hasShownPreloader : true;
  });

  // --- GSAP ORCHESTRATION (SIMPLIFIED & ROBUST) ---
  const tlHeroRef = useRef(null);

  // Force hidden state BEFORE any painting happens to avoid "flash"
  useLayoutEffect(() => {
    if (!scriptsLoaded) return;

    const ctx = gsap.context(() => {
      // 1. SETUP: Force hidden state immediately and aggressively
      // We set y to 150% to ensure it's hidden below the clipping mask
      gsap.set('.hero-section .reveal-inner', { y: "150%", rotate: 2, opacity: 0 }); // Added opacity 0 for double safety
      gsap.set('.hero-footer-element', { opacity: 0, y: 20 });
    }, componentRef);

    return () => ctx.revert();
  }, [scriptsLoaded]);

  // --- PRELOADER & HERO ENTRANCE ---
  useEffect(() => {
    if (!scriptsLoaded) return;

    const { gsap } = window;
    if (!gsap) return;

    // If preloader already shown, just animate hero immediately
    if (window.hasShownPreloader) {
      document.body.style.overflow = '';
      setIsLoading(false);

      // Reset background state for instant landing
      gsap.set(document.body, {
        backgroundColor: darkMode ? '#1a1a1a' : '#FAF9F6',
        color: darkMode ? '#FAF9F6' : '#1a1a1a'
      });
      gsap.set('.three-container', { opacity: 1, y: 0 });
      window._pauseThree = false;

      // START HERO ANIMATION (Fast version)
      const tl = gsap.timeline();
      // Ensure visibility is restored before animating
      tl.set('.hero-section .reveal-inner', { opacity: 1 });
      tl.to('.hero-section .reveal-inner', {
        y: "0%",
        rotate: 0,
        duration: 1.2, // Faster
        ease: "expo.out",
        stagger: 0.1,
        force3D: true
      })
        .to('.hero-footer-element', {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "power3.out"
        }, "-=0.8");

      return;
    }

    // Lock scroll during preloader
    document.body.style.overflow = 'hidden';

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          setIsLoading(false);
          window.hasShownPreloader = true; // Mark as shown
          document.body.style.overflow = '';
          // Ensure ScrollTrigger is refreshed after layout settles
          if (window.ScrollTrigger) window.ScrollTrigger.refresh();
        }
      });

      // 0. Initial Setup
      gsap.set('.preloader-content', { opacity: 0 }); // Redundant with class but safe
      gsap.set('.preloader-char', { y: 40, opacity: 0, filter: "blur(10px)" });
      gsap.set('.preloader-icon', { scale: 0.8, opacity: 0, filter: "blur(5px)" });
      // Ensure hero is hidden but ready (opacity 1 will be set in timeline if needed, or we rely on y)
      // Actually we set opacity 0 in useLayoutEffect, so we need to set it back to 1 just before reveal

      // 1. Intro Sequence - Plus Rapide (Snappy)
      tl.to('.preloader-content', { opacity: 1, duration: 0.1 }) // Instant container visibility so children can act
        .to('.preloader-icon', {
          scale: 1,
          opacity: 1,
          filter: "blur(0px)",
          duration: 1.0, // Reduced from 1.5
          ease: "expo.out"
        })
        .to('.preloader-char', {
          y: 0,
          opacity: 1,
          filter: "blur(0px)",
          duration: 1.0, // Reduced from 1.2
          stagger: 0.06, // Tighter stagger
          ease: "expo.out"
        }, "-=0.5")
        .to('.preloader-footer-element', {
          opacity: 1,
          duration: 0.8,
          ease: "power2.out"
        }, "-=0.8") // Start slightly before chars finish

        // Petite pulsation rapide
        .to('.preloader-content', {
          scale: 1.05,
          opacity: 0.8,
          duration: 1.2, // Reduced from 2
          ease: "sine.inOut"
        }, "-=0.1")

        // 2. Curtain Exit - Rapide et Tranchant
        .addLabel("exit", "+=0.1")
        .to('.preloader-secondary-bg', {
          yPercent: -100,
          duration: 0.8, // Reduced from 1.2
          ease: "expo.inOut"
        }, "exit")
        .to('.preloader-overlay', {
          yPercent: -100,
          duration: 0.8, // Reduced from 1.2
          ease: "expo.inOut"
        }, "exit+=0.05")

        // 3. Hero Content Reveal - SYNCHRO RAPIDE
        // We set opacity back to 1 right before animating y
        .set('.hero-section .reveal-inner', { opacity: 1 }, "exit+=0.2")
        .to('.hero-section .reveal-inner', {
          y: "0%",
          rotate: 0,
          duration: 1.2, // Reduced from 1.8
          ease: "expo.out",
          stagger: 0.1,
          force3D: true
        }, "exit+=0.3") // Start almost immediately as curtain lifts

        .to('.hero-footer-element', {
          opacity: 1,
          y: 0,
          duration: 1.0,
          stagger: 0.1,
          ease: "power3.out"
        }, "exit+=0.6")

        // 4. Finalisation
        .add(() => {
          setIsLoading(false);
          document.body.style.overflow = '';
          setTimeout(() => {
            if (window.ScrollTrigger) window.ScrollTrigger.refresh(true);
          }, 400);
        });
    });

    return () => ctx.revert();
  }, [scriptsLoaded]);

  // --- INITIALISATION LENIS ---
  useEffect(() => {
    if (!scriptsLoaded) return;
    const isMobile = window.innerWidth < 1024;
    const lenis = new window.Lenis({
      duration: isMobile ? 0.5 : 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      smoothTouch: true,
      touchMultiplier: isMobile ? 0.8 : 2,
    });
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, [scriptsLoaded]);

  // --- GSAP ORCHESTRATION ---
  useLayoutEffect(() => {
    if (!scriptsLoaded) return;
    const { gsap, ScrollTrigger } = window;

    const ctx = gsap.context(() => {
      // 2. Disparition 3D + PAUSE (Save GPU for Section 10)
      ScrollTrigger.create({
        trigger: ".hero-section",
        start: "bottom top",
        onEnter: () => { window._pauseThree = true; },
        onLeaveBack: () => { window._pauseThree = false; }
      });

      gsap.to('.three-container', {
        opacity: 0,
        y: -150,
        scrollTrigger: {
          trigger: ".hero-section",
          start: "top top",
          end: "bottom center",
          scrub: true
        }
      });


      // 3. Themes Couleurs
      const themes = [
        { trigger: ".manifesto", bg: "#F4F1EE", color: "#1a1a1a" },
        { trigger: ".process-wrapper", bg: "#0D0D0D", color: "#FAF9F6" },
        { trigger: ".featured-section", bg: "#FFFFFF", color: "#1a1a1a" },
        { trigger: ".data-section", bg: "#111111", color: "#FAF9F6" },
        { trigger: ".team-section", bg: "#FAF9F6", color: "#1a1a1a" },
        { trigger: ".faq-section", bg: "#F0F2EB", color: "#1a1a1a" }
      ];

      themes.forEach(theme => {
        ScrollTrigger.create({
          trigger: theme.trigger,
          start: "top 80%",
          end: "bottom 20%",
          onEnter: () => gsap.to(document.body, { backgroundColor: theme.bg, color: theme.color, duration: 0.8, ease: "power2.inOut" }),
          onEnterBack: () => gsap.to(document.body, { backgroundColor: theme.bg, color: theme.color, duration: 0.8, ease: "power2.inOut" }),
        });
      });

      // 4. Galerie Manifesto
      gsap.utils.toArray('.manifesto-item').forEach((item) => {
        gsap.from(item, {
          y: 100, opacity: 0, scale: 0.95, duration: 1.5,
          scrollTrigger: { trigger: item, start: "top 90%", toggleActions: "play none none reverse" }
        });
      });

      // 5. Scroll Horizontal (PROCESS) - HYBRID MODE (Desktop Only)
      const horizontal = document.querySelector('.horizontal-content');
      if (horizontal) {
        const mm = gsap.matchMedia();

        mm.add("(min-width: 1920px)", () => {
          // Add extra space so we can scroll past the 5th card and see black space
          const distanceToScroll = horizontal.scrollWidth - window.innerWidth + 200;
          const xAnim = gsap.to(horizontal, {
            x: -distanceToScroll,
            ease: "none",
            force3D: true,
            scrollTrigger: {
              trigger: ".process-wrapper",
              start: "top top",
              end: () => "+=" + (distanceToScroll * 3.5),
              pin: true,
              scrub: 1,
              invalidateOnRefresh: true,
              anticipatePin: 1
            }
          });

          // Animation des cartes (PC)
          const cards = gsap.utils.toArray('.process-card');
          cards.forEach((card, i) => {
            const img = card.querySelector('.img-box-process');
            gsap.set(img, { y: 40, opacity: 0, scale: 0.95 });
            gsap.to(img, {
              y: 0, opacity: 1, scale: 1,
              duration: 0.5, ease: "power2.out",
              // Delay spécifique pour la 2ème image (index 1) pour éviter l'apparition instantanée
              delay: (i === 1) ? 0.5 : 0,
              scrollTrigger: {
                trigger: card,
                containerAnimation: xAnim,
                // On attend que la carte soit un peu plus rentrée (95%) pour déclencher
                // Cela "naturelise" l'apparition comme pour les cartes 3, 4, 5
                start: "left 95%",
                toggleActions: "play none none reverse"
              }
            });
          });
        });

        mm.add("(max-width: 1919px)", () => {
          // Animation des cartes (Mobile - Vertical) - ULTRA-OPTIMISÉ INSTANT REVEAL
          const cards = gsap.utils.toArray('.process-card');
          cards.forEach((card) => {
            const img = card.querySelector('.img-box-process');
            gsap.set(img, { y: 20, opacity: 0, scale: 0.98 });
            gsap.to(img, {
              y: 0, opacity: 1, scale: 1,
              duration: 0.25, ease: "power1.out",
              force3D: true,
              scrollTrigger: {
                trigger: card,
                start: "top 100%",
                toggleActions: "play none none reverse"
              }
            });
          });
        });
      }

      // 6. STACKING CARDS LOGIC REMOVED (Handled by StackedCards.jsx)

      // 6. STACKING CARDS LOGIC REMOVED (Handled by StackedCards.jsx)
      // Legacy text reveal removed to prevent ReferenceError

      // 7. Data Counters (GSAP pour la Section 12)
      const statNumbers = gsap.utils.toArray('.stat-number');
      statNumbers.forEach(num => {
        const target = parseInt(num.getAttribute('data-target'));
        gsap.to(num, {
          innerText: target,
          duration: 3,
          snap: { innerText: 1 },
          ease: "expo.out",
          scrollTrigger: { trigger: num, start: "top 90%" }
        });
      });

      // 8. Team Section - Animation d'apparition du texte uniquement (CSS Sticky gère le pinning)
      gsap.from('.team-content-reveal', {
        y: 50,
        opacity: 0,
        duration: 1,
        stagger: 0.1,
        scrollTrigger: { trigger: '.team-section', start: "top 60%" }
      });

      // 9. Curseur (Desktop uniquement)
      if (window.innerWidth >= 1024) {
        const moveCursor = (e) => {
          gsap.to(cursorRef.current, { x: e.clientX, y: e.clientY, duration: 0.3, ease: "power2.out" });
        };
        window.addEventListener('mousemove', moveCursor);
      }

    }, componentRef);
    return () => ctx.revert();
  }, [scriptsLoaded]);



  const stats = [
    { label: "Années d'excellence", value: "25", suffix: "+" },
    { label: "Heures par projet", value: "400", suffix: "h" },
    { label: "Outils traditionnels", value: "1500", suffix: "" },
    { label: "Patrimoines sauvés", value: "85", suffix: "+" }
  ];

  // DONNÉES FAQ
  const faqItems = [
    { q: "Comment se déroule la restauration d'un meuble ?", a: "Chaque projet commence par une analyse approfondie de l'état du meuble. Nous établissons un diagnostic précis avant de procéder au nettoyage, à la consolidation structurelle, puis aux finitions respectueuses de l'époque." },
    { q: "Puis-je personnaliser les finitions ?", a: "Absolument. Bien que nous privilégions les techniques traditionnelles, nous pouvons adapter la teinte, le vernis ou le tissu pour que la pièce s'intègre parfaitement à votre intérieur contemporain." },
    { q: "Utilisez-vous des produits écologiques ?", a: "Oui, nous privilégions les cires naturelles, les huiles végétales et les vernis à l'eau ou au tampon (gomme laque) pour garantir la santé de votre intérieur et celle de la planète." },
    { q: "Quels sont les délais moyens ?", a: "Cela dépend de la complexité de la restauration. Comptez en moyenne 4 à 8 semaines pour une restauration complète. Chaque étape de séchage et de pose est cruciale et ne peut être accélérée." },
    { q: "Livrez-vous à l'international ?", a: "Oui, nous organisons l'expédition sécurisée de nos pièces dans le monde entier, avec des caisses de transport sur-mesure pour garantir une protection optimale." }
  ];

  const SEO = React.lazy(() => import('../components/SEO'));

  return (
    <div ref={componentRef} className="bg-[#FAF9F6] text-[#1a1a1a] transition-colors duration-700 antialiased">
      <React.Suspense fallback={null}>
        <SEO
          title="Tous à Table - Atelier d'Ébénisterie en Normandie"
          description="Créations uniques et restauration de mobilier d'art. L'excellence du savoir-faire normand au service de votre intérieur."
        />
      </React.Suspense>





      {/* --- PREMIUM PRELOADER (LUMOSINE STYLE) --- */}
      {isLoading && (
        <>
          {/* Secondary background for depth */}
          <div className="preloader-secondary-bg fixed inset-0 z-[9998] bg-[#9C8268]/20 pointer-events-none"></div>

          <div className="preloader-overlay fixed inset-0 z-[9999] bg-[#1a1a1a] flex flex-col items-center justify-center text-[#FAF9F6]">
            {/* Content Container */}
            <div className="preloader-content flex flex-col items-center gap-8 opacity-0">
              <div className="preloader-icon opacity-0">
                <Hammer size={56} strokeWidth={1} className="text-[#9C8268] drop-shadow-[0_0_15px_rgba(156,130,104,0.3)]" />
              </div>
              <div className="overflow-hidden flex gap-[0.2em] px-4">
                {"TOUS À TABLE".split("").map((char, i) => (
                  <span
                    key={i}
                    className="preloader-char font-serif text-4xl md:text-6xl italic font-light tracking-[0.2em] inline-block will-change-transform opacity-0"
                  >
                    {char === " " ? "\u00A0" : char}
                  </span>
                ))}
              </div>
              <div className="mt-8 flex items-center gap-4 opacity-0 preloader-footer-element">
                <div className="w-12 h-[1px] bg-[#9C8268]"></div>
                <span className="text-[8px] uppercase tracking-[0.5em] font-bold">Artisan ébéniste</span>
                <div className="w-12 h-[1px] bg-[#9C8268]"></div>
              </div>
            </div>
          </div>
        </>
      )}

      <div id="main-cursor" ref={cursorRef} className="hidden lg:block"></div>
      <div className="three-container fixed inset-0 pointer-events-none z-0">
        <React.Suspense fallback={null}>
          <ThreeBackground />
        </React.Suspense>
      </div>

      {/* NAVIGATION */}
      {/* NAVIGATION - FIXED SAFE AREA */
      /* Increased to max(3rem) for tablets with thick status bars */}
      <header className="fixed top-0 left-0 w-full p-5 md:p-12 pt-[max(2rem,env(safe-area-inset-top))] pr-[max(1.5rem,env(safe-area-inset-right))] pl-[max(1.5rem,env(safe-area-inset-left))] flex justify-between items-center z-[210] mix-blend-difference text-white">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <Hammer size={18} className="group-hover:rotate-45 transition-transform duration-500" />
          <span className="font-serif text-xl tracking-widest uppercase font-light italic text-white">Tous à Table</span>
        </div>

        {/* BOUTON MENU ANIMÉ */}
        <button onClick={() => { setIsMenuOpen(!isMenuOpen); setMenuInteracted(true); }} className="flex items-center gap-4 group focus:outline-none">
          <span className={`text-[9px] uppercase tracking-[0.4em] transition-opacity duration-500 ${isMenuOpen ? 'opacity-100' : 'opacity-40 group-hover:opacity-100'}`}>Menu</span>

          {/* ANIMATION HAMBURGER -> CROIX */}
          <div className="w-6 h-4 flex flex-col justify-between">
            <span className={`block w-full h-[1px] bg-white transition-all duration-500 ease-in-out will-change-transform ${isMenuOpen ? 'rotate-45 translate-y-[7px]' : ''}`}></span>
            <span className={`block w-full h-[1px] bg-white transition-all duration-500 ease-in-out will-change-transform ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
            <span className={`block w-full h-[1px] bg-white transition-all duration-500 ease-in-out will-change-transform ${isMenuOpen ? '-rotate-45 -translate-y-[7px]' : ''}`}></span>
          </div>
        </button>
      </header>

      {/* MENU (HOME) - Hardened to prevent flash on refresh */}
      <div
        className={`fixed inset-0 z-[200] ${isMenuOpen ? 'visible' : (menuInteracted ? 'invisible pointer-events-none' : '')}`}
        style={{ display: menuInteracted ? 'flex' : 'none' }}
      >
        <div
          className={`menu-overlay absolute inset-0 bg-[#111]/95 backdrop-blur-xl ${menuInteracted ? 'transition-opacity duration-700 ease-in-out' : ''} ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setIsMenuOpen(false)}
        ></div>
        <div className={`relative h-full w-full flex flex-col items-center justify-center transform ${menuInteracted ? 'transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]' : ''} ${isMenuOpen ? 'translate-y-0' : 'translate-y-full'}`}>
          <div className="flex flex-col items-center gap-12 text-white">
            <button onClick={() => handleNavigation('marketplace')} className="menu-link font-serif text-5xl md:text-9xl font-light hover:text-[#9C8268] transition-all bg-transparent border-none text-white cursor-pointer">
              Marketplace
            </button>
            <button onClick={() => handleNavigation('.featured-section')} className="menu-link font-serif text-5xl md:text-9xl font-light hover:text-[#9C8268] transition-all bg-transparent border-none text-white cursor-pointer">
              En vedette
            </button>
            <button onClick={() => handleNavigation('footer')} className="menu-link font-serif text-5xl md:text-9xl font-light hover:text-[#9C8268] transition-all bg-transparent border-none text-white cursor-pointer">
              Contact
            </button>
          </div>
        </div>
      </div>

      {/* [SECTION 08: HERO] - Fixed vertical cropping with h-[100dvh] + SAFE AREAS */}
      {/* Increased pb to 32 (8rem) on tablet to LIFT elements higher as requested */}
      <section className="hero-section relative h-[100dvh] flex flex-col justify-center px-6 md:px-12 lg:px-[10vw] z-10 pb-12 md:pb-32">
        {/* Title resized to 10.5vw (was 12.5) to free up vertical space for bottom text */}
        <h1 className="font-serif text-[18vw] md:text-[10.5vw] leading-[0.8] uppercase flex flex-col font-light text-[#1a1a1a] mix-blend-multiply">
          <RevealText text="Le Geste" />
          <div className="flex items-center gap-4 self-end md:mr-[8vw] mt-2 md:mt-0">
            <RevealText text="& L'Âme" className="text-[#9C8268] italic pt-[0.25em] -mt-[0.25em]" />
          </div>
        </h1>

        <div className="absolute bottom-16 md:bottom-12 left-0 w-full px-8 md:px-[10vw] flex flex-row justify-between items-end md:items-baseline">
          <div className="hero-footer-element space-y-4 max-w-[150px] md:max-w-xs text-[#1a1a1a] opacity-0 translate-y-5">
            <p className="text-[10px] uppercase tracking-[0.2em] md:tracking-[0.3em] opacity-60 leading-relaxed md:leading-loose font-medium">
              Restauration de mobilier <br /> de haute ébénisterie. <br /> Normandie, France.
            </p>
          </div>

          <div className="hero-footer-element flex flex-col items-center gap-2 md:gap-4 text-[#1a1a1a] group cursor-pointer opacity-0 translate-y-5" onClick={() => {
            const manifesto = document.querySelector('.manifesto');
            if (manifesto) manifesto.scrollIntoView({ behavior: 'smooth' });
          }}>
            <span className="text-[9px] uppercase tracking-[0.2em] md:tracking-[0.3em] font-bold opacity-40 group-hover:opacity-100 transition-opacity text-center">
              Explorer <br className="md:hidden" /> l'Atelier
            </span>
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-black/10 flex items-center justify-center group-hover:border-black/40 transition-colors bg-white/50 backdrop-blur-sm">
              <ArrowDown size={14} className="opacity-60 group-hover:translate-y-1 transition-transform duration-500" />
            </div>
          </div>
        </div>
      </section>

      {/* [SECTION 09: MANIFESTO] */}
      {/* Reduced py-60 to py-32 for tablets (md) to avoid huge gaps */}
      <section className="manifesto relative py-32 md:pt-40 md:pb-64 px-8 md:px-[10vw] bg-transparent">
        <div className="mb-48 max-w-3xl">
          <span className="text-[10px] uppercase tracking-[0.6em] text-[#9C8268] block mb-12">Héritage</span>
          <h2 className="font-serif text-5xl md:text-8xl leading-tight font-light italic text-[#1a1a1a]">
            Réveiller la splendeur <br /> du bois oublié.
          </h2>
        </div>

        {/* GRID LAYOUT - VERTICAL STACK SAFE MODE (<1536px)
            Switched to 2XL for the grid. Below 2XL (laptops/desktops), it's a clean, centered vertical stack. */}
        <div className="grid grid-cols-1 2xl:grid-cols-12 gap-20 2xl:gap-32 items-center">
          <div className="manifesto-item 2xl:col-span-6 space-y-8 flex flex-col items-center 2xl:block 2xl:space-y-12 text-center 2xl:text-left">
            <div className="img-parallax aspect-[3/4] shadow-2xl w-full max-w-xl 2xl:max-w-none mx-auto">
              <img src={homepageImages['manifesto_1'] || "https://images.unsplash.com/photo-1595428774223-ef52624120d2?q=80&w=1200"} className="w-full h-full object-cover" alt="Table en Chêne" />
            </div>
            <div className="max-w-sm mx-auto 2xl:mx-0">
              <h3 className="font-serif text-4xl italic mb-4 text-[#1a1a1a]">Le Plateau d'Antan</h3>
              <p className="text-sm opacity-50 font-light leading-relaxed uppercase tracking-wider text-[#1a1a1a]">Chêne de pays — Finition à la cire d'abeille.</p>
            </div>
          </div>

          <div className="manifesto-item 2xl:col-span-4 2xl:col-start-9 2xl:mt-40 space-y-8 flex flex-col items-center 2xl:block 2xl:space-y-12 text-center 2xl:text-left">
            <div className="img-parallax aspect-[4/5] shadow-2xl w-full max-w-xl 2xl:max-w-none mx-auto">
              <img src={homepageImages['manifesto_2'] || "https://images.unsplash.com/photo-1618220179428-22790b461013?q=80&w=1200"} className="w-full h-full object-cover" alt="Console de style" />
            </div>
            <div className="text-center 2xl:text-left">
              <h3 className="font-serif text-3xl italic mb-4 text-[#1a1a1a]">La Console Royale</h3>
              <p className="text-[10px] uppercase tracking-widest opacity-40 text-[#1a1a1a]">Noyer sculpté — XIXème siècle.</p>
            </div>
          </div>

          <div className="manifesto-item 2xl:col-span-12 mt-20 2xl:mt-40 flex flex-col 2xl:flex-row gap-12 2xl:gap-20 items-center">
            <div className="w-full max-w-xl 2xl:max-w-none 2xl:w-3/5 img-parallax aspect-video shadow-2xl mx-auto 2xl:mx-0">
              <img src={homepageImages['manifesto_3'] || "https://images.unsplash.com/photo-1567016432779-094069958ea5?q=80&w=1400"} className="w-full h-full object-cover" alt="Commode ancienne" />
            </div>
            <div className="w-full max-w-lg 2xl:max-w-none 2xl:w-2/5 space-y-8 mx-auto 2xl:mx-0">
              <h3 className="font-serif text-5xl italic leading-tight text-[#1a1a1a]">La Renaissance <br /> d'un Chef-d'œuvre</h3>
              <p className="text-lg font-light opacity-60 leading-relaxed text-[#1a1a1a]">
                Après 400 heures de restauration méticuleuse, cette pièce a retrouvé sa profondeur originelle. Un dialogue suspendu entre le XVIIIème et aujourd'hui.
              </p>
              <button onClick={onEnterMarketplace} className="flex items-center gap-6 group">
                <div className="w-14 h-14 rounded-full border border-black/10 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all duration-500">
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </div>
                <span className="text-[10px] uppercase tracking-[0.4em] text-[#1a1a1a]">Découvrir la pièce</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* [SECTION 10: PROCESS] */}
      {/* HYBRID: Vertical Zig-Zag until Big PC (1920px), Horizontal (h-[100dvh]) for 1920px+ */}
      <section className="process-wrapper h-auto min-[1920px]:h-[100dvh] min-h-[600px] bg-[#0D0D0D] text-[#FAF9F6] flex items-center overflow-hidden py-32 min-[1920px]:py-0">
        <div className="horizontal-content flex flex-col min-[1920px]:flex-row gap-32 min-[1920px]:gap-[12vw] px-4 md:px-12 min-[1920px]:px-0 min-[1920px]:pl-[10vw] min-[1920px]:pr-[15vw] items-center relative min-[1920px]:will-change-transform w-full">

          {/* Titre Section */}
          <div className="w-full min-[1920px]:min-w-[40vw] relative flex flex-col items-center min-[1920px]:items-start justify-center mb-32 min-[1920px]:mb-0 border-b min-[1920px]:border-b-0 min-[1920px]:border-r border-white/5 pb-16 min-[1920px]:pb-0 min-[1920px]:pr-[8vw] text-center min-[1920px]:text-left mx-auto min-[1920px]:mx-0">
            <RotatingSymbol className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 min-[1920px]:top-auto min-[1920px]:left-auto min-[1920px]:translate-x-0 min-[1920px]:translate-y-0 min-[1920px]:-top-20 min-[1920px]:-left-24 text-[#9C8268] opacity-10 min-[1920px]:opacity-100" size={isMobile ? 220 : 160} />
            <div className="relative z-10 w-full px-4 md:px-0">
              <span className="text-[10px] uppercase tracking-[1.2em] text-[#9C8268] mb-8 block font-black">L'Alchimie</span>
              <h2 className="font-serif text-5xl md:text-8xl min-[1920px]:text-[12vw] leading-none font-light italic text-white px-2">Le Rituel.</h2>
              <p className="mt-8 min-[1920px]:mt-12 text-base md:text-xl font-light opacity-50 max-w-lg min-[1920px]:border-l border-[#9C8268] min-[1920px]:pl-6 mx-auto min-[1920px]:mx-0 leading-relaxed">
                Chaque étape est une célébration de la matière. De l'état brut à l'œuvre d'art, découvrez notre processus de restauration.
              </p>
            </div>
          </div>

          {[
            { n: "I", t: "L'Essence", d: "Sélection rigoureuse des billes de bois précieux.", main: homepageImages.process_1 || "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?q=80&w=1400", w: "w-full md:max-w-[90vw] min-[1920px]:w-[580px]", h: "h-[450px] md:h-[600px] min-[1920px]:h-[500px]", info: "Matière première" },
            { n: "II", t: "L'Analyse", d: "Diagnostic structurel et scan de la patine historique.", main: homepageImages.process_2 || "https://images.unsplash.com/photo-1644358686685-4ed525a59663?q=80&w=2000&auto=format&fit=crop", w: "w-full md:max-w-[95vw] min-[1920px]:w-[750px]", h: "h-[400px] md:h-[600px] min-[1920px]:h-[500px]", info: "Étude microscopique" },
            { n: "III", t: "Le Dessin", d: "Tracé géométrique pour les greffes complexes.", main: homepageImages.process_3 || "https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=2000&auto=format&fit=crop", w: "w-full md:max-w-[90vw] min-[1920px]:w-[650px]", h: "h-[350px] md:h-[550px] min-[1920px]:h-[450px]", info: "Perspective d'art" },
            { n: "IV", t: "La Cure", d: "Greffes invisibles et consolidation structurelle.", main: homepageImages.process_4 || "https://images.unsplash.com/photo-1600585152220-90363fe7e115?q=80&w=1400", w: "w-full md:max-w-[90vw] min-[1920px]:w-[600px]", h: "h-[400px] md:h-[600px] min-[1920px]:h-[500px]", info: "Renaissance physique" },
            { n: "V", t: "L'Éclat", d: "Secret du vernis au tampon selon la tradition normande.", main: homepageImages.process_5 || "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=1400", w: "w-full md:max-w-[95vw] min-[1920px]:w-[850px]", h: "h-[400px] md:h-[650px] min-[1920px]:h-[550px]", info: "Miroir de bois" }
          ].map((step, i) => (
            <div key={i} className={`process-card flex-shrink-0 relative ${step.w} flex flex-col ${i % 2 === 0 ? 'md:flex-row-reverse' : 'md:flex-row'} min-[1920px]:flex-col items-center min-[1920px]:items-start justify-center gap-12 md:gap-20 min-[1920px]:gap-8 group mb-24 md:mb-48 min-[1920px]:mb-0 px-4 md:px-0`}>

              {/* Numéro flottant "Architectural" */}
              <div className={`absolute -top-12 min-[1920px]:-top-12 ${i % 2 === 0 ? 'right-4 md:right-0 min-[1920px]:left-0 min-[1920px]:right-auto' : 'left-4 md:left-0'} min-[1920px]:-left-12 z-30 pointer-events-none select-none text-[#9C8268]/20 min-[1920px]:text-white/10 min-[1920px]:group-hover:text-[#9C8268]/20 transition-colors duration-700`}>
                <span className="font-serif text-[6rem] md:text-[8rem] min-[1920px]:text-[12rem] leading-none text-stroke-1 italic">{step.n}</span>
              </div>

              {/* Conteneur Image */}
              <div className={`img-box-process ${step.h} w-full md:w-[65%] min-[1920px]:w-full border border-white/30 max-[1919px]:border-white/30 min-[1920px]:border-white/10 relative overflow-hidden transition-all duration-700 min-[1920px]:group-hover:border-white/30 z-10 mx-auto min-[1920px]:mx-0`}>
                <div className="absolute inset-0 z-10 bg-transparent min-[1920px]:bg-[#0D0D0D]/30 min-[1920px]:group-hover:bg-transparent transition-colors duration-150"></div>
                <img src={step.main} alt={step.t} className="p-img-inner w-full h-full object-cover grayscale-0 transition-[filter,transform] duration-150 scale-100 will-change-[filter,transform]" />

                {/* Tag technique au survol */}
                <div className="absolute bottom-6 right-6 z-20 opacity-100 translate-y-0 min-[1920px]:opacity-0 min-[1920px]:translate-y-4 min-[1920px]:group-hover:opacity-100 min-[1920px]:group-hover:translate-y-0 transition-all duration-300 delay-75">
                  <span className="text-[10px] uppercase tracking-widest bg-[#111] px-4 py-2 border border-[#9C8268] text-white font-medium shadow-xl">{step.info}</span>
                </div>
              </div>

              {/* Caption */}
              <div className={`p-caption mt-6 md:mt-0 min-[1920px]:mt-8 relative z-10 text-white md:w-[35%] min-[1920px]:w-full md:px-12 min-[1920px]:px-0 min-[1920px]:pl-6 border-l border-[#9C8268] max-[1919px]:border-[#9C8268] min-[1920px]:border-white/10 min-[1920px]:group-hover:border-[#9C8268] transition-colors duration-150 text-center ${i % 2 === 0 ? 'md:text-right min-[1920px]:text-left' : 'md:text-left min-[1920px]:text-left'}`}>
                <h3 className="text-3xl md:text-5xl min-[1920px]:text-6xl font-light italic font-serif text-white mb-6 min-[1920px]:group-hover:translate-x-2 transition-transform duration-500">{step.t}</h3>
                <p className="text-[10px] md:text-sm uppercase tracking-[0.25em] opacity-80 max-[1919px]:opacity-80 min-[1920px]:opacity-40 leading-loose max-w-[320px] font-medium text-[#FAF9F6] min-[1920px]:group-hover:opacity-80 transition-opacity mx-auto md:mx-0 inline-block">{step.d}</p>
              </div>
            </div>
          ))}




          {/* SPACER: Extra space at the end for the 5th card to be fully visible on desktop */}
          <div className="hidden min-[1920px]:block w-[50vw] h-full flex-shrink-0" aria-hidden="true"></div>
        </div>
      </section>

      {/* [SECTION 11: FEATURED - Stacked Cards (Paris Replica)] */}
      <StackedCards
        items={featuredItems}
        onEnterMarketplace={onEnterMarketplace}
      />


      {/* [SECTION 12: RENDU - DATA (REWORK STYLE LUMOSINE - ALIGNÉ)] */}
      < section className="data-section relative py-40 bg-[#111111] text-[#FAF9F6] overflow-hidden" >

        {/* Marquee stylisé : Ticker de luxe */}
        < div className="marquee-wrapper border-y border-white/5 bg-[#0a0a0a] py-12 mb-40" >
          <div className="flex whitespace-nowrap animate-marquee">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-24 mx-12">
                <span className="font-serif text-5xl md:text-8xl font-light italic uppercase text-white tracking-[0.15em]">Patrimoine Durable</span>
                <Star size={32} className="text-[#9C8268] opacity-60" />
                <span className="font-serif text-5xl md:text-8xl font-light uppercase opacity-20 italic tracking-[0.15em] text-white">L'Excellence du geste</span>
                <Star size={32} className="text-[#9C8268] opacity-60" />
              </div>
            ))}
          </div>
        </div >

        {/* Grille de données - Style Architectural (CORRIGÉ : TAILLES & ALIGNEMENT) */}
        < div className="max-w-[110rem] mx-auto px-12 md:px-[10vw]" >
          {/* AJOUT DE border-t POUR FERMER LA GRILLE */}
          < div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border-l border-t border-white/10" >
            {
              stats.map((stat, idx) => (
                <div key={idx} className="stat-item p-12 md:p-16 border-r border-b border-white/10 group flex flex-col justify-between min-h-[300px] md:min-h-[400px]">
                  {/* En-tête de la cellule */}
                  <div className="flex justify-between items-start">
                    <span className="text-[11px] uppercase tracking-[0.5em] font-bold opacity-30 group-hover:opacity-100 group-hover:text-[#9C8268] transition-all duration-700">Mesure 0{idx + 1}</span>
                    <Zap size={18} className="opacity-20 group-hover:opacity-100 group-hover:text-[#9C8268] transition-all duration-700" />
                  </div>

                  {/* Chiffres avec taille contrôlée pour éviter l'overflow */}
                  <div className="my-16">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      {/* Taille ajustée pour 4 colonnes : text-6xl -> xl:text-8xl */}
                      <span className="stat-number font-serif text-6xl md:text-7xl xl:text-8xl leading-none font-light italic tracking-tighter" data-target={stat.value}>0</span>
                      <span className="text-4xl md:text-5xl font-serif italic text-[#9C8268]">{stat.suffix}</span>
                    </div>
                    <p className="mt-6 text-sm md:text-base uppercase tracking-[0.3em] font-medium opacity-40 group-hover:opacity-90 transition-opacity duration-700 break-words">
                      {stat.label}
                    </p>
                  </div>

                  {/* Ligne progressive */}
                  <div className="h-[2px] w-0 group-hover:w-full bg-[#9C8268] transition-all duration-1000 ease-in-out"></div>
                </div>
              ))
            }
          </div >

          <div className="mt-48 flex flex-col md:flex-row justify-between items-end gap-16">
            <div className="max-w-2xl">
              <h3 className="font-serif text-5xl italic mb-10 text-[#9C8268]">La mesure de notre engagement.</h3>
              <p className="text-lg font-light opacity-40 leading-relaxed uppercase tracking-[0.2em]">
                Ces données ne sont pas que des chiffres, elles sont le reflet de milliers d'heures de passion dévouées à la transmission du patrimoine normand.
              </p>
            </div>
            <div className="flex flex-col items-end gap-6">
              <div className="w-52 h-[1px] bg-white/10"></div>
              <span className="text-[11px] uppercase tracking-[0.6em] opacity-30">Atelier Tous à Table © — Archive 2024</span>
            </div>
          </div>
        </div >
      </section >

      {/* [SECTION 13: RENDU - TEAM (DIRECTION) - PURE CSS STICKY SPLIT SCROLL] */}
      <section className="team-section relative bg-[#FAF9F6] z-10">
        {/* Wrapper Flex pour le split - align-items: flex-start est crucial */}
        <div className="flex flex-col md:flex-row items-start">

          {/* COLONNE GAUCHE (TEXTE) - STICKY */}
          {/* md: tablettes (768px+), lg: laptops (1024px+), xl: desktops (1280px+) */}
          <div className="w-full md:w-1/2 md:sticky md:top-0 md:h-auto lg:h-screen flex flex-col md:justify-start lg:justify-center px-6 md:px-8 lg:px-[6vw] py-16 md:pt-[15vh] md:pb-16 lg:py-0 text-[#1a1a1a]">
            <div className="space-y-6 md:space-y-8 lg:space-y-10 team-content-reveal">
              <span className="text-[10px] md:text-[11px] lg:text-[12px] uppercase tracking-[1.2em] md:tracking-[1.4em] text-[#9C8268] block font-black italic">La Direction</span>
              <h2 className="font-serif text-5xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-[8vw] leading-[0.9] font-light italic tracking-tight text-[#1a1a1a]">
                Jean <br /> Lefebvre
              </h2>
            </div>

            <p className="text-base md:text-lg lg:text-xl xl:text-2xl font-light opacity-60 leading-relaxed italic border-l border-black/10 pl-6 md:pl-6 lg:pl-8 xl:pl-10 mt-8 md:mt-8 lg:mt-12 team-content-reveal">
              "Nous ne luttons pas contre le temps, nous le réapprivoisons. Chaque main possède une mémoire que les outils n'ont pas."
            </p>

            <div className="flex gap-6 md:gap-8 lg:gap-12 xl:gap-16 pt-6 md:pt-8 lg:pt-12 border-t border-black/5 items-center mt-8 md:mt-8 lg:mt-12 team-content-reveal">
              <div>
                <span className="block text-[9px] uppercase tracking-widest opacity-30 mb-2 font-black">Expérience</span>
                <span className="font-serif text-3xl md:text-4xl lg:text-5xl xl:text-6xl italic text-[#9C8268]">XXV Ans</span>
              </div>
              <div className="w-[1px] h-12 bg-black/5"></div>
              <Zap size={32} className="text-[#9C8268] opacity-60" />
            </div>
          </div>

          {/* COLONNE DROITE (IMAGE) - SCROLLABLE, PLUS HAUTE */}
          {/* min-h plus grand sur tablette pour compenser le texte plus petit */}
          <div className="w-full md:w-1/2 md:min-h-[160vh] lg:min-h-[150vh] flex flex-col justify-start px-6 md:px-8 lg:px-[4vw] py-16 md:pt-[15vh] md:pb-[20vh] lg:py-[15vh] bg-[#FAF9F6]">
            <div className="relative w-full aspect-[3/4] md:aspect-[2/3] shadow-[0_80px_160px_rgba(0,0,0,0.15)] bg-stone-200 overflow-hidden">
              <img
                src={homepageImages['team_main'] || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1600"}
                alt="Maître Ebéniste"
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000"
              />
              <RotatingSymbol className="absolute -bottom-16 -right-16 text-[#9C8268] opacity-20" size={200} />
            </div>
          </div>

        </div>
      </section>

      {/* [SECTION 13.5 : FAQ - Layout Centré Simple] */}
      <section className="faq-section py-24 md:py-40 px-8 md:px-[10vw] bg-[#F0F2EB] text-[#1a1a1a]">
        <div className="max-w-6xl mx-auto w-full">

          {/* En-tête */}
          <div className="text-center mb-16 md:mb-24">
            <span className="text-[10px] uppercase tracking-[0.6em] text-[#9C8268] block mb-6 font-bold">Le Savoir</span>
            <h2 className="font-serif text-5xl md:text-7xl font-light italic text-[#1a1a1a] leading-tight">
              Réponses Rapides
            </h2>
          </div>

          {/* Grille 2 colonnes: Questions + Image */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-start">

            {/* Colonne Questions */}
            <div className="flex flex-col gap-0 w-full">
              {faqItems.map((item, index) => (
                <AccordionItem
                  key={index}
                  question={item.q}
                  answer={item.a}
                  isOpen={openFaqIndex === index}
                  onClick={() => setOpenFaqIndex(openFaqIndex === index ? -1 : index)}
                />
              ))}
            </div>

            {/* Colonne Image (simple hover, pas de sticky) */}
            <div className="w-full aspect-square overflow-hidden bg-white shadow-2xl hidden md:block">
              <img
                src={homepageImages['faq_main'] || "https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=1600"}
                alt="Détail savoir-faire"
                className="w-full h-full object-cover scale-110 hover:scale-100 transition-transform duration-[2s] ease-out grayscale hover:grayscale-0"
              />
            </div>

          </div>
        </div>
      </section>

      {/* FOOTER */}
      {/* FOOTER - RESPONSIVE REFACTOR */}
      <footer className="bg-[#111] text-white pt-32 pb-12 px-8 md:px-12 relative z-10">
        {/* Container: Vertical stack on mobile/tablet/laptopGap. Side-by-side ONLY on XL screens */}
        <div className="flex flex-col xl:flex-row justify-between items-start gap-16 xl:gap-40 mb-32 relative z-10 text-white">

          <div className="max-w-4xl">
            <span className="text-[10px] uppercase tracking-[0.6em] text-[#9C8268] mb-8 block italic font-black">Inquiry</span>
            {/* Title: Safe sizing. No weird VW units that blow up on tablets. */}
            <h2 className="font-serif text-6xl md:text-8xl xl:text-9xl leading-[0.9] font-light italic hover:translate-x-6 transition-transform duration-500 cursor-pointer text-white break-words">
              Éveiller <br /> l'Immobile.
            </h2>
          </div>

          <div className="flex flex-col gap-12 xl:gap-24 self-start xl:self-end">
            <div className="space-y-4">
              {/* Email: Responsive text size */}
              <a href="mailto:atelier@tousatable.fr" className="block text-2xl md:text-4xl lg:text-5xl font-light italic hover:text-[#9C8268] transition-colors border-b border-white/5 pb-2">
                atelier@tousatable.fr
              </a>
            </div>

            <div className="flex gap-8 items-center opacity-40 hover:opacity-100 transition-opacity">
              <Instagram size={28} className="text-white" />
              <span className="text-[10px] uppercase tracking-[0.4em] italic font-medium">Journal de l'Artisan</span>
            </div>
          </div>
        </div>

        <div className="pt-16 border-t border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 opacity-40 text-[9px] uppercase tracking-[0.3em] font-light relative z-10">
          <span className="leading-relaxed">Tous à Table — Artisans du Patrimoine — Caen, FR — 2024</span>
          <div className="flex gap-12 lowercase underline underline-offset-4 font-bold tracking-widest">
            <span className="cursor-pointer hover:text-white transition-colors">privacy policy</span>
            <span className="cursor-pointer hover:text-white transition-colors">legal mentions</span>
          </div>
        </div>
      </footer>
    </div >
  );
};

export default App;