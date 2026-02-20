import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * useLiveTheme - Simplified Version
 * Forces the 'architectural' design as the primary and only frontend.
 * Still listens to Firestore for 'forcedMode' (Light/Dark/Auto) to respect Admin settings.
 */
export const useLiveTheme = (darkMode) => {
    const [forcedMode, setForcedMode] = useState(() => {
        try {
            const cached = localStorage.getItem('themeSettings');
            if (cached) return JSON.parse(cached).forcedMode;
        } catch (e) { }
        return 'light';
    });

    const [isThemeLoading, setIsThemeLoading] = useState(true);
    const activeDesignId = 'architectural'; // HARDCODED DEFAULT

    useEffect(() => {
        // Listen to global theme settings for Dark Mode forcing
        const unsub = onSnapshot(doc(db, 'sys_metadata', 'theme_settings'), (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                localStorage.setItem('themeSettings', JSON.stringify({ ...data, activeDesignId: 'architectural' }));
                setForcedMode(data.forcedMode || 'light');
            }
            setIsThemeLoading(false);
        }, (err) => {
            console.error("Theme listener error:", err);
            setIsThemeLoading(false);
        });

        return () => unsub();
    }, []);

    // Palette is handled by architectural internal CSS/Tailwind usually, 
    // but some components might still expect it if they weren't fully migrated.
    // For Architectural, we usually rely on native colors, but let's return a hollow object or legacy support if needed.
    const palette = {};

    return {
        palette,
        isStandardMode: false,
        currentThemeId: 'architectural',
        isThemeLoading,
        forcedMode,
        activeDesignId
    };
};

