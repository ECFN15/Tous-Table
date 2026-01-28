import React, { useState, useEffect } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { THEMES } from '../../theme/themeRegistry';
import { useLiveTheme } from '../../hooks/useLiveTheme';
import { Check, Palette, RotateCcw } from 'lucide-react';

const AdminStudio = ({ darkMode }) => {
    const { isStandardMode, currentThemeId } = useLiveTheme(darkMode);

    // We keep local state for immediate UI feedback (optimistic UI), 
    // but the source of truth is the hook/Firestore.
    const [activeStandard, setActiveStandard] = useState(isStandardMode);
    const [activeThemeIdLocal, setActiveThemeIdLocal] = useState(currentThemeId);

    // Sync local state when remote state changes
    useEffect(() => {
        setActiveStandard(isStandardMode);
        setActiveThemeIdLocal(currentThemeId);
    }, [isStandardMode, currentThemeId]);

    const saveSettings = async (standard, themeId) => {
        try {
            await setDoc(doc(db, 'sys_metadata', 'theme_settings'), {
                isStandardMode: standard,
                activeThemeId: themeId,
                updatedAt: Date.now()
            }, { merge: true });
        } catch (err) {
            console.error("Failed to save theme settings:", err);
            alert("Erreur lors de la sauvegarde du thème.");
        }
    };

    const handleToggleStandard = (val) => {
        setActiveStandard(val);
        saveSettings(val, activeThemeIdLocal);
    };

    const handleSelectTheme = (themeId) => {
        setActiveThemeIdLocal(themeId);
        setActiveStandard(false); // Selecting a theme automatically disables Standard Mode
        saveSettings(false, themeId);
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

                {/* MODE STANDARD TOGGLE */}
                <div className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${activeStandard ? (darkMode ? 'bg-emerald-900/20 border-emerald-800/50' : 'bg-emerald-50 border-emerald-100') : (darkMode ? 'bg-stone-900/50 border-stone-800' : 'bg-stone-50 border-stone-100')}`}>
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center border ${activeStandard ? (darkMode ? 'bg-emerald-500 text-white' : 'bg-emerald-500 text-white') : (darkMode ? 'bg-stone-800 border-stone-700 text-stone-600' : 'bg-white border-stone-200 text-stone-300')}`}>
                            <RotateCcw size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg leading-tight">Mode Standard</h3>
                            <p className="text-xs opacity-70">Désactive les thèmes et restaure le design original (codé en dur).</p>
                        </div>
                    </div>

                    <button
                        onClick={() => handleToggleStandard(!activeStandard)}
                        className={`relative w-14 h-8 rounded-full transition-colors duration-300 ${activeStandard ? 'bg-emerald-500' : (darkMode ? 'bg-stone-700' : 'bg-stone-300')}`}
                    >
                        <div className={`absolute top-1 left-1 bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${activeStandard ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </button>
                </div>
            </div>

            {/* THEMES GRID */}
            <div className={`grid md:grid-cols-2 gap-4 ${activeStandard ? 'opacity-50 pointer-events-none grayscale' : 'opacity-100'}`}>
                {THEMES.map(theme => (
                    <button
                        key={theme.id}
                        onClick={() => handleSelectTheme(theme.id)}
                        className={`group relative p-4 md:p-6 rounded-3xl border-2 text-left transition-all hover:scale-[1.02] ${activeThemeIdLocal === theme.id && !activeStandard ? (darkMode ? 'border-amber-500 bg-stone-800' : 'border-amber-400 bg-white shadow-xl shadow-amber-100') : (darkMode ? 'border-stone-800 bg-stone-900 hover:border-stone-600' : 'border-stone-100 bg-white hover:border-stone-200 shadow-sm')}`}
                    >
                        {activeThemeIdLocal === theme.id && !activeStandard && (
                            <div className="absolute top-4 right-4 bg-amber-500 text-white text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-widest flex items-center gap-1">
                                <Check size={10} strokeWidth={4} /> Actif
                            </div>
                        )}

                        <div className="flex gap-4">
                            {/* Color Preview Block */}
                            <div className="w-20 h-20 rounded-2xl shadow-inner shrink-0" style={{ backgroundColor: theme.previewColor }}>
                                <div className="w-full h-full bg-gradient-to-br from-white/20 to-black/10"></div>
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
                    </button>
                ))}
            </div>
        </div>
    );
};

export default AdminStudio;
