import React, { useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
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
        kicker: 'Remise locale',
        title: 'Local Ifs & Caen',
        body: 'Livraison locale possible autour de l atelier, dans un rayon d environ 20 km selon disponibilite et acces.',
        detail: 'Ifs, Caen, Fleury-sur-Orne, Mondeville, Herouville-Saint-Clair, Cormelles-le-Royal, Louvigny.',
    },
    {
        kicker: 'Trajet regional',
        title: 'Normandie',
        body: 'Livraison regionale possible sur devis pour les meubles anciens, tables de ferme, buffets, armoires et commodes.',
        detail: 'Calvados, Manche, Orne, Eure et Seine-Maritime selon trajet et transport.',
    },
    {
        kicker: 'Transport France',
        title: 'France entiere',
        body: 'Transporteur specialise pour les meubles volumineux ou fragiles, avec une organisation adaptee a la destination.',
        detail: 'Paris, Bretagne, Hauts-de-France, Pays de la Loire, Centre, Sud-Ouest, Sud-Est et autres regions.',
    },
    {
        kicker: 'Sur devis',
        title: 'Pays frontaliers',
        body: 'Etude possible pour Belgique, Luxembourg, Suisse et zones frontalieres, uniquement sur devis transporteur.',
        detail: 'La faisabilite depend du meuble, de la distance, des formalites et du transport disponible.',
    },
];

const MAP_BOUNDS = {
    minLon: -5.35,
    maxLon: 9.65,
    minLat: 41.15,
    maxLat: 51.35,
    x: 70,
    y: 54,
    width: 500,
    height: 430,
};

const projectCoord = ([lon, lat]) => [
    Number((MAP_BOUNDS.x + ((lon - MAP_BOUNDS.minLon) / (MAP_BOUNDS.maxLon - MAP_BOUNDS.minLon)) * MAP_BOUNDS.width).toFixed(1)),
    Number((MAP_BOUNDS.y + ((MAP_BOUNDS.maxLat - lat) / (MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat)) * MAP_BOUNDS.height).toFixed(1)),
];

const projectPoint = (lon, lat) => {
    const [x, y] = projectCoord([lon, lat]);
    return { x, y };
};

const FRANCE_MAINLAND_LONLAT = [
    [2.55, 51.09], [1.75, 50.96], [1.28, 50.72], [1.06, 50.36],
    [0.12, 49.52], [-0.72, 49.36], [-1.26, 49.68], [-1.95, 49.72],
    [-1.88, 49.36], [-2.55, 49.20], [-3.08, 48.84], [-4.34, 48.68],
    [-4.78, 48.39], [-4.78, 48.04], [-4.47, 47.78], [-3.86, 47.70],
    [-3.18, 47.84], [-2.42, 47.52], [-2.05, 47.28], [-2.23, 46.86],
    [-1.63, 46.35], [-1.20, 45.75], [-1.13, 45.28], [-1.44, 44.66],
    [-1.22, 44.10], [-1.66, 43.39], [-0.76, 43.30], [0.18, 42.86],
    [1.44, 42.62], [2.16, 42.43], [2.95, 42.35], [3.18, 42.84],
    [3.02, 43.24], [3.78, 43.37], [4.35, 43.51], [4.78, 43.36],
    [5.38, 43.25], [5.98, 43.08], [6.73, 43.14], [7.53, 43.78],
    [7.16, 44.17], [6.98, 44.74], [6.80, 45.18], [7.05, 45.74],
    [6.64, 45.94], [6.10, 46.24], [6.14, 46.67], [6.82, 47.43],
    [7.50, 47.78], [7.80, 48.58], [7.36, 49.11], [6.90, 49.16],
    [6.38, 49.45], [5.88, 49.53], [5.48, 49.50], [4.84, 50.16],
    [4.14, 49.98], [3.63, 50.38], [3.07, 50.78],
];

const CORSICA_LONLAT = [
    [8.58, 43.02], [9.18, 42.82], [9.46, 42.28], [9.36, 41.72],
    [8.98, 41.36], [8.62, 41.58], [8.53, 42.15], [8.48, 42.62],
];

