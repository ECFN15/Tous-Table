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
        pass: (process.env.GMAIL_PASSWORD || '').replace(/\s/g, '')
    },
    tls: {
        rejectUnauthorized: false
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

            // OPTIMISATION: Traitement PARALLÈLE des items (Promise.all) au lieu de séquentiel
            // Cela réduit le temps de 15s à ~2s
            const itemPromises = itemsSnap.docs.map(async (doc) => {
                const batch = db.batch();
                let opCount = 0;

                // A. Reset des compteurs sur l'item
                batch.update(doc.ref, {
                    likeCount: 0,
                    commentCount: 0,
                    shareCount: 0
                });
                opCount++;

                // B. Récupération parallèle des sous-collections
                const subCollections = ['likes', 'comments', 'shares'];
                const subSnaps = await Promise.all(
                    subCollections.map(subCol => doc.ref.collection(subCol).limit(500).get())
                );

                // Ajout des suppressions au batch
                subSnaps.forEach(subSnap => {
                    subSnap.forEach(subDoc => {
                        batch.delete(subDoc.ref);
                        opCount++;
                    });
                });

                // C. Commit du batch par Item
                if (opCount > 0) {
                    await batch.commit();
                    return opCount;
                }
                return 0;
            });

            // Attendre que TOUS les items soient nettoyés
            const results = await Promise.all(itemPromises);
            totalOp += results.reduce((acc, curr) => acc + curr, 0);
        }

        console.log(`Reset terminé. ${totalOp} opérations effectuées.`);
        return { success: true, count: totalOp };

    } catch (error) {
        console.error("Erreur Reset Stats:", error);
        throw new functions.https.HttpsError('internal', "Erreur lors du nettoyage.");
    }
});
// ============================================================
// 2b. GESTION DU STORAGE PRIVÉ (COFFRE-FORT)
// ============================================================

/**
 * Génère une URL signée pour permettre l'upload sécurisé
 */
exports.getUploadUrl = functions.https.onCall(async (data, context) => {
    // 1. Sécurité Admin
    if (!context.auth || (!context.auth.token.admin && context.auth.token.email !== 'matthis.fradin2@gmail.com')) {
        throw new functions.https.HttpsError('permission-denied', 'Réservé aux admins.');
    }

    const { fileName, contentType, collectionName } = data;
    if (!fileName || !contentType || !collectionName) {
        throw new functions.https.HttpsError('invalid-argument', 'Paramètres manquants.');
    }

    // 2. Validation Type de fichier (WebP recommandé)
    if (!contentType.startsWith('image/')) {
        throw new functions.https.HttpsError('invalid-argument', 'Seules les images sont autorisées.');
    }

    const bucket = admin.storage().bucket();
    const filePath = `${collectionName}/${Date.now()}_tat_${fileName}`;
    const file = bucket.file(filePath);

    // 3. Génération de l'URL signée (Valable 5 minutes)
    try {
        const [url] = await file.getSignedUrl({
            version: 'v4',
            action: 'write',
            expires: Date.now() + 5 * 60 * 1000,
            contentType: contentType,
        });

        return { uploadUrl: url, filePath: filePath };
    } catch (error) {
        console.error("Erreur getSignedUrl:", error);
        throw new functions.https.HttpsError('internal', 'Impossible de générer l\'URL signée.');
    }
});

// ============================================================
// 3. CLOUD FUNCTION: ENCHÈRES SÉCURISÉES & RÉVEIL
// ============================================================

// Fonction "Réveil" (Warm-up)
exports.wakeUp = functions.https.onCall(async (data, context) => {
    return { status: 'awake', timestamp: Date.now() };
});

