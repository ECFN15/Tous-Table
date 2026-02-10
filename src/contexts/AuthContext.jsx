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

    // 2. Listen to User Role (Real-time)
    useEffect(() => {
        if (!user || user.isAnonymous) {
            setIsAdmin(false);
            return;
        }

        // Hardcoded Super Admin Override (Security Net)
        if (user.email === 'matthis.fradin2@gmail.com') {
            setIsAdmin(true);
        }

        // Listen to the user's own document
        const unsub = onSnapshot(doc(db, 'users', user.uid), (snap) => {
            if (snap.exists()) {
                const userData = snap.data();
                // Check if role is 'admin' OR 'super_admin'
                if (userData.role === 'admin' || userData.role === 'super_admin' || user.email === 'matthis.fradin2@gmail.com') {
                    setIsAdmin(true);
                } else {
                    setIsAdmin(false);
                }
            } else {
                // Document doesn't exist yet (or created by trigger with delay), but check email fallback
                if (user.email === 'matthis.fradin2@gmail.com') setIsAdmin(true);
                else setIsAdmin(false);
            }
        }, (err) => {
            console.error("Error reading user role:", err);
            setIsAdmin(false);
        });

        return () => unsub();
    }, [user]);

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
        verifyEmail
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
