import React, { useState } from 'react';
import { ArrowLeft, CreditCard, Truck, CheckCircle, ShieldCheck, Mail, MapPin, Phone } from 'lucide-react';

const CheckoutView = ({ cartItems, total, user, onBack, onPlaceOrder }) => {
    const [formData, setFormData] = useState({
        fullName: user?.displayName || '',
        email: user?.email || '',
        phone: '',
        address: '',
        city: '',
        zip: '',
        country: 'France'
    });
    const [paymentMethod, setPaymentMethod] = useState('stripe'); // 'stripe' | 'deferred'
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onPlaceOrder({
                shipping: formData,
                paymentMethod,
                items: cartItems,
                total
            });
        } catch (error) {
            console.error("Order error:", error);
            alert("Erreur lors de la commande: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="min-h-screen bg-[#FAF9F6] pt-32 px-6 pb-20 animate-in fade-in duration-500">
            <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 lg:gap-24">

                {/* COLONNE GAUCHE : FORMULAIRE */}
                <div className="space-y-8">
                    <button onClick={onBack} className="flex items-center gap-2 text-stone-400 hover:text-stone-900 font-bold text-[10px] uppercase tracking-widest transition-colors">
                        <ArrowLeft size={14} /> Retour au panier
                    </button>

                    <div>
                        <h2 className="text-4xl font-black tracking-tighter text-stone-900 mb-6">Livraison & Paiement.</h2>
                        <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6">

                            {/* GROUPE 1 : CONTACT */}
                            <div className="bg-white p-8 rounded-3xl border border-stone-100 shadow-sm space-y-4">
                                <h3 className="text-xs font-black uppercase tracking-widest text-stone-400 flex items-center gap-2 mb-4"><ShieldCheck size={14} /> Coordonnées</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Nom complet" className="w-full p-4 rounded-xl bg-stone-50 border border-stone-200 font-bold text-sm outline-none focus:ring-2 ring-stone-900" required />
                                    <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Téléphone" className="w-full p-4 rounded-xl bg-stone-50 border border-stone-200 font-bold text-sm outline-none focus:ring-2 ring-stone-900" required />
                                </div>
                                <input name="email" value={formData.email} onChange={handleChange} placeholder="Email" type="email" className="w-full p-4 rounded-xl bg-stone-50 border border-stone-200 font-bold text-sm outline-none focus:ring-2 ring-stone-900" required />
                            </div>

                            {/* GROUPE 2 : ADRESSE */}
                            <div className="bg-white p-8 rounded-3xl border border-stone-100 shadow-sm space-y-4">
                                <h3 className="text-xs font-black uppercase tracking-widest text-stone-400 flex items-center gap-2 mb-4"><Truck size={14} /> Adresse de livraison</h3>
                                <input name="address" value={formData.address} onChange={handleChange} placeholder="Adresse (Rue, complément...)" className="w-full p-4 rounded-xl bg-stone-50 border border-stone-200 font-bold text-sm outline-none focus:ring-2 ring-stone-900" required />
                                <div className="grid grid-cols-2 gap-4">
                                    <input name="zip" value={formData.zip} onChange={handleChange} placeholder="Code Postal" className="w-full p-4 rounded-xl bg-stone-50 border border-stone-200 font-bold text-sm outline-none focus:ring-2 ring-stone-900" required />
                                    <input name="city" value={formData.city} onChange={handleChange} placeholder="Ville" className="w-full p-4 rounded-xl bg-stone-50 border border-stone-200 font-bold text-sm outline-none focus:ring-2 ring-stone-900" required />
                                </div>
                            </div>

                            {/* GROUPE 3 : PAIEMENT */}
                            <div className="bg-white p-8 rounded-3xl border border-stone-100 shadow-sm space-y-4">
                                <h3 className="text-xs font-black uppercase tracking-widest text-stone-400 flex items-center gap-2 mb-4"><CreditCard size={14} /> Moyen de paiement</h3>

                                <div className="grid grid-cols-1 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setPaymentMethod('stripe')}
                                        className={`p-4 rounded-xl border flex items-center justify-between transition-all ${paymentMethod === 'stripe' ? 'border-amber-500 bg-amber-50 ring-1 ring-amber-500' : 'border-stone-200 bg-stone-50 hover:bg-stone-100'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === 'stripe' ? 'border-amber-500' : 'border-stone-300'}`}>
                                                {paymentMethod === 'stripe' && <div className="w-2 h-2 rounded-full bg-amber-500"></div>}
                                            </div>
                                            <span className="font-bold text-stone-900 text-sm">Carte Bancaire (Stripe)</span>
                                        </div>
                                        <div className="flex gap-2 opacity-60">
                                            <div className="h-4 w-6 bg-stone-300 rounded"></div>
                                            <div className="h-4 w-6 bg-stone-300 rounded"></div>
                                        </div>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setPaymentMethod('deferred')}
                                        className={`p-4 rounded-xl border flex items-center justify-between transition-all ${paymentMethod === 'deferred' ? 'border-amber-500 bg-amber-50 ring-1 ring-amber-500' : 'border-stone-200 bg-stone-50 hover:bg-stone-100'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === 'deferred' ? 'border-amber-500' : 'border-stone-300'}`}>
                                                {paymentMethod === 'deferred' && <div className="w-2 h-2 rounded-full bg-amber-500"></div>}
                                            </div>
                                            <div className="text-left">
                                                <span className="font-bold text-stone-900 text-sm block">Paiement différé / manuel</span>
                                                <span className="text-[10px] text-stone-400 block mt-0.5">Virement ou chèque après validation</span>
                                            </div>
                                        </div>
                                    </button>
                                </div>
                            </div>

                        </form>
                    </div>
                </div>

                {/* COLONNE DROITE : RÉSUMÉ */}
                <div className="relative">
                    <div className="sticky top-32 space-y-6">
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
                            disabled={loading}
                            className="w-full py-6 bg-amber-500 text-white rounded-2xl font-black uppercase text-sm tracking-widest hover:bg-amber-400 shadow-xl transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                        >
                            {loading ? (
                                <>In progress...</>
                            ) : (
                                <>Confirmer la commande <CheckCircle size={18} /></>
                            )}
                        </button>
                        <p className="text-center text-[10px] text-stone-400 font-medium">
                            En confirmant, vous acceptez nos CGV. <br />
                            {paymentMethod === 'deferred' ? "Un email vous sera envoyé pour le paiement." : "Vous allez être redirigé vers Stripe."}
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default CheckoutView;
