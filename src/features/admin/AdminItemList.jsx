import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot, getDocs } from 'firebase/firestore';
import { db, appId } from '../../firebase/config';
import { Pencil, Eye, EyeOff, Trash2, Trophy, Mail, Search, Loader2 } from 'lucide-react';
import { getMillis } from '../../utils/time';

// Helper pour nettoyer le texte (accents, casse)
const normalizeText = (text) => {
    return (text || '')
        .toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // Enlève les accents
}

const AdminItemList = ({ collectionName, darkMode, onEdit, onToggleStatus, onDelete }) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statsLimit, setStatsLimit] = useState(10); // Start with 10 items (Demande Utilisateur)
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [fullCache, setFullCache] = useState(null); // Cache global pour la recherche

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Reset du cache et de la limite si on change d'onglet
    useEffect(() => {
        setFullCache(null);
        setStatsLimit(10); // Reset to 10
        setItems([]);
        setLoading(true);
    }, [collectionName]);

    // Logique Principale : Fetch & Filter
    useEffect(() => {
        setLoading(true);
        const colRef = collection(db, 'artifacts', appId, 'public', 'data', collectionName);
        let unsubscribe = () => { };

        const runLogic = async () => {
            if (debouncedSearch) {
                // --- MODE RECHERCHE (Client-Side) ---
                let searchPool = fullCache;
                if (!searchPool) {
                    console.log("🔍 Fetching ALL for search...");
                    try {
                        const q = query(colRef, orderBy('createdAt', 'desc'));
                        const snap = await getDocs(q);
                        searchPool = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                        setFullCache(searchPool);
                    } catch (e) {
                        console.error("Search fetch error:", e);
                        setLoading(false);
                        return;
                    }
                }

                const searchTerms = normalizeText(debouncedSearch).split(' ').filter(Boolean);

                const filtered = searchPool.filter(item => {
                    const haystack = normalizeText(`${item.name} ${item.material} ${item.status === 'published' ? 'public' : 'brouillon'}`);
                    return searchTerms.every(term => haystack.includes(term));
                });

                setItems(filtered);
                setLoading(false);

            } else {
                // --- MODE NAVIGATION (Paginé) ---
                const q = query(colRef, orderBy('createdAt', 'desc'), limit(statsLimit));

                unsubscribe = onSnapshot(q, (snap) => {
                    const loadedItems = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                    console.log(`📡 Fetched ${loadedItems.length} items (Limit: ${statsLimit})`);
                    setItems(loadedItems);
                    setLoading(false);
                }, (err) => {
                    console.error("Fetch error:", err);
                    setLoading(false);
                });
            }
        };

        runLogic();

        return () => unsubscribe();
    }, [collectionName, statsLimit, debouncedSearch]);

    return (
        <div className="space-y-6">
            {/* Search Bar */}
            <div className={`relative max-w-md mx-auto md:mx-0 ${darkMode ? 'text-stone-300' : 'text-stone-600'}`}>
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-50" size={18} />
                <input
                    type="text"
                    placeholder="Rechercher (ex: Table, Planche...)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full pl-12 pr-6 py-4 rounded-xl font-bold text-sm outline-none border transition-all ${darkMode
                            ? 'bg-stone-800 border-stone-700 focus:border-stone-500 focus:ring-1 focus:ring-stone-500 placeholder:text-stone-600'
                            : 'bg-white border-stone-200 focus:border-stone-400 focus:ring-1 focus:ring-stone-400 placeholder:text-stone-300'
                        }`}
                />
                {debouncedSearch && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold uppercase opacity-50">
                        {items.length} résultat{items.length > 1 ? 's' : ''}
                    </div>
                )}
            </div>

            {/* List with Scrollable Container (Style AdminOrders) */}
            <div className={`grid gap-4 pr-2 overflow-y-auto scrollbar-thin ${darkMode ? 'scrollbar-thumb-stone-700 scrollbar-track-stone-900/20' : 'scrollbar-thumb-stone-200 scrollbar-track-stone-50'} max-h-[750px] custom-scrollbar`}>
                {loading && items.length === 0 ? (
                    <div className="text-center py-20"><Loader2 className="animate-spin mx-auto text-stone-400" size={32} /></div>
                ) : items.length === 0 ? (
                    <div className={`text-center py-20 rounded-3xl border border-dashed ${darkMode ? 'border-stone-700 text-stone-500' : 'border-stone-200 text-stone-400'}`}>
                        <p className="font-bold">Aucun élément trouvé.</p>
                        {debouncedSearch && <button onClick={() => setSearchTerm('')} className="mt-2 text-sm text-amber-500 hover:underline">Effacer la recherche</button>}
                    </div>
                ) : (
                    <>
                        {items.map(item => {
                            const isAuctionOver = item.auctionActive && item.auctionEnd && (getMillis(item.auctionEnd) < Date.now());
                            const hasWinner = isAuctionOver && item.lastBidderEmail;

                            return (
                                <div key={item.id} className={`p-4 md:p-5 rounded-3xl md:rounded-[2.5rem] border shadow-sm hover:shadow-md transition-all relative overflow-hidden group ${darkMode ? 'bg-stone-800 border-stone-700' : 'bg-[#FAF9F6] border-stone-200'}`}>
                                    <div className="flex flex-col md:flex-row md:items-center justify-between relative z-10 gap-6">
                                        <div className="flex items-center md:items-center gap-4 md:gap-8">
                                            <div className="relative flex-shrink-0">
                                                <img src={item.images?.[0] || item.imageUrl} className={`w-16 h-16 md:w-20 md:h-20 rounded-xl md:rounded-2xl object-cover shadow-sm border ${darkMode ? 'border-stone-700' : 'border-white'}`} alt="" />
                                                {hasWinner && <div className={`absolute -top-2 -right-2 p-1 md:p-1.5 rounded-full shadow-md border-2 ${darkMode ? 'bg-amber-500 border-stone-800' : 'bg-amber-400 border-white'} text-white`}><Trophy size={12} fill="currentColor" className="md:w-3.5 md:h-3.5" /></div>}
                                            </div>

                                            <div className="space-y-1 md:space-y-2 min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2 md:gap-3">
                                                    <span className={`font-black text-base md:text-xl truncate ${darkMode ? 'text-white' : 'text-stone-900'}`}>{item.name}</span>
                                                    <span className={`text-[8px] md:text-[9px] font-black uppercase tracking-widest px-2 py-0.5 md:px-2.5 md:py-1 rounded-lg ${item.status === 'published' ? (darkMode ? 'bg-emerald-900/40 text-emerald-400' : 'bg-emerald-100 text-emerald-700') : (darkMode ? 'bg-stone-700 text-stone-500' : 'bg-stone-200 text-stone-500')}`}>
                                                        {item.status === 'published' ? 'Public' : 'Brouillon'}
                                                    </span>
                                                </div>

                                                {hasWinner ? (
                                                    <div className={`flex flex-col gap-0.5 md:gap-1 border px-3 py-1.5 md:px-4 md:py-2 rounded-xl animate-in slide-in-from-left-4 shadow-sm w-fit ${darkMode ? 'bg-amber-950/20 border-amber-900/40' : 'bg-amber-50 border-amber-200'}`}>
                                                        <p className={`text-[8px] md:text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 md:gap-2 ${darkMode ? 'text-amber-400' : 'text-amber-800'}`}>
                                                            <span className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                                                            Vainqueur
                                                        </p>
                                                        <div className="pl-2.5 md:pl-3.5">
                                                            <p className={`text-xs md:text-sm font-bold ${darkMode ? 'text-stone-200' : 'text-stone-800'}`}>{item.lastBidderName}</p>
                                                            <p className={`text-[10px] md:text-xs font-mono select-all flex items-center gap-1 transition-colors cursor-pointer ${darkMode ? 'text-stone-500 hover:text-amber-400' : 'text-stone-500 hover:text-amber-700'}`} title="Copier">
                                                                <Mail size={10} className="md:w-3" /> {item.lastBidderEmail}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ) : item.auctionActive && (
                                                    <div className="text-[10px] md:text-xs text-stone-400 font-medium pl-1">
                                                        Enchère en cours • {item.bidCount || 0} offre(s)
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-end md:justify-start gap-2 md:gap-3 w-full md:w-auto mt-2 md:mt-0 border-t md:border-none pt-3 md:pt-0">
                                            <button onClick={() => onEdit(item)} className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center shadow-sm border transition-all hover:scale-110 ${darkMode ? 'bg-stone-700 text-white border-stone-600' : 'bg-white text-stone-900 border-stone-100'}`} title="Modifier"><Pencil size={16} className="md:w-[18px]" /></button>
                                            <button onClick={() => onToggleStatus(item)} className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center shadow-sm transition-all hover:scale-110 ${item.status === 'published' ? (darkMode ? 'bg-emerald-600 text-white shadow-emerald-900/40' : 'bg-emerald-500 text-white shadow-emerald-200') : (darkMode ? 'bg-stone-700 text-stone-500' : 'bg-stone-200 text-stone-400')}`} title={item.status === 'published' ? 'Masquer' : 'Publier'}>{item.status === 'published' ? <Eye size={16} className="md:w-[18px]" /> : <EyeOff size={16} className="md:w-[18px]" />}</button>
                                            <button onClick={() => onDelete(item.id)} className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center shadow-sm border transition-all hover:scale-110 ${darkMode ? 'bg-red-950/40 text-red-500 border-red-900/40 hover:bg-red-500 hover:text-white' : 'bg-red-50 text-red-500 border-red-100 hover:bg-red-500 hover:text-white'}`} title="Supprimer"><Trash2 size={16} className="md:w-[18px]" /></button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </>
                )}
            </div>

            {/* Load More Button (ONLY if pagination mode and NOT searching) */}
            {!debouncedSearch && items.length >= statsLimit && (
                <button
                    onClick={() => setStatsLimit(prev => prev + 50)}
                    className={`w-full py-4 rounded-xl border border-dashed text-xs font-black uppercase tracking-widest transition-all ${darkMode ? 'border-stone-700 text-stone-400 hover:bg-stone-800 hover:text-white' : 'border-stone-200 text-stone-400 hover:bg-stone-50 hover:text-stone-900'}`}
                >
                    {loading ? <Loader2 className="animate-spin mx-auto" size={16} /> : 'Charger plus d\'éléments (+50)...'}
                </button>
            )}
        </div>
    );
};

export default AdminItemList;
