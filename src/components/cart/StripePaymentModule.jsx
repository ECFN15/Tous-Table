import React, { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { CreditCard, Loader2, AlertCircle } from 'lucide-react';

const StripePaymentModule = ({ clientSecret, total, onPaymentSuccess, onPaymentError }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!stripe || !elements) return;

        setIsProcessing(true);
        setErrorMessage(null);

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                // Point de redirection en cas de succès (si nécessaire pour 3D Secure)
                return_url: window.location.origin + '/order-success',
            },
            redirect: 'if_required' // On évite la redirection si possible
        });

        if (error) {
            setErrorMessage(error.message);
            onPaymentError?.(error.message);
        } else if (paymentIntent && paymentIntent.status === 'succeeded') {
            onPaymentSuccess?.(paymentIntent);
        }

        setIsProcessing(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-indigo-500/20 rounded-lg">
                        <CreditCard className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="text-white font-medium">Paiement Sécurisé</h3>
                        <p className="text-white/40 text-xs">Cryptage SSL 256 bits par Stripe</p>
                    </div>
                </div>

                <PaymentElement 
                    options={{
                        layout: 'tabs',
                        theme: 'night',
                        variables: {
                            colorPrimary: '#818cf8',
                            colorBackground: '#1e293b',
                            colorText: '#ffffff',
                            colorDanger: '#ef4444',
                            fontFamily: 'Outfit, sans-serif',
                            spacingUnit: '4px',
                            borderRadius: '12px',
                        },
                    }}
                />

                {errorMessage && (
                    <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex gap-3 text-red-400 text-sm">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <p>{errorMessage}</p>
                    </div>
                )}
            </div>

            <button
                type="submit"
                disabled={!stripe || isProcessing}
                className="w-full py-4 px-6 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
            >
                {isProcessing ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Traitement en cours...
                    </>
                ) : (
                    <>
                        Payer {total}€
                    </>
                )}
            </button>
            
            <p className="text-center text-white/40 text-[10px] uppercase tracking-widest">
                Transaction 100% sécurisée
            </p>
        </form>
    );
};

export default StripePaymentModule;
