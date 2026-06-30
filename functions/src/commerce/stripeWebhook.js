/**
 * COMMERCE: Stripe webhook.
 *
 * The endpoint requires Stripe signature verification. Stock changes are always
 * prepared with all Firestore reads first, then all writes, to keep multi-item
 * transactions valid.
 */
const functions = require('firebase-functions/v1');
const admin = require('firebase-admin');
const { STRIPE_SECRET_KEY, STRIPE_WH_SECRET } = require('../../helpers/secrets');
const { APP_ID } = require('../../helpers/config');

const db = admin.firestore();
const Stripe = require('stripe');

const getItemIdentity = (item = {}) => ({
    itemId: item.id || item.originalId,
    col: item.collectionName || item.collection || 'furniture',
    quantity: item.quantity || 1
});

const prepareStockDecrements = async (transaction, items = [], userId) => {
    const decrements = [];

    for (const item of items) {
        const { itemId, col, quantity } = getItemIdentity(item);
        if (!itemId) {
            console.warn('Stripe webhook item missing Firestore id:', item.name);
            continue;
        }

        const itemRef = db.doc(`artifacts/${APP_ID}/public/data/${col}/${itemId}`);
        const itemDoc = await transaction.get(itemRef);
        if (!itemDoc.exists) {
            console.warn('Stripe webhook item not found:', itemId);
            continue;
        }

        const currentStock = itemDoc.data().stock !== undefined ? Number(itemDoc.data().stock) : 1;
        const isUniqueFurniture = col === 'furniture';
        const newStock = isUniqueFurniture ? 0 : Math.max(0, currentStock - quantity);
        const updates = { stock: newStock, buyerId: userId };

        if (isUniqueFurniture || newStock === 0) {
            updates.sold = true;
            updates.soldAt = admin.firestore.FieldValue.serverTimestamp();
        }

        decrements.push({ itemRef, updates });
    }

    return decrements;
};

const prepareStockRestorations = async (transaction, items = []) => {
    const restorations = [];

    for (const item of items) {
        const { itemId, col, quantity } = getItemIdentity(item);
        if (!itemId) continue;

        const itemRef = db.doc(`artifacts/${APP_ID}/public/data/${col}/${itemId}`);
        const itemDoc = await transaction.get(itemRef);
        if (!itemDoc.exists) continue;

        const currentStock = itemDoc.data().stock !== undefined ? Number(itemDoc.data().stock) : 0;
        const restoredStock = col === 'furniture' ? 1 : currentStock + quantity;
        restorations.push({
            itemRef,
            updates: {
                stock: restoredStock,
                sold: false,
                soldAt: admin.firestore.FieldValue.delete(),
                buyerId: admin.firestore.FieldValue.delete()
            }
        });
    }

    return restorations;
};

const restoreReservedOrderStock = async (orderRef, order, statusUpdates) => {
    await db.runTransaction(async (transaction) => {
        const restorations = await prepareStockRestorations(transaction, order.items || []);

        for (const restoration of restorations) {
            transaction.update(restoration.itemRef, restoration.updates);
        }

        transaction.update(orderRef, {
            ...statusUpdates,
            stockReserved: false
        });
    });
};

