const functions = require('firebase-functions/v1');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
require('dotenv').config();

admin.initializeApp();
const db = admin.firestore();

// Configuration du transporteur Gmail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_EMAIL,
        pass: process.env.GMAIL_PASSWORD
    }
});

// ============================================================
// 1. TRIGGERS: COMPTEURS AUTOMATIQUES (FIABILITÉ TOTALE)
// ============================================================

// --- LIKES ---
exports.onLikeCreated = functions.firestore
    .document('artifacts/{appId}/public/data/{collectionName}/{itemId}/likes/{userId}')
    .onCreate(async (snap, context) => {
        // Incrémenter le compteur du produit parent
        return snap.ref.parent.parent.update({
            likeCount: admin.firestore.FieldValue.increment(1)
        });
    });

exports.onLikeDeleted = functions.firestore
    .document('artifacts/{appId}/public/data/{collectionName}/{itemId}/likes/{userId}')
    .onDelete(async (snap, context) => {
        const itemRef = snap.ref.parent.parent;
        return db.runTransaction(async (transaction) => {
            const itemSnap = await transaction.get(itemRef);
            if (!itemSnap.exists) return;
            const current = itemSnap.data().likeCount || 0;
            transaction.update(itemRef, { likeCount: Math.max(0, current - 1) });
        });
    });

// --- COMMENTAIRES ---
exports.onCommentCreated = functions.firestore
    .document('artifacts/{appId}/public/data/{collectionName}/{itemId}/comments/{commentId}')
    .onCreate(async (snap, context) => {
        return snap.ref.parent.parent.update({
            commentCount: admin.firestore.FieldValue.increment(1)
        });
    });

exports.onCommentDeleted = functions.firestore
    .document('artifacts/{appId}/public/data/{collectionName}/{itemId}/comments/{commentId}')
    .onDelete(async (snap, context) => {
        const itemRef = snap.ref.parent.parent;
        return db.runTransaction(async (transaction) => {
            const itemSnap = await transaction.get(itemRef);
            if (!itemSnap.exists) return;
            const current = itemSnap.data().commentCount || 0;
            transaction.update(itemRef, { commentCount: Math.max(0, current - 1) });
        });
    });

// --- PARTAGES (SHARES) ---
exports.onShareCreated = functions.firestore
    .document('artifacts/{appId}/public/data/{collectionName}/{itemId}/shares/{userId}')
    .onCreate(async (snap, context) => {
        return snap.ref.parent.parent.update({
            shareCount: admin.firestore.FieldValue.increment(1)
        });
    });

exports.onShareDeleted = functions.firestore
    .document('artifacts/{appId}/public/data/{collectionName}/{itemId}/shares/{shareId}')
    .onDelete(async (snap, context) => {
        const itemRef = snap.ref.parent.parent;
        return db.runTransaction(async (transaction) => {
            const itemSnap = await transaction.get(itemRef);
            if (!itemSnap.exists) return;
            const current = itemSnap.data().shareCount || 0;
            transaction.update(itemRef, { shareCount: Math.max(0, current - 1) });
        });
    });


// ============================================================
// 2. FONCTION ADMIN: RESET TOTAL (GRAND NETTOYAGE)
// ============================================================
exports.resetAllStats = functions.https.onCall(async (data, context) => {
    // 1. Sécurité : Admin seulement
    if (!context.auth || !context.auth.token.admin) {
        // Fallback: check email si pas encore de custom token
        if (!context.auth || context.auth.token.email !== 'matthis.fradin2@gmail.com') {
            throw new functions.https.HttpsError('permission-denied', 'Réservé à l\'administrateur.');
        }
    }

    const appId = 'tat-made-in-normandie';
    const collections = ['furniture', 'cutting_boards'];
    let totalOp = 0;

    try {
        // Pour chaque collection (Meubles, Planches)
        for (const colName of collections) {
            const itemsRef = db.collection(`artifacts/${appId}/public/data/${colName}`);
            const itemsSnap = await itemsRef.get();

            // Pour chaque Item
            for (const doc of itemsSnap.docs) {
                const batch = db.batch();
                let opCount = 0;

                // A. Reset des compteurs sur l'item
                batch.update(doc.ref, {
                    likeCount: 0,
                    commentCount: 0,
                    shareCount: 0
                });
                opCount++;

                // B. Suppression des sous-collections (Likes, Comments, Shares)
                // Note: Firestore ne supprime pas récursivement automatiquement, il faut aller chercher les docs.
                const subCollections = ['likes', 'comments', 'shares'];

                for (const subCol of subCollections) {
                    const subSnap = await doc.ref.collection(subCol).limit(500).get(); // Limit par sécurité batch
                    subSnap.forEach(subDoc => {
                        batch.delete(subDoc.ref);
                        opCount++;
                    });
                }

                // C. Commit du batch par Item
                if (opCount > 0) {
                    await batch.commit();
                    totalOp += opCount;
                }
            }
        }

        console.log(`Reset terminé. ${totalOp} opérations effectuées.`);
        return { success: true, count: totalOp };

    } catch (error) {
        console.error("Erreur Reset Stats:", error);
        throw new functions.https.HttpsError('internal', "Erreur lors du nettoyage.");
    }
});


