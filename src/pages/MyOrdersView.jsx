import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, limit } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Package, Truck, XCircle, MessageCircle, ArrowLeft, Clock, CheckCircle, Download } from 'lucide-react';
import { getMillis } from '../utils/time';

const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(price);
};

const MyOrdersView = ({ user, onBack, darkMode }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        // Fetch user orders
        // Note: On enlève orderBy pour éviter l'erreur d'index manquant (requires composite index)
        // On triera côté client (JS), c'est performant pour < 100 commandes
        const q = query(
            collection(db, 'orders'),
            where('userEmail', '==', user.email)
        );

        const unsub = onSnapshot(q, (snap) => {
            const fetchedOrders = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            // Tri décroissant (Plus récent en premier)
            fetchedOrders.sort((a, b) => {
                const dateA = a.createdAt?.seconds || 0;
                const dateB = b.createdAt?.seconds || 0;
                return dateB - dateA;
            });
            setOrders(fetchedOrders);
            setLoading(false);
        }, (err) => {
            console.error("Error fetching orders:", err);
            setLoading(false);
        });

        return () => unsub();
    }, [user]);

    const handleCancelOrder = async (orderId) => {
        if (!confirm("Êtes-vous sûr de vouloir annuler cette commande ?")) return;
        try {
            await updateDoc(doc(db, 'orders', orderId), {
                status: 'cancelled_by_client',
                cancelledAt: new Date()
            });
            alert("Votre commande a été annulée. Le remboursement sera traité sous peu.");
        } catch (e) {
            console.error(e);
            alert("Erreur lors de l'annulation.");
        }
    };

    const getStatusInfo = (status) => {
        switch (status) {
            case 'completed': // Livré
                return { label: 'Livré', color: 'text-emerald-500', bg: 'bg-emerald-500', icon: <CheckCircle size={16} /> };
            case 'shipped':
                return { label: 'Expédié / En livraison', color: 'text-blue-500', bg: 'bg-blue-500', icon: <Truck size={16} /> };
            case 'cancelled_by_client':
            case 'cancelled':
                return { label: 'Annulée', color: 'text-red-500', bg: 'bg-red-500', icon: <XCircle size={16} /> };
            default: // pending_payment, paid, pending
                return { label: 'En cours de préparation', color: 'text-amber-500', bg: 'bg-amber-500', icon: <Package size={16} /> };
        }
    };

    const canCancel = (order) => {
        if (order.status === 'shipped' || order.status === 'completed' || order.status.includes('cancelled')) return false;
        // Check 7 days
        const orderDate = new Date(order.createdAt?.seconds * 1000);
        const diffDays = (new Date() - orderDate) / (1000 * 60 * 60 * 24);
        return diffDays <= 7;
    };

    if (loading) return (
        <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-stone-900 text-white' : 'bg-[#FAF9F6] text-stone-900'}`}>
            <div className="w-10 h-10 border-[3px] border-stone-200 border-t-stone-900 rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className={`min-h-screen animate-in fade-in ${darkMode ? 'bg-stone-900 text-white' : 'bg-[#FAF9F6] text-stone-900'}`}>
            <div className="max-w-4xl mx-auto px-6 py-32 space-y-12">

                {/* HEAD */}
                <div className="flex items-center gap-6">
                    <button onClick={onBack} className={`p-3 rounded-full ring-1 ring-inset transition-all ${darkMode ? 'ring-stone-700 hover:bg-stone-800' : 'ring-stone-200 hover:bg-stone-100'}`}>
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-4xl font-black tracking-tighter">Mes Commandes</h1>
                </div>

                {/* LIST */}
                <div className="space-y-6">
                    {orders.length === 0 ? (
                        <div className={`p-12 rounded-3xl ring-1 ring-inset border-dashed text-center space-y-4 ${darkMode ? 'ring-stone-800' : 'ring-stone-200'}`}>
                            <Package size={48} className="mx-auto text-stone-300" />
                            <p className="text-stone-400 font-medium">Vous n'avez pas encore passé de commande.</p>
                        </div>
                    ) : orders.map(order => {
                        const status = getStatusInfo(order.status);
                        return (
                            <div key={order.id} className={`p-6 md:p-8 rounded-[2rem] shadow-sm ring-1 ring-inset transition-all hover:shadow-md transform-gpu ${darkMode ? 'bg-stone-800 ring-stone-700' : 'bg-white ring-stone-100'}`}>

                                {/* HEADER COMMANDE */}
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b pb-6 border-stone-100 dark:border-stone-700/50">
                                    <div className="space-y-1">
                                        <p className="text-xs font-black uppercase tracking-widest opacity-40">Commande #{order.id.slice(0, 8)}</p>
                                        <p className="text-sm font-bold opacity-60">
                                            Passée le {new Date(order.createdAt?.seconds * 1000).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                        </p>
                                    </div>
                                    <div className={`flex items-center gap-3 px-4 py-2 rounded-full ring-1 ring-inset ${darkMode ? 'bg-stone-900 ring-stone-700' : 'bg-stone-50 ring-stone-200'}`}>
                                        <div className={`w-2 h-2 rounded-full ${status.bg}`}></div>
                                        <span className={`text-xs font-black uppercase tracking-widest ${status.color}`}>{status.label}</span>
                                    </div>
                                </div>

                                {/* CONTENT */}
                                <div className="grid md:grid-cols-3 gap-8">
                                    {/* ITEMS */}
                                    <div className="md:col-span-2 space-y-6">
                                        {order.items?.map((item, i) => (
                                            <div key={i} className="flex gap-6 items-start">
                                                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-stone-100 overflow-hidden flex-shrink-0 border border-stone-100 dark:border-stone-700">
                                                    {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
                                                </div>
                                                <div className="pt-2">
                                                    <p className="font-bold text-lg">{item.name}</p>
                                                    <p className="text-sm opacity-50 mt-1">{item.quantity || 1} x {formatPrice(item.price)}</p>
                                                    {item.collection && <span className="text-[10px] uppercase tracking-widest opacity-40 mt-2 block">{item.collection}</span>}
                                                </div>
                                            </div>
                                        ))}

                                        <div className="pt-2">
                                            <button
                                                onClick={() => alert("La facture sera disponible dès l'expédition de votre commande.")}
                                                className="flex items-center gap-2 px-6 py-3 ring-1 ring-inset ring-stone-200 dark:ring-stone-700 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors opacity-60 hover:opacity-100"
                                            >
                                                <Download size={14} /> Télécharger la facture
                                            </button>
                                        </div>
                                    </div>

                                    {/* ACTIONS / INFO */}
                                    <div className="flex flex-col justify-between border-l pl-0 md:pl-8 border-stone-100 dark:border-stone-700/50">
                                        <div className="space-y-2 mb-6">
                                            <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Total</p>
                                            <p className="text-3xl font-serif italic">{formatPrice(order.total)}</p>
                                        </div>

                                        <div className="space-y-3">
                                            {order.status === 'shipped' && (
                                                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex gap-3 items-start">
                                                    <Truck size={16} className="text-blue-600 mt-0.5" />
                                                    <div className="space-y-1">
                                                        <p className="text-xs font-bold text-blue-700 dark:text-blue-400">En cours de livraison</p>
                                                        <p className="text-[10px] opacity-70 leading-tight">Livraison estimée sous 7 à 14 jours.</p>
                                                    </div>
                                                </div>
                                            )}

                                            {order.status === 'completed' && (
                                                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex gap-3 items-start">
                                                    <CheckCircle size={16} className="text-emerald-600 mt-0.5" />
                                                    <div className="space-y-1">
                                                        <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Commande Livrée</p>
                                                        <p className="text-[10px] opacity-70 leading-tight">Nous espérons qu'elle vous plaira.</p>
                                                    </div>
                                                </div>
                                            )}

                                            {canCancel(order) && (
                                                <button
                                                    onClick={() => handleCancelOrder(order.id)}
                                                    className="w-full py-3 ring-1 ring-inset ring-stone-200 dark:ring-stone-700 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-colors"
                                                >
                                                    Annuler la commande
                                                </button>
                                            )}

                                            <button
                                                onClick={() => {
                                                    if (window.$crisp) window.$crisp.push(["do", "chat:open"]);
                                                }}
                                                className="w-full flex items-center justify-center gap-2 py-3 bg-stone-100 dark:bg-stone-800 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
                                            >
                                                <MessageCircle size={14} /> Contacter le vendeur
                                            </button>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default MyOrdersView;
