import React from 'react';
import { ChevronDown, Facebook, Instagram, Mail, MapPin, Phone } from 'lucide-react';

const FooterColumn = ({ title, children, darkMode = true }) => (
    <div>
        <h3 className="mb-4 text-[#dba45f] text-[11px] font-black uppercase tracking-[0.24em]">{title}</h3>
        <div className={`space-y-2 font-serif text-[1.05rem] leading-snug ${darkMode ? 'text-stone-300' : 'text-stone-700'}`}>
            {children}
        </div>
    </div>
);

const MobileDisclosure = ({ title, children, darkMode = true }) => (
    <details className="group border-b border-[#8a5b2a]/22 py-5">
        <summary className={`flex cursor-pointer list-none items-center justify-between text-[13px] font-black uppercase tracking-[0.24em] ${darkMode ? 'text-stone-300' : 'text-stone-800'}`}>
            {title}
            <ChevronDown size={18} className="text-[#dba45f] transition-transform group-open:rotate-180" />
        </summary>
        <div className={`pt-4 font-serif text-xl leading-snug ${darkMode ? 'text-stone-300' : 'text-stone-700'}`}>
            {children}
        </div>
    </details>
);

const DEFAULT_CONTACT_INFO = {
    email: 'tousatablemadeinnormandie@gmail.com',
    phone: '07 77 32 41 78',
    instagram: '',
    facebook: '',
    address: '346 Chem. de Fleury, Ifs, Normandie, France',
    legacyText: 'Tous a Table made in Normandie livre sur toute la France et pays frontaliers.'
};

