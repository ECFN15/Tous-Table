import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

export const trackAffiliateClick = async ({
    product,
    source,
    isAdmin,
    parentFurnitureId = null,
    parentFurnitureName = null
}) => {
    if (!product?.affiliateUrl) return;

    window.open(product.affiliateUrl, '_blank', 'noopener,noreferrer');

    if (isAdmin) {
        console.log(`[Shop Stats] Admin click on "${product.name}" excluded from tracking.`);
        return;
    }

    // Dispatch for session journey tracking
    window.dispatchEvent(new CustomEvent('affiliate_product_click', {
        detail: {
            productId: product.id || '',
            productName: product.name || '',
            productPrice: product.price || null,
            source: source,
            parentFurnitureId,
            parentFurnitureName
        }
    }));

    try {
        const payload = {
            productId: product.id,
            productName: product.name || '',
            affiliateProgram: product.affiliateProgram || 'direct',
            category: product.category || 'unknown',
            tier: product.tier || 'essentiel',
            timestamp: serverTimestamp(),
            sessionId: sessionStorage.getItem('analytics_session_id') || null,
            source: source
        };

        if (parentFurnitureId) payload.parentFurnitureId = parentFurnitureId;
        if (parentFurnitureName) payload.parentFurnitureName = parentFurnitureName;

        await addDoc(collection(db, 'affiliate_clicks'), payload);
    } catch (error) {
        console.error('Affiliate tracking failed:', error);
    }
};
