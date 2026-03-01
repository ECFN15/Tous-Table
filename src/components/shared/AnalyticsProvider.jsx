import React, { useEffect, useRef } from 'react';
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

const AnalyticsProvider = ({ view, selectedItemId }) => {
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

        const newAction = {
            page: view,
            itemId: selectedItemId || null,
            time: new Date().toLocaleTimeString('fr-FR'),
            duration: durationSinceLast
        };

        journeyToSend.current.push(newAction);
        lastActionTimeRef.current = actionTime;
    }, [view, selectedItemId]);

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
                sessionActive: true
            }).catch(e => {
                journeyToSend.current = [...chunk, ...journeyToSend.current];
            });

        }, 15000);

        return () => clearInterval(interval);
    }, []);

    // Session Closure Detection (Reliable Approach)
    useEffect(() => {
        const finalizeSession = () => {
            if (!sessionIdRef.current || isAdmin) return;

            const totalDuration = Math.round((Date.now() - startTimeRef.current) / 1000);
            const payload = {
                data: {
                    sessionId: sessionIdRef.current,
                    duration: totalDuration,
                    journey: journeyToSend.current,
                    sessionActive: false
                }
            };

            // Using fetch with keepalive is the modern, more reliable alternative to sendBeacon
            // and it works better with Cloud Functions structured JSON expectations
            const url = `https://us-central1-${functions.app.options.projectId}.cloudfunctions.net/syncSession`;

            fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                keepalive: true
            }).catch(() => { }); // Fire and forget
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                // We could finalize here, but on mobile "hidden" happens often.
                // However, for immediate "Fin de session" feedback, handleBeforeUnload is usually better for Desktop.
            }
        };

        window.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('beforeunload', finalizeSession);

        return () => {
            window.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('beforeunload', finalizeSession);
        };
    }, []);

    return null;
};

export default AnalyticsProvider;