exports.stripeWebhook = functions.runWith({ secrets: [STRIPE_SECRET_KEY, STRIPE_WH_SECRET] }).https.onRequest(async (req, res) => {
    const stripe = Stripe(STRIPE_SECRET_KEY.value());
    const sig = req.headers['stripe-signature'];
    const endpointSecret = STRIPE_WH_SECRET.value();

    if (!endpointSecret) {
        console.error('STRIPE_WH_SECRET not configured. Rejecting webhook.');
        return res.status(500).send('Webhook secret not configured');
    }

    let event;
    try {
        if (!sig) {
            console.error('Missing Stripe signature. Blocking unsigned webhook.');
            return res.status(400).send('Missing signature');
        }
        event = stripe.webhooks.constructEvent(req.rawBody || req.body, sig, endpointSecret);
    } catch (error) {
        console.error(`Webhook security error: ${error.message}`);
        return res.status(400).send(`Webhook Error: ${error.message}`);
    }

    if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        const orderId = paymentIntent.metadata?.orderId;
        const userId = paymentIntent.metadata?.userId;

        if (!orderId) {
            console.warn('PaymentIntent without orderId metadata:', paymentIntent.id);
            return res.json({ received: true });
        }

        try {
            const orderRef = db.collection('orders').doc(orderId);
            const orderSnap = await orderRef.get();
            if (!orderSnap.exists) {
                console.error('Order not found for PaymentIntent:', orderId);
                return res.json({ received: true });
            }

            const order = orderSnap.data();
            if (order.status === 'paid') {
                console.log('Order already paid, skipping webhook:', orderId);
                return res.json({ received: true });
            }

            await db.runTransaction(async (transaction) => {
                if (!order.stockReserved) {
                    const decrements = await prepareStockDecrements(transaction, order.items || [], userId);
                    for (const decrement of decrements) {
                        transaction.update(decrement.itemRef, decrement.updates);
                    }
                }

                transaction.update(orderRef, {
                    status: 'paid',
                    paidAt: admin.firestore.FieldValue.serverTimestamp(),
                    stripePaymentIntentId: paymentIntent.id,
                    paymentMethod: 'stripe'
                });
            });

            console.log('Order marked paid:', orderId);
        } catch (error) {
            console.error('CRITICAL Webhook Error payment_intent.succeeded:', error);
        }
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const userId = session.metadata?.userId;
        const shippingMeta = session.metadata?.shippingMeta ? JSON.parse(session.metadata.shippingMeta) : {};
        const total = session.amount_total / 100;

        try {
            const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
                expand: ['data.price.product']
            });

            const items = lineItems.data.map((lineItem) => {
                const product = lineItem.price.product;
                return {
                    id: product.metadata?.id || product.metadata?.firestoreId || null,
                    collectionName: product.metadata?.collection || product.metadata?.collectionName || 'furniture',
                    name: product.name,
                    price: lineItem.amount_total / 100,
                    quantity: lineItem.quantity,
                };
            });

            const orderRef = db.collection('orders').doc();
            const orderData = {
                userId,
                userEmail: session.customer_details?.email || session.customer_email,
                items,
                total,
                shipping: shippingMeta,
                paymentMethod: 'stripe',
                stripeSessionId: session.id,
                status: 'paid',
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            };

            await db.runTransaction(async (transaction) => {
                const decrements = await prepareStockDecrements(transaction, items, userId);
                for (const decrement of decrements) {
                    transaction.update(decrement.itemRef, decrement.updates);
                }
                transaction.set(orderRef, orderData);
            });

            console.log('Stripe Checkout order created:', orderRef.id);
        } catch (error) {
            console.error('CRITICAL Webhook Error checkout.session.completed:', error);
        }
    }

    if (event.type === 'payment_intent.payment_failed') {
        const paymentIntent = event.data.object;
        const orderId = paymentIntent.metadata?.orderId;
        console.error(
            `Payment failed for PI ${paymentIntent.id}, order ${orderId || 'N/A'}: ${paymentIntent.last_payment_error?.message || 'unknown'}`
        );

        if (orderId) {
            try {
                const orderRef = db.collection('orders').doc(orderId);
                const orderSnap = await orderRef.get();
                if (!orderSnap.exists) return res.json({ received: true });

                const order = orderSnap.data();
                const updates = {
                    status: 'payment_failed',
                    failedAt: admin.firestore.FieldValue.serverTimestamp(),
                    failureReason: paymentIntent.last_payment_error?.message || 'Payment failed'
                };

                if (order.stockReserved && order.status !== 'paid') {
                    await restoreReservedOrderStock(orderRef, order, updates);
                    console.log('Stock restored after payment failure:', orderId);
                } else {
                    await orderRef.update(updates);
                }
            } catch (error) {
                console.error('Error handling payment_intent.payment_failed:', error);
            }
        }
    }

    if (event.type === 'payment_intent.canceled') {
        const paymentIntent = event.data.object;
        const orderId = paymentIntent.metadata?.orderId;
        console.warn(`Payment canceled for PI ${paymentIntent.id}, order ${orderId || 'N/A'}`);

        if (orderId) {
            try {
                const orderRef = db.collection('orders').doc(orderId);
                const orderSnap = await orderRef.get();
                if (!orderSnap.exists) return res.json({ received: true });

                const order = orderSnap.data();
                const updates = {
                    status: 'canceled',
                    canceledAt: admin.firestore.FieldValue.serverTimestamp()
                };

                if (order.stockReserved && order.status !== 'paid') {
                    await restoreReservedOrderStock(orderRef, order, updates);
                    console.log('Stock restored after PaymentIntent cancellation:', orderId);
                } else {
                    await orderRef.update(updates);
                }
            } catch (error) {
                console.error('Error handling payment_intent.canceled:', error);
            }
        }
    }

    return res.json({ received: true });
});
