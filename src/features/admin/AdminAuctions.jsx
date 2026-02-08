
import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, getDocs, limit, where } from 'firebase/firestore';
import { db, appId } from '../../firebase/config';
import { Gavel, History, Download, ChevronDown, ChevronUp, User, Mail, Calendar, Clock } from 'lucide-react';
import * as XLSX from 'xlsx';
import { getMillis } from '../../utils/time';

const AdminAuctions = ({ darkMode = false }) => {
    const [auctions, setAuctions] = useState([]);
    const [expandedAuction, setExpandedAuction] = useState(null);
    const [bidsHistory, setBidsHistory] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        // Optimize: Fetch only ACTIVE auctions server-side
        const furnitureQuery = query(
            collection(db, 'artifacts', appId, 'public', 'data', 'furniture'),
            where('auctionActive', '==', true)
        );
        const boardsQuery = query(
            collection(db, 'artifacts', appId, 'public', 'data', 'cutting_boards'),
            where('auctionActive', '==', true)
        );

        const unsubFurniture = onSnapshot(furnitureQuery, (snap) => {
            const furnitureAuctions = snap.docs
                .map(d => ({ id: d.id, collectionName: 'furniture', ...d.data() }));

            setAuctions(prev => {
                const other = prev.filter(a => a.collectionName !== 'furniture');
                return [...other, ...furnitureAuctions].sort((a, b) => getMillis(b.createdAt) - getMillis(a.createdAt));
            });
            setLoading(false);
        });

        const unsubBoards = onSnapshot(boardsQuery, (snap) => {
            const boardAuctions = snap.docs
                .map(d => ({ id: d.id, collectionName: 'cutting_boards', ...d.data() }));

            setAuctions(prev => {
                const other = prev.filter(a => a.collectionName !== 'cutting_boards');
                return [...other, ...boardAuctions].sort((a, b) => getMillis(b.createdAt) - getMillis(a.createdAt));
            });
        });

        return () => { unsubFurniture(); unsubBoards(); };
    }, []);

    const fetchBids = async (auctionId, collectionName) => {
        if (bidsHistory[auctionId]) return; // Already fetched

        const bidsRef = collection(db, 'artifacts', appId, 'public', 'data', collectionName, auctionId, 'bids');
        const q = query(bidsRef, orderBy('timestamp', 'desc'));
        const snap = await getDocs(q);
        const bids = snap.docs.map(d => ({ id: d.id, ...d.data() }));

        setBidsHistory(prev => ({ ...prev, [auctionId]: bids }));
    };

    const toggleExpand = (auction) => {
        if (expandedAuction === auction.id) {
            setExpandedAuction(null);
        } else {
            setExpandedAuction(auction.id);
            fetchBids(auction.id, auction.collectionName);
        }
    };

    const exportAuctionBids = (auction) => {
        const bids = bidsHistory[auction.id] || [];
        if (bids.length === 0) {
            alert("Aucune enchère à exporter.");
            return;
        }

        const data = bids.map(bid => ({
            'Date': bid.timestamp?.toDate ? bid.timestamp.toDate().toLocaleDateString('fr-FR') : 'N/A',
            'Heure': bid.timestamp?.toDate ? bid.timestamp.toDate().toLocaleTimeString('fr-FR') : 'N/A',
            'Enchérisseur': bid.bidderName || 'N/A',
            'Email': bid.bidderEmail || 'N/A',
            'ID Utilisateur': bid.bidderId || 'N/A',
            'Montant (€)': bid.amount,
            'Incrément (€)': bid.increment || 'N/A'
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Historique Enchères");

        // Auto-width
        const wscols = Object.keys(data[0] || {}).map(() => ({ wch: 20 }));
        ws['!cols'] = wscols;

        XLSX.writeFile(wb, `Encheres_${auction.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const formatDate = (date) => {
        if (!date) return '-';
        const d = date.toDate ? date.toDate() : new Date(date);
        return d.toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    if (loading && auctions.length === 0) return <div className="p-12 text-center text-stone-400 font-bold animate-pulse">Chargement des enchères...</div>;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className={`text-2xl font-black tracking-tighter ${darkMode ? 'text-white' : 'text-stone-900'}`}>Suivi des Enchères ({auctions.length})</h2>
                    <p className="text-xs text-stone-400 font-bold uppercase tracking-widest mt-1">Historique complet et export des offres</p>
                </div>
                <div className="flex gap-2 text-xs font-bold uppercase tracking-widest text-stone-400">
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div> Live</span>
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-stone-400"></div> Terminé</span>
                </div>
            </div>

            <div className="grid gap-4">
                {auctions.map(auction => {
                    const isOver = getMillis(auction.auctionEnd) < Date.now();
                    const bids = bidsHistory[auction.id] || [];

                    return (
                        <div key={auction.id} className={`border rounded-[2rem] shadow-sm overflow-hidden transition-all ${darkMode ? 'bg-stone-800 border-stone-700' : 'bg-white border-stone-100'}`}>
                            {/* Auction Header Card */}
                            <div
                                onClick={() => toggleExpand(auction)}
                                className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 cursor-pointer relative group"
                            >
                                <div className="flex items-center gap-6">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 ${isOver ? 'bg-stone-100 text-stone-400' : 'bg-red-50 text-red-500'}`}>
                                        <Gavel size={24} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className={`text-lg font-black tracking-tight ${darkMode ? 'text-white' : 'text-stone-900'}`}>{auction.name}</h3>
                                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${isOver ? 'bg-stone-100 text-stone-400 border-stone-200' : 'bg-red-50 text-red-500 border-red-100 animate-pulse'}`}>
                                                {isOver ? 'Terminé' : 'En Direct'}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-400 font-medium">
                                            <span className="flex items-center gap-1.5"><Calendar size={12} /> Fin : {formatDate(auction.auctionEnd)}</span>
                                            <span className="flex items-center gap-1.5 font-bold text-stone-500">{auction.bidCount || 0} Offres</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between md:justify-end gap-8 bg-stone-50/50 dark:bg-stone-900/40 p-4 md:p-0 rounded-2xl md:bg-transparent">
                                    <div className="text-right">
                                        <p className="text-[10px] font-black uppercase opacity-40 mb-1">Prix Actuel</p>
                                        <p className={`text-2xl font-black tracking-tighter tabular-nums ${darkMode ? 'text-white' : 'text-stone-900'}`}>{auction.currentPrice || auction.startingPrice} €</p>
                                    </div>
                                    <div className={`w-10 h-10 rounded-full border flex items-center justify-center transition-colors ${darkMode ? 'border-stone-700 hover:bg-stone-700 text-white' : 'border-stone-100 hover:bg-stone-50 text-stone-300'}`}>
                                        {expandedAuction === auction.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                    </div>
                                </div>
                            </div>

                            {/* Detail Expandable Area */}
                            {expandedAuction === auction.id && (
                                <div className={`p-8 border-t animate-in slide-in-from-top-4 duration-300 ${darkMode ? 'border-stone-700 bg-stone-900/30' : 'border-stone-50 bg-stone-50/30'}`}>
                                    <div className="flex justify-between items-center mb-6">
                                        <h4 className="text-xs font-black uppercase tracking-widest text-stone-400 flex items-center gap-2">
                                            <History size={14} /> Historique des offres certifié
                                        </h4>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); exportAuctionBids(auction); }}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${darkMode ? 'bg-white text-stone-900 hover:bg-stone-200' : 'bg-stone-900 text-white hover:bg-stone-800'}`}
                                        >
                                            <Download size={14} /> Exporter (.xlsx)
                                        </button>
                                    </div>

                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-separate border-spacing-y-2">
                                            <thead>
                                                <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-300 px-4">
                                                    <th className="pb-4 pl-4">Date</th>
                                                    <th className="pb-4">Enchérisseur</th>
                                                    <th className="pb-4">Email</th>
                                                    <th className="pb-4 text-right pr-4">Montant</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {bids.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="4" className="py-10 text-center text-stone-400 italic text-sm">Aucune offre pour le moment sur cette pièce.</td>
                                                    </tr>
                                                ) : (
                                                    bids.map((bid, idx) => (
                                                        <tr key={bid.id} className={`group transition-all ${darkMode ? 'hover:bg-stone-800' : 'hover:bg-white shadow-sm hover:shadow-md'}`}>
                                                            <td className={`py-4 pl-4 rounded-l-2xl border-y ${darkMode ? 'border-stone-700' : 'bg-white border-stone-100'}`}>
                                                                <div className="flex flex-col">
                                                                    <span className={`text-xs font-bold ${darkMode ? 'text-white' : 'text-stone-900'}`}>{bid.timestamp?.toDate ? bid.timestamp.toDate().toLocaleDateString('fr-FR') : 'Date...'}</span>
                                                                    <span className="text-[10px] opacity-40">{bid.timestamp?.toDate ? bid.timestamp.toDate().toLocaleTimeString('fr-FR') : 'Heure...'}</span>
                                                                </div>
                                                            </td>
                                                            <td className={`py-4 border-y ${darkMode ? 'border-stone-700' : 'bg-white border-stone-100'}`}>
                                                                <div className="flex items-center gap-2">
                                                                    <User size={12} className="opacity-30" />
                                                                    <span className={`text-xs font-bold ${darkMode ? 'text-stone-200' : 'text-stone-700'}`}>{bid.bidderName || 'Utilisateur'}</span>
                                                                </div>
                                                            </td>
                                                            <td className={`py-4 border-y ${darkMode ? 'border-stone-700' : 'bg-white border-stone-100'}`}>
                                                                <div className="flex items-center gap-2">
                                                                    <Mail size={12} className="opacity-30" />
                                                                    <span className="text-xs opacity-60 font-medium">{bid.bidderEmail || 'N/A'}</span>
                                                                </div>
                                                            </td>
                                                            <td className={`py-4 pr-4 text-right font-black rounded-r-2xl border-y tabular-nums ${darkMode ? 'border-stone-700 text-white' : 'bg-white border-stone-100 text-stone-900 text-lg'}`}>
                                                                {bid.amount} €
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Summary Footer */}
                                    {bids.length > 0 && (
                                        <div className="mt-8 p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100/50 dark:border-amber-900/20 text-center">
                                            <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-[0.2em]">
                                                Gagnant Actuel : {bids[0].bidderName} ({bids[0].amount} €)
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}

                {auctions.length === 0 && !loading && (
                    <div className="text-center py-32 opacity-30">
                        <Gavel size={64} className="mx-auto mb-4" />
                        <p className="text-xl font-black tracking-widest uppercase">Aucune enchère active</p>
                        <p className="text-sm font-medium mt-2">Activez l'option enchère sur un meuble pour le voir ici.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminAuctions;
