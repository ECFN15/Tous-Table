export const STANDARD_THEME = {
    id: 'standard',
    name: 'Mode Standard (Défaut)',
    description: 'Le design original. Authentique, simple et éprouvé.',
    light: {
        bgGradientTop: '#e0d0c1',
        bgGradientBot: '#8b5e3c',
        textBody: '#1D1D1F',
        textTitle: '#1a0f0a',
        textSubtitle: '#FAF9F6',
        titleBlendMode: 'multiply',
        cardBg: '#FAF9F6',
        cardShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        // NO BORDER IN STANDARD
        switcherBg: 'rgba(255, 255, 255, 0.8)',
        switcherBorder: 'rgba(0, 0, 0, 0.05)',
        btnActiveBg: '#1a0f0a',
        btnActiveText: '#ffffff',
        btnInactiveText: 'rgba(28, 25, 23, 0.4)',
        viewSwitcherBg: '#ffffff',
        accent: '#1a0f0a',
        statusValid: '#047857',
        firefly: '#d97706',
        dust: '#4a3728',
        foliage: '#3d2b1f',
        furniture: '#5D4037',
        particleColors: ['#3E2723', '#8D6E63', '#BCAAA4'],
        fogColor: '#fdf5e6',
        fogDensity: 0.015,
        isDark: false
    },
    dark: {
        bgGradientTop: '#0a0807',
        bgGradientBot: '#1f1814',
        textBody: '#ffffff',
        textTitle: '#ffffff',
        textSubtitle: 'rgba(255, 255, 255, 0.75)',
        titleBlendMode: 'normal',
        cardBg: '#1C1C1E',
        cardShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        // NO BORDER IN STANDARD
        switcherBg: '#292524',
        switcherBorder: 'rgba(255, 255, 255, 0.05)',
        btnActiveBg: '#44403c',
        btnActiveText: '#ffffff',
        btnInactiveText: 'rgba(255, 255, 255, 0.4)',
        viewSwitcherBg: '#292524',
        accent: '#fbbf24',
        statusValid: '#34d399',
        firefly: '#fbbf24',
        dust: '#ffffff',
        foliage: '#022c22',
        furniture: '#ffffff',
        particleColors: ['#fbbf24', '#d97706', '#b45309'],
        fogColor: '#0a0807',
        fogDensity: 0.04,
        isDark: true
    }
};

