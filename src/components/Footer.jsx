import React, { useState, useEffect } from 'react';
import { Instagram, Facebook, Mail } from 'lucide-react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';

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
                {/* Container: Vertical stack on mobile, Side-by-side on LG screens (1024px+) */}
                <div className="flex flex-col lg:flex-row justify-between items-start gap-12 lg:gap-20 mb-20 md:mb-32 relative z-10">

                    <div className="max-w-4xl">
                        <span className="text-[10px] uppercase tracking-[0.6em] text-[#9C8268] mb-6 md:mb-8 block italic font-extrabold antialiased">
                            {contactInfo.footerSubtitle || "Inquiry"}
                        </span>
                        <h2
                            className="font-serif text-5xl md:text-7xl lg:text-8xl xl:text-9xl leading-[0.95] md:leading-[0.9] font-light italic hover:translate-x-4 transition-transform duration-700 cursor-default text-white break-words"
                            dangerouslySetInnerHTML={{ __html: (contactInfo.footerTitle || "Éveiller\nl'Immobile.").replace(/\n/g, '<br />') }}
                        >
                        </h2>
                    </div>

                    <div className="flex flex-col gap-10 md:gap-16 lg:gap-20 self-start lg:self-end mt-4 lg:mt-0">
                        <div className="space-y-6 md:space-y-8 w-full max-w-full">
                            {/* Email - Optimized for long addresses & perfectly responsive */}
                            <a
                                href={`mailto:${contactInfo.email}`}
                                className="block text-sm sm:text-lg md:text-xl lg:text-3xl xl:text-3xl font-light italic hover:text-[#9C8268] transition-colors border-b border-white/10 pb-3 break-all sm:break-normal w-full"
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
                                <a href={contactInfo.instagram} target="_blank" rel="noopener noreferrer" className="flex gap-4 items-center opacity-40 hover:opacity-100 transition-all duration-500 group">
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
                <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 opacity-40 text-[9px] uppercase tracking-[0.3em] font-light relative z-10">
                    <span className="leading-relaxed max-w-2xl">
                        {contactInfo.legacyText || "Tous à Table — Atelier d'Ébénisterie d'Art & Vente de Meubles Antiques — Caen, Deauville, Paris, Normandie, France"}
                    </span>
                    <div className="flex gap-8 md:gap-12 lowercase underline underline-offset-4 font-bold tracking-widest">
                        <span className="cursor-pointer hover:text-white transition-colors">privacy policy</span>
                        <span className="cursor-pointer hover:text-white transition-colors">legal mentions</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
