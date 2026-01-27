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
import { auth, googleProvider } from '../firebase/config';

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

    // Admin emails list (Moved from App.jsx)
    const ADMIN_EMAILS = ['matthis.fradin2@gmail.com'];

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);

            // Admin Check Logic
            const isRealAdmin = currentUser && !currentUser.isAnonymous && ADMIN_EMAILS.includes(currentUser.email);
            setIsAdmin(isRealAdmin);

            setLoading(false);

            // Auto-login anonymously if not logged in (to track user session for cart, etc.)
            if (!currentUser) {
                signInAnonymously(auth).catch((error) => {
                    console.error("Anonymous auth failed", error);
                });
            }
        });

        return () => unsubscribe();
    }, []);

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
