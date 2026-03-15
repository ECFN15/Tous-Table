import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, CreditCard, Truck, CheckCircle, ShieldCheck, AlertCircle, Landmark, Lock, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';
import { functions, db, appId } from '../firebase/config';
import { httpsCallable } from 'firebase/functions';
import { doc, onSnapshot } from 'firebase/firestore';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '../main';
import CheckoutPaymentStep from '../components/cart/CheckoutPaymentStep';

/**
 * CheckoutView — Flow Single Page Premium (Mars 2026)
 * Tout sur la même page : formulaire au-dessus, choix du paiement, et Stripe injecté en dessous.
 */
const CheckoutView = ({ cartItems, total, user, darkMode = false, onBack, onPlaceOrder }) => {
    // --- STATE ---
    const [formData, setFormData] = useState({
        fullName: user?.displayName || '',
        email: user?.email || '',
        phone: '',
        address: '',
        city: '',
        zip: '',
        country: 'France'
    });
    
    const [paymentMethod, setPaymentMethod] = useState('stripe_elements'); // 'stripe_elements' | 'deferred'
    
    // Status global : 'editing' -> 'fetching_stripe' -> 'ready_to_pay' -> 'processing_deferred'
    const [checkoutState, setCheckoutState] = useState('editing'); 
    
    const [clientSecret, setClientSecret] = useState(null);
    const [createdOrderId, setCreatedOrderId] = useState(null);
    const [unavailableItems, setUnavailableItems] = useState([]);

    // --- TEMPS RÉEL : SURVEILLANCE STOCK ---
    useEffect(() => {
        if (cartItems.length === 0) return;

        const unsubscribes = cartItems.map(item => {
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
                    setUnavailableItems(prev => [...prev, { id: item.id, name: item.name, reason: 'deleted' }]);
                }
            });
        });

        return () => unsubscribes.forEach(unsub => unsub());
    }, [cartItems]);

    // --- ON CHANGE FORM ---
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        // Si l'utilisateur modifie ses infos alors qu'il était prêt à payer, on reset l'état Stripe.
        if (checkoutState === 'ready_to_pay') {
            setCheckoutState('editing');
            // Optionnel: on détruit le clientSecret pour forcer une nouvelle création
        }
    };

    const isFormValid = useMemo(() => {
        return formData.fullName.trim() && formData.email.trim() && formData.phone.trim() &&
               formData.address.trim() && formData.city.trim() && formData.zip.trim();
    }, [formData]);

    // --- SUBMIT ACTION : FETCH STRIPE OU CONFIRM DEFERRED ---
    const handleActionClick = async () => {
        if (!isFormValid) return;
        if (unavailableItems.length > 0) {
            alert("Attention : Un article de votre panier n'est plus disponible.");
            return;
        }

        if (paymentMethod === 'stripe_elements') {
            setCheckoutState('fetching_stripe');
        } else {
            setCheckoutState('processing_deferred');
        }

        try {
            const createOrder = httpsCallable(functions, 'createOrder');
            const itemsWithCol = cartItems.map(i => ({
                ...i,
                collectionName: i.collectionName || 'furniture'
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
                if (paymentMethod === 'stripe_elements') {
                    if (result.data.clientSecret) {
                        setClientSecret(result.data.clientSecret);
                        setCreatedOrderId(result.data.orderId);
                        setCheckoutState('ready_to_pay');
                    } else {
                        throw new Error("Client secret manquant.");
                    }
                } else {
                    // Deferred: succès direct
                    await onPlaceOrder({
                        id: result.data.orderId,
                        ...formData,
                        paymentMethod,
                        total
                    });
                }
            } else {
                throw new Error("Erreur de création de commande.");
            }
        } catch (error) {
            console.error("Order error:", error);
            setCheckoutState('editing');
            let msg = "Une erreur est survenue lors de la commande.";
            if (error.message.includes('vendu')) {
                msg = "Désolé, cet article vient d'être vendu à l'instant.";
            } else if (error.message.includes('stock')) {
                msg = "Stock insuffisant pour cet article.";
            } else if (error.message) {
                msg = error.message;
            }
            alert(msg);
        }
    };

    // --- STRIPE APPEARANCE ---
    const stripeElementsOptions = useMemo(() => {
        if (!clientSecret) return null;
        return {
            clientSecret,
            appearance: {
                theme: darkMode ? 'night' : 'stripe',
                variables: {
                    colorPrimary: '#f59e0b', // amber-500
                    colorBackground: darkMode ? '#1c1917' : '#ffffff',
                    colorText: darkMode ? '#fafaf9' : '#1c1917',
                    colorDanger: '#ef4444',
                    fontFamily: 'Outfit, system-ui, sans-serif',
                    borderRadius: '12px',
                    spacingUnit: '4px',
                },
                rules: {
                    '.Input': {
                        backgroundColor: darkMode ? '#0c0a09' : '#ffffff',
                        border: darkMode ? '1px solid #292524' : '1px solid #e5e7eb',
                        boxShadow: 'none',
                    },
                    '.Input:focus': {
                        borderColor: '#f59e0b',
                        boxShadow: '0 0 0 1px #f59e0b',
                    },
                    '.Label': {
                        fontWeight: '600',
                    }
                }
            },
            locale: 'fr',
        };
    }, [clientSecret, darkMode]);


    // --- RENDU OUT OF STOCK ---
    if (unavailableItems.length > 0 && checkoutState !== 'processing_deferred' && checkoutState !== 'fetching_stripe') {
        return (
            <div className={`min-h-screen pt-12 px-6 flex items-center justify-center bg-transparent`}>
                <div className={`p-8 rounded-3xl shadow-xl max-w-md text-center space-y-6 border ${darkMode ? 'bg-stone-900 border-stone-800' : 'bg-white border-stone-100'}`}>
                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
                        <AlertCircle size={32} />
                    </div>
                    <h2 className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-stone-900'}`}>Victime de son succès</h2>
                    <p className={darkMode ? 'text-stone-400' : 'text-stone-500'}>
                        {unavailableItems.length === 1
                            ? `L'article "${unavailableItems[0].name}" vient d'être réservé par un autre passionné.`
                            : "Certains articles viennent d'être réservés."}
                    </p>
                    <button onClick={onBack} className={`w-full py-4 rounded-xl font-bold uppercase text-xs tracking-widest transition-all text-stone-900 bg-amber-500 hover:bg-amber-400`}>
                        Retourner à la boutique
                    </button>
                </div>
            </div>
        );
    }

    const inputClasses = `w-full p-3.5 md:p-4 rounded-xl ring-1 ring-inset outline-none focus:ring-2 focus:ring-amber-500 font-bold text-sm transition-all transform-gpu ${
        darkMode 
            ? 'bg-stone-900 ring-stone-800 text-white placeholder:text-stone-600 autofill-dark' 
            : 'bg-stone-50 ring-stone-200 text-stone-900 placeholder:text-stone-400 autofill-light'
    }`;
    const cardClasses = `p-5 md:p-6 rounded-3xl border shadow-sm space-y-4 ${darkMode ? 'bg-stone-900/50 border-stone-800/50' : 'bg-white border-stone-100'}`;

    return (
        <div className={`min-h-screen pt-10 px-4 md:px-6 pb-20 animate-in fade-in transition-colors duration-700 bg-transparent`}>
            <div className="max-w-[1240px] mx-auto w-full">
                {/* HEADER RETOUR */}
                <div className="mb-8 md:mb-12">
                    <button onClick={onBack} className={`flex items-center gap-2 font-bold text-[10px] md:text-xs uppercase tracking-widest transition-colors mb-6 ${darkMode ? 'text-stone-500 hover:text-white' : 'text-stone-400 hover:text-stone-900'}`}>
                        <ArrowLeft size={14} /> Retour au panier
                    </button>
                    <h2 className={`text-3xl md:text-5xl font-black tracking-tighter ${darkMode ? 'text-white' : 'text-stone-900'}`}>
                        Finaliser la commande.
                    </h2>
                </div>

                <div className="grid lg:grid-cols-[1fr_460px] gap-8 lg:gap-16 items-start">
                    
                    {/* COLONNE GAUCHE : FORMULAIRES & PAIEMENT */}
                    <div className="space-y-6 w-full">
                        
                        {/* GROUPE 1 : INFOS & ADRESSE COMBINÉS */}
                        <div className={cardClasses}>
                            <h3 className="text-[10px] md:text-xs font-black uppercase tracking-widest text-stone-400 flex items-center gap-2 mb-4">
                                <Truck size={14} /> Informations de Livraison
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                <input name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Nom complet" className={inputClasses} required />
                                <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Téléphone" className={inputClasses} required />
                            </div>
                            <input name="email" value={formData.email} onChange={handleChange} placeholder="Email" type="email" className={inputClasses} required />
                            <input name="address" value={formData.address} onChange={handleChange} placeholder="Adresse (N°, Rue)" className={inputClasses} required />
                            <div className="grid grid-cols-2 gap-3 md:gap-4">
                                <input name="zip" value={formData.zip} onChange={handleChange} placeholder="Code Postal" className={inputClasses} required />
                                <input name="city" value={formData.city} onChange={handleChange} placeholder="Ville" className={inputClasses} required />
                            </div>
                        </div>

                        {/* GROUPE 2 : CHOIX DU PAIEMENT */}
                        <div className={cardClasses}>
                            <h3 className="text-[10px] md:text-xs font-black uppercase tracking-widest text-stone-400 flex items-center gap-2 mb-4">
                                <CreditCard size={14} /> Moyen de Paiement
                            </h3>
                            
                            <div className="grid sm:grid-cols-2 gap-4">
                                {/* PAIEMENT DIRECT */}
                                <div 
                                    onClick={() => {
                                        setPaymentMethod('stripe_elements');
                                        setCheckoutState('editing'); // Reset si on change d'avis
                                    }}
                                    className={`relative group p-[1.5px] rounded-[1.125rem] overflow-hidden cursor-pointer w-full transition-all`}
                                >
                                    {/* NEON LAYER - ONLY VISIBLE IF SELECTED */}
                                    {paymentMethod === 'stripe_elements' && (
                                        <motion.div
                                            initial={{ opacity: 0, rotate: 0 }}
                                            animate={{ opacity: 1, rotate: -360 }}
                                            transition={{ 
                                                opacity: { duration: 0.3, delay: 0.1 }, 
                                                rotate: { repeat: Infinity, duration: 6, ease: "linear" } 
                                            }}
                                            className="absolute top-1/2 left-1/2 w-[300%] aspect-square -translate-x-1/2 -translate-y-1/2 z-0"
                                            style={{
                                                background: "conic-gradient(from 0deg, transparent 30%, rgba(255,255,255,0) 35%, rgba(255,255,255,1) 50%, rgba(255,255,255,0) 65%, transparent 70%)",
                                            }}
                                        />
                                    )}

                                    {/* DEFAULT BORDER FALLBACK */}
                                    {paymentMethod !== 'stripe_elements' && (
                                        <div className={`absolute inset-0 z-0 rounded-[1.125rem] border-2 transition-colors ${darkMode ? 'border-stone-800' : 'border-stone-200'}`} />
                                    )}

                                    {/* INNER CONTENT - OPAQUE MASKING (to hide the center of the wave) */}
                                    <div className={`relative z-10 w-full h-full p-4 rounded-2xl flex flex-col gap-6 transition-all ${paymentMethod === 'stripe_elements' ? (darkMode ? 'bg-stone-900' : 'bg-white') : (darkMode ? 'bg-transparent group-hover:bg-white/5' : 'bg-transparent group-hover:bg-black/5')} backdrop-blur-md`}>
                                        
                                        {/* EN-TÊTE : ICONE + TITRE */}
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center transition-colors ${paymentMethod === 'stripe_elements' ? (darkMode ? 'bg-stone-800 text-white' : 'bg-stone-900 text-white') : (darkMode ? 'bg-stone-800/50 text-stone-500' : 'bg-stone-100 text-stone-400')}`}>
                                                <Wallet size={22} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-center">
                                                    <span className={`font-black text-base ${darkMode ? 'text-white' : 'text-stone-900'}`}>Carte / Wallets</span>
                                                </div>
                                                <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mt-0.5">Rapide & Sécurisé</p>
                                            </div>
                                        </div>
                                        
                                        {/* LOGOS CARTE / WALLET (SUR LEUR PROPRE LIGNE) */}
                                        <div className="flex flex-wrap items-center gap-2">
                                            {/* VISA */}
                                            <div className={`h-7 px-2.5 flex items-center justify-center rounded-md border ${darkMode ? 'bg-white border-stone-700' : 'bg-white border-stone-200 shadow-sm'}`}>
                                                <span className="text-[11px] font-black italic text-[#1434CB] tracking-tighter">VISA</span>
                                            </div>
                                            {/* MASTERCARD */}
                                            <div className={`h-7 w-10 relative overflow-hidden flex items-center justify-center rounded-md border ${darkMode ? 'bg-white border-stone-700' : 'bg-white border-stone-200 shadow-sm'}`}>
                                                <div className="w-4 h-4 rounded-full bg-[#EB001B] mix-blend-multiply absolute -translate-x-1.5" />
                                                <div className="w-4 h-4 rounded-full bg-[#F79E1B] mix-blend-multiply absolute justify-center translate-x-1.5" />
                                            </div>
                                            {/* APPLE PAY */}
                                            <div className={`h-7 px-2.5 flex items-center justify-center rounded-md border ${darkMode ? 'bg-stone-800 border-stone-700 text-white' : 'bg-black border-black text-white'}`}>
                                                <span className="text-[10px] font-medium flex items-center gap-1.5"><svg viewBox="0 0 384 512" className="w-3 h-3 fill-current" xmlns="http://www.w3.org/2000/svg"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg> Pay</span>
                                            </div>
                                            {/* GOOGLE PAY */}
                                            <div className={`h-7 px-2.5 flex items-center justify-center rounded-md border ${darkMode ? 'bg-white border-stone-700' : 'bg-white border-stone-200 shadow-sm'}`}>
                                                <span className="text-[10px] font-medium text-stone-700 flex items-center gap-1.5"><svg viewBox="0 0 488 512" className="w-3 h-3 fill-current text-[#4285F4]" xmlns="http://www.w3.org/2000/svg"><path d="M488 261.8C488 240.8 486.1 221.1 482.6 202H248v118.9h135.2c-5.8 38.6-28.9 71.3-61.6 93.1v77.5h99.6c58.2-53.6 91.8-132.7 91.8-229.7z" fill="#4285F4" /><path d="M248 512c67.4 0 124.1-22.3 165.4-60.5l-99.6-77.5c-22.4 15-51 23.9-82.8 23.9-63.7 0-117.7-43.1-136.9-101.1H-5.4v79.4C44.7 475.2 138.8 512 248 512z" fill="#34A853"/><path d="M111.1 296.8c-4.9-14.6-7.7-30.2-7.7-46.3s2.8-31.7 7.7-46.3V124.8H-5.4C-18.7 151.3-26.1 181.7-26.1 213.5s7.4 62.2 20.7 88.7l116.5-5.4z" fill="#FBBC04"/><path d="M248 102.1c36.7 0 69.6 12.6 95.5 37.4l71.7-71.7C372 26.2 315.3 0 248 0 138.8 0 44.7 36.8-5.4 124.8L111.1 204c19.2-58 73.2-101.9 136.9-101.9z" fill="#EA4335"/></svg> Pay</span>
                                            </div>
                                            {/* PAYPAL */}
                                            <div className={`h-7 px-2.5 flex items-center justify-center rounded-md border ${darkMode ? 'bg-[#003087] border-[#003087]' : 'bg-[#003087] border-[#003087] shadow-sm'}`}>
                                                <span className="text-[11px] font-black italic text-white tracking-tighter">PayPal</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* VIREMENT / WERO */}
                                <div 
                                    onClick={() => {
                                        setPaymentMethod('deferred');
                                        setCheckoutState('editing');
                                    }}
                                    className={`relative group p-[1.5px] rounded-[1.125rem] overflow-hidden cursor-pointer w-full transition-all`}
                                >
                                    {/* NEON LAYER - ONLY VISIBLE IF SELECTED */}
                                    {paymentMethod === 'deferred' && (
                                        <motion.div
                                            initial={{ opacity: 0, rotate: 0 }}
                                            animate={{ opacity: 1, rotate: -360 }}
                                            transition={{ 
                                                opacity: { duration: 0.3, delay: 0.1 }, 
                                                rotate: { repeat: Infinity, duration: 6, ease: "linear" } 
                                            }}
                                            className="absolute top-1/2 left-1/2 w-[300%] aspect-square -translate-x-1/2 -translate-y-1/2 z-0"
                                            style={{
                                                background: "conic-gradient(from 0deg, transparent 30%, rgba(255,255,255,0) 35%, rgba(255,255,255,1) 50%, rgba(255,255,255,0) 65%, transparent 70%)",
                                            }}
                                        />
                                    )}

                                    {/* DEFAULT BORDER FALLBACK */}
                                    {paymentMethod !== 'deferred' && (
                                        <div className={`absolute inset-0 z-0 rounded-[1.125rem] border-2 transition-colors ${darkMode ? 'border-stone-800' : 'border-stone-200'}`} />
                                    )}

                                    {/* INNER CONTENT - OPAQUE MASKING (to hide the center of the wave) */}
                                    <div className={`relative z-10 w-full h-full p-4 rounded-2xl flex flex-col gap-6 transition-all ${paymentMethod === 'deferred' ? (darkMode ? 'bg-stone-900' : 'bg-white') : (darkMode ? 'bg-transparent group-hover:bg-white/5' : 'bg-transparent group-hover:bg-black/5')} backdrop-blur-md`}>
                                        
                                        {/* EN-TÊTE : ICONE + TITRE */}
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center transition-colors ${paymentMethod === 'deferred' ? (darkMode ? 'bg-stone-800 text-white' : 'bg-stone-900 text-white') : (darkMode ? 'bg-stone-800/50 text-stone-500' : 'bg-stone-100 text-stone-400')}`}>
                                                <Landmark size={22} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-center">
                                                    <span className={`font-black text-base ${darkMode ? 'text-white' : 'text-stone-900'}`}>Virement</span>
                                                </div>
                                                <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mt-0.5">Instructions via email</p>
                                            </div>
                                        </div>
                                        
                                        {/* LOGOS VIREMENT / WERO (SUR LEUR PROPRE LIGNE) */}
                                        <div className="flex flex-wrap items-center gap-2">
                                            {/* BANQUE TRADITIONNELLE */}
                                            <div className={`h-7 px-2.5 flex items-center gap-1.5 justify-center rounded-md border ${darkMode ? 'bg-stone-800 border-stone-700 text-stone-300' : 'bg-stone-100 border-stone-200 text-stone-600 shadow-sm'}`}>
                                                <Landmark size={12} />
                                                <span className="text-[10px] font-bold uppercase tracking-widest leading-none mt-[1px]">Virement</span>
                                            </div>
                                            {/* WERO */}
                                            <div className={`h-7 px-3 flex items-center justify-center rounded-md border overflow-hidden ${darkMode ? 'bg-[#002B5E] border-transparent text-white' : 'bg-gradient-to-tr from-[#002B5E] to-[#0A4795] border-transparent text-white shadow-sm'}`}>
                                                <span className="text-[12px] font-black lowercase tracking-tight leading-none">wero</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* BOUTON D'ACTION DÉPLACÉ DANS LA COLONNE DE DROITE */}
                        </div>

                    </div>

                    {/* COLONNE DROITE : RÉSUMÉ STICKY */}
                    <div className="relative w-full">
                        <div className="sticky top-24 space-y-6">
                            <div className={`p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden ${darkMode ? 'bg-stone-900' : 'bg-[#1a1a1a]'} text-white`}>
                                <div className="relative z-10">
                                    <h3 className="text-xl font-black mb-6 text-white">Résumé de la commande</h3>
                                    
                                    <div className="space-y-4 mb-8">
                                        {cartItems.map((item, index) => (
                                            <div key={item.id || index} className="flex justify-between items-start text-sm">
                                                <div className="flex flex-col max-w-[70%]">
                                                    <span className="text-stone-300 font-medium">{item.name}</span>
                                                    {(item.variant || item.woodType || item.size || Object.values(item.options || {}).join(', ')) && (
                                                        <span className="text-xs text-stone-500 mt-0.5">
                                                            {item.variant || item.woodType || item.size || Object.values(item.options || {}).join(', ')}
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="font-bold text-white tracking-tight">{item.price} €</span>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <div className="border-t border-stone-800 pt-6 flex justify-between items-end">
                                        <span className="text-stone-400 text-[10px] font-black uppercase tracking-widest mb-[2px]">Total à payer</span>
                                        <span className="text-4xl lg:text-5xl font-black tracking-tighter text-white">{total} €</span>
                                    </div>
                                </div>
                                {/* Éclat décoratif en haut à droite */}
                                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                            </div>
                            
                            {/* BOUTON D'ACTION */}
                            <div className="flex flex-col gap-4">
                                <button
                                    onClick={handleActionClick}
                                    disabled={!isFormValid || checkoutState === 'fetching_stripe' || checkoutState === 'processing_deferred'}
                                    className={`relative group p-[1.5px] rounded-2xl overflow-hidden w-full transition-all ${
                                        (!isFormValid || checkoutState === 'fetching_stripe' || checkoutState === 'processing_deferred')
                                            ? 'cursor-not-allowed opacity-50'
                                            : 'cursor-pointer hover:scale-[1.02] active:scale-95'
                                    }`}
                                >
                                    {/* NEON LAYER - ONLY VISIBLE IF FORM IS VALID */}
                                    {(isFormValid && checkoutState !== 'fetching_stripe' && checkoutState !== 'processing_deferred') && (
                                        <motion.div
                                            initial={{ opacity: 0, rotate: 0 }}
                                            animate={{ opacity: 1, rotate: -360 }}
                                            transition={{ 
                                                opacity: { duration: 0.3, delay: 0.1 }, 
                                                rotate: { repeat: Infinity, duration: 6, ease: "linear" } 
                                            }}
                                            className="absolute top-1/2 left-1/2 w-[300%] aspect-square -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none"
                                            style={{
                                                background: "conic-gradient(from 0deg, transparent 30%, rgba(255,255,255,0) 35%, rgba(255,255,255,1) 50%, rgba(255,255,255,0) 65%, transparent 70%)",
                                            }}
                                        />
                                    )}

                                    {/* DEFAULT BORDER FALLBACK FOR DISABLED STATE */}
                                    {(!isFormValid || checkoutState === 'fetching_stripe' || checkoutState === 'processing_deferred') && (
                                        <div className={`absolute inset-0 z-0 rounded-2xl border-2 transition-colors ${darkMode ? 'border-stone-800' : 'border-stone-200'}`} />
                                    )}

                                    {/* INNER CONTENT - OPAQUE MASKING */}
                                    <div className={`relative z-10 w-full h-full py-6 px-4 rounded-[15px] flex items-center justify-center gap-2 backdrop-blur-md transition-all ${
                                        (isFormValid && checkoutState !== 'fetching_stripe' && checkoutState !== 'processing_deferred')
                                            ? (darkMode ? 'bg-stone-900' : 'bg-[#1a1a1a]') // Opaque dark mask for the neon
                                            : (darkMode ? 'bg-stone-800' : 'bg-stone-200') // Disabled background
                                    }`}>
                                        <span className={`font-black uppercase text-sm tracking-widest ${
                                            (isFormValid && checkoutState !== 'fetching_stripe' && checkoutState !== 'processing_deferred')
                                                ? 'text-white' // Text is always white on dark masks
                                                : (darkMode ? 'text-stone-500' : 'text-stone-400')
                                        }`}>
                                            {checkoutState === 'fetching_stripe' || checkoutState === 'processing_deferred' ? (
                                                "Patientez..."
                                            ) : paymentMethod === 'stripe_elements' ? (
                                                "Procéder au paiement sécurisé"
                                            ) : (
                                                "Confirmer ma commande"
                                            )}
                                        </span>
                                    </div>
                                </button>

                                {/* TEXTE DE RÉASSURANCE POUR VIREMENT (COMME IMAGE 2) */}
                                {paymentMethod === 'deferred' && (
                                    <p className="text-center text-[10px] font-medium leading-relaxed text-stone-400 mt-2">
                                        En confirmant, vous réservez vos articles.<br />
                                        Les détails de paiement vous seront envoyés par email.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* MODAL STRIPE (POP-UP) */}
            {checkoutState === 'ready_to_pay' && clientSecret && stripeElementsOptions && paymentMethod === 'stripe_elements' && (
                <div className="fixed inset-0 z-[999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 md:p-6 animate-in fade-in duration-300">
                    <div className={`w-full max-w-lg relative p-6 md:p-8 rounded-[2rem] shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto custom-scrollbar ${darkMode ? 'bg-stone-900 ring-1 ring-stone-800' : 'bg-white ring-1 ring-stone-200'}`}>
                        <button 
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setCheckoutState('editing');
                            }}
                            className={`absolute z-50 top-4 right-4 p-2.5 rounded-full transition-colors cursor-pointer ${darkMode ? 'bg-stone-800 text-stone-400 hover:text-white' : 'bg-stone-100 text-stone-500 hover:text-stone-900'}`}
                        >
                            <svg className="w-4 h-4 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        
                        <div className="mb-6 pr-8">
                            <h3 className={`text-2xl font-black tracking-tight ${darkMode ? 'text-white' : 'text-stone-900'}`}>Paiement.</h3>
                            <p className={`text-xs mt-1 font-medium ${darkMode ? 'text-stone-400' : 'text-stone-500'}`}>Finalisez votre transaction en toute sécurité.</p>
                        </div>

                        <Elements stripe={stripePromise} options={stripeElementsOptions}>
                            <CheckoutPaymentStep
                                total={total}
                                orderId={createdOrderId}
                                darkMode={darkMode}
                                onPaymentSuccess={async (paymentIntent) => {
                                    await onPlaceOrder({
                                        id: createdOrderId,
                                        ...formData,
                                        paymentMethod: 'stripe_elements',
                                        total,
                                        paymentIntentId: paymentIntent.id
                                    });
                                }}
                                onPaymentError={(err) => {
                                    console.error("Payment error inline:", err);
                                }}
                            />
                        </Elements>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CheckoutView;