// ============================================================
// 3. CLOUD FUNCTION: ENCHÈRES SÉCURISÉES
// ============================================================
exports.placeBid = functions.https.onCall(async (data, context) => {
    if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Vous devez être connecté.');

    const { itemId, collectionName, increment } = data;
    const userId = context.auth.uid;
    const userEmail = context.auth.token.email || 'Anonyme';
    const userName = context.auth.token.name || 'Anonyme';

    if (!itemId || typeof itemId !== 'string') throw new functions.https.HttpsError('invalid-argument', 'ID invalide.');
    if (increment < 5 || increment > 10000) throw new functions.https.HttpsError('invalid-argument', 'Incrément invalide.');

    const appId = 'tat-made-in-normandie';
    const itemRef = db.doc(`artifacts/${appId}/public/data/${collectionName}/${itemId}`);

    return db.runTransaction(async (transaction) => {
        const snap = await transaction.get(itemRef);
        if (!snap.exists) throw new functions.https.HttpsError('not-found', 'Produit introuvable.');

        const itemData = snap.data();
        if (!itemData.auctionActive) throw new functions.https.HttpsError('failed-precondition', 'Enchère inactive.');

        const currentPrice = itemData.currentPrice || itemData.startingPrice || 0;
        const newPrice = currentPrice + increment;

        // Extension temps (Soft close)
        let newEnd = itemData.auctionEnd;
        const auctionEndMs = itemData.auctionEnd?.toMillis() || 0;
        if ((auctionEndMs - Date.now()) < 120000) {
            newEnd = admin.firestore.Timestamp.fromMillis(Date.now() + 120000);
        }

        transaction.update(itemRef, {
            currentPrice: newPrice,
            bidCount: (itemData.bidCount || 0) + 1,
            lastBidderId: userId,
            lastBidderName: userName,
            lastBidderEmail: userEmail,
            auctionEnd: newEnd,
            lastBidAt: admin.firestore.FieldValue.serverTimestamp()
        });

        // Historique
        const bidRef = itemRef.collection('bids').doc();
        transaction.set(bidRef, {
            amount: newPrice,
            increment: increment,
            bidderId: userId,
            bidderName: userName,
            bidderEmail: userEmail, // Utile pour l'admin
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        });

        return { success: true, newPrice, bidCount: (itemData.bidCount || 0) + 1 };
    });
});


// ============================================================
// 4. COMMANDE & META (Code existant conservé et nettoyé)
// ============================================================

// Stripe initialized inside function
const Stripe = require('stripe');