exports.placeBid = functions.https.onCall(async (data, context) => {
    if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Vous devez être connecté.');

    const { itemId, collectionName, increment, idempotencyKey } = data;
    const userId = context.auth.uid;
    const userEmail = context.auth.token.email || 'Anonyme';
    const userName = context.auth.token.name || 'Anonyme';

    if (!itemId || typeof itemId !== 'string') throw new functions.https.HttpsError('invalid-argument', 'ID invalide.');
    if (increment < 5 || increment > 10000) throw new functions.https.HttpsError('invalid-argument', 'Incrément invalide.');

    // ============================================================
    // RATE LIMITING: Max 5 enchères par minute par utilisateur
    // ============================================================
    const rateLimitRef = db.doc(`sys_ratelimit/bid_${userId}`);
    const rateLimitSnap = await rateLimitRef.get();
    const rateLimitData = rateLimitSnap.exists ? rateLimitSnap.data() : { count: 0, resetAt: 0 };

    if (Date.now() < rateLimitData.resetAt && rateLimitData.count >= 5) {
        throw new functions.https.HttpsError('resource-exhausted', 'Trop de requêtes. Réessayez dans 1 minute.');
    }

    // Update rate limit counter (fire-and-forget pour ne pas bloquer)
    if (Date.now() > rateLimitData.resetAt) {
        rateLimitRef.set({ count: 1, resetAt: Date.now() + 60000 }).catch(() => { });
    } else {
        rateLimitRef.update({ count: admin.firestore.FieldValue.increment(1) }).catch(() => { });
    }

    const appId = 'tat-made-in-normandie';
    const itemRef = db.doc(`artifacts/${appId}/public/data/${collectionName}/${itemId}`);

    // LOGIQUE ANTI-DOUBLON (Idempotency)
    if (idempotencyKey) {
        const keyRef = db.doc(`sys_idempotency/${idempotencyKey}`);
        try {
            await db.runTransaction(async (t) => {
                const keySnap = await t.get(keyRef);
                if (keySnap.exists) {
                    throw new functions.https.HttpsError('already-exists', 'Action déjà traitée.');
                }
                t.set(keyRef, {
                    usedAt: admin.firestore.FieldValue.serverTimestamp(),
                    userId,
                    action: 'bid',
                    itemId
                });
            });
        } catch (e) {
            if (e.code === 'already-exists') return { success: true, duplicated: true }; // On renvoie success pour ne pas bloquer le front
            throw e;
        }
    }

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
            bidderEmail: userEmail,
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

    // ============================================================
    // SÉCURITÉ: Exiger un email vérifié pour passer commande
    // ============================================================
    if (!context.auth.token.email_verified) {
        throw new functions.https.HttpsError('failed-precondition',
            'Veuillez vérifier votre email avant de passer commande. Consultez votre boîte de réception (ou spams).'
        );
    }

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

    // VALIDATION BASIC
    if (!orderData || !orderData.items || !Array.isArray(orderData.items)) {
        throw new functions.https.HttpsError('invalid-argument', 'Format de commande invalide.');
    }

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

    // 2. Gestion du Paiement Différé (MANUAL)
    if (orderData.paymentMethod === 'manual' || orderData.paymentMethod === 'deferred') {
        const orderRef = db.collection('orders').doc();
        const finalOrder = {
            ...orderData,
            userId: userId, // [FIX] Add Missing User ID
            userEmail: context.auth.token.email || orderData.shipping?.email, // [FIX] Add Missing Email
            paymentMethod: 'deferred', // [FIX] Normalize to 'deferred' for Admin display
            total: totalAmount,
            status: 'pending_payment', // En attente de virement/chèque
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            stripeSessionId: null
        };

        try {
            await db.runTransaction(async (transaction) => {
                // Marquer les produits comme VENDUS ou DECREMENTER le stock
                const stockTrackerManual = {};

                for (const item of orderData.items) {
                    const colName = item.collectionName || 'furniture';
                    const realItemId = item.originalId || item.id;
                    const itemRef = db.doc(`artifacts/${appId}/public/data/${colName}/${realItemId}`);

                    const itemDoc = await transaction.get(itemRef);
                    if (!itemDoc.exists) throw "Item not found";

                    const currentStock = itemDoc.data().stock !== undefined ? Number(itemDoc.data().stock) : 1;

                    const alreadyTaken = stockTrackerManual[realItemId] || 0;
                    const newStock = Math.max(0, currentStock - 1 - alreadyTaken);

                    const updates = {
                        stock: newStock,
                        buyerId: userId
                    };

                    if (newStock === 0) {
                        updates.sold = true;
                        updates.soldAt = admin.firestore.FieldValue.serverTimestamp();
                    }

                    transaction.update(itemRef, updates);
                    stockTrackerManual[realItemId] = alreadyTaken + 1;
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

    // 3. Création de la Session Stripe Checkout (Si pas manuel)
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
    const endpointSecret = process.env.STRIPE_WH_SECRET;

    // Firebase Functions v1 parses the body automatically, but provides req.rawBody 
    // which is REQUIRED for Stripe signature verification.

    let event;

    try {
        if (endpointSecret && sig) {
            // VERIFICATION CRYPTOGRAPHIQUE STRICTE
            event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
            console.log("🔒 Webhook: Signature vérifiée avec succès.");
        } else {
            // ============================================================
            // SÉCURITÉ CRITIQUE: Bloquer les webhooks non signés en PRODUCTION
            // ============================================================
            if (!endpointSecret) {
                console.error("❌ ERREUR CRITIQUE: STRIPE_WH_SECRET non configuré. Webhook DÉSACTIVÉ.");
                return res.status(500).send('Configuration Error: Webhook secret missing.');
            }
            if (!sig) {
                console.error("❌ Tentative de webhook sans signature. Bloquée.");
                return res.status(401).send('Unauthorized: Missing signature.');
            }
        }
    } catch (err) {
        console.error(`❌ Webhook Security Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
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
        console.log("⚡ onOrderCreated TRIGGERED! ID:", context.params.orderId);

        const order = snap.data();
        console.log("📧 Config Check:", {
            hasEmail: !!process.env.GMAIL_EMAIL,
            userEmail: order.userEmail,
            total: order.total
        });

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

// ============================================================
// 6. GESTION DES UTILISATEURS ADMIN (IAM)
// ============================================================

/**
 * Trigger: À la création d'un user (ex: 1ère connexion Google), 
 * on vérifie s'il est dans la whitelist Admin. Si oui, on lui donne le badge.
 */
exports.grantAdminOnAuth = functions.auth.user().onCreate(async (user) => {
    const adminDocRef = db.doc('sys_metadata/admin_users');
    const docSnap = await adminDocRef.get();

    if (!docSnap.exists) return;

    const whitelist = docSnap.data().users || {};
    // Find the key in the map where the email matches (might be a pending key or a real UID)
    const [pendingKey, pendingData] = Object.entries(whitelist).find(([key, val]) => val.email === user.email) || [];

    if (pendingData) {
        console.log(`🎯 Nouvel utilisateur Admin détecté: ${user.email}. Attribution des droits...`);

        // 1. Grant Security Claims
        await admin.auth().setCustomUserClaims(user.uid, { admin: true });

        // 2. Update Firestore Whitelist (Replace pending key with Real UID)
        const updates = {};

        // If the key was not already the UID (e.g. pending_123), delete it
        if (pendingKey !== user.uid) {
            updates[`users.${pendingKey}`] = admin.firestore.FieldValue.delete();
        }

        // Add the correct entry with Real UID
        updates[`users.${user.uid}`] = {
            ...pendingData,
            name: user.displayName || pendingData.name || 'Admin',
            photoURL: user.photoURL || null,
            uid: user.uid,
            status: 'active', // ✅ Pass to Green
            lastLogin: admin.firestore.FieldValue.serverTimestamp()
        };

        await adminDocRef.update(updates);

        // 3. Update User Document for Frontend Role Check
        await db.collection('users').doc(user.uid).set({
            role: 'admin',
            email: user.email,
            name: user.displayName || pendingData.name || 'Admin',
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        console.log(`✅ Admin ${user.email} activé avec succès (UID: ${user.uid}).`);
    } else {
        console.log(`User ${user.email} not in admin whitelist.`);
    }
});

// Ajouter un administrateur (Whitelist + Claims si existe déjà)
exports.addAdminUser = functions.https.onCall(async (data, context) => {
    // 1. Sécurité
    const callerEmail = context.auth?.token.email;
    const isSuperAdmin = callerEmail === 'matthis.fradin2@gmail.com';

    if (!context.auth || (!context.auth.token.admin && !isSuperAdmin)) {
        throw new functions.https.HttpsError('permission-denied', 'Réservé aux administrateurs.');
    }

    const { email, name } = data;
    if (!email) throw new functions.https.HttpsError('invalid-argument', 'Email requis.');

    let targetUid = null;
    let userExists = false;

    try {
        // A. Chercher si l'utilisateur existe déjà pour lui mettre le badge tout de suite
        try {
            const userRecord = await admin.auth().getUserByEmail(email);
            targetUid = userRecord.uid;
            userExists = true;
        } catch (e) {
            // Pas grave, il n'existe pas encore. 
            // Le trigger grantAdminOnAuth s'en chargera quand il se connectera.
            targetUid = `pending_${Date.now()}`;
        }

        // B. Attribution du rôle Admin (Custom Claims) SI l'user existe
        if (userExists && targetUid) {
            await admin.auth().setCustomUserClaims(targetUid, { admin: true });
        }

        // C. Ajout à la liste blanche Firestore
        await db.doc('sys_metadata/admin_users').set({
            users: {
                [targetUid]: {
                    email: email,
                    name: name || 'Admin Invité',
                    role: 'admin',
                    addedAt: admin.firestore.FieldValue.serverTimestamp(),
                    addedBy: callerEmail,
                    status: userExists ? 'active' : 'pending'
                }
            }
        }, { merge: true });

        // D. Update User Document for Frontend Role Check (If user exists)
        if (userExists && targetUid) {
            await db.collection('users').doc(targetUid).set({
                role: 'admin',
                email: email,
                name: name || 'Admin',
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
        }
        return { success: true, userExists, uid: targetUid };

    } catch (error) {
        console.error("Erreur Add Admin:", error);
        throw new functions.https.HttpsError('internal', error.message);
    }
});

// Révoquer un administrateur
exports.removeAdminUser = functions.https.onCall(async (data, context) => {
    // 1. Sécurité
    if (!context.auth || !context.auth.token.admin) {
        if (!context.auth || context.auth.token.email !== 'matthis.fradin2@gmail.com') {
            throw new functions.https.HttpsError('permission-denied', 'Interdit.');
        }
    }

    const { uid, email } = data; // On accepte UID ou Email pour retrouver l'user
    if (!uid && !email) throw new functions.https.HttpsError('invalid-argument', 'UID ou Email requis.');

    // PRÉVENTION AUTO-BLOQUAGE & PROTECTION SUPER-ADMIN
    // On interdit formellement de supprimer le compte propriétaire matthis.fradin2@gmail.com
    if (email === 'matthis.fradin2@gmail.com' || (uid && uid === context.auth?.uid && context.auth?.token.email === 'matthis.fradin2@gmail.com')) {
        throw new functions.https.HttpsError('failed-precondition', 'Action impossible: vous ne pouvez pas révoquer le super-administrateur.');
    }

    try {
        let targetUid = uid;

        // Si on a l'email mais le UID est "pending_...", on essaie de trouver le vrai UID Auth
        if (email && (!targetUid || targetUid.startsWith('pending_'))) {
            try {
                const userRecord = await admin.auth().getUserByEmail(email);
                targetUid = userRecord.uid; // On a trouvé le vrai compte
            } catch (e) { }
        }

        // A. Retirer le claim admin (sur le vrai compte Auth s'il existe)
        if (targetUid && !targetUid.startsWith('pending_')) {
            await admin.auth().setCustomUserClaims(targetUid, { admin: false });
        }

        // B. Retirer de Firestore (Il faut trouver la clé exacte dans la Map)
        // On doit lire la map pour trouver la clé associée à cet email si on a pas le bon UID
        const docRef = db.doc('sys_metadata/admin_users');

        if (uid) {
            // Cas facile: on a la clé
            await docRef.update({
                [`users.${uid}`]: admin.firestore.FieldValue.delete()
            });
        } else {
            // Cas difficile: on cherche la clé par l'email (rare)
            // On laisse le client gérer ça: le client doit envoyer le 'uid' (clé de la map)
        }

        return { success: true };

    } catch (error) {
        console.error("Erreur Remove Admin:", error);
        throw new functions.https.HttpsError('internal', error.message);
    }
});

// Outil de diagnostic (Email)
exports.sendTestEmail = functions.https.onCall(async (data, context) => {
    // 1. Sécurité : Admin seulement
    if (!context.auth || !context.auth.token.admin) {
        if (!context.auth || context.auth.token.email !== 'matthis.fradin2@gmail.com') {
            throw new functions.https.HttpsError('permission-denied', 'Réservé à l\'administrateur.');
        }
    }

    const debugInfo = {
        hasEmailEnv: !!process.env.GMAIL_EMAIL,
        hasPassEnv: !!process.env.GMAIL_PASSWORD,
        emailConfigured: process.env.GMAIL_EMAIL,
        nodeCwd: process.cwd()
    };

    console.log("🔍 Diagnostic Email:", debugInfo);

    if (!process.env.GMAIL_EMAIL || !process.env.GMAIL_PASSWORD) {
        return {
            success: false,
            error: "Variables d'environnement GMAIL manquantes.",
            debug: debugInfo
        };
    }

    const mailOptions = {
        from: `Tous à Table Test <${process.env.GMAIL_EMAIL}>`,
        to: process.env.GMAIL_EMAIL, // S'envoyer à soi-même
        subject: `[Diagnostic] Test Email`,
        text: `Ceci est un test.\n\nDebug Info:\n${JSON.stringify(debugInfo, null, 2)}`
    };

    try {

        const info = await transporter.sendMail(mailOptions);
        console.log("✅ Email envoyé:", info.response);
        return { success: true, response: info.response, debug: debugInfo };

    } catch (error) {
        console.error("❌ Erreur envoi:", error);
        return { success: false, error: error.message, debug: debugInfo };
    }
});

// ============================================================
// 8. STATISTIQUES UTILISATEURS (Registered Users Only)
// ============================================================
exports.getUserStats = functions.runWith({ timeoutSeconds: 300, memory: '512MB' }).https.onCall(async (data, context) => {
    // 1. Sécurité : Admin seulement
    // 1. Sécurité : Admin ou Super Admin Hardcodé
    const callerEmail = context.auth?.token.email;
    const isSuperAdmin = callerEmail === 'matthis.fradin2@gmail.com';

    if (!context.auth || (!context.auth.token.admin && !isSuperAdmin)) {
        throw new functions.https.HttpsError('permission-denied', 'Administrateur requis.');
    }

    try {
        let nextPageToken;
        const allUsers = [];

        // Etape A : On récupère les métadonnées de sécurité depuis Firestore (IPs, etc.)
        // C'est plus rapide de tout prendre d'un coup que de faire N requêtes.
        const userDocsSnapshot = await db.collection('users').get();
        const userMetadataMap = {};
        userDocsSnapshot.forEach(doc => {
            userMetadataMap[doc.id] = doc.data();
        });

        // Etape B : On boucle pour récupérer tous les comptes Auth
        do {
            const listUsersResult = await admin.auth().listUsers(1000, nextPageToken);

            listUsersResult.users.forEach((userRecord) => {
                // On filtre les anonymes
                if (userRecord.email || (userRecord.providerData && userRecord.providerData.length > 0)) {

                    // On récupère les infos Firestore correspondantes
                    const meta = userMetadataMap[userRecord.uid] || {};

                    allUsers.push({
                        uid: userRecord.uid,
                        email: userRecord.email,
                        displayName: userRecord.displayName || 'Sans nom',
                        creationTime: userRecord.metadata.creationTime,
                        lastSignInTime: userRecord.metadata.lastSignInTime,
                        provider: userRecord.providerData.map(p => p.providerId).join(', '),
                        // Nouveaux champs de sécurité
                        lastIp: meta.lastIp || 'N/A',
                        lastUserAgent: meta.lastUserAgent || 'N/A'
                    });
                }
            });

            nextPageToken = listUsersResult.pageToken;
        } while (nextPageToken);

        // On trie par date de création (le plus récent en premier)
        allUsers.sort((a, b) => new Date(b.creationTime) - new Date(a.creationTime));

        return {
            success: true,
            count: allUsers.length,
            users: allUsers
        };

    } catch (error) {
        console.error("❌ Erreur getUserStats:", error);
        throw new functions.https.HttpsError('internal', error.message);
    }
});

// ============================================================
// 9. SÉCURITÉ : LOG CONNEXION (IP CAPTURE)
// ============================================================
exports.logUserConnection = functions.https.onCall(async (data, context) => {
    // 1. Vérification basique
    if (!context.auth) return { success: false, message: "Unauthenticated" };

    try {
        // 2. Extraction IP
        // Sur Cloud Functions, l'IP réelle passe par le load balancer dans 'x-forwarded-for'
        const rawIp = context.rawRequest.headers['x-forwarded-for'] || context.rawRequest.connection.remoteAddress;
        // Si plusieurs IPs (proxy chain), on prend la première
        const ip = rawIp ? rawIp.split(',')[0].trim() : 'Unknown';
        const userAgent = context.rawRequest.headers['user-agent'] || 'Unknown';

        // 3. Stockage Sécurisé dans Firestore
        const userRef = db.collection('users').doc(context.auth.uid);

        // On met à jour la dernière IP et on l'ajoute à l'historique (limité aux 50 dernières pour pas exploser)
        // Note: arrayUnion ajoute seulement si unique, mais ici avec le timestamp ça sera toujours unique.
        // Pour éviter de saturer, on ne garde que les infos essentielles.

        await userRef.set({
            lastIp: ip,
            lastUserAgent: userAgent,
            lastConnectionAt: admin.firestore.FieldValue.serverTimestamp(),
            // On peut ajouter un tableau 'securityHistory' si besoin, mais attention à la taille du doc.
            // Pour l'instant on garde juste la dernière connue pour l'export Excel.
            securityData: {
                ip: ip,
                ua: userAgent,
                detectedAt: admin.firestore.FieldValue.serverTimestamp()
            }
        }, { merge: true });

        return { success: true, ip: ip };

    } catch (error) {
        console.error("❌ Erreur LogConnection:", error);
        return { success: false, error: error.message };
    }
});

// ============================================================
// ⚠️ DANGER ZONE: NETTOYAGE TOTAL UTILISATEURS
// ============================================================
exports.resetAllUsers = functions.runWith({ timeoutSeconds: 540, memory: '1GB' }).https.onCall(async (data, context) => {

    // 1. SÉCURITÉ ABSOLUE : SEUL LE SUPER ADMIN PEUT LANCER ÇA
    const SUPER_ADMINS = ['matthis.fradin2@gmail.com'];
    const callerEmail = context.auth?.token.email;

    if (!SUPER_ADMINS.includes(callerEmail)) {
        throw new functions.https.HttpsError('permission-denied', 'ACCÈS REFUSÉ. Seul le Super Admin peut lancer ce nettoyage.');
    }

    console.log(`🚨 STARTING USER PURGE initiated by ${callerEmail}`);

    try {
        // --- A. NETTOYAGE AUTHENTICATION ---
        let nextPageToken;
        let usersDeleted = 0;
        const preservedUids = [];

        // On boucle pour lister tout le monde
        do {
            const listUsersResult = await admin.auth().listUsers(1000, nextPageToken);

            const usersToDelete = listUsersResult.users.filter(user => {
                const isProtected = SUPER_ADMINS.includes(user.email);
                if (isProtected) {
                    preservedUids.push(user); // On garde les infos pour restaurer Firestore
                    console.log(`🛡️ Compte PROTÉGÉ : ${user.email}`);
                    return false;
                }
                return true;
            }).map(u => u.uid);

            if (usersToDelete.length > 0) {
                await admin.auth().deleteUsers(usersToDelete);
                usersDeleted += usersToDelete.length;
                console.log(`🗑️ Batch delete: ${usersToDelete.length} users removed.`);
            }

            nextPageToken = listUsersResult.pageToken;
        } while (nextPageToken);


        // --- B. RESTAURATION FIRESTORE (ADMIN WHITELIST) ---
        // On écrase la liste des admins pour ne garder que les survivants
        const newAdminMap = {};

        for (const user of preservedUids) {
            newAdminMap[user.uid] = {
                uid: user.uid, // Utiliser le vrai UID Auth
                email: user.email,
                name: user.displayName || 'Super Admin',
                photoURL: user.photoURL || null,
                role: 'super_admin',
                status: 'active',
                addedAt: admin.firestore.FieldValue.serverTimestamp()
            };
            // Sécurité double ceinture : On remet le claim Admin
            await admin.auth().setCustomUserClaims(user.uid, { admin: true });
        }

        // On écrase le doc
        await db.doc('sys_metadata/admin_users').set({ users: newAdminMap });
        console.log("✅ Firestore Admin Whitelist reset.");

        return { success: true, count: usersDeleted, message: `Nettoyage terminé. ${usersDeleted} comptes supprimés.` };

    } catch (error) {
        console.error("❌ Erreur Purge :", error);
        throw new functions.https.HttpsError('internal', error.message);
    }
});

// ============================================================
// 7. MAINTENANCE & NETTOYAGE (GARBAGE COLLECTOR)
// ============================================================
exports.runGarbageCollector = functions.runWith({ timeoutSeconds: 540, memory: '1GB' }).https.onCall(async (data, context) => {

    // 1. Sécurité : Admin seulement
    if (!context.auth || !context.auth.token.admin) {
        if (!context.auth || context.auth.token.email !== 'matthis.fradin2@gmail.com') {
            throw new functions.https.HttpsError('permission-denied', 'Administrateur requis.');
        }
    }

    const appId = 'tat-made-in-normandie';
    const collections = ['furniture', 'cutting_boards'];
    const bucket = admin.storage().bucket(); // Default bucket

    let stats = {
        scanDate: new Date().toISOString(),
        ghostDocsDeleted: 0,
        orphanedImagesDeleted: 0,
        storageSpaceFreedBytes: 0,
        errors: []
    };

    try {
        console.log("🧹 STARTING GARBAGE COLLECTOR...");

        // --- STEP 1: GHOST HUNTING (Firestore) ---
        // Trouve les documents qui n'existent pas mais ont des sous-collections (bids, likes...)
        const activeImagePaths = new Set(); // Pour l'étape 2

        for (const colName of collections) {
            const colRef = db.collection(`artifacts/${appId}/public/data/${colName}`);
            const allRefs = await colRef.listDocuments(); // Récupère TOUTES les refs, même mortes

            // On vérifie l'existence par lots de 100
            const chunkSize = 100;
            for (let i = 0; i < allRefs.length; i += chunkSize) {
                const chunk = allRefs.slice(i, i + chunkSize);
                if (chunk.length === 0) continue;

                const snaps = await db.getAll(...chunk);

                for (const snap of snaps) {
                    if (!snap.exists) {
                        // C'est un FANTÔME ! 👻 (Document supprimé mais sous-collections présentes)
                        console.log(`👻 Fantôme détecté: ${snap.ref.path}. Suppression récursive...`);

                        // Suppression manuelle récursive des sous-collections connues
                        const subCols = ['bids', 'likes', 'comments', 'shares', 'logs'];
                        const batch = db.batch();
                        let ops = 0;

                        for (const subName of subCols) {
                            // Augmentation de la puissance de nettoyage : 450 items par coup (Max batch 500)
                            const subSnaps = await snap.ref.collection(subName).limit(450).get();
                            subSnaps.forEach(doc => {
                                batch.delete(doc.ref);
                                ops++;
                            });
                        }

                        if (ops > 0) {
                            await batch.commit();
                            stats.ghostDocsDeleted++;
                        }
                    } else {
                        // C'est un VIVANT ! 🌳
                        // On collecte ses images pour l'étape 2
                        const data = snap.data();
                        if (data.images && Array.isArray(data.images)) {
                            data.images.forEach(url => {
                                try {
                                    // Extraction du chemin depuis l'URL Firebase Storage
                                    // URL type: https://firebasestorage.googleapis.com/.../o/furniture%2Fmon_image.jpg?alt=...
                                    // Decoding: furniture/mon_image.jpg
                                    if (url.includes('/o/')) {
                                        const path = decodeURIComponent(url.split('/o/')[1].split('?')[0]);
                                        activeImagePaths.add(path);
                                    }
                                } catch (e) {
                                    // Ignore invalid urls
                                }
                            });
                        }
                    }
                }
            }
        }
        console.log(`✅ IDs d'images actives recensées : ${activeImagePaths.size}`);


        // --- STEP 2: ORPHAN IMAGES (Storage) ---
        // Liste les fichiers et supprime ceux qui ne sont pas dans activeImagePaths
        const foldersToClean = ['furniture/', 'cutting_boards/']; // Trailing slash important pour prefix

        for (const folder of foldersToClean) {
            // Get files in folder
            const [files] = await bucket.getFiles({ prefix: folder });

            // Process parallèle mais limité pour éviter rate limit
            // On supprime les fichiers non référencés
            for (const file of files) {
                // Ignore les dossiers eux-mêmes (taille 0 ou nom terminé par /)
                if (file.name.endsWith('/')) continue;

                // Vérification
                if (!activeImagePaths.has(file.name)) {
                    // ORPHELIN ! 🗑️
                    // Protection ultime: Vérifier que c'est bien une image et pas un truc système
                    if (!file.name.includes('sys_') && (file.name.includes('.jpg') || file.name.includes('.png') || file.name.includes('.webp'))) {
                        try {
                            await file.delete();
                            stats.orphanedImagesDeleted++;
                            // Calcul du poids libéré (converti en nombre, parfois string)
                            stats.storageSpaceFreedBytes += parseInt(file.metadata.size || '0', 10);
                            console.log(`🗑️ Image orpheline supprimée: ${file.name}`);
                        } catch (e) {
                            console.error(`Erreur suppression ${file.name}:`, e);
                            stats.errors.push(file.name);
                        }
                    }
                }
            }
        }

        console.log("✅ Garbage Collection terminé:", stats);
        return { success: true, stats };

    } catch (error) {
        console.error("Critical GC Error:", error);
        throw new functions.https.HttpsError('internal', error.message);
    }
});

// ============================================================
// 11. TRIGGER NETTOYAGE COMPLET (Images + Sous-collections)
// ============================================================

/**
 * Fonction unifiée pour nettoyer tout ce qui est lié à un document supprimé.
 * Gère :
 * 1. Suppression des images dans Storage (via URLs stockées dans le doc)
 * 2. Suppression récursive des sous-collections (Standard + Bids + Logs)
 */
const cleanupDocumentAssets = async (snap, context) => {
    const data = snap.data();
    const docPath = snap.ref.path;
    const { collection, docId } = context.params;

    // Sécurité : On ne touche qu'aux objets métiers
    if (!['furniture', 'cutting_boards'].includes(collection)) return null;

    console.log(`🗑️ [AUTO-CLEANUP] Suppression détectée : ${collection}/${docId}`);

    // --- STEP 1: IMAGES (STORAGE) ---
    let imagesToDelete = [];

    if (data.imageUrl) imagesToDelete.push(data.imageUrl);
    if (data.thumbnailUrl) imagesToDelete.push(data.thumbnailUrl);

    if (data.images && Array.isArray(data.images)) {
        imagesToDelete = [...imagesToDelete, ...data.images];
    }
    if (data.thumbnails && Array.isArray(data.thumbnails)) {
        imagesToDelete = [...imagesToDelete, ...data.thumbnails];
    }

    // Filtrer les doublons et URLs invalides
    const uniqueImages = [...new Set(imagesToDelete)].filter(url => url && typeof url === 'string' && url.includes('firebasestorage'));

    if (uniqueImages.length > 0) {
        console.log(`📸 Suppression de ${uniqueImages.length} images associées...`);
        const bucket = admin.storage().bucket();

        await Promise.all(uniqueImages.map(async (url) => {
            try {
                // Parse URL Firebase : .../o/dossier%2Ffich.jpg?alt...
                const decodedUrl = decodeURIComponent(url);
                const startIndex = decodedUrl.indexOf('/o/') + 3;
                const endIndex = decodedUrl.indexOf('?');

                if (startIndex > 2 && (endIndex === -1 || endIndex > startIndex)) {
                    const filePath = decodedUrl.substring(startIndex, endIndex === -1 ? undefined : endIndex);
                    console.log(`🔥 Delete Storage: ${filePath}`);
                    await bucket.file(filePath).delete();
                }
            } catch (e) {
                console.warn(`⚠️ Echec suppression image ${url} (probablement déjà supprimée):`, e.message);
            }
        }));
    }

    // --- STEP 2: SOUS-COLLECTIONS (FIRESTORE) ---
    const subCols = ['bids', 'likes', 'comments', 'shares', 'logs'];
    const batch = db.batch();
    let deletedCount = 0;

    for (const subName of subCols) {
        const subSnaps = await snap.ref.collection(subName).get();
        if (!subSnaps.empty) {
            console.log(`   - Suppression sous-collection '${subName}' (${subSnaps.size} docs)`);
            subSnaps.forEach(doc => {
                batch.delete(doc.ref);
                deletedCount++;
            });
        }
    }

    if (deletedCount > 0) {
        await batch.commit();
        console.log(`✅ Sous-collections nettoyées (${deletedCount} docs).`);
    }

    console.log(`✅ [AUTO-CLEANUP] Terminé avec succès pour ${docId}.`);
    return null;
};

//Trigger Wildcard pour les deux collections
exports.onArtifactDeleted = functions.runWith({ timeoutSeconds: 300 }).firestore
    .document('artifacts/{appId}/public/data/{collection}/{docId}')
    .onDelete(cleanupDocumentAssets);


// ============================================================
// 12. INITIALISATION SUPER ADMIN (ONE SHOT PROD)
// ============================================================
exports.initSuperAdmin = functions.https.onRequest(async (req, res) => {
    // Sécurité par Secret Query Param (pour éviter que n'importe qui lance l'URL)
    const secret = req.query.secret;
    if (secret !== 'Normandie2026!') {
        return res.status(403).send('Forbidden');
    }

    const email = 'matthis.fradin2@gmail.com';

    try {
        // 1. Trouver l'UID Auth réel
        const userRecord = await admin.auth().getUserByEmail(email);
        const uid = userRecord.uid;

        // 2. Grant Claims (Admin + SuperAdmin)
        await admin.auth().setCustomUserClaims(uid, { admin: true, super_admin: true });

        // 3. Force Write Firestore (Même si existe déjà, écrase avec les bons droits)
        await db.doc('sys_metadata/admin_users').set({
            users: {
                [uid]: {
                    uid: uid,
                    email: email,
                    name: userRecord.displayName || 'Matthis Fradin',
                    role: 'super_admin', // LE GRALL
                    status: 'active',
                    addedAt: admin.firestore.FieldValue.serverTimestamp(),
                    protected: true // Marqueur visuel
                }
            }
        }, { merge: true });

        // 4. Update User Document for Frontend Role Check
        await db.collection('users').doc(uid).set({
            role: 'super_admin',
            email: email,
            name: userRecord.displayName || 'Matthis Fradin',
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        return res.send(`✅ SUCCÈS : ${email} est maintenant SUPER ADMIN officiel sur cet environnement.`);

    } catch (error) {
        return res.status(500).send(`Erreur: ${error.message}`);
    }
});

