import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import SEO from '../components/shared/SEO';
import { SITE_URL } from '../utils/seoRoutes';

const DELIVERY_URL = '/livraison-meubles-anciens-france';

const DELIVERY_FAQ = [
    {
        question: 'Livrez-vous autour de Caen et Ifs ?',
        answer: 'Oui. La livraison locale est possible autour de l atelier situe a Ifs, notamment sur Caen et les communes proches, avec une organisation adaptee au meuble et a l acces du logement.',
    },
    {
        question: 'Est-il possible de livrer un meuble ancien partout en France ?',
        answer: 'Oui. Les meubles peuvent etre expedies par transporteur specialise dans toute la France, sur devis selon le volume, la fragilite et la destination.',
    },
    {
        question: 'Les pays frontaliers sont-ils desservis ?',
        answer: 'Une livraison vers les pays frontaliers peut etre etudiee sur devis. Le tarif depend du transporteur disponible, de la distance et des conditions de manutention.',
    },
    {
        question: 'Comment connaitre le prix du transport ?',
        answer: 'Le prix se fixe directement avec le vendeur selon le meuble choisi, puis selon les conditions du transporteur retenu. Chaque meuble, trajet et acces peut changer l organisation.',
    },
];

const DELIVERY_STEPS = [
    {
        label: '01',
        title: 'Verification du meuble',
        body: 'Dimensions, poids approximatif, fragilite, finition et contraintes de manutention sont pris en compte avant le transport.',
    },
    {
        label: '02',
        title: 'Choix du transport',
        body: 'Le vendeur et le client valident ensemble la solution la plus coherente, puis le transporteur confirme ses conditions selon le trajet et le meuble.',
    },
    {
        label: '03',
        title: 'Preparation atelier',
        body: 'Le meuble est protege avec soin pour limiter les frottements, les chocs et les marques pendant le trajet.',
    },
    {
        label: '04',
        title: 'Livraison suivie',
        body: 'La livraison se fait sur rendez-vous, avec une attention particuliere aux meubles anciens et aux pieces uniques.',
    },
];

const DELIVERY_ZONES = [
    {
        title: 'Local Ifs & Caen',
        body: 'Livraison locale possible autour de l atelier, dans un rayon d environ 20 km selon disponibilite et acces.',
        detail: 'Ifs, Caen, Fleury-sur-Orne, Mondeville, Herouville-Saint-Clair, Cormelles-le-Royal, Louvigny.',
    },
    {
        title: 'Normandie',
        body: 'Livraison regionale possible sur devis pour les meubles anciens, tables de ferme, buffets, armoires et commodes.',
        detail: 'Calvados, Manche, Orne, Eure et Seine-Maritime selon trajet et transport.',
    },
    {
        title: 'France entiere',
        body: 'Transporteur specialise pour les meubles volumineux ou fragiles, avec une organisation adaptee a la destination.',
        detail: 'Paris, Bretagne, Hauts-de-France, Pays de la Loire, Centre, Sud-Ouest, Sud-Est et autres regions.',
    },
    {
        title: 'Pays frontaliers',
        body: 'Etude possible pour Belgique, Luxembourg, Suisse et zones frontalieres, uniquement sur devis transporteur.',
        detail: 'La faisabilite depend du meuble, de la distance, des formalites et du transport disponible.',
    },
];

