import React, { useState, useEffect } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { THEMES } from '../../theme/themeRegistry';
import { useLiveTheme } from '../../hooks/useLiveTheme';
import { Check, Palette, RotateCcw, Sun, Moon, Smartphone, Layout, Sparkles, Box, ArrowRight } from 'lucide-react';

const AdminStudio = ({ darkMode }) => {
    // État global (Firestore)
    const { isStandardMode, currentThemeId, forcedMode, activeDesignId } = useLiveTheme(darkMode);

    // État local pour l'UI instantanée (Tabulation)
    // Si le design actif est 'standard', on est sur l'onglet 'atelier'. Sinon sur 'collection'.
    const [activeTab, setActiveTab] = useState(activeDesignId === 'standard' ? 'atelier' : 'collection');

    const [activeStandard, setActiveStandard] = useState(isStandardMode);
    const [activeThemeIdLocal, setActiveThemeIdLocal] = useState(currentThemeId);
    const [activeForcedMode, setActiveForcedMode] = useState(forcedMode);

    // Sync avec Firestore
    useEffect(() => {
        setActiveStandard(isStandardMode);
        setActiveThemeIdLocal(currentThemeId);
        setActiveForcedMode(forcedMode);

        // Si ça change depuis ailleurs, on met à jour l'onglet
        // Sauf si l'utilisateur navigue manuellement (on pourrait le laisser explorer)
        // Mais pour la cohérence :
        if (activeDesignId === 'standard') setActiveTab('atelier');
        else setActiveTab('collection');

    }, [isStandardMode, currentThemeId, forcedMode, activeDesignId]);

    const saveSettings = async (standard, themeId, mode, designId) => {
        try {
            await setDoc(doc(db, 'sys_metadata', 'theme_settings'), {
                isStandardMode: standard,
                activeThemeId: themeId,
                forcedMode: mode,
                activeDesignId: designId,
                updatedAt: Date.now()
            }, { merge: true });
        } catch (err) {
            console.error("Failed to save theme settings:", err);
            alert("Erreur lors de la sauvegarde.");
        }
    };

    // --- ACTIONS ---

    // 1. Activer le mode "ATELIER STANDARD"
    // Cela réactive le design 'standard' et garde le thème couleur actuel (ou par défaut)
    const activateAtelierMode = () => {
        setActiveTab('atelier');
        if (activeDesignId !== 'standard') {
            saveSettings(activeStandard, activeThemeIdLocal, activeForcedMode, 'standard');
        }
    };

    // 2. Activer un Design de la COLLECTION (ex: Architectural)
    // Cela désactive le standard mode au profit du nouveau design
    const activateCollectionDesign = (designId) => {
        setActiveTab('collection');
        saveSettings(activeStandard, activeThemeIdLocal, activeForcedMode, designId);
    };


    // --- HELPERS (Legacy Atelier Logic) ---

    const handleToggleStandard = (val) => {
        setActiveStandard(val);
        // Si on touche aux réglages Atelier, on force le design 'standard'
        saveSettings(val, activeThemeIdLocal, 'auto', 'standard');
    };

    const handleSelectTheme = (themeId) => {
        setActiveThemeIdLocal(themeId);
        setActiveStandard(false);
        setActiveForcedMode('auto');
        // Si on choisit un thème couleur, on force le design 'standard' car ils sont liés
        saveSettings(false, themeId, 'auto', 'standard');
    };

    const handleForceMode = (e, themeId, mode) => {
        e.stopPropagation();
        setActiveThemeIdLocal(themeId);
        setActiveStandard(false);
        setActiveForcedMode(mode);
        saveSettings(false, themeId, mode, 'standard');
    };

    const handleForceModeCollection = (e, designId, mode) => {
        e.stopPropagation();
        setActiveForcedMode(mode);
        saveSettings(activeStandard, activeThemeIdLocal, mode, designId);
    };

    return (
        <div className={`space-y-8 animate-in fade-in ${darkMode ? 'text-white' : 'text-stone-900'}`}>

            {/* EN-TÊTE & NAVIGATION PRINCIPALE */}
            <div className={`p-2 rounded-[2.5rem] border shadow-sm flex items-center p-2 gap-2 ${darkMode ? 'bg-stone-900 border-stone-800' : 'bg-white border-stone-200'}`}>

                {/* TAB 1: L'ATELIER (Standard) */}
                <button
                    onClick={activateAtelierMode}
                    className={`flex-1 py-4 md:py-6 rounded-[2rem] flex flex-col items-center justify-center gap-2 transition-all duration-300 relative overflow-hidden group ${activeTab === 'atelier' ? (darkMode ? 'bg-stone-800 text-white shadow-md' : 'bg-stone-100 text-stone-900 shadow-inner') : 'text-stone-400 hover:text-stone-600 hover:bg-stone-50/50'}`}
                >
                    <div className="flex items-center gap-3 relative z-10">
                        <Box size={20} strokeWidth={2.5} />
                        <span className="text-lg font-black tracking-tight uppercase">L'Atelier</span>
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 relative z-10">Design Historique & Couleurs</p>

                    {/* Active Indicator */}
                    {activeDesignId === 'standard' && (
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-emerald-500 mx-12 rounded-t-full shadow-[0_-4px_12px_rgba(16,185,129,0.5)]"></div>
                    )}
                </button>

                {/* TAB 2: DESIGN LAB (Nouveautés) */}
                <button
                    onClick={() => setActiveTab('collection')}
                    className={`flex-1 py-4 md:py-6 rounded-[2rem] flex flex-col items-center justify-center gap-2 transition-all duration-300 relative overflow-hidden group ${activeTab === 'collection' ? (darkMode ? 'bg-stone-800 text-white shadow-md' : 'bg-stone-100 text-stone-900 shadow-inner') : 'text-stone-400 hover:text-stone-600 hover:bg-stone-50/50'}`}
                >
                    <div className="flex items-center gap-3 relative z-10">
                        <Sparkles size={20} strokeWidth={2.5} />
                        <span className="text-lg font-black tracking-tight uppercase">Showroom 2026</span>
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 relative z-10">Nouvelles Ambiances & Concepts</p>

                    {/* Active Indicator */}
                    {activeDesignId !== 'standard' && (
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-indigo-500 mx-12 rounded-t-full shadow-[0_-4px_12px_rgba(99,102,241,0.5)]"></div>
                    )}
                </button>
            </div>

            {/* CONTENU : VISIBLE SELON TAB */}
            <div className="min-h-[600px]">

                {/* --- CONTENU TAB: ATELIER (Legacy) --- */}
                {activeTab === 'atelier' && (
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 space-y-8">
                        <div className="px-4">
                            <h3 className="text-xl font-bold flex items-center gap-2 mb-2">
                                <Palette size={20} className={darkMode ? 'text-emerald-400' : 'text-emerald-600'} />
                                Gestion des Couleurs (Design Standard)
                            </h3>
                            <p className="text-sm opacity-60 max-w-2xl">
                                Ces palettes s'appliquent exclusivement au design "Standard Atelier". Choisissez une ambiance chromatique pour personnaliser la vitrine classique.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            {/* CARTE MODE STANDARD (Original) */}
                            <div
                                onClick={() => handleToggleStandard(true)}
                                className={`group relative p-6 rounded-3xl ring-2 ring-inset text-left transition-all hover:scale-[1.01] cursor-pointer transform-gpu backface-hidden will-change-transform ${activeStandard ? (darkMode ? 'ring-emerald-500 bg-stone-800' : 'ring-emerald-500 bg-white shadow-xl shadow-emerald-50') : (darkMode ? 'ring-stone-800 bg-stone-900 hover:ring-stone-600' : 'ring-stone-100 bg-white hover:ring-stone-200 shadow-sm')}`}
                            >
                                {activeStandard && (
                                    <div className="absolute top-4 right-4 bg-emerald-500 text-white text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-widest flex items-center gap-1">
                                        <Check size={10} strokeWidth={4} /> Actif
                                    </div>
                                )}
                                <div className="flex gap-4">
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${darkMode ? 'bg-stone-700' : 'bg-stone-100'}`}>
                                        <RotateCcw size={24} className="opacity-50" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">Palette Originale</h3>
                                        <p className="text-xs opacity-60 leading-relaxed">Le jeu de couleurs "Chocolat & Bois" historique du site.</p>
                                    </div>
                                </div>
                                {/* Force Mode Controls */}
                                <div className={`mt-6 flex items-center justify-between gap-2 p-1 rounded-xl transition-all duration-300 ${activeStandard ? 'opacity-100' : 'opacity-40 group-hover:opacity-100'} ${darkMode ? 'bg-stone-950/50' : 'bg-stone-100'}`}>
                                    <button onClick={(e) => { e.stopPropagation(); setActiveForcedMode('light'); saveSettings(true, activeThemeIdLocal, 'light', 'standard'); }} className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-wider ${activeStandard && activeForcedMode === 'light' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-400'}`}><Sun size={12} /> Light</button>
                                    <button onClick={(e) => { e.stopPropagation(); setActiveForcedMode('auto'); saveSettings(true, activeThemeIdLocal, 'auto', 'standard'); }} className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-wider ${activeStandard && activeForcedMode === 'auto' ? (darkMode ? 'bg-stone-700 text-white' : 'bg-white text-stone-900 shadow-sm') : 'text-stone-400'}`}><Smartphone size={12} /> Auto</button>
                                    <button onClick={(e) => { e.stopPropagation(); setActiveForcedMode('dark'); saveSettings(true, activeThemeIdLocal, 'dark', 'standard'); }} className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-wider ${activeStandard && activeForcedMode === 'dark' ? 'bg-stone-800 text-white shadow-sm' : 'text-stone-400'}`}><Moon size={12} /> Dark</button>
                                </div>
                            </div>

                            {/* THEMES DYNAMIQUES */}
                            {THEMES.map(theme => (
                                <div
                                    key={theme.id}
                                    onClick={() => handleSelectTheme(theme.id)}
                                    className={`group relative p-6 rounded-3xl ring-2 ring-inset text-left transition-all hover:scale-[1.01] cursor-pointer transform-gpu backface-hidden will-change-transform ${activeThemeIdLocal === theme.id && !activeStandard ? (darkMode ? 'ring-amber-500 bg-stone-800' : 'ring-amber-400 bg-white shadow-xl shadow-amber-100') : (darkMode ? 'ring-stone-800 bg-stone-900 hover:ring-stone-600' : 'ring-stone-100 bg-white hover:ring-stone-200 shadow-sm')}`}
                                >
                                    {activeThemeIdLocal === theme.id && !activeStandard && (
                                        <div className="absolute top-4 right-4 bg-amber-500 text-white text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-widest flex items-center gap-1">
                                            <Check size={10} strokeWidth={4} /> Actif
                                        </div>
                                    )}
                                    <div className="flex gap-4">
                                        <div className="w-16 h-16 rounded-2xl shadow-sm shrink-0" style={{ backgroundColor: theme.previewColor }}></div>
                                        <div>
                                            <h3 className="font-bold text-lg">{theme.name}</h3>
                                            <p className="text-xs opacity-60 leading-relaxed">{theme.description}</p>
                                        </div>
                                    </div>
                                    {/* Mini Palette */}
                                    <div className="flex gap-2 mt-4 pl-[4.5rem]">
                                        <div className="w-6 h-1 rounded-full opacity-50" style={{ backgroundColor: theme.light.bgGradientBot }}></div>
                                        <div className="w-6 h-1 rounded-full opacity-50" style={{ backgroundColor: theme.light.accent }}></div>
                                        <div className="w-6 h-1 rounded-full opacity-50" style={{ backgroundColor: theme.light.textTitle }}></div>
                                    </div>
                                    {/* Force Mode Controls */}
                                    <div className={`mt-4 flex items-center justify-between gap-2 p-1 rounded-xl transition-all duration-300 ${activeThemeIdLocal === theme.id && !activeStandard ? 'opacity-100' : 'opacity-40 group-hover:opacity-100'} ${darkMode ? 'bg-stone-950/50' : 'bg-stone-100'}`}>
                                        <button onClick={(e) => handleForceMode(e, theme.id, 'light')} className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-wider ${activeThemeIdLocal === theme.id && !activeStandard && activeForcedMode === 'light' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-400'}`}><Sun size={12} /> Light</button>
                                        <button onClick={(e) => handleForceMode(e, theme.id, 'auto')} className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-wider ${activeThemeIdLocal === theme.id && !activeStandard && activeForcedMode === 'auto' ? (darkMode ? 'bg-stone-700 text-white shadow-sm' : 'bg-white text-stone-900 shadow-sm') : 'text-stone-400'}`}><Smartphone size={12} /> Auto</button>
                                        <button onClick={(e) => handleForceMode(e, theme.id, 'dark')} className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-wider ${activeThemeIdLocal === theme.id && !activeStandard && activeForcedMode === 'dark' ? 'bg-stone-800 text-white shadow-sm' : 'text-stone-400'}`}><Moon size={12} /> Dark</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}


                {/* --- CONTENU TAB: SHOWROOM (New) --- */}
                {activeTab === 'collection' && (
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 space-y-8">
                        <div className="px-4">
                            <h3 className="text-xl font-bold flex items-center gap-2 mb-2">
                                <Sparkles size={20} className={darkMode ? 'text-indigo-400' : 'text-indigo-600'} />
                                Collection Themes Exclusifs
                            </h3>
                            <p className="text-sm opacity-60 max-w-2xl">
                                Découvrez les nouveaux concepts visuels. Chaque thème ici redéfinit l'architecture complète du site (disposition, typographie, animations) pour une expérience unique.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-6">

                            {/* DESIGN ARCHITECTURAL */}
                            <div
                                onClick={() => activateCollectionDesign('architectural')}
                                className={`group relative overflow-hidden rounded-[2.5rem] border transition-all duration-300 hover:scale-[1.01] cursor-pointer ${activeDesignId === 'architectural' ? (darkMode ? 'border-indigo-500 ring-4 ring-indigo-500/20' : 'border-indigo-500 ring-4 ring-indigo-500/10') : 'border-transparent'}`}
                            >
                                {/* Image Cover Mockup */}
                                <div className={`aspect-[2/1] relative ${darkMode ? 'bg-stone-800' : 'bg-stone-200'}`}>
                                    {/* Mockup UI Simulé */}
                                    <div className="absolute inset-0 p-8 flex flex-col justify-end">
                                        <h1 className={`text-5xl font-serif leading-none opacity-20 ${darkMode ? 'text-white' : 'text-black'}`}>La<br />Galerie.</h1>
                                    </div>
                                    {activeDesignId === 'architectural' && (
                                        <div className="absolute top-4 right-4 bg-indigo-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest flex items-center gap-1 shadow-lg">
                                            <Check size={12} strokeWidth={4} /> Installé
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className={`p-8 ${darkMode ? 'bg-stone-900 border-t border-stone-800' : 'bg-white border-t border-stone-100'}`}>
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h4 className="text-2xl font-black tracking-tight mb-1">Architectural (Editorial)</h4>
                                            <span className="inline-block px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 text-[10px] font-bold uppercase tracking-widest">Nouveau</span>
                                        </div>
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${activeDesignId === 'architectural' ? 'bg-indigo-500 text-white' : (darkMode ? 'bg-stone-800 text-stone-500' : 'bg-stone-100 text-stone-400')}`}>
                                            <Layout size={20} />
                                        </div>
                                    </div>
                                    <p className="text-sm opacity-60 leading-relaxed max-w-md">
                                        Une rupture totale avec l'Atelier. Inspiration "Musée Contemporain".
                                        Typographie Serif dominante, grilles larges, absence de bordures et focus total sur la photographie. Disparition de la 3D.
                                    </p>

                                    <div className="mt-8 flex items-center gap-4 text-xs font-bold uppercase tracking-widest opacity-40">
                                        <span className="flex items-center gap-1"><Check size={10} /> Minimaliste</span>
                                        <span className="flex items-center gap-1"><Check size={10} /> Editorial</span>
                                        <span className="flex items-center gap-1"><Check size={10} /> Responsive</span>
                                    </div>

                                    {/* Force Mode Controls for Architectural */}
                                    <div className={`mt-6 flex items-center justify-between gap-2 p-1 rounded-xl transition-all duration-300 ${activeDesignId === 'architectural' ? 'opacity-100' : 'opacity-40 group-hover:opacity-100'} ${darkMode ? 'bg-stone-950/50' : 'bg-stone-50'}`}>
                                        <button onClick={(e) => handleForceModeCollection(e, 'architectural', 'light')} className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-wider ${activeDesignId === 'architectural' && activeForcedMode === 'light' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-400'}`}><Sun size={12} /> Light</button>
                                        <button onClick={(e) => handleForceModeCollection(e, 'architectural', 'auto')} className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-wider ${activeDesignId === 'architectural' && activeForcedMode === 'auto' ? (darkMode ? 'bg-stone-700 text-white' : 'bg-white text-stone-900 shadow-sm') : 'text-stone-400'}`}><Smartphone size={12} /> Auto</button>
                                        <button onClick={(e) => handleForceModeCollection(e, 'architectural', 'dark')} className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-wider ${activeDesignId === 'architectural' && activeForcedMode === 'dark' ? 'bg-stone-800 text-white shadow-sm' : 'text-stone-400'}`}><Moon size={12} /> Dark</button>
                                    </div>
                                </div>
                            </div>

                            {/* COMING SOON PLACEHOLDER */}
                            <div className={`relative overflow-hidden rounded-[2.5rem] border border-dashed flex flex-col items-center justify-center text-center p-12 gap-4 ${darkMode ? 'border-stone-800 text-stone-700' : 'border-stone-200 text-stone-300'}`}>
                                <Box size={48} strokeWidth={1} />
                                <div>
                                    <h4 className="text-lg font-bold">Prochain Concept</h4>
                                    <p className="text-xs opacity-60">Design Lab en cours de recherche</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

        </div>
    );
};

export default AdminStudio;
