import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Package, Clock, CheckCircle, Trash2, Mail, ChevronDown, ChevronUp } from 'lucide-react';

const AdminOrders = ({ darkMode = false }) => {
    const [orders, setOrders] = useState([]);
    const [expandedOrder, setExpandedOrder] = useState(null);

    useEffect(() => {
        // Listen to orders directly form Firestore
        const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
        const unsub = onSnapshot(q, (snap) => {
            setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });
        return () => unsub();
    }, []);

    const toggleStatus = async (order) => {
        const newStatus = order.status === 'pending_payment' ? 'completed' : 'pending_payment';
        await updateDoc(doc(db, 'orders', order.id), { status: newStatus });
    };

    const handleDelete = async (orderId) => {
        if (confirm('Voulez-vous vraiment supprimer cette commande ?')) {
            await deleteDoc(doc(db, 'orders', orderId));
        }
    };

    const formatPrice = (price) => `${price} €`;
    const formatDate = (timestamp) => {
        if (!timestamp) return '-';
        return new Date(timestamp.seconds * 1000).toLocaleString('fr-FR');
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className={`text-2xl font-black tracking-tighter ${darkMode ? 'text-white' : 'text-stone-900'}`}>Commandes ({orders.length})</h2>
                <div className="flex gap-2 text-xs font-bold uppercase tracking-widest text-stone-400">
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500"></div> En cours</span>
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Terminées</span>
                </div>
            </div>

            <div className={`grid gap-4 pr-2 overflow-y-auto scrollbar-thin ${darkMode ? 'scrollbar-thumb-stone-700 scrollbar-track-stone-900/20' : 'scrollbar-thumb-stone-200 scrollbar-track-stone-50'} max-h-[750px] custom-scrollbar`}>
                {orders.map(order => (
                    <div key={order.id} className={`border rounded-3xl shadow-sm overflow-hidden hover:shadow-md transition-shadow ${darkMode ? 'bg-stone-800 border-stone-700' : 'bg-white border-stone-100'}`}>
                        {/* Header de la commande */}
                        <div
                            onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                            className="p-6 flex items-center justify-between cursor-pointer"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${order.status === 'completed' ? 'bg-emerald-500' : 'bg-amber-500'}`}>
                                    {order.status === 'completed' ? <CheckCircle size={18} /> : <Clock size={18} />}
                                </div>
                                <div>
                                    <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-stone-900'}`}>{order.shipping?.fullName || 'Client Inconnu'}</h3>
                                    <p className="text-xs text-stone-400 font-medium uppercase tracking-widest">{formatDate(order.createdAt)} • {formatPrice(order.total)}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${order.status === 'completed' ? (darkMode ? 'bg-emerald-900/40 text-emerald-400' : 'bg-emerald-50 text-emerald-600') : (darkMode ? 'bg-amber-900/40 text-amber-400' : 'bg-amber-50 text-amber-600')}`}>
                                    {order.status === 'completed' ? 'Traitée' : 'En attente'}
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
                                            <p><strong className={darkMode ? 'text-stone-200' : 'text-stone-900'}>Email:</strong> {order.shipping?.email}</p>
                                            <p><strong className={darkMode ? 'text-stone-200' : 'text-stone-900'}>Tél:</strong> {order.shipping?.phone}</p>
                                            <p><strong className={darkMode ? 'text-stone-200' : 'text-stone-900'}>Adresse:</strong> {order.shipping?.address}, {order.shipping?.zip} {order.shipping?.city}</p>
                                            <p><strong className={darkMode ? 'text-stone-200' : 'text-stone-900'}>Paiement:</strong> {order.paymentMethod === 'deferred' ? 'Différé (Virement/Chèque)' : 'Stripe'}</p>
                                        </div>

                                        <div className="flex gap-2 pt-2">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); toggleStatus(order); }}
                                                className={`flex-1 py-3 rounded-xl font-bold text-xs transition-colors ${darkMode ? 'bg-white text-stone-900 hover:bg-stone-200' : 'bg-stone-900 text-white hover:bg-stone-800'}`}
                                            >
                                                {order.status === 'completed' ? 'Marquer comme Solder' : 'Valider la commande'}
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDelete(order.id); }}
                                                className={`px-4 py-3 rounded-xl transition-colors ${darkMode ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50' : 'bg-red-50 text-red-500 hover:bg-red-100'}`}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        )}

                    </div>
                ))}

                {orders.length === 0 && (
                    <div className={`text-center py-20 rounded-3xl border border-dashed ${darkMode ? 'bg-stone-800/50 border-stone-700' : 'bg-white border-stone-100'}`}>
                        <p className="text-stone-400 font-medium">Aucune commande pour le moment.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminOrders;
