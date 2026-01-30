import React, { useState, useEffect } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { THEMES } from '../../theme/themeRegistry';
import { useLiveTheme } from '../../hooks/useLiveTheme';
import { Check, Palette, RotateCcw, Sun, Moon, Smartphone } from 'lucide-react';

const AdminStudio = ({ darkMode }) => {
    const { isStandardMode, currentThemeId, forcedMode } = useLiveTheme(darkMode);

    const [activeStandard, setActiveStandard] = useState(isStandardMode);
    const [activeThemeIdLocal, setActiveThemeIdLocal] = useState(currentThemeId);
    const [activeForcedMode, setActiveForcedMode] = useState(forcedMode);

    useEffect(() => {
        setActiveStandard(isStandardMode);
        setActiveThemeIdLocal(currentThemeId);
        setActiveForcedMode(forcedMode);
    }, [isStandardMode, currentThemeId, forcedMode]);

    const saveSettings = async (standard, themeId, mode = 'auto') => {
        try {
            await setDoc(doc(db, 'sys_metadata', 'theme_settings'), {
                isStandardMode: standard,
                activeThemeId: themeId,
                forcedMode: mode,
                updatedAt: Date.now()
            }, { merge: true });
        } catch (err) {
            console.error("Failed to save theme settings:", err);
            alert("Erreur lors de la sauvegarde.");
        }
    };

    const handleToggleStandard = (val) => {
        setActiveStandard(val);
        // Reset forced mode to auto when toggling standard, or keep previous?
        // User request focused on custom themes. Let's keep it simple.
        saveSettings(val, activeThemeIdLocal, 'auto');
    };

    const handleSelectTheme = (themeId) => {
        setActiveThemeIdLocal(themeId);
        setActiveStandard(false);
        // Default to auto when switching themes, or keep current forced mode?
        // Safe to reset to auto to avoid confusion.
        setActiveForcedMode('auto');
        saveSettings(false, themeId, 'auto');
    };

    const handleForceMode = (e, themeId, mode) => {
        e.stopPropagation(); // Prevent card click
        setActiveThemeIdLocal(themeId);
        setActiveStandard(false);
        setActiveForcedMode(mode);
        saveSettings(false, themeId, mode);
    };

    return (
        <div className={`space-y-8 animate-in fade-in ${darkMode ? 'text-white' : 'text-stone-900'}`}>
            <div className={`p-6 md:p-8 rounded-3xl border shadow-sm ${darkMode ? 'bg-stone-800 border-stone-700' : 'bg-white border-stone-200'}`}>
                <div className="flex items-center gap-4 mb-6">
                    <div className={`p-3 rounded-xl ${darkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                        <Palette size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black tracking-tight">Studio Design</h2>
                        <p className={`text-sm ${darkMode ? 'text-stone-400' : 'text-stone-500'}`}>Personnalisez l'ambiance de la Marketplace.</p>
                    </div>
                </div>

            </div>
            {/* THEMES GRID */}
            <div className={`grid md:grid-cols-2 gap-4`}>
                {/* STANDARD THEME CARD */}
                <div
                    onClick={() => handleToggleStandard(true)}
                    className={`group relative p-4 md:p-6 rounded-3xl ring-2 ring-inset text-left transition-all hover:scale-[1.02] cursor-pointer transform-gpu backface-hidden will-change-transform ${activeStandard ? (darkMode ? 'ring-emerald-500 bg-stone-800' : 'ring-emerald-500 bg-white shadow-xl shadow-emerald-50') : (darkMode ? 'ring-stone-800 bg-stone-900 hover:ring-stone-600' : 'ring-stone-100 bg-white hover:ring-stone-200 shadow-sm')}`}
                >
                    {activeStandard && (
                        <div className="absolute top-4 right-4 bg-emerald-500 text-white text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-widest flex items-center gap-1">
                            <Check size={10} strokeWidth={4} /> Actif
                        </div>
                    )}

                    <div className="flex gap-4">
                        <div className={`w-20 h-20 rounded-2xl shadow-sm shrink-0 flex items-center justify-center ${darkMode ? 'bg-stone-700' : 'bg-stone-100'}`}>
                            <RotateCcw size={32} className={darkMode ? 'text-stone-500' : 'text-stone-400'} />
                        </div>

                        <div>
                            <h3 className="font-bold text-lg mb-1">Mode Standard</h3>
                            <p className={`text-xs leading-relaxed ${darkMode ? 'text-stone-400' : 'text-stone-500'}`}>
                                Le design original. Authentique, simple et éprouvé.
                            </p>
                        </div>
                    </div>

                    {/* Standard Force Mode Controls */}
                    <div className={`mt-6 flex items-center justify-between gap-2 p-1 rounded-xl transition-all duration-300 ${activeStandard ? 'opacity-100' : 'opacity-40 group-hover:opacity-100'} ${darkMode ? 'bg-stone-950/50' : 'bg-stone-100'}`}>
                        <button
                            onClick={(e) => { e.stopPropagation(); setActiveForcedMode('light'); saveSettings(true, activeThemeIdLocal, 'light'); }}
                            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-wider transition-all ${activeStandard && activeForcedMode === 'light' ? 'bg-white text-stone-900 shadow-md' : 'text-stone-400 hover:text-stone-600'}`}
                        >
                            <Sun size={14} /> Light
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); setActiveForcedMode('auto'); saveSettings(true, activeThemeIdLocal, 'auto'); }}
                            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-wider transition-all ${activeStandard && activeForcedMode === 'auto' ? (darkMode ? 'bg-stone-700 text-white shadow-md' : 'bg-white text-stone-900 shadow-md') : 'text-stone-400 hover:text-stone-600'}`}
                        >
                            <Smartphone size={14} /> Auto
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); setActiveForcedMode('dark'); saveSettings(true, activeThemeIdLocal, 'dark'); }}
                            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-wider transition-all ${activeStandard && activeForcedMode === 'dark' ? 'bg-stone-800 text-white shadow-md' : 'text-stone-400 hover:text-stone-600'}`}
                        >
                            <Moon size={14} /> Dark
                        </button>
                    </div>
                </div>

                {THEMES.map(theme => (
                    <div
                        key={theme.id}
                        onClick={() => handleSelectTheme(theme.id)}
                        className={`group relative p-4 md:p-6 rounded-3xl ring-2 ring-inset text-left transition-all hover:scale-[1.02] cursor-pointer transform-gpu backface-hidden will-change-transform ${activeThemeIdLocal === theme.id && !activeStandard ? (darkMode ? 'ring-amber-500 bg-stone-800' : 'ring-amber-400 bg-white shadow-xl shadow-amber-100') : (darkMode ? 'ring-stone-800 bg-stone-900 hover:ring-stone-600' : 'ring-stone-100 bg-white hover:ring-stone-200 shadow-sm')}`}
                    >
                        {activeThemeIdLocal === theme.id && !activeStandard && (
                            <div className="absolute top-4 right-4 bg-amber-500 text-white text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-widest flex items-center gap-1">
                                <Check size={10} strokeWidth={4} /> Actif
                            </div>
                        )}

                        <div className="flex gap-4">
                            {/* Color Preview Block */}
                            <div className="w-20 h-20 rounded-2xl shadow-sm shrink-0" style={{ backgroundColor: theme.previewColor }}>
                                {/* Clean preview without overlays */}
                            </div>

                            <div>
                                <h3 className="font-bold text-lg mb-1">{theme.name}</h3>
                                <p className={`text-xs leading-relaxed ${darkMode ? 'text-stone-400' : 'text-stone-500'}`}>
                                    {theme.description}
                                </p>
                                {/* Mini Palette */}
                                <div className="flex gap-2 mt-3">
                                    <div className="w-4 h-4 rounded-full border border-white/10" style={{ backgroundColor: theme.light.bgGradientBot }}></div>
                                    <div className="w-4 h-4 rounded-full border border-white/10" style={{ backgroundColor: theme.light.accent }}></div>
                                    <div className="w-4 h-4 rounded-full border border-white/10" style={{ backgroundColor: theme.light.textTitle }}></div>
                                </div>
                            </div>
                        </div>
                        {/* Force Mode Controls */}
                        <div className={`mt-6 flex items-center justify-between gap-2 p-1 rounded-xl transition-all duration-300 ${activeThemeIdLocal === theme.id && !activeStandard ? 'opacity-100' : 'opacity-40 group-hover:opacity-100'} ${darkMode ? 'bg-stone-950/50' : 'bg-stone-100'}`}>
                            <button
                                onClick={(e) => handleForceMode(e, theme.id, 'light')}
                                className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-wider transition-all ${activeThemeIdLocal === theme.id && !activeStandard && activeForcedMode === 'light' ? 'bg-white text-stone-900 shadow-md' : 'text-stone-400 hover:text-stone-600'}`}
                            >
                                <Sun size={14} /> Light
                            </button>
                            <button
                                onClick={(e) => handleForceMode(e, theme.id, 'auto')}
                                className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-wider transition-all ${activeThemeIdLocal === theme.id && !activeStandard && activeForcedMode === 'auto' ? (darkMode ? 'bg-stone-700 text-white shadow-md' : 'bg-white text-stone-900 shadow-md') : 'text-stone-400 hover:text-stone-600'}`}
                            >
                                <Smartphone size={14} /> Auto
                            </button>
                            <button
                                onClick={(e) => handleForceMode(e, theme.id, 'dark')}
                                className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-wider transition-all ${activeThemeIdLocal === theme.id && !activeStandard && activeForcedMode === 'dark' ? 'bg-stone-800 text-white shadow-md' : 'text-stone-400 hover:text-stone-600'}`}
                            >
                                <Moon size={14} /> Dark
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminStudio;
