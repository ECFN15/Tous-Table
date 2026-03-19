import React, { useState } from 'react';
import { ArrowRight, Check, X } from 'lucide-react';
import { motion, AnimatePresence, useMotionTemplate, useMotionValue } from 'framer-motion';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import confetti from 'canvas-confetti';



const PremiumGlowButton = ({ children, onClick, type = "button", disabled = false, className = "" }) => {
    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            type={type}
            disabled={disabled}
            // On utilise exactement les mêmes classes de largeur (w-full max-w-[320px] sm:max-w-sm) que le wrapper
            className={`relative flex w-full max-w-[320px] sm:max-w-sm mx-auto items-center justify-center rounded-full bg-transparent border border-white/30 py-4 px-6 text-white font-medium text-lg hover:bg-white/10 transition-colors backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        >
            {children}
        </motion.button>
    );
};

const NeonInputWrapper = ({ children, className = "" }) => {
    return (
        // Même base de largeur que PremiumGlowButton pour alignement parfait
        <div className={`relative group p-[1.5px] rounded-full overflow-hidden w-full max-w-[320px] sm:max-w-sm mx-auto ${className}`}>
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                // Utilisation d'un carré géant absolu plutôt que "inset-[-100%]" pour éviter la coupure sur les très grands rectangles (inputs larges)
                className="absolute top-1/2 left-1/2 h-[800px] w-[800px] origin-center -translate-x-1/2 -translate-y-1/2 z-0"
                style={{
                    background: "conic-gradient(from 0deg, transparent 30%, rgba(255,255,255,0) 35%, rgba(255,255,255,1) 50%, rgba(255,255,255,0) 65%, transparent 70%)",
                }}
            />
            <div className="relative w-full h-full rounded-full bg-zinc-950/90 backdrop-blur-md overflow-hidden z-10">
                {children}
            </div>
        </div>
    );
};

const AnimatedShowcase = () => {
    // Photos Unsplash fiables (mobilier, archi, objets), sélectionnées pour être très verticales / portrait
    const column1 = [
        { src: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=800", aspect: "aspect-[2/3]" },
        { src: "https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&q=80&w=800", aspect: "aspect-[4/5]" },
        { src: "https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&q=80&w=800", aspect: "aspect-[3/4]" },
        { src: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=800", aspect: "aspect-[9/16]" },
        { src: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=800", aspect: "aspect-[2/3]" }
    ];
    
    const column2 = [
        { src: "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&q=80&w=800", aspect: "aspect-[9/16]" },
        { src: "https://images.unsplash.com/photo-1604578762246-41134e37f9cc?auto=format&fit=crop&q=80&w=800", aspect: "aspect-[3/4]" },
        { src: "https://images.unsplash.com/photo-1505693314120-0d443867891c?auto=format&fit=crop&q=80&w=800", aspect: "aspect-square" },
        { src: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&q=80&w=800", aspect: "aspect-[2/3]" },
        { src: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&q=80&w=800", aspect: "aspect-[4/5]" }
    ];

    const column3 = [
        { src: "https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&q=80&w=800", aspect: "aspect-[4/5]" },
        { src: "https://images.unsplash.com/photo-1519961655809-34fa156820ff?auto=format&fit=crop&q=80&w=800", aspect: "aspect-[2/3]" },
        { src: "https://images.unsplash.com/photo-1567016432779-094069958ea5?auto=format&fit=crop&q=80&w=800", aspect: "aspect-[9/16]" },
        { src: "https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&q=80&w=800", aspect: "aspect-[3/4]" },
        { src: "https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?auto=format&fit=crop&q=80&w=800", aspect: "aspect-[2/3]" }
    ];

    // Pour garantir une boucle infini transparente (seamless loop) : 
    // On doit empiler les listes d'images assez de fois pour que lorsque ça remonte à 0%, 
    // on ait parcouru exactement la hauteur d'une "page" complète sans voir la fin.
    // L'astuce est de dupliquer la liste de façon très longue.
    const loop1 = [...column1, ...column1, ...column1, ...column1];
    const loop2 = [...column2, ...column2, ...column2, ...column2];
    const loop3 = [...column3, ...column3, ...column3, ...column3];

    return (
        <div className="absolute inset-0 flex gap-1 p-1 overflow-hidden opacity-30 md:opacity-100 bg-[#1c1a17]">
            {/* Column 1 - Large, portrait images */}
            <motion.div 
                className="flex flex-col gap-1 w-1/2 md:w-1/3"
                animate={{ y: ["0%", "-50%"] }}
                transition={{ repeat: Infinity, ease: "linear", duration: 60 }}
            >
                {loop1.map((item, i) => (
                    <div key={`c1-${i}`} className={`shrink-0 w-full ${item.aspect} relative bg-stone-900 group overflow-hidden`}>
                        <img 
                            src={item.src} 
                            alt="" 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
                            loading={i > 5 ? "lazy" : "eager"}
                        />
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500" />
                    </div>
                ))}
            </motion.div>

            {/* Column 2 - Large, portrait images */}
            <motion.div 
                className="flex flex-col gap-1 w-1/2 md:w-1/3"
                animate={{ y: ["-50%", "0%"] }}
                transition={{ repeat: Infinity, ease: "linear", duration: 75 }}
            >
                {loop2.map((item, i) => (
                    <div key={`c2-${i}`} className={`shrink-0 w-full ${item.aspect} relative bg-stone-900 group overflow-hidden`}>
                        <img 
                            src={item.src} 
                            alt="" 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                            loading={i > 5 ? "lazy" : "eager"}
                        />
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500" />
                    </div>
                ))}
            </motion.div>

            {/* Column 3 - Large, portrait images (Hidden on mobile to keep images BIG) */}
            <motion.div 
                className="hidden md:flex flex-col gap-1 w-1/3"
                animate={{ y: ["0%", "-50%"] }}
                transition={{ repeat: Infinity, ease: "linear", duration: 55 }}
            >
                {loop3.map((item, i) => (
                    <div key={`c3-${i}`} className={`shrink-0 w-full ${item.aspect} relative bg-stone-900 group overflow-hidden`}>
                        <img 
                            src={item.src} 
                            alt="" 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                            loading={i > 5 ? "lazy" : "eager"}
                        />
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500" />
                    </div>
                ))}
            </motion.div>
        </div>
    );
};

const NewsletterModal = ({ showNewsletter, setShowNewsletter }) => {
    const [newsletterStep, setNewsletterStep] = useState(1);
    const [leadStore, setLeadStore] = useState({ contact: '', firstName: '', lastName: '' });
    const [newsletterLoading, setNewsletterLoading] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);

    const handleNewsletterNext = (e) => {
        e.preventDefault();
        const contact = e.target.contact.value;
        if (!contact) return;
        setLeadStore({ ...leadStore, contact });
        setNewsletterStep(2);
    };

    const triggerConfetti = () => {
        console.log("[Confetti] Triggering animation...");
        // Blindage de l'import Rollup/Vite
        let confettiFn = confetti;
        if (typeof confetti !== 'function') {
            confettiFn = confetti.default ? confetti.default : confetti;
        }

        let runConfetti;
        if (confettiFn && typeof confettiFn.create === 'function') {
            // Guarantee no worker is created to avoid Content-Security-Policy blob: issues
            runConfetti = confettiFn.create(null, { useWorker: false, resize: true });
        } else if (typeof confettiFn === 'function') {
            runConfetti = confettiFn;
        } else {
            console.error("[Confetti] Error: canvas-confetti is not a function. Check Vite bundling.", confettiFn);
            return;
        }

        const duration = 2.5 * 1000;
        const animationEnd = Date.now() + duration;
        // On monte le zIndex à 99999 pour être absolument sûr qu'il passe au-dessus de tout
        const defaults = { startVelocity: 25, spread: 360, ticks: 60, zIndex: 99999, colors: ['#ca8a04', '#1c1917', '#78716c', '#e7e5e4'], disableForReducedMotion: true };

        const randomInRange = (min, max) => Math.random() * (max - min) + min;
        const isMobile = window.innerWidth < 768;
        const mobileParticleDivisor = isMobile ? 3 : 1;

        const interval = setInterval(function () {
            const timeLeft = animationEnd - Date.now();
            if (timeLeft <= 0) {
                console.log("[Confetti] Animation ended.");
                return clearInterval(interval);
            }
            const particleCount = (40 * (timeLeft / duration)) / mobileParticleDivisor;
            try {
                runConfetti(Object.assign({}, defaults, {
                    particleCount,
                    origin: { x: randomInRange(isMobile ? 0.1 : 0.2, isMobile ? 0.3 : 0.4), y: Math.random() - 0.2 }
                }));
                runConfetti(Object.assign({}, defaults, {
                    particleCount,
                    origin: { x: randomInRange(isMobile ? 0.7 : 0.6, isMobile ? 0.9 : 0.8), y: Math.random() - 0.2 }
                }));
            } catch (e) {
                console.error("[Confetti] Run frame error:", e);
                clearInterval(interval);
            }
        }, 250);
    };

    const handleNewsletterSubmit = async (e) => {
        e.preventDefault();
        const firstName = e.target.firstName.value;
        const lastName = e.target.lastName.value;

        if (!firstName || !lastName) return;

        setNewsletterLoading(true);
        try {
            await addDoc(collection(db, 'newsletter_subscribers'), {
                contactInfo: leadStore.contact,
                firstName,
                lastName,
                createdAt: serverTimestamp(),
                source: 'v3_premium_popup',
            });
            localStorage.setItem('newsletterSubscribed', 'true');
            setLeadStore(prev => ({ ...prev, firstName, lastName }));
            setNewsletterStep(3);
            setTimeout(triggerConfetti, 100);
        } catch (err) {
            console.error(err);
            alert("Erreur lors de l'inscription.");
        } finally {
            setNewsletterLoading(false);
        }
    };

    // iOS-safe body scroll lock
    const scrollYRef = React.useRef(0);
    React.useEffect(() => {
        if (showNewsletter) {
            scrollYRef.current = window.scrollY;
            document.body.classList.add('modal-open');
            document.body.style.top = `-${scrollYRef.current}px`;
        } else {
            document.body.classList.remove('modal-open');
            document.body.style.top = '';
            window.scrollTo(0, scrollYRef.current);
        }
        return () => {
            document.body.classList.remove('modal-open');
            document.body.style.top = '';
        };
    }, [showNewsletter]);

    if (!showNewsletter) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[2000] flex w-full h-full bg-stone-900 overflow-hidden"
                style={{ height: 'calc(var(--vh, 1vh) * 100)' }}
            >
                {/* Animated Showcase Section - Right side on desktop, background on mobile */}
                <div className="absolute inset-0 lg:relative lg:w-1/2 h-full z-0 lg:order-2 bg-[#1c1a17] overflow-hidden">
                    {/* Lighter overlay on mobile with subtle blur for readability, subtle dark on desktop */}
                    <div className="absolute inset-0 bg-stone-900/30 backdrop-blur-[3px] lg:backdrop-blur-none lg:bg-stone-900/30 z-10 pointer-events-none" />
                    
                    {/* Add an extra subtle dark gradient at the center on mobile to anchor the text */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.5)_0%,transparent_70%)] lg:hidden z-10 pointer-events-none" />

                    <AnimatedShowcase />

                    {/* Gradient fade to blend with left panel */}
                    <div className="hidden lg:block absolute inset-y-0 left-0 w-48 bg-gradient-to-r from-[#1c1a17] to-transparent z-20 pointer-events-none" />
                    <div className="hidden lg:block absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#1c1a17] to-transparent z-20 pointer-events-none" />
                    <div className="hidden lg:block absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-[#1c1a17] to-transparent z-20 pointer-events-none" />
                </div>

                {/* Content Section - Left side */}
                {/* On passe en md/lg au lieu de w-full pour que la tablette s'affiche bien (sur tablette on garde le fond pleine page car 50% de l'écran ipad c'est trop petit pour le texte) */}
                <div className="relative z-10 w-full lg:w-1/2 h-full flex flex-col items-center justify-center p-6 sm:p-12 lg:order-1 text-white">
                    <button
                        onClick={() => setShowNewsletter(false)}
                        className="absolute right-4 sm:right-6 lg:right-auto lg:left-8 text-white/50 hover:text-white transition-colors z-[2010] p-3 bg-black/20 lg:bg-transparent rounded-full lg:rounded-none backdrop-blur-md lg:backdrop-blur-none"
                        style={{ top: 'max(env(safe-area-inset-top, 0px), 1rem)' }}
                    >
                        <X size={24} strokeWidth={2} className="sm:w-7 sm:h-7 lg:w-8 lg:h-8 lg:stroke-[1.5]" />
                    </button>

                    <div className="w-full max-w-[90%] sm:max-w-lg lg:max-w-xl mx-auto flex flex-col items-center text-center mt-8 sm:mt-0">
                        <AnimatePresence mode="wait">
                            {newsletterStep === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="w-full space-y-8 sm:space-y-12"
                                >
                                    <div className="space-y-3 sm:space-y-4">
                                        <h2 className="text-xs sm:text-sm font-bold tracking-[0.2em] text-white/70 uppercase">
                                            L'Atelier en avant-première
                                        </h2>
                                        <h1 className="text-[2.75rem] sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-white leading-[0.9]">
                                            REJOIGNEZ NOTRE<br />
                                            NEWSLETTER
                                        </h1>
                                        <p className="text-base sm:text-lg text-white/80 max-w-sm sm:max-w-md mx-auto mt-4 sm:mt-6">
                                            Pour ne manquer aucune nouveauté et suivre nos restaurations exclusives.
                                        </p>
                                    </div>

                                    <form onSubmit={handleNewsletterNext} className="w-full flex flex-col items-center space-y-4 sm:space-y-5 mt-8 sm:mt-12 px-4 sm:px-0">
                                        <NeonInputWrapper>
                                            <input
                                                name="contact"
                                                type="text"
                                                placeholder="Email ou téléphone"
                                                className="w-full px-6 py-3.5 sm:py-4 rounded-full bg-transparent text-white placeholder:text-white/50 text-center text-base sm:text-lg focus:outline-none focus:bg-white/5 transition-colors duration-300"
                                                required
                                            />
                                        </NeonInputWrapper>
                                        <PremiumGlowButton type="submit" className="!py-[15px] sm:!py-[17px] bg-white/5 mt-2">
                                            Continuer
                                        </PremiumGlowButton>
                                    </form>

                                    <button 
                                        onClick={() => {
                                            localStorage.setItem('newsletterDismissed', 'true');
                                            setShowNewsletter(false);
                                        }}
                                        className="text-white/60 hover:text-white text-xs sm:text-sm font-medium transition-colors mt-6 sm:mt-8 inline-block"
                                    >
                                        Non merci,<br className="sm:hidden" /> je préfère rater les prochaines pièces
                                    </button>
                                </motion.div>
                            )}

                            {newsletterStep === 2 && (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="w-full space-y-8 sm:space-y-12"
                                >
                                    <div className="space-y-3 sm:space-y-4">
                                        <h2 className="text-xs sm:text-sm font-bold tracking-[0.2em] text-white/70 uppercase">
                                            Faisons connaissance
                                        </h2>
                                        <h1 className="text-[2.5rem] sm:text-4xl md:text-5xl font-bold tracking-tighter text-white leading-[1]">
                                            COMMENT<br />
                                            VOUS APPELER ?
                                        </h1>
                                    </div>

                                    <form onSubmit={handleNewsletterSubmit} className="w-full flex flex-col items-center space-y-3 sm:space-y-4 mt-8 sm:mt-12 px-4 sm:px-0">
                                        <input
                                            name="firstName"
                                            type="text"
                                            placeholder="Prénom"
                                            className="w-full max-w-[320px] sm:max-w-sm px-6 py-3.5 sm:py-4 rounded-full bg-[#141311]/90 backdrop-blur-xl border border-white/10 text-white placeholder:text-white/50 text-center text-base sm:text-lg focus:outline-none focus:bg-white/5 focus:border-white/30 transition-all duration-300"
                                            required
                                        />
                                        <input
                                            name="lastName"
                                            type="text"
                                            placeholder="Nom"
                                            className="w-full max-w-[320px] sm:max-w-sm px-6 py-3.5 sm:py-4 rounded-full bg-[#141311]/90 backdrop-blur-xl border border-white/10 text-white placeholder:text-white/50 text-center text-base sm:text-lg focus:outline-none focus:bg-white/5 focus:border-white/30 transition-all duration-300"
                                            required
                                        />
                                        
                                        <PremiumGlowButton type="submit" disabled={newsletterLoading} className="!py-[15px] sm:!py-[17px] mt-4">
                                            {newsletterLoading ? (
                                                <motion.div
                                                    animate={{ rotate: 360 }}
                                                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full mx-auto"
                                                />
                                            ) : (
                                                "S'inscrire"
                                            )}
                                        </PremiumGlowButton>
                                        
                                        <button
                                            type="button"
                                            onClick={() => setNewsletterStep(1)}
                                            className="text-white/60 hover:text-white text-xs sm:text-sm font-medium transition-colors mt-6 block w-full text-center"
                                        >
                                            Retour
                                        </button>
                                    </form>
                                </motion.div>
                            )}

                            {newsletterStep === 3 && (
                                <motion.div
                                    key="step3"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="w-full flex flex-col items-center pt-4"
                                >
                                    <motion.div
                                        initial={{ scale: 0, rotate: -20 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 25, delay: 0.1 }}
                                        className="relative w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center mb-8 sm:mb-10"
                                    >
                                        {/* Arrière plan du cercle semi-transparent flouté avec une très légère touche émeraude */}
                                        <div className="absolute inset-0 bg-emerald-950/10 backdrop-blur-xl rounded-full border border-emerald-500/10 shadow-[0_0_30px_rgba(16,185,129,0.1)]" />
                                        
                                        {/* Animation SVG de tracé Liquid Glass */}
                                        <svg className="absolute inset-0 w-full h-full -rotate-90 z-10" viewBox="0 0 100 100">
                                            {/* Définition du Gradient Vert Liquid / Glass */}
                                            <defs>
                                                <linearGradient id="emeraldGlass" x1="0%" y1="0%" x2="100%" y2="100%">
                                                    <stop offset="0%" stopColor="#6ee7b7" stopOpacity="0.9" /> {/* emerald-300 */}
                                                    <stop offset="50%" stopColor="#10b981" stopOpacity="0.6" /> {/* emerald-500 */}
                                                    <stop offset="100%" stopColor="#047857" stopOpacity="0.9" /> {/* emerald-700 */}
                                                </linearGradient>
                                                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                                                    <feGaussianBlur stdDeviation="3" result="blur" />
                                                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                                </filter>
                                            </defs>

                                            {/* Tracé animé du cercle en dégradé, avec effet glow doux */}
                                            <motion.circle
                                                cx="50"
                                                cy="50"
                                                r="48"
                                                fill="transparent"
                                                stroke="url(#emeraldGlass)"
                                                strokeWidth="1.5"
                                                strokeLinecap="round"
                                                filter="url(#glow)"
                                                initial={{ pathLength: 0, opacity: 0 }}
                                                animate={{ pathLength: 1, opacity: 1 }}
                                                transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                                            />
                                            
                                            {/* Tracé animé de la coche en dégradé */}
                                            <motion.path
                                                d="M 32 50 L 45 63 L 68 37"
                                                fill="transparent"
                                                stroke="url(#emeraldGlass)"
                                                strokeWidth="3.5"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                filter="url(#glow)"
                                                className="origin-center rotate-90"
                                                initial={{ pathLength: 0, opacity: 0 }}
                                                animate={{ pathLength: 1, opacity: 1 }}
                                                transition={{ duration: 0.7, ease: "backOut", delay: 0.8 }}
                                            />
                                        </svg>
                                    </motion.div>
                                    
                                    <div className="space-y-6 sm:space-y-8 text-center w-full">
                                        <h1 className="text-[2.2rem] sm:text-4xl md:text-5xl font-bold tracking-tighter text-white leading-[1.1]">
                                            BIENVENUE,<br />
                                            <span className="capitalize">{leadStore.firstName}</span>
                                        </h1>
                                        <p className="text-base sm:text-lg text-white/80 max-w-[280px] sm:max-w-md mx-auto leading-relaxed px-4 sm:px-0">
                                            Votre inscription est confirmée. Nos prochaines trouvailles vous seront dévoilées en avant-première.
                                        </p>
                                    </div>

                                    <div className="w-full mt-10 sm:mt-12 px-4 sm:px-0">
                                        <PremiumGlowButton 
                                            onClick={() => setShowNewsletter(false)}
                                            className="bg-white/10 !py-[15px] sm:!py-[17px]"
                                        >
                                            Découvrir le catalogue
                                        </PremiumGlowButton>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default NewsletterModal;
