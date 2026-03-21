import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    onAuthStateChanged,
    signInAnonymously,
    signInWithPopup,
    signInWithRedirect,
    getRedirectResult,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    sendEmailVerification
} from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, googleProvider, db } from '../firebase/config';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase/config';

// Detect iOS standalone PWA mode (added to home screen)
// In this mode, signInWithPopup is blocked by WebKit — must use signInWithRedirect
const isIOSStandalone = () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.userAgent.includes("Mac") && "ontouchend" in document);
    const isStandalone = window.navigator.standalone === true || window.matchMedia('(display-mode: standalone)').matches;
    return isIOS && isStandalone;
};

// Persist redirect flag across page reloads (useRef resets on reload, sessionStorage doesn't)
const REDIRECT_KEY = 'tat_google_redirect_pending';
const setRedirectPending = () => sessionStorage.setItem(REDIRECT_KEY, 'true');
const clearRedirectPending = () => sessionStorage.removeItem(REDIRECT_KEY);
const isRedirectPending = () => sessionStorage.getItem(REDIRECT_KEY) === 'true';

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

    // Authentication relies on Firestore Rules & Custom Claims now.
    // No hardcoded emails in client bundle.

    // 1. Handle redirect result FIRST (before signInAnonymously can fire)
    // On page reload after signInWithRedirect, getRedirectResult resolves with the Google user.
    // The sessionStorage flag prevents signInAnonymously from racing with this.
    useEffect(() => {
        let cancelled = false;
        const handleRedirect = async () => {
            try {
                const result = await getRedirectResult(auth);
                if (result && result.user && !cancelled) {
                    httpsCallable(functions, 'updateUserSessions')()
                        .catch(err => console.error('Failed to clean sessions after redirect login:', err));
                }
            } catch (error) {
                if (!cancelled) {
                    console.error('Redirect auth error:', error);
                }
            } finally {
                // Always clear the flag — redirect is done (success or failure)
                clearRedirectPending();
            }
        };
        handleRedirect();
        return () => { cancelled = true; };
    }, []);

    // 2. Listen to Auth State (Run once)
    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);

            // Auto-login anonymously — but NOT if a Google redirect is pending
            // sessionStorage survives page reloads (unlike useRef which resets)
            if (!currentUser && !isRedirectPending()) {
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

    const loginWithGoogle = async () => {
        if (isIOSStandalone()) {
            // iOS standalone (PWA home screen): signInWithPopup is blocked by WebKit
            // Use signInWithRedirect — page will reload and getRedirectResult handles it above
            // Flag persists in sessionStorage so signInAnonymously won't race after reload
            setRedirectPending();
            await signInWithRedirect(auth, googleProvider);
            return null; // Page reloads, this line won't execute
        }
        // Normal browser (Safari, Chrome, etc.): signInWithPopup works fine
        const result = await signInWithPopup(auth, googleProvider);
        httpsCallable(functions, 'updateUserSessions')()
            .catch(err => console.error('Failed to clean sessions after login:', err));
        return result;
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
