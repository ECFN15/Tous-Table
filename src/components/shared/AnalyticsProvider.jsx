import { useEffect, useRef } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';

const ANALYTICS_INIT_DELAY_MS = 6000;
const ANALYTICS_SYNC_INTERVAL_MS = 60000;
const MIN_SYNC_GAP_MS = 45000;
const MIN_BEACON_GAP_MS = 3000;

const isLikelyBot = () => {
    if (typeof navigator === 'undefined') return false;
    const ua = navigator.userAgent || '';
    return /bot|crawler|spider|crawling|googlebot|bingbot|slurp|duckduckbot|baiduspider|yandex|facebookexternalhit|whatsapp|telegrambot|linkedinbot|pinterest|preview/i.test(ua);
};

const getDeviceInfo = () => {
    const ua = navigator.userAgent;

    let device = 'Desktop';
    if (/Mobi|Android|iPhone/i.test(ua)) device = 'Mobile';
    if (/Tablet|iPad/i.test(ua)) device = 'Tablet';

    let browser = 'Unknown';
    if (ua.includes('Chrome')) browser = 'Chrome';
    else if (ua.includes('Safari')) browser = 'Safari';
    else if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('MSIE') || ua.includes('rv:')) browser = 'IE/Edge';

    let os = 'Unknown';
    if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('iPhone') || ua.includes('iPad') || ua.includes('iPod') || ua.includes('like Mac')) os = 'iOS';
    else if (ua.includes('Win')) os = 'Windows';
    else if (ua.includes('Mac')) os = 'MacOS';
    else if (ua.includes('Linux')) os = 'Linux';

    return { device, browser, os };
};

const ANALYTICS_SESSION_ID_KEY = 'analytics_session_id';
const ANALYTICS_SESSION_TOKEN_KEY = 'analytics_session_token';

const readStorageValue = (storage, key) => {
    try {
        return storage?.getItem(key) || null;
    } catch {
        return null;
    }
};

const getStoredAnalyticsSession = () => {
    const sessionId = readStorageValue(sessionStorage, ANALYTICS_SESSION_ID_KEY)
        || readStorageValue(localStorage, ANALYTICS_SESSION_ID_KEY);
    const syncToken = readStorageValue(sessionStorage, ANALYTICS_SESSION_TOKEN_KEY)
        || readStorageValue(localStorage, ANALYTICS_SESSION_TOKEN_KEY);
    if (!sessionId || !syncToken) return null;
    return { sessionId, syncToken };
};

const persistStorageValue = (storage, key, value) => {
    try {
        if (value) storage?.setItem(key, value);
        else storage?.removeItem(key);
    } catch {
        // Storage can be unavailable in hardened private browsing modes.
    }
};

const persistAnalyticsSession = (sessionId, syncToken) => {
    persistStorageValue(sessionStorage, ANALYTICS_SESSION_ID_KEY, sessionId);
    persistStorageValue(sessionStorage, ANALYTICS_SESSION_TOKEN_KEY, syncToken);
    persistStorageValue(localStorage, ANALYTICS_SESSION_ID_KEY, sessionId);
    persistStorageValue(localStorage, ANALYTICS_SESSION_TOKEN_KEY, syncToken);
};

