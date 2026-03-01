const functions = require('firebase-functions/v1');
const { defineSecret } = require('firebase-functions/params');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

admin.initializeApp();
const db = admin.firestore();

// SÉCURITÉ : Définition des Secrets (Secret Manager)
const GMAIL_EMAIL = defineSecret('GMAIL_EMAIL');
const GMAIL_PASSWORD = defineSecret('GMAIL_PASSWORD');
const STRIPE_SECRET_KEY = defineSecret('STRIPE_SECRET_KEY');
const STRIPE_WH_SECRET = defineSecret('STRIPE_WH_SECRET');

// Configuration Lazy du transporteur Gmail (Dans onCall/onRequest pour accès aux secrets)
const createTransporter = () => {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: GMAIL_EMAIL.value(),
            pass: GMAIL_PASSWORD.value().replace(/\s/g, '')
        },
        tls: {
            rejectUnauthorized: false
        }
    });
};

// ============================================================
// 0. HELPERS SÉCURITÉ (CENTRALISATION)
// ============================================================
const SUPER_ADMIN_EMAIL = 'matthis.fradin2@gmail.com';

/**
 * Détermine l'URL du site en fonction de l'environnement (Projet Firebase)
 */
const getSiteUrl = () => {
    const projectId = process.env.GCLOUD_PROJECT || 'tatmadeinnormandie';
    return projectId === 'tousatable-client'
        ? 'https://tousatable-madeinnormandie.fr'
        : 'https://tatmadeinnormandie.web.app';
};

const checkIsAdmin = (context) => {
    if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Authentification requise.');
    const isSuper = context.auth.token.email === SUPER_ADMIN_EMAIL;
    const isAdminClaim = context.auth.token.admin === true;
    if (!isSuper && !isAdminClaim) {
        throw new functions.https.HttpsError('permission-denied', 'Accès réservé aux administrateurs.');
    }
    return { isSuper, isAdmin: true };
};

const checkIsSuperAdmin = (context) => {
    if (!context.auth || context.auth.token.email !== SUPER_ADMIN_EMAIL) {
        throw new functions.https.HttpsError('permission-denied', 'ACCÈS REFUSÉ. Action réservée au Super Administrateur.');
    }
    return true;
};

// ============================================================
// 1. TRIGGERS: COMPTEURS AUTOMATIQUES (FIABILITÉ TOTALE)
// ============================================================




