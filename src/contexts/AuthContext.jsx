import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    onAuthStateChanged,
    signInAnonymously,
    signInWithPopup,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    sendEmailVerification
} from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore'; // Moved top-level
import { auth, googleProvider, db } from '../firebase/config'; // Added db

// Create the context
const AuthContext = createContext();

// Hook to use the context
export const useAuth = () => {
    return useContext(AuthContext);
};

// Provider Component
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    // Admin emails list (Dynamic + Fallback)
    const [adminWhitelist, setAdminWhitelist] = useState({});
    // Authentication relies on Firestore Rules & Custom Claims now.
    // No hardcoded emails in client bundle.

    // 1. Listen to Auth State (Run once)
    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);

            // Auto-login anonymously
            if (!currentUser) {
                signInAnonymously(auth).catch((error) => console.error("Anonymous auth failed", error));
            }
        });

        return () => unsubscribeAuth();
    }, []);

    // 2. Listen to Admin Whitelist (Only if authenticated)
    // Avoids "Permission Denied" errors for anonymous users on secured sys_metadata
    useEffect(() => {
        if (!user) return;

        const unsub = onSnapshot(doc(db, 'sys_metadata', 'admin_users'), (snap) => {
            if (snap.exists() && snap.data().users) {
                setAdminWhitelist(snap.data().users);
            }
        }, (err) => {
            // S'il y a une erreur de droits (normal pour user standard), on l'ignore silencieusement
            // pour ne pas polluer la console.
            // console.debug("Not authorized to read admin whitelist");
        });

        return () => unsub();
    }, [user]);

    // Derived Admin State
    useEffect(() => {
        if (user && !user.isAnonymous) {
            // Vérification stricte temps réel via Firestore
            // idTokenResult.claims.admin est ignoré pour l'UI car il a une latence de révocation d'1h
            const isWhitelisted = adminWhitelist[user.uid] || Object.values(adminWhitelist).some(u => u.email === user.email);

            if (isWhitelisted) {
                setIsAdmin(true);
            } else {
                setIsAdmin(false);
            }
        } else {
            setIsAdmin(false);
        }
    }, [user, adminWhitelist]);

    const loginWithGoogle = () => {
        return signInWithPopup(auth, googleProvider);
    };

    const loginWithEmail = (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    };

    const signupWithEmail = (email, password) => {
        return createUserWithEmailAndPassword(auth, email, password);
    };

    const logout = () => {
        return signOut(auth);
    };

    const verifyEmail = (user) => {
        return sendEmailVerification(user, {
            url: window.location.origin + '?page=gallery',
            handleCodeInApp: true
        });
    };

    const value = {
        user,
        isAdmin,
        loading,
        loginWithGoogle,
        loginWithEmail,
        signupWithEmail,
        logout,
        verifyEmail,
        ADMIN_EMAILS
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
