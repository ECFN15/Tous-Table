import React, { useState, useEffect } from 'react';
import { ArrowLeft, CreditCard, Truck, CheckCircle, ShieldCheck, AlertCircle } from 'lucide-react';
import { functions, db, appId } from '../firebase/config';
import { httpsCallable } from 'firebase/functions';
import { doc, onSnapshot } from 'firebase/firestore';

const CheckoutView = ({ cartItems, total, user, darkMode = false, onBack, onPlaceOrder }) => {
    const [formData, setFormData] = useState({
        fullName: user?.displayName || '',
        email: user?.email || '',
        phone: '',
        address: '',
        city: '',
        zip: '',
        country: 'France'
    });
    const [paymentMethod, setPaymentMethod] = useState('manual'); // 'manual' | 'deferred'
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);

    // Fake progress when loading
    useEffect(() => {
        if (loading) {
            setProgress(0);
            const interval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(interval);
                        return 90;
                    }
                    return prev + 10;
                });
            }, 300);
            return () => clearInterval(interval);
        } else {
            setProgress(100);
        }
    }, [loading]);

    // État pour les alertes temps réel
    const [unavailableItems, setUnavailableItems] = useState([]);

    // --- TEMPS RÉEL : SURVEILLANCE DU STOCK ---
    useEffect(() => {
        if (cartItems.length === 0) return;

        const unsubscribes = cartItems.map(item => {
            // Déterminer la collection (par défaut furniture si manquant, ou à adapter selon votre logique)
            // Dans votre App.jsx, les items ont souvent 'collection' ou on doit la deviner.
            // Pour être sûr, on suppose que item.originalCollection ou item.collection est passé, 
            // sinon on tente de deviner ou on écoute les deux si possible.
            // Simplification ici : on suppose 'furniture' par défaut ou on vérifie si l'item a l'info.
            const collectionName = item.collectionName || 'furniture';

            return onSnapshot(doc(db, 'artifacts', appId, 'public', 'data', collectionName, item.originalId || item.id), (docSnap) => {
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    if (data.sold) {
                        setUnavailableItems(prev => {
                            if (prev.find(i => i.id === item.id)) return prev;
                            return [...prev, { id: item.id, name: item.name }];
                        });
                    }
                } else {
                    // Item supprimé ?
                    setUnavailableItems(prev => [...prev, { id: item.id, name: item.name, reason: 'deleted' }]);
                }
            });
        });

        return () => {
            unsubscribes.forEach(unsub => unsub());
        };
    }, [cartItems]);


    const handleSubmit = async (e) => {
        e.preventDefault();

        if (unavailableItems.length > 0) {
            alert("Attention : Un article de votre panier n'est plus disponible.");
            return;
        }

        setLoading(true);

        try {
            // Appel à la Cloud Function sécurisée
            const createOrder = httpsCallable(functions, 'createOrder');

            // Préparation des items avec leur collection pour le backend
            const itemsWithCol = cartItems.map(i => ({
                ...i,
                collectionName: i.collectionName || 'furniture' // Important pour le backend
            }));

            const result = await createOrder({
                orderData: {
                    shipping: formData,
                    paymentMethod,
                    items: itemsWithCol,
                    total
                }
            });

            if (result.data.success) {
                if (result.data.url) {
                    // Redirection vers Stripe
                    window.location.href = result.data.url;
                } else {
                    // Succès direct (Paiement différé)
                    await onPlaceOrder({
                        id: result.data.orderId,
                        ...formData,
                        paymentMethod,
                        total
                    });
                }
            }

        } catch (error) {
            console.error("Order error:", error);
            // Gestion des erreurs spécifiques renvoyées par le backend
            let msg = "Une erreur est survenue lors de la commande.";
            if (error.message.includes('vendu')) {
                msg = "Désolé, cet article vient d'être vendu à l'instant.";
            } else if (error.message.includes('stock')) {
                msg = "Stock insuffisant pour cet article.";
            } else if (error.message) {
                msg = error.message;
            }
            alert(msg);
            setLoading(false); // Stop loading only on error, otherwise we wait for redirect
        }
        // Finally block removed because we want to keep loading state during redirect
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Si un item devient indisponible, on affiche une modale bloquante ou un overlay
    // IMPORTANT : On n'affiche pas cet écran si on est déjà en cours de chargement (loading), 
    // sinon l'utilisateur verrait un flash "vendu" au moment exact où il achète l'article lui-même.
    if (unavailableItems.length > 0 && !loading) {
        return (
            <div className={`min-h-screen pt-32 px-6 flex items-center justify-center ${darkMode ? 'bg-stone-900' : 'bg-[#FAF9F6]'}`}>
                <div className={`p-8 rounded-3xl shadow-xl max-w-md text-center space-y-6 border ${darkMode ? 'bg-stone-800 border-stone-700' : 'bg-white border-stone-100'}`}>
                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
                        <AlertCircle size={32} />
                    </div>
                    <h2 className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-stone-900'}`}>Oups, victime de son succès...</h2>
                    <p className={darkMode ? 'text-stone-400' : 'text-stone-500'}>
                        {unavailableItems.length === 1
                            ? `L'article "${unavailableItems[0].name}" vient tout juste d'être réservé par un autre passionné.`
                            : "Certains articles de votre panier viennent d'être réservés par d'autres passionnés."}
                    </p>
                    <p className={`text-xs ${darkMode ? 'text-stone-500' : 'text-stone-400'}`}>
                        Gardez l'œil ouvert : si la commande n'est pas finalisée dans les prochaines minutes, il sera remis en ligne ici même.
                    </p>
                    <button onClick={onBack} className={`w-full py-4 rounded-xl font-bold uppercase text-xs tracking-widest transition-all ${darkMode ? 'bg-white text-stone-900 hover:bg-stone-200' : 'bg-stone-900 text-white hover:bg-stone-800'}`}>
                        Retourner à la boutique
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen pt-28 px-6 pb-20 animate-in fade-in duration-500 ${darkMode ? 'bg-stone-900' : 'bg-[#FAF9F6]'}`}>
            <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 lg:gap-24">

                {/* COLONNE GAUCHE : FORMULAIRE */}
                <div className="space-y-4">
                    <button onClick={onBack} className={`flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest transition-colors relative z-50 ${darkMode ? 'text-stone-500 hover:text-white' : 'text-stone-400 hover:text-stone-900'}`}>
                        <ArrowLeft size={14} /> Retour au panier
                    </button>

                    <div>
                        <h2 className={`text-4xl font-black tracking-tighter mb-4 ${darkMode ? 'text-white' : 'text-stone-900'}`}>Livraison & Paiement.</h2>
                        <form id="checkout-form" onSubmit={handleSubmit} className="space-y-4">

                            {/* GROUPE 1 : CONTACT */}
                            <div className={`p-6 rounded-3xl border shadow-sm space-y-4 ${darkMode ? 'bg-stone-800 border-stone-700' : 'bg-white border-stone-100'}`}>
                                <h3 className="text-xs font-black uppercase tracking-widest text-stone-400 flex items-center gap-2 mb-4"><ShieldCheck size={14} /> Coordonnées</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Nom complet" className={`w-full p-4 rounded-xl border font-bold text-sm outline-none focus:ring-2 ring-amber-500 transition-all ${darkMode ? 'bg-stone-900 border-stone-700 text-white placeholder:text-stone-600' : 'bg-stone-50 border-stone-200 text-stone-900 placeholder:text-stone-400'}`} required />
                                    <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Téléphone" className={`w-full p-4 rounded-xl border font-bold text-sm outline-none focus:ring-2 ring-amber-500 transition-all ${darkMode ? 'bg-stone-900 border-stone-700 text-white placeholder:text-stone-600' : 'bg-stone-50 border-stone-200 text-stone-900 placeholder:text-stone-400'}`} required />
                                </div>
                                <input name="email" value={formData.email} onChange={handleChange} placeholder="Email" type="email" className={`w-full p-4 rounded-xl border font-bold text-sm outline-none focus:ring-2 ring-amber-500 transition-all ${darkMode ? 'bg-stone-900 border-stone-700 text-white placeholder:text-stone-600' : 'bg-stone-50 border-stone-200 text-stone-900 placeholder:text-stone-400'}`} required />
                            </div>

                            {/* GROUPE 2 : ADRESSE */}
                            <div className={`p-6 rounded-3xl border shadow-sm space-y-4 ${darkMode ? 'bg-stone-800 border-stone-700' : 'bg-white border-stone-100'}`}>
                                <h3 className="text-xs font-black uppercase tracking-widest text-stone-400 flex items-center gap-2 mb-4"><Truck size={14} /> Adresse de livraison</h3>
                                <input name="address" value={formData.address} onChange={handleChange} placeholder="Adresse (Rue, complément...)" className={`w-full p-4 rounded-xl border font-bold text-sm outline-none focus:ring-2 ring-amber-500 transition-all ${darkMode ? 'bg-stone-900 border-stone-700 text-white placeholder:text-stone-600' : 'bg-stone-50 border-stone-200 text-stone-900 placeholder:text-stone-400'}`} required />
                                <div className="grid grid-cols-2 gap-4">
                                    <input name="zip" value={formData.zip} onChange={handleChange} placeholder="Code Postal" className={`w-full p-4 rounded-xl border font-bold text-sm outline-none focus:ring-2 ring-amber-500 transition-all ${darkMode ? 'bg-stone-900 border-stone-700 text-white placeholder:text-stone-600' : 'bg-stone-50 border-stone-200 text-stone-900 placeholder:text-stone-400'}`} required />
                                    <input name="city" value={formData.city} onChange={handleChange} placeholder="Ville" className={`w-full p-4 rounded-xl border font-bold text-sm outline-none focus:ring-2 ring-amber-500 transition-all ${darkMode ? 'bg-stone-900 border-stone-700 text-white placeholder:text-stone-600' : 'bg-stone-50 border-stone-200 text-stone-900 placeholder:text-stone-400'}`} required />
                                </div>
                            </div>

                            {/* GROUPE 3 : PAIEMENT */}
                            <div className={`p-6 rounded-3xl border shadow-sm space-y-4 ${darkMode ? 'bg-stone-800 border-stone-700' : 'bg-white border-stone-100'}`}>
                                <h3 className="text-xs font-black uppercase tracking-widest text-stone-400 flex items-center gap-2 mb-4"><CreditCard size={14} /> Moyen de paiement</h3>

                                <div className={`p-6 rounded-2xl border-2 transition-all ${darkMode ? 'border-amber-500/50 bg-amber-500/10 ring-4 ring-amber-500/5' : 'border-amber-500 bg-amber-50/50 ring-4 ring-amber-500/10'}`}>
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
                                            <CreditCard size={24} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <span className={`font-black text-lg tracking-tight ${darkMode ? 'text-white' : 'text-stone-900'}`}>Virement ou Wero</span>
                                                <CheckCircle size={20} className="text-amber-500" />
                                            </div>
                                            <p className={`text-xs mt-1 leading-relaxed font-bold ${darkMode ? 'text-stone-400' : 'text-stone-500'}`}>
                                                Simple, sécurisé et privilégié par l'Atelier. <br />
                                                Les instructions (RIB / QR Code) vous seront présentées après confirmation.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>

                {/* COLONNE DROITE : RÉSUMÉ */}
                <div className="relative">
                    <div className="sticky top-44 space-y-6">
                        <div className="bg-stone-900 text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                            <div className="relative z-10">
                                <h3 className="text-xl font-black mb-6">Résumé de la commande</h3>
                                <div className="space-y-4 mb-8">
                                    {cartItems.map(item => (
                                        <div key={item.id} className="flex justify-between items-start text-sm">
                                            <span className="text-stone-300 max-w-[70%]">{item.name} <span className="text-stone-500 text-xs block">{item.material}</span></span>
                                            <span className="font-bold">{item.price} €</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="border-t border-white/10 pt-6 flex justify-between items-end">
                                    <span className="text-stone-400 text-xs font-black uppercase tracking-widest">Total à payer</span>
                                    <span className="text-4xl font-black tracking-tighter">{total} €</span>
                                </div>
                            </div>
                            {/* Abstract Shapes */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                        </div>

                        <button
                            type="submit"
                            form="checkout-form"
                            disabled={loading || unavailableItems.length > 0}
                            className="w-full py-6 bg-amber-500 text-white rounded-2xl font-black uppercase text-sm tracking-widest hover:bg-amber-400 shadow-xl transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                        >
                            {loading ? (
                                <>Traitement en cours...</>
                            ) : (
                                <>Confirmer ma commande <CheckCircle size={18} /></>
                            )}
                        </button>
                        <p className="text-center text-[10px] text-stone-400 font-medium px-4">
                            En confirmant, vous réservez vos articles. <br />
                            Les détails de paiement vous seront envoyés par email.
                        </p>
                    </div>
                </div>

            </div>

            {loading && (
                <div className="fixed inset-0 z-[500] bg-stone-900/80 backdrop-blur-md flex flex-col items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="bg-white p-10 rounded-[2.5rem] max-w-sm w-full shadow-2xl text-center space-y-8 animate-in zoom-in-95 duration-300">
                        <div className="w-16 h-16 border-4 border-stone-100 border-t-amber-500 rounded-full animate-spin mx-auto"></div>
                        <div>
                            <h3 className="text-xl font-black text-stone-900 mb-2">Sécurisation en cours...</h3>
                            <p className="text-sm text-stone-500 font-medium">Création de votre commande</p>
                        </div>
                        <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-amber-500 transition-all duration-300 ease-out"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CheckoutView;
