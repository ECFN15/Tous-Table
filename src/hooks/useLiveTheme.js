import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db, appId } from '../firebase/config';
import { STANDARD_THEME, getThemeById } from '../theme/themeRegistry';

export const useLiveTheme = (darkMode) => {
    const [palette, setPalette] = useState(darkMode ? STANDARD_THEME.dark : STANDARD_THEME.light);
    const [isStandardMode, setIsStandardMode] = useState(true);
    const [currentThemeId, setCurrentThemeId] = useState(null);
    const [forcedMode, setForcedMode] = useState('auto');
    const [isThemeLoading, setIsThemeLoading] = useState(true);

    useEffect(() => {
        // Listen to global theme settings
        const unsub = onSnapshot(doc(db, 'sys_metadata', 'theme_settings'), (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                const standard = data.isStandardMode ?? true;
                const themeId = data.activeThemeId || 'chocolat';
                const forced = data.forcedMode || 'auto'; // 'auto', 'light', 'dark'

                setIsStandardMode(standard);
                setCurrentThemeId(themeId);
                setForcedMode(forced);

                // Determine effective Dark Mode
                let effectiveDarkMode = darkMode;
                if (forced === 'light') effectiveDarkMode = false;
                if (forced === 'dark') effectiveDarkMode = true;

                if (standard) {
                    setPalette(effectiveDarkMode ? STANDARD_THEME.dark : STANDARD_THEME.light);
                } else {
                    const themeObj = getThemeById(themeId);
                    setPalette(effectiveDarkMode ? themeObj.dark : themeObj.light);
                }
            } else {
                setIsStandardMode(true);
                setForcedMode('auto');
                setPalette(darkMode ? STANDARD_THEME.dark : STANDARD_THEME.light);
            }
            setIsThemeLoading(false);
        }, (err) => {
            console.error("Theme listener error:", err);
            setPalette(darkMode ? STANDARD_THEME.dark : STANDARD_THEME.light);
            setIsThemeLoading(false);
        });

        return () => unsub();
    }, [darkMode]); // NOTE: This effect runs when user toggles local dark mode. 
    // We should probably rely on a separate effect to sync forcedMode back to App? 
    // Or just let App handle the effective mode.

    // Actually, palette calculation here is for components using this hook.
    // If we want the WHOLE APP to switch, App.jsx must know about forcedMode.

    return { palette, isStandardMode, currentThemeId, isThemeLoading, forcedMode };
};