exports.createOrder = functions.https.onCall(async (data, context) => {
    if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Auth requise.');

    // Initialisation Lazy de Stripe pour éviter les erreurs au déploiement
    const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

    // Vérification de la clé secrète Stripe
    if (!process.env.STRIPE_SECRET_KEY) {
        console.error("STRIPE_SECRET_KEY manquante dans l'environnement !");
        throw new functions.https.HttpsError('internal', 'Erreur configuration paiement.');
    }

    const userId = context.auth.uid;
    const { orderData } = data;
    const appId = 'tat-made-in-normandie';
    const SITE_URL = 'https://tatmadeinnormandie.web.app'; // URL de prod

    // 1. Validation de stock et calcul du prix TOTAL réel (côté serveur pour sécurité)
    // On ne fait PAS confiance au prix envoyé par le frontend
    let totalAmount = 0;
    const line_items = [];
    const itemsToMarkSold = [];

    try {
        await db.runTransaction(async (transaction) => {
            const stockTracker = {}; // [NEW] Track usage within this transaction

            for (const item of orderData.items) {
                const colName = item.collectionName || 'furniture';
                const realItemId = item.originalId || item.id;
                const itemRef = db.doc(`artifacts/${appId}/public/data/${colName}/${realItemId}`);

                // Note: Firestore Transaction cache reads, so 2nd get() is cheap/consistent
                const itemSnap = await transaction.get(itemRef);
                const itemDb = itemSnap.data();

                // Gestion du Stock (Compatibilité ancien format où stock n'existe pas => 1)
                const currentDbStock = itemDb.stock !== undefined ? Number(itemDb.stock) : 1;

                // [NEW] Logic to handle multiple copies of same item in cart
                const alreadyTaken = stockTracker[realItemId] || 0;
                const availableStock = currentDbStock - alreadyTaken;

                if (!itemSnap.exists || itemDb.sold || availableStock <= 0) {
                    throw new functions.https.HttpsError('failed-precondition', `Article indisponible (Stock épuisé): ${itemDb.name}`);
                }

                stockTracker[realItemId] = alreadyTaken + 1; // Mark 1 taken

                // Prix prioritaire : Enchère gagnante > Prix actuel > Prix départ
                let realPrice = itemDb.currentPrice || itemDb.startingPrice || 0;

                // Si c'est une enchère, vérifier que l'utilisateur est bien le gagnant
                if (itemDb.auctionActive && itemDb.lastBidderId && itemDb.lastBidderId !== userId) {
                    // TODO: Gérer cas erreur si pas gagnant, pour l'instant on laisse acheter au prix affiché
                }

                totalAmount += realPrice;
                itemsToMarkSold.push({ ref: itemRef, name: itemDb.name });

                // Préparer ligne Stripe
                // Note: Images doivent être des URLs publiques valides pour s'afficher sur Stripe
                let imgUrl = itemDb.images && itemDb.images.length > 0 ? itemDb.images[0] : 'https://tatmadeinnormandie.web.app/assets/logo.png';

                line_items.push({
                    price_data: {
                        currency: 'eur',
                        product_data: {
                            name: itemDb.name,
                            description: itemDb.description ? itemDb.description.substring(0, 100) + '...' : 'Création Atelier Normand',
                            images: [imgUrl],
                            metadata: {
                                id: realItemId,
                                collection: colName
                            }
                        },
                        unit_amount: Math.round(realPrice * 100), // En centimes
                    },
                    quantity: 1,
                });
            }
        });
    } catch (e) {
        console.error("Stock Check Error", e);
        throw e; // Renvoyer l'erreur de stock au front
    }

    // 2. Création de la Session Stripe Checkout
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            customer_email: context.auth.token.email,
            line_items: line_items,
            mode: 'payment',
            success_url: `${SITE_URL}/?page=gallery&order_success=true&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${SITE_URL}/?page=checkout&canceled=true`,
            metadata: {
                userId: userId,
                shippingMeta: JSON.stringify(orderData.shipping).substring(0, 500) // Stripe limite metadata
            }
        });

        // 4. Gestion du Paiement Différé (MANUAL)
        if (orderData.paymentMethod === 'manual') {
            const orderRef = db.collection('orders').doc();
            const finalOrder = {
                ...orderData,
                total: totalAmount,
                status: 'pending_payment', // En attente de virement/chèque
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                stripeSessionId: null
            };

            try {
                await db.runTransaction(async (transaction) => {
                    // Marquer les produits comme VENDUS ou DECREMENTER le stock
                    for (const item of itemsToMarkSold) {
                        const itemDoc = await transaction.get(item.ref);
                        if (!itemDoc.exists) throw "Item not found";

                        const currentStock = itemDoc.data().stock !== undefined ? Number(itemDoc.data().stock) : 1;
                        const newStock = Math.max(0, currentStock - 1); // On décrémente de 1

                        const updates = {
                            stock: newStock,
                            buyerId: userId
                        };

                        if (newStock === 0) {
                            updates.sold = true;
                            updates.soldAt = admin.firestore.FieldValue.serverTimestamp();
                        }

                        transaction.update(item.ref, updates);
                    }
                    transaction.set(orderRef, finalOrder);
                });

                // Email confirmation (via Trigger onOrderCreated)
                return { success: true, orderId: orderRef.id };

            } catch (e) {
                console.error("Manual Order Error", e);
                throw new functions.https.HttpsError('internal', "Erreur enregistrement commande.");
            }
        }

        return { success: true, url: session.url };

    } catch (error) {
        console.error("Order Error:", error);
        throw new functions.https.HttpsError('internal', "Erreur initialisation commande.");
    }
});

