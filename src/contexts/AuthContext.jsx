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
    const HARDCODED_ADMINS = ['matthis.fradin2@gmail.com'];
    const ADMIN_EMAILS = HARDCODED_ADMINS; // Backward compatibility

    useEffect(() => {
        // 1. Listen to Admin Whitelist in Firestore
        // Note: db and firestore methods are now imported at top level

        const unsub = onSnapshot(doc(db, 'sys_metadata', 'admin_users'), (snap) => {
            if (snap.exists() && snap.data().users) {
                setAdminWhitelist(snap.data().users);
            }
        }, (err) => console.log("Auth Whitelist Sync Error (Ignored if not admin)", err));

        // 2. Listen to Auth State
        const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);

            // Auto-login anonymously
            if (!currentUser) {
                signInAnonymously(auth).catch((error) => console.error("Anonymous auth failed", error));
            }
        });

        return () => {
            unsub();
            unsubscribeAuth();
        };
    }, []);

    // Derived Admin State
    useEffect(() => {
        if (user && !user.isAnonymous) {
            const isHardcoded = HARDCODED_ADMINS.includes(user.email);
            // Vérification stricte temps réel via Firestore
            // idTokenResult.claims.admin est ignoré pour l'UI car il a une latence de révocation d'1h
            const isWhitelisted = adminWhitelist[user.uid] || Object.values(adminWhitelist).some(u => u.email === user.email);

            if (isHardcoded || isWhitelisted) {
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
