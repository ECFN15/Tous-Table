import React, { useState } from 'react';
import { ArrowRight, Check, X } from 'lucide-react';
import { motion, AnimatePresence, useMotionTemplate, useMotionValue } from 'framer-motion';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import confetti from 'canvas-confetti';



const PremiumGlowButton = ({ children, onClick, type = "button", disabled = false, className = "" }) => {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    function handleMouseMove({ currentTarget, clientX, clientY }) {
        let { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    }

    return (
        <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onClick}
            type={type}
            disabled={disabled}
            className={`group relative flex w-full items-center justify-center overflow-hidden rounded-[1.25rem] bg-zinc-950 py-4.5 text-white transition-all shadow-[0_8px_20px_-6px_rgba(0,0,0,0.2)] hover:shadow-[0_12px_24px_-8px_rgba(0,0,0,0.4)] disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
            onMouseMove={handleMouseMove}
        >
            {/* 1. Outer Tracking Border Glow (The "Neon" Edge) */}
            <motion.div
                className="pointer-events-none absolute -inset-[1px] rounded-[1.25rem] opacity-0 transition duration-300 group-hover:opacity-100 z-0"
                style={{
                    background: useMotionTemplate`
                        radial-gradient(
                            180px circle at ${mouseX}px ${mouseY}px,
                            rgba(255, 255, 255, 1),
                            transparent 80%
                        )
                    `,
                }}
            />

            {/* 2. Inner mask to block the center of the outer glow, leaving only a 1px border visually */}
            <div className="absolute inset-[1px] rounded-[calc(1.25rem-1px)] bg-zinc-950 z-10 transition-colors duration-300 group-hover:bg-[#0a0a0a]" />

            {/* 3. Inner tracking light (The "Torch" effect on the button surface) */}
            <motion.div
                className="pointer-events-none absolute inset-0 rounded-[1.25rem] opacity-0 transition duration-300 group-hover:opacity-100 z-20 mix-blend-screen"
                style={{
                    background: useMotionTemplate`
                        radial-gradient(
                            100px circle at ${mouseX}px ${mouseY}px,
                            rgba(255, 255, 255, 0.08),
                            transparent 80%
                        )
                    `,
                }}
            />

            <span className="relative z-30 flex items-center justify-center gap-2 font-semibold text-[14px] tracking-wide text-zinc-300 group-hover:text-white transition-colors duration-300">
                {children}
            </span>
        </motion.button>
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

    if (!showNewsletter) return null;

    const paragraphText = "Abonnez-vous à notre newsletter pour ne manquer aucune nouveauté et suivre nos restaurations exclusives.";
    const paragraphWords = paragraphText.split(" ");

    return (
        <>
            <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
                {/* Background Blur Overlay */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 bg-stone-900/40 backdrop-blur-md"
                    onClick={() => setShowNewsletter(false)}
                />

                {/* Main Modal Container With Neon Margin */}
                <motion.div
                    layoutId="modal-container"
                    initial={{ opacity: 0, scale: 0.95, y: 20, filter: 'blur(10px)' }}
                    animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, scale: 0.95, y: -20, filter: 'blur(10px)' }}
                    transition={{ type: "spring", stiffness: 300, damping: 30, mass: 1 }}
                    className="relative w-full max-w-[480px] rounded-[2rem] sm:rounded-[2.5rem] p-[5px] overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] isolation-auto"
                >
                    {/* Serpent Néon - Glow Arrière (Très Intense) */}
                    <motion.div
                        animate={{ rotate: -360 }}
                        transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
                        className="absolute inset-[-150%] z-0 blur-2xl opacity-100"
                        style={{
                            background: "conic-gradient(from 0deg, transparent 40%, #000 50%, #444 80%, #fff 95%, transparent 100%)",
                        }}
                    />

                    {/* Serpent Néon - Cœur (Ligne Blanche Éclatante) */}
                    <motion.div
                        animate={{ rotate: -360 }}
                        transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
                        className="absolute inset-[-120%] z-0"
                        style={{
                            background: "conic-gradient(from 0deg, transparent 40%, rgba(0,0,0,1) 50%, rgba(50,50,50,1) 80%, rgba(255,255,255,1) 95%, transparent 100%)",
                        }}
                    />

                    {/* Inner White Face */}
                    <div className="relative w-full h-full rounded-[calc(2rem-5px)] sm:rounded-[calc(2.5rem-5px)] bg-white overflow-hidden border border-zinc-200/50 z-10">
                        <button onClick={() => setShowNewsletter(false)} className="absolute top-4 right-4 sm:top-6 sm:right-6 text-zinc-400 hover:text-zinc-900 transition-colors z-[2010] p-2 hover:bg-zinc-100 rounded-full">
                            <X size={20} strokeWidth={1.5} />
                        </button>

                        {/* Background Mesh/Glow (Subtle) */}
                        <div className="absolute inset-0 bg-gradient-to-br from-zinc-50 via-white to-zinc-100 z-0"></div>

                        <motion.div
                            animate={{
                                scale: [1, 1.1, 1],
                                opacity: [0.3, 0.5, 0.3],
                                rotate: [0, 5, 0]
                            }}
                            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -top-32 -right-32 w-80 h-80 bg-stone-200/40 rounded-full blur-[60px] mix-blend-multiply z-0 pointer-events-none"
                        />

                        <motion.div
                            animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.2, 0.4, 0.2]
                            }}
                            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                            className="absolute -bottom-32 -left-32 w-80 h-80 bg-stone-100/60 rounded-full blur-[60px] mix-blend-multiply z-0 pointer-events-none"
                        />

                        {/* Content Wrapper */}
                        <div className="relative z-10 p-8 sm:p-12">
                            <AnimatePresence mode="wait">
                                {newsletterStep === 1 && (
                                    <motion.div
                                        key="step1"
                                        initial={{ opacity: 0, filter: 'blur(8px)', x: -20 }}
                                        animate={{ opacity: 1, filter: 'blur(0px)', x: 0 }}
                                        exit={{ opacity: 0, filter: 'blur(4px)', x: 20 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        className="space-y-10"
                                    >
                                        <div className="space-y-6 text-center px-2">
                                            <h3 className="text-4xl sm:text-[2.5rem] font-medium tracking-tighter text-zinc-950 leading-[1.05] selection:bg-stone-200">
                                                L'Atelier, en<br />
                                                <span className="italic text-stone-500 font-serif font-light tracking-normal">avant-première.</span>
                                            </h3>

                                            {/* Text Reveal */}
                                            <div className="text-[15px] text-zinc-500 font-medium leading-relaxed flex flex-wrap justify-center gap-[0.25em]">
                                                {paragraphWords.map((word, i) => {
                                                    const isHighlighted = ["newsletter", "restaurations", "exclusives."].includes(word);
                                                    return (
                                                        <motion.span
                                                            key={i}
                                                            initial={{ opacity: 0, filter: 'blur(4px)', y: 10 }}
                                                            animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
                                                            transition={{ delay: 0.1 + i * 0.03, type: "spring", stiffness: 200, damping: 20 }}
                                                            className={isHighlighted ? "text-zinc-900 font-bold" : ""}
                                                        >
                                                            {word}
                                                        </motion.span>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        <form onSubmit={handleNewsletterNext} className="space-y-4">
                                            <div className="relative group">
                                                <input
                                                    name="contact"
                                                    type="text"
                                                    placeholder="Adresse email ou téléphone"
                                                    className="w-full px-6 py-4.5 rounded-[1.25rem] bg-zinc-50/50 border border-zinc-200 font-medium text-[15px] outline-none focus:bg-white focus:border-zinc-950 focus:ring-4 focus:ring-zinc-900/5 transition-all duration-300 text-zinc-950 placeholder:text-zinc-400 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
                                                    required
                                                />
                                            </div>
                                            <PremiumGlowButton type="submit">
                                                Continuer
                                                <ArrowRight size={16} strokeWidth={2} />
                                            </PremiumGlowButton>
                                        </form>
                                    </motion.div>
                                )}

                                {newsletterStep === 2 && (
                                    <motion.div
                                        key="step2"
                                        initial={{ opacity: 0, filter: 'blur(8px)', x: -20 }}
                                        animate={{ opacity: 1, filter: 'blur(0px)', x: 0 }}
                                        exit={{ opacity: 0, filter: 'blur(4px)', x: 20 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        className="space-y-8"
                                    >
                                        <div className="space-y-4 text-center relative px-2">
                                            <h3 className="text-4xl sm:text-[2.5rem] font-medium tracking-tighter text-zinc-950 leading-[1.05] selection:bg-stone-200">
                                                Faisons<br />
                                                <span className="italic text-stone-500 font-serif font-light tracking-normal">connaissance.</span>
                                            </h3>

                                            {/* Text Reveal for Step 2 */}
                                            <div className="text-[15px] text-zinc-500 font-medium leading-relaxed flex flex-wrap justify-center gap-[0.25em]">
                                                {"Comment souhaitez-vous que nous vous appelions ?".split(" ").map((word, i) => (
                                                    <motion.span
                                                        key={i}
                                                        initial={{ opacity: 0, filter: 'blur(4px)', y: 10 }}
                                                        animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
                                                        transition={{ delay: 0.1 + i * 0.03, type: "spring", stiffness: 200, damping: 20 }}
                                                    >
                                                        {word}
                                                    </motion.span>
                                                ))}
                                            </div>
                                        </div>

                                        <form onSubmit={handleNewsletterSubmit} className="space-y-5 pt-2">
                                            <div className="space-y-3">
                                                <input
                                                    name="firstName"
                                                    type="text"
                                                    placeholder="Prénom"
                                                    className="w-full px-6 py-4.5 rounded-[1.25rem] bg-zinc-50/50 border border-zinc-200 font-medium text-[15px] outline-none focus:bg-white focus:border-zinc-950 focus:ring-4 focus:ring-zinc-900/5 transition-all duration-300 text-zinc-950 placeholder:text-zinc-400 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
                                                    required
                                                />
                                                <input
                                                    name="lastName"
                                                    type="text"
                                                    placeholder="Nom"
                                                    className="w-full px-6 py-4.5 rounded-[1.25rem] bg-zinc-50/50 border border-zinc-200 font-medium text-[15px] outline-none focus:bg-white focus:border-zinc-950 focus:ring-4 focus:ring-zinc-900/5 transition-all duration-300 text-zinc-950 placeholder:text-zinc-400 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
                                                    required
                                                />
                                            </div>
                                            <PremiumGlowButton type="submit" disabled={newsletterLoading}>
                                                {newsletterLoading ? (
                                                    <motion.div
                                                        animate={{ rotate: 360 }}
                                                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                                                    />
                                                ) : (
                                                    "S'inscrire"
                                                )}
                                            </PremiumGlowButton>
                                            <button
                                                type="button"
                                                onClick={() => setNewsletterStep(1)}
                                                className="w-full pt-2 pb-1 text-[13px] font-medium text-zinc-400 hover:text-zinc-800 transition-colors"
                                            >
                                                Retour
                                            </button>
                                        </form>
                                    </motion.div>
                                )}

                                {newsletterStep === 3 && (
                                    <motion.div
                                        key="step3"
                                        initial={{ opacity: 0, scale: 0.95, filter: 'blur(8px)' }}
                                        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                        className="space-y-8 flex flex-col items-center justify-center text-center py-6"
                                    >
                                        <motion.div
                                            initial={{ scale: 0, rotate: -20 }}
                                            animate={{ scale: 1, rotate: 0 }}
                                            transition={{ type: "spring", stiffness: 400, damping: 25, delay: 0.1 }}
                                            className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shadow-[0_8px_16px_rgba(16,185,129,0.1)] mb-2"
                                        >
                                            <Check size={32} strokeWidth={2.5} />
                                        </motion.div>
                                        <div className="space-y-4">
                                            <h3 className="text-4xl sm:text-[2.2rem] font-medium tracking-tighter text-zinc-950 leading-[1.1]">
                                                Bienvenue,{' '}
                                                <span className="text-stone-500 font-light italic capitalize tracking-normal">{leadStore.firstName || "Cher client"}</span>
                                            </h3>
                                            <p className="text-[14px] sm:text-[15px] text-zinc-500 font-medium leading-relaxed px-2 sm:px-4">
                                                Votre inscription est confirmée. <br /> Nos prochaines trouvailles vous seront dévoilées en avant-première.
                                            </p>
                                        </div>
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => setShowNewsletter(false)}
                                            className="px-8 py-4 bg-zinc-100/80 text-zinc-950 rounded-[1.25rem] font-semibold text-[13px] tracking-wide hover:bg-zinc-200 transition-colors mt-4 border border-zinc-200/50 shadow-sm"
                                        >
                                            Fermer
                                        </motion.button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </motion.div>
            </div>
        </>
    );
};

export default NewsletterModal;
