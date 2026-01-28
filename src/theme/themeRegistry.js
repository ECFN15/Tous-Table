export const STANDARD_THEME = {
    id: 'standard',
    name: 'Mode Standard',
    description: 'Le design original. Authentique, simple et éprouvé.',
    light: {
        bgGradientTop: '#e0d0c1',
        bgGradientBot: '#8b5e3c', // From WarmAmbience
        textBody: '#1D1D1F',      // From GalleryView line 84
        textTitle: '#1a0f0a',     // From GalleryView line 107
        textSubtitle: '#FAF9F6',  // From GalleryView line 111
        titleBlendMode: 'multiply', // Special effect from line 107
        cardBg: '#FAF9F6',        // From GalleryView line 220
        cardShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)', // Tailwind shadow-xl approx
        switcherBg: 'rgba(255, 255, 255, 0.8)', // bg-white/80
        switcherBorder: 'rgba(0, 0, 0, 0.05)',  // border-black/5
        btnActiveBg: '#1a0f0a',   // line 123
        btnActiveText: '#ffffff',
        btnInactiveText: 'rgba(28, 25, 23, 0.4)', // stone-900/40
        viewSwitcherBg: '#ffffff', // line 129
        accent: '#1a0f0a',        // General accent
        statusValid: '#047857',   // Emerald 700
        firefly: '#d97706',       // From WarmAmbience
        dust: '#4a3728',          // From WarmAmbience
        foliage: '#3d2b1f',       // From WarmAmbience
        furniture: '#5D4037',     // From WarmAmbience
        particleColors: ['#3E2723', '#8D6E63', '#BCAAA4'], // Wenge, Noyer, Teck
        fogColor: '#fdf5e6',      // From WarmAmbience (0xfdf5e6)
        fogDensity: 0.015,
        isDark: false
    },
    dark: {
        bgGradientTop: '#0a0807', // From GalleryView line 84
        bgGradientBot: '#1f1814', // From WarmAmbience
        textBody: '#ffffff',
        textTitle: '#ffffff',
        textSubtitle: 'rgba(255, 255, 255, 0.75)',
        titleBlendMode: 'normal',
        cardBg: '#1C1C1E',        // From GalleryView
        cardShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', // shadow-2xl approx
        switcherBg: '#292524',    // stone-800
        switcherBorder: 'rgba(255, 255, 255, 0.05)',
        btnActiveBg: '#44403c',   // stone-700
        btnActiveText: '#ffffff',
        btnInactiveText: 'rgba(255, 255, 255, 0.4)',
        viewSwitcherBg: '#292524', // stone-800
        accent: '#fbbf24',        // Amber
        statusValid: '#34d399',
        firefly: '#fbbf24',       // From WarmAmbience
        dust: '#ffffff',
        foliage: '#022c22',
        furniture: '#ffffff',
        particleColors: ['#fbbf24', '#d97706', '#b45309'], // Gold variations
        fogColor: '#0a0807',
        fogDensity: 0.04,
        isDark: true
    }
};

export const THEMES = [
    {
        id: 'chocolat',
        name: 'Chocolat (Moderne)',
        description: 'L\'ambiance signature. Chaleureuse, artisanale, dégradé de teck et noyer.',
        previewColor: '#8b5e3c',
        light: {
            // ... (I will fill these with valid fallback values similar to Standard but customized)
            bgGradientTop: '#e0d0c1',
            bgGradientBot: '#8b5e3c',
            textBody: '#1D1D1F',
            textTitle: '#1a0f0a',
            textSubtitle: '#1a0f0a', // Difference: Dark subtitle
            titleBlendMode: 'normal',
            cardBg: '#ffffff',
            cardShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            switcherBg: 'rgba(255, 255, 255, 0.9)',
            switcherBorder: 'rgba(0,0,0,0.1)',
            btnActiveBg: '#8b5e3c',
            btnActiveText: '#ffffff',
            btnInactiveText: '#8b5e3c',
            viewSwitcherBg: '#ffffff',
            accent: '#8b5e3c',
            statusValid: '#059669',
            firefly: '#d97706',
            dust: '#4a3728',
            foliage: '#3d2b1f',
            furniture: '#5D4037',
            particleColors: ['#3E2723', '#8D6E63', '#BCAAA4'],
            fogColor: '#fdf5e6',
            fogDensity: 0.015,
            isDark: false
        },
        dark: STANDARD_THEME.dark // Fallback to standard dark for now or customize
    },
    {
        id: 'ocean',
        name: 'Océan & Sable',
        description: 'Fraîcheur marine. Dégradé de bleus profonds et de beige sable.',
        previewColor: '#0ea5e9',
        light: {
            bgGradientTop: '#e0f2fe', // Sky 100
            bgGradientBot: '#0284c7', // Sky 600
            textBody: '#0c4a6e',
            textTitle: '#0c4a6e',
            textSubtitle: '#0369a1',
            titleBlendMode: 'normal',
            cardBg: '#f0f9ff',
            cardShadow: '0 4px 6px -1px rgba(14, 165, 233, 0.2)',
            switcherBg: '#ffffff',
            switcherBorder: '#bae6fd',
            btnActiveBg: '#0ea5e9',
            btnActiveText: '#ffffff',
            btnInactiveText: '#0284c7',
            viewSwitcherBg: '#ffffff',
            accent: '#0ea5e9',
            statusValid: '#10b981',
            firefly: '#bae6fd',
            dust: '#0ea5e9',
            foliage: '#075985',
            furniture: '#0369a1',
            particleColors: ['#e0f2fe', '#7dd3fc', '#0284c7'],
            fogColor: '#f0f9ff',
            fogDensity: 0.02,
            isDark: false
        },
        dark: {
            bgGradientTop: '#0f172a',
            bgGradientBot: '#1e3a8a',
            textBody: '#e0f2fe',
            textTitle: '#e0f2fe',
            textSubtitle: '#bae6fd',
            titleBlendMode: 'normal',
            cardBg: '#172554',
            cardShadow: '0 4px 6px -1px rgba(0,0,0,0.3)',
            switcherBg: '#1e293b',
            switcherBorder: '#334155',
            btnActiveBg: '#38bdf8',
            btnActiveText: '#0f172a',
            btnInactiveText: '#94a3b8',
            viewSwitcherBg: '#1e293b',
            accent: '#38bdf8',
            statusValid: '#34d399',
            firefly: '#7dd3fc',
            dust: '#bae6fd',
            foliage: '#0f172a',
            furniture: '#1e40af',
            particleColors: ['#1e293b', '#334155', '#475569'],
            fogColor: '#0f172a',
            fogDensity: 0.045,
            isDark: true
        }
    },
    // We can add Forest and Minimalist later or now. Let's add placeholders.
    {
        id: 'forest',
        name: 'Forêt Sombre',
        description: 'Mystérieux et élégant. Verts profonds.',
        previewColor: '#14532d',
        light: STANDARD_THEME.light, // Placeholder
        dark: STANDARD_THEME.dark
    },
    {
        id: 'minimalist',
        name: 'Minimaliste & Épuré',
        description: 'Le luxe discret. Niveaux de gris.',
        previewColor: '#e5e5e5',
        light: STANDARD_THEME.light, // Placeholder
        dark: STANDARD_THEME.dark
    }
];

export const getThemeById = (id) => {
    return THEMES.find(t => t.id === id) || THEMES[0];
};
