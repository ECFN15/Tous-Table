import React, { useState, useEffect } from 'react';
import {
    TrendingUp, ShoppingBag, ArrowUpRight, AlertTriangle, RefreshCw, Mail,
    Gavel, Package, CheckCircle, Clock, Archive, Users
} from 'lucide-react';
import { collection, getDocs, writeBatch, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, appId, functions } from '../../firebase/config';
import { getMillis } from '../../utils/time';

const AdminDashboard = ({ user, darkMode = false }) => {
    // Revised State for Business Logic
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        totalStockValue: 0, // [NEW] Potential Revenue
        activeAuctionsCount: 0, // [NEW] Live Auctions
        totalItemsForSale: 0,
        registeredUsers: 0
    });

    const [activeAuctions, setActiveAuctions] = useState([]); // [NEW] List of live auctions
    const [recentSales, setRecentSales] = useState([]); // [NEW] Recently sold items list
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal States
    const [isOrderResetModalOpen, setIsOrderResetModalOpen] = useState(false);
    const [resettingOrders, setResettingOrders] = useState(false);
    const [allOrders, setAllOrders] = useState([]);
    const [cleaning, setCleaning] = useState(false);
    const [isCleaningModalOpen, setIsCleaningModalOpen] = useState(false);
    const [resettingUsers, setResettingUsers] = useState(false);
    const [isResetUsersModalOpen, setIsResetUsersModalOpen] = useState(false);
    const [exportingUsers, setExportingUsers] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Fetch Orders for Financials
                const ordersSnapshot = await getDocs(collection(db, 'orders'));
                let revenue = 0;
                let orderCount = 0;
                const orders = [];

                ordersSnapshot.forEach(doc => {
                    const data = doc.data();
                    if (data.status !== 'cancelled') {
                        revenue += (data.total || 0);
                        orderCount++;
                    }
                    orders.push({ id: doc.id, ...data });
                });

                const sortedOrders = orders.sort((a, b) => getMillis(b.createdAt) - getMillis(a.createdAt)).slice(0, 5);
                setRecentOrders(sortedOrders);
                setAllOrders(orders);

                // 2. Fetch Items for Stock & Business Stats (Furniture + Boards)
                const furnitureSnap = await getDocs(collection(db, 'artifacts', appId, 'public', 'data', 'furniture'));
                const boardSnap = await getDocs(collection(db, 'artifacts', appId, 'public', 'data', 'cutting_boards'));

                let stockValue = 0;
                let itemsForSale = 0;
                let auctions = [];
                let soldItems = [];

                const processItem = (doc, type) => {
                    const data = doc.data();
                    const price = data.currentPrice || data.startingPrice || 0;
                    const stock = data.stock !== undefined ? Number(data.stock) : 1;

                    // A. Stock Value Calculation (Only available items)
                    if (!data.sold && stock > 0) {
                        stockValue += (price * stock);
                        itemsForSale += stock;
                    }

                    // B. Active Auctions
                    if (data.auctionActive && !data.sold && stock > 0) {
                        const endTime = data.auctionEnd ? getMillis(data.auctionEnd) : 0;
                        const timeLeft = Math.max(0, endTime - Date.now());
                        auctions.push({
                            id: doc.id,
                            ...data,
                            type,
                            timeLeft,
                            bidCount: data.bidCount || 0
                        });
                    }

                    // C. Recent Sales (To celebrate success)
                    if (data.sold || stock <= 0) {
                        soldItems.push({
                            id: doc.id,
                            ...data,
                            soldAt: data.soldAt ? getMillis(data.soldAt) : 0
                        });
                    }
                };

                furnitureSnap.forEach(doc => processItem(doc, 'Mobilier'));
                boardSnap.forEach(doc => processItem(doc, 'Planche'));

                // Sort Auctions by urgency (ending soonest)
                auctions.sort((a, b) => a.timeLeft - b.timeLeft);

                // Sort Sales by recent
                soldItems.sort((a, b) => b.soldAt - a.soldAt);

                setActiveAuctions(auctions);
                setRecentSales(soldItems.slice(0, 5)); // Top 5 sold

                setStats({
                    totalRevenue: revenue,
                    totalOrders: orderCount,
                    averageOrderValue: orderCount > 0 ? Math.round(revenue / orderCount) : 0,
                    totalStockValue: stockValue,
                    activeAuctionsCount: auctions.length,
                    totalItemsForSale: itemsForSale,
                    registeredUsers: 0 // Placeholder, fetched below
                });

                // 3. Fetch User Stats (Async to not block UI if slow)
                httpsCallable(functions, 'getUserStats')().then(res => {
                    setStats(prev => ({ ...prev, registeredUsers: res.data.count }));
                }).catch(err => console.error("Failed to fetch user stats", err));

                setLoading(false);
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
                setLoading(false);
            }
        };

        fetchData();
        // Refresh auctions timer every minute? No, simple load is enough for admin dash overview.
    }, []);


    // --- ACTIONS (Reset, Export, Clean) SAME AS BEFORE ---
    const handleResetOrdersClick = () => setIsOrderResetModalOpen(true);

    const exportToExcel = async (orders) => {
        const XLSX = await import('xlsx');
        const data = orders.map(order => ({
            'ID Commande': order.id,
            'Date': new Date(getMillis(order.createdAt)).toLocaleString(),
            'Client': order.shipping?.fullName || 'N/A',
            'Total': `${order.total} €`,
            'Statut': order.status || 'N/A',
            'Articles': order.items?.map(item => `${item.name} (x${item.quantity})`).join(', ') || ''
        }));
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Commandes");
        XLSX.writeFile(wb, `Commandes_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const confirmResetOrders = async () => {
        setResettingOrders(true);
        try {
            exportToExcel(allOrders);
            const ordersSnapshot = await getDocs(collection(db, 'orders'));
            const chunks = [];
            let currentChunk = writeBatch(db);
            let count = 0;
            for (const doc of ordersSnapshot.docs) {
                currentChunk.delete(doc.ref);
                count++;
                if (count % 500 === 0) {
                    chunks.push(currentChunk.commit());
                    currentChunk = writeBatch(db);
                }
            }
            if (count % 500 !== 0) chunks.push(currentChunk.commit());
            await Promise.all(chunks);

            setStats(prev => ({ ...prev, totalRevenue: 0, totalOrders: 0, averageOrderValue: 0 }));
            setRecentOrders([]);
            setAllOrders([]);
            setIsOrderResetModalOpen(false);
            alert(`Succès ! ${count} commandes archivées et supprimées.`);
        } catch (error) {
            console.error(error);
            alert("Erreur purge commandes: " + error.message);
        } finally {
            setResettingOrders(false);
        }
    };

    const confirmCleaning = async () => {
        setCleaning(true);
        try {
            const garbageCollectorFn = httpsCallable(functions, 'runGarbageCollector');
            const result = await garbageCollectorFn();
            const s = result.data.stats;
            const freedMb = (s.storageSpaceFreedBytes / (1024 * 1024)).toFixed(2);
            setIsCleaningModalOpen(false);
            alert(`✅ Nettoyage terminé.\nEspace libéré : ${freedMb} Mo\nImages supprimées : ${s.orphanedImagesDeleted}`);
        } catch (error) {
            console.error(error);
            alert("Erreur nettoyage: " + error.message);
        } finally {
            setCleaning(false);
        }
    };

    const confirmResetUsers = async () => {
        setResettingUsers(true);
        try {
            const resetUsersFn = httpsCallable(functions, 'resetAllUsers');
            const result = await resetUsersFn();
            const { count, message } = result.data;
            setIsResetUsersModalOpen(false);
            alert(`✅ Succès !\n${message}`);
        } catch (error) {
            console.error(error);
            alert("Erreur purge utilisateurs: " + error.message);
        } finally {
            setResettingUsers(false);
        }
    };

    const handleExportUsers = async () => {
        setExportingUsers(true);
        try {
            const getUserStatsFn = httpsCallable(functions, 'getUserStats');
            const result = await getUserStatsFn();
            const users = result.data.users;

            const data = users.map(u => ({
                'ID': u.uid,
                'Email': u.email,
                'Nom': u.displayName,
                'Date Inscription': new Date(u.creationTime).toLocaleDateString(),
                'Dernière Connexion': new Date(u.lastSignInTime).toLocaleDateString(),
                'Provider': u.provider,
                'IP': u.lastIp || 'N/A',
                'Device': u.lastUserAgent || 'N/A'
            }));

            const XLSX = await import('xlsx');
            const ws = XLSX.utils.json_to_sheet(data);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Clients");
            XLSX.writeFile(wb, `Clients_${new Date().toISOString().split('T')[0]}.xlsx`);

            alert(`✅ Export réussi : ${users.length} clients exportés.`);
        } catch (error) {
            console.error(error);
            alert("Erreur export utilisateurs: " + error.message);
        } finally {
            setExportingUsers(false);
        }
    };

    if (loading) return <div className="p-12 text-center text-stone-400 font-bold animate-pulse">Chargement...</div>;

    // Helper for formatting duration
    const formatDuration = (ms) => {
        if (ms <= 0) return "Terminée";
        const days = Math.floor(ms / (1000 * 60 * 60 * 24));
        const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        return days > 0 ? `${days}j ${hours}h` : `${hours}h rest.`;
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">

            {/* NEW KPI ROW - BUSINESS ORIENTED */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <KpiCard
                    title="Chiffre d'Affaires"
                    value={`${stats.totalRevenue} €`}
                    icon={<TrendingUp size={20} className="text-emerald-500" />}
                    trend={`Panier moyen : ${stats.averageOrderValue} €`}
                    trendColor="text-emerald-600"
                    bg="bg-emerald-50/50 ring-1 ring-inset ring-emerald-100"
                    darkMode={darkMode}
                />
                <KpiCard
                    title="Valeur Catalogue" // Replaces Engagement
                    value={`${stats.totalStockValue} €`}
                    icon={<Package size={20} className="text-amber-500" />}
                    trend={`${stats.totalItemsForSale} pièces en stock`}
                    trendColor="text-amber-600"
                    bg="bg-amber-50/50 ring-1 ring-inset ring-amber-100"
                    darkMode={darkMode}
                />
                <KpiCard
                    title="Commandes"
                    value={stats.totalOrders}
                    icon={<ShoppingBag size={20} className="text-blue-500" />}
                    trend="Total cumulé"
                    bg="bg-blue-50/50 ring-1 ring-inset ring-blue-100"
                    darkMode={darkMode}
                />
                <KpiCard
                    title="Enchères Actives" // Replaces Shares
                    value={stats.activeAuctionsCount}
                    icon={<Gavel size={20} className="text-purple-500" />}
                    trend="Salle des ventes"
                    bg="bg-purple-50/50 ring-1 ring-inset ring-purple-100"
                    darkMode={darkMode}
                />
                <KpiCard
                    title="Clients Inscrits"
                    value={stats.registeredUsers}
                    icon={<Users size={20} className="text-pink-500" />}
                    trend="Comptes vérifiés"
                    bg="bg-pink-50/50 ring-1 ring-inset ring-pink-100"
                    darkMode={darkMode}
                    action={
                        <button
                            onClick={handleExportUsers}
                            disabled={exportingUsers}
                            className="mt-2 text-[10px] bg-white ring-1 ring-pink-200 text-pink-600 px-3 py-1 rounded-full font-bold uppercase hover:bg-pink-50 transition-colors flex items-center gap-1"
                        >
                            {exportingUsers ? <RefreshCw size={10} className="animate-spin" /> : <Archive size={10} />} Excel
                        </button>
                    }
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* MAIN WIDGET: SALLE DES VENTES & DERNIERS VENDUS */}
                <div className="lg:col-span-2 space-y-8">

                    {/* RECENTLY SOLD (MOVED TOP) */}
                    <div className={`p-8 rounded-[2.5rem] shadow-sm overflow-hidden transform-gpu backface-hidden will-change-transform ${darkMode ? 'bg-stone-800 ring-1 ring-inset ring-stone-700' : 'bg-white ring-1 ring-inset ring-stone-100'}`}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className={`text-lg font-black tracking-tight ${darkMode ? 'text-white' : 'text-stone-900'}`}>Dernières Ventes</h3>
                            <Archive size={20} className="text-stone-400" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {recentSales.map(item => (
                                <div key={item.id} className={`flex items-center gap-3 p-3 rounded-xl opacity-60 hover:opacity-100 transition-opacity ${darkMode ? 'bg-stone-900' : 'bg-stone-50'}`}>
                                    <img src={item.images?.[0] || item.imageUrl} className="w-10 h-10 rounded-lg object-cover grayscale" alt="" />
                                    <div className="min-w-0">
                                        <p className={`text-xs font-bold truncate ${darkMode ? 'text-stone-300' : 'text-stone-700'}`}>{item.name}</p>
                                        <p className="text-[10px] text-stone-400">Vendu le {new Date(item.soldAt).toLocaleDateString()}</p>
                                    </div>
                                    <div className="ml-auto text-emerald-500"><CheckCircle size={16} /></div>
                                </div>
                            ))}
                            {recentSales.length === 0 && <p className="text-xs text-stone-400 italic">Aucune vente archivée.</p>}
                        </div>
                    </div>

                    {/* LIVE AUCTIONS (MOVED DOWN) */}
                    <div className={`p-8 rounded-[2.5rem] shadow-sm overflow-hidden transform-gpu backface-hidden will-change-transform ${darkMode ? 'bg-stone-800 ring-1 ring-inset ring-stone-700' : 'bg-white ring-1 ring-inset ring-stone-100'}`}>
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className={`text-xl font-black tracking-tight flex items-center gap-2 ${darkMode ? 'text-white' : 'text-stone-900'}`}>
                                    Salle des Ventes <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full animate-pulse">LIVE</span>
                                </h3>
                                <p className="text-xs text-stone-400 font-bold uppercase tracking-widest mt-1">Surveillance des enchères en cours</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {activeAuctions.length === 0 ? (
                                <div className="text-center py-10 opacity-50">
                                    <Gavel size={40} className="mx-auto mb-2 text-stone-300" />
                                    <p className="text-sm font-bold text-stone-400">Aucune enchère en cours</p>
                                </div>
                            ) : (
                                activeAuctions.map((item) => (
                                    <div key={item.id} className={`flex items-center justify-between p-4 rounded-2xl ring-1 ring-inset transition-all transform-gpu backface-hidden will-change-transform ${darkMode ? 'ring-stone-700 bg-stone-900/50' : 'ring-stone-100 bg-stone-50'}`}>
                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                <img src={item.images?.[0] || item.imageUrl} className="w-12 h-12 rounded-xl object-cover" alt="" />
                                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full ring-2 ring-white flex items-center justify-center text-[8px] font-bold text-white">{item.bidCount}</div>
                                            </div>
                                            <div>
                                                <h4 className={`font-bold text-sm ${darkMode ? 'text-white' : 'text-stone-900'}`}>{item.name}</h4>
                                                <p className="text-[10px] text-stone-400 uppercase tracking-wider">{item.lastBidderName || 'Aucune offre'}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`font-black text-lg ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                                                {item.currentPrice || item.startingPrice} €
                                            </p>
                                            <p className="text-[10px] font-bold text-stone-400 flex items-center justify-end gap-1">
                                                <Clock size={10} /> {formatDuration(item.timeLeft)}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                </div>

                {/* SIDEBAR */}
                <div className="space-y-6">
                    {/* Recent Orders */}
                    <div className={`p-6 rounded-[2rem] shadow-sm transform-gpu backface-hidden will-change-transform overflow-hidden ${darkMode ? 'bg-stone-800 ring-1 ring-inset ring-stone-700' : 'bg-white ring-1 ring-inset ring-stone-100'}`}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className={`text-sm font-black uppercase tracking-widest ${darkMode ? 'text-white' : 'text-stone-900'}`}>Dernières Commandes</h3>
                            <button onClick={() => { window.location.href = "/?page=admin&section=orders" }} className="text-[10px] text-blue-500 hover:underline">Voir tout</button>
                        </div>
                        <div className="space-y-4">
                            {recentOrders.length === 0 ? <p className="text-xs text-stone-400">Aucune commande récente.</p> : (
                                recentOrders.map(order => (
                                    <div key={order.id} className={`flex items-center gap-3 p-3 rounded-xl transition-colors ring-1 ring-inset ring-transparent ${darkMode ? 'hover:bg-stone-700 hover:ring-stone-600' : 'hover:bg-stone-50 hover:ring-stone-100'}`}>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[10px] ${darkMode ? 'bg-stone-700 text-stone-300' : 'bg-stone-100 text-stone-500'}`}>
                                            {order.shipping?.fullName?.[0] || '?'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-xs font-bold truncate ${darkMode ? 'text-white' : 'text-stone-900'}`}>{order.shipping?.fullName || 'Client'}</p>
                                            <p className="text-[9px] text-stone-400">{new Date(getMillis(order.createdAt)).toLocaleDateString()}</p>
                                        </div>
                                        <span className={`text-xs font-black ${darkMode ? 'text-white' : 'text-stone-900'}`}>{order.total}€</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* SYSTEM DIAGNOSTICS */}
                    <div className={`p-6 rounded-[2rem] shadow-sm transform-gpu backface-hidden will-change-transform overflow-hidden ${darkMode ? 'bg-stone-800 ring-1 ring-inset ring-stone-700' : 'bg-white ring-1 ring-inset ring-stone-100'}`}>
                        <h3 className={`text-sm font-black uppercase tracking-widest mb-4 ${darkMode ? 'text-white' : 'text-stone-900'}`}>Diagnostics Système</h3>
                        <p className="text-xs text-stone-400 mb-4">Vérifiez l'état des services externes.</p>

                        <button
                            onClick={async () => {
                                if (!confirm("Envoyer un email de test ?")) return;
                                try {
                                    alert("Envoi...");
                                    const res = await httpsCallable(functions, 'sendTestEmail')();
                                    if (res.data.success) alert("✅ Email envoyé !");
                                    else alert("❌ Erreur: " + res.data.error);
                                } catch (e) { alert("Erreur: " + e.message); }
                            }}
                            className={`w-full py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all shadow-sm flex items-center justify-center gap-2 ring-1 ring-inset ${darkMode ? 'bg-stone-700 text-stone-300 ring-stone-600 hover:bg-stone-600' : 'bg-stone-50 text-stone-600 ring-stone-200 hover:bg-stone-100'}`}
                        >
                            <Mail size={14} /> Tester Email
                        </button>
                    </div>

                    {/* DANGER ZONE */}
                    <div className={`p-6 rounded-[2rem] ring-1 ring-inset transform-gpu backface-hidden will-change-transform overflow-hidden ${darkMode ? 'bg-red-900/10 ring-red-900/30' : 'bg-red-50 ring-red-100/50'}`}>
                        <div className={`flex items-center gap-2 mb-4 ${darkMode ? 'text-red-400' : 'text-red-900'}`}>
                            <AlertTriangle size={16} />
                            <h3 className="text-xs font-black uppercase tracking-widest">Zone de Danger</h3>
                        </div>
                        <div className="space-y-2">
                            <button
                                onClick={handleResetOrdersClick}
                                disabled={resettingOrders}
                                className={`w-full py-3 rounded-xl font-bold uppercase text-[9px] tracking-widest transition-all flex items-center justify-center gap-2 ring-1 ring-inset ${darkMode ? 'bg-stone-800 text-red-400 ring-red-900/50 hover:bg-red-900/20' : 'bg-white text-red-500 ring-red-100 hover:bg-red-50'}`}
                            >
                                <RefreshCw size={12} className={resettingOrders ? "animate-spin" : ""} /> Purge Commandes
                            </button>
                            <button
                                onClick={() => setIsCleaningModalOpen(true)}
                                disabled={cleaning}
                                className={`w-full py-3 rounded-xl font-bold uppercase text-[9px] tracking-widest transition-all flex items-center justify-center gap-2 ring-1 ring-inset ${darkMode ? 'bg-stone-800 text-orange-400 ring-orange-900/50 hover:bg-orange-900/20' : 'bg-white text-orange-500 ring-orange-100 hover:bg-orange-50'}`}
                            >
                                <RefreshCw size={12} className={cleaning ? "animate-spin" : ""} /> Nettoyage Système
                            </button>
                            <button
                                onClick={() => setIsResetUsersModalOpen(true)}
                                disabled={resettingUsers}
                                className={`w-full py-3 rounded-xl font-bold uppercase text-[9px] tracking-widest transition-all flex items-center justify-center gap-2 ring-1 ring-inset ${darkMode ? 'bg-stone-800 text-red-600 ring-red-900/50 hover:bg-red-900/20' : 'bg-white text-red-700 ring-red-100 hover:bg-red-50'}`}
                            >
                                <RefreshCw size={12} className={resettingUsers ? "animate-spin" : ""} /> Purge Utilisateurs
                            </button>
                        </div>
                    </div>
                    {/* KEEP MODALS AS IS (Order Reset, Cleaning) */}
                    {isOrderResetModalOpen && (
                        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm ${darkMode ? 'bg-black/70' : 'bg-stone-900/50'}`}>
                            <div className={`rounded-[2rem] p-8 max-w-sm w-full shadow-2xl border text-center space-y-4 ${darkMode ? 'bg-stone-800 border-stone-700' : 'bg-white border-stone-100'}`}>
                                <h3 className={`text-lg font-black ${darkMode ? 'text-white' : 'text-stone-900'}`}>Purger Commandes ?</h3>
                                <p className="text-xs text-stone-400">Export Excel + Suppression définitive.</p>
                                <div className="flex gap-2">
                                    <button onClick={confirmResetOrders} className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold text-xs">Confirmer</button>
                                    <button onClick={() => setIsOrderResetModalOpen(false)} className="flex-1 py-3 bg-stone-200 text-stone-600 rounded-xl font-bold text-xs">Annuler</button>
                                </div>
                            </div>
                        </div>
                    )}
                    {isCleaningModalOpen && (
                        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm ${darkMode ? 'bg-black/70' : 'bg-stone-900/50'}`}>
                            <div className={`rounded-[2rem] p-8 max-w-sm w-full shadow-2xl border text-center space-y-4 ${darkMode ? 'bg-stone-800 border-stone-700' : 'bg-white border-stone-100'}`}>
                                <h3 className={`text-lg font-black ${darkMode ? 'text-white' : 'text-stone-900'}`}>Nettoyage Système ?</h3>
                                <p className="text-xs text-stone-400">Supprime les images orphelines du stockage.</p>
                                <div className="flex gap-2">
                                    <button onClick={confirmCleaning} className="flex-1 py-3 bg-orange-500 text-white rounded-xl font-bold text-xs">Lancer</button>
                                    <button onClick={() => setIsCleaningModalOpen(false)} className="flex-1 py-3 bg-stone-200 text-stone-600 rounded-xl font-bold text-xs">Annuler</button>
                                </div>
                            </div>
                        </div>
                    )}
                    {isResetUsersModalOpen && (
                        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm ${darkMode ? 'bg-black/70' : 'bg-stone-900/50'}`}>
                            <div className={`rounded-[2rem] p-8 max-w-sm w-full shadow-2xl border text-center space-y-4 ${darkMode ? 'bg-stone-800 border-stone-700 border-red-900/30' : 'bg-white border-stone-100 border-red-100'}`}>
                                <h3 className={`text-lg font-black text-red-500`}>Danger : Purge Totale ?</h3>
                                <p className={`text-xs ${darkMode ? 'text-stone-300' : 'text-stone-600'}`}>
                                    Cela va supprimer <b>TOUS les comptes utilisateurs</b> (clients et tests) de Firebase Auth.<br /><br />
                                    Seuls les Super Admins (<code>matthis.fradin...</code>) seront épargnés.
                                </p>
                                <div className="flex gap-2 pt-2">
                                    <button onClick={confirmResetUsers} className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-500/20">Confirmer</button>
                                    <button onClick={() => setIsResetUsersModalOpen(false)} className={`flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-wider ${darkMode ? 'bg-stone-700 text-stone-300 hover:bg-stone-600' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'}`}>Annuler</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const KpiCard = ({ title, value, icon, trend, trendColor = "text-stone-400", bg = "bg-white", darkMode = false, action }) => (
    <div className={`p-6 rounded-[2rem] shadow-sm transition-all duration-300 hover:scale-[1.05] transform-gpu backface-hidden will-change-transform overflow-hidden ${darkMode ? 'bg-stone-800 ring-1 ring-inset ring-stone-700' : (bg.includes('white') ? 'ring-1 ring-inset ring-stone-100 bg-white' : bg)}`}>
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-2xl shadow-sm ring-1 ring-inset ${darkMode ? 'bg-stone-700 ring-stone-600' : 'bg-white ring-stone-100/50'}`}>{icon}</div>
            {action}
        </div>
        <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1">{title}</p>
            <h4 className={`text-2xl font-black tracking-tighter mb-2 ${darkMode ? 'text-white' : 'text-stone-900'}`}>{value}</h4>
            <p className={`text-[10px] font-bold opacity-80 ${trendColor}`}>{trend}</p>
        </div>
    </div>
);

export default AdminDashboard;