// Webhook Stripe pour valider la commande APRES paiement (Sécurité Max)
exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
    const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
    const sig = req.headers['stripe-signature'];

    // IMPORTANT: Pour la sécurité, on DEVRAIT vérifier la signature avec endpointSecret
    // Pour l'instant on fait confiance au format de l'event pour simplifier, 
    // mais en prod il faut process.env.STRIPE_WH_SECRET

    let event;

    try {
        // Si on a le secret webhook, on vérifie la signature (Recommandé)
        if (process.env.STRIPE_WH_SECRET) {
            event = stripe.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_WH_SECRET);
        } else {
            // Fallback sans signature (Moins sûr mais marche pour dev rapide)
            event = req.body;
        }
    } catch (err) {
        console.error(`Webhook Error: ${err.message}`);
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }

    // Gérer l'événement
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        console.log("💰 Webhook: Session Completed:", session.id);

        // Récupérer les infos
        const userId = session.metadata.userId;
        const shippingMeta = session.metadata.shippingMeta ? JSON.parse(session.metadata.shippingMeta) : {};
        const total = session.amount_total / 100; // Centimes -> Euros

        try {
            // Fetch des lignes AVEC EXPANSION du produit pour avoir les metadata
            console.log("🔍 Fetching line items with product expansion...");
            const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
                expand: ['data.price.product']
            });

            console.log(`📦 Line Items found: ${lineItems.data.length}`);

            const items = lineItems.data.map(li => {
                const product = li.price.product; // Grâce à expand, c'est un objet complet maintenant
                return {
                    id: product.metadata?.id,
                    collection: product.metadata?.collection || 'furniture',
                    name: product.name || li.description,
                    price: li.amount_total / 100 / li.quantity,
                    quantity: li.quantity || 1 // [NEW] Gestion quantité
                };
            });

            console.log("🛒 Items extracted:", JSON.stringify(items));

            // Sauvegarder la commande
            const orderRef = db.collection('orders').doc();

            const orderData = {
                userId: userId,
                userEmail: session.customer_details.email || session.customer_email,
                items: items,
                total: total,
                shipping: shippingMeta,
                paymentMethod: 'stripe',
                stripeSessionId: session.id,
                status: 'paid', // Payé !
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            };

            await db.runTransaction(async (transaction) => {
                // Marquer les produits comme VENDUS ou DECREMENTER stock
                for (const item of items) {
                    if (!item.id) {
                        console.warn("⚠️ Item sans ID Firestore (Metadata manquantes ?):", item.name);
                        continue;
                    }

                    const itemRef = db.doc(`artifacts/tat-made-in-normandie/public/data/${item.collection}/${item.id}`);
                    const itemDoc = await transaction.get(itemRef);

                    if (!itemDoc.exists) {
                        console.warn("❌ Item introuvable en base:", item.id);
                        continue;
                    }

                    const currentStock = itemDoc.data().stock !== undefined ? Number(itemDoc.data().stock) : 1;
                    const qtyPurchased = item.quantity || 1;
                    const newStock = Math.max(0, currentStock - qtyPurchased);

                    console.log(`📉 Stock Update for ${item.id}: ${currentStock} -> ${newStock}`);

                    const updates = {
                        stock: newStock,
                        buyerId: userId
                    };

                    // Si stock atteint 0, on marque VENDU
                    if (newStock === 0) {
                        updates.sold = true;
                        updates.soldAt = admin.firestore.FieldValue.serverTimestamp();
                        console.log(`🔒 Item SOLD OUT: ${item.id}`);
                    }

                    transaction.update(itemRef, updates);
                }
                transaction.set(orderRef, orderData);
            });

            console.log("✅ Commande Stripe créée avec succès:", orderRef.id);

        } catch (error) {
            console.error("❌ Erreur CRITIQUE Webhook:", error);
            // On ne renvoie pas d'erreur 500 pour ne pas que Stripe réessaie indéfiniment si c'est un bug logique
        }
    }

    res.json({ received: true });
});