export const THEMES = [
    {
        id: 'ocean',
        name: 'Océan & Sable',
        // ... (rest of ocean theme is implicit, I'm just replacing the start of the array)
        description: 'Atmosphère marine premium. Glassmorphism, dégradés bleus profonds et bulles de lumière.',
        previewColor: '#0ea5e9',
        light: {
            bgGradientTop: '#E0F7FA', // Cyan Very Light
            bgGradientBot: '#0288D1', // Deep Sky Blue
            textBody: '#01579B', // Deepest Blue
            textTitle: '#01579B',
            textSubtitle: '#0288D1',
            titleBlendMode: 'normal',
            cardBg: 'rgba(255, 255, 255, 0.45)', // GLASS EFFECT
            cardShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)', // Soft Blue Shadow
            // Glass Border REMOVED
            switcherBg: 'rgba(255, 255, 255, 0.5)',
            switcherBorder: '#B3E5FC',
            btnActiveBg: '#0288D1',
            btnActiveText: '#ffffff',
            btnInactiveText: '#01579B',
            viewSwitcherBg: 'rgba(255, 255, 255, 0.6)',
            accent: '#00BCD4', // Cyan Accent
            statusValid: '#009688', // Teal
            firefly: '#E1F5FE', // White/Blue Bubbles
            dust: '#0288D1',
            foliage: '#01579B',
            furniture: '#0277BD',
            particleColors: ['#E0F7FA', '#81D4FA', '#29B6F6'], // Water tones
            fogColor: '#E1F5FE',
            fogDensity: 0.02,
            isDark: false
        },
        dark: {
            bgGradientTop: '#001e2b', // Abyss
            bgGradientBot: '#006064', // Cyan Deep
            textBody: '#E0F7FA',
            textTitle: '#E0F7FA',
            textSubtitle: '#80DEEA',
            titleBlendMode: 'screen',
            cardBg: 'rgba(0, 0, 0, 0.3)', // Dark Glass
            cardShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
            // Cyan Glow Border REMOVED
            switcherBg: 'rgba(0, 0, 0, 0.4)',
            switcherBorder: 'rgba(128, 222, 234, 0.1)',
            btnActiveBg: '#00BCD4',
            btnActiveText: '#000000',
            btnInactiveText: 'rgba(224, 247, 250, 0.5)',
            viewSwitcherBg: 'rgba(0, 0, 0, 0.4)',
            accent: '#26C6DA',
            statusValid: '#4DB6AC',
            firefly: '#00BCD4', // Neon Cyan Fireflies
            dust: '#80DEEA',
            foliage: '#004D40',
            furniture: '#00838F',
            particleColors: ['#006064', '#0097A7', '#00BCD4'],
            fogColor: '#001e2b',
            fogDensity: 0.045,
            isDark: true
        }
    },
    {
        id: 'forest',
        name: 'Forêt Enchantée',
        description: 'Immersion sylvestre. Verts profonds, bois sombre et lucioles magiques.',
        previewColor: '#14532d',
        light: {
            bgGradientTop: '#DCFCE7', // Pale Green
            bgGradientBot: '#166534', // Green 700
            textBody: '#064E3B',
            textTitle: '#064E3B',
            textSubtitle: '#15803D',
            titleBlendMode: 'multiply',
            cardBg: 'rgba(255, 255, 255, 0.7)',
            cardShadow: '0 10px 15px -3px rgba(22, 101, 52, 0.1)',
            // Light Green Border REMOVED
            switcherBg: '#F0FDF4',
            switcherBorder: '#BBF7D0',
            btnActiveBg: '#15803D',
            btnActiveText: '#ffffff',
            btnInactiveText: '#166534',
            viewSwitcherBg: '#ffffff',
            accent: '#65A30D', // Lime
            statusValid: '#15803D',
            firefly: '#84CC16', // Lime Fireflies
            dust: '#3F6212',
            foliage: '#14532D',
            furniture: '#3F6212',
            particleColors: ['#365314', '#14532D', '#166534'], // Forest Greens
            fogColor: '#DCFCE7',
            fogDensity: 0.025,
            isDark: false
        },
        dark: {
            bgGradientTop: '#022c22', // Deepest Jungle
            bgGradientBot: '#14532d', // Deep Green
            textBody: '#ECFCCB', // Lime 100
            textTitle: '#ECFCCB',
            textSubtitle: '#bef264', // Lime 300
            titleBlendMode: 'normal',
            cardBg: 'rgba(2, 44, 34, 0.6)', // Deep Green Glass
            cardShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
            // Lime Glow REMOVED
            switcherBg: '#064E3B',
            switcherBorder: '#14532D',
            btnActiveBg: '#65A30D',
            btnActiveText: '#ffffff',
            btnInactiveText: '#86EFAC',
            viewSwitcherBg: '#064E3B',
            accent: '#84CC16',
            statusValid: '#22c55e',
            firefly: '#a3e635', // Bright Lime
            dust: '#d9f99d',
            foliage: '#022c22',
            furniture: '#365314',
            particleColors: ['#a3e635', '#bef264', '#d9f99d'], // Fireflies particles
            fogColor: '#022c22',
            fogDensity: 0.05,
            isDark: true
        }
    },
    {
        id: 'minimalist',
        name: 'Luxe Monochrome',
        description: 'Élégance pure. Noir et blanc, contraste fort, sans distraction.',
        previewColor: '#000000',
        light: {
            bgGradientTop: '#FFFFFF',
            bgGradientBot: '#E5E5E5', // Very Light Gray
            textBody: '#000000',
            textTitle: '#000000',
            textSubtitle: '#525252',
            titleBlendMode: 'normal',
            cardBg: '#FFFFFF',
            cardShadow: 'none', // Flat
            // Hard Black Border REMOVED
            switcherBg: '#FFFFFF',
            switcherBorder: '#000000',
            btnActiveBg: '#000000',
            btnActiveText: '#FFFFFF',
            btnInactiveText: '#A3A3A3',
            viewSwitcherBg: '#FFFFFF',
            accent: '#000000',
            statusValid: '#000000',
            firefly: '#000000', // Black particles
            dust: '#525252',
            foliage: '#D4D4D4',
            furniture: '#404040',
            particleColors: ['#000000', '#262626', '#404040'],
            fogColor: '#FFFFFF',
            fogDensity: 0.005, // Very clear
            isDark: false
        },
        dark: {
            bgGradientTop: '#000000',
            bgGradientBot: '#171717',
            textBody: '#FFFFFF',
            textTitle: '#FFFFFF',
            textSubtitle: '#A3A3A3',
            titleBlendMode: 'normal',
            cardBg: '#000000',
            cardShadow: 'none',
            // Hard White Border REMOVED
            switcherBg: '#000000',
            switcherBorder: '#FFFFFF',
            btnActiveBg: '#FFFFFF',
            btnActiveText: '#000000',
            btnInactiveText: '#525252',
            viewSwitcherBg: '#000000',
            accent: '#FFFFFF',
            statusValid: '#FFFFFF',
            firefly: '#FFFFFF',
            dust: '#A3A3A3',
            foliage: '#262626',
            furniture: '#525252',
            particleColors: ['#FFFFFF', '#E5E5E5', '#D4D4D4'],
            fogColor: '#000000',
            fogDensity: 0.02,
            isDark: true
        }
    },
    {
        id: 'chocolat', // Re-defining Chocolat as a distinct Modern option
        name: 'Chocolat Intense',
        description: 'Une version plus moderne et contrastée de l\'atelier.',
        previewColor: '#5D4037',
        light: {
            bgGradientTop: '#efebe9', // Brown 50
            bgGradientBot: '#a1887f', // Brown 300
            textBody: '#3e2723', // Brown 900
            textTitle: '#3e2723',
            textSubtitle: '#5d4037',
            titleBlendMode: 'normal',
            cardBg: 'rgba(255, 255, 255, 0.8)', // Semi-transparent
            cardShadow: '0 10px 15px -3px rgba(62, 39, 35, 0.1)',
            // transparent REMOVED
            switcherBg: '#d7ccc8',
            switcherBorder: '#bcaaa4',
            btnActiveBg: '#5d4037',
            btnActiveText: '#ffffff',
            btnInactiveText: '#8d6e63',
            viewSwitcherBg: '#ffffff',
            accent: '#8d6e63',
            statusValid: '#2e7d32',
            firefly: '#ff6f00', // Amber 900
            dust: '#5d4037',
            foliage: '#4e342e',
            furniture: '#3e2723',
            particleColors: ['#3e2723', '#4e342e', '#5d4037'],
            fogColor: '#efebe9',
            fogDensity: 0.02,
            isDark: false
        },
        dark: {
            bgGradientTop: '#1a100b', // Very Dark Brown (almost black)
            bgGradientBot: '#3e2723', // Dark Brown
            textBody: '#d7ccc8', // Brown 100
            textTitle: '#d7ccc8',
            textSubtitle: '#a1887f',
            titleBlendMode: 'normal',
            cardBg: 'rgba(40, 25, 20, 0.7)',
            cardShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
            // rgba(161, 136, 127, 0.1) REMOVED
            switcherBg: '#281a14',
            switcherBorder: '#4e342e',
            btnActiveBg: '#8d6e63',
            btnActiveText: '#ffffff',
            btnInactiveText: '#5d4037',
            viewSwitcherBg: '#281a14',
            accent: '#ffb74d', // Orange 300
            statusValid: '#66bb6a',
            firefly: '#ffca28', // Amber 400
            dust: '#d7ccc8',
            foliage: '#1a100b',
            furniture: '#a1887f',
            particleColors: ['#ffca28', '#ffb74d', '#ffa726'],
            fogColor: '#1a100b',
            fogDensity: 0.05,
            isDark: true
        }
    }
];

export const getThemeById = (id) => {
    if (id === 'standard') return STANDARD_THEME;
    return THEMES.find(t => t.id === id) || THEMES[0];
};
