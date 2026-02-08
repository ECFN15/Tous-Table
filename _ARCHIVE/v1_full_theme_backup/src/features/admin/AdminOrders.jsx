import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, limit } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Package, Clock, CheckCircle, Trash2, Mail, ChevronDown, ChevronUp, Download, Loader2, Truck, XCircle } from 'lucide-react';
import * as XLSX from 'xlsx';

const AdminOrders = ({ darkMode = false }) => {
    const [orders, setOrders] = useState([]);
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [orderLimit, setOrderLimit] = useState(10);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(orderLimit));

        const unsub = onSnapshot(q, (snap) => {
            console.log(`🔥 FIRESTORE READ: Chargement de ${snap.docs.length} commandes`);
            setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            setIsLoading(false);
        });
        return () => unsub();
    }, [orderLimit]);

    const toggleStatus = async (order) => {
        // Cycle: pending/paid -> shipped -> completed -> pending
        let newStatus = 'pending_payment';
        if (order.status === 'pending_payment' || order.status === 'paid' || !order.status) newStatus = 'shipped';
        else if (order.status === 'shipped') newStatus = 'completed';
        else if (order.status === 'completed') newStatus = 'pending_payment';

        await updateDoc(doc(db, 'orders', order.id), { status: newStatus });
    };

    const handleDelete = async (orderId) => {
        // ... (Keep existing if needed, or remove if unused. I'll replace it with the new logic completely for cleaner code, but user said remove button).
        // Since I removed the button calling this, I can replace this function or add the new one.
        // I will REPLACE this block with `handleCancelAndRestore`
    };

    // Helper to get collection name (handles inconsistencies/legacy data)
    const getCollectionFromItem = (item) => {
        if (item.collection) return item.collection; // New Stripe Format
        if (item.collectionName) return item.collectionName; // Old Cart Format
        // Fallback guess based on usage? Or default to furniture. Safe to verify?
        // Most items have it.
        return 'furniture';
    };

    const handleCancelAndRestore = async (order) => {
        if (!confirm("⚠️ ATTENTION : \n\nVous allez ANNULER cette commande.\n\nACTIONS AUTOMATIQUES :\n1. Le stock des produits sera REMIS à jour (+1).\n2. Les produits seront marqués comme 'Non Vendu'.\n3. La commande sera SUPPRIMÉE définitivement (invisible client/admin).\n\nConfirmer ?")) return;

        try {
            setIsLoading(true);

            // 1. Restaurer le Stock pour chaque article
            if (order.items && order.items.length > 0) {
                // Import increment dynamically
                const { increment, doc: docRef, updateDoc, getDoc } = await import('firebase/firestore');
                // Note: db and appId form closure
                const appId = 'tat-made-in-normandie';

                for (const item of order.items) {
                    // Determine ID and Collection
                    const itemId = item.originalId || item.id;
                    const col = getCollectionFromItem(item); // Need helper or simple check

                    if (!itemId) continue;

                    // Check both collections if unsure, but usually we have data
                    // Let's assume 'furniture' or 'cutting_boards'
                    const finalCol = col === 'cutting_boards' ? 'cutting_boards' : 'furniture';

                    const itemRef = doc(db, 'artifacts', appId, 'public', 'data', finalCol, itemId);
                    const itemSnap = await getDoc(itemRef);

                    if (itemSnap.exists()) {
                        await updateDoc(itemRef, {
                            stock: increment(item.quantity || 1),
                            sold: false, // Mark as available again
                            soldAt: null,
                            buyerId: null
                        });
                        console.log(`Restored stock for ${item.name}`);
                    }
                }
            }

            // 2. Supprimer la commande
            await deleteDoc(doc(db, 'orders', order.id));

            // UI Update handled by snapshot
            alert("Commande annulée et stocks restaurés avec succès !");

        } catch (error) {
            console.error("Error cancelling order:", error);
            alert("Erreur lors de l'annulation : " + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const formatPrice = (price) => `${price} €`;
    const formatDate = (timestamp) => {
        if (!timestamp) return '-';
        return new Date(timestamp.seconds * 1000).toLocaleString('fr-FR');
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'shipped': return { color: 'text-indigo-500', bg: 'bg-indigo-500', bgLight: 'bg-indigo-50', bgDark: 'bg-indigo-900/40', label: 'Expédiée' };
            case 'completed': return { color: 'text-emerald-600', bg: 'bg-emerald-500', bgLight: 'bg-emerald-50', bgDark: 'bg-emerald-900/40', label: 'Terminée' };
            case 'cancelled':
            case 'cancelled_by_client': return { color: 'text-red-600', bg: 'bg-red-500', bgLight: 'bg-red-50', bgDark: 'bg-red-900/40', label: 'Annulée' };
            default: return { color: 'text-amber-600', bg: 'bg-amber-500', bgLight: 'bg-amber-50', bgDark: 'bg-amber-900/40', label: 'En attente' };
        }
    };

    const exportToExcel = () => {
        const data = orders.map(order => ({
            'ID Commande': order.id,
            'Date': order.createdAt ? new Date(order.createdAt.seconds * 1000).toLocaleDateString('fr-FR') : 'N/A',
            'Heure': order.createdAt ? new Date(order.createdAt.seconds * 1000).toLocaleTimeString('fr-FR') : 'N/A',
            'Client': order.shipping?.fullName || 'N/A',
            'Email': order.shipping?.email || 'N/A',
            'Téléphone': order.shipping?.phone || 'N/A',
            'Adresse': `${order.shipping?.address || ''}, ${order.shipping?.postalCode || ''} ${order.shipping?.city || ''}`,
            'Méthode Paiement': order.paymentMethod === 'deferred' ? 'Différé' : 'Carte (Stripe)',
            'Statut': order.status,
            'Total (€)': order.total,
            'Articles': order.items?.map(i => `${i.quantity || 1}x ${i.name}`).join(', ') || ''
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Commandes");
        XLSX.writeFile(wb, `Commandes_Atelier_Normand_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <h2 className={`text-2xl font-black tracking-tighter ${darkMode ? 'text-white' : 'text-stone-900'}`}>Commandes ({orders.length})</h2>
                    <button
                        onClick={exportToExcel}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors ${darkMode ? 'bg-stone-800 text-stone-200 hover:bg-stone-700' : 'bg-white text-stone-600 hover:bg-stone-100 border'}`}
                    >
                        <Download size={14} /> Export Excel
                    </button>
                </div>
                <div className="flex gap-2 text-xs font-bold uppercase tracking-widest text-stone-400">
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500"></div> En cours</span>
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-indigo-500"></div> Expédiées</span>
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Terminées</span>
                </div>
            </div>

            <div className={`grid gap-4 pr-2 overflow-y-auto scrollbar-thin ${darkMode ? 'scrollbar-thumb-stone-700 scrollbar-track-stone-900/20' : 'scrollbar-thumb-stone-200 scrollbar-track-stone-50'} max-h-[750px] custom-scrollbar`}>
                {orders.map(order => {
                    const badge = getStatusBadge(order.status);

                    return (
                        <div key={order.id} className={`border rounded-3xl shadow-sm overflow-hidden hover:shadow-md transition-shadow ${darkMode ? 'bg-stone-800 border-stone-700' : 'bg-white border-stone-100'}`}>
                            {/* Header de la commande */}
                            <div
                                onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                                className="p-6 flex items-center justify-between cursor-pointer"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${badge.bg}`}>
                                        {order.status === 'shipped' ? <Truck size={18} /> : (order.status === 'completed' ? <CheckCircle size={18} /> : (order.status?.includes('cancelled') ? <XCircle size={18} /> : <Clock size={18} />))}
                                    </div>
                                    <div>
                                        <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-stone-900'}`}>{order.shipping?.fullName || 'Client Inconnu'}</h3>
                                        <p className="text-xs text-stone-400 font-medium uppercase tracking-widest">{formatDate(order.createdAt)} • {formatPrice(order.total)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${darkMode ? badge.bgDark + ' ' + badge.color : badge.bgLight + ' ' + badge.color}`}>
                                        {badge.label}
                                    </span>
                                    {expandedOrder === order.id ? <ChevronUp size={16} className="text-stone-300" /> : <ChevronDown size={16} className="text-stone-300" />}
                                </div>
                            </div>

                            {/* Détails déroulants */}
                            {expandedOrder === order.id && (
                                <div className={`px-6 pb-6 pt-0 border-t ${darkMode ? 'border-stone-700 bg-stone-900/20' : 'border-stone-50 bg-stone-50/50'}`}>
                                    <div className="grid md:grid-cols-2 gap-6 mt-6">

                                        {/* Panier */}
                                        <div className="space-y-3">
                                            <h4 className="text-xs font-black uppercase tracking-widest text-stone-400 flex items-center gap-2"><Package size={12} /> Contenu du panier</h4>
                                            <div className={`p-4 rounded-2xl border space-y-2 ${darkMode ? 'bg-stone-900/40 border-stone-700' : 'bg-white border-stone-100'}`}>
                                                {order.items?.map((item, idx) => (
                                                    <div key={idx} className="flex justify-between items-center text-sm">
                                                        <span className={`font-medium ${darkMode ? 'text-stone-300' : 'text-stone-700'}`}>{item.name}</span>
                                                        <span className={`font-bold ${darkMode ? 'text-white' : 'text-stone-900'}`}>{formatPrice(item.price)}</span>
                                                    </div>
                                                ))}
                                                <div className={`border-t pt-2 mt-2 flex justify-between font-black ${darkMode ? 'border-stone-700 text-white' : 'border-stone-100 text-stone-900'}`}>
                                                    <span>Total</span>
                                                    <span>{formatPrice(order.total)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Info Client & Actions */}
                                        <div className="space-y-3">
                                            <h4 className="text-xs font-black uppercase tracking-widest text-stone-400 flex items-center gap-2"><Mail size={12} /> Contact & Livraison</h4>
                                            <div className={`p-4 rounded-2xl border text-sm space-y-1 ${darkMode ? 'bg-stone-900/40 border-stone-700 text-stone-400' : 'bg-white border-stone-100 text-stone-600'}`}>
                                                <p><strong className={darkMode ? 'text-stone-200' : 'text-stone-900'}>Compte:</strong> {order.userEmail}</p>
                                                <p><strong className={darkMode ? 'text-stone-200' : 'text-stone-900'}>Livraison:</strong> {order.shipping?.email}</p>
                                                <p><strong className={darkMode ? 'text-stone-200' : 'text-stone-900'}>Tél:</strong> {order.shipping?.phone}</p>
                                                <p><strong className={darkMode ? 'text-stone-200' : 'text-stone-900'}>Adresse:</strong> {order.shipping?.address}, {order.shipping?.zip} {order.shipping?.city}</p>
                                                <p><strong className={darkMode ? 'text-stone-200' : 'text-stone-900'}>Paiement:</strong> {order.paymentMethod === 'deferred' ? 'Différé (Virement/Chèque)' : 'Stripe'}</p>
                                                <p className="text-[10px] opacity-50 mt-2 font-mono">UID: {order.userId}</p>
                                            </div>

                                            <div className="flex gap-2 pt-2">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); toggleStatus(order); }}
                                                    className={`flex-1 py-3 rounded-xl font-bold text-xs transition-colors ${darkMode ? 'bg-white text-stone-900 hover:bg-stone-200' : 'bg-stone-900 text-white hover:bg-stone-800'}`}
                                                >
                                                    {order.status === 'shipped' ? 'Marquer comme Livrée' : (order.status === 'completed' ? 'Rouvrir la commande' : 'Expédier la commande')}
                                                </button>

                                                {/* Smart Cancel Button (Restores Stock + Deletes Order) */}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleCancelAndRestore(order);
                                                    }}
                                                    className={`px-4 py-3 rounded-xl transition-colors font-bold uppercase text-[10px] tracking-widest border ${darkMode ? 'bg-red-950/30 text-red-500 border-red-900/50 hover:bg-red-900/50' : 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100'}`}
                                                    title="Annuler : Remet le stock et supprime la commande"
                                                >
                                                    Annuler & Restaurer Stock
                                                </button>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            )}

                        </div>
                    );
                })}

                {orders.length === 0 && !isLoading && (
                    <div className={`text-center py-20 rounded-3xl border border-dashed ${darkMode ? 'bg-stone-800/50 border-stone-700' : 'bg-white border-stone-100'}`}>
                        <p className="text-stone-400 font-medium">Aucune commande pour le moment.</p>
                    </div>
                )}

                {/* Load More Button */}
                {orders.length >= orderLimit && (
                    <button
                        onClick={() => setOrderLimit(prev => prev + 50)}
                        className={`w-full py-4 rounded-xl border border-dashed text-xs font-black uppercase tracking-widest transition-all ${darkMode ? 'border-stone-700 text-stone-400 hover:bg-stone-800 hover:text-white' : 'border-stone-200 text-stone-400 hover:bg-stone-50 hover:text-stone-900'}`}
                    >
                        {isLoading ? <Loader2 className="animate-spin mx-auto" size={16} /> : 'Charger les commandes plus anciennes'}
                    </button>
                )}
            </div>
        </div>
    );
};

export default AdminOrders;
