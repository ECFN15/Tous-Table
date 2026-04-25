import React, { useEffect, useState } from 'react';
import { ArrowRight, ChevronDown, Facebook, Instagram, Mail, MapPin, Phone } from 'lucide-react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';

const FooterColumn = ({ title, children }) => (
    <div>
        <h3 className="mb-4 text-[#dba45f] text-[11px] font-black uppercase tracking-[0.24em]">{title}</h3>
        <div className="space-y-2 font-serif text-[1.05rem] leading-snug text-stone-300">
            {children}
        </div>
    </div>
);

const MobileDisclosure = ({ title, children }) => (
    <details className="group border-b border-[#8a5b2a]/22 py-5">
        <summary className="flex cursor-pointer list-none items-center justify-between text-stone-300 text-[13px] font-black uppercase tracking-[0.24em]">
            {title}
            <ChevronDown size={18} className="text-[#dba45f] transition-transform group-open:rotate-180" />
        </summary>
        <div className="pt-4 font-serif text-xl leading-snug text-stone-300">
            {children}
        </div>
    </details>
);

const Footer = () => {
    const [contactInfo, setContactInfo] = useState({
        email: 'tousatablemadeinnormandie@gmail.com',
        phone: '07 77 32 41 78',
        instagram: '',
        facebook: '',
        address: '346 Chem. de Fleury, Ifs, Normandie, France',
        legacyText: 'Tous a Table made in Normandie livre sur toute la France et pays frontaliers.'
    });

    useEffect(() => {
        const unsub = onSnapshot(doc(db, 'sys_metadata', 'contact_info'), (docSnap) => {
            if (docSnap.exists()) {
                setContactInfo((prev) => ({ ...prev, ...docSnap.data() }));
            }
        });
        return () => unsub();
    }, []);

    const email = contactInfo.email || 'tousatablemadeinnormandie@gmail.com';
    const phone = contactInfo.phone || '07 77 32 41 78';
    const address = contactInfo.address || '346 Chem. de Fleury, Ifs, Normandie, France';

    return (
        <footer className="relative z-10 border-t border-[#8a5b2a]/25 bg-[#050605] text-white">
            <div className="max-w-[1920px] mx-auto px-5 md:px-16 py-12 md:py-16">
                <div className="md:hidden">
                    <MobileDisclosure title="A propos">
                        <a href="/" className="block hover:text-[#dba45f]">Notre histoire</a>
                        <a href="/?page=gallery" className="block hover:text-[#dba45f]">La galerie</a>
                        <a href="/?page=shop" className="block hover:text-[#dba45f]">Le comptoir</a>
                    </MobileDisclosure>
                    <MobileDisclosure title="Aide">
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
                    <MobileDisclosure title="Infos legales">
                        <span className="block">CGV</span>
                        <span className="block">Mentions legales</span>
                        <span className="block">Politique de confidentialite</span>
                    </MobileDisclosure>
                </div>

                <div className="grid gap-10 md:grid-cols-[1.2fr_0.75fr_0.75fr_0.9fr_1.25fr] md:items-start">
                    <div className="space-y-5">
                        <div>
                            <p className="font-serif text-2xl leading-none text-white">Tous à Table</p>
                            <p className="mt-1 font-serif text-lg italic text-[#dba45f]">Atelier Normand</p>
                        </div>
                        <p className="max-w-xs font-serif text-lg leading-snug text-stone-300">
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
                        <FooterColumn title="A propos">
                            <a href="/" className="block hover:text-[#dba45f]">Notre histoire</a>
                            <a href="/?page=gallery" className="block hover:text-[#dba45f]">La galerie</a>
                            <a href="/?page=shop" className="block hover:text-[#dba45f]">Le comptoir</a>
                        </FooterColumn>
                    </div>

                    <div className="hidden md:block">
                        <FooterColumn title="Aide">
                            <a href={`tel:${phone.replace(/\s/g, '')}`} className="block hover:text-[#dba45f]">Livraison & retours</a>
                            <a href={`mailto:${email}`} className="block hover:text-[#dba45f]">Contact</a>
                            <span className="block">FAQ</span>
                        </FooterColumn>
                    </div>

                    <div className="hidden md:block">
                        <FooterColumn title="Infos legales">
                            <span className="block">CGV</span>
                            <span className="block">Mentions legales</span>
                            <span className="block">Politique de confidentialite</span>
                        </FooterColumn>
                    </div>

                    <div className="space-y-5">
                        <h3 className="text-[#dba45f] text-[11px] font-black uppercase tracking-[0.24em]">Recevoir nos nouveautes</h3>
                        <p className="font-serif text-lg leading-snug text-stone-300">
                            Nouveaux arrivages, pieces uniques et inspirations directement dans votre boite mail.
                        </p>
                        <form onSubmit={(event) => event.preventDefault()} className="flex h-14 overflow-hidden border border-[#8a5b2a]/65">
                            <input
                                type="email"
                                placeholder="Votre adresse email"
                                className="min-w-0 flex-1 bg-transparent px-4 font-serif text-lg text-white outline-none placeholder:text-stone-500"
                                aria-label="Votre adresse email"
                            />
                            <button type="submit" className="flex w-14 items-center justify-center text-[#dba45f] transition-colors hover:bg-[#dba45f] hover:text-black" aria-label="S'inscrire a la newsletter">
                                <ArrowRight size={23} strokeWidth={1.5} />
                            </button>
                        </form>
                        <div className="space-y-3 border-l border-[#8a5b2a]/50 pl-4 text-stone-300">
                            <a href={`mailto:${email}`} className="flex items-start gap-3 break-all font-serif text-lg italic text-white hover:text-[#dba45f]">
                                <Mail size={17} className="mt-1 shrink-0 text-[#dba45f]" />
                                {email}
                            </a>
                            <a href={`tel:${phone.replace(/\s/g, '')}`} className="flex items-center gap-3 font-serif text-lg italic hover:text-[#dba45f]">
                                <Phone size={17} className="text-[#dba45f]" />
                                {phone}
                            </a>
                            <address className="flex items-start gap-3 not-italic text-[10px] font-black uppercase tracking-[0.22em] leading-relaxed text-stone-500">
                                <MapPin size={17} className="mt-0.5 shrink-0 text-[#dba45f]" />
                                {address}
                            </address>
                        </div>
                    </div>
                </div>

                <div className="mt-12 border-t border-[#8a5b2a]/25 pt-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                    <p className="font-serif text-lg text-stone-400">© 2026 Tous à Table - Atelier Normand</p>
                    <div className="flex flex-wrap gap-x-8 gap-y-3 text-[10px] font-black uppercase tracking-[0.22em] text-stone-500">
                        <span>Made with ♥ by Matthis Fradin</span>
                        <a href="tel:0782013155" className="hover:text-[#dba45f]">Contact : 07.82.01.31.55</a>
                    </div>
                    <div className="flex gap-5 text-[10px] font-black uppercase tracking-[0.18em] text-stone-500">
                        <a href="/?page=gallery" className="hover:text-[#dba45f]">La galerie</a>
                        <span>Privacy policy</span>
                        <span>Legal mentions</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
