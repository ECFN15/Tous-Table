import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';
import { Hammer, Menu, X, ArrowRight, ArrowDown, Plus } from 'lucide-react';
import StackedCards from '../components/home/StackedCards'; // New Import
import ProcessSection from '../components/home/ProcessSection'; // New Component (Hybrid Layout)

// --- NPM IMPORTS (remplace les anciens CDN) ---
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from '@studio-freight/lenis';
gsap.registerPlugin(ScrollTrigger);

// Lazy Load Three.js to improve initial bundle size
const ThreeBackground = React.lazy(() => import('../components/home/ThreeBackground'));
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import SEO from '../components/shared/SEO';

// SÉCURITÉ: Sanitize HTML — Autorise uniquement <br> et <br /> (Anti-XSS)
const sanitizeHtml = (html) => {
  if (!html || typeof html !== 'string') return '';
  // 1. Échappe tout le HTML
  const escaped = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  // 2. Ré-autorise UNIQUEMENT les balises <br> et <br />
  return escaped.replace(/&lt;br\s*\/?&gt;/gi, '<br />');
};

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
const RotatingSymbol = ({ className, size = 120, text = "TOUS À TABLE • 2026 •" }) => {
  return (
    <div className={`relative flex items-center justify-center pointer-events-none select-none ${className}`}>
      <svg width={size} height={size} viewBox="0 0 100 100" className="animate-spin-extremely-slow">
        <path id="circlePath" d="M 50, 50 m -40, 0 a 40,40 0 1,1 80,0 a 40,40 0 1,1 -80,0" fill="transparent" />
        <text className="text-[8px] uppercase tracking-[0.2em] font-medium fill-current opacity-60">
          <textPath xlinkHref="#circlePath">{text}</textPath>
        </text>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <Hammer size={size / 5} className="opacity-30 text-[#9C8268]" strokeWidth={1.5} />
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
  const [homepageImages, setHomepageImages] = useState({});

  // --- FETCH DYNAMIC IMAGES ---
  useEffect(() => {
    const unsubscribeImages = onSnapshot(doc(db, 'sys_metadata', 'homepage_images'), (docSnap) => {
      if (docSnap.exists()) {
        setHomepageImages(docSnap.data());
      }
    });

    return () => {
      unsubscribeImages();
    };
  }, []);

  // State pour la FAQ
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  // Scripts are always available via npm imports (no CDN loading needed)
  const scriptsLoaded = true;

  // ... (Keep existing Navigation logic) ...

  // --- DONNÉES UTILISANT LES IMAGES DYNAMIQUES ---
  // --- DONNÉES UTILISANT LES IMAGES DYNAMIQUES ET TEXTES ---
  const featuredItems = [
    {
      id: 1,
      bgTitle: "Voltaire",
      subtitle: (homepageImages && homepageImages['featured_1_text']?.subtitle) || "Exposition Temporaire",
      title: [
        (homepageImages && homepageImages['featured_1_text']?.title_1) || "Le Voltaire",
        (homepageImages && homepageImages['featured_1_text']?.title_2) || "Signature"
      ],
      showTitle2: (homepageImages && homepageImages['featured_1_text']?.show_title_2) !== false,
      desc: (homepageImages && homepageImages['featured_1_text']?.desc) || "\"Une renaissance historique pour l'époque contemporaine.\"",
      img: (homepageImages && homepageImages.featured_1) || "https://images.unsplash.com/photo-1567016432779-094069958ea5?q=80&w=1200",
      imgMobile: (homepageImages && homepageImages.featured_1_mobile) || (homepageImages && homepageImages.featured_1) || "https://images.unsplash.com/photo-1567016432779-094069958ea5?q=80&w=800",
      bgColor: "#fff9f0", // Carte 1: Blanc Crème
      textColor: "#1a1a1a",
      subColor: "#9C8268",
      faintColor: "rgba(0,0,0,0.03)"
    },
    {
      id: 2,
      bgTitle: "Console",
      subtitle: (homepageImages && homepageImages['featured_2_text']?.subtitle) || "Collection Permanente",
      title: [
        (homepageImages && homepageImages['featured_2_text']?.title_1) || "Console",
        (homepageImages && homepageImages['featured_2_text']?.title_2) || "Héritage"
      ],
      showTitle2: (homepageImages && homepageImages['featured_2_text']?.show_title_2) !== false,
      desc: (homepageImages && homepageImages['featured_2_text']?.desc) || "\"Formes épurées et assemblage traditionnel. L'équilibre parfait entre passé et présent.\"",
      img: (homepageImages && homepageImages.featured_2) || "https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?q=80&w=1200",
      imgMobile: (homepageImages && homepageImages.featured_2_mobile) || (homepageImages && homepageImages.featured_2) || "https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?q=80&w=800",
      bgColor: "#fcead6", // Carte 2: Sable Clair
      textColor: "#1a1a1a",
      subColor: "#9C8268",
      faintColor: "rgba(0,0,0,0.03)"
    },
    {
      id: 3,
      bgTitle: "Secrétaire",
      subtitle: (homepageImages && homepageImages['featured_3_text']?.subtitle) || "Pièce Unique",
      title: [
        (homepageImages && homepageImages['featured_3_text']?.title_1) || "Le Secrétaire",
        (homepageImages && homepageImages['featured_3_text']?.title_2) || "Secret"
      ],
      showTitle2: (homepageImages && homepageImages['featured_3_text']?.show_title_2) !== false,
      desc: (homepageImages && homepageImages['featured_3_text']?.desc) || "\"Bois de rose et marqueterie complexe. Un gardien de correspondances oubliées.\"",
      img: (homepageImages && homepageImages.featured_3) || "https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?q=80&w=1200",
      imgMobile: (homepageImages && homepageImages.featured_3_mobile) || (homepageImages && homepageImages.featured_3) || "https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?q=80&w=800",
      bgColor: "#f5d1a6", // Carte 3: Sable Doré Intense
      textColor: "#1a1a1a",
      subColor: "#9C8268",
      faintColor: "rgba(0,0,0,0.03)"
    },
    {
      id: 4,
      bgTitle: "Bibliothèque",
      subtitle: (homepageImages && homepageImages['featured_4_text']?.subtitle) || "Nouvelle Acquisition",
      title: [
        (homepageImages && homepageImages['featured_4_text']?.title_1) || "Bibliothèque",
        (homepageImages && homepageImages['featured_4_text']?.title_2) || "Céleste"
      ],
      showTitle2: (homepageImages && homepageImages['featured_4_text']?.show_title_2) !== false,
      desc: (homepageImages && homepageImages['featured_4_text']?.desc) || "\"Chêne massif et échelles en laiton. Une structure qui élève l'esprit.\"",
      img: (homepageImages && homepageImages.featured_4) || "https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?q=80&w=1200",
      imgMobile: (homepageImages && homepageImages.featured_4_mobile) || (homepageImages && homepageImages.featured_4) || "https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?q=80&w=800",
      bgColor: "#c48b68", // Carte 4: Terre Cuite (Nuance plus terreuse et chaleureuse)
      textColor: "#1a1a1a",
      subColor: "#9C8268",
      faintColor: "rgba(0,0,0,0.04)"
    }
  ];

  // --- STATS DYNAMIQUES (SECTION 12) ---
  const stats = [
    {
      // Priorité à la donnée Firebase (même vide), sinon défaut
      value: (homepageImages?.['stat_1_text']?.value !== undefined) ? homepageImages['stat_1_text'].value : "15",
      suffix: (homepageImages?.['stat_1_text']?.suffix !== undefined) ? homepageImages['stat_1_text'].suffix : "+",
      label: (homepageImages?.['stat_1_text']?.label !== undefined) ? homepageImages['stat_1_text'].label : "Années d'excellence"
    },
    {
      value: (homepageImages?.['stat_2_text']?.value !== undefined) ? homepageImages['stat_2_text'].value : "400",
      suffix: (homepageImages?.['stat_2_text']?.suffix !== undefined) ? homepageImages['stat_2_text'].suffix : "h",
      label: (homepageImages?.['stat_2_text']?.label !== undefined) ? homepageImages['stat_2_text'].label : "Heures par projet"
    },
    {
      value: (homepageImages?.['stat_3_text']?.value !== undefined) ? homepageImages['stat_3_text'].value : "1500",
      suffix: (homepageImages?.['stat_3_text']?.suffix !== undefined) ? homepageImages['stat_3_text'].suffix : "",
      label: (homepageImages?.['stat_3_text']?.label !== undefined) ? homepageImages['stat_3_text'].label : "Outils traditionnels"
    },
    {
      value: (homepageImages?.['stat_4_text']?.value !== undefined) ? homepageImages['stat_4_text'].value : "85",
      suffix: (homepageImages?.['stat_4_text']?.suffix !== undefined) ? homepageImages['stat_4_text'].suffix : "+",
      label: (homepageImages?.['stat_4_text']?.label !== undefined) ? homepageImages['stat_4_text'].label : "Patrimoines sauvés"
    }
  ];

  // --- NAVIGATION SMOOTH V2 ---
  const handleNavigation = (selector) => {
    // 1. Transition vers Marketplace (Sync avec le Menu & App.jsx)
    if (selector === 'marketplace') {

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

  // --- PRE-WARM: Force GPU layer creation & position calculation ---
  useEffect(() => {
    const warmUpAnimations = () => {
      // 1. Collect ALL dynamic images for preloading
      const dynamicImages = [
        ...Object.values(homepageImages).filter(val => typeof val === 'string' && val.startsWith('http')),
        "https://images.unsplash.com/photo-1595428774223-ef52624120d2?q=80&w=1200",
        "https://images.unsplash.com/photo-1618220179428-22790b461013?q=80&w=1200"
      ];

      // 2. Load images into browser cache immediately
      dynamicImages.forEach(src => {
        const img = new Image();
        img.src = src;
      });

      // 3. Force GPU layers on key animated elements
      // NOTE: .card-visual is EXCLUDED — StackedCards manages its own GPU layers via GSAP force3D:true
      const animatedElements = document.querySelectorAll(
        '.process-card, .manifesto-item, .team-section, .data-section, .img-parallax img'
      );
      animatedElements.forEach(el => {
        if (el) {
          el.style.willChange = 'transform, opacity';
          el.style.transform = 'translate3d(0, 0, 0)';
          el.style.backfaceVisibility = 'hidden';
          el.style.webkitBackfaceVisibility = 'hidden';
        }
      });
    };

    // Execute warm-up after a short delay to let DOM stabilize
    setTimeout(warmUpAnimations, 100);
  }, []);

  // --- PRELOADER STATE ---
  const [isLoading, setIsLoading] = useState(() => {
    return typeof window !== 'undefined' ? !window.hasShownPreloader : true;
  });

  // --- GSAP ORCHESTRATION (SIMPLIFIED & ROBUST) ---

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
          ScrollTrigger.refresh();
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

        // 2. Curtain Exit - Rapide et Tranchant
        .addLabel("exit", "+=0.0") // Départ immédiat (Snappy)
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
            ScrollTrigger.refresh(true);
          }, 400);
        });
    });

    return () => ctx.revert();
  }, [scriptsLoaded]);

  // --- INITIALISATION LENIS (Same behavior as old CDN v1.0.42) ---
  useEffect(() => {
    if (!scriptsLoaded) return;
    const isMobileDevice = window.innerWidth < 1024;
    const lenis = new Lenis({
      duration: isMobileDevice ? 0.5 : 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      smoothTouch: true,
      touchMultiplier: isMobileDevice ? 0.8 : 2,
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

    // NOTE: ignoreMobileResize and lagSmoothing(0) were removed.
    // They were safe when HomeView used a separate CDN GSAP instance,
    // but now that all components share the same GSAP, they corrupt StackedCards' animations.

    const ctx = gsap.context(() => {
      // 2. Disparition 3D + PAUSE (Save GPU for Section 10)
      ScrollTrigger.create({
        trigger: ".hero-section",
        start: "bottom top",
        onEnter: () => {
          // FORCE PAUSE IMMEDIATE
          window._pauseThree = true;
        },
        onLeaveBack: () => {
          window._pauseThree = false;
        }
      });

      gsap.to('.three-container', {
        opacity: 0,
        // No Y movement to avoid background clipping/jumps on mobile resize
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
          start: "top 60%", // Delayed trigger to avoid edge flicker
          end: "bottom 40%",
          preventOverlaps: true, // Crucial for rapid scrolling
          fastScrollEnd: true,
          onEnter: () => gsap.to(document.body, { backgroundColor: theme.bg, color: theme.color, duration: 1.2, ease: "power2.inOut", overwrite: "auto" }),
          onEnterBack: () => gsap.to(document.body, { backgroundColor: theme.bg, color: theme.color, duration: 1.2, ease: "power2.inOut", overwrite: "auto" }),
        });
      });

      // 4a. Manifesto Title Animation (Global - Scoped)
      // Targeting the specific intro block
      gsap.from('.manifesto > div:first-child span', {
        y: 30, opacity: 0, duration: 1, ease: "power3.out",
        scrollTrigger: { trigger: ".manifesto", start: "top 75%", once: true }
      });
      gsap.from('.manifesto > div:first-child h2', {
        y: 40, opacity: 0, duration: 1.2, delay: 0.1, ease: "power3.out",
        scrollTrigger: { trigger: ".manifesto", start: "top 75%", once: true }
      });

      // 4b. Galerie Manifesto - RESPONSIVE OPTIMIZATION
      const mm = gsap.matchMedia();

      // DESKTOP: Cinematic Parallax & Scale
      mm.add("(min-width: 1024px)", () => {
        // Shared Parallax Logic for Desktop
        gsap.utils.toArray('.manifesto-item .img-parallax img').forEach((img) => {
          gsap.fromTo(img,
            { scale: 1.2, yPercent: -8 }, // Safe scale (20% buffer for 16% movement)
            {
              yPercent: 8,
              scale: 1.2,
              ease: "none",
              force3D: true,
              scrollTrigger: {
                trigger: img.parentElement,
                start: "top bottom",
                end: "bottom top",
                scrub: 1 // Smooth scrub
              }
            }
          );
        });

        // Item Entry
        gsap.utils.toArray('.manifesto-item').forEach((item) => {
          gsap.from(item, {
            y: 100, opacity: 0, scale: 0.95, duration: 1.5,
            scrollTrigger: { trigger: item, start: "top 90%", toggleActions: "play none none reverse" }
          });
        });
      });

      // MOBILE: Intelligent Parallax & Soft Reveal (Premium Feel)
      mm.add("(max-width: 1023px)", () => {
        // 1. Image Parallax (The "Intelligent" part)
        // Moves the image inside its container based on scroll for a "living" window effect
        gsap.utils.toArray('.manifesto-item .img-parallax img').forEach((img) => {
          gsap.fromTo(img,
            { scale: 1.25, yPercent: -10 }, // Increased scale to prevent white gaps
            {
              yPercent: 10,
              scale: 1.25,
              ease: "none",
              force3D: true,
              scrollTrigger: {
                trigger: img.parentElement,
                start: "top bottom",
                end: "bottom top",
                scrub: 1 // Reduced scrub slightly for responsiveness
              }
            }
          );
        });

        // 2. Content Reveal (The "Smooth" part)
        // Decomposed animation: Image first, then Text
        gsap.utils.toArray('.manifesto-item').forEach((item) => {
          const imgWrapper = item.querySelector('.img-parallax');
          const textWrapper = item.querySelector('div:not(.img-parallax)'); // Select text container

          // Image Entry
          if (imgWrapper) {
            gsap.from(imgWrapper, {
              y: 60,
              opacity: 0,
              duration: 1.2,
              ease: "power3.out",
              clearProps: "transform, opacity", // Clean up for parallax
              scrollTrigger: {
                trigger: item,
                start: "top 80%", // Reveal when comfortably in view
                once: true
              }
            });
          }

          // Text Entry (Staggered)
          if (textWrapper) {
            gsap.from(textWrapper, {
              y: 40,
              opacity: 0,
              duration: 1.0,
              delay: 0.2, // Wait for image to establish presence
              ease: "power2.out",
              scrollTrigger: {
                trigger: item,
                start: "top 80%",
                once: true
              }
            });
          }
        });
      });

      // 5. Scroll Horizontal (PROCESS) - REPLACED BY NEW COMPONENT <ProcessSection />
      // Legacy GSAP logic removed to avoid conflicts.

      // 6. STACKING CARDS LOGIC REMOVED (Handled by StackedCards.jsx)


      // 8. Profile Section - Architectural Editorial Reveal (Frontmaster A.01, A.04, A.11)
      // Reveal Text Lines for Name (Masked)
      const nameLines = gsap.utils.toArray('.name-reveal-line');
      if (nameLines.length > 0) {
        gsap.to(nameLines, {
          y: 0,
          duration: 1.5,
          ease: "expo.out",
          stagger: 0.2,
          scrollTrigger: {
            trigger: '.team-section',
            start: "top 70%",
            once: true
          }
        });
      }

      // Quote Reveal (Bordure + Mots avec flou cinétique)
      const quoteWords = gsap.utils.toArray('.quote-word');
      const quoteBorder = document.querySelector('.quote-border');
      
      if (quoteWords.length > 0) {
        const quoteTl = gsap.timeline({
          scrollTrigger: {
            trigger: '.team-section',
            start: "top 65%",
            once: true
          }
        });

        // 1. La bordure s'étire
        quoteTl.fromTo(quoteBorder, 
          { scaleY: 0 }, 
          { scaleY: 1, duration: 1, ease: "slow(0.7, 0.7, false)" }
        );

        // 2. Les mots glissent et deviennent nets (A.02/A.04 hybride)
        quoteTl.fromTo(quoteWords, {
          opacity: 0,
          x: -10,
          filter: 'blur(10px)',
          scale: 0.9
        }, {
          opacity: 0.6,
          x: 0,
          filter: 'blur(0px)',
          scale: 1,
          stagger: 0.02,
          duration: 1,
          ease: "back.out(1.7)"
        }, "-=0.5");
      }

      // Experience Counter (A.11)
      const expValue = homepageImages['team_main_text']?.exp_years || "15";
      const expNum = parseInt(expValue.match(/\d+/) || [0])[0];
      const counterTarget = { val: 0 };
      const counterEl = document.querySelector('.exp-counter');

      if (counterEl) {
        gsap.to(counterTarget, {
          val: expNum || 15,
          duration: 3,
          ease: "power3.inOut",
          scrollTrigger: {
            trigger: '.team-section',
            start: "top 50%",
            once: true
          },
          onUpdate: () => {
             // Si c'est en chiffres romains dans la donnée, on garde un truc spécial ou juste le chiffre
             counterEl.innerText = Math.round(counterTarget.val);
          }
        });
      }

      // Elements secondaires (Titre de section)
      gsap.from('.team-tag', {
        opacity: 0,
        x: -20,
        letterSpacing: "0.4em",
        duration: 2,
        ease: "power4.out",
        scrollTrigger: {
          trigger: '.team-section',
          start: "top 75%",
          once: true
        }
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

  // --- NOUVELLE ANIMATION DÉDIÉE AUX STATS ---
  useEffect(() => {
    if (!homepageImages) return;

    let ctx;
    const timer = setTimeout(() => {
      if (!componentRef.current) return;

      ctx = gsap.context(() => {
        const statNumbers = gsap.utils.toArray('.stat-number');

        statNumbers.forEach(num => {
          const targetAttr = num.getAttribute('data-target');
          const target = targetAttr ? parseInt(targetAttr) : 0;

          gsap.killTweensOf(num);

          gsap.fromTo(num,
            { innerText: 0 },
            {
              innerText: target,
              duration: 3,
              snap: { innerText: 1 },
              ease: "expo.out",
              scrollTrigger: {
                trigger: num,
                start: "top 90%",
                toggleActions: "restart none none reverse"
              }
            }
          );
        });
      }, componentRef);
    }, 100);

    return () => {
      clearTimeout(timer);
      if (ctx) ctx.revert();
    };
  }, [homepageImages]);




  // DONNÉES FAQ
  // DONNÉES FAQ (DYNAMIQUES)
  const faqItems = [
    {
      q: homepageImages['faq_main_text']?.q1 || "Comment se déroule la restauration d'un meuble ?",
      a: homepageImages['faq_main_text']?.a1 || "Chaque projet commence par une analyse approfondie de l'état du meuble. Nous établissons un diagnostic précis avant de procéder au nettoyage, à la consolidation structurelle, puis aux finitions respectueuses de l'époque."
    },
    {
      q: homepageImages['faq_main_text']?.q2 || "Puis-je personnaliser les finitions ?",
      a: homepageImages['faq_main_text']?.a2 || "Absolument. Bien que nous privilégions les techniques traditionnelles, nous pouvons adapter la teinte, le vernis ou le tissu pour que la pièce s'intègre parfaitement à votre intérieur contemporain."
    },
    {
      q: homepageImages['faq_main_text']?.q3 || "Utilisez-vous des produits écologiques ?",
      a: homepageImages['faq_main_text']?.a3 || "Oui, nous privilégions les cires naturelles, les huiles végétales et les vernis à l'eau ou au tampon (gomme laque) pour garantir la santé de votre intérieur et celle de la planète."
    },
    {
      q: homepageImages['faq_main_text']?.q4 || "Quels sont les délais moyens ?",
      a: homepageImages['faq_main_text']?.a4 || "Cela dépend de la complexité de la restauration. Comptez en moyenne 4 à 8 semaines pour une restauration complète. Chaque étape de séchage et de pose est cruciale et ne peut être accélérée."
    },
    {
      q: homepageImages['faq_main_text']?.q5 || "Livrez-vous à l'international ?",
      a: homepageImages['faq_main_text']?.a5 || "Oui, nous organisons l'expédition sécurisée de nos pièces dans le monde entier, avec des caisses de transport sur-mesure pour garantir une protection optimale."
    }
  ];

  // SEO component is already imported at the top.
  // We just need to ensure it is used correctly in the return statement.

  return (
    <div ref={componentRef} className="bg-[#FAF9F6] text-[#1a1a1a] transition-colors duration-700 antialiased">
      <SEO
        title="Rénovation d'Anciennes Tables de Ferme et de Meubles"
        description="Atelier de restauration de mobilier à Ifs (14123). Vente de meubles normands authentiques en chêne : tables de ferme, armoires parisiennes et buffets. Livraison Caen, Deauville, toute la France et pays frontaliers. Tel: 07 77 32 41 78."
        schema={{
          "@context": "https://schema.org",
          "@type": "FurnitureStore",
          "name": "Tous à Table Made in Normandie",
          "alternateName": "Tous à Table — Ameublement",
          "image": "https://firebasestorage.googleapis.com/v0/b/tousatable-client.appspot.com/o/sys_assets%2Fog_cover.jpg?alt=media",
          "@id": "https://tousatable-madeinnormandie.fr",
          "url": "https://tousatable-madeinnormandie.fr",
          "telephone": "+33 7 77 32 41 78",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "346 Chemin de Fleury",
            "addressLocality": "Ifs",
            "addressRegion": "Normandie",
            "postalCode": "14123",
            "addressCountry": "FR"
          },
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": 49.1417,
            "longitude": -0.3472
          },
          "priceRange": "€€-€€€",
          "description": "Atelier de restauration de mobilier à Ifs (14123). Vente de meubles normands authentiques en chêne : tables de ferme, armoires parisiennes et buffets. Livraison sur Caen, Deauville, toute la Normandie, la France et pays frontaliers.",
          "openingHoursSpecification": [
            {
              "@type": "OpeningHoursSpecification",
              "dayOfWeek": [
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday"
              ],
              "opens": "09:00",
              "closes": "19:00"
            }
          ]
        }}
      />





      {/* --- PREMIUM PRELOADER (LUMOSINE STYLE) --- */}
      {
        isLoading && (
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

                </div>
              </div>
            </div>
          </>
        )
      }

      <div id="main-cursor" ref={cursorRef} className="hidden lg:block"></div>
      <div className="three-container fixed inset-0 pointer-events-none z-0">
        <React.Suspense fallback={null}>
          <ThreeBackground />
        </React.Suspense>
      </div>

      {/* NAVIGATION */}
      {/* NAVIGATION - FIXED SAFE AREA */
        /* Increased to max(3rem) for tablets with thick status bars */
      }
      <header className="fixed top-0 left-0 w-full p-5 md:p-12 pt-[max(2rem,env(safe-area-inset-top))] pr-[max(1.5rem,env(safe-area-inset-right))] pl-[max(1.5rem,env(safe-area-inset-left))] flex justify-between items-center z-[210] mix-blend-difference text-white">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <Hammer size={18} className="group-hover:rotate-45 transition-transform duration-500" />
          <span className="font-serif text-xl tracking-widest uppercase font-light italic text-white">Tous à Table</span>
        </div>
        {/* BOUTON MENU ANIMÉ */}
        <button onClick={() => { setIsMenuOpen(!isMenuOpen); setMenuInteracted(true); }} className="flex items-center gap-4 group focus:outline-none">
          <span className={`text-[9px] uppercase tracking-[0.4em] transition-opacity duration-500 ${isMenuOpen ? 'opacity-100' : 'opacity-40 group-hover:opacity-100'}`}>Menu</span>

          {/* ANIMATION HAMBURGER -> CROIX (Lucide Icons) */}
          <div className="relative w-6 h-6 flex items-center justify-center">
            <Menu strokeWidth={1} className={`absolute w-6 h-6 text-white transition-all duration-500 ease-in-out ${isMenuOpen ? 'opacity-0 rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'}`} />
            <X strokeWidth={1} className={`absolute w-6 h-6 text-white transition-all duration-500 ease-in-out ${isMenuOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50'}`} />
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
      {/* [SECTION 07: HERO] */}
      {/* FIX: Use svh (Small Viewport Height) instead of dvh to prevent jump when address bar hides */}
      <section className="hero-section relative h-[100svh] flex flex-col justify-center px-6 md:px-12 lg:px-[10vw] z-10 pb-12 md:pb-32">
        {/* Title resized to 10.5vw (was 12.5) to free up vertical space for bottom text */}
        <h1 className="font-serif text-[18vw] md:text-[10.5vw] leading-[0.8] uppercase flex flex-col font-light text-[#1a1a1a] mix-blend-multiply">
          <span className="sr-only">Restauration de mobilier normand et meubles anciens à Caen</span>
          <RevealText text="Le Geste" />
          <div className="flex items-center gap-4 self-end md:mr-[8vw] mt-2 md:mt-0">
            <RevealText text="& L'Âme" className="text-[#9C8268] italic pt-[0.25em] -mt-[0.25em]" />
          </div>
        </h1>

        <div className="absolute bottom-16 md:bottom-12 left-0 w-full px-8 md:px-[10vw] flex flex-row justify-between items-end md:items-baseline">
          <div className="hero-footer-element space-y-4 max-w-[150px] md:max-w-xs text-[#1a1a1a] opacity-0 translate-y-5">
            <p className="text-[10px] uppercase tracking-[0.2em] md:tracking-[0.3em] opacity-60 leading-relaxed md:leading-loose font-medium">
              Restauration de Mobilier Normand.<br />
              Vente de Meubles Anciens.<br />
              France, Normandie.
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
        <div className="grid grid-cols-1 2xl:grid-cols-12 gap-16 md:gap-20 2xl:gap-32 items-center">
          <div className="manifesto-item 2xl:col-span-6 space-y-8 flex flex-col items-center 2xl:block 2xl:space-y-12 text-center 2xl:text-left">
            <div className="img-parallax aspect-[3/4] shadow-2xl w-full max-w-xl 2xl:max-w-none mx-auto overflow-hidden">
              <img
                src={homepageImages['manifesto_1'] || "https://images.unsplash.com/photo-1595428774223-ef52624120d2?q=80&w=1200"}
                className="w-full h-full object-cover will-change-transform"
                alt="Table en Chêne"
                decoding="async"
                loading="lazy"
              />
            </div>
            <div className="mx-auto 2xl:mx-0 max-w-lg">
              <h3
                className="font-serif text-4xl md:text-5xl italic mb-4 text-[#1a1a1a] md:whitespace-nowrap"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(homepageImages['manifesto_1_text']?.title || "Le Plateau d'Antan") }}
              />
              <p className="text-[10px] md:text-xs opacity-60 font-light leading-relaxed uppercase tracking-[0.25em] text-[#1a1a1a]">
                {homepageImages['manifesto_1_text']?.desc || "Chêne de pays — Finition à la cire d'abeille."}
              </p>
            </div>
          </div>

          <div className="manifesto-item 2xl:col-span-4 2xl:col-start-9 2xl:mt-40 space-y-8 flex flex-col items-center 2xl:block 2xl:space-y-12 text-center 2xl:text-left">
            <div className="img-parallax aspect-[4/5] shadow-2xl w-full max-w-xl 2xl:max-w-none mx-auto overflow-hidden">
              <img
                src={homepageImages['manifesto_2'] || "https://images.unsplash.com/photo-1618220179428-22790b461013?q=80&w=2000&auto=format&fit=crop"}
                className="w-full h-full object-cover will-change-transform"
                alt="Console de style"
                decoding="async"
                loading="lazy"
              />
            </div>
            <div className="text-center 2xl:text-left mx-auto 2xl:mx-0 max-w-lg">
              <h3
                className="font-serif text-4xl md:text-5xl italic mb-4 text-[#1a1a1a] md:whitespace-nowrap"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(homepageImages['manifesto_2_text']?.title || "La Console Royale") }}
              />
              <p className="text-[10px] md:text-xs uppercase tracking-[0.25em] opacity-60 font-light text-[#1a1a1a]">
                {homepageImages['manifesto_2_text']?.desc || "Noyer sculpté — XIXème siècle."}
              </p>
            </div>
          </div>

          <div className="manifesto-item 2xl:col-span-12 2xl:mt-40 flex flex-col 2xl:flex-row gap-12 2xl:gap-20 items-center">
            <div className="w-full max-w-xl 2xl:max-w-none 2xl:w-3/5 img-parallax aspect-[4/3] md:aspect-[3/2] shadow-2xl mx-auto 2xl:mx-0 overflow-hidden">
              <img
                src={homepageImages['manifesto_3'] || "https://images.unsplash.com/photo-1567016432779-094069958ea5?q=80&w=1400"}
                className="w-full h-full object-cover will-change-transform"
                alt="Commode ancienne"
                decoding="async"
                loading="lazy"
              />
            </div>
            <div className="w-full max-w-lg 2xl:max-w-none 2xl:w-2/5 space-y-8 mx-auto 2xl:mx-0">
              <h3
                className="font-serif text-4xl md:text-5xl lg:text-6xl italic leading-tight text-[#1a1a1a] md:whitespace-nowrap"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(homepageImages['manifesto_3_text']?.title || "La Renaissance <br /> d'un Chef-d'œuvre") }}
              />
              <p className="text-[10px] md:text-xs opacity-60 font-light leading-relaxed uppercase tracking-[0.25em] text-[#1a1a1a]">
                {homepageImages['manifesto_3_text']?.desc || "Après 400 heures de restauration méticuleuse, cette pièce a retrouvé sa profondeur originelle. Un dialogue suspendu entre le XVIIIème et aujourd'hui."}
              </p>
              <button onClick={onEnterMarketplace} className="flex items-center gap-6 group">
                <div className="w-14 h-14 rounded-full border border-black/10 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all duration-500">
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </div>
                <span className="text-[10px] uppercase tracking-[0.4em] text-[#1a1a1a]">
                  {homepageImages['manifesto_3_text']?.btn || "Découvrir la pièce"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* [SECTION 10: PROCESS] */}
      {/* HYBRID: Vertical Zig-Zag until Big PC (1920px), Horizontal (h-[100dvh]) for 1920px+ */}
      {/* [SECTION 10: PROCESS] - Hybrid Component (ZigZag < 1920px, Horizontal >= 1920px) */}
      <ProcessSection homepageImages={homepageImages} />

      {/* [SECTION 11: FEATURED - Stacked Cards (Paris Replica)] */}
      <StackedCards
        items={featuredItems}
        onEnterMarketplace={onEnterMarketplace}
      />


      {/* [SECTION 12: RENDU - DATA (REWORK STYLE LUMOSINE - ALIGNÉ)] */}
      < section className="data-section relative py-40 bg-[#111111] text-[#FAF9F6] overflow-hidden" style={{ contain: 'layout' }} >

        {/* Marquee stylisé : Ticker de luxe */}
        < div className="marquee-wrapper border-y border-white/5 bg-[#0a0a0a] py-12 mb-40" >
          <div className="flex whitespace-nowrap animate-marquee">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-12 md:gap-24 mx-8 md:mx-12">
                <span className="font-serif text-5xl md:text-8xl font-light italic uppercase text-white tracking-[0.15em]">
                  {homepageImages['ticker_text']?.text_left || "Patrimoine Durable"}
                </span>
                <Hammer className="w-6 h-6 md:w-12 md:h-12 text-[#9C8268] opacity-60" strokeWidth={1.5} />
                <span className="font-serif text-5xl md:text-8xl font-light uppercase opacity-20 italic tracking-[0.15em] text-white">
                  {homepageImages['ticker_text']?.text_right || "L'Excellence du geste"}
                </span>
                <Hammer className="w-6 h-6 md:w-12 md:h-12 text-[#9C8268] opacity-60" strokeWidth={1.5} />
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
                    <Hammer size={18} className="opacity-20 group-hover:opacity-100 group-hover:text-[#9C8268] transition-all duration-700" />
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
              <p className="text-xs md:text-lg font-light opacity-40 leading-relaxed uppercase tracking-[0.2em]">
                Ces données ne sont pas que des chiffres, elles sont le reflet de milliers d'heures de passion dévouées à la transmission du patrimoine normand.
              </p>
            </div>
            <div className="flex flex-col items-end gap-6">
              <div className="w-52 h-[1px] bg-white/10"></div>
              <span className="text-[11px] uppercase tracking-[0.6em] opacity-30">Atelier Tous à Table © — Archive 2026</span>
            </div>
          </div>
        </div >
      </section >

      {/* [SECTION 13: RENDU - TEAM (DIRECTION) - PURE CSS STICKY SPLIT SCROLL] */}
      <section className="team-section relative bg-[#FAF9F6] z-10" style={{ contain: 'layout' }}>
        {/* Wrapper Flex pour le split - align-items: flex-start est crucial */}
        <div className="flex flex-col md:flex-row items-start">

          {/* COLONNE GAUCHE (TEXTE) - STICKY */}
          {/* md: tablettes (768px+), lg: laptops (1024px+), xl: desktops (1280px+) */}
          <div className="w-full md:w-1/2 md:sticky md:top-0 md:h-auto lg:h-screen flex flex-col md:justify-start lg:justify-center px-8 md:px-8 lg:px-[6vw] pt-24 pb-0 md:pt-[15vh] md:pb-16 lg:py-0 text-[#1a1a1a]">
            {/* Espacement interne augmenté : space-y-8 (was space-y-6) */}
            <div className="space-y-8 md:space-y-8 lg:space-y-10">
              <span className="team-tag text-[10px] md:text-[11px] lg:text-[12px] uppercase tracking-[1.4em] text-[#9C8268] block font-black italic">La Direction</span>
              
              {/* Name Split Reveal (A.01 MaskSlideUp) */}
              <h2 className="font-serif text-5xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-[8vw] leading-[1.1] md:leading-[0.9] font-light italic tracking-tight text-[#1a1a1a]">
                <div className="overflow-hidden block">
                  <span className="name-reveal-line inline-block translate-y-full">
                    {homepageImages['team_main_text']?.name_line1 || "Jean"}
                  </span>
                </div>
                <div className="overflow-hidden block">
                  <span className="name-reveal-line inline-block translate-y-full">
                    {homepageImages['team_main_text']?.name_line2 || "Lefebvre"}
                  </span>
                </div>
              </h2>
            </div>

            {/* Quote Reveal (A.04 WordByWordFade Amélioré) */}
            <p className="text-base md:text-lg lg:text-xl font-light leading-loose italic pl-6 md:pl-6 lg:pl-8 xl:pl-10 mt-12 md:mt-8 lg:mt-12 overflow-hidden relative">
               {/* Bordure animée séparée */}
               <span className="quote-border absolute left-0 top-0 bottom-0 w-[1px] bg-black/20 origin-top transform-gpu" />
               
               {(homepageImages['team_main_text']?.quote || "On ne sauve pas un meuble pour qu'il paraisse neuf, mais pour qu'il reste vrai. L'imperfection est la signature de l'histoire, je suis juste là pour qu'elle continue.").split(' ').map((word, i) => (
                 <span key={i} className="quote-word inline-block mr-[0.25em] will-change-[transform,opacity,filter]">
                   {word}
                 </span>
               ))}
            </p>

            {/* Marge augmentée : mt-12 (was mt-8) */}
            <div className="flex gap-6 md:gap-8 lg:gap-12 xl:gap-16 pt-8 md:pt-8 lg:pt-12 border-t border-black/5 items-center mt-12 md:mt-8 lg:mt-12">
              <div>
                <span className="block text-[9px] uppercase tracking-widest opacity-30 mb-2 font-black">Expérience</span>
                <span className="font-serif text-3xl md:text-4xl lg:text-5xl xl:text-6xl italic text-[#9C8268] flex items-baseline">
                   <span className="exp-counter">0</span>
                   <span className="ml-2 text-xl md:text-2xl opacity-60">Ans</span>
                </span>
              </div>
              <div className="w-[1px] h-12 bg-black/5"></div>
              <Hammer size={32} className="text-[#9C8268] opacity-60" strokeWidth={1.5} />
            </div>
          </div>

          {/* COLONNE DROITE (IMAGE) - SCROLLABLE, PLUS HAUTE */}
          {/* Mobile: pt-16 (Gap entre texte et image), pb-24 (Marge bas symétrique à pt-24 du haut) */}
          <div className="w-full md:w-1/2 md:min-h-[160vh] lg:min-h-[150vh] flex flex-col justify-start px-8 md:px-8 lg:px-[4vw] pt-16 pb-24 md:pt-[15vh] md:pb-[20vh] lg:py-[15vh] bg-[#FAF9F6]">
            <div className="relative w-full aspect-[3/4] md:aspect-[2/3] shadow-[0_80px_160px_rgba(0,0,0,0.15)] bg-stone-200 overflow-hidden">
              <img
                src={homepageImages['team_main'] || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1600"}
                alt="Maître Ebéniste"
                className="w-full h-full object-cover force-color-tablet 2xl:grayscale 2xl:hover:grayscale-0 transition-all duration-1000"
              />
              <RotatingSymbol className="absolute -bottom-16 -right-16 text-[#9C8268] opacity-20" size={200} />
            </div>
          </div>

        </div>
      </section>

      {/* [SECTION 13.5 : FAQ - Layout Centré Simple] */}
      <section className="faq-section py-24 md:py-40 px-8 md:px-[10vw] bg-[#F0F2EB] text-[#1a1a1a]" style={{ contain: 'layout' }}>
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
                className="w-full h-full object-cover scale-110 hover:scale-100 transition-transform duration-[2s] ease-out force-color-tablet 2xl:grayscale 2xl:hover:grayscale-0"
              />
            </div>

          </div>
        </div>
      </section>
    </div >
  );
};

export default App;