const FRONTIER_POLYGONS_LONLAT = [
    [[2.7, 51.18], [6.3, 51.06], [6.25, 49.65], [3.6, 50.24]],
    [[6.05, 49.7], [9.4, 49.4], [9.25, 45.9], [6.15, 46.25]],
    [[6.0, 46.2], [9.0, 46.4], [8.2, 45.6], [6.65, 45.8]],
    [[6.9, 44.7], [9.45, 44.8], [9.35, 41.4], [6.2, 43.1]],
    [[-2.0, 43.55], [3.2, 42.55], [2.2, 41.28], [-2.4, 41.85]],
];

const FRANCE_POLYGON = FRANCE_MAINLAND_LONLAT.map(projectCoord);
const CORSICA_POLYGON = CORSICA_LONLAT.map(projectCoord);
const FRONTIER_POLYGONS = FRONTIER_POLYGONS_LONLAT.map((polygon) => polygon.map(projectCoord));
const FRANCE_OUTLINE_PATH = `M${FRANCE_POLYGON.map(([x, y]) => `${x} ${y}`).join(' L')} Z`;
const CORSICA_OUTLINE_PATH = `M${CORSICA_POLYGON.map(([x, y]) => `${x} ${y}`).join(' L')} Z`;

const IFS_COORD = projectPoint(-0.35, 49.14);

const DELIVERY_CITIES = [
    { name: 'IFS', ...IFS_COORD, r: 8.4, labelDx: 15, labelDy: -8, anchor: 'start', main: true },
    { name: 'PARIS', ...projectPoint(2.35, 48.86), r: 6.8, labelDx: 12, labelDy: 14, anchor: 'start', main: true },
    { name: 'BORDEAUX', ...projectPoint(-0.58, 44.84), r: 6.2, labelDx: -12, labelDy: 18, anchor: 'end', main: true },
    { name: 'LYON', ...projectPoint(4.83, 45.76), r: 6.4, labelDx: 12, labelDy: 4, anchor: 'start', main: true },
    { name: 'MARSEILLE', ...projectPoint(5.37, 43.30), r: 5.8, labelDx: -12, labelDy: 18, anchor: 'end', main: true },
    { name: 'LILLE', ...projectPoint(3.06, 50.63), r: 4.3, labelDx: 9, labelDy: -12, anchor: 'start' },
    { name: 'NANTES', ...projectPoint(-1.55, 47.22), r: 4.7, labelDx: -10, labelDy: -10, anchor: 'end' },
    { name: 'TOULOUSE', ...projectPoint(1.44, 43.60), r: 5.1, labelDx: 12, labelDy: 17, anchor: 'start' },
    { name: 'STRASBOURG', ...projectPoint(7.75, 48.58), r: 4.7, labelDx: 12, labelDy: -8, anchor: 'start' },
    { name: 'RENNES', ...projectPoint(-1.68, 48.12), r: 4.1, labelDx: -10, labelDy: -10, anchor: 'end' },
    { name: 'NICE', ...projectPoint(7.26, 43.71), r: 4.4, labelDx: 12, labelDy: 4, anchor: 'start' },
];

const COUNTRY_LABELS = [
    { label: 'BELGIQUE / LUX.', ...projectPoint(4.98, 50.72) },
    { label: 'ALLEMAGNE', ...projectPoint(8.25, 48.95) },
    { label: 'SUISSE', ...projectPoint(7.42, 46.33) },
    { label: 'ITALIE', ...projectPoint(8.1, 42.42) },
    { label: 'ESPAGNE', ...projectPoint(-1.65, 41.74) },
    { label: 'FRANCE ENTIERE', ...projectPoint(2.0, 42.0), strong: true },
];

const seededNoise = (seed) => {
    const value = Math.sin(seed * 12.9898) * 43758.5453;
    return value - Math.floor(value);
};

