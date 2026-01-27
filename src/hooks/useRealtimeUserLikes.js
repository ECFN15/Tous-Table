
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
        if (!user) {
            setLikedItemIds([]);
            return;
        }

        // 1. Écoute les likes de l'utilisateur (Collection Group)
        const q = query(collectionGroup(db, 'likes'), where('userId', '==', user.uid));

        const unsubscribeLikes = onSnapshot(q, (snapshot) => {
            const ids = snapshot.docs.map(doc => doc.ref.parent.parent.id);
            setLikedItemIds(ids);
        }, (error) => {
            console.error("Erreur listener likes (Index manquant ?):", error);
        });

        // 2. Écoute le signal de RESET GLOBAL (depuis l'Admin)
        // Cela permet de vider instantanément le state local même si la propagation Firestore est lente
        const resetDocRef = doc(db, 'sys_metadata', 'stats_reset');
        const unsubscribeReset = onSnapshot(resetDocRef, (snap) => {
            if (snap.exists()) {
                const data = snap.data();
                // Si un reset a eu lieu récemment (moins de 10s), on force le vide
                if (data.lastStatsReset) {
                    const resetTime = data.lastStatsReset.toMillis();
                    const now = Date.now();
                    if (now - resetTime < 10000) { // 10 secondes de fenêtre
                        setLikedItemIds([]);
                    }
                }
            }
        });

        return () => {
            unsubscribeLikes();
            unsubscribeReset();
        };
    }, [user]);

    /**
     * Ajoute ou retire un like.
     * @param {string} itemId - ID du produit
     * @param {string} collectionName - 'furniture' ou 'cutting_boards'
     */
    const toggleLike = async (itemId, collectionName) => {
        if (!user) return;

        const isLiked = likedItemIds.includes(itemId);

        // --- OPTIMISTIC UPDATE (UI Rouge Immédiate) ---
        // On met à jour l'état LOCAL tout de suite, sans attendre Firestore.
        // Cela garantit que le bouton devient rouge même si l'index manque ou que le réseau est lent.
        setLikedItemIds(prev => {
            if (prev.includes(itemId)) return prev.filter(id => id !== itemId);
            return [...prev, itemId];
        });

        const likeRef = doc(db, 'artifacts', appId, 'public', 'data', collectionName, itemId, 'likes', user.uid);

        try {
            if (isLiked) {
                await deleteDoc(likeRef);
            } else {
                await setDoc(likeRef, {
                    userId: user.uid,
                    likedAt: serverTimestamp()
                });
            }
        } catch (error) {
            console.error("Erreur lors du like (Revert):", error);
            // Revert en cas de vraie erreur technique (ex: permission)
            // Note: On ne revert PAS si c'est juste un problème d'index de lecture (le write fonctionne souvent)
            setLikedItemIds(prev => {
                if (isLiked) return [...prev, itemId]; // On remet si c'était liké
                return prev.filter(id => id !== itemId); // On retire si c'était pas liké
            });
            alert("Une erreur est survenue lors du like.");
        }
    };

    return { likedItemIds, toggleLike };
};