const DeliveryView = ({ darkMode = false }) => {
    const schema = useMemo(() => ({
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'WebPage',
                '@id': `${SITE_URL}${DELIVERY_URL}#webpage`,
                url: `${SITE_URL}${DELIVERY_URL}`,
                name: 'Livraison meubles anciens France, Caen et Ifs',
                description: 'Livraison de meubles anciens depuis Ifs pres de Caen : local autour de 20 km, transporteur partout en France et pays frontaliers sur devis.',
                isPartOf: {
                    '@type': 'WebSite',
                    name: 'Tous a Table Made in Normandie',
                    url: SITE_URL,
                },
                about: [
                    'livraison meuble ancien',
                    'transport meuble ancien France',
                    'livraison meuble Caen',
                    'livraison meuble Ifs',
                    'transport table de ferme',
                ],
            },
            {
                '@type': 'BreadcrumbList',
                '@id': `${SITE_URL}${DELIVERY_URL}#breadcrumb`,
                itemListElement: [
                    {
                        '@type': 'ListItem',
                        position: 1,
                        name: 'Accueil',
                        item: `${SITE_URL}/`,
                    },
                    {
                        '@type': 'ListItem',
                        position: 2,
                        name: 'Livraison',
                        item: `${SITE_URL}${DELIVERY_URL}`,
                    },
                ],
            },
            {
                '@type': 'FAQPage',
                '@id': `${SITE_URL}${DELIVERY_URL}#faq`,
                mainEntity: DELIVERY_FAQ.map((item) => ({
                    '@type': 'Question',
                    name: item.question,
                    acceptedAnswer: {
                        '@type': 'Answer',
                        text: item.answer,
                    },
                })),
            },
        ],
    }), []);

    const surface = darkMode ? 'bg-[#0a0a0a] text-white' : 'bg-[#fff8ed] text-stone-950';
    const muted = darkMode ? 'text-stone-400' : 'text-stone-600';
    const hairline = darkMode ? 'border-white/10' : 'border-[#c79b5d]/28';
    const shell = darkMode ? 'bg-white/[0.035] ring-white/10' : 'bg-[#f0dfc7]/48 ring-[#8a5b2a]/12';
    const core = darkMode ? 'bg-[#111111] border-white/8' : 'bg-[#fffaf2] border-[#d2a46a]/24';

    return (
        <main className={`min-h-screen ${surface}`}>
            <SEO
                title="Livraison Meubles Anciens France, Caen & Ifs"
                description="Livraison de meubles anciens depuis Ifs pres de Caen : service local autour de 20 km, transporteur partout en France et pays frontaliers sur devis."
                url={DELIVERY_URL}
                schema={schema}
            />

            <section className="px-5 md:px-12 pt-24 md:pt-28 pb-12 md:pb-16">
                <div className="mx-auto max-w-[1680px]">
                    <motion.div
                        initial={{ opacity: 0, y: 28 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
                        className={`border-y ${hairline} py-10 md:py-14`}
                    >
                        <div className="grid min-w-0 gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
                            <div className="min-w-0">
                                <p className={`mb-6 inline-flex rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] ${darkMode ? 'border-white/10 text-amber-400' : 'border-[#c79b5d]/45 text-amber-800'}`}>
                                    Livraison atelier
                                </p>
                                <h1
                                    className="max-w-full break-words font-serif text-[2.8rem] leading-[0.95] tracking-tight sm:text-[4.4rem] md:text-[5.2rem] xl:text-[5.4rem] 2xl:text-[8rem]"
                                    style={{ width: '100%', maxWidth: 'calc(100vw - 2.5rem)' }}
                                >
                                    <span className="block sm:inline">Livrer une piece</span>{' '}
                                    <span className="block sm:inline">ancienne</span>{' '}
                                    <span className="block sm:inline">demande du soin.</span>
                                </h1>
                            </div>
                            <div className="min-w-0 max-w-2xl lg:ml-auto">
                                <p
                                    className={`max-w-full break-words font-serif text-xl leading-relaxed md:text-2xl ${muted}`}
                                    style={{ width: '100%', maxWidth: 'calc(100vw - 2.5rem)' }}
                                >
                                    <span className="block sm:inline">Depuis l atelier de Ifs, pres de Caen,</span>{' '}
                                    <span className="block sm:inline">les meubles anciens peuvent etre remis</span>{' '}
                                    <span className="block sm:inline">en main propre localement ou confies</span>{' '}
                                    <span className="block sm:inline">a un transporteur pour la France entiere</span>{' '}
                                    <span className="block sm:inline">et certains pays frontaliers sur devis.</span>
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            <section className="px-5 md:px-12 py-10 md:py-20">
                <div className="mx-auto grid max-w-[1680px] gap-5 md:grid-cols-2 xl:grid-cols-4">
                    {DELIVERY_ZONES.map((zone, index) => (
                        <motion.div
                            key={zone.title}
                            initial={{ opacity: 0, y: 28 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-80px' }}
                            transition={{ duration: 0.75, delay: index * 0.06, ease: [0.32, 0.72, 0, 1] }}
                            className={`rounded-[2rem] p-1.5 ring-1 ${shell}`}
                        >
                            <div className={`h-full rounded-[calc(2rem-0.375rem)] border p-6 md:p-7 ${core}`}>
                                <p className={`mb-8 text-[10px] font-black uppercase tracking-[0.24em] ${darkMode ? 'text-amber-400' : 'text-amber-800'}`}>
                                    Zone {String(index + 1).padStart(2, '0')}
                                </p>
                                <h2 className="mb-4 font-serif text-3xl leading-none tracking-tight">
                                    {zone.title}
                                </h2>
                                <p className={`mb-5 text-sm leading-relaxed ${muted}`}>
                                    {zone.body}
                                </p>
                                <p className={`border-t pt-5 text-xs leading-relaxed ${hairline} ${darkMode ? 'text-stone-500' : 'text-stone-500'}`}>
                                    {zone.detail}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            <section className="px-5 md:px-12 py-12 md:py-24">
                <div className="mx-auto max-w-[1680px]">
                    <div className="grid gap-10 lg:grid-cols-[0.65fr_1.35fr]">
                        <div>
                            <p className={`mb-4 text-[10px] font-black uppercase tracking-[0.28em] ${darkMode ? 'text-amber-400' : 'text-amber-800'}`}>
                                Methode
                            </p>
                            <h2 className="font-serif text-4xl leading-tight tracking-tight md:text-6xl">
                                Un transport prepare comme une restauration.
                            </h2>
                        </div>
                        <div className={`divide-y border-y ${hairline}`}>
                            {DELIVERY_STEPS.map((step) => (
                                <motion.div
                                    key={step.label}
                                    initial={{ opacity: 0, y: 22 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: '-80px' }}
                                    transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
                                    className={`grid gap-4 py-7 md:grid-cols-[90px_0.8fr_1.2fr] md:items-start ${hairline}`}
                                >
                                    <span className={`font-serif text-3xl ${darkMode ? 'text-amber-400/70' : 'text-amber-800/70'}`}>
                                        {step.label}
                                    </span>
                                    <h3 className="font-serif text-2xl leading-tight">
                                        {step.title}
                                    </h3>
                                    <p className={`text-sm leading-relaxed md:text-base ${muted}`}>
                                        {step.body}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section className="px-5 md:px-12 py-12 md:py-24">
                <div className="mx-auto max-w-[1240px]">
                    <div className="mb-10">
                        <p className={`mb-4 text-[10px] font-black uppercase tracking-[0.28em] ${darkMode ? 'text-amber-400' : 'text-amber-800'}`}>
                            Questions transport
                        </p>
                        <h2 className="font-serif text-4xl leading-tight tracking-tight md:text-6xl">
                            Livraison des meubles anciens.
                        </h2>
                    </div>
                    <div className={`divide-y border-y ${hairline}`}>
                        {DELIVERY_FAQ.map((item) => (
                            <div key={item.question} className="grid gap-3 py-6 md:grid-cols-[0.8fr_1.2fr] md:gap-10">
                                <h3 className="font-serif text-xl leading-snug md:text-2xl">
                                    {item.question}
                                </h3>
                                <p className={`text-sm leading-relaxed md:text-base ${muted}`}>
                                    {item.answer}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </main>
    );
};

export default DeliveryView;