const isInsidePolygon = (point, polygon) => {
    const [x, y] = point;
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const [xi, yi] = polygon[i];
        const [xj, yj] = polygon[j];
        const intersect = ((yi > y) !== (yj > y)) &&
            (x < ((xj - xi) * (y - yi)) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
};

const getBounds = (polygon) => polygon.reduce((bounds, [x, y]) => ({
    minX: Math.min(bounds.minX, x),
    maxX: Math.max(bounds.maxX, x),
    minY: Math.min(bounds.minY, y),
    maxY: Math.max(bounds.maxY, y),
}), { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity });

const buildPolygonParticles = (polygon, options = {}) => {
    const {
        step = 10,
        jitter = 3.2,
        radius = 1.15,
        radiusVariance = 1.05,
        seed = 1,
    } = options;
    const bounds = getBounds(polygon);
    const points = [];
    let index = 0;

    for (let y = bounds.minY; y <= bounds.maxY; y += step) {
        for (let x = bounds.minX; x <= bounds.maxX; x += step) {
            const jx = (seededNoise(seed + index * 1.7) - 0.5) * jitter;
            const jy = (seededNoise(seed + index * 2.3) - 0.5) * jitter;
            const px = x + jx;
            const py = y + jy;
            if (isInsidePolygon([px, py], polygon)) {
                points.push({
                    x: Number(px.toFixed(1)),
                    y: Number(py.toFixed(1)),
                    r: Number((radius + seededNoise(seed + index * 3.1) * radiusVariance).toFixed(2)),
                });
            }
            index += 1;
        }
    }

    return points;
};

const buildBoundaryParticles = (polygon, options = {}) => {
    const { spacing = 7, radius = 1.35, jitter = 0.65, seed = 10 } = options;
    const points = [];
    polygon.forEach(([x1, y1], index) => {
        const [x2, y2] = polygon[(index + 1) % polygon.length];
        const distance = Math.hypot(x2 - x1, y2 - y1);
        const count = Math.max(1, Math.floor(distance / spacing));
        for (let step = 0; step < count; step += 1) {
            const progress = step / count;
            const n = seed + index * 31 + step;
            points.push({
                x: Number((x1 + (x2 - x1) * progress + (seededNoise(n) - 0.5) * jitter).toFixed(1)),
                y: Number((y1 + (y2 - y1) * progress + (seededNoise(n + 7) - 0.5) * jitter).toFixed(1)),
                r: Number((radius + seededNoise(n + 13) * 0.8).toFixed(2)),
            });
        }
    });
    return points;
};

const FRANCE_PARTICLES = [
    ...buildPolygonParticles(FRANCE_POLYGON, {
        step: 7.6,
        jitter: 2.2,
        radius: 0.58,
        radiusVariance: 0.72,
        seed: 42,
    }),
    ...buildPolygonParticles(CORSICA_POLYGON, {
        step: 6.8,
        jitter: 1.6,
        radius: 0.52,
        radiusVariance: 0.58,
        seed: 52,
    }),
];

const FRANCE_BOUNDARY_PARTICLES = [
    ...buildBoundaryParticles(FRANCE_POLYGON, {
        spacing: 4.6,
        radius: 0.82,
        jitter: 0.42,
        seed: 84,
    }),
    ...buildBoundaryParticles(CORSICA_POLYGON, {
        spacing: 4.5,
        radius: 0.76,
        jitter: 0.35,
        seed: 91,
    }),
];

const FRONTIER_PARTICLES = FRONTIER_POLYGONS.flatMap((polygon, index) => buildPolygonParticles(polygon, {
    step: 9.4,
    jitter: 2,
    radius: 0.46,
    radiusVariance: 0.48,
    seed: 140 + index * 23,
}));

const routeTo = ({ x, y }, lift = 0) => {
    const mx = (IFS_COORD.x + x) / 2;
    return `M${IFS_COORD.x} ${IFS_COORD.y} C${mx} ${IFS_COORD.y - 44 + lift} ${mx} ${y + 34 - lift} ${x} ${y}`;
};

const DELIVERY_ROUTES = DELIVERY_CITIES
    .filter((city) => city.name !== 'IFS')
    .filter((city) => ['PARIS', 'BORDEAUX', 'LYON', 'MARSEILLE', 'LILLE', 'NANTES', 'TOULOUSE', 'STRASBOURG'].includes(city.name))
    .map((city, index) => ({
        d: routeTo(city, index % 2 === 0 ? 10 : -8),
        label: city.name,
    }));

const DELIVERY_METRICS = [
    ['20 km', 'autour de Ifs et Caen'],
    ['France', 'transporteur specialise'],
    ['Belgique', 'Luxembourg, Suisse'],
    ['Sur devis', 'selon meuble et acces'],
];

const DeliveryParticleMap = ({ darkMode, shell, core, muted }) => {
    const mapRef = useRef(null);

    useGSAP(() => {
        const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
        if (reduceMotion || !mapRef.current) return undefined;

        const ctx = gsap.context(() => {
            gsap.set('.delivery-particle', { opacity: 0.68, scale: 1, transformOrigin: 'center' });
            gsap.set('.delivery-boundary-particle', { opacity: 0.96, scale: 1, transformOrigin: 'center' });
            gsap.set('.delivery-frontier-particle', { opacity: 0.28, scale: 1, transformOrigin: 'center' });
            gsap.set('.delivery-city, .delivery-city-label', { opacity: 1, scale: 1, transformOrigin: 'center' });
            gsap.set('.delivery-flow', { strokeDasharray: '2 15', strokeDashoffset: 0, opacity: 0.78 });

            gsap.to('.delivery-flow', {
                strokeDashoffset: -150,
                duration: 4.8,
                repeat: -1,
                ease: 'none',
                stagger: 0.16,
            });

            gsap.utils.toArray('.delivery-pulse').forEach((ring, index) => {
                const from = Number(ring.dataset.pulseFrom);
                const to = Number(ring.dataset.pulseTo);
                gsap.fromTo(ring, {
                    attr: { r: from },
                    opacity: 0.44,
                }, {
                    attr: { r: to },
                    opacity: 0,
                    duration: 2.35,
                    delay: index * 0.58,
                    repeat: -1,
                    ease: 'sine.out',
                });
            });
        }, mapRef);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={mapRef} className="px-5 md:px-12 py-6 md:py-24">
            <div className="mx-auto grid min-w-0 max-w-[1680px] grid-flow-dense gap-6 md:gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
                <motion.div
                    initial={{ opacity: 0, y: 34 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-100px' }}
                    transition={{ duration: 0.9, ease: [0.32, 0.72, 0, 1] }}
                    className={`min-w-0 rounded-[2.4rem] p-1.5 ring-1 ${shell}`}
                    style={{ width: '100%', maxWidth: 'calc(100vw - 2.5rem)', boxSizing: 'border-box' }}
                >
                    <div className={`relative overflow-hidden rounded-[calc(2.4rem-0.375rem)] border ${core}`}>
                        <div className={`absolute inset-0 ${darkMode ? 'bg-[linear-gradient(135deg,rgba(217,164,95,0.08),rgba(17,17,17,0)_42%,rgba(89,117,93,0.09))]' : 'bg-[linear-gradient(135deg,rgba(217,164,95,0.16),rgba(255,250,242,0)_44%,rgba(89,117,93,0.1))]'}`} />
                        <svg
                            viewBox="0 0 640 560"
                            role="img"
                            aria-label="Carte particulaire de livraison depuis Ifs vers la France et les pays frontaliers"
                            className="relative z-10 block aspect-[1.14] w-full"
                        >
                            <defs>
                                <filter id="deliveryGlow" x="-50%" y="-50%" width="200%" height="200%">
                                    <feGaussianBlur stdDeviation="5" result="blur" />
                                    <feMerge>
                                        <feMergeNode in="blur" />
                                        <feMergeNode in="SourceGraphic" />
                                    </feMerge>
                                </filter>
                                <linearGradient id="deliveryRoute" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#f0b969" />
                                    <stop offset="100%" stopColor="#7d9a72" />
                                </linearGradient>
                            </defs>

                            {COUNTRY_LABELS.map((country) => (
                                <text
                                    key={country.label}
                                    x={country.x}
                                    y={country.y}
                                    className={`${country.strong ? '' : 'hidden sm:block'} ${country.strong
                                        ? (darkMode ? 'fill-stone-400' : 'fill-stone-600')
                                        : (darkMode ? 'fill-stone-500' : 'fill-stone-500')}`}
                                    fontSize={country.strong ? 15 : 12}
                                    fontWeight={country.strong ? 900 : 800}
                                    letterSpacing={country.strong ? 4 : 3}
                            >
                                {country.label}
                            </text>
                        ))}

                            <path
                                d={FRANCE_OUTLINE_PATH}
                                fill="none"
                                stroke={darkMode ? 'rgba(245,213,159,0.22)' : 'rgba(111,67,29,0.22)'}
                                strokeWidth="1.2"
                                strokeLinejoin="round"
                            />
                            <path
                                d={CORSICA_OUTLINE_PATH}
                                fill="none"
                                stroke={darkMode ? 'rgba(245,213,159,0.18)' : 'rgba(111,67,29,0.18)'}
                                strokeWidth="1"
                                strokeLinejoin="round"
                            />

                            {FRONTIER_PARTICLES.map((point, index) => (
                                <circle
                                    key={`frontier-${index}`}
                                    className="delivery-frontier-particle"
                                    cx={point.x}
                                    cy={point.y}
                                    r={point.r}
                                    fill={darkMode ? '#d9a45f' : '#8a5b2a'}
                                />
                            ))}

                            {FRANCE_PARTICLES.map((point, index) => (
                                <circle
                                    key={`france-${index}`}
                                    className="delivery-particle"
                                    cx={point.x}
                                    cy={point.y}
                                    r={point.r}
                                    fill={darkMode ? '#f5d59f' : '#7a4b1e'}
                                />
                            ))}

                            {FRANCE_BOUNDARY_PARTICLES.map((point, index) => (
                                <circle
                                    key={`boundary-${index}`}
                                    className="delivery-boundary-particle"
                                    cx={point.x}
                                    cy={point.y}
                                    r={point.r}
                                    fill={darkMode ? '#f0b969' : '#6f431d'}
                                />
                            ))}

                            {DELIVERY_ROUTES.map((route) => (
                                <g key={route.label}>
                                    <path
                                        d={route.d}
                                        fill="none"
                                        stroke={darkMode ? 'rgba(245,213,159,0.2)' : 'rgba(111,67,29,0.16)'}
                                        strokeWidth="1.15"
                                        strokeLinecap="round"
                                    />
                                    <path
                                        className="delivery-flow"
                                        d={route.d}
                                        fill="none"
                                        stroke="url(#deliveryRoute)"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        filter="url(#deliveryGlow)"
                                    />
                                </g>
                            ))}

                            <circle
                                className="delivery-pulse"
                                cx={IFS_COORD.x}
                                cy={IFS_COORD.y}
                                r="14"
                                data-pulse-from="14"
                                data-pulse-to="38"
                                fill="none"
                                stroke="#f0b969"
                                strokeWidth="1.6"
                                vectorEffect="non-scaling-stroke"
                            />
                            <circle
                                className="delivery-pulse"
                                cx={IFS_COORD.x}
                                cy={IFS_COORD.y}
                                r="26"
                                data-pulse-from="26"
                                data-pulse-to="58"
                                fill="none"
                                stroke="#f0b969"
                                strokeWidth="1"
                                vectorEffect="non-scaling-stroke"
                            />

                            {DELIVERY_CITIES.map((city) => (
                                <g key={city.name}>
                                    <circle
                                        className="delivery-city"
                                        cx={city.x}
                                        cy={city.y}
                                        r={city.r + 4}
                                        fill={city.main ? '#f0b969' : '#7d9a72'}
                                        opacity="0.12"
                                    />
                                    <circle
                                        className="delivery-city"
                                        cx={city.x}
                                        cy={city.y}
                                        r={city.r}
                                        fill={city.main ? '#f0b969' : '#9aa57c'}
                                        filter={city.main ? 'url(#deliveryGlow)' : undefined}
                                    />
                                    <circle
                                        className="delivery-city"
                                        cx={city.x}
                                        cy={city.y}
                                        r={Math.max(2.2, city.r * 0.42)}
                                        fill={darkMode ? '#111111' : '#fffaf2'}
                                    />
                                    <text
                                        className={`delivery-city-label ${city.main ? '' : 'hidden sm:block'}`}
                                        x={city.x + city.labelDx}
                                        y={city.y + city.labelDy}
                                        textAnchor={city.anchor}
                                        fill={darkMode ? '#f7efe3' : '#2d2118'}
                                        fontSize={city.main ? 13 : 10}
                                        fontWeight={900}
                                        letterSpacing={city.main ? 2.2 : 1.8}
                                    >
                                        {city.name}
                                    </text>
                                    {city.name === 'IFS' && (
                                        <text
                                            className="delivery-city-label hidden sm:block"
                                            x={city.x + 16}
                                            y={city.y + 10}
                                            fill={darkMode ? '#a8a29e' : '#756456'}
                                            fontSize="11"
                                            fontWeight="700"
                                        >
                                            atelier pres de Caen
                                        </text>
                                    )}
                                </g>
                            ))}
                        </svg>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 34 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-100px' }}
                    transition={{ duration: 0.9, delay: 0.08, ease: [0.32, 0.72, 0, 1] }}
                    className="min-w-0"
                >
                    <p className={`mb-4 md:mb-5 inline-flex rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] ${darkMode ? 'border-white/10 text-amber-400' : 'border-[#c79b5d]/45 text-amber-800'}`}>
                        Couverture transport
                    </p>
                    <h2 className="max-w-4xl font-serif text-4xl leading-[0.95] tracking-tight md:text-6xl xl:text-7xl">
                        La piece part de Normandie, pas de votre imagination.
                    </h2>
                    <p className={`mt-5 md:mt-7 max-w-2xl text-base leading-relaxed md:text-lg ${muted}`}>
                        La carte rend visible ce qui compte au moment d acheter : un meuble ancien peut etre livre localement autour de Caen, organise partout en France, et etudie vers les pays frontaliers selon le meuble, la distance et les acces.
                    </p>

                    <div className="mt-6 md:mt-9 grid grid-flow-dense gap-3 sm:grid-cols-2">
                        {DELIVERY_METRICS.map(([value, label]) => (
                            <div key={value} className={`rounded-[1.6rem] p-1 ring-1 ${shell}`}>
                                <div className={`rounded-[calc(1.6rem-0.25rem)] border px-5 py-4 md:py-5 ${core}`}>
                                    <p className="font-serif text-3xl leading-none tracking-tight">{value}</p>
                                    <p className={`mt-2 text-xs font-bold uppercase tracking-[0.18em] ${darkMode ? 'text-stone-500' : 'text-stone-500'}`}>{label}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

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
        <main className={`min-h-screen w-full max-w-full overflow-x-hidden ${surface}`}>
            <SEO
                title="Livraison Meubles Anciens France, Caen & Ifs"
                description="Livraison de meubles anciens depuis Ifs pres de Caen : service local autour de 20 km, transporteur partout en France et pays frontaliers sur devis."
                url={DELIVERY_URL}
                schema={schema}
            />

            <section className="px-5 md:px-12 pt-4 sm:pt-6 md:pt-12 lg:pt-14 pb-6 md:pb-14">
                <div className="mx-auto max-w-[1680px]">
                    <motion.div
                        initial={{ opacity: 0, y: 28 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
                        className={`border-b ${hairline} py-7 md:py-10`}
                    >
                        <div className="grid min-w-0 gap-7 md:gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
                            <div className="min-w-0">
                                <p className={`mb-4 md:mb-6 inline-flex rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] ${darkMode ? 'border-white/10 text-amber-400' : 'border-[#c79b5d]/45 text-amber-800'}`}>
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

            <DeliveryParticleMap
                darkMode={darkMode}
                shell={shell}
                core={core}
                muted={muted}
            />

            <section className="px-5 md:px-12 py-6 md:py-20">
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
                            <div className={`h-full rounded-[calc(2rem-0.375rem)] border p-5 md:p-7 ${core}`}>
                                <p className={`mb-5 md:mb-8 text-[10px] font-black uppercase tracking-[0.24em] ${darkMode ? 'text-amber-400' : 'text-amber-800'}`}>
                                    {zone.kicker}
                                </p>
                                <h2 className="mb-3 md:mb-4 font-serif text-3xl leading-none tracking-tight">
                                    {zone.title}
                                </h2>
                                <p className={`mb-4 md:mb-5 text-sm leading-relaxed ${muted}`}>
                                    {zone.body}
                                </p>
                                <p className={`border-t pt-4 md:pt-5 text-xs leading-relaxed ${hairline} ${darkMode ? 'text-stone-500' : 'text-stone-500'}`}>
                                    {zone.detail}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            <section className="px-5 md:px-12 py-6 md:py-24">
                <div className="mx-auto max-w-[1680px]">
                    <div className="grid gap-7 md:gap-10 lg:grid-cols-[0.65fr_1.35fr]">
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
                                    className={`grid gap-3 md:gap-4 py-5 md:py-7 md:grid-cols-[90px_0.8fr_1.2fr] md:items-start ${hairline}`}
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

            <section className="px-5 md:px-12 pt-6 pb-8 md:py-24">
                <div className="mx-auto max-w-[1240px]">
                    <div className="mb-7 md:mb-10">
                        <p className={`mb-4 text-[10px] font-black uppercase tracking-[0.28em] ${darkMode ? 'text-amber-400' : 'text-amber-800'}`}>
                            Questions transport
                        </p>
                        <h2 className="font-serif text-4xl leading-tight tracking-tight md:text-6xl">
                            Livraison des meubles anciens.
                        </h2>
                    </div>
                    <div className={`divide-y border-y ${hairline}`}>
                        {DELIVERY_FAQ.map((item) => (
                            <div key={item.question} className="grid gap-3 py-5 md:py-6 md:grid-cols-[0.8fr_1.2fr] md:gap-10">
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
