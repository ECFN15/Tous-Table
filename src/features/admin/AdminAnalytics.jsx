import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
    Users, Clock, Activity, Smartphone, Monitor, Globe, Trash2, AlertCircle
} from 'lucide-react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db, functions } from '../../firebase/config';
import { httpsCallable } from 'firebase/functions';
import { getMillis } from '../../utils/time';

// ─── Custom SVG Bar Chart — Premium responsive (remplace Recharts) ──
const TrafficChart = ({ data, darkMode }) => {
    const containerRef = useRef(null);
    const [dims, setDims] = useState({ w: 600, h: 280 });
    const [activeIdx, setActiveIdx] = useState(null);
    const isMobile = dims.w < 500;

    // Marges adaptatives (plus serrées sur mobile)
    const margin = useMemo(() => ({
        top: 20,
        right: isMobile ? 8 : 16,
        bottom: isMobile ? 28 : 36,
        left: isMobile ? 28 : 40
    }), [isMobile]);

    const chartW = dims.w - margin.left - margin.right;
    const chartH = dims.h - margin.top - margin.bottom;

    // ── ResizeObserver ──
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const ro = new ResizeObserver(([entry]) => {
            const { width, height } = entry.contentRect;
            if (width > 0 && height > 0) setDims({ w: width, h: height });
        });
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    // ── Calculs du graphique ──
    const maxVal = useMemo(() => Math.max(1, ...data.map(d => d.visites)), [data]);

    // Y ticks intelligents (moins de ticks sur mobile)
    const yTicks = useMemo(() => {
        const count = isMobile ? 3 : 5;
        const ticks = [];
        const step = Math.max(1, Math.ceil(maxVal / count));
        for (let i = 0; i <= maxVal; i += step) ticks.push(i);
        if (ticks[ticks.length - 1] < maxVal) ticks.push(maxVal);
        return ticks;
    }, [maxVal, isMobile]);

    // Dimensions des barres — minimum garanti pour tactile
    const barMetrics = useMemo(() => {
        const n = data.length;
        if (n === 0) return { barW: 0, gap: 0, total: 0 };

        // Desktop : gap proportionnel, Mobile : gap minimal pour maximiser barW
        const gapRatio = isMobile ? 0.15 : 0.25;
        const totalGaps = n > 1 ? (n - 1) : 0;
        
        // Calcul avec un minimum de 4px par barre (visible) et 1px de gap
        let gap = Math.max(1, Math.round((chartW * gapRatio) / Math.max(1, totalGaps)));
        let barW = n > 0 ? (chartW - gap * totalGaps) / n : 0;
        
        // Si les barres sont trop fines, on réduit le gap
        if (barW < 4 && n > 1) {
            gap = 1;
            barW = (chartW - gap * totalGaps) / n;
        }

        // Minimum absolu de largeur de barre
        barW = Math.max(isMobile ? 3 : 4, barW);

        // Cap la largeur max pour éviter des barres géantes avec peu de données
        barW = Math.min(barW, isMobile ? 40 : 60);

        return { barW, gap, total: n };
    }, [data.length, chartW, isMobile]);

    // Labels X — espacement intelligent selon la taille
    const xLabelInterval = useMemo(() => {
        const maxLabels = isMobile ? 5 : 10;
        return Math.max(1, Math.ceil(data.length / maxLabels));
    }, [data.length, isMobile]);

    // ── Handlers d'interaction (Scrubbing global) ──
    const handlePointerAction = useCallback((e) => {
        // Support pour Event de Souris et Touch natif dans React
        const clientX = e.touches && e.touches.length > 0 ? e.touches[0].clientX : e.clientX;
        if (clientX === undefined) return;
        
        const rect = e.currentTarget.getBoundingClientRect();
        const localX = clientX - rect.left;
        
        const slotW = barMetrics.barW + barMetrics.gap;
        let idx = Math.floor(localX / slotW);
        // Empêcher le débordement des index
        idx = Math.max(0, Math.min(barMetrics.total - 1, idx));
        
        setActiveIdx(idx);
    }, [barMetrics]);

    const handlePointerLeave = useCallback(() => {
        setActiveIdx(null);
    }, []);

    // ── Calcul position tooltip (ancré au-dessus de la barre) ──
    const tooltipInfo = useMemo(() => {
        if (activeIdx === null || !data[activeIdx]) return null;
        const d = data[activeIdx];
        const barX = margin.left + activeIdx * (barMetrics.barW + barMetrics.gap) + barMetrics.barW / 2;
        const barH = d.visites > 0 ? Math.max(2, (d.visites / maxVal) * chartH) : 0;
        const barTopY = margin.top + chartH - barH;

        // Tooltip au-dessus de la barre, centré horizontalement
        let tooltipX = barX;
        let tooltipY = barTopY - 12;

        // Clamper pour ne pas déborder
        const tooltipW = 100;
        tooltipX = Math.max(tooltipW / 2 + 4, Math.min(dims.w - tooltipW / 2 - 4, tooltipX));
        tooltipY = Math.max(4, tooltipY);

        return { x: tooltipX, y: tooltipY, d };
    }, [activeIdx, data, barMetrics, maxVal, chartH, margin, dims.w]);

    return (
        <div ref={containerRef} className="w-full h-full relative select-none"
            style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'pan-y' }}
            onMouseLeave={() => setActiveIdx(null)}
        >
            <svg width={dims.w} height={dims.h} style={{ display: 'block' }}>
                <defs>
                    <linearGradient id="svgBarGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="#059669" stopOpacity={0.5} />
                    </linearGradient>
                    <linearGradient id="svgBarGradActive" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#34d399" stopOpacity={1} />
                        <stop offset="100%" stopColor="#10b981" stopOpacity={0.85} />
                    </linearGradient>
                    <filter id="glowFilter" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="3.5" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                <g transform={`translate(${margin.left},${margin.top})`}>
                    {/* Grille horizontale */}
                    {yTicks.map(tick => {
                        const y = chartH - (tick / maxVal) * chartH;
                        return (
                            <line key={`grid-${tick}`} x1={0} y1={y} x2={chartW} y2={y}
                                stroke={darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'}
                                strokeDasharray="4 4"
                            />
                        );
                    })}

                    {/* Labels Y */}
                    {yTicks.map(tick => {
                        const y = chartH - (tick / maxVal) * chartH;
                        return (
                            <text key={`y-${tick}`} x={-8} y={y + 3.5}
                                textAnchor="end" fontSize={isMobile ? 9 : 10}
                                fill={darkMode ? '#57534e' : '#a8a29e'}
                                fontWeight={500}
                            >{tick}</text>
                        );
                    })}

                    {/* Ligne de base */}
                    <line x1={0} y1={chartH} x2={chartW} y2={chartH}
                        stroke={darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}
                        strokeWidth={1}
                    />

                    {/* Barres */}
                    {data.map((d, i) => {
                        const x = i * (barMetrics.barW + barMetrics.gap);
                        const h = d.visites > 0 ? Math.max(3, (d.visites / maxVal) * chartH) : 0;
                        const y = chartH - h;
                        const isActive = activeIdx === i;
                        const bw = barMetrics.barW;
                        const radius = Math.min(3, bw / 2);

                        return (
                            <g key={i}>
                                {/* Barre active : glow + agrandissement */}
                                {isActive && d.visites > 0 && (
                                    <rect
                                        x={x - Math.min(3, bw * 0.3)}
                                        y={Math.max(0, y - 5)}
                                        width={bw + Math.min(6, bw * 0.6)}
                                        height={h + 5}
                                        rx={radius + 1} ry={radius + 1}
                                        fill="url(#svgBarGradActive)"
                                        filter="url(#glowFilter)"
                                    />
                                )}
                                
                                {/* Barre au repos */}
                                {!isActive && d.visites > 0 && (
                                    <rect
                                        x={x} y={y}
                                        width={bw} height={h}
                                        rx={radius} ry={radius}
                                        fill="url(#svgBarGrad)"
                                    />
                                )}

                                {/* Indicateur slot vide (dot subtil) */}
                                {d.visites === 0 && !isActive && (
                                    <circle
                                        cx={x + bw / 2} cy={chartH - 1}
                                        r={isMobile ? 1 : 1.5}
                                        fill={darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}
                                    />
                                )}
                            </g>
                        );
                    })}

                    {/* Labels X */}
                    {data.map((d, i) => {
                        if (i % xLabelInterval !== 0) return null;
                        const x = i * (barMetrics.barW + barMetrics.gap) + barMetrics.barW / 2;
                        return (
                            <text key={`x-${i}`} x={x} y={chartH + (isMobile ? 16 : 22)}
                                textAnchor="middle" fontSize={isMobile ? 8 : 10}
                                fill={darkMode ? '#57534e' : '#a8a29e'}
                                fontWeight={500}
                            >{d.name}</text>
                        );
                    })}

                    {/* OVERLAY GLOBAL POUR LE SCRUBBING (TACTILE ET SOURIS) */}
                    <rect
                        x={0} y={0} width={chartW} height={chartH}
                        fill="rgba(0,0,0,0)"
                        onPointerDown={handlePointerAction}
                        onPointerMove={handlePointerAction}
                        onPointerLeave={handlePointerLeave}
                        onTouchStart={handlePointerAction}
                        onTouchMove={handlePointerAction}
                        onTouchEnd={handlePointerLeave}
                        style={{ cursor: 'crosshair', pointerEvents: 'all', touchAction: 'pan-y' }}
                    />
                </g>
            </svg>

            {/* ── Tooltip flottant (ancré au-dessus de la barre) ── */}
            {tooltipInfo && tooltipInfo.d.visites > 0 && (
                <div style={{
                    position: 'absolute',
                    left: tooltipInfo.x,
                    top: tooltipInfo.y,
                    transform: 'translate(-50%, -100%)',
                    background: darkMode ? 'rgba(28, 25, 23, 0.95)' : 'rgba(255, 255, 255, 0.97)',
                    backdropFilter: 'blur(8px)',
                    borderRadius: isMobile ? '10px' : '14px',
                    padding: isMobile ? '6px 10px' : '8px 14px',
                    boxShadow: darkMode 
                        ? '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)' 
                        : '0 8px 32px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.04)',
                    pointerEvents: 'none',
                    zIndex: 50,
                    whiteSpace: 'nowrap',
                    transition: 'left 0.12s cubic-bezier(0.4,0,0.2,1), top 0.12s cubic-bezier(0.4,0,0.2,1), opacity 0.15s',
                    opacity: 1,
                }}>
                    {/* Petite flèche vers le bas */}
                    <div style={{
                        position: 'absolute',
                        bottom: -5,
                        left: '50%',
                        transform: 'translateX(-50%) rotate(45deg)',
                        width: 10, height: 10,
                        background: darkMode ? 'rgba(28, 25, 23, 0.95)' : 'rgba(255, 255, 255, 0.97)',
                        boxShadow: darkMode ? '2px 2px 4px rgba(0,0,0,0.3)' : '2px 2px 4px rgba(0,0,0,0.08)',
                    }} />
                    <div style={{
                        position: 'relative', zIndex: 1,
                        fontSize: isMobile ? '9px' : '10px',
                        color: '#78716c', fontWeight: 700, marginBottom: '1px'
                    }}>
                        {tooltipInfo.d.name}
                    </div>
                    <div style={{
                        position: 'relative', zIndex: 1,
                        fontSize: isMobile ? '12px' : '14px',
                        fontWeight: 900, color: '#10b981', textTransform: 'uppercase',
                        letterSpacing: '0.02em'
                    }}>
                        {tooltipInfo.d.visites} visite{tooltipInfo.d.visites > 1 ? 's' : ''}
                    </div>
                </div>
            )}
        </div>
    );
};

