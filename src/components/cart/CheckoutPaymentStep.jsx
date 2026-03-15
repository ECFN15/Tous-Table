import React, { useState } from 'react';
import { PaymentElement, ExpressCheckoutElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Loader2, AlertCircle, Lock, ShieldCheck } from 'lucide-react';

/**
 * CheckoutPaymentStep — Placé INLINE dans la page de checkout
 * Couleurs Premium : Amber / Stone / Noir (Zéro violet)
 */
const CheckoutPaymentStep = ({ total, orderId, onPaymentSuccess, onPaymentError, darkMode = false }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const [expressCheckoutReady, setExpressCheckoutReady] = useState(false);

    const handleCardSubmit = async (e) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        setIsProcessing(true);
        setErrorMessage(null);

        try {
            const { error: submitError } = await elements.submit();
            if (submitError) {
                setErrorMessage(submitError.message);
                setIsProcessing(false);
                return;
            }

            const { error, paymentIntent } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: window.location.origin + '/?page=gallery&order_success=true',
                },
                redirect: 'if_required'
            });

            if (error) {
                setErrorMessage(error.message);
                onPaymentError?.(error.message);
                setIsProcessing(false);
            } else if (paymentIntent && paymentIntent.status === 'succeeded') {
                onPaymentSuccess?.(paymentIntent);
            }
        } catch (err) {
            setErrorMessage("Une erreur inattendue est survenue.");
            setIsProcessing(false);
        }
    };

    const handleExpressCheckoutConfirm = async () => {
        if (!stripe || !elements) return;
        setIsProcessing(true);
        setErrorMessage(null);

        try {
            const { error, paymentIntent } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: window.location.origin + '/?page=gallery&order_success=true',
                },
                redirect: 'if_required'
            });

            if (error) {
                setErrorMessage(error.message);
                onPaymentError?.(error.message);
                setIsProcessing(false);
            } else if (paymentIntent && paymentIntent.status === 'succeeded') {
                onPaymentSuccess?.(paymentIntent);
            }
        } catch (err) {
            setErrorMessage("Erreur lors du paiement express.");
            setIsProcessing(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500 mt-4">
            {/* BADGE SÉCURITÉ */}
            <div className={`flex items-center gap-3 p-4 rounded-xl ring-1 ring-inset ${darkMode ? 'bg-amber-500/5 ring-amber-500/20' : 'bg-amber-50/50 ring-amber-100'}`}>
                <div className="p-2 bg-amber-500/10 rounded-lg">
                    <ShieldCheck size={18} className="text-amber-600 dark:text-amber-500" />
                </div>
                <div>
                    <p className={`text-xs font-bold ${darkMode ? 'text-amber-400' : 'text-amber-800'}`}>Paiement 100% sécurisé</p>
                    <p className={`text-[10px] ${darkMode ? 'text-stone-500' : 'text-stone-500'}`}>Cryptage SSL 256 bits — Stripe PCI DSS</p>
                </div>
            </div>

            {/* EXPRESS CHECKOUT */}
            <div className={`rounded-xl overflow-hidden ${expressCheckoutReady ? '' : 'hidden'}`}>
                <ExpressCheckoutElement
                    onReady={() => setExpressCheckoutReady(true)}
                    onConfirm={handleExpressCheckoutConfirm}
                    options={{
                        buttonHeight: 48,
                        buttonTheme: {
                            applePay: darkMode ? 'white' : 'black',
                            googlePay: darkMode ? 'white' : 'black',
                            paypal: 'gold'
                        },
                        layout: {
                            maxColumns: 2,
                            maxRows: 2,
                            overflow: 'auto',
                        }
                    }}
                />
            </div>

            {/* SÉPARATEUR */}
            {expressCheckoutReady && (
                <div className="flex items-center gap-4 py-2">
                    <div className={`flex-1 h-px ${darkMode ? 'bg-stone-800' : 'bg-stone-200'}`} />
                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${darkMode ? 'text-stone-600' : 'text-stone-400'}`}>ou par carte</span>
                    <div className={`flex-1 h-px ${darkMode ? 'bg-stone-800' : 'bg-stone-200'}`} />
                </div>
            )}

            {/* FORMULAIRE CARTE */}
            <form onSubmit={handleCardSubmit} className="space-y-6">
                <div className={`p-4 md:p-5 rounded-2xl ring-1 ring-inset ${darkMode ? 'bg-stone-900/50 ring-stone-800' : 'bg-white ring-stone-200'}`}>
                    <PaymentElement
                        options={{
                            layout: {
                                type: 'accordion',
                                defaultCollapsed: false,
                                radios: true,
                                spacedAccordionItems: true,
                            },
                            fields: {
                                billingDetails: 'never',
                            },
                            wallets: {
                                applePay: 'never',
                                googlePay: 'never',
                            }
                        }}
                    />
                </div>

                {/* ERREUR */}
                {errorMessage && (
                    <div className={`p-4 rounded-xl flex items-start gap-3 text-sm animate-in fade-in ${darkMode ? 'bg-red-500/10 ring-1 ring-red-500/20 text-red-400' : 'bg-red-50 ring-1 ring-red-100 text-red-600'}`}>
                        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                        <div>
                            <p className="font-bold">Erreur de paiement</p>
                            <p className="mt-1 text-xs opacity-90">{errorMessage}</p>
                        </div>
                    </div>
                )}

                {/* BOUTON PAYER TOTAL */}
                <button
                    type="submit"
                    disabled={!stripe || isProcessing}
                    className={`w-full py-4 md:py-5 text-stone-900 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 disabled:cursor-not-allowed rounded-xl font-black uppercase text-[11px] md:text-xs tracking-widest transition-all active:scale-[0.98] flex items-center justify-center gap-3 shadow-xl ${darkMode ? 'shadow-amber-500/10' : 'shadow-amber-500/20'}`}
                >
                    {isProcessing ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Traitement en cours...
                        </>
                    ) : (
                        <>
                            <Lock size={16} />
                            Payer {total} €
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

export default CheckoutPaymentStep;
