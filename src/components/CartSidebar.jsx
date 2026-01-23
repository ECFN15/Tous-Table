import React from 'react';
import { X, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';

const CartSidebar = ({ isOpen, onClose, cartItems, onRemoveItem, totalPrice, onCheckout, interacted }) => {
    // We only want transitions AFTER the first interaction to avoid the "closing on mount" bug
    const transitionEnabled = interacted || isOpen;
    const baseTransition = transitionEnabled ? 'duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]' : 'duration-0';

    return (
        <div className={`fixed inset-0 z-[120] ${transitionEnabled ? 'transition-all' : ''} ${isOpen ? 'visible' : 'invisible pointer-events-none'} ${baseTransition}`}>
            {/* Backdrop */}
            <div
                className={`absolute inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity ${baseTransition} ${isOpen ? 'opacity-100' : 'opacity-0'}`}
                onClick={onClose}
            ></div>

            {/* Sidebar Panel */}
            <div
                className={`absolute right-0 top-0 bottom-0 w-full md:w-[500px] bg-[#FAF9F6] shadow-2xl transition-transform ${baseTransition} transform-gpu p-8 flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >

                {/* Header */}
                <div className="flex justify-between items-center mb-10 border-b border-stone-200 pb-6">
                    <div className="flex items-center gap-3">
                        <ShoppingBag size={24} className="text-stone-900" />
                        <h2 className="text-2xl font-black tracking-tight text-stone-900">Votre Panier</h2>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-full bg-white border border-stone-200 flex items-center justify-center hover:bg-stone-900 hover:text-white transition-colors">
                        <X size={18} />
                    </button>
                </div>

                {/* Cart Items List */}
                <div className="flex-1 overflow-y-auto space-y-6 pr-2 scrollbar-thin scrollbar-thumb-stone-200">
                    {cartItems.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-stone-400 gap-4 opacity-60">
                            <ShoppingBag size={48} strokeWidth={1} />
                            <p className="font-serif italic text-lg">Votre panier est vide.</p>
                        </div>
                    ) : (
                        cartItems.map((item) => (
                            <div key={item.id} className="flex gap-4 p-4 bg-white rounded-2xl border border-stone-100 shadow-sm relative group animate-in slide-in-from-right-8 duration-500">
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-20 h-20 rounded-xl object-cover bg-stone-100"
                                />
                                <div className="flex-1 flex flex-col justify-center">
                                    <h3 className="font-bold text-stone-900 leading-tight">{item.name}</h3>
                                    <p className="text-xs text-stone-500 uppercase tracking-wider mt-1">{item.material}</p>
                                    <p className="text-sm font-black text-amber-600 mt-2">{item.price} €</p>
                                </div>
                                <button
                                    onClick={() => onRemoveItem(item.id)}
                                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-stone-50 flex items-center justify-center text-stone-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer / Checkout */}
                {cartItems.length > 0 && (
                    <div className="pt-8 mt-4 border-t border-stone-200 space-y-6">
                        <div className="flex justify-between items-end">
                            <span className="text-stone-400 text-xs font-black uppercase tracking-widest">Total Estimé</span>
                            <span className="text-4xl font-black text-stone-900 tracking-tighter">{totalPrice} €</span>
                        </div>
                        <button
                            onClick={onCheckout}
                            className="w-full py-5 bg-stone-900 text-white rounded-xl font-black uppercase text-xs tracking-[0.2em] hover:bg-amber-600 transition-colors flex items-center justify-center gap-3 shadow-xl group"
                        >
                            Commander <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                        <p className="text-[9px] text-center text-stone-400 uppercase tracking-widest">Paiement sécurisé & Livraison soignée</p>
                    </div>
                )}

            </div>
        </div>
    );
};

export default CartSidebar;
