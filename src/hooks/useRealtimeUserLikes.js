
import { useState, useEffect } from 'react';
import { collectionGroup, query, where, onSnapshot, doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db, appId } from '../firebase/config';

/**
 * Hook pour gérer les likes en temps réel.
 * Écoute la collectionGroup 'likes' filtrée par l'userId courant.
 * Garantit que si un like est supprimé (par l'user ou l'admin trigger), l'UI se met à jour.
 */
export const useRealtimeUserLikes = (user) => {
    const [likedItemIds, setLikedItemIds] = useState([]);

    useEffect(() => {
        if (!user || user.isAnonymous) {
            setLikedItemIds([]);
            return;
        }

        // On écoute TOUS les likes de cet utilisateur sur TOUTES les collections (furniture, cutting_boards...)
        // grâce à collectionGroup.
        const q = query(collectionGroup(db, 'likes'), where('userId', '==', user.uid));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            // On récupère les IDs des PARENTS (les items likés)
            const ids = snapshot.docs.map(doc => doc.ref.parent.parent.id);
            setLikedItemIds(ids);
        });

        return () => unsubscribe();
    }, [user]);

    /**
     * Ajoute ou retire un like.
     * @param {string} itemId - ID du produit
     * @param {string} collectionName - 'furniture' ou 'cutting_boards'
     */
    const toggleLike = async (itemId, collectionName) => {
        if (!user) return; // Should be handled by UI (show login)

        const isLiked = likedItemIds.includes(itemId);
        const likeRef = doc(db, 'artifacts', appId, 'public', 'data', collectionName, itemId, 'likes', user.uid);

        try {
            if (isLiked) {
                // DELETE (Trigger backend fera -1)
                await deleteDoc(likeRef);
            } else {
                // CREATE (Trigger backend fera +1)
                await setDoc(likeRef, {
                    userId: user.uid,
                    likedAt: serverTimestamp()
                });
            }
        } catch (error) {
            console.error("Erreur lors du like:", error);
            throw error;
        }
    };

    return { likedItemIds, toggleLike };
};
