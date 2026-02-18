import React, { useState, useEffect } from 'react';
import { Instagram, Facebook, Mail } from 'lucide-react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';

// SÉCURITÉ: Sanitize HTML — Autorise uniquement <br> et <br /> (Anti-XSS)
const sanitizeHtml = (html) => {
    if (!html || typeof html !== 'string') return '';
    const escaped = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return escaped.replace(/&lt;br\s*\/?&gt;/gi, '<br />');
};

const Footer = ({ darkMode }) => {
    const [contactInfo, setContactInfo] = useState({
        email: 'atelier@tousatable.fr',
        phone: '07 77 32 41 78',
        instagram: '',
        facebook: '',
        footerTitle: 'Éveiller\nl\'Immobile.',
        footerSubtitle: 'Inquiry',
        legacyText: 'Tous à Table — Atelier d\'Ébénisterie d\'Art & Vente de Meubles Antiques — Caen, Deauville, Paris, Normandie, France'
    });

    useEffect(() => {
        const unsub = onSnapshot(doc(db, 'sys_metadata', 'contact_info'), (docSnap) => {
            if (docSnap.exists()) {
                setContactInfo(prev => ({ ...prev, ...docSnap.data() }));
            }
        });
        return () => unsub();
    }, []);

    return (
        <footer className={`${darkMode ? 'bg-[#0A0A0A]' : 'bg-[#111]'} text-white pt-20 md:pt-32 pb-12 px-6 md:px-12 relative z-10 transition-colors duration-500 border-t ${darkMode ? 'border-white/5' : 'border-none'}`}>
            <div className="max-w-[1920px] mx-auto">
                {/* Container: Vertical stack on mobile/tablet/small-laptop. Side-by-side ONLY on XL screens (1280px+) */}
                <div className="flex flex-col xl:flex-row justify-between items-start gap-12 xl:gap-20 mb-20 md:mb-32 relative z-10">

                    <div className="max-w-4xl">
                        <span className="text-[10px] uppercase tracking-[0.6em] text-[#9C8268] mb-6 md:mb-8 block italic font-extrabold antialiased">
                            {contactInfo.footerSubtitle || "Inquiry"}
                        </span>
                        <h2
                            className="font-serif text-5xl md:text-7xl lg:text-7xl xl:text-8xl 2xl:text-9xl leading-[0.95] md:leading-[0.9] font-light italic hover:translate-x-4 transition-transform duration-700 cursor-default text-white break-words"
                            dangerouslySetInnerHTML={{ __html: sanitizeHtml((contactInfo.footerTitle || "Éveiller\nl'Immobile.").replace(/\n/g, '<br />')) }}
                        >
                        </h2>
                    </div>

                    <div className="flex flex-col gap-10 md:gap-16 xl:gap-20 self-start xl:self-end mt-4 xl:mt-0">
                        <div className="space-y-6 md:space-y-8 w-full max-w-full">
                            {/* Email - Optimized for long addresses & perfectly responsive */}
                            <a
                                href={`mailto:${contactInfo.email}`}
                                className="block text-sm sm:text-lg md:text-xl lg:text-xl xl:text-2xl font-light italic hover:text-[#9C8268] transition-colors border-b border-white/10 pb-3 break-all sm:break-normal w-full"
                            >
                                {contactInfo.email}
                            </a>

                            <div className="space-y-4">
                                {/* Phone */}
                                <a href={`tel:${contactInfo.phone?.replace(/\s/g, '')}`} className="block text-base md:text-xl lg:text-2xl font-light italic opacity-60 hover:opacity-100 hover:text-[#9C8268] transition-all tracking-wide">
                                    {contactInfo.phone}
                                </a>

                                {/* Address */}
                                {contactInfo.address && (
                                    <address className="not-italic text-[9px] md:text-xs uppercase tracking-[0.25em] opacity-40 leading-relaxed border-l-2 border-[#9C8268] pl-4 max-w-[280px]">
                                        {contactInfo.address}
                                    </address>
                                )}
                            </div>
                        </div>

                        {/* Social Links - Responsive Layout & Premium Hover Animations */}
                        <div className="flex flex-col md:flex-row gap-8 md:gap-12 lg:gap-16 pt-4 md:pt-0">
                            {/* Instagram */}
                            {contactInfo.instagram && (
                                <a
                                    href={contactInfo.instagram}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex gap-4 items-center opacity-40 hover:opacity-100 transition-all duration-500 group"
                                >
                                    <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:border-[#E1306C] group-hover:bg-[#E1306C]/10 group-hover:scale-110 transition-all duration-500">
                                        <Instagram size={20} className="text-white group-hover:text-[#E1306C] transition-colors duration-500" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] uppercase tracking-[0.4em] italic font-bold group-hover:text-[#E1306C] transition-colors duration-500">Instagram</span>
                                        <span className="text-[8px] uppercase tracking-[0.2em] opacity-40 mt-0.5">Journal de l'Artisan</span>
                                    </div>
                                </a>
                            )}

                            {/* Facebook */}
                            {contactInfo.facebook && (
                                <a href={contactInfo.facebook} target="_blank" rel="noopener noreferrer" className="flex gap-4 items-center opacity-40 hover:opacity-100 transition-all duration-500 group">
                                    <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:border-[#1877F2] group-hover:bg-[#1877F2]/10 group-hover:scale-110 transition-all duration-500">
                                        <Facebook size={20} className="text-white group-hover:text-[#1877F2] transition-colors duration-500" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] uppercase tracking-[0.4em] italic font-bold group-hover:text-[#1877F2] transition-colors duration-500">Facebook</span>
                                        <span className="text-[8px] uppercase tracking-[0.2em] opacity-40 mt-0.5">Suivez-nous</span>
                                    </div>
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-12 border-t border-white/5 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8 text-[9px] uppercase tracking-[0.3em] font-light relative z-10 text-white/40">
                    <span className="leading-relaxed max-w-lg">
                        {contactInfo.legacyText || "Livraison sur Caen, Deauville, Bayeux, Cabourg & toute la Normandie. Tous à Table made in Normandie livre sur toute la France et pays frontaliers."}
                    </span>

                    {/* Developer Credit - Centered on Desktop (Ordered 2nd) */}
                    <div className="flex flex-col items-start xl:items-center gap-1 text-white/60 whitespace-nowrap">
                        <span className="flex items-center gap-2 text-[10px] tracking-[0.2em] font-medium">
                            Made with <span className="text-red-500 text-sm animate-pulse drop-shadow-[0_0_5px_rgba(239,68,68,0.8)]">❤</span> by <span className="font-bold border-b border-white/30 pb-0.5">Matthis Fradin</span>
                        </span>
                        <a href="tel:0782013155" className="text-[9px] tracking-[0.15em] font-medium text-white/60 hover:text-[#9C8268] transition-all duration-300">
                            Contact : 07.82.01.31.55
                        </a>
                    </div>

                    <div className="flex gap-8 md:gap-12 lowercase underline underline-offset-4 font-bold tracking-widest self-start xl:self-auto">
                        <a href="/?page=gallery" className="cursor-pointer hover:text-white transition-colors">La Galerie</a>
                        <span className="cursor-pointer hover:text-white transition-colors">privacy policy</span>
                        <span className="cursor-pointer hover:text-white transition-colors">legal mentions</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
