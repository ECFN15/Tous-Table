// --- HELPERS ---
export const getMillis = (ts) => {
    if (!ts) return 0;
    if (typeof ts === 'number') return Number.isFinite(ts) ? ts : 0;
    if (ts instanceof Date) return ts.getTime();
    if (typeof ts.toMillis === 'function') return ts.toMillis();
    return ts.seconds * 1000 || 0;
};

export const formatTime = (ts) => {
    const ms = getMillis(ts);
    if (!ms) return "...";
    return new Date(ms).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
};