const AnalyticsProvider = ({ view, selectedItemId, selectedItemName, selectedItemPrice, selectedItemContext = null }) => {
    const { user, isAdmin } = useAuth();
    const sessionIdRef = useRef(null);
    const syncTokenRef = useRef(null);
    const initCalledRef = useRef(false);
    const journeyToSend = useRef([]);
    const startTimeRef = useRef(Date.now());
    const activeStartedAtRef = useRef(typeof document !== 'undefined' && document.visibilityState === 'hidden' ? null : Date.now());
    const accumulatedActiveMsRef = useRef(0);
    const lastActionTimeRef = useRef(Date.now());
    const latestViewRef = useRef({ view, selectedItemId, selectedItemName, selectedItemPrice, selectedItemContext });
    const lastRecordedKeyRef = useRef(null);
    const lastSyncAtRef = useRef(0);
    const lastBeaconAtRef = useRef(0);
    const hasRecordedJourneyRef = useRef(false);

    useEffect(() => {
        latestViewRef.current = { view, selectedItemId, selectedItemName, selectedItemPrice, selectedItemContext };
    }, [view, selectedItemId, selectedItemName, selectedItemPrice, selectedItemContext]);

    const getTrackedDuration = () => {
        const activeMs = accumulatedActiveMsRef.current
            + (activeStartedAtRef.current ? Date.now() - activeStartedAtRef.current : 0);
        return Math.max(0, Math.round(activeMs / 1000));
    };

    const pauseActiveTimer = () => {
        if (!activeStartedAtRef.current) return;
        accumulatedActiveMsRef.current += Date.now() - activeStartedAtRef.current;
        activeStartedAtRef.current = null;
    };

    const resumeActiveTimer = () => {
        if (activeStartedAtRef.current) return;
        activeStartedAtRef.current = Date.now();
        lastActionTimeRef.current = Date.now();
    };

    const recordCurrentView = ({ allowPartialDetail = false } = {}) => {
        if (!sessionIdRef.current || isAdmin) return false;

        const current = latestViewRef.current;
        if (current.view === 'detail' && current.selectedItemId && !current.selectedItemName && !allowPartialDetail) return false;

        const actionKey = [
            current.view || '',
            current.selectedItemId || '',
            current.selectedItemName || '',
            current.selectedItemPrice || '',
            current.selectedItemContext?.source || '',
            current.selectedItemContext?.parentFurnitureId || ''
        ].join('|');
        if (lastRecordedKeyRef.current === actionKey) return false;

        const actionTime = Date.now();
        const durationSinceLast = Math.round((actionTime - lastActionTimeRef.current) / 1000);

        let displayId = null;
        if (current.selectedItemId) {
            displayId = current.selectedItemName
                ? `${current.selectedItemId} | ${current.selectedItemName} ${current.selectedItemPrice ? `(${current.selectedItemPrice}EUR)` : ''}`
                : current.selectedItemId;
            if (current.selectedItemContext?.parentFurnitureName) {
                displayId += ` [depuis: ${current.selectedItemContext.parentFurnitureName}]`;
            } else if (current.selectedItemContext?.source) {
                displayId += ` [source: ${current.selectedItemContext.source}]`;
            }
        }

        journeyToSend.current.push({
            page: current.view,
            itemId: displayId,
            time: new Date().toLocaleTimeString('fr-FR'),
            duration: durationSinceLast
        });
        lastRecordedKeyRef.current = actionKey;
        lastActionTimeRef.current = actionTime;
        hasRecordedJourneyRef.current = true;
        return true;
    };

    useEffect(() => {
        let isMounted = true;

        const initSession = async () => {
            if (sessionIdRef.current || initCalledRef.current || !isMounted || isAdmin) return;
            if (!user) return;
            if (isLikelyBot()) return;

            initCalledRef.current = true;

            const userInfo = {
                userId: user.uid || 'anonymous',
                email: user.email || null,
                type: isAdmin ? 'admin' : (user && !user.isAnonymous ? 'client' : 'anonymous'),
                ...getDeviceInfo()
            };
            const storedSession = getStoredAnalyticsSession();
            if (storedSession) {
                userInfo.resumeSessionId = storedSession.sessionId;
                userInfo.resumeSyncToken = storedSession.syncToken;
            }

            try {
                const initRes = await httpsCallable(functions, 'initLiveSession')(userInfo);
                if (initRes.data.success && isMounted) {
                    sessionIdRef.current = initRes.data.sessionId;
                    syncTokenRef.current = initRes.data.syncToken || null;
                    const startedAtMs = Number(initRes.data.startedAtMs);
                    if (Number.isFinite(startedAtMs) && startedAtMs > 0) {
                        startTimeRef.current = startedAtMs;
                    }
                    accumulatedActiveMsRef.current = 0;
                    activeStartedAtRef.current = document.visibilityState === 'hidden' ? null : Date.now();
                    lastActionTimeRef.current = Date.now();
                    persistAnalyticsSession(initRes.data.sessionId, initRes.data.syncToken);
                    recordCurrentView();
                } else {
                    initCalledRef.current = false;
                }
            } catch (error) {
                console.error('Analytics Init Error:', error);
                initCalledRef.current = false;
            }
        };

        const timeout = setTimeout(() => {
            if (!sessionIdRef.current && !initCalledRef.current) initSession();
        }, ANALYTICS_INIT_DELAY_MS);

        return () => {
            isMounted = false;
            clearTimeout(timeout);
        };
    }, [user, isAdmin]);

    useEffect(() => {
        recordCurrentView();
    }, [view, selectedItemId, selectedItemName, selectedItemPrice, selectedItemContext]);

    useEffect(() => {
        const interval = setInterval(() => {
            if (!sessionIdRef.current || isAdmin) return;

            if (!hasRecordedJourneyRef.current) {
                recordCurrentView({ allowPartialDetail: true });
            }

            const totalDuration = getTrackedDuration();
            const chunk = [...journeyToSend.current];
            journeyToSend.current = [];
            lastSyncAtRef.current = Date.now();

            httpsCallable(functions, 'syncSession')({
                sessionId: sessionIdRef.current,
                syncToken: syncTokenRef.current,
                duration: totalDuration,
                journey: chunk,
                sessionActive: document.visibilityState === 'visible'
            }).catch(() => {
                journeyToSend.current = [...chunk, ...journeyToSend.current];
            });
        }, ANALYTICS_SYNC_INTERVAL_MS);

        return () => clearInterval(interval);
    }, [isAdmin]);

    useEffect(() => {
        const handleAffiliateClick = (event) => {
            if (!sessionIdRef.current || isAdmin) return;

            const { productId, productName, productPrice, source, parentFurnitureName } = event.detail;
            const actionTime = Date.now();
            const durationSinceLast = Math.round((actionTime - lastActionTimeRef.current) / 1000);

            let displayId = productId || null;
            if (productId && productName) {
                displayId = `${productId} | ${productName}${productPrice ? ` (${productPrice}EUR)` : ''}`;
            }
            if (parentFurnitureName) {
                displayId += ` [depuis: ${parentFurnitureName}]`;
            }

            journeyToSend.current.push({
                page: `affiliate_${source}`,
                itemId: displayId,
                time: new Date().toLocaleTimeString('fr-FR'),
                duration: durationSinceLast
            });
            hasRecordedJourneyRef.current = true;
            lastActionTimeRef.current = actionTime;
        };

        window.addEventListener('affiliate_product_click', handleAffiliateClick);
        return () => window.removeEventListener('affiliate_product_click', handleAffiliateClick);
    }, [isAdmin]);

    useEffect(() => {
        const sendSessionUpdate = (isActive = true) => {
            if (!sessionIdRef.current || isAdmin) return;
            const now = Date.now();
            if (!isActive && now - lastBeaconAtRef.current < MIN_BEACON_GAP_MS) return;

            if (!hasRecordedJourneyRef.current) {
                recordCurrentView({ allowPartialDetail: true });
            }

            const totalDuration = getTrackedDuration();
            const url = `https://us-central1-${functions.app.options.projectId}.cloudfunctions.net/syncSessionBeacon`;
            const chunk = [...journeyToSend.current];
            if (!isActive) journeyToSend.current = [];
            lastBeaconAtRef.current = now;

            navigator.sendBeacon(url, JSON.stringify({
                sessionId: sessionIdRef.current,
                syncToken: syncTokenRef.current,
                duration: totalDuration,
                journey: chunk,
                sessionActive: isActive
            }));
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                pauseActiveTimer();
                sendSessionUpdate(false);
                return;
            }

            if (document.visibilityState === 'visible' && sessionIdRef.current && !isAdmin) {
                resumeActiveTimer();
                if (Date.now() - lastSyncAtRef.current < MIN_SYNC_GAP_MS && journeyToSend.current.length === 0) return;
                const totalDuration = getTrackedDuration();
                lastSyncAtRef.current = Date.now();
                httpsCallable(functions, 'syncSession')({
                    sessionId: sessionIdRef.current,
                    syncToken: syncTokenRef.current,
                    duration: totalDuration,
                    sessionActive: true
                }).catch(() => {});
            }
        };

        const handleBeforeUnload = () => {
            pauseActiveTimer();
            sendSessionUpdate(false);
        };

        window.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('beforeunload', handleBeforeUnload);
        window.addEventListener('pagehide', handleBeforeUnload);

        return () => {
            window.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('beforeunload', handleBeforeUnload);
            window.removeEventListener('pagehide', handleBeforeUnload);
        };
    }, [isAdmin]);

    return null;
};

export default AnalyticsProvider;