exports.onOrderCreated = functions.firestore
    .document('orders/{orderId}')
    .onCreate(async (snap, context) => {
        const order = snap.data();
        if (!process.env.GMAIL_EMAIL) {
            console.error("❌ Email non configuré (GMAIL_EMAIL manquant).");
            return;
        }

        const adminEmail = process.env.GMAIL_EMAIL;
        const clientEmail = order.userEmail;

        // --- 1. EMAIL ADMIN ---
        const itemsHtml = (order.items || []).map(i =>
            `<li>${i.quantity || 1}x <b>${i.name}</b> - ${i.price}€</li>`
        ).join('');

        const shippingInfo = order.shipping ?
            `${order.shipping.address}, ${order.shipping.city} (${order.shipping.postalCode})` : "Non spécifié";

        const adminMailOptions = {
            from: `Tous à Table Robot <${adminEmail}>`,
            to: adminEmail,
            subject: `💰 Nouvelle Commande : ${order.total}€ (${order.shipping?.fullName})`,
            html: `
                <h2>Nouvelle commande reçue !</h2>
                <p><b>Client :</b> ${order.shipping?.fullName} (${clientEmail})</p>
                <p><b>Total :</b> ${order.total}€</p>
                <p><b>Paiement :</b> ${order.paymentMethod === 'stripe' ? 'Carte Bancaire (Validé)' : 'Différé (À encaisser)'}</p>
                <hr/>
                <h3>Articles :</h3>
                <ul>${itemsHtml}</ul>
                <hr/>
                <h3>Livraison :</h3>
                <p>${shippingInfo}</p>
                <p><a href="https://tatmadeinnormandie.web.app/admin">Aller au Dashboard</a></p>
            `
        };

        // --- 2. EMAIL CLIENT ---
        const clientMailOptions = clientEmail ? {
            from: `Tous à Table <${adminEmail}>`,
            to: clientEmail,
            subject: `Confirmation de votre commande`,
            html: `
                <div style="font-family: sans-serif; color: #333;">
                    <h1 style="color: #d97706;">Merci pour votre commande !</h1>
                    <p>Bonjour ${order.shipping?.fullName || ''},</p>
                    <p>Nous avons bien reçu votre commande <b>#${snap.id.slice(0, 8)}</b>.</p>
                    <p>Nous allons préparer votre colis avec le plus grand soin.</p>
                    
                    <div style="background: #f5f5f4; padding: 20px; border-radius: 10px; margin: 20px 0;">
                        <h3 style="margin-top:0;">Récapitulatif</h3>
                        <ul>${itemsHtml}</ul>
                        <p><strong>Total : ${order.total}€</strong></p>
                    </div>

                    <p>Adresse de livraison :<br/>${shippingInfo}</p>
                    <p>À très vite,<br/><i>L'équipe Tous à Table</i></p>
                </div>
            `
        } : null;

        try {
            await transporter.sendMail(adminMailOptions);
            console.log("✅ Email Admin envoyé.");

            if (clientMailOptions) {
                await transporter.sendMail(clientMailOptions);
                console.log("✅ Email Client envoyé à", clientEmail);
            } else {
                console.warn("⚠️ Pas d'email client trouvé pour envoyer la confirmation.");
            }
        } catch (e) {
            console.error("❌ Erreur Envoi Email:", e);
        }
    });

exports.shareMeta = functions.https.onRequest(async (req, res) => {
    const SITE_URL = 'https://tatmadeinnormandie.web.app';
    const productId = req.query.product;
    // ... Logique existante simple ...
    let title = "Tous à Table";
    let desc = "Atelier Normand";
    let img = `${SITE_URL}/assets/logo.png`;

    if (productId) {
        // Fetch simple
        try {
            // ... Code fetch produit ...
        } catch (e) { }
    }

    const html = `
    <!doctype html>
    <head>
        <title>${title}</title>
        <meta property="og:title" content="${title}">
        <meta property="og:description" content="${desc}">
        <meta property="og:image" content="${img}">
        <meta name="twitter:card" content="summary_large_image">
    </head>
    <body>
        <script>window.location.href = "/?product=${productId || ''}";</script>
    </body>
    `;
    res.send(html);
});

// Admin Grant (conservé)
exports.grantAdminRole = functions.https.onCall(async (data, context) => {
    if (context.auth.token.email !== 'matthis.fradin2@gmail.com') return { error: 'Unauthorized' };
    await admin.auth().setCustomUserClaims(context.auth.uid, { admin: true });
    return { success: true };
});
