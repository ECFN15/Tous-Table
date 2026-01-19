import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';
import { Hammer, Menu, X, ArrowRight, Instagram, ArrowDown, Star, Zap, Plus, Minus } from 'lucide-react';
import * as THREE from 'three';

// --- COMPOSANT : REVEAL TEXT (CORRIGÉ & ÉLARGI) ---
const RevealText = ({ text, className, delay = 0 }) => {
  return (
    <span className={`block overflow-hidden w-fit pb-[0.2em] pr-32 -mr-32 whitespace-nowrap ${className}`}>
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
        className="w-full py-5 flex justify-between items-center text-left group hover:pl-4 transition-all duration-300"
      >
        <h4 className="font-serif text-xl md:text-3xl text-[#1a1a1a] font-light italic pr-8">{question}</h4>
        <div className={`w-8 h-8 rounded-full border border-black/10 flex items-center justify-center transition-all duration-500 flex-shrink-0 ${isOpen ? 'bg-[#1a1a1a] text-white rotate-45' : 'bg-transparent text-[#1a1a1a] group-hover:bg-[#1a1a1a] group-hover:text-white'}`}>
          <Plus size={16} />
        </div>
      </button>
      <div
        ref={contentRef}
        style={{ height: isOpen ? contentRef.current?.scrollHeight : 0 }}
        className="overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
      >
        <div className="pb-6 text-sm md:text-base text-[#1a1a1a]/60 leading-relaxed max-w-lg font-light">
          {answer}
        </div>
      </div>
    </div>
  );
};

