
import { useState, useEffect } from 'react';
import { collectionGroup, query, where, onSnapshot, doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db, appId } from '../firebase/config';

/**
 * Hook pour gérer les likes en temps réel.
 * Écoute la collectionGroup 'likes' filtrée par l'userId courant.
 * Garantit que si un like est supprimé (par l'user ou l'admin trigger), l'UI se met à jour.
 */
export const useRealtimeUserLikes = (user) => {
    // 1. Initial State from LocalStorage (Sync on mount)
    const [likedItemIds, setLikedItemIds] = useState(() => {
        try {
            const saved = localStorage.getItem('tat_liked_items_v2');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    });

    // Save to LocalStorage whenever state changes
    useEffect(() => {
        localStorage.setItem('tat_liked_items_v2', JSON.stringify(likedItemIds));
    }, [likedItemIds]);

    useEffect(() => {
        if (!user) {
            // Keep local state for anonymous if needed, or clear? 
            // Better keep it to avoid flashing if user is just reconnecting
            return;
        }

        // 2. Listen to Firestore (Source of Truth)
        // If index exists, it will update state. If not, we rely on LocalStorage initial state.
        const q = query(collectionGroup(db, 'likes'), where('userId', '==', user.uid));

        const unsubscribeLikes = onSnapshot(q, (snapshot) => {
            const ids = snapshot.docs.map(doc => doc.ref.parent.parent.id);
            // We trust the server if it answers
            setLikedItemIds(ids);
        }, (error) => {
            // If error (Missing Index), we silently fail and keep LocalStorage state
            console.warn("Firestore Likes Sync skipped (Index likely missing), using LocalStorage persistence.", error.code);
        });

        // 3. Listen for GLOBAL RESET (Admin)
        const resetDocRef = doc(db, 'sys_metadata', 'stats_reset');
        const unsubscribeReset = onSnapshot(resetDocRef, (snap) => {
            if (snap.exists()) {
                const data = snap.data();
                if (data.lastStatsReset) {
                    const resetTime = data.lastStatsReset.toMillis();
                    const now = Date.now();
                    // If reset happened recently (< 10s), force clear everything
                    if (now - resetTime < 10000) {
                        setLikedItemIds([]);
                        localStorage.removeItem('tat_liked_items_v2');
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
     * Add or Remove Like
     */
    const toggleLike = async (itemId, collectionName) => {
        if (!user) return;

        const isLiked = likedItemIds.includes(itemId);

        // OPTIMISTIC UPDATE
        const newIds = isLiked
            ? likedItemIds.filter(id => id !== itemId)
            : [...likedItemIds, itemId];

        setLikedItemIds(newIds); // Triggers useEffect -> LocalStorage save

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
            console.error("Like Error (Reverting):", error);
            // Revert state if REAL error (not just listener error)
            setLikedItemIds(prev => isLiked ? [...prev, itemId] : prev.filter(id => id !== itemId));
            alert("Erreur de connexion. Action annulée.");
        }
    };

    return { likedItemIds, toggleLike };
};
