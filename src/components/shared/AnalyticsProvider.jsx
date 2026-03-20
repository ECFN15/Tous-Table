import { useEffect, useRef } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';

// Simple Device Parser
const getDeviceInfo = () => {
    const ua = navigator.userAgent;
    let device = "Desktop";
    if (/Mobi|Android|iPhone/i.test(ua)) device = "Mobile";
    if (/Tablet|iPad/i.test(ua)) device = "Tablet";

    let browser = "Unknown";
    if (ua.indexOf("Chrome") > -1) browser = "Chrome";
    else if (ua.indexOf("Safari") > -1) browser = "Safari";
    else if (ua.indexOf("Firefox") > -1) browser = "Firefox";
    else if (ua.indexOf("MSIE") > -1 || ua.indexOf("rv:") > -1) browser = "IE/Edge";

    let os = "Unknown";
    if (ua.indexOf("Win") > -1) os = "Windows";
    else if (ua.indexOf("Mac") > -1) os = "MacOS";
    else if (ua.indexOf("Linux") > -1) os = "Linux";
    else if (ua.indexOf("Android") > -1) os = "Android";
    else if (ua.indexOf("like Mac") > -1) os = "iOS";

    return { device, browser, os };
};

const AnalyticsProvider = ({ view, selectedItemId, selectedItemName, selectedItemPrice }) => {
    const { user, isAdmin } = useAuth();
    const sessionIdRef = useRef(null);
    const journeyToSend = useRef([]);
    const startTimeRef = useRef(Date.now());
    const lastActionTimeRef = useRef(Date.now());

    useEffect(() => {
        // Initialize Session ONCE
        let isMounted = true;
        const initSession = async () => {
            if (sessionIdRef.current || !isMounted || isAdmin) return;

            const userInfo = {
                userId: user?.uid || 'anonymous',
                email: user?.email || null,
                type: isAdmin ? 'admin' : (user && !user.isAnonymous ? 'client' : 'anonymous'),
                ...getDeviceInfo()
            };

            try {
                const initRes = await httpsCallable(functions, 'initLiveSession')(userInfo);
                if (initRes.data.success && isMounted) {
                    sessionIdRef.current = initRes.data.sessionId;
                }
            } catch (error) {
                console.error("Analytics Init Error:", error);
            }
        };

        const timeout = setTimeout(() => {
            if (!sessionIdRef.current) initSession();
        }, 2000);

        return () => {
            isMounted = false;
            clearTimeout(timeout);
        };
    }, [user, isAdmin]);

    // Record Action
    useEffect(() => {
        if (!sessionIdRef.current || isAdmin) return;

        const actionTime = Date.now();
        const durationSinceLast = Math.round((actionTime - lastActionTimeRef.current) / 1000);

        // Guard: Wait for item details to populate before recording a DETAIL view
        if (view === 'detail' && selectedItemId && !selectedItemName) return;

        let displayId = null;
        if (selectedItemId) {
            if (selectedItemName) {
                displayId = `${selectedItemId} | ${selectedItemName} ${selectedItemPrice ? `(${selectedItemPrice}€)` : ''}`;
            } else {
                displayId = selectedItemId;
            }
        }

        const newAction = {
            page: view,
            itemId: displayId,
            time: new Date().toLocaleTimeString('fr-FR'),
            duration: durationSinceLast
        };

        journeyToSend.current.push(newAction);
        lastActionTimeRef.current = actionTime;
    }, [view, selectedItemId, selectedItemName, selectedItemPrice]);

    // Heartbeat Sync
    useEffect(() => {
        const interval = setInterval(() => {
            if (!sessionIdRef.current || isAdmin) return;

            const totalDuration = Math.round((Date.now() - startTimeRef.current) / 1000);
            const chunk = [...journeyToSend.current];
            journeyToSend.current = [];

            httpsCallable(functions, 'syncSession')({
                sessionId: sessionIdRef.current,
                duration: totalDuration,
                journey: chunk,
                sessionActive: document.visibilityState === 'visible'
            }).catch(() => {
                journeyToSend.current = [...chunk, ...journeyToSend.current];
            });

        }, 15000);

        return () => clearInterval(interval);
    }, []);

    // Session Closure Detection (Reliable Approach for Mobile & Desktop)
    useEffect(() => {
        const sendSessionUpdate = (isActive = true) => {
            if (!sessionIdRef.current || isAdmin) return;

            const totalDuration = Math.round((Date.now() - startTimeRef.current) / 1000);
            const url = `https://us-central1-${functions.app.options.projectId}.cloudfunctions.net/syncSessionBeacon`;

            // If we are closing/hiding, we send current journey and mark inactive
            const chunk = [...journeyToSend.current];
            if (!isActive) journeyToSend.current = []; // Clear journey if closing

            const payload = JSON.stringify({
                sessionId: sessionIdRef.current,
                duration: totalDuration,
                journey: chunk,
                sessionActive: isActive
            });

            // navigator.sendBeacon is highly reliable for tab closures and app switching on mobile
            // It runs in the background even if the page is being killed/suspended
            navigator.sendBeacon(url, payload);
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                sendSessionUpdate(false);
            } else if (document.visibilityState === 'visible') {
                // Return to active (using standard call is fine here)
                const totalDuration = Math.round((Date.now() - startTimeRef.current) / 1000);
                httpsCallable(functions, 'syncSession')({
                    sessionId: sessionIdRef.current,
                    duration: totalDuration,
                    sessionActive: true
                }).catch(() => { });
            }
        };

        const handleBeforeUnload = () => {
            sendSessionUpdate(false);
        };

        window.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('beforeunload', handleBeforeUnload);
        // Pagehide is often more reliable than beforeunload on mobile
        window.addEventListener('pagehide', handleBeforeUnload);

        return () => {
            window.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('beforeunload', handleBeforeUnload);
            window.removeEventListener('pagehide', handleBeforeUnload);
        };
    }, []);

    return null;
};

export default AnalyticsProvider;
