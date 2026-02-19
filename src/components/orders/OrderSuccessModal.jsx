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

                    <div className="w-full">
                        <h2 className="text-3xl font-black tracking-tighter text-stone-900 mb-2">Presque terminé !</h2>
                        <h3 className="text-lg font-bold text-stone-900 mb-6">Commande réservée.</h3>

                        <div className="bg-amber-50 border border-amber-200/50 rounded-[1.5rem] p-6 text-left space-y-4 shadow-sm">
                            <div>
                                <h4 className="text-amber-900 font-black mb-1.5 flex items-center gap-2">
                                    <ShoppingBag size={16} className="text-amber-600" />
                                    <span>Finaliser la commande</span>
                                </h4>
                                <p className="text-amber-800 text-sm leading-relaxed">
                                    Merci d'effectuer le règlement par <strong className="font-black text-amber-900">Virement</strong> ou <strong className="font-black text-amber-900">Wero</strong>.
                                </p>
                            </div>

                            <div className="bg-white rounded-xl p-4 shadow-sm border border-amber-100">
                                <p className="text-stone-600 text-sm leading-relaxed">
                                    Toutes les informations (RIB, etc.) sont disponibles dans votre <br />
                                    <strong className="text-stone-900 font-black mt-1 inline-block">Espace Client (onglet Mes Commandes)</strong>.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="px-2 pt-2">
                        <p className="text-[11px] text-stone-600 font-medium flex items-center justify-center gap-3 bg-stone-50 p-3.5 rounded-xl border border-stone-100 shadow-sm leading-relaxed text-center">
                            <span className="text-lg flex-shrink-0">💡</span>
                            <span>Un email récapitulatif avec les coordonnées bancaires vous a également été envoyé.</span>
                        </p>
                    </div>

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
