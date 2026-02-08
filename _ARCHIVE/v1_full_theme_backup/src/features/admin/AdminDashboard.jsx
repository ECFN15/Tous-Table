
import React, { useState, useEffect } from 'react';
import {
    TrendingUp, Users, Heart, MessageCircle, Share2,
    DollarSign, ShoppingBag, ArrowUpRight, AlertTriangle, RefreshCw, Mail
} from 'lucide-react';
import { collection, getDocs, writeBatch, doc, onSnapshot, query, orderBy, limit, setDoc, serverTimestamp } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, appId, functions } from '../../firebase/config';
import { getMillis } from '../../utils/time';
import * as XLSX from 'xlsx';


const AdminDashboard = ({ user, darkMode = false }) => {
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        totalLikes: 0,
        totalComments: 0,
        totalShares: 0
    });
    const [trendingItems, setTrendingItems] = useState([]);
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [resetting, setResetting] = useState(false);
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);
    const [isOrderResetModalOpen, setIsOrderResetModalOpen] = useState(false);
    const [resettingOrders, setResettingOrders] = useState(false);
    const [allOrders, setAllOrders] = useState([]);
    const [cleaning, setCleaning] = useState(false);
    const [isCleaningModalOpen, setIsCleaningModalOpen] = useState(false);


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
                    if (data.status !== 'cancelled') { // Exclude cancelled if any
                        revenue += (data.total || 0);
                        orderCount++;
                    }
                    orders.push({ id: doc.id, ...data });
                });

                // Sort orders client side for recent list (or use query)
                const sortedOrders = orders.sort((a, b) => getMillis(b.createdAt) - getMillis(a.createdAt)).slice(0, 5);
                setRecentOrders(sortedOrders);

                // 2. Fetch Items for Engagement Stats
                const furnitureSnap = await getDocs(collection(db, 'artifacts', appId, 'public', 'data', 'furniture'));
                const boardSnap = await getDocs(collection(db, 'artifacts', appId, 'public', 'data', 'cutting_boards'));

                let likes = 0;
                let comments = 0;
                let shares = 0;
                let allItems = [];

                const processItem = (doc) => {
                    const data = doc.data();
                    likes += (data.likeCount || 0);
                    comments += (data.commentCount || 0);
                    shares += (data.shareCount || 0);
                    allItems.push({ id: doc.id, ...data });
                };

                furnitureSnap.forEach(processItem);
                boardSnap.forEach(processItem);

                // Calculate Top Trending (by likes + comments*2 + shares*3)
                const trending = allItems
                    .map(item => ({
                        ...item,
                        score: (item.likeCount || 0) + ((item.commentCount || 0) * 2) + ((item.shareCount || 0) * 3)
                    }))
                    .sort((a, b) => b.score - a.score)
                    .slice(0, 5);

                setTrendingItems(trending);
                setAllOrders(orders);
                setStats({
                    totalRevenue: revenue,
                    totalOrders: orderCount,
                    averageOrderValue: orderCount > 0 ? Math.round(revenue / orderCount) : 0,
                    totalLikes: likes,
                    totalComments: comments,
                    totalShares: shares
                });
                setLoading(false);
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
                setLoading(false);
            }
        };

        fetchData();
    }, []); // Run once on mount


    const refreshStats = async () => {
        setLoading(true);
        try {
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

            setStats(prev => ({
                ...prev,
                totalRevenue: revenue,
                totalOrders: orderCount,
                averageOrderValue: orderCount > 0 ? Math.round(revenue / orderCount) : 0
            }));
        } catch (error) {
            console.error("Refresh stats error:", error);
        } finally {
            setLoading(false);
        }
    };


    const handleResetClick = () => {
        setIsResetModalOpen(true);
    };

    const confirmReset = async () => {
        setResetting(true);
        try {
            // Call the robust Cloud Function
            const resetStatsFn = httpsCallable(functions, 'resetAllStats');
            const result = await resetStatsFn();
            const count = result.data.count || 0;

            // Force clear LOCAL STORAGE
            localStorage.removeItem('tat_liked_items_v2');
            localStorage.removeItem('tat_shared_items_v2');

            // Set Global Reset Signal
            await setDoc(doc(db, 'sys_metadata', 'stats_reset'), {
                lastStatsReset: serverTimestamp(),
                resetBy: user?.email || 'admin'
            }, { merge: true });

            // Update local state
            setStats(prev => ({ ...prev, totalLikes: 0, totalComments: 0, totalShares: 0 }));
            setTrendingItems([]);

            setIsResetModalOpen(false);
            alert(`Succès ! ${count} opérations de nettoyage effectuées. Les compteurs sont remis à zéro.`);
        } catch (error) {
            console.error("Reset error:", error);
            alert("Erreur lors de la réinitialisation : " + (error.message || "Erreur inconnue"));
        } finally {
            setResetting(false);
        }
    };

    const handleResetOrdersClick = () => {
        setIsOrderResetModalOpen(true);
    };


    const exportToExcel = (orders) => {
        const data = orders.map(order => ({
            'ID Commande': order.id,
            'Date': new Date(getMillis(order.createdAt)).toLocaleString(),
            'Client': order.shipping?.fullName || 'N/A',
            'Email': order.shipping?.email || 'N/A',
            'Téléphone': order.shipping?.phone || 'N/A',
            'Adresse': `${order.shipping?.address || ''}, ${order.shipping?.city || ''} ${order.shipping?.postalCode || ''}`,
            'Total': `${order.total} €`,
            'Statut': order.status || 'N/A',
            'Articles': order.items?.map(item => `${item.name} (x${item.quantity})`).join(', ') || ''
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Commandes");
        XLSX.writeFile(wb, `Recapitulatif_Commandes_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const confirmResetOrders = async () => {
        setResettingOrders(true);
        try {
            // 1. Export to Excel first
            exportToExcel(allOrders);

            // 2. Batch delete all orders
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

            // 3. Reset local state immediately
            setStats(prev => ({
                ...prev,
                totalRevenue: 0,
                totalOrders: 0,
                averageOrderValue: 0
            }));
            setRecentOrders([]);
            setAllOrders([]);
            setIsOrderResetModalOpen(false);

            // 4. Force a refresh of the whole data just in case
            await refreshStats();

            alert(`Succès ! ${count} commandes ont été sauvegardées en Excel et supprimées de la base.`);
        } catch (error) {
            console.error("Order reset error:", error);
            alert("Erreur lors de la réinitialisation des commandes :" + error.message);
        } finally {
            setResettingOrders(false);
        }
    };

    const confirmCleaning = async () => {
        setCleaning(true);
        try {
            // Call Cloud Function
            const garbageCollectorFn = httpsCallable(functions, 'runGarbageCollector');
            const result = await garbageCollectorFn();
            const stats = result.data.stats;
            const freedMb = (stats.storageSpaceFreedBytes / (1024 * 1024)).toFixed(2);

            setIsCleaningModalOpen(false);

            alert(`✅ Nettoyage Terminé avec Succès !\n\n` +
                `👻 Fantômes éliminés : ${stats.ghostDocsDeleted}\n` +
                `📸 Images orphelines supprimées : ${stats.orphanedImagesDeleted}\n` +
                `💾 Espace libéré : ${freedMb} Mo\n` +
                `\nVotre système est maintenant propre.`);
        } catch (error) {
            console.error("Cleaning error:", error);
            alert("Erreur lors du nettoyage système : " + (error.message || "Erreur inconnue"));
        } finally {
            setCleaning(false);
        }
    };


    if (loading) return <div className="p-12 text-center text-stone-400 font-bold animate-pulse">Chargement des données...</div>;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">

            {/* KPI ROW */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard
                    title="Chiffre d'Affaires"
                    value={`${stats.totalRevenue} €`}
                    icon={<DollarSign size={20} className="text-emerald-500" />}
                    trend={`Panier moyen : ${stats.averageOrderValue} €`}
                    trendColor="text-emerald-600"
                    bg="bg-emerald-50/50 ring-1 ring-inset ring-emerald-100"
                    darkMode={darkMode}
                />
                <KpiCard
                    title="Engagement Total"
                    value={stats.totalLikes + stats.totalComments + stats.totalShares}
                    icon={<TrendingUp size={20} className="text-amber-500" />}
                    trend={`${stats.totalLikes} Likes • ${stats.totalComments} Coms`}
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
                    title="Partages"
                    value={stats.totalShares}
                    icon={<Share2 size={20} className="text-purple-500" />}
                    trend="Viralité"
                    bg="bg-purple-50/50 ring-1 ring-inset ring-purple-100"
                    darkMode={darkMode}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* TOP TRENDING (Bar Chart styled) */}
                <div className={`lg:col-span-2 p-8 rounded-[2.5rem] shadow-sm transform-gpu backface-hidden will-change-transform overflow-hidden ${darkMode ? 'bg-stone-800 ring-1 ring-inset ring-stone-700' : 'bg-white ring-1 ring-inset ring-stone-100'}`}>
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className={`text-xl font-black tracking-tight ${darkMode ? 'text-white' : 'text-stone-900'}`}>Tendances Mobilier</h3>
                            <p className="text-xs text-stone-400 font-bold uppercase tracking-widest mt-1">Le top 5 de vos créations</p>
                        </div>
                        <div className={`p-2 rounded-full ${darkMode ? 'bg-stone-700' : 'bg-stone-50'}`}><ArrowUpRight size={20} className="text-stone-400" /></div>
                    </div>

                    <div className="space-y-6">
                        {trendingItems.length === 0 ? (
                            <p className={`text-center italic py-10 ${darkMode ? 'text-stone-500' : 'text-stone-300'}`}>Pas assez de données pour le moment...</p>
                        ) : (
                            trendingItems.map((item, idx) => {
                                const maxScore = trendingItems[0]?.score || 1;
                                const percent = (item.score / maxScore) * 100;
                                return (
                                    <div key={item.id} className="relative group">
                                        <div className={`flex justify-between text-xs font-bold mb-2 relative z-10 ${darkMode ? 'text-stone-300' : 'text-stone-600'}`}>
                                            <span className="flex items-center gap-2">
                                                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${darkMode ? 'bg-stone-700 text-stone-400' : 'bg-stone-100 text-stone-500'}`}>#{idx + 1}</span>
                                                {item.name}
                                            </span>
                                            <div className="flex gap-3 text-[10px] uppercase tracking-wide opacity-60">
                                                <span className="flex items-center gap-1"><Heart size={10} /> {item.likeCount || 0}</span>
                                                <span className="flex items-center gap-1"><MessageCircle size={10} /> {item.commentCount || 0}</span>
                                                <span className="flex items-center gap-1"><Share2 size={10} /> {item.shareCount || 0}</span>
                                            </div>
                                        </div>
                                        <div className={`h-3 w-full rounded-full overflow-hidden ${darkMode ? 'bg-stone-700' : 'bg-stone-50'}`}>
                                            <div
                                                className={`h-full rounded-full transition-all duration-1000 ease-out flex items-center justify-end px-2 ${darkMode ? 'bg-white' : 'bg-stone-900'}`}
                                                style={{ width: `${percent}%` }}
                                            >
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* RECENT ACTIVITY & ACTIONS */}
                <div className="space-y-6">
                    {/* Recent Orders */}
                    <div className={`p-6 rounded-[2rem] shadow-sm transform-gpu backface-hidden will-change-transform overflow-hidden ${darkMode ? 'bg-stone-800 ring-1 ring-inset ring-stone-700' : 'bg-white ring-1 ring-inset ring-stone-100'}`}>
                        <h3 className={`text-sm font-black uppercase tracking-widest mb-4 ${darkMode ? 'text-white' : 'text-stone-900'}`}>Dernières Commandes</h3>
                        <div className="space-y-4">
                            {recentOrders.length === 0 ? <p className="text-xs text-stone-400">Aucune commande récente.</p> : (
                                recentOrders.map(order => (
                                    <div key={order.id} className={`flex items-center gap-3 p-3 rounded-xl transition-colors ring-1 ring-inset ring-transparent ${darkMode ? 'hover:bg-stone-700 hover:ring-stone-600' : 'hover:bg-stone-50 hover:ring-stone-100'}`}>
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${darkMode ? 'bg-stone-700 text-stone-300' : 'bg-stone-100 text-stone-500'}`}>
                                            {order.shipping?.fullName?.[0] || '?'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-bold truncate ${darkMode ? 'text-white' : 'text-stone-900'}`}>{order.shipping?.fullName || 'Client'}</p>
                                            <p className="text-[10px] text-stone-400">{new Date(getMillis(order.createdAt)).toLocaleDateString()}</p>
                                        </div>
                                        <span className={`text-xs font-black ${darkMode ? 'text-white' : 'text-stone-900'}`}>{order.total}€</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* SYSTEM DIAGNOSTICS */}
                    <div className={`p-6 rounded-[2rem] shadow-sm transform-gpu backface-hidden will-change-transform overflow-hidden ${darkMode ? 'bg-stone-800 ring-1 ring-inset ring-stone-700' : 'bg-white ring-1 ring-inset ring-stone-100'} mb-6`}>
                        <h3 className={`text-sm font-black uppercase tracking-widest mb-4 ${darkMode ? 'text-white' : 'text-stone-900'}`}>Diagnostics Système</h3>
                        <p className="text-xs text-stone-400 mb-4">Vérifiez l'état des services externes (Email, Paiement, etc.).</p>

                        <button
                            onClick={async () => {
                                const confirm = window.confirm("Envoyer un email de test à l'admin ?");
                                if (!confirm) return;

                                try {
                                    alert("Envoi en cours...");
                                    const sendTestFn = httpsCallable(functions, 'sendTestEmail');
                                    const res = await sendTestFn();
                                    console.log("TEST EMAIL RESULT:", res.data);
                                    if (res.data.success) {
                                        alert("✅ Succès !\nEmail envoyé.\nRéponse SMTP: " + res.data.response);
                                    } else {
                                        alert("❌ Échec.\nErreur: " + res.data.error + "\nVoir console pour détails.");
                                    }
                                } catch (e) {
                                    console.error(e);
                                    alert("Erreur critique: " + e.message);
                                }
                            }}
                            className={`w-full py-3 border rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all shadow-sm flex items-center justify-center gap-2 ${darkMode ? 'bg-stone-700 text-stone-300 border-stone-600 hover:bg-stone-600 hover:text-white' : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100 hover:text-stone-900'}`}
                        >
                            <Mail size={14} /> Tester Email (Admin)
                        </button>
                    </div>

                    {/* DANGER ZONE */}
                    <div className={`p-6 rounded-[2rem] ring-1 ring-inset transform-gpu backface-hidden will-change-transform overflow-hidden ${darkMode ? 'bg-red-900/20 ring-red-900/40' : 'bg-red-50 ring-red-100'}`}>
                        <div className={`flex items-center gap-3 mb-4 ${darkMode ? 'text-red-400' : 'text-red-900'}`}>
                            <AlertTriangle size={20} />
                            <h3 className="text-sm font-black uppercase tracking-widest">Zone de Danger</h3>
                        </div>
                        <p className={`text-xs mb-6 leading-relaxed ${darkMode ? 'text-red-300' : 'text-red-400'}`}>
                            Gestion critique des données : Réinitialisation des interactions (likes/coms) ou purge archivée des commandes. Ces actions sont <strong>définitives</strong>.
                        </p>
                        <div className="space-y-3">
                            <button
                                onClick={handleResetClick}
                                disabled={resetting || resettingOrders}
                                className={`w-full py-4 border rounded-xl font-black uppercase text-[10px] tracking-widest transition-all shadow-sm flex items-center justify-center gap-2 ${darkMode ? 'bg-stone-800 text-red-400 border-red-800 hover:bg-red-500 hover:text-white' : 'bg-white text-red-500 border-red-100 hover:bg-red-500 hover:text-white'}`}
                            >
                                {resetting ? <RefreshCw size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                                {resetting ? 'Réinitialisation...' : 'Réinitialiser Stats'}
                            </button>

                            <button
                                onClick={handleResetOrdersClick}
                                disabled={resetting || resettingOrders || cleaning}
                                className={`w-full py-4 border rounded-xl font-black uppercase text-[10px] tracking-widest transition-all shadow-sm flex items-center justify-center gap-2 ${darkMode ? 'bg-stone-800 text-red-400 border-red-800 hover:bg-red-500 hover:text-white' : 'bg-white text-red-500 border-red-100 hover:bg-red-500 hover:text-white'}`}
                            >
                                {resettingOrders ? <RefreshCw size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                                {resettingOrders ? 'Archivage & Purge Commandes' : 'Réinitialiser Commandes'}
                            </button>

                            <button
                                onClick={() => setIsCleaningModalOpen(true)}
                                disabled={resetting || resettingOrders || cleaning}
                                className={`w-full py-4 border rounded-xl font-black uppercase text-[10px] tracking-widest transition-all shadow-sm flex items-center justify-center gap-2 ${darkMode ? 'bg-stone-800 text-orange-400 border-orange-800 hover:bg-orange-500 hover:text-white' : 'bg-white text-orange-500 border-orange-100 hover:bg-orange-500 hover:text-white'}`}
                            >
                                {cleaning ? <RefreshCw size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                                {cleaning ? 'Nettoyage en cours...' : 'Maintenance Système (Images & Fantômes)'}
                            </button>
                        </div>

                    </div>
                </div>
            </div>

            {/* CONFIRMATION MODAL */}
            {isResetModalOpen && (
                <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200 ${darkMode ? 'bg-black/70' : 'bg-stone-900/50'}`}>
                    <div className={`rounded-[2rem] p-8 max-w-sm w-full shadow-2xl border space-y-6 text-center animate-in zoom-in-95 duration-200 ${darkMode ? 'bg-stone-800 border-stone-700' : 'bg-white border-stone-100'}`}>
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto text-red-500 ${darkMode ? 'bg-red-900/30' : 'bg-red-50'}`}>
                            <AlertTriangle size={32} />
                        </div>
                        <div>
                            <h3 className={`text-xl font-black mb-2 ${darkMode ? 'text-white' : 'text-stone-900'}`}>Êtes-vous sûr ?</h3>
                            <p className={`text-sm leading-relaxed ${darkMode ? 'text-stone-300' : 'text-stone-500'}`}>
                                Vous êtes sur le point de supprimer <span className={`font-bold ${darkMode ? 'text-white' : 'text-stone-900'}`}>définitivement</span> tous les likes, commentaires et partages du site.
                            </p>
                        </div>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={confirmReset}
                                disabled={resetting}
                                className="w-full py-4 bg-red-500 text-white rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-red-600 transition-colors shadow-lg shadow-red-200 flex items-center justify-center gap-2"
                            >
                                {resetting ? <RefreshCw size={14} className="animate-spin" /> : 'Oui, tout effacer'}
                            </button>
                            <button
                                onClick={() => setIsResetModalOpen(false)}
                                disabled={resetting}
                                className={`w-full py-4 rounded-xl font-bold uppercase text-xs tracking-widest transition-colors ${darkMode ? 'bg-stone-700 text-stone-400 hover:text-stone-200' : 'bg-white text-stone-400 hover:text-stone-600'}`}
                            >
                                Annuler
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* ORDER RESET CONFIRMATION MODAL */}
            {isOrderResetModalOpen && (
                <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200 ${darkMode ? 'bg-black/70' : 'bg-stone-900/50'}`}>
                    <div className={`rounded-[2rem] p-8 max-w-sm w-full shadow-2xl border space-y-6 text-center animate-in zoom-in-95 duration-200 ${darkMode ? 'bg-stone-800 border-stone-700' : 'bg-white border-stone-100'}`}>
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto text-red-500 ${darkMode ? 'bg-red-900/30' : 'bg-red-50'}`}>
                            <AlertTriangle size={32} />
                        </div>
                        <div>
                            <h3 className={`text-xl font-black mb-2 ${darkMode ? 'text-white' : 'text-stone-900'}`}>Purge des Commandes</h3>
                            <p className={`text-sm leading-relaxed ${darkMode ? 'text-stone-300' : 'text-stone-500'}`}>
                                Cette action va <span className={`font-bold ${darkMode ? 'text-white' : 'text-stone-900'}`}>EXPORTER</span> toutes les commandes en Excel, puis les <span className={`font-bold ${darkMode ? 'text-white' : 'text-stone-900'}`}>SUPPRIMER</span> définitivement de la base.
                            </p>
                        </div>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={confirmResetOrders}
                                disabled={resettingOrders}
                                className="w-full py-4 bg-red-500 text-white rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-red-600 transition-colors shadow-lg shadow-red-200 flex items-center justify-center gap-2"
                            >
                                {resettingOrders ? <RefreshCw size={14} className="animate-spin" /> : 'Exporter & Tout Effacer'}
                            </button>
                            <button
                                onClick={() => setIsOrderResetModalOpen(false)}
                                disabled={resettingOrders}
                                className={`w-full py-4 rounded-xl font-bold uppercase text-xs tracking-widest transition-colors ${darkMode ? 'bg-stone-700 text-stone-400 hover:text-stone-200' : 'bg-white text-stone-400 hover:text-stone-600'}`}
                            >
                                Annuler
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* GARBAGE COLLECTOR CONFIRMATION MODAL */}
            {isCleaningModalOpen && (
                <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200 ${darkMode ? 'bg-black/70' : 'bg-stone-900/50'}`}>
                    <div className={`rounded-[2rem] p-8 max-w-sm w-full shadow-2xl border space-y-6 text-center animate-in zoom-in-95 duration-200 ${darkMode ? 'bg-stone-800 border-stone-700' : 'bg-white border-stone-100'}`}>
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto text-orange-500 ${darkMode ? 'bg-orange-900/30' : 'bg-orange-50'}`}>
                            <RefreshCw size={32} />
                        </div>
                        <div>
                            <h3 className={`text-xl font-black mb-2 ${darkMode ? 'text-white' : 'text-stone-900'}`}>Maintenance Système</h3>
                            <p className={`text-sm leading-relaxed ${darkMode ? 'text-stone-300' : 'text-stone-500'}`}>
                                Ce script va scanner le système pour :<br />
                                1. Supprimer les documents fantômes (produits mal supprimés).<br />
                                2. Supprimer les <span className="font-bold">images orphelines</span> du stockage.<br />
                                <span className="text-[10px] uppercase opacity-60 mt-2 block">Durée estimée : 10-30 secondes</span>
                            </p>
                        </div>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={confirmCleaning}
                                disabled={cleaning}
                                className="w-full py-4 bg-orange-500 text-white rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-orange-600 transition-colors shadow-lg shadow-orange-200 flex items-center justify-center gap-2"
                            >
                                {cleaning ? <RefreshCw size={14} className="animate-spin" /> : 'Lancer le Nettoyage'}
                            </button>
                            <button
                                onClick={() => setIsCleaningModalOpen(false)}
                                disabled={cleaning}
                                className={`w-full py-4 rounded-xl font-bold uppercase text-xs tracking-widest transition-colors ${darkMode ? 'bg-stone-700 text-stone-400 hover:text-stone-200' : 'bg-white text-stone-400 hover:text-stone-600'}`}
                            >
                                Annuler
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

// Sub-component for KPI
const KpiCard = ({ title, value, icon, trend, trendColor = "text-stone-400", bg = "bg-white", darkMode = false }) => (
    <div className={`p-6 rounded-[2rem] shadow-sm transition-all duration-300 hover:scale-[1.02] transform-gpu backface-hidden will-change-transform overflow-hidden ${darkMode ? 'bg-stone-800 ring-1 ring-inset ring-stone-700' : (bg.includes('white') ? 'ring-1 ring-inset ring-stone-100 bg-white' : bg)}`}>
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-2xl shadow-sm ring-1 ring-inset ${darkMode ? 'bg-stone-700 ring-stone-600' : 'bg-white ring-stone-100/50'}`}>{icon}</div>
        </div>
        <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1">{title}</p>
            <h4 className={`text-3xl font-black tracking-tighter mb-2 ${darkMode ? 'text-white' : 'text-stone-900'}`}>{value}</h4>
            <p className={`text-[10px] font-bold ${trendColor}`}>{trend}</p>
        </div>
    </div>
);

export default AdminDashboard;