const App = ({ onEnterMarketplace }) => {
  const canvasRef = useRef(null);
  const cursorRef = useRef(null);
  const componentRef = useRef(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scriptsLoaded, setScriptsLoaded] = useState(false);

  // State pour la FAQ
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  // --- NAVIGATION SMOOTH ---
  const handleNavigation = (selector) => {
    setIsMenuOpen(false);
    setTimeout(() => {
      const element = document.querySelector(selector);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      } else if (selector === 'marketplace') {
        // Correctif: Si on change de page vers la marketplace, on l'appelle et on ARRETE là.
        // On évite ainsi le code suivant qui scrolle vers la section featured.
        if (onEnterMarketplace) {
          onEnterMarketplace();
          return;
        }

        // Fallback seulement si pas de fonction de navigation fournie
        const feat = document.querySelector('.featured-section');
        if (feat) feat.scrollIntoView({ behavior: 'smooth' });
      }
    }, 500); // Petit délai pour laisser le menu se fermer
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
      setScriptsLoaded(true);
    });
  }, []);

  // --- PRELOADER STATE ---
  const [isLoading, setIsLoading] = useState(true);
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    // Compteur esthétique
    const interval = setInterval(() => {
      setCounter(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
    }, 20); // 100 * 20ms = 2000ms (2 secondes)

    // Logique de fin de chargement
    const minTime = new Promise(resolve => setTimeout(resolve, 2000));
    const resources = document.fonts.ready; // Attente des polices

    Promise.all([minTime, resources]).then(() => {
      if (scriptsLoaded) {
        // Blocage du scroll PENDANT le chargement
        document.body.style.overflow = 'hidden';

        // Animation de sortie du preloader
        const tlLoader = window.gsap.timeline({
          onComplete: () => {
            setIsLoading(false);
            document.body.style.overflow = ''; // Release scroll
            // REFRESH AUTOMATIQUE: On laisse GSAP gérer, le force refresh manuel cause un lag visible.
          }
        });

        tlLoader.to('.preloader-count', {
          opacity: 0,
          y: -20,
          duration: 0.5,
          ease: "power2.out"
        })
          .to('.preloader-overlay', {
            yPercent: -100,
            duration: 1.4, // Slightly adjusted for snappier feel
            ease: "power4.inOut"
          }, "-=0.5") // Overlap with counter fade -> NO WHITE SCREEN DELAY
          .to('.hero-section .reveal-inner', {
            y: "0%",
            duration: 1.4,
            ease: "power4.out",
            stagger: 0
          }, "-=1.1") // Starts while curtain is lifting (early reveal)
          .to('.hero-footer-element', {
            opacity: 1,
            y: 0,
            duration: 1.2,
            stagger: 0.2,
            ease: "power3.out"
          }, "-=1.0"); // Flows immediately after title starts
      }
    });

    return () => clearInterval(interval);
  }, [scriptsLoaded]);

  // --- INITIALISATION LENIS ---
  useEffect(() => {
    if (!scriptsLoaded) return;

    // Config adaptée au mobile vs desktop (Tablettes incluses maintenant < 1024px)
    const isMobile = window.innerWidth < 1024;

    const lenis = new window.Lenis({
      duration: isMobile ? 0.5 : 1.2, // Mobile: Durée courte pour arrêter l'inertie rapidement
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      smoothTouch: true, // IMPORTANT: Force Lenis à gérer le scroll tactile pour appliquer nos réglages
      touchMultiplier: isMobile ? 0.8 : 2, // Mobile: Sensibilité naturelle mais contrôlée
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, [scriptsLoaded]);

  // --- THREE.JS BACKGROUND ---
  useEffect(() => {
    if (!canvasRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 18;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    canvasRef.current.appendChild(renderer.domElement);

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 5, 5);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));

    const geometry = new THREE.TorusKnotGeometry(4, 1.2, 120, 16, 2, 3);
    const material = new THREE.MeshBasicMaterial({
      color: 0x9C8268,
      wireframe: true,
      transparent: true,
      opacity: 0.09
    });

    const mesh = new THREE.Mesh(geometry, material);

    // ADJUST: Scale down for mobile (initial)
    if (window.innerWidth < 768) {
      mesh.scale.set(0.6, 0.6, 0.6);
    }

    scene.add(mesh);

    let animationId;
    const animate = () => {
      // OPTIM: Pause rendering if loading to free up CPU for init
      // On utilise une ref ou check direct, ici on laisse tourner mais on réduit la charge si besoin
      mesh.rotation.x += 0.0008;
      mesh.rotation.y += 0.0012;
      renderer.render(scene, camera);
      animationId = requestAnimationFrame(animate);
    };
    // Démarrage immédiat pour éviter l'effet de "toggling" ou d'absence au reveal
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);

      // ADJUST: Reactive scale on resize
      if (window.innerWidth < 768) {
        mesh.scale.set(0.6, 0.6, 0.6);
      } else {
        mesh.scale.set(1, 1, 1);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      if (canvasRef.current && renderer.domElement) {
        canvasRef.current.removeChild(renderer.domElement);
      }
      geometry.dispose();
      renderer.dispose();
    };
  }, []); // THREE.JS: Init ONCE on mount. Runs behind preloader. No dependency on isLoading to avoid re-init bugs.

  // Ref to store the Hero timeline so we can play it later
  // --- GSAP ORCHESTRATION (SIMPLIFIED & ROBUST) ---
  const tlHeroRef = useRef(null); // Keep ref definition to avoid breaking other code if referenced, but we won't strictly use it for the timeline.

  useLayoutEffect(() => {
    if (!scriptsLoaded) return;

    const ctx = gsap.context(() => {
      // 1. SETUP: Force hidden state immediately
      // Using 200% to ensure text fully clears the container padding (prevents "frozen top" glitch)
      gsap.set('.hero-section .reveal-inner', { y: "200%" });
      gsap.set('.hero-footer-element', { opacity: 0, y: 20 });
    }, componentRef);

    return () => ctx.revert();
  }, [scriptsLoaded]);

  // 2. TRIGGER: (LOGIC MOVED TO LOAD TIMELINE FOR BETTER SYNC)
  // The separate useEffect for title/footer reveal has been removed to eliminate the delay gap.


  // --- GSAP ORCHESTRATION ---
  useLayoutEffect(() => {
    if (!scriptsLoaded) return;
    const { gsap, ScrollTrigger } = window;

    const ctx = gsap.context(() => {
      // 2. Disparition 3D
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

      // 5. Scroll Horizontal (PROCESS)
      const horizontal = document.querySelector('.horizontal-content');
      if (horizontal) {
        const distanceToScroll = horizontal.scrollWidth - window.innerWidth;
        const xAnim = gsap.to(horizontal, {
          x: -distanceToScroll,
          ease: "none",
          scrollTrigger: {
            trigger: ".process-wrapper",
            start: "top top",
            end: () => "+=" + (distanceToScroll * 2.0),
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
            anticipatePin: 1
          }
        });

        // UNIFIED ANIMATION LOOP (ALL cards use horizontal trigger)
        const cards = gsap.utils.toArray('.process-card');

        cards.forEach((card, i) => {
          const img = card.querySelector('.img-box-process');

          // 1. Force Initial State (Hidden)
          gsap.set(img, { y: 40, opacity: 0, scale: 0.95 });

          // 2. TRIGGER: Always use containerAnimation
          // This ensures that even if Card 1 is off-screen on mobile, it waits for the horizontal scroll.
          // On Desktop, if it's already on-screen, "left 100%" is already true, so it fires immediately.
          const triggerConfig = {
            trigger: card,
            containerAnimation: xAnim,
            start: "left 100%", // Trigger exactly when entering viewport
            toggleActions: "play none none reverse"
          };

          // 3. Create Animation
          gsap.to(img, {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.5,
            ease: "power2.out",
            // Small stagger for the second card if it's visible simultaneously on desktop
            delay: (i === 1 && window.innerWidth > 768) ? 0.2 : 0,
            scrollTrigger: triggerConfig
          });
        });
      }

      // 6. STICKY CARDS ANIMATIONS
      const featuredSection = document.querySelector('.featured-section');
      const cards = gsap.utils.toArray('.featured-card');

      if (featuredSection && cards.length > 0) {
        const tlStack = gsap.timeline({
          scrollTrigger: {
            trigger: ".featured-section",
            start: "top top",
            end: () => "+=" + (window.innerHeight * cards.length * 1.5),
            pin: true,
            scrub: 1,
            anticipatePin: 1
          }
        });

        cards.forEach((card, i) => {
          const img = card.querySelector('.feat-img-anim');
          const text = card.querySelectorAll('.reveal-inner'); // Select text for timeline integration

          if (img) gsap.set(img, { scale: 1.2 });

          if (i === 0) {
            // For the first card (which is static), we need a separate trigger because it doesn't move in the timeline
            ScrollTrigger.create({
              trigger: card,
              start: "top 60%",
              onEnter: () => gsap.to(text, { y: 0, duration: 1.0, ease: "power3.out", stagger: 0.1 })
            });
            return;
          }

          tlStack.fromTo(card,
            { yPercent: 100 },
            { yPercent: 0, ease: "none", duration: 1 },
            ">+=0.5" // DELAY: "Freeze" effect - wait 0.5s before starting next card
          );

          // REVEAL TEXT: Integrated into timeline to guarantee visibility when card arrives
          tlStack.to(text, {
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            stagger: 0.05
          }, ">-0.5"); // Start revealing text slightly before card finishes settling

          const prevCard = cards[i - 1];
          const prevContent = prevCard.querySelector('.card-inner-content');

          tlStack.to(prevContent, {
            scale: 0.90,
            filter: "blur(5px)",
            opacity: 1,
            ease: "none",
            duration: 1
          }, "<");
        });

        // (Removed separate ScrollTrigger loop for text)

        // EFFET TRANSPARENCE HEADER (AJOUTÉ ICI)
        ScrollTrigger.create({
          trigger: ".featured-section",
          start: "top top",
          end: () => "+=" + (window.innerHeight * cards.length),
          onEnter: () => gsap.to("header", { opacity: 0.2, duration: 0.5, ease: "power2.out" }),
          onLeave: () => gsap.to("header", { opacity: 1, duration: 0.5, ease: "power2.out" }),
          onEnterBack: () => gsap.to("header", { opacity: 0.2, duration: 0.5, ease: "power2.out" }),
          onLeaveBack: () => gsap.to("header", { opacity: 1, duration: 0.5, ease: "power2.out" })
        });
      }

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

      // 8. Team Split Scroll (GSAP PINNING FORCE)
      // MODIF: Utilisation de matchMedia pour activer le pinning UNIQUEMENT sur Desktop (> 768px)
      // Sur mobile, le comportement reste statique (flux normal) pour éviter le chevauchement.
      const mm = gsap.matchMedia();

      mm.add("(min-width: 768px)", () => {
        ScrollTrigger.create({
          trigger: ".team-section",
          start: "top top",
          end: "bottom bottom",
          pin: ".team-text-wrapper",
          pinSpacing: false,
          scrub: true
        });
      });

      // Animation d'apparition du texte au début
      gsap.from('.team-content-reveal', {
        y: 50,
        opacity: 0,
        duration: 1,
        stagger: 0.1,
        scrollTrigger: { trigger: '.team-section', start: "top 60%" }
      });

      // 9. Curseur
      const moveCursor = (e) => {
        gsap.to(cursorRef.current, { x: e.clientX, y: e.clientY, duration: 0.3, ease: "power2.out" });
      };
      window.addEventListener('mousemove', moveCursor);

    }, componentRef);
    return () => ctx.revert();
  }, [scriptsLoaded]);

  // DONNÉES AVEC 4 PIÈCES (TITRES REGROUPÉS)
  const featuredItems = [
    {
      id: 1,
      bgTitle: "Voltaire",
      subtitle: "Exposition Temporaire",
      title: ["Le Voltaire", "Signature"],
      desc: "\"Une renaissance historique pour l'époque contemporaine.\"",
      img: "https://images.unsplash.com/photo-1567016432779-094069958ea5?q=80&w=1200",
      bgColor: "#FFFFFF"
    },
    {
      id: 2,
      bgTitle: "Méridienne",
      subtitle: "Collection Privée",
      title: ["Méridienne", "Impériale"],
      desc: "\"L'art du repos sublimé par un velours de soie restauré à la main.\"",
      img: "https://images.unsplash.com/photo-1550581190-9c1c48d21d6c?q=80&w=1200",
      bgColor: "#F3F4F6"
    },
    {
      id: 3,
      bgTitle: "Secrétaire",
      subtitle: "Pièce Unique",
      title: ["Le Secrétaire", "Secret"],
      desc: "\"Bois de rose et marqueterie complexe. Un gardien de correspondances oubliées.\"",
      img: "https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?q=80&w=1200",
      bgColor: "#E5E7EB"
    },
    {
      id: 4,
      bgTitle: "Bibliothèque",
      subtitle: "Nouvelle Acquisition",
      title: ["Bibliothèque", "Céleste"],
      desc: "\"Chêne massif et échelles en laiton. Une structure qui élève l'esprit.\"",
      img: "https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?q=80&w=1200",
      bgColor: "#D1D5DB"
    }
  ];

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

  return (
    <div ref={componentRef} className="bg-[#FAF9F6] text-[#1a1a1a] transition-colors duration-700 antialiased">


      {/* --- PRELOADER --- */}
      <div className="preloader-overlay fixed inset-0 z-[9999] bg-[#FAF9F6] flex flex-col items-center justify-center text-[#1a1a1a]">
        <div className="preloader-count font-serif text-8xl md:text-9xl italic font-light mix-blend-darken">
          {counter}
        </div>
      </div>

      <div id="main-cursor" ref={cursorRef}></div>
      <div className="three-container fixed inset-0 pointer-events-none z-0" ref={canvasRef}></div>

      {/* NAVIGATION */}
      <header className="fixed top-0 left-0 w-full p-8 md:p-12 flex justify-between items-center z-[210] mix-blend-difference text-white">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <Hammer size={18} className="group-hover:rotate-45 transition-transform duration-500" />
          <span className="font-serif text-xl tracking-widest uppercase font-light italic text-white">Tous à Table</span>
        </div>

        {/* BOUTON MENU ANIMÉ */}
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="flex items-center gap-4 group focus:outline-none">
          <span className={`text-[9px] uppercase tracking-[0.4em] transition-opacity duration-500 ${isMenuOpen ? 'opacity-100' : 'opacity-40 group-hover:opacity-100'}`}>Menu</span>

          {/* ANIMATION HAMBURGER -> CROIX */}
          <div className="w-6 h-4 flex flex-col justify-between">
            <span className={`block w-full h-[1px] bg-white transition-all duration-500 ease-in-out will-change-transform ${isMenuOpen ? 'rotate-45 translate-y-[7px]' : ''}`}></span>
            <span className={`block w-full h-[1px] bg-white transition-all duration-500 ease-in-out will-change-transform ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
            <span className={`block w-full h-[1px] bg-white transition-all duration-500 ease-in-out will-change-transform ${isMenuOpen ? '-rotate-45 -translate-y-[7px]' : ''}`}></span>
          </div>
        </button>
      </header>

      {/* MENU */}
      <div className={`fixed inset-0 z-[200] flex transition-all duration-1000 ${isMenuOpen ? 'visible' : 'invisible'}`}>
        <div className={`absolute inset-0 bg-[#111]/95 backdrop-blur-xl transition-opacity duration-1000 ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`}></div>
        <div className={`relative h-full w-full flex flex-col items-center justify-center transform transition-transform duration-1000 ${isMenuOpen ? 'translate-y-0' : 'translate-y-full'}`}>
          <div className="flex flex-col items-center gap-12 text-white">
            <button onClick={() => handleNavigation('marketplace')} className="font-serif text-5xl md:text-9xl font-light hover:italic hover:text-[#9C8268] transition-all bg-transparent border-none text-white cursor-pointer">
              Marketplace
            </button>
            <button onClick={() => handleNavigation('.featured-section')} className="font-serif text-5xl md:text-9xl font-light hover:italic hover:text-[#9C8268] transition-all bg-transparent border-none text-white cursor-pointer">
              En vedette
            </button>
            <button onClick={() => handleNavigation('footer')} className="font-serif text-5xl md:text-9xl font-light hover:italic hover:text-[#9C8268] transition-all bg-transparent border-none text-white cursor-pointer">
              Contact
            </button>
          </div>
        </div>
      </div>

      {/* [SECTION 08: HERO] */}
      <section className="hero-section relative h-screen flex flex-col justify-center px-8 md:px-[10vw] z-10">
        <h1 className="font-serif text-[18vw] md:text-[12.5vw] leading-[0.8] uppercase flex flex-col font-light text-[#1a1a1a] mix-blend-multiply">
          <RevealText text="Le Geste" />
          <div className="flex items-center gap-4 self-end md:mr-[8vw]">
            {/* REMOVED SPAN as per previous request */}
            <RevealText text="& L'Âme" className="text-[#9C8268] italic pt-[0.25em] -mt-[0.25em]" />
          </div>
        </h1>

        <div className="absolute bottom-32 md:bottom-12 left-0 w-full px-8 md:px-[10vw] flex flex-row justify-between items-end md:items-baseline">
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
      <section className="manifesto relative py-60 px-8 md:px-[10vw] bg-transparent">
        <div className="mb-48 max-w-3xl">
          <span className="text-[10px] uppercase tracking-[0.6em] text-[#9C8268] block mb-12">Héritage</span>
          <h2 className="font-serif text-5xl md:text-8xl leading-tight font-light italic text-[#1a1a1a]">
            Réveiller la splendeur <br /> du bois oublié.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-32 items-center">
          <div className="manifesto-item md:col-span-6 space-y-12">
            <div className="img-parallax aspect-[3/4] shadow-2xl">
              <img src="https://images.unsplash.com/photo-1595428774223-ef52624120d2?q=80&w=1200" className="w-full h-full object-cover" alt="Table en Chêne" />
            </div>
            <div className="max-w-sm">
              <h3 className="font-serif text-4xl italic mb-4 text-[#1a1a1a]">Le Plateau d'Antan</h3>
              <p className="text-sm opacity-50 font-light leading-relaxed uppercase tracking-wider text-[#1a1a1a]">Chêne de pays — Finition à la cire d'abeille.</p>
            </div>
          </div>

          <div className="manifesto-item md:col-span-4 md:col-start-9 md:mt-40 space-y-12">
            <div className="img-parallax aspect-[4/5] shadow-2xl">
              <img src="https://images.unsplash.com/photo-1618220179428-22790b461013?q=80&w=1200" className="w-full h-full object-cover" alt="Console de style" />
            </div>
            <div className="text-right md:text-left">
              <h3 className="font-serif text-3xl italic mb-4 text-[#1a1a1a]">La Console Royale</h3>
              <p className="text-[10px] uppercase tracking-widest opacity-40 text-[#1a1a1a]">Noyer sculpté — XIXème siècle.</p>
            </div>
          </div>

          <div className="manifesto-item md:col-span-12 mt-12 md:mt-40 flex flex-col md:flex-row gap-20 items-center">
            <div className="md:w-3/5 img-parallax aspect-video shadow-2xl">
              <img src="https://images.unsplash.com/photo-1567016432779-094069958ea5?q=80&w=1400" className="w-full h-full object-cover" alt="Commode ancienne" />
            </div>
            <div className="md:w-2/5 space-y-8">
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
      <section className="process-wrapper h-screen bg-[#0D0D0D] text-[#FAF9F6] flex items-center overflow-hidden">
        <div className="horizontal-content flex gap-32 md:gap-[8vw] pl-[5vw] md:pl-[10vw] pr-0 items-center relative will-change-transform">

          {/* Titre Section */}
          <div className="min-w-[85vw] md:min-w-[40vw] relative flex flex-col justify-center h-[70vh] border-r border-white/5 pr-[8vw]">
            <RotatingSymbol className="absolute -top-20 -left-24 text-[#9C8268]" size={160} />
            <div className="relative z-10">
              <span className="text-[10px] uppercase tracking-[1.2em] text-[#9C8268] mb-8 block font-black">L'Alchimie</span>
              <h2 className="font-serif text-5xl md:text-8xl lg:text-[12vw] leading-none font-light italic text-white">Le Rituel.</h2>
              <p className="mt-12 text-base md:text-lg font-light opacity-50 max-w-md border-l border-[#9C8268] pl-6">
                Chaque étape est une célébration de la matière. De l'état brut à l'œuvre d'art, découvrez notre processus de restauration.
              </p>
            </div>
          </div>

          {[
            { n: "I", t: "L'Essence", d: "Sélection rigoureuse des billes de bois précieux.", main: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?q=80&w=800", w: "w-[85vw] md:w-[480px]", h: "h-[500px] md:h-[650px]", info: "Matière première" },
            { n: "II", t: "L'Analyse", d: "Diagnostic structurel et scan de la patine historique.", main: "https://images.unsplash.com/photo-1505693314120-0d443867891c?q=80&w=800", w: "w-[85vw] md:w-[600px]", h: "h-[450px] md:h-[600px]", info: "Étude microscopique" },
            { n: "III", t: "Le Dessin", d: "Tracé géométrique pour les greffes complexes.", main: "https://images.unsplash.com/photo-1517705008128-361805f42e86?q=80&w=800", w: "w-[85vw] md:w-[500px]", h: "h-[400px] md:h-[550px]", info: "Perspective d'art" },
            { n: "IV", t: "La Cure", d: "Greffes invisibles et consolidation structurelle.", main: "https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?q=80&w=800", w: "w-[85vw] md:w-[480px]", h: "h-[450px] md:h-[600px]", info: "Renaissance physique" },
            { n: "V", t: "L'Éclat", d: "Secret du vernis au tampon selon la tradition normande.", main: "https://images.unsplash.com/photo-1622372738946-62e02505feb3?q=80&w=800", w: "w-[85vw] md:w-[700px]", h: "h-[450px] md:h-[600px]", info: "Miroir de bois" }
          ].map((step, i) => (
            <div key={i} className={`process-card flex-shrink-0 relative ${step.w} flex flex-col justify-center group`}>

              {/* Numéro flottant "Architectural" - REDUIT SUR MOBILE */}
              <div className="absolute -top-12 -left-4 md:-left-10 z-30 pointer-events-none select-none text-[#9C8268] mix-blend-normal md:text-[#FAF9F6] md:mix-blend-difference">
                <span className="font-serif text-[6rem] md:text-[12rem] leading-none text-stroke-1 italic">{step.n}</span>
              </div>

              {/* Conteneur Image */}
              <div className={`img-box-process ${step.h} w-full border border-white/10 relative overflow-hidden transition-all duration-700 group-hover:border-white/30 z-10`}>
                <div className="absolute inset-0 z-10 bg-transparent md:bg-[#0D0D0D]/30 md:group-hover:bg-transparent transition-colors duration-700"></div>
                <img src={step.main} alt={step.t} className="p-img-inner w-full h-full object-cover grayscale-0 md:grayscale md:group-hover:grayscale-0 transition-all duration-1000 scale-100 will-change-transform" />

                {/* Tag technique au survol */}
                <div className="absolute bottom-6 right-6 z-20 opacity-100 translate-y-0 md:opacity-0 md:translate-y-4 md:group-hover:opacity-100 md:group-hover:translate-y-0 transition-all duration-700 delay-100">
                  <span className="text-[10px] uppercase tracking-widest bg-[#111] px-4 py-2 border border-[#9C8268] text-white font-medium shadow-xl">{step.info}</span>
                </div>
              </div>

              {/* Caption */}
              <div className="p-caption mt-8 md:mt-12 relative z-10 text-white pl-4 md:pl-6 border-l border-white/10 group-hover:border-[#9C8268] transition-colors duration-700">
                <h3 className="text-3xl md:text-5xl font-light italic font-serif text-white mb-4 group-hover:translate-x-2 transition-transform duration-500">{step.t}</h3>
                <p className="text-[10px] uppercase tracking-[0.25em] opacity-40 leading-loose max-w-[300px] font-medium text-[#FAF9F6] group-hover:opacity-80 transition-opacity">{step.d}</p>
              </div>
            </div>
          ))}

          {/* UPDATE: Full screen width on mobile (100vw) to center content properly at end of scroll */}
          <div className="min-w-[100vw] md:min-w-[40vw] flex flex-col items-center justify-center border-l border-white/5 pl-0 md:pl-[8vw]">
            <RotatingSymbol size={300} className="text-[#9C8268] opacity-20 scale-75 md:scale-100" text="L'HÉRITAGE DU TEMPS • TOUS À TABLE •" />
            <span className="font-serif italic text-4xl opacity-30 mt-16 tracking-[0.5em] uppercase text-white">Perpétuité</span>
          </div>
        </div>
      </section>

      {/* [SECTION 11: FEATURED (STACKING EFFECT GSAP PINNED)] */}
      <section className="featured-section h-screen w-full relative overflow-hidden bg-white">
        {featuredItems.map((item, index) => (
          <div
            key={item.id}
            className="featured-card absolute top-0 left-0 w-full h-full flex items-center justify-center overflow-hidden will-change-transform"
            style={{
              zIndex: index + 1,
              backgroundColor: item.bgColor
            }}
          >
            {/* Conteneur Interne pour l'effet de recul (Scale Down) */}
            <div
              className="card-inner-content relative w-full h-full flex items-center justify-center border-t border-black/5 shadow-[-20px_-20px_60px_rgba(0,0,0,0.1)] origin-center will-change-transform"
            >
              {/* Background Title Faint - Opacité réduite */}
              <div className="absolute inset-0 flex items-center justify-center font-serif text-[34vw] text-black/[0.015] pointer-events-none uppercase tracking-tighter italic text-[#1a1a1a]">
                {item.bgTitle}
              </div>

              {/* GRILLE RESPONSIVE : Gap réduit sur mobile pour éviter l'overflow */}
              <div className="max-w-7xl w-full grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-32 items-center relative z-10 text-[#1a1a1a] px-6 md:px-8 h-full md:h-auto py-8 md:py-0">

                {/* SUBTITLE MOBILE - Placée avant l'image pour être au dessus sur mobile */}
                <div className="w-full md:hidden flex justify-center pb-2 order-1 mt-24">
                  <span className="text-[10px] uppercase tracking-[0.8em] text-[#9C8268] font-bold italic underline underline-offset-8">
                    {item.subtitle}
                  </span>
                </div>

                {/* Image Box : Hauteur contrainte sur mobile (35vh) pour laisser place au texte */}
                <div className="feat-img-box w-full h-[35vh] md:h-auto md:aspect-[4/5] shadow-2xl overflow-hidden rounded-sm order-2 md:order-1">
                  <img src={item.img} alt={item.bgTitle} className="feat-img-anim w-full h-full object-cover will-change-transform" />
                </div>

                <div className="space-y-4 md:space-y-16 feat-text-anim order-3 md:order-2 flex flex-col justify-center">
                  <div>
                    {/* TITRE DESKTOP (Cache sur mobile) - Couleur d'origine #9C8268 */}
                    <span className="hidden md:block text-[10px] uppercase tracking-[0.8em] text-[#9C8268] mb-12 font-bold italic underline underline-offset-8">
                      {item.subtitle}
                    </span>
                    {/* TITRE RESPONSIVE : 4xl sur mobile, 7xl+ sur desktop */}
                    <h2 className="font-serif text-4xl md:text-7xl lg:text-[8.5vw] leading-[0.95] md:leading-[0.85] font-light italic text-[#1a1a1a]">
                      {/* Utilisation de map pour gérer les lignes multiples */}
                      {item.title.map((line, i) => (
                        <React.Fragment key={i}>
                          <RevealText text={line} />
                        </React.Fragment>
                      ))}
                    </h2>
                  </div>
                  {/* DESCRIPTION RESPONSIVE : Texte plus petit sur mobile */}
                  <p className="text-lg md:text-2xl font-light opacity-60 leading-snug md:leading-relaxed max-w-md italic text-[#1a1a1a]">
                    {item.desc}
                  </p>
                  {/* BOUTON MODIFIÉ : RotatingButton */}
                  <button onClick={onEnterMarketplace} className="flex items-center gap-4 md:gap-8 group text-[#1a1a1a] mt-4">
                    <RotatingButton id={item.id} />
                    <span className="text-[10px] md:text-[11px] uppercase tracking-[0.4em] md:tracking-[0.6em] font-medium text-[#1a1a1a]">
                      Découvrir la Galerie
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* [SECTION 12: RENDU - DATA (REWORK STYLE LUMOSINE - ALIGNÉ)] */}
      <section className="data-section relative py-40 bg-[#111111] text-[#FAF9F6] overflow-hidden">

        {/* Marquee stylisé : Ticker de luxe */}
        <div className="marquee-wrapper border-y border-white/5 bg-[#0a0a0a] py-12 mb-40">
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
        </div>

        {/* Grille de données - Style Architectural (CORRIGÉ : TAILLES & ALIGNEMENT) */}
        <div className="max-w-[110rem] mx-auto px-12 md:px-[10vw]">
          {/* AJOUT DE border-t POUR FERMER LA GRILLE */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border-l border-t border-white/10">
            {stats.map((stat, idx) => (
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
            ))}
          </div>

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
        </div>
      </section>

      {/* [SECTION 13: RENDU - TEAM (DIRECTION) - STICKY SCROLL SPLIT via GSAP PINNING] */}
      <section className="team-section relative w-full bg-[#FAF9F6] flex flex-col md:flex-row items-start z-10">

        {/* COLONNE GAUCHE (TEXTE) */}
        <div className="w-full md:w-1/2 min-h-[60vh] md:min-h-screen flex flex-col justify-center px-8 md:px-[6vw] space-y-12 md:space-y-24 text-[#1a1a1a] z-20">
          {/* Ce wrapper sera épinglé par GSAP */}
          <div className="team-text-wrapper h-screen flex flex-col justify-center">
            <div className="space-y-6 team-content-reveal">
              <span className="text-[12px] uppercase tracking-[1.4em] text-[#9C8268] block font-black italic">La Direction</span>
              <h2 className="font-serif text-7xl md:text-[8vw] xl:text-[9vw] leading-[0.9] font-light italic tracking-tight text-[#1a1a1a]">
                Jean <br /> Lefebvre
              </h2>
            </div>

            <p className="text-2xl font-light opacity-60 leading-relaxed italic border-l border-black/10 pl-10 mt-12 team-content-reveal">
              "Nous ne luttons pas contre le temps, nous le réapprivoisons. Chaque main possède une mémoire que les outils n'ont pas."
            </p>

            <div className="flex gap-16 pt-12 border-t border-black/5 items-center mt-12 team-content-reveal">
              <div>
                <span className="block text-[9px] uppercase tracking-widest opacity-30 mb-2 font-black">Expérience</span>
                <span className="font-serif text-6xl italic text-[#9C8268]">XXV Ans</span>
              </div>
              <div className="w-[1px] h-12 bg-black/5"></div>
              <Zap size={32} className="text-[#9C8268] opacity-60" />
            </div>
          </div>
        </div>

        {/* COLONNE DROITE (IMAGE) - SCROLLANTE */}
        <div className="w-full md:w-1/2 min-h-auto md:min-h-[200vh] flex flex-col items-center px-8 md:px-[4vw] pt-20 pb-20 md:pt-[20vh] md:pb-40 z-10 bg-[#FAF9F6]">
          <div className="team-img-col relative w-full aspect-[3/4] md:aspect-[2/3] shadow-[0_80px_160px_rgba(0,0,0,0.15)] bg-stone-200">
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1600"
              alt="Maître Ebéniste"
              className="w-full h-full object-cover grayscale"
            />
            <RotatingSymbol className="absolute -bottom-20 -right-20 text-white opacity-20 mix-blend-overlay" size={240} />
          </div>
        </div>

      </section>

      {/* [SECTION 13.5 : FAQ - Layout 4/8] */}
      <section className="faq-section py-24 md:py-60 px-8 md:px-[10vw] bg-[#F0F2EB] text-[#1a1a1a]">
        <div className="max-w-[90rem] mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16 items-start">

          {/* Colonne Gauche: Questions (COMPACTE - 4 Cols) */}
          <div className="md:col-span-4 flex flex-col gap-0 w-full">
            <div className="mb-12">
              <span className="text-[10px] uppercase tracking-[0.6em] text-[#9C8268] block mb-12 font-bold">Le Savoir</span>
              <h2 className="font-serif text-5xl md:text-7xl font-light italic text-[#1a1a1a] leading-tight">
                Réponses <br /> Rapides
              </h2>
            </div>

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
          </div>

          {/* Colonne Droite: Image Immersive (LARGE - 8 Cols) */}
          <div className="md:col-span-8 relative h-full min-h-[60vh] hidden md:block">
            <div className="sticky top-20 w-full aspect-square overflow-hidden bg-white shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=1600"
                alt="Détail savoir-faire"
                className="w-full h-full object-cover scale-110 hover:scale-100 transition-transform duration-[2s] ease-out grayscale hover:grayscale-0"
              />
              <div className="absolute bottom-10 left-10 text-white mix-blend-difference pointer-events-none z-10">
                <span className="block text-[11px] uppercase tracking-widest font-bold">L'Atelier • Normandie</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#111] text-white pt-60 pb-12 px-8 md:px-[10vw] relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start gap-40 mb-60 relative z-10 text-white">
          <div className="max-w-5xl">
            <span className="text-[10px] uppercase tracking-[1em] text-[#9C8268] mb-12 block italic font-black">Inquiry</span>
            <h2 className="font-serif text-7xl md:text-[15vw] leading-[0.85] font-light italic hover:translate-x-12 transition-transform duration-1000 cursor-pointer text-white">Éveiller <br /> l'Immobile.</h2>
          </div>
          <div className="flex flex-col gap-32">
            <div className="space-y-12">
              <a href="mailto:atelier@tousatable.fr" className="text-3xl md:text-5xl font-light italic hover:text-[#9C8268] transition-colors border-b border-white/5 pb-2">atelier@tousatable.fr</a>
            </div>
            <div className="flex gap-20 items-center opacity-40 hover:opacity-100 transition-opacity">
              <Instagram size={36} className="text-white" />
              <span className="text-[11px] uppercase tracking-[0.8em] italic font-medium">Journal de l'Artisan</span>
            </div>
          </div>
        </div>
        <div className="pt-32 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-12 opacity-20 text-[10px] uppercase tracking-[0.5em] font-light relative z-10">
          <span>Tous à Table — Artisans du Patrimoine — Caen, FR — 2024</span>
          <div className="flex gap-20 lowercase underline underline-offset-4 font-black tracking-widest"><span>privacy policy</span><span>legal mentions</span></div>
        </div>
      </footer>
    </div>
  );
};

export default App;