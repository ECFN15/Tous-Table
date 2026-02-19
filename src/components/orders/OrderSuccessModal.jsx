import React from 'react';
import { CheckCircle, ArrowRight, ShoppingBag } from 'lucide-react';

const OrderSuccessModal = ({ onClose }) => {
    return (
        <div className="fixed inset-0 z-[300] bg-stone-900/80 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full p-10 text-center relative overflow-hidden animate-in zoom-in-95 duration-300 slide-in-from-bottom-4">

                {/* Decorative Background */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>

                <div className="relative z-10 space-y-6">
                    <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                        <CheckCircle size={40} strokeWidth={2.5} />
                    </div>

                    <div>
                        <h2 className="text-3xl font-black tracking-tighter text-stone-900 mb-2">Presque terminé !</h2>
                        <h3 className="text-lg font-bold text-stone-900">Commande réservée.</h3>
                        <p className="text-stone-500 text-sm mt-4 leading-relaxed px-4">
                            Pour finaliser votre acquisition, merci d'effectuer le règlement par <span className="text-amber-600 font-bold">Virement</span> ou <span className="text-amber-600 font-bold">Wero</span>. <br /><br />
                            Toutes les informations de paiement sont disponibles dans votre <span className="text-stone-900 font-bold italic">Espace Client (onglet Mes Commandes)</span>.
                        </p>
                    </div>

                    <p className="text-[10px] text-stone-400 leading-relaxed italic px-8">
                        💡 Un email récapitulatif avec les coordonnées bancaires vous a également été envoyé.
                    </p>

                    <div className="pt-6">
                        <button
                            onClick={onClose}
                            className="w-full py-4 bg-stone-900 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-stone-800 shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 group"
                        >
                            <span>Retour à la boutique</span>
                            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default OrderSuccessModal;