// ============================================================
// 2. FONCTION ADMIN: RESET TOTAL (GRAND NETTOYAGE)
// ============================================================
exports.resetAllStats = functions.runWith({ secrets: [GMAIL_EMAIL, GMAIL_PASSWORD] }).https.onCall(async (data, context) => {
    // 1. SÉCURITÉ CRITIQUE : Seul le Super Admin peut réinitialiser les stats globales
    checkIsSuperAdmin(context);

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

                // A. Reset des compteurs sur l'item (BidCount reste pour l'historique)
                batch.update(doc.ref, {
                    bidCount: 0
                });
                opCount++;

                // B. Récupération parallèle des sous-collections
                const subCollections = ['bids'];
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
    // 1. Sécurité Admin (Artisan ou Super)
    checkIsAdmin(context);

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

// --- SÉCURITÉ : Annulation Commande par le Client ---
exports.cancelOrderClient = functions.https.onCall(async (data, context) => {
    if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Authentification requise.');

    const { orderId } = data;
    if (!orderId) throw new functions.https.HttpsError('invalid-argument', 'ID de commande manquant.');

    const userId = context.auth.uid;
    const userEmail = context.auth.token.email;
    const orderRef = db.collection('orders').doc(orderId);

    return db.runTransaction(async (transaction) => {
        const orderSnap = await transaction.get(orderRef);
        if (!orderSnap.exists) {
            throw new functions.https.HttpsError('not-found', 'Commande introuvable.');
        }

        const orderData = orderSnap.data();
        // Vérifier l'appartenance
        if (orderData.userId !== userId && orderData.userEmail !== userEmail) {
            throw new functions.https.HttpsError('permission-denied', 'Cette commande ne vous appartient pas.');
        }

        // Vérifier l'état et le délai
        if (orderData.status === 'shipped' || orderData.status === 'completed' || String(orderData.status).includes('cancelled')) {
            throw new functions.https.HttpsError('failed-precondition', 'Cette commande ne peut plus être annulée.');
        }

        const orderDate = orderData.createdAt?.toMillis() || 0;
        const diffDays = (Date.now() - orderDate) / (1000 * 60 * 60 * 24);
        if (diffDays > 7) {
            throw new functions.https.HttpsError('failed-precondition', 'Le délai d\'annulation de 7 jours est dépassé.');
        }

        // Restaurer le stock (si applicable)
        if (orderData.items && Array.isArray(orderData.items)) {
            for (const item of orderData.items) {
                const itemId = item.originalId || item.id;
                const col = item.collection || item.collectionName || 'furniture';
                const appId = 'tat-made-in-normandie';

                if (itemId) {
                    const itemRef = db.doc(`artifacts/${appId}/public/data/${col}/${itemId}`);
                    const itemSnap = await transaction.get(itemRef);
                    if (itemSnap.exists) {
                        const itemDb = itemSnap.data();
                        const currentStock = Number(itemDb.stock || 0);

                        // LOGIQUE INTELLIGENTE : si le stock est 0, on remet à quantité initiale
                        if (currentStock === 0) {
                            transaction.update(itemRef, {
                                stock: item.quantity || 1,
                                sold: false,
                                soldAt: null,
                                buyerId: null
                            });
                        } else {
                            // On sécurise juste les flags 'sold'
                            transaction.update(itemRef, {
                                sold: false,
                                buyerId: null
                            });
                        }
                    }
                }
            }
        }

        // Annuler la commande en BDD
        transaction.update(orderRef, {
            status: 'cancelled_by_client',
            cancelledAt: admin.firestore.FieldValue.serverTimestamp(),
            clientNote: "Annulée par l'acheteur"
        });

        return { success: true };
    });
});

// Stripe initialized inside function
const Stripe = require('stripe');

exports.createOrder = functions.runWith({ secrets: [STRIPE_SECRET_KEY, GMAIL_EMAIL, GMAIL_PASSWORD] }).https.onCall(async (data, context) => {
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
    const stripe = Stripe(STRIPE_SECRET_KEY.value());

    const userId = context.auth.uid;
    const { orderData } = data;
    const appId = 'tat-made-in-normandie';
    const SITE_URL = getSiteUrl();

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
                let imgUrl = itemDb.images && itemDb.images.length > 0 ? itemDb.images[0] : `${getSiteUrl()}/assets/logo.png`;

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
exports.stripeWebhook = functions.runWith({ secrets: [STRIPE_SECRET_KEY, STRIPE_WH_SECRET] }).https.onRequest(async (req, res) => {
    const stripe = Stripe(STRIPE_SECRET_KEY.value());
    const sig = req.headers['stripe-signature'];
    const endpointSecret = STRIPE_WH_SECRET.value();

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

exports.onOrderCreated = functions.runWith({ secrets: [GMAIL_EMAIL, GMAIL_PASSWORD] }).firestore
    .document('orders/{orderId}')
    .onCreate(async (snap, context) => {
        console.log("⚡ onOrderCreated TRIGGERED! ID:", context.params.orderId);

        const order = snap.data();
        console.log("📧 Config Check:", {
            hasEmail: !!GMAIL_EMAIL.value(),
            userEmail: order.userEmail,
            total: order.total
        });

        if (!GMAIL_EMAIL.value()) {
            console.error("❌ Email non configuré (GMAIL_EMAIL manquant).");
            return;
        }

        const adminEmail = GMAIL_EMAIL.value();
        const clientEmail = order.userEmail;

        const transporter = createTransporter();

        // --- 1. EMAIL ADMIN ---
        const itemsHtml = (order.items || []).map(i =>
            `<li>${i.quantity || 1}x <b>${i.name}</b> - ${i.price}€</li>`
        ).join('');

        const shippingInfo = order.shipping ?
            `${order.shipping.address}, ${order.shipping.city} (${order.shipping.postalCode})` : "Non spécifié";

        const adminMailOptions = {
            from: `Tous à Table Robot <${adminEmail}>`,
            to: process.env.GCLOUD_PROJECT === 'tousatable-client'
                ? `${adminEmail}, tousatablemadeinnormandie@gmail.com`
                : adminEmail, // En dev/sandbox, on envoie uniquement à adminEmail (matthis)
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
                <p><a href="${getSiteUrl()}/admin">Aller au Dashboard</a></p>
            `
        };

        // --- 2. EMAIL CLIENT ---
        const paymentInstructions = order.paymentMethod !== 'stripe' ? `
            <div style="background: #fffbeb; border: 1px solid #fcd34d; padding: 20px; border-radius: 10px; margin: 20px 0;">
                <h3 style="color: #b45309; margin-top:0;">Instructions de règlement</h3>
                <p>Pour finaliser votre commande, merci d'effectuer le règlement par <b>Virement</b> ou <b>Wero</b> :</p>
                <p style="margin-bottom: 5px;"><b>IBAN :</b> FR76 3002 7160 8000 0506 2940 303</p>
                <p style="margin-top: 0;"><b>Titulaire :</b> M O. PEGOIX OU MME E. PEGOIX</p>
                <p><b>Wero / Instant :</b> 07 77 32 41 78</p>
                <p style="font-size: 12px; color: #92400e;"><i>Votre commande sera expédiée dès réception du règlement.</i></p>
            </div>
        ` : '';

        const clientMailOptions = clientEmail ? {
            from: `Tous à Table <${adminEmail}>`,
            to: clientEmail,
            subject: `Confirmation de votre commande`,
            html: `
                <div style="font-family: sans-serif; color: #333; max-width: 600px;">
                    <h1 style="color: #d97706;">Merci pour votre commande !</h1>
                    <p>Bonjour ${order.shipping?.fullName || ''},</p>
                    <p>Nous avons bien reçu votre commande <b>#${snap.id.slice(0, 8)}</b>.</p>
                    
                    ${paymentInstructions}

                    <div style="background: #f5f5f4; padding: 20px; border-radius: 10px; margin: 20px 0;">
                        <h3 style="margin-top:0;">Récapitulatif</h3>
                        <ul>${itemsHtml}</ul>
                        <p><strong>Total : ${order.total}€</strong></p>
                    </div>

                    <p>Adresse de livraison :<br/>${shippingInfo}</p>
                    
                    <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
                        <p style="margin: 0 0 5px 0;"><strong>Besoin d'aide ? Contactez-nous :</strong></p>
                        <p style="margin: 0 0 5px 0; color: #555; font-size: 14px;">📞 07 77 32 41 78</p>
                        <p style="margin: 0; color: #555; font-size: 14px;">📍 346 Chem. de Fleury IFS, France</p>
                    </div>

                    <hr style="border:none; border-top:1px solid #eee; margin: 20px 0;" />
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

// --- NOTIFICATION D'EXPÉDITION ---
exports.onOrderUpdated = functions.runWith({ secrets: [GMAIL_EMAIL, GMAIL_PASSWORD] }).firestore
    .document('orders/{orderId}')
    .onUpdate(async (change, context) => {
        const orderBefore = change.before.data();
        const orderAfter = change.after.data();

        // Check if status changed TO 'shipped'
        if (orderAfter.status === 'shipped' && orderBefore.status !== 'shipped') {
            const clientEmail = orderAfter.userEmail || orderAfter.shipping?.email;
            if (!clientEmail) {
                console.warn("⚠️ Pas d'email client trouvé pour la notification d'expédition.");
                return null;
            }

            if (!GMAIL_EMAIL.value()) {
                console.error("❌ Email non configuré (GMAIL_EMAIL manquant).");
                return null;
            }

            const adminEmail = GMAIL_EMAIL.value();
            const transporter = createTransporter();
            const orderId = context.params.orderId;

            const clientMailOptions = {
                from: `Tous à Table <${adminEmail}>`,
                to: clientEmail,
                subject: `📦 Votre commande a été expédiée !`,
                html: `
                    <div style="font-family: sans-serif; color: #333; max-width: 600px;">
                        <h1 style="color: #4f46e5;">Bonne nouvelle !</h1>
                        <p>Bonjour ${orderAfter.shipping?.fullName || ''},</p>
                        <p>Votre commande <b>#${orderId.slice(0, 8)}</b> vient d'être expédiée !</p>
                        
                        <div style="background: #eef2ff; padding: 20px; border-radius: 10px; margin: 20px 0;">
                            <h3 style="margin-top:0; color: #4338ca;">En route vers chez vous 🚚</h3>
                            <p>Votre commande a quitté l'Atelier. Elle arrivera prochainement à l'adresse suivante :</p>
                            <p><strong>${orderAfter.shipping?.address}, ${orderAfter.shipping?.city} (${orderAfter.shipping?.postalCode})</strong></p>
                        </div>

                        <p>Vous pouvez retrouver votre facture et suivre votre commande depuis votre <b>Espace Client (onglet Mes Commandes)</b>.</p>
                        
                        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
                            <p style="margin: 0 0 5px 0;"><strong>Besoin d'aide ? Contactez-nous :</strong></p>
                            <p style="margin: 0 0 5px 0; color: #555; font-size: 14px;">📞 07 77 32 41 78</p>
                            <p style="margin: 0; color: #555; font-size: 14px;">📍 346 Chem. de Fleury IFS, France</p>
                        </div>

                        <hr style="border:none; border-top:1px solid #eee; margin: 20px 0;" />
                        <p>À très vite,<br/><i>L'équipe Tous à Table</i></p>
                    </div>
                `
            };

            try {
                await transporter.sendMail(clientMailOptions);
                console.log("✅ Email d'expédition envoyé à", clientEmail);
            } catch (e) {
                console.error("❌ Erreur Envoi Email d'expédition:", e);
            }
        }

        // Check if status changed TO 'completed'
        if (orderAfter.status === 'completed' && orderBefore.status !== 'completed') {
            const clientEmail = orderAfter.userEmail || orderAfter.shipping?.email;
            if (!clientEmail) {
                console.warn("⚠️ Pas d'email client trouvé pour la notification de livraison.");
                return null;
            }

            if (!GMAIL_EMAIL.value()) {
                console.error("❌ Email non configuré (GMAIL_EMAIL manquant).");
                return null;
            }

            const adminEmail = GMAIL_EMAIL.value();
            const transporter = createTransporter();
            const orderId = context.params.orderId;

            const clientMailOptions = {
                from: `Tous à Table <${adminEmail}>`,
                to: clientEmail,
                subject: `✨ Votre commande est arrivée ! Parlez-nous de votre expérience.`,
                html: `
                    <div style="font-family: 'Georgia', serif; color: #1c1917; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e7e5e4; border-radius: 12px;">
                        <div style="text-align: center; margin-bottom: 30px;">
                            <h1 style="color: #059669; font-size: 24px; font-family: sans-serif; text-transform: uppercase; letter-spacing: 2px; margin: 0;">Commande Livrée</h1>
                            <p style="color: #78716c; font-size: 14px; margin-top: 5px; font-family: sans-serif;">La pièce est désormais entre vos mains.</p>
                        </div>
                        
                        <p style="font-size: 16px; line-height: 1.6;">Bonjour <b>${orderAfter.shipping?.fullName || ''}</b>,</p>
                        
                        <p style="font-size: 16px; line-height: 1.6;">
                            Nous espérons que votre nouvelle pièce a trouvé sa place dans votre intérieur et qu'elle vous donne entière satisfaction.
                        </p>
                        
                        <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 20px; margin: 30px 0; border-radius: 4px;">
                            <h3 style="margin-top: 0; color: #047857; font-family: sans-serif; font-size: 16px;">🌟 Votre avis est précieux</h3>
                            <p style="font-size: 15px; line-height: 1.5; color: #065f46; margin-bottom: 20px;">
                                Si vous êtes satisfait de notre travail, <b>un petit mot de votre part serait la plus belle des récompenses</b> pour notre atelier. Cela aide considérablement d'autres passionnés à découvrir notre savoir-faire.
                            </p>
                            <div style="text-align: center;">
                                <a href="https://g.page/r/CepCisGcSHS2EBM/review" target="_blank" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-family: sans-serif; display: inline-block; text-transform: uppercase; letter-spacing: 1px; font-size: 13px;">Laisser un avis sur Google</a>
                            </div>
                        </div>

                        <p style="font-size: 16px; line-height: 1.6; margin-top: 30px;">
                            N'hésitez pas non plus à partager une photo de votre intérieur sur <b>Instagram</b> en nous identifiant, nous adorons voir nos pièces prendre vie chez vous !
                        </p>

                        <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #e7e5e4; text-align: center; color: #78716c; font-family: sans-serif;">
                            <p style="margin: 0; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; font-weight: bold; color: #292524;">Tous à Table — Atelier Normand</p>
                            <p style="margin: 5px 0 0 0; font-size: 12px;">346 Chem. de Fleury IFS, France</p>
                            <p style="margin: 5px 0 0 0; font-size: 12px; color: #10b981;">Merci pour votre confiance.</p>
                        </div>
                    </div>
                `
            };

            try {
                await transporter.sendMail(clientMailOptions);
                console.log("✅ Email de Livraison (Avis) envoyé à", clientEmail);
            } catch (e) {
                console.error("❌ Erreur Envoi Email de Livraison (Avis):", e);
            }
        }

        return null;
    });

exports.shareMeta = functions.https.onRequest(async (req, res) => {
    const SITE_URL = getSiteUrl();
    // SÉCURITÉ: Sanitize productId — alphanumériques et underscores uniquement (Anti-XSS)
    const rawProductId = req.query.product || '';
    const productId = rawProductId.replace(/[^a-zA-Z0-9_-]/g, '');

    let title = "Tous à Table";
    let desc = "Atelier Normand";
    let img = `${SITE_URL}/assets/logo.png`;

    if (productId) {
        // Fetch simple
        try {
            // ... Code fetch produit ...
        } catch (e) { }
    }

    // SÉCURITÉ: Échapper les valeurs injectées dans le HTML
    const escapeHtml = (str) => str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

    const html = `
    <!doctype html>
    <head>
        <title>${escapeHtml(title)}</title>
        <meta property="og:title" content="${escapeHtml(title)}">
        <meta property="og:description" content="${escapeHtml(desc)}">
        <meta property="og:image" content="${escapeHtml(img)}">
        <meta name="twitter:card" content="summary_large_image">
    </head>
    <body>
        <script>window.location.href = "/?product=${productId}";</script>
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
    // 1. Sécurité (Admin ou Super)
    const { isSuper } = checkIsAdmin(context);

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
    // 1. Sécurité (Admin ou Super)
    checkIsAdmin(context);

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
exports.sendTestEmail = functions.runWith({ secrets: [GMAIL_EMAIL, GMAIL_PASSWORD] }).https.onCall(async (data, context) => {
    // 1. Sécurité (Admin ou Super)
    checkIsAdmin(context);

    // Initialisation du transporteur avec les secrets
    const transporter = createTransporter();
    const adminEmail = GMAIL_EMAIL.value();

    // SÉCURITÉ: Ne PAS exposer d'infos système (process.cwd, chemins serveur, etc.)
    const debugInfo = {
        hasEmailEnv: !!adminEmail,
        hasPassEnv: !!GMAIL_PASSWORD.value()
    };

    console.log("🔍 Diagnostic Email:", debugInfo);

    if (!adminEmail || !GMAIL_PASSWORD.value()) {
        return {
            success: false,
            error: "Secrets GMAIL manquants.",
            debug: debugInfo
        };
    }

    const mailOptions = {
        from: `Tous à Table Test <${adminEmail}>`,
        to: adminEmail, // S'envoyer à soi-même
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
    // 1. Sécurité (Admin ou Super)
    checkIsAdmin(context);

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

    const userId = context.auth.uid;

    // ============================================================
    // RATE LIMITING: Max 1 appel / 10 minutes par utilisateur
    // Empêche un attaquant de saturer Firestore avec des écritures en boucle
    // ============================================================
    const rateLimitRef = db.doc(`sys_ratelimit/log_${userId}`);
    const rateLimitSnap = await rateLimitRef.get();
    const rateLimitData = rateLimitSnap.exists ? rateLimitSnap.data() : { count: 0, resetAt: 0 };

    if (Date.now() < rateLimitData.resetAt && rateLimitData.count >= 1) {
        // Silently succeed — on ne veut pas bloquer l'UX, juste ignorer les appels excessifs
        return { success: true, rateLimited: true };
    }

    // Update rate limit (10 min window)
    rateLimitRef.set({ count: 1, resetAt: Date.now() + 600000 }).catch(() => { });

    try {
        // 2. Extraction IP
        // Sur Cloud Functions, l'IP réelle passe par le load balancer dans 'x-forwarded-for'
        const rawIp = context.rawRequest.headers['x-forwarded-for'] || context.rawRequest.connection.remoteAddress;
        // Si plusieurs IPs (proxy chain), on prend la première
        const ip = rawIp ? rawIp.split(',')[0].trim() : 'Unknown';
        const userAgent = context.rawRequest.headers['user-agent'] || 'Unknown';

        // 3. Stockage Sécurisé dans Firestore
        const userRef = db.collection('users').doc(userId);

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
// ⚠️ DANGER ZONE: NETTOYAGE COMPTES ANONYMES
// ============================================================
exports.purgeAnonymousUsers = functions.runWith({ timeoutSeconds: 540, memory: '1GB' }).https.onCall(async (data, context) => {

    // 1. SÉCURITÉ ABSOLUE : SEUL LE SUPER ADMIN PEUT LANCER ÇA
    const SUPER_ADMINS = ['matthis.fradin2@gmail.com'];
    const callerEmail = context.auth?.token.email;

    if (!SUPER_ADMINS.includes(callerEmail)) {
        throw new functions.https.HttpsError('permission-denied', 'ACCÈS REFUSÉ. Seul le Super Admin peut lancer ce nettoyage.');
    }

    console.log(`🚨 STARTING ANONYMOUS USER PURGE initiated by ${callerEmail}`);

    try {
        let nextPageToken;
        const usersToDelete = [];

        // On boucle pour lister tout le monde
        do {
            const listUsersResult = await admin.auth().listUsers(1000, nextPageToken);

            listUsersResult.users.forEach(user => {
                // S'il n'a pas d'email lié ni de fournisseur
                // Un compte Firebase sans email / password ni google est un compte anonyme
                if (!user.email && (!user.providerData || user.providerData.length === 0)) {
                    usersToDelete.push(user.uid);
                }
            });

            nextPageToken = listUsersResult.pageToken;
        } while (nextPageToken);

        if (usersToDelete.length === 0) {
            return { success: true, count: 0, message: `Aucun compte anonyme à supprimer.` };
        }

        // --- DELETE BATCH ---
        let totalDeleted = 0;
        const batchSize = 1000;

        for (let i = 0; i < usersToDelete.length; i += batchSize) {
            const chunk = usersToDelete.slice(i, i + batchSize);
            const cleanupRes = await admin.auth().deleteUsers(chunk);
            totalDeleted += cleanupRes.successCount;
            console.log(`🗑️ Batch delete: ${cleanupRes.successCount} anonymous users removed.`);
        }

        return { success: true, count: totalDeleted, message: `Nettoyage terminé. ${totalDeleted} connexions anonymes supprimées.` };

    } catch (error) {
        console.error("❌ Erreur Purge Anonyme :", error);
        throw new functions.https.HttpsError('internal', error.message);
    }
});

// Purge des Commandes (Backend)
exports.resetAllOrders = functions.https.onCall(async (data, context) => {
    // 1. SÉCURITÉ ABSOLUE
    checkIsSuperAdmin(context);

    console.log(`🚨 STARTING ORDERS PURGE initiated by ${context.auth.token.email}`);

    try {
        const ordersSnapshot = await db.collection('orders').get();
        let deleted = 0;
        const chunks = [];
        let currentChunk = db.batch();

        for (const doc of ordersSnapshot.docs) {
            currentChunk.delete(doc.ref);
            deleted++;
            if (deleted % 500 === 0) {
                chunks.push(currentChunk.commit());
                currentChunk = db.batch();
            }
        }

        if (deleted % 500 !== 0) chunks.push(currentChunk.commit());
        await Promise.all(chunks);

        console.log(`✅ Success: ${deleted} orders purged.`);
        return { success: true, count: deleted };
    } catch (error) {
        console.error("❌ Erreur Reset Orders:", error);
        throw new functions.https.HttpsError('internal', "Erreur lors de la purge des commandes.");
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
                        const subCols = ['bids', 'logs'];
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
    const subCols = ['bids', 'logs'];
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
// ============================================================
// 12. [SUPPRIMÉ] initSuperAdmin — BACKDOOR ELIMINÉE (Audit Sécurité 18/02/2026)
// Cette fonction était un endpoint HTTP public protégé par un mot de passe en clair.
// Le Super Admin est désormais géré UNIQUEMENT via Custom Claims + Firestore.
// ============================================================


// ============================================================
// 13. GENERATEUR SITEMAP XML (SEO DYNAMIQUE)
// ============================================================
exports.sitemap = functions.https.onRequest(async (req, res) => {
    const SITE_URL = 'https://tousatable-madeinnormandie.fr';
    const collections = ['furniture', 'cutting_boards'];
    const appId = 'tat-made-in-normandie';

    try {
        let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
    <url>
        <loc>${SITE_URL}/</loc>
        <changefreq>weekly</changefreq>
        <priority>1.0</priority>
    </url>
    <url>
        <loc>${SITE_URL}/?page=gallery</loc>
        <changefreq>daily</changefreq>
        <priority>0.9</priority>
    </url>`;

        // Fetch items
        for (const colName of collections) {
            const snap = await db.collection(`artifacts/${appId}/public/data/${colName}`).get();

            snap.forEach(doc => {
                const item = doc.data();
                // Filter drafts
                if (item.status && item.status !== 'published') return;

                // Date logic
                let lastMod = new Date().toISOString().split('T')[0];
                if (item.updatedAt && typeof item.updatedAt.toDate === 'function') {
                    lastMod = item.updatedAt.toDate().toISOString().split('T')[0];
                } else if (item.createdAt && typeof item.createdAt.toDate === 'function') {
                    lastMod = item.createdAt.toDate().toISOString().split('T')[0];
                }

                // Image logic
                const imgUrl = (item.images && item.images.length > 0) ? item.images[0] : (item.imageUrl || '');
                const imgTag = imgUrl ? `
        <image:image>
            <image:loc>${imgUrl.replace(/&/g, '&amp;')}</image:loc>
            <image:title>${(item.name || 'Produit').replace(/&/g, '&amp;')}</image:title>
        </image:image>` : '';

                xml += `
    <url>
        <loc>${SITE_URL}/?product=${doc.id}</loc>
        <lastmod>${lastMod}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.7</priority>${imgTag}
    </url>`;
            });
        }

        xml += `
</urlset>`;

        res.set('Content-Type', 'text/xml'); // Better compatibility than application/xml
        // Cache 1h browser, 24h CDN
        res.set('Cache-Control', 'public, max-age=3600, s-maxage=86400');
        res.status(200).send(xml);

    } catch (error) {
        console.error("Sitemap Error:", error);
        res.status(500).send("Error generating sitemap");
    }
});

// ============================================================
// 12. ANALYTICS - GESTION DES SESSIONS (ANONYMOUS & CLIENTS)
// ============================================================

const getGeoFromIp = async (ip) => {
    // Si localhost ou IP masquée
    if (!ip || ip === 'Unknown' || ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.')) return null;
    try {
        const response = await fetch(`http://ip-api.com/json/${ip}?fields=country,regionName,city,status`);
        const data = await response.json();
        if (data.status === 'success') {
            return {
                country: data.country || 'Unknown',
                region: data.regionName || 'Unknown',
                city: data.city || 'Unknown'
            };
        }
        return null;
    } catch (e) {
        console.error("GeoLoc Error:", e);
        return null;
    }
};

exports.initLiveSession = functions.https.onCall(async (data, context) => {
    const rawIp = context.rawRequest.headers['x-forwarded-for'] || context.rawRequest.connection.remoteAddress;
    const ip = rawIp ? rawIp.split(',')[0].trim() : 'Unknown';
    const userAgent = context.rawRequest.headers['user-agent'] || 'Unknown';
    const { userId, type, device, browser, os } = data; // type: 'anonymous' | 'client' | 'admin'

    let geo = await getGeoFromIp(ip);

    const sessionData = {
        userId: userId || 'unknown',
        type: type || 'anonymous',
        ip: ip,
        startedAt: admin.firestore.FieldValue.serverTimestamp(),
        lastActivityAt: admin.firestore.FieldValue.serverTimestamp(),
        duration: 0,
        device: device || 'Unknown',
        browser: browser || 'Unknown',
        os: os || 'Unknown',
        userAgent: userAgent,
        geo: geo || { country: 'Unknown', city: 'Unknown', region: 'Unknown' },
        journey: [],
        sessionActive: true
    };

    try {
        const sessionRef = await db.collection('analytics_sessions').add(sessionData);
        return { success: true, sessionId: sessionRef.id };
    } catch (error) {
        console.error("Init Error:", error);
        throw new functions.https.HttpsError('internal', 'Init failed');
    }
});

exports.syncSession = functions.https.onCall(async (data, context) => {
    const { sessionId, journey, duration, sessionActive } = data;

    if (!sessionId) return { success: false };

    try {
        const sessionRef = db.collection('analytics_sessions').doc(sessionId);
        const updates = {
            lastActivityAt: admin.firestore.FieldValue.serverTimestamp(),
            duration: duration || 0,
            sessionActive: sessionActive !== undefined ? sessionActive : true
        };

        if (journey && journey.length > 0) {
            updates.journey = admin.firestore.FieldValue.arrayUnion(...journey);
        }

        await sessionRef.update(updates);
        return { success: true };
    } catch (error) {
        console.error("Sync Error:", error);
        return { success: false };
    }
});

// ADMIN: Delete a specific session
exports.deleteSession = functions.https.onCall(async (data, context) => {
    if (!context.auth || !context.auth.token.admin && context.auth.token.email !== 'matthis.fradin2@gmail.com') {
        throw new functions.https.HttpsError('permission-denied', 'Admin only');
    }
    const { sessionId } = data;
    if (!sessionId) throw new functions.https.HttpsError('invalid-argument', 'Missing ID');

    try {
        await db.collection('analytics_sessions').doc(sessionId).delete();
        return { success: true };
    } catch (error) {
        console.error("Delete Error:", error);
        throw new functions.https.HttpsError('internal', 'Delete failed');
    }
});

// ADMIN: Clear all analytics data
exports.clearAllAnalytics = functions.https.onCall(async (data, context) => {
    if (!context.auth || !context.auth.token.admin && context.auth.token.email !== 'matthis.fradin2@gmail.com') {
        throw new functions.https.HttpsError('permission-denied', 'Admin only');
    }

    try {
        const sessions = await db.collection('analytics_sessions').get();
        const batch = db.batch();
        sessions.docs.forEach(doc => batch.delete(doc.ref));
        await batch.commit();
        return { success: true, count: sessions.size };
    } catch (error) {
        console.error("Clear All Error:", error);
        throw new functions.https.HttpsError('internal', 'Clear failed');
    }
});