const Footer = ({ darkMode = false, contactInfo: contactInfoProp = {} }) => {
    const contactInfo = { ...DEFAULT_CONTACT_INFO, ...contactInfoProp };

    const email = contactInfo.email || 'tousatablemadeinnormandie@gmail.com';
    const phone = contactInfo.phone || '07 77 32 41 78';
    const address = contactInfo.address || '346 Chem. de Fleury, Ifs, Normandie, France';

    return (
        <footer className={`relative z-10 border-t border-[#8a5b2a]/25 ${darkMode ? 'bg-[#050605] text-white' : 'bg-[#fff8ed] text-stone-950 shadow-[0_-24px_70px_rgba(102,74,36,0.08)]'}`}>
            <div className="max-w-[1920px] mx-auto px-5 md:px-16 py-12 md:py-16">
                <div className="mb-8 md:hidden">
                    <MobileDisclosure title="A propos" darkMode={darkMode}>
                        <a href="/" className="block hover:text-[#dba45f]">Accueil</a>
                        <a href="/a-propos" className="block hover:text-[#dba45f]">Notre histoire</a>
                        <a href="/meubles-anciens" className="block hover:text-[#dba45f]">La galerie</a>
                        <a href="/comptoir" className="block hover:text-[#dba45f]">Le comptoir</a>
                    </MobileDisclosure>
                    <MobileDisclosure title="Aide" darkMode={darkMode}>
                        <a href="/livraison-meubles-anciens-france" className="block hover:text-[#dba45f]">Livraison</a>
                        <a href={`tel:${phone.replace(/\s/g, '')}`} className="block hover:text-[#dba45f]">{phone}</a>
                        <a href={`mailto:${email}`} className="block break-all hover:text-[#dba45f]">{email}</a>
                        <a
                            href="https://www.google.com/maps/dir/?api=1&destination=Tous+a+Table+Atelier+Normand+346+Chem.+de+Fleury+14123+Ifs"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block hover:text-[#dba45f]"
                        >
                            Itineraire atelier
                        </a>
                    </MobileDisclosure>
                    <MobileDisclosure title="Infos legales" darkMode={darkMode}>
                        <span className="block">CGV</span>
                        <span className="block">Mentions legales</span>
                        <span className="block">Politique de confidentialite</span>
                    </MobileDisclosure>
                </div>

                <div className="grid gap-10 md:grid-cols-2 md:items-start lg:grid-cols-[1.2fr_0.75fr_0.75fr_0.9fr_minmax(18rem,1.35fr)]">
                    <div className="space-y-5">
                        <div>
                            <p className={`font-serif text-[1.35rem] md:text-2xl leading-none ${darkMode ? 'text-white' : 'text-stone-950'}`}>Tous à Table</p>
                            <p className="mt-1 font-serif text-base md:text-lg italic text-[#dba45f]">Atelier Normand</p>
                        </div>
                        <p className={`max-w-xs font-serif text-lg leading-snug ${darkMode ? 'text-stone-300' : 'text-stone-700'}`}>
                            {contactInfo.legacyText || 'Tous a Table made in Normandie livre sur toute la France et pays frontaliers.'}
                        </p>
                        <div className="flex gap-3">
                            {contactInfo.instagram && (
                                <a href={contactInfo.instagram} target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full border border-[#8a5b2a]/55 text-stone-200 transition-colors hover:border-[#dba45f] hover:text-[#dba45f]" title="Instagram">
                                    <Instagram size={18} />
                                </a>
                            )}
                            {contactInfo.facebook && (
                                <a href={contactInfo.facebook} target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full border border-[#8a5b2a]/55 text-stone-200 transition-colors hover:border-[#dba45f] hover:text-[#dba45f]" title="Facebook">
                                    <Facebook size={18} />
                                </a>
                            )}
                            <a href={`mailto:${email}`} className="flex h-10 w-10 items-center justify-center rounded-full border border-[#8a5b2a]/55 text-stone-200 transition-colors hover:border-[#dba45f] hover:text-[#dba45f]" title="Email">
                                <Mail size={18} />
                            </a>
                        </div>
                    </div>

                    <div className="hidden md:block">
                        <FooterColumn title="A propos" darkMode={darkMode}>
                            <a href="/" className="block hover:text-[#dba45f]">Accueil</a>
                            <a href="/a-propos" className="block hover:text-[#dba45f]">Notre histoire</a>
                            <a href="/meubles-anciens" className="block hover:text-[#dba45f]">La galerie</a>
                            <a href="/comptoir" className="block hover:text-[#dba45f]">Le comptoir</a>
                        </FooterColumn>
                    </div>

                    <div className="hidden md:block">
                        <FooterColumn title="Aide" darkMode={darkMode}>
                            <a href="/livraison-meubles-anciens-france" className="block hover:text-[#dba45f]">Livraison</a>
                            <a href={`mailto:${email}`} className="block hover:text-[#dba45f]">Contact</a>
                            <span className="block">FAQ</span>
                        </FooterColumn>
                    </div>

                    <div className="hidden md:block">
                        <FooterColumn title="Infos legales" darkMode={darkMode}>
                            <span className="block">CGV</span>
                            <span className="block">Mentions legales</span>
                            <span className="block">Politique de confidentialite</span>
                        </FooterColumn>
                    </div>

                    <div className="min-w-0 space-y-5 md:pt-0">
                        <h3 className="text-[#dba45f] text-[11px] font-black uppercase tracking-[0.24em]">Contact atelier</h3>
                        <p className={`font-serif text-lg leading-snug ${darkMode ? 'text-stone-300' : 'text-stone-700'}`}>
                            Une question sur une piece, une livraison ou une restauration ? Contactez directement l'atelier.
                        </p>
                        <div className={`space-y-3 border-l border-[#8a5b2a]/50 pl-4 ${darkMode ? 'text-stone-300' : 'text-stone-700'}`}>
                            <a href={`mailto:${email}`} className={`flex min-w-0 items-start gap-3 font-serif text-base italic [overflow-wrap:anywhere] hover:text-[#dba45f] xl:text-lg ${darkMode ? 'text-white' : 'text-stone-950'}`}>
                                <Mail size={17} className="mt-1 shrink-0 text-[#dba45f]" />
                                <span className="min-w-0 break-words">{email}</span>
                            </a>
                            <a href={`tel:${phone.replace(/\s/g, '')}`} className="flex items-center gap-3 font-serif text-lg italic hover:text-[#dba45f]">
                                <Phone size={17} className="text-[#dba45f]" />
                                {phone}
                            </a>
                            <address className="flex min-w-0 items-start gap-3 not-italic text-[10px] font-black uppercase tracking-[0.22em] leading-relaxed text-stone-500 [overflow-wrap:anywhere]">
                                <MapPin size={17} className="mt-0.5 shrink-0 text-[#dba45f]" />
                                <span className="min-w-0 break-words">{address}</span>
                            </address>
                        </div>
                    </div>
                </div>

                <div className="mt-12 border-t border-[#8a5b2a]/25 pt-8 flex min-w-0 flex-col gap-5 md:flex-row md:flex-wrap md:items-center md:justify-between">
                    <p className={`min-w-0 font-serif text-lg ${darkMode ? 'text-stone-400' : 'text-stone-600'}`}>© 2026 Tous à Table - Atelier Normand</p>
                    <div className="flex min-w-0 flex-wrap gap-x-8 gap-y-3 text-[10px] font-black uppercase tracking-[0.22em] text-stone-500">
                        <span>Made with ♥ by Matthis Fradin</span>
                        <a href="tel:0782013155" className="hover:text-[#dba45f]">Contact : 07.82.01.31.55</a>
                    </div>
                    <div className="flex min-w-0 flex-wrap gap-5 text-[10px] font-black uppercase tracking-[0.18em] text-stone-500 md:justify-end">
                        <a href="/" className="hover:text-[#dba45f]">Accueil</a>
                        <a href="/meubles-anciens" className="hover:text-[#dba45f]">La galerie</a>
                        <span>Privacy policy</span>
                        <span>Legal mentions</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
