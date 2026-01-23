
import React, { useState, useEffect } from 'react';
import {
    TrendingUp, Users, Heart, MessageCircle, Share2,
    DollarSign, ShoppingBag, ArrowUpRight, AlertTriangle, RefreshCw
} from 'lucide-react';
import { collection, getDocs, writeBatch, doc, onSnapshot, query, orderBy, limit, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, appId } from '../firebase/config';
import { getMillis } from '../utils/time';

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

    const handleResetClick = () => {
        setIsResetModalOpen(true);
    };

    const confirmReset = async () => {
        setResetting(true);
        try {
            const batch = writeBatch(db);
            const furnitureSnap = await getDocs(collection(db, 'artifacts', appId, 'public', 'data', 'furniture'));
            const boardSnap = await getDocs(collection(db, 'artifacts', appId, 'public', 'data', 'cutting_boards'));

            let count = 0;
            const resetFields = { likeCount: 0, commentCount: 0, shareCount: 0 };

            // 1. Reset metrics on parent documents
            furnitureSnap.forEach(d => {
                batch.update(doc(db, 'artifacts', appId, 'public', 'data', 'furniture', d.id), resetFields);
                count++;
            });
            boardSnap.forEach(d => {
                batch.update(doc(db, 'artifacts', appId, 'public', 'data', 'cutting_boards', d.id), resetFields);
                count++;
            });

            // 2. Commit the reset of counters first
            await batch.commit();

            // 3. Delete ALL comments in sub-collections (Batched in chunks of 500 ideally, but doing simpler here for now)
            // Note: Client-side deletion of subcollections is expensive. For a unified "Reset", we must iterate them.
            const deleteCommentsForDocs = async (docs, collectionName) => {
                for (const d of docs) {
                    const commentsRef = collection(db, 'artifacts', appId, 'public', 'data', collectionName, d.id, 'comments');
                    const commentsSnap = await getDocs(commentsRef);
                    const deleteBatch = writeBatch(db);
                    let deleteCount = 0;
                    commentsSnap.forEach(c => {
                        deleteBatch.delete(c.ref);
                        deleteCount++;
                    });
                    if (deleteCount > 0) await deleteBatch.commit();
                }
            };

            await deleteCommentsForDocs(furnitureSnap.docs, 'furniture');
            await deleteCommentsForDocs(boardSnap.docs, 'cutting_boards');

            // 4. Force clear LOCAL STORAGE for the Admin (helps visualize the reset immediately)
            localStorage.removeItem('tat_liked_items_v2');
            localStorage.removeItem('tat_shared_items_v2');

            // 5. [NEW] Set Global Reset Signal for all other users
            // This writes a timestamp that other clients will check to know if they should wipe their local cache
            // 5. [NEW] Set Global Reset Signal for all other users
            // This writes a timestamp that other clients will check to know if they should wipe their local cache
            await setDoc(doc(db, 'sys_metadata', 'stats_reset'), {
                lastStatsReset: serverTimestamp(),
                resetBy: user?.email || 'admin'
            }, { merge: true });

            // Update local state to reflect zero
            setStats(prev => ({ ...prev, totalLikes: 0, totalComments: 0, totalShares: 0 }));
            setTrendingItems([]); // No more trending if all 0

            setIsResetModalOpen(false);
            alert(`Succès ! ${count} articles ont été réinitialisés.`);
        } catch (error) {
            console.error("Reset error:", error);
            alert("Erreur lors de la réinitialisation :" + error.message);
        } finally {
            setResetting(false);
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
                    bg="bg-emerald-50/50 border-emerald-100"
                    darkMode={darkMode}
                />
                <KpiCard
                    title="Engagement Total"
                    value={stats.totalLikes + stats.totalComments + stats.totalShares}
                    icon={<TrendingUp size={20} className="text-amber-500" />}
                    trend={`${stats.totalLikes} Likes • ${stats.totalComments} Coms`}
                    bg="bg-amber-50/50 border-amber-100"
                    darkMode={darkMode}
                />
                <KpiCard
                    title="Commandes"
                    value={stats.totalOrders}
                    icon={<ShoppingBag size={20} className="text-blue-500" />}
                    trend="Total cumulé"
                    bg="bg-blue-50/50 border-blue-100"
                    darkMode={darkMode}
                />
                <KpiCard
                    title="Partages"
                    value={stats.totalShares}
                    icon={<Share2 size={20} className="text-purple-500" />}
                    trend="Viralité"
                    bg="bg-purple-50/50 border-purple-100"
                    darkMode={darkMode}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* TOP TRENDING (Bar Chart styled) */}
                <div className={`lg:col-span-2 p-8 rounded-[2.5rem] border shadow-sm ${darkMode ? 'bg-stone-800 border-stone-700' : 'bg-white border-stone-100'}`}>
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
                    <div className={`p-6 rounded-[2rem] border shadow-sm ${darkMode ? 'bg-stone-800 border-stone-700' : 'bg-white border-stone-100'}`}>
                        <h3 className={`text-sm font-black uppercase tracking-widest mb-4 ${darkMode ? 'text-white' : 'text-stone-900'}`}>Dernières Commandes</h3>
                        <div className="space-y-4">
                            {recentOrders.length === 0 ? <p className="text-xs text-stone-400">Aucune commande récente.</p> : (
                                recentOrders.map(order => (
                                    <div key={order.id} className={`flex items-center gap-3 p-3 rounded-xl transition-colors border border-transparent ${darkMode ? 'hover:bg-stone-700 hover:border-stone-600' : 'hover:bg-stone-50 hover:border-stone-100'}`}>
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

                    {/* DANGER ZONE */}
                    <div className={`p-6 rounded-[2rem] border ${darkMode ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-100'}`}>
                        <div className={`flex items-center gap-3 mb-4 ${darkMode ? 'text-red-400' : 'text-red-900'}`}>
                            <AlertTriangle size={20} />
                            <h3 className="text-sm font-black uppercase tracking-widest">Zone de Danger</h3>
                        </div>
                        <p className={`text-xs mb-6 leading-relaxed ${darkMode ? 'text-red-300' : 'text-red-400'}`}>
                            Réinitialiser les compteurs de likes, commentaires et partages pour <strong>tous</strong> les articles. Cette action est irréversible.
                        </p>
                        <button
                            onClick={handleResetClick}
                            disabled={resetting}
                            className={`w-full py-4 border rounded-xl font-black uppercase text-[10px] tracking-widest transition-all shadow-sm flex items-center justify-center gap-2 ${darkMode ? 'bg-stone-800 text-red-400 border-red-800 hover:bg-red-500 hover:text-white' : 'bg-white text-red-500 border-red-100 hover:bg-red-500 hover:text-white'}`}
                        >
                            {resetting ? <RefreshCw size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                            {resetting ? 'Réinitialisation...' : 'Réinitialiser Stats'}
                        </button>
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
        </div>
    );
};

// Sub-component for KPI
const KpiCard = ({ title, value, icon, trend, trendColor = "text-stone-400", bg = "bg-white", darkMode = false }) => (
    <div className={`p-6 rounded-[2rem] border shadow-sm transition-transform hover:-translate-y-1 ${darkMode ? 'bg-stone-800 border-stone-700' : (bg.includes('white') ? 'border-stone-100 bg-white' : bg)}`}>
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-2xl shadow-sm border ${darkMode ? 'bg-stone-700 border-stone-600' : 'bg-white border-stone-100/50'}`}>{icon}</div>
        </div>
        <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1">{title}</p>
            <h4 className={`text-3xl font-black tracking-tighter mb-2 ${darkMode ? 'text-white' : 'text-stone-900'}`}>{value}</h4>
            <p className={`text-[10px] font-bold ${trendColor}`}>{trend}</p>
        </div>
    </div>
);

export default AdminDashboard;
