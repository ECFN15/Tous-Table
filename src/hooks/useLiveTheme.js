import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db, appId } from '../firebase/config';
import { STANDARD_THEME, getThemeById } from '../theme/themeRegistry';

export const useLiveTheme = (darkMode) => {
    const [palette, setPalette] = useState(darkMode ? STANDARD_THEME.dark : STANDARD_THEME.light);
    const [isStandardMode, setIsStandardMode] = useState(true);
    const [currentThemeId, setCurrentThemeId] = useState(null);
    const [isThemeLoading, setIsThemeLoading] = useState(true);

    useEffect(() => {
        // Listen to global theme settings
        const unsub = onSnapshot(doc(db, 'sys_metadata', 'theme_settings'), (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                const standard = data.isStandardMode ?? true; // Default to true if missing
                const themeId = data.activeThemeId || 'chocolat';

                setIsStandardMode(standard);
                setCurrentThemeId(themeId);

                if (standard) {
                    setPalette(darkMode ? STANDARD_THEME.dark : STANDARD_THEME.light);
                } else {
                    const themeObj = getThemeById(themeId);
                    setPalette(darkMode ? themeObj.dark : themeObj.light);
                }
            } else {
                // No settings found, default to Standard
                setIsStandardMode(true);
                setPalette(darkMode ? STANDARD_THEME.dark : STANDARD_THEME.light);
            }
            setIsThemeLoading(false);
        }, (err) => {
            console.error("Theme listener error:", err);
            // Fallback
            setPalette(darkMode ? STANDARD_THEME.dark : STANDARD_THEME.light);
            setIsThemeLoading(false);
        });

        return () => unsub();
    }, [darkMode]);

    return { palette, isStandardMode, currentThemeId, isThemeLoading };
};