const AdminAnalytics = ({ darkMode = false }) => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [timeFilter, setTimeFilter] = useState('1h'); // Default to 1h for real-time vibe // '1h', '1j', '7j', '1mois', '1ans'
    const [expandedSessionId, setExpandedSessionId] = useState(null);
    const [now, setNow] = useState(Date.now());

    // Refresh "now" every 30s to update "Online" vs "Finished" markers
    useEffect(() => {
        const i = setInterval(() => setNow(Date.now()), 10000);
        return () => clearInterval(i);
    }, []);

    // Kpis
    const [kpis, setKpis] = useState({
        uniqueVisitors: 0,
        avgDuration: 0,
        bounceRate: 0,
        mobilePercentage: 0
    });

    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        // We only fetch recent 500 sessions to not overload
        const q = query(
            collection(db, 'analytics_sessions'),
            orderBy('startedAt', 'desc'),
            limit(1000)
        );

        const unsub = onSnapshot(q, (snap) => {
            const data = snap.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // On filtre les admins pour ne pas polluer l'affichage et les stats
            const cleanData = data.filter(s => s.type !== 'admin');
            setSessions(cleanData);
            processData(cleanData, timeFilter);
            setLoading(false);
        });

        return () => unsub();
    }, [timeFilter]);

    const processData = (allSessions, filter) => {
        const rawNow = Date.now();
        let cutoff = 0;
        let step = 0;

        // On ancre le temps sur la minute pile pour éviter la vibration des barres au refresh
        const now = filter === '1h' ? Math.floor(rawNow / 60000) * 60000 : rawNow;

        switch (filter) {
            case '1h':
                step = 60 * 1000; // 1 minute exacte
                cutoff = now - 60 * 60 * 1000; // 1 heure glissante (60 bars)
                break;
            case '1j':
                step = 3600 * 1000; // 1 heure
                cutoff = now - 24 * 3600 * 1000;
                break;
            case '7j':
                step = 6 * 3600 * 1000; // 6 heures
                cutoff = now - 7 * 24 * 3600 * 1000;
                break;
            case '1mois':
                step = 24 * 3600 * 1000; // 1 jour
                cutoff = now - 30 * 24 * 3600 * 1000;
                break;
            case '1ans':
                step = 30 * 24 * 3600 * 1000; // ~1 mois
                cutoff = now - 365 * 24 * 3600 * 1000;
                break;
            default:
                step = 24 * 3600 * 1000;
                cutoff = now - 7 * 24 * 3600 * 1000;
        }

        // Filtre les sessions réelles
        const realTraffic = allSessions.filter(s => {
            const time = s.startedAt ? getMillis(s.startedAt) : 0;
            return time >= cutoff && s.type !== 'admin';
        });

        // 1. Calcul des KPIs (dédupliqué par IP)
        const uniqueIPs = new Set(realTraffic.map(s => s.ip).filter(Boolean));
        const uniques = uniqueIPs.size;
        const totalDuration = realTraffic.reduce((acc, s) => acc + (s.duration || 0), 0);
        const avgDur = uniques > 0 ? Math.round(totalDuration / uniques) : 0;
        const bounces = realTraffic.filter(s => (s.journey && s.journey.length <= 1) || s.duration < 10).length;
        const bRate = uniques > 0 ? Math.round((bounces / uniques) * 100) : 0;
        const mobiles = realTraffic.filter(s => s.device === 'Mobile').length;
        const mRate = uniques > 0 ? Math.round((mobiles / uniques) * 100) : 0;

        setKpis({
            uniqueVisitors: uniques,
            avgDuration: avgDur,
            bounceRate: bRate,
            mobilePercentage: mRate
        });

        // 2. Génération du graphique style TRADING (Continu & Stable)
        const timeline = [];
        for (let t = cutoff; t <= now; t += step) {
            const d = new Date(t);
            const timeLabelStr =
                filter === '1h' ? d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) :
                filter === '1j' ? d.getHours() + 'h' :
                (filter === '7j' || filter === '1mois') ? d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }) :
                d.toLocaleDateString('fr-FR', { month: '2-digit', year: 'numeric' });

            timeline.push({
                timestamp: t,
                name: timeLabelStr,
                visites: 0
            });
        }

        // 3. Remplissage précis (Division temporelle)
        realTraffic.forEach(s => {
            const time = s.startedAt ? getMillis(s.startedAt) : null;
            if (!time) return;

            const offset = time - cutoff;
            const slotIdx = Math.floor(offset / step);

            if (slotIdx >= 0 && slotIdx < timeline.length) {
                timeline[slotIdx].visites += 1;
            }
        });

        setChartData(timeline);
    };

    const formatDuration = (seconds) => {
        if (!seconds) return '0s';
        if (seconds < 60) return `${seconds}s`;
        const min = Math.floor(seconds / 60);
        const sec = seconds % 60;
        return `${min}m ${sec}s`;
    };

    const handleDeleteSession = async (id) => {
        if (!window.confirm("Supprimer cette session ? (Action irréversible)")) return;
        try {
            await httpsCallable(functions, 'deleteSession')({ sessionId: id });
            // Le snapshot s'occupera de rafraîchir la liste
        } catch (e) {
            console.error("Delete error:", e);
            alert("Erreur lors de la suppression");
        }
    };

    const handleClearAll = async () => {
        if (!window.confirm("☢️ ACTION CRITIQUE : Supprimer TOUTES les données d'analytics définitivement ?")) return;
        setLoading(true);
        try {
            await httpsCallable(functions, 'clearAllAnalytics')({});
            setLoading(false);
        } catch (e) {
            console.error("Clear error:", e);
            setLoading(false);
            alert("Erreur lors du nettoyage");
        }
    };

    if (loading) return <div className="p-12 text-center text-stone-400 font-bold animate-pulse">Chargement Data...</div>;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">

            {/* HEADER FILTERS */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h3 className={`text-2xl font-black tracking-tight ${darkMode ? 'text-white' : 'text-stone-900'}`}>Trafic & Croissance</h3>
                    <p className="text-xs text-stone-400 font-bold uppercase tracking-widest mt-1">Analyse des flux réels</p>
                </div>

                <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-3">
                    <button
                        onClick={handleClearAll}
                        className={`px-4 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white active:scale-95`}
                    >
                        Vider tout
                    </button>
                    <div className={`flex p-1 rounded-2xl shadow-sm border overflow-x-auto no-scrollbar ${darkMode ? 'bg-stone-900 border-stone-800' : 'bg-stone-100 border-stone-200'}`}>
                        {['1h', '1j', '7j', '1mois', '1ans'].map(tf => (
                            <button
                                key={tf}
                                onClick={() => { setTimeFilter(tf); processData(sessions, tf); }}
                                className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all whitespace-nowrap ${timeFilter === tf ? (darkMode ? 'bg-white text-stone-900 shadow-lg' : 'bg-white text-stone-900 shadow-sm') : 'text-stone-500 hover:text-stone-700'}`}
                            >
                                {tf}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* KPI ROW */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className={`p-6 rounded-[2rem] shadow-sm transform-gpu transition-all ${darkMode ? 'bg-stone-800 ring-1 ring-inset ring-stone-700' : 'bg-white ring-1 ring-inset ring-stone-100'}`}>
                    <div className="flex justify-between items-start mb-4">
                        <div className={`p-3 rounded-2xl shadow-sm ${darkMode ? 'bg-stone-700' : 'bg-stone-50'}`}><Users size={20} className="text-indigo-500" /></div>
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1">Visites Uniques</p>
                        <h4 className={`text-2xl font-black tracking-tighter ${darkMode ? 'text-white' : 'text-stone-900'}`}>{kpis.uniqueVisitors}</h4>
                    </div>
                </div>

                <div className={`p-6 rounded-[2rem] shadow-sm transform-gpu transition-all ${darkMode ? 'bg-stone-800 ring-1 ring-inset ring-stone-700' : 'bg-white ring-1 ring-inset ring-stone-100'}`}>
                    <div className="flex justify-between items-start mb-4">
                        <div className={`p-3 rounded-2xl shadow-sm ${darkMode ? 'bg-stone-700' : 'bg-emerald-50'}`}><Clock size={20} className="text-emerald-500" /></div>
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1">Durée Moyenne</p>
                        <h4 className={`text-2xl font-black tracking-tighter ${darkMode ? 'text-white' : 'text-stone-900'}`}>{formatDuration(kpis.avgDuration)}</h4>
                    </div>
                </div>

                <div className={`p-6 rounded-[2rem] shadow-sm transform-gpu transition-all ${darkMode ? 'bg-stone-800 ring-1 ring-inset ring-stone-700' : 'bg-white ring-1 ring-inset ring-stone-100'}`}>
                    <div className="flex justify-between items-start mb-4">
                        <div className={`p-3 rounded-2xl shadow-sm ${darkMode ? 'bg-stone-700' : 'bg-amber-50'}`}><Activity size={20} className="text-amber-500" /></div>
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1">Taux de Rebond</p>
                        <h4 className={`text-2xl font-black tracking-tighter ${darkMode ? 'text-white' : 'text-stone-900'}`}>{kpis.bounceRate}%</h4>
                    </div>
                </div>

                <div className={`p-6 rounded-[2rem] shadow-sm transform-gpu transition-all ${darkMode ? 'bg-stone-800 ring-1 ring-inset ring-stone-700' : 'bg-white ring-1 ring-inset ring-stone-100'}`}>
                    <div className="flex justify-between items-start mb-4">
                        <div className={`p-3 rounded-2xl shadow-sm ${darkMode ? 'bg-stone-700' : 'bg-blue-50'}`}><Smartphone size={20} className="text-blue-500" /></div>
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1">Trafic Mobile</p>
                        <h4 className={`text-2xl font-black tracking-tighter ${darkMode ? 'text-white' : 'text-stone-900'}`}>{kpis.mobilePercentage}%</h4>
                    </div>
                </div>
            </div>

            {/* CUSTOM SVG CHART */}
            <div className={`p-4 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-sm transform-gpu transition-all ${darkMode ? 'bg-stone-800 ring-1 ring-inset ring-stone-700' : 'bg-white shadow-[0_0_50px_-12px_rgba(0,0,0,0.05)]'}`}>
                <h3 className={`text-sm md:text-lg font-black uppercase tracking-widest mb-4 md:mb-8 ${darkMode ? 'text-white' : 'text-stone-900'}`}>Évolution du Trafic</h3>
                <div className="h-[240px] md:h-[320px] w-full">
                    {chartData.length > 0 ? (
                        <TrafficChart data={chartData} darkMode={darkMode} />
                    ) : (
                        <div className="flex items-center justify-center h-full text-stone-400 font-bold italic text-sm">Pas assez de données pour la période sélectionnée.</div>
                    )}
                </div>
            </div>

            {/* LIVE SESSIONS TABLE */}
            <div className={`p-6 md:p-8 rounded-[2.5rem] shadow-sm overflow-hidden ${darkMode ? 'bg-stone-800 ring-1 ring-inset ring-stone-700' : 'bg-white ring-1 ring-inset ring-stone-100'}`}>
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h3 className={`text-lg font-black uppercase tracking-widest ${darkMode ? 'text-white' : 'text-stone-900'}`}>Sessions en direct</h3>
                        <p className="text-xs text-stone-400 font-bold mt-1">Surveillance des sessions récentes</p>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 text-red-500 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-red-500"></span> Live Trace
                    </div>
                </div>

                <div className="max-h-[700px] overflow-y-auto custom-scrollbar pr-1 -mr-1">
                    {/* DESKTOP TABLE */}
                    <table className="w-full text-left border-collapse hidden lg:table">
                        <thead className="sticky top-0 z-10">
                            <tr className={`border-b ${darkMode ? 'bg-stone-800 border-stone-700 text-stone-400' : 'bg-white border-stone-200 text-stone-500'} text-[10px] font-black uppercase tracking-widest`}>
                                <th className="pb-4 pt-2 pl-4">Localisation & IP</th>
                                <th className="pb-4 pt-2">Appareil</th>
                                <th className="pb-4 pt-2">Début</th>
                                <th className="pb-4 pt-2">Durée</th>
                                <th className="pb-4 pt-2 text-right pr-4">Parcours</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sessions.map((session) => {
                                const isExpanded = expandedSessionId === session.id;
                                const isClient = session.type === 'client';
                                const isAdminType = session.type === 'admin';
                                const startedTime = session.startedAt ? new Date(getMillis(session.startedAt)).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '--:--';

                                const lastActiveMs = getMillis(session.lastActivityAt);
                                const isInactive = (now - lastActiveMs) > 30000;
                                const isFinished = session.sessionActive === false || isInactive;

                                return (
                                    <React.Fragment key={session.id}>
                                        <tr className={`border-b transition-all group ${darkMode ? 'border-stone-700 hover:bg-stone-700/50' : 'border-stone-100 hover:bg-stone-50'} ${isExpanded ? (darkMode ? 'bg-stone-700/30' : 'bg-stone-50') : ''}`}>
                                            <td className="py-4 pl-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black transition-transform group-hover:scale-110 ${isAdminType ? 'bg-red-100 text-red-600' : (isClient ? 'bg-indigo-100 text-indigo-600 shadow-sm' : 'bg-stone-200 text-stone-600')}`}>
                                                        {isAdminType ? 'AD' : (isClient ? 'CO' : 'AN')}
                                                    </div>
                                                    <div>
                                                        <p className={`font-bold text-sm flex items-center gap-1.5 ${darkMode ? 'text-white' : 'text-stone-900'}`}>
                                                            <Globe size={12} className={darkMode ? 'text-stone-500' : 'text-stone-400'} />
                                                            {session.geo?.city !== 'Unknown' ? `${session.geo.city}, ${session.geo.country}` : 'Ville Inconnue'}
                                                        </p>
                                                        <p className="text-[10px] font-mono text-stone-400 mt-0.5 flex items-center gap-2">
                                                            {session.ip}
                                                            {session.email && <span className="text-indigo-500 font-bold truncate max-w-[150px]" title={session.email}>{session.email}</span>}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4">
                                                <div className="flex items-center gap-2">
                                                    {session.device === 'Mobile' ? <Smartphone size={16} className="text-stone-400" /> : <Monitor size={16} className="text-stone-400" />}
                                                    <div>
                                                        <p className={`text-xs font-bold ${darkMode ? 'text-white' : 'text-stone-900'}`}>{session.device}</p>
                                                        <p className="text-[10px] text-stone-400">{session.os} • {session.browser}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4">
                                                <div className="flex flex-col gap-1">
                                                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg border w-fit ${darkMode ? 'bg-stone-900 text-stone-300 border-stone-700' : 'bg-white text-stone-600 border-stone-200 shadow-sm'}`}>{startedTime}</span>
                                                    {isFinished ? (
                                                        <span className="text-[9px] font-bold text-stone-400 uppercase tracking-tighter flex items-center gap-1 ml-1">
                                                            <div className="w-1 h-1 rounded-full bg-stone-300"></div> Session Terminée
                                                        </span>
                                                    ) : (
                                                        <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-tighter flex items-center gap-1 ml-1 animate-pulse">
                                                            <div className="w-1 h-1 rounded-full bg-emerald-500"></div> En Ligne
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-4 font-bold text-xs text-stone-500 dark:text-stone-400">
                                                {formatDuration(session.duration)}
                                            </td>
                                            <td className="py-4 text-right pr-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleDeleteSession(session.id)}
                                                        className={`p-2 rounded-xl transition-all border border-transparent hover:border-red-500/30 text-stone-400 hover:text-red-500 active:scale-90`}
                                                        title="Supprimer la session"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => setExpandedSessionId(isExpanded ? null : session.id)}
                                                        className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border ${isExpanded ? 'bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-500/20' : (darkMode ? 'bg-stone-800 text-stone-300 border-stone-700 hover:border-stone-500' : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300 shadow-sm')}`}
                                                    >
                                                        {isExpanded ? 'Fermer' : `Tracer (${session.journey?.length || 0})`}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                        {/* EXPANDED ROW (JOURNEY) - DESKTOP */}
                                        {isExpanded && (
                                            <tr className={darkMode ? 'bg-stone-900/50' : 'bg-stone-50/50'}>
                                                <td colSpan="5" className="p-0 border-b border-indigo-100 dark:border-indigo-900/30">
                                                    <div className="p-8 animate-in slide-in-from-top-4 fade-in duration-300">
                                                        <div className="flex items-center gap-3 mb-6">
                                                            <div className="w-1 h-4 bg-amber-500 rounded-full"></div>
                                                            <h4 className={`text-[10px] font-black uppercase tracking-widest ${darkMode ? 'text-stone-400' : 'text-stone-500'}`}>Détail du parcours utilisateur</h4>
                                                        </div>

                                                        <div className="relative border-l-2 border-dashed border-stone-200 dark:border-stone-700 ml-4 space-y-8">
                                                            {(!session.journey || session.journey.length === 0) ? (
                                                                <p className="pl-6 text-sm italic text-stone-400">Aucune action enregistrée pour le moment.</p>
                                                            ) : (
                                                                session.journey.map((step, idx) => (
                                                                    <div key={idx} className="relative pl-8">
                                                                        <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-amber-500 ring-4 ring-white dark:ring-stone-900 shadow-sm"></div>
                                                                        <div className="flex flex-wrap items-center gap-3">
                                                                            <span className="text-[10px] font-black text-amber-500 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-100 dark:border-amber-500/20">{step.time}</span>
                                                                            <p className={`font-bold text-sm ${darkMode ? 'text-white' : 'text-stone-900'}`}>
                                                                                Vue : <span className="uppercase text-amber-600 dark:text-amber-400">{step.page}</span>
                                                                            </p>
                                                                            {step.itemId && (
                                                                                <span className="text-[10px] font-bold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20 px-3 py-1 rounded-full inline-flex items-center gap-2">
                                                                                    {step.itemId.includes('|') ? (
                                                                                        <>
                                                                                            <span className="opacity-40 text-[8px]">REF:</span> {step.itemId.split('|')[0].trim()}
                                                                                            <span className="h-2 w-px bg-indigo-200 dark:bg-indigo-800 mx-1"></span>
                                                                                            <span className="font-black">{step.itemId.split('|')[1].trim()}</span>
                                                                                        </>
                                                                                    ) : (
                                                                                        <>ID: {step.itemId}</>
                                                                                    )}
                                                                                </span>
                                                                            )}
                                                                            <span className="text-[10px] font-black text-stone-400 uppercase tracking-wider ml-auto">
                                                                                {formatDuration(step.duration)}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                ))
                                                            )}
                                                            <div className="relative pl-8 opacity-50">
                                                                <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-stone-300 dark:bg-stone-600 ring-4 ring-white dark:ring-stone-900"></div>
                                                                <p className="text-[10px] font-black uppercase tracking-widest text-stone-500">{!isFinished ? "Navigation en cours..." : "Fin de session"}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>

                    {/* MOBILE CARDS */}
                    <div className="lg:hidden space-y-4">
                        {sessions.map((session) => {
                            const isExpanded = expandedSessionId === session.id;
                            const isClient = session.type === 'client';
                            const isAdminType = session.type === 'admin';
                            const startedTime = session.startedAt ? new Date(getMillis(session.startedAt)).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '--:--';

                            const lastActiveMs = getMillis(session.lastActivityAt);
                            const isInactive = (now - lastActiveMs) > 30000;
                            const isFinished = session.sessionActive === false || isInactive;

                            return (
                                <div
                                    key={session.id}
                                    className={`p-5 rounded-[2rem] border transition-all relative ${isExpanded ? (darkMode ? 'bg-stone-800 border-amber-500/50 ring-1 ring-amber-500/20' : 'bg-white border-amber-200 shadow-xl') : (darkMode ? 'bg-stone-800/50 border-stone-700' : 'bg-stone-50 border-transparent hover:bg-white hover:border-stone-100')}`}
                                >
                                    <div className="absolute top-6 right-6 flex flex-col items-end gap-1">
                                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border ${darkMode ? 'bg-stone-900 text-stone-400 border-stone-700' : 'bg-white text-stone-500 border-stone-200 shadow-sm'}`}>
                                            {startedTime}
                                        </span>
                                        {!isFinished ? (
                                            <span className="text-[8px] font-bold text-emerald-500 uppercase tracking-tighter animate-pulse">En Ligne</span>
                                        ) : (
                                            <span className="text-[8px] font-bold text-stone-400 uppercase tracking-tighter">Terminé</span>
                                        )}
                                    </div>

                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3 overflow-hidden pr-16">
                                            <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black ${isAdminType ? 'bg-red-100 text-red-600' : (isClient ? 'bg-indigo-100 text-indigo-600 shadow-sm' : 'bg-stone-200 text-stone-600')}`}>
                                                {isAdminType ? 'AD' : (isClient ? 'CO' : 'AN')}
                                            </div>
                                            <div className="overflow-hidden">
                                                <p className={`font-bold text-sm tracking-tight truncate ${darkMode ? 'text-white' : 'text-stone-900'}`}>
                                                    {session.geo?.city !== 'Unknown' ? `${session.geo.city}, ${session.geo.country}` : 'Ville Inconnue'}
                                                </p>
                                                <p className="text-[10px] font-mono text-stone-400 mt-1 truncate">{session.ip}</p>
                                                {session.email && <p className="text-[10px] font-bold text-indigo-500 truncate mt-0.5">{session.email}</p>}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between mb-5 px-1 text-stone-500 dark:text-stone-400">
                                        <div className="flex items-center gap-2">
                                            {session.device === 'Mobile' ? <Smartphone size={14} className="text-stone-400" /> : <Monitor size={14} className="text-stone-400" />}
                                            <span className="text-[10px] font-bold">{session.os} • {session.browser}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 font-bold text-[10px] bg-stone-100 dark:bg-stone-900 px-2 py-0.5 rounded-md">
                                            <Clock size={10} />
                                            {formatDuration(session.duration)}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setExpandedSessionId(isExpanded ? null : session.id)}
                                            className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border ${isExpanded ? 'bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-500/20' : (darkMode ? 'bg-stone-800 text-stone-300 border-stone-700' : 'bg-white text-stone-600 border-stone-200 shadow-sm active:bg-stone-50')}`}
                                        >
                                            {isExpanded ? 'Masquer Parcours' : `Tracer Parcours (${session.journey?.length || 0})`}
                                        </button>
                                        <button
                                            onClick={() => handleDeleteSession(session.id)}
                                            className={`p-3 rounded-xl transition-all border ${darkMode ? 'border-stone-700 bg-stone-800 text-stone-400' : 'border-stone-200 bg-white text-stone-400 active:bg-stone-50'}`}
                                            title="Supprimer"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>

                                    {/* EXPANDED CONTENT - MOBILE */}
                                    {isExpanded && (
                                        <div className="mt-6 pt-6 border-t border-stone-100 dark:border-stone-700 animate-in slide-in-from-top-2 fade-in">
                                            <div className="relative border-l-2 border-dashed border-stone-200 dark:border-stone-700 ml-2 space-y-6">
                                                {(!session.journey || session.journey.length === 0) ? (
                                                    <p className="pl-6 text-xs italic text-stone-400">Aucune action enregistrée.</p>
                                                ) : (
                                                    session.journey.map((step, idx) => (
                                                        <div key={idx} className="relative pl-6">
                                                            <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white dark:ring-stone-800"></div>
                                                            <div className="flex flex-col gap-1.5">
                                                                <div className="flex items-center justify-between">
                                                                    <span className="text-[9px] font-black text-amber-600 bg-amber-50 dark:bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-100 dark:border-amber-500/20">{step.time}</span>
                                                                    <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider">{formatDuration(step.duration)}</span>
                                                                </div>
                                                                <p className={`font-bold text-xs ${darkMode ? 'text-white' : 'text-stone-900'}`}>
                                                                    Vue : <span className="uppercase text-amber-500">{step.page}</span>
                                                                </p>
                                                                {step.itemId && (
                                                                    <span className="text-[9px] font-bold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20 px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 w-fit flex-wrap">
                                                                        {step.itemId.includes('|') ? (
                                                                            <>
                                                                                <span className="opacity-40 text-[7px]">REF:</span> <span className="truncate max-w-[100px]">{step.itemId.split('|')[0].trim()}</span>
                                                                                <span className="h-2 w-px bg-indigo-200 dark:bg-indigo-800"></span>
                                                                                <span className="font-black">{step.itemId.split('|')[1].trim()}</span>
                                                                            </>
                                                                        ) : (
                                                                            <>ID: {step.itemId}</>
                                                                        )}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                                <div className="relative pl-6 opacity-50">
                                                    <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-stone-300 dark:bg-stone-600 ring-2 ring-white dark:ring-stone-800"></div>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-stone-500 text-left">{!isFinished ? "Navigation en cours..." : "Fin de session"}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* INFO SECTION */}
            <div className={`p-6 rounded-2xl ${darkMode ? 'bg-stone-800 border border-stone-700' : 'bg-stone-50 border border-stone-200'}`}>
                <div className="flex items-start gap-3">
                    <AlertCircle size={20} className="text-stone-400 mt-0.5" />
                    <div className="text-sm text-stone-400">
                        <p className="mb-2">
                            <strong>Suppression automatique des sessions admin :</strong> Lorsqu'un administrateur se connecte, toutes ses sessions actives (anonymes ou non) sont automatiquement supprimées pour ne pas polluer les statistiques.
                        </p>
                        <p className="mb-2">
                            <strong>Conversion des sessions clients :</strong> Lorsqu'un client se connecte, ses sessions anonymes sont converties et associées à son compte pour un meilleur suivi.
                        </p>
                        <p>
                            <strong>Exclusion par IP :</strong> Les adresses IP des administrateurs sont blacklistées automatiquement pour exclure toute future session de ces IPs.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminAnalytics;
