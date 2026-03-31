import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
    Users, Clock, Activity, Smartphone, Monitor, Globe, Trash2, AlertCircle, ChevronDown, ChevronRight,
    TrendingUp, MousePointerClick, ShoppingBag
} from 'lucide-react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db, functions, appId } from '../../firebase/config';
import { httpsCallable } from 'firebase/functions';
import { getMillis } from '../../utils/time';

// ─── Custom SVG Bar Chart — Premium responsive (remplace Recharts) ──
const TrafficChart = ({ data, darkMode, valueLabel = 'visite' }) => {
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

        // Cap la largeur max — plafond serré pour une cohérence visuelle quel que soit le nb de barres
        barW = Math.min(barW, isMobile ? 18 : 28);

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
                        {tooltipInfo.d.visites} {valueLabel}{tooltipInfo.d.visites > 1 ? 's' : ''}
                    </div>
                </div>
            )}
        </div>
    );
};

// ─── Boutique Affiliation Analytics ───────────────────────────────────────────
const PROG_LABELS_B = { amazon: 'Amazon', manomano: 'ManoMano', leroymerlin: 'Leroy Merlin', rakuten: 'Rakuten', castorama: 'Castorama', direct: 'Direct' };
const PROG_COLORS_B = { amazon: '#FF9900', manomano: '#2ECC71', leroymerlin: '#006600', rakuten: '#BF0000', castorama: '#FF6600', direct: '#6B7280' };
const TIER_LABELS_B = { essentiel: 'Essentiel', premium: 'Premium', expert: 'Expert' };
const TIER_COLORS_B = { essentiel: '#78716c', premium: '#f59e0b', expert: '#e2e8f0' };

const BoutiqueAnalytics = ({ darkMode }) => {
    const [clicks, setClicks] = useState([]);
    const [loadingClicks, setLoadingClicks] = useState(true);
    const [timeFilter, setTimeFilter] = useState('7j');

    useEffect(() => {
        const q = query(collection(db, 'affiliate_clicks'), orderBy('timestamp', 'desc'), limit(3000));
        const unsub = onSnapshot(q, snap => {
            setClicks(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            setLoadingClicks(false);
        }, () => setLoadingClicks(false));
        return () => unsub();
    }, []);

    const filteredClicks = useMemo(() => {
        const now = Date.now();
        let cutoff = 0;
        if (timeFilter === '1j') cutoff = now - 24 * 3600 * 1000;
        else if (timeFilter === '7j') cutoff = now - 7 * 24 * 3600 * 1000;
        else if (timeFilter === '30j') cutoff = now - 30 * 24 * 3600 * 1000;
        return clicks.filter(c => getMillis(c.timestamp) >= cutoff);
    }, [clicks, timeFilter]);

    const chartData = useMemo(() => {
        const now = Date.now();
        let cutoff, step, fmt;
        if (timeFilter === '1j') {
            cutoff = now - 24 * 3600 * 1000; step = 3600 * 1000;
            fmt = t => new Date(t).getHours() + 'h';
        } else if (timeFilter === '7j') {
            cutoff = now - 7 * 24 * 3600 * 1000; step = 24 * 3600 * 1000;
            fmt = t => new Date(t).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
        } else if (timeFilter === '30j') {
            cutoff = now - 30 * 24 * 3600 * 1000; step = 24 * 3600 * 1000;
            fmt = t => new Date(t).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
        } else {
            const ts = clicks.map(c => getMillis(c.timestamp)).filter(Boolean);
            cutoff = ts.length > 0 ? Math.min(...ts) : now - 30 * 24 * 3600 * 1000;
            const range = now - cutoff;
            step = range > 60 * 24 * 3600 * 1000 ? 7 * 24 * 3600 * 1000 : 24 * 3600 * 1000;
            fmt = t => new Date(t).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
        }
        const timeline = [];
        for (let t = cutoff; t <= now; t += step) timeline.push({ timestamp: t, name: fmt(t), visites: 0 });
        filteredClicks.forEach(c => {
            const t = getMillis(c.timestamp);
            if (!t) return;
            const idx = Math.floor((t - cutoff) / step);
            if (idx >= 0 && idx < timeline.length) timeline[idx].visites += 1;
        });
        return timeline;
    }, [clicks, filteredClicks, timeFilter]);

    const topProducts = useMemo(() => {
        const counts = {};
        filteredClicks.forEach(c => {
            if (!c.productId) return;
            if (!counts[c.productId]) counts[c.productId] = { id: c.productId, name: c.productName || '—', count: 0, program: c.affiliateProgram, tier: c.tier };
            counts[c.productId].count += 1;
        });
        return Object.values(counts).sort((a, b) => b.count - a.count);
    }, [filteredClicks]);

    const byProgram = useMemo(() => {
        const counts = {};
        filteredClicks.forEach(c => { const p = c.affiliateProgram || 'direct'; counts[p] = (counts[p] || 0) + 1; });
        return Object.entries(counts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
    }, [filteredClicks]);

    const byTier = useMemo(() => {
        const counts = {};
        filteredClicks.forEach(c => { const t = c.tier || 'essentiel'; counts[t] = (counts[t] || 0) + 1; });
        return Object.entries(counts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
    }, [filteredClicks]);

    const kpis = useMemo(() => {
        const peak = chartData.length > 0 ? chartData.reduce((best, d) => d.visites > best.visites ? d : best, chartData[0]) : null;
        return { total: filteredClicks.length, uniqueProducts: topProducts.length, topProg: byProgram[0] || null, peak };
    }, [filteredClicks, topProducts, byProgram, chartData]);

    if (loadingClicks) return <div className="p-12 text-center text-stone-400 font-bold animate-pulse">Chargement Boutique Data...</div>;

    const maxTop = topProducts[0]?.count || 1;
    const maxProg = byProgram[0]?.count || 1;
    const maxTier = byTier[0]?.count || 1;

    return (
        <div className="space-y-6">
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h3 className={`text-2xl font-black tracking-tight ${darkMode ? 'text-white' : 'text-stone-900'}`}>Le Comptoir</h3>
                    <p className="text-[10px] text-stone-500 font-bold uppercase tracking-widest mt-1">Analytics Affiliation</p>
                </div>
                <div className={`flex p-1 rounded-xl border ${darkMode ? 'bg-stone-900 border-white/5' : 'bg-stone-100 border-stone-200'}`}>
                    {[{ id: '1j', label: '24h' }, { id: '7j', label: '7j' }, { id: '30j', label: '30j' }, { id: 'tout', label: 'Tout' }].map(tf => (
                        <button key={tf.id} onClick={() => setTimeFilter(tf.id)}
                            className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${timeFilter === tf.id ? (darkMode ? 'bg-white/10 text-white shadow-sm border border-white/10' : 'bg-white text-stone-900 shadow-sm border border-stone-200') : 'text-stone-500 hover:text-stone-300'}`}>
                            {tf.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* KPI GRID */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                    { label: 'Clics Totaux', value: kpis.total, sub: 'sur la période', accent: 'text-amber-400', icon: MousePointerClick },
                    { label: 'Produits Cliqués', value: kpis.uniqueProducts, sub: 'produits distincts', accent: 'text-blue-400', icon: ShoppingBag },
                    { label: 'Top Programme', value: kpis.topProg ? (PROG_LABELS_B[kpis.topProg.name] || kpis.topProg.name) : '—', sub: kpis.topProg ? `${kpis.topProg.count} clics` : 'aucun', accent: 'text-orange-400', icon: TrendingUp },
                    { label: 'Pic de Clics', value: kpis.peak?.visites || 0, sub: kpis.peak?.visites > 0 ? kpis.peak.name : '—', accent: 'text-emerald-400', icon: Activity },
                ].map((kpi, i) => (
                    <div key={i} className={`p-4 sm:p-5 rounded-2xl border ${darkMode ? 'bg-[#161616] border-white/5' : 'bg-white border-stone-100 shadow-sm'}`}>
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] text-stone-500 truncate">{kpi.label}</p>
                            <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${darkMode ? 'bg-white/5' : 'bg-stone-50'}`}>
                                <kpi.icon size={13} className={kpi.accent} />
                            </div>
                        </div>
                        <h4 className={`text-xl sm:text-2xl md:text-3xl font-black tracking-tighter ${darkMode ? 'text-white' : 'text-stone-900'}`}>{kpi.value}</h4>
                        <p className={`text-[9px] mt-1 font-bold ${kpi.accent}`}>{kpi.sub}</p>
                    </div>
                ))}
            </div>

            {/* CHART */}
            <div className={`p-6 md:p-8 rounded-[2rem] border ${darkMode ? 'bg-[#161616] border-white/5' : 'bg-white border-stone-100 shadow-sm'}`}>
                <div className="flex items-center justify-between mb-8">
                    <h3 className={`text-[10px] font-black uppercase tracking-[0.3em] ${darkMode ? 'text-white/40' : 'text-stone-400'}`}>Évolution des Clics</h3>
                </div>
                <div className="h-[200px] md:h-[260px] w-full">
                    {chartData.some(d => d.visites > 0) ? (
                        <TrafficChart data={chartData} darkMode={darkMode} valueLabel="clic" />
                    ) : (
                        <div className="flex items-center justify-center h-full text-stone-500 font-bold italic text-xs">Aucun clic sur cette période.</div>
                    )}
                </div>
            </div>

            {/* BOTTOM GRID */}
            {filteredClicks.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Classement Produits */}
                    <div className={`lg:col-span-2 p-5 rounded-2xl border ${darkMode ? 'bg-[#161616] border-white/5' : 'bg-white border-stone-100 shadow-sm'}`}>
                        <p className={`text-[9px] font-black uppercase tracking-widest mb-4 ${darkMode ? 'text-stone-500' : 'text-stone-400'}`}>Classement Produits</p>
                        <div className="space-y-3">
                            {topProducts.slice(0, 8).map((p, i) => {
                                const rankStyle = i === 0 ? 'text-amber-400' : i === 1 ? 'text-stone-300' : 'text-stone-600';
                                const pct = Math.round((p.count / maxTop) * 100);
                                return (
                                    <div key={p.id} className="flex items-center gap-3">
                                        <span className={`text-[10px] font-black w-5 text-center shrink-0 ${rankStyle}`}>#{i + 1}</span>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className={`text-[11px] font-bold truncate ${darkMode ? 'text-stone-200' : 'text-stone-800'}`}>{p.name}</span>
                                                <span className={`text-[11px] font-black ml-2 shrink-0 tabular-nums ${darkMode ? 'text-white' : 'text-stone-900'}`}>{p.count}</span>
                                            </div>
                                            <div className={`h-1 rounded-full overflow-hidden ${darkMode ? 'bg-white/5' : 'bg-stone-100'}`}>
                                                <div className="h-full rounded-full bg-amber-500 transition-all duration-500" style={{ width: `${pct}%` }} />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            {topProducts.length > 8 && <p className={`text-[9px] pt-1 ${darkMode ? 'text-stone-600' : 'text-stone-400'}`}>+ {topProducts.length - 8} autres produits avec des clics</p>}
                        </div>
                    </div>

                    {/* Stats secondaires */}
                    <div className="space-y-4">
                        {/* Par Programme */}
                        <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-[#161616] border-white/5' : 'bg-white border-stone-100 shadow-sm'}`}>
                            <p className={`text-[9px] font-black uppercase tracking-widest mb-4 ${darkMode ? 'text-stone-500' : 'text-stone-400'}`}>Par Programme</p>
                            <div className="space-y-2.5">
                                {byProgram.map(({ name, count }) => {
                                    const pct = Math.round((count / maxProg) * 100);
                                    const color = PROG_COLORS_B[name] || '#6B7280';
                                    return (
                                        <div key={name}>
                                            <div className="flex items-center justify-between mb-1">
                                                <div className="flex items-center gap-1.5">
                                                    <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                                                    <span className={`text-[10px] font-bold ${darkMode ? 'text-stone-300' : 'text-stone-700'}`}>{PROG_LABELS_B[name] || name}</span>
                                                </div>
                                                <span className={`text-[10px] font-black tabular-nums ${darkMode ? 'text-stone-400' : 'text-stone-500'}`}>{count}</span>
                                            </div>
                                            <div className={`h-1 rounded-full overflow-hidden ${darkMode ? 'bg-white/5' : 'bg-stone-100'}`}>
                                                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Par Gamme */}
                        <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-[#161616] border-white/5' : 'bg-white border-stone-100 shadow-sm'}`}>
                            <p className={`text-[9px] font-black uppercase tracking-widest mb-4 ${darkMode ? 'text-stone-500' : 'text-stone-400'}`}>Par Gamme</p>
                            <div className="space-y-2.5">
                                {byTier.map(({ name, count }) => {
                                    const pct = Math.round((count / maxTier) * 100);
                                    const color = TIER_COLORS_B[name] || '#6B7280';
                                    return (
                                        <div key={name}>
                                            <div className="flex items-center justify-between mb-1">
                                                <span className={`text-[10px] font-bold ${darkMode ? 'text-stone-300' : 'text-stone-700'}`}>{TIER_LABELS_B[name] || name}</span>
                                                <span className={`text-[10px] font-black tabular-nums ${darkMode ? 'text-stone-400' : 'text-stone-500'}`}>{count}</span>
                                            </div>
                                            <div className={`h-1 rounded-full overflow-hidden ${darkMode ? 'bg-white/5' : 'bg-stone-100'}`}>
                                                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className={`p-12 text-center rounded-2xl border ${darkMode ? 'bg-[#161616] border-white/5 text-stone-500' : 'bg-stone-50 border-stone-100 text-stone-400'} font-bold text-sm italic`}>
                    Aucun clic enregistré sur cette période.
                </div>
            )}
        </div>
    );
};

// ─── Analytics Principal ───────────────────────────────────────────────────────
const AdminAnalytics = ({ darkMode = false }) => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [timeFilter, setTimeFilter] = useState('1j'); // Default to 24h // '1h', '1j', '7j', '1mois', '1ans'
    const [expandedSessionId, setExpandedSessionId] = useState(null);
    const [now, setNow] = useState(Date.now());
    const [currentPage, setCurrentPage] = useState(1);
    const DAYS_PER_PAGE = 10;
    const [view, setView] = useState('traffic');

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

    // ─── Groupement des sessions par jour ───
    const groupedByDay = useMemo(() => {
        const groups = {};
        const today = new Date().toLocaleDateString('fr-FR');
        const yesterday = new Date(Date.now() - 86400000).toLocaleDateString('fr-FR');

        sessions.forEach(s => {
            const dateObj = new Date(getMillis(s.startedAt));
            const dateKey = dateObj.toLocaleDateString('fr-FR');
            
            let label = dateKey;
            if (dateKey === today) label = "Aujourd'hui";
            else if (dateKey === yesterday) label = "Hier";

            if (!groups[dateKey]) {
                groups[dateKey] = {
                    key: dateKey,
                    label,
                    timestamp: dateObj.getTime(),
                    items: []
                };
            }
            groups[dateKey].items.push(s);
        });

        return Object.values(groups).sort((a, b) => b.timestamp - a.timestamp);
    }, [sessions]);

    const totalPages = Math.ceil(groupedByDay.length / DAYS_PER_PAGE);
    const paginatedGroups = useMemo(() => {
        const start = (currentPage - 1) * DAYS_PER_PAGE;
        return groupedByDay.slice(start, start + DAYS_PER_PAGE);
    }, [groupedByDay, currentPage]);

    // Reset pagination when data changes significantly
    useEffect(() => {
        setCurrentPage(1);
    }, [timeFilter]);

    // ─── Sessions en ligne (Live) ───
    const liveSessions = useMemo(() => {
        return sessions.filter(s => {
            const lastActiveMs = getMillis(s.lastActivityAt);
            const isInactive = (now - lastActiveMs) > 30000;
            return s.sessionActive !== false && !isInactive;
        });
    }, [sessions, now]);

    const [openDays, setOpenDays] = useState({});
    
    // Ouvrir par défaut le premier jour (Aujourd'hui)
    useEffect(() => {
        if (groupedByDay.length > 0) {
            const firstKey = groupedByDay[0].key;
            setOpenDays(prev => {
                // Si on n'a encore rien d'ouvert, on ouvre le premier jour
                if (Object.keys(prev).length === 0) {
                    return { [firstKey]: true };
                }
                return prev;
            });
        }
    }, [groupedByDay.length]);

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

        // 1. Calcul des KPIs
        const uniqueIPs = new Set(realTraffic.map(s => s.ip).filter(Boolean));
        const uniques = uniqueIPs.size;
        const totalSessions = realTraffic.length;
        const totalDuration = realTraffic.reduce((acc, s) => acc + (s.duration || 0), 0);
        // Durée moyenne par session (pas par IP unique)
        const avgDur = totalSessions > 0 ? Math.round(totalDuration / totalSessions) : 0;
        // Taux de rebond = sessions à 1 page OU < 10s / total sessions
        const bounces = realTraffic.filter(s => (s.journey && s.journey.length <= 1) || s.duration < 10).length;
        const bRate = totalSessions > 0 ? Math.round((bounces / totalSessions) * 100) : 0;
        const mobiles = realTraffic.filter(s => s.device === 'Mobile').length;
        const mRate = totalSessions > 0 ? Math.round((mobiles / totalSessions) * 100) : 0;

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

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* VIEW SWITCHER */}
            <div className={`flex items-center gap-2 p-1 rounded-2xl border w-fit ${darkMode ? 'bg-stone-900 border-white/5' : 'bg-stone-100 border-stone-200'}`}>
                <button
                    onClick={() => setView('traffic')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${view === 'traffic' ? (darkMode ? 'bg-white text-stone-900' : 'bg-stone-900 text-white') : 'text-stone-500 hover:text-stone-300'}`}
                >
                    <Activity size={11} />
                    Traffic & Sessions
                </button>
                <button
                    onClick={() => setView('boutique')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${view === 'boutique' ? 'bg-amber-500 text-stone-900' : 'text-stone-500 hover:text-stone-300'}`}
                >
                    <ShoppingBag size={11} />
                    Boutique Affiliation
                </button>
            </div>

            {view === 'boutique' ? (
                <BoutiqueAnalytics darkMode={darkMode} />
            ) : loading ? (
                <div className="p-12 text-center text-stone-400 font-bold animate-pulse">Chargement Data...</div>
            ) : (<>

            {/* HEADER FILTERS */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h3 className={`text-2xl font-black tracking-tight ${darkMode ? 'text-white' : 'text-stone-900'}`}>Analytics</h3>
                    <p className="text-[10px] text-stone-500 font-bold uppercase tracking-widest mt-1">Flux & Comportements</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={handleClearAll}
                        className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-red-500/20 text-red-500/60 hover:bg-red-500 hover:text-white active:scale-95`}
                    >
                        Purger Data
                    </button>
                    <div className={`flex p-1 rounded-xl border ${darkMode ? 'bg-stone-900 border-white/5' : 'bg-stone-100 border-stone-200'}`}>
                        {['1h', '1j', '7j', '1mois', '1ans'].map(tf => (
                            <button
                                key={tf}
                                onClick={() => { setTimeFilter(tf); processData(sessions, tf); }}
                                className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${timeFilter === tf ? (darkMode ? 'bg-white/10 text-white shadow-sm border border-white/10' : 'bg-white text-stone-900 shadow-sm border border-stone-200') : 'text-stone-500 hover:text-stone-300'}`}
                            >
                                {tf}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* KPI BENTO GRID */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 lg:gap-6">
                {[
                    { label: 'Visiteurs Uniques', value: kpis.uniqueVisitors, color: 'text-blue-500' },
                    { label: 'Durée Moyenne', value: formatDuration(kpis.avgDuration), color: 'text-emerald-500' },
                    { label: 'Taux de Rebond', value: `${kpis.bounceRate}%`, color: 'text-amber-500' },
                    { label: 'Trafic Mobile', value: `${kpis.mobilePercentage}%`, color: 'text-indigo-500' }
                ].map((kpi, i) => (
                    <div key={i} className={`p-4 sm:p-5 rounded-2xl border transition-all ${darkMode ? 'bg-[#161616] border-white/5' : 'bg-white border-stone-100 shadow-sm'}`}>
                        <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] text-stone-500 mb-1.5 sm:mb-2 truncate">{kpi.label}</p>
                        <h4 className={`text-xl sm:text-2xl md:text-3xl font-black tracking-tighter ${darkMode ? 'text-white' : 'text-stone-900'}`}>{kpi.value}</h4>
                    </div>
                ))}
            </div>

            {/* CUSTOM SVG CHART BENTO */}
            <div className={`p-6 md:p-8 rounded-[2rem] border transition-all ${darkMode ? 'bg-[#161616] border-white/5' : 'bg-white border-stone-100 shadow-sm'}`}>
                <div className="flex items-center justify-between mb-8">
                    <h3 className={`text-[10px] font-black uppercase tracking-[0.3em] ${darkMode ? 'text-white/40' : 'text-stone-400'}`}>Évolution du Trafic</h3>
                </div>
                <div className="h-[240px] md:h-[320px] w-full">
                    {chartData.length > 0 ? (
                        <TrafficChart data={chartData} darkMode={darkMode} />
                    ) : (
                        <div className="flex items-center justify-center h-full text-stone-500 font-bold italic text-xs">Pas assez de données.</div>
                    )}
                </div>
            </div>

            {/* LIVE SESSIONS BAR (MODULE 3) */}
            {liveSessions.length > 0 && (
                <div className={`p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 animate-pulse-slow`}>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex items-center gap-2 text-emerald-500 shrink-0">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></div>
                            <span className="text-[10px] font-black uppercase tracking-widest leading-none translate-y-[1px]">{liveSessions.length} Actif{liveSessions.length > 1 ? 's' : ''}</span>
                        </div>
                        <div className="flex flex-wrap gap-2 text-[9px] font-bold text-emerald-500/60 transition-all">
                            {liveSessions.slice(0, 5).map(ls => (
                                <span key={ls.id} className="px-2 py-1 rounded-lg border border-emerald-500/10 bg-emerald-500/5 whitespace-nowrap">
                                    {ls.geo?.city && ls.geo.city !== 'Unknown' ? ls.geo.city : 'Inconnu'} • {ls.device || 'PC'}
                                </span>
                            ))}
                            {liveSessions.length > 5 && <span className="px-2 py-1 rounded-lg border border-emerald-500/5 bg-emerald-500/5 items-center inline-flex">+{liveSessions.length - 5}</span>}
                        </div>
                    </div>
                </div>
            )}

            {/* GROUPED SESSIONS LOG (MODULE 4) */}
            <div className="space-y-2">
                {groupedByDay.length === 0 ? (
                    <div className={`p-12 text-center rounded-2xl border ${darkMode ? 'bg-[#161616] border-white/5 text-stone-500' : 'bg-stone-50 border-stone-100 text-stone-400'} font-bold text-sm italic`}>
                        Aucune session enregistrée.
                    </div>
                ) : (
                    paginatedGroups.map((group) => {
                        const isOpen = openDays[group.key];
                        return (
                            <div key={group.key} className={`rounded-2xl border overflow-hidden transition-all duration-300 ${darkMode ? 'bg-[#161616] border-white/5' : 'bg-white border-stone-100'}`}>
                                <button
                                    onClick={() => setOpenDays(prev => ({ ...prev, [group.key]: !prev[group.key] }))}
                                    className={`w-full p-3 sm:p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`p-1.5 rounded-lg ${darkMode ? 'bg-stone-800' : 'bg-stone-50'}`}>
                                            {isOpen ? <ChevronDown size={14} className="text-stone-400" /> : <ChevronRight size={14} className="text-stone-400" />}
                                        </div>
                                        <div>
                                            <span className={`text-[11px] font-black uppercase tracking-widest ${darkMode ? 'text-white/70' : 'text-stone-900'}`}>{group.label}</span>
                                            <span className="ml-3 text-[10px] font-bold text-stone-500">{group.items.length} session{group.items.length > 1 ? 's' : ''}</span>
                                        </div>
                                    </div>
                                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-stone-500/10 to-transparent mx-6"></div>
                                </button>

                                {isOpen && (
                                    <div className="px-2 sm:px-4 pb-3 sm:pb-4 animate-in slide-in-from-top-1 duration-200">
                                        <div className="space-y-1 sm:space-y-1.5">
                                            {group.items.map(session => {
                                                const isExpanded = expandedSessionId === session.id;
                                                const lastActiveMs = getMillis(session.lastActivityAt);
                                                const isInactive = (now - lastActiveMs) > 30000;
                                                const isFinished = session.sessionActive === false || isInactive;
                                                const startedTime = session.startedAt ? new Date(getMillis(session.startedAt)).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '--:--';

                                                return (
                                                    <div key={session.id} className={`group rounded-xl border transition-all ${darkMode ? 'bg-stone-900 border-white/5 hover:border-white/10' : 'bg-stone-50 border-stone-100 shadow-sm'}`}>
                                                        <div className="p-3 flex items-center justify-between gap-4">
                                                            <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
                                                                <div className="flex flex-col min-w-[40px] shrink-0">
                                                                    <span className="text-[10px] font-black text-white/40">{startedTime}</span>
                                                                    {isFinished ? (
                                                                        <span className="text-[8px] font-black uppercase text-stone-600">Terminé</span>
                                                                    ) : (
                                                                        <span className="text-[8px] font-black uppercase text-emerald-500 animate-pulse">En ligne</span>
                                                                    )}
                                                                </div>

                                                                <div className="min-w-0">
                                                                    <div className="flex items-center gap-2 mb-0.5 overflow-hidden">
                                                                        <Globe size={11} className="text-stone-500 shrink-0" />
                                                                        <span className={`text-[10px] font-bold truncate ${darkMode ? 'text-white/80' : 'text-stone-900'}`}>{session.geo?.city && session.geo.city !== 'Unknown' ? `${session.geo.city}${session.geo.region && session.geo.region !== 'Unknown' ? `, ${session.geo.region}` : ''}` : 'Inconnu'}</span>
                                                                        <span className="hidden md:inline text-[8px] text-stone-500 opacity-50 truncate">• {session.ip}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-1.5 overflow-hidden">
                                                                        {session.device === 'Mobile' ? <Smartphone size={10} className="text-stone-500 shrink-0" /> : <Monitor size={10} className="text-stone-500 shrink-0" />}
                                                                        <span className="text-[9px] font-bold text-stone-500 truncate uppercase">
                                                                            {session.os || 'Inconnu'} • {session.browser || 'Inconnu'}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-2 sm:gap-3 md:gap-6 shrink-0">
                                                                <div className="hidden min-[450px]:block text-right">
                                                                    <p className="text-[9px] font-black uppercase tracking-widest text-stone-500 mb-0.5 leading-none">Durée</p>
                                                                    <p className={`text-[11px] sm:text-xs font-black ${darkMode ? 'text-white' : 'text-stone-900'}`}>{formatDuration(session.duration)}</p>
                                                                </div>

                                                                <div className="flex items-center gap-2">
                                                                    <button
                                                                        onClick={() => setExpandedSessionId(isExpanded ? null : session.id)}
                                                                        className={`px-3 py-1.5 h-8 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${isExpanded ? 'bg-blue-500 text-white' : (darkMode ? 'bg-white/5 text-white/50 hover:bg-white/10' : 'bg-white border border-stone-200 text-stone-600')}`}
                                                                    >
                                                                        {isExpanded ? 'Masquer' : 'Tracer'}
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDeleteSession(session.id)}
                                                                        className="p-1.5 text-stone-500 hover:text-red-500 transition-colors"
                                                                    >
                                                                        <Trash2 size={12} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {isExpanded && (
                                                            <div className={`p-4 border-t ${darkMode ? 'border-white/5 bg-black/20' : 'border-stone-100 bg-white'} animate-in slide-in-from-top-2 duration-300`}>
                                                                <div className="space-y-5">
                                                                    <div className="flex items-center justify-between px-1">
                                                                        <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-500">Parcours Utilisateur</h4>
                                                                        <span className="text-[8px] font-bold text-stone-600 opacity-60 uppercase tracking-tighter">{session.journey?.length || 0} Étapes</span>
                                                                    </div>
                                                                    
                                                                    <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-px before:bg-stone-800">
                                                                        {!session.journey || session.journey.length === 0 ? (
                                                                            <p className="text-[10px] italic text-stone-500">Aucune activité enregistrée</p>
                                                                        ) : (
                                                                            session.journey.map((step, idx) => (
                                                                                <div key={idx} className="relative group/step">
                                                                                    {/* DOT centered on the 11px line */}
                                                                                    <div className={`absolute -left-[18.5px] top-1.5 w-[7px] h-[7px] rounded-full ring-4 ${darkMode ? 'ring-stone-900/50' : 'ring-white'} ${
                                                                                        step.page === 'comptoir'
                                                                                            ? 'bg-teal-400 shadow-[0_0_10px_rgba(45,212,191,0.4)]'
                                                                                            : step.page === 'shop'
                                                                                                ? 'bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.3)]'
                                                                                                : 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]'
                                                                                    } transition-all group-hover/step:scale-125`}></div>

                                                                                    <div className="flex flex-col gap-1 -translate-y-0.5">
                                                                                        <span className={`text-[8px] font-black uppercase tracking-widest leading-none ${
                                                                                            step.page === 'comptoir' ? 'text-teal-400/60' : step.page === 'shop' ? 'text-violet-400/60' : 'text-blue-500/60'
                                                                                        }`}>{step.time} • {formatDuration(step.duration)}</span>
                                                                                        <p className={`font-black text-[11px] leading-tight ${darkMode ? 'text-stone-300' : 'text-stone-900'}`}>
                                                                                            {step.page === 'comptoir' ? (
                                                                                                <>Clic : <span className="uppercase text-teal-400">Comptoir</span></>
                                                                                            ) : (
                                                                                                <>Vue : <span className={`uppercase ${step.page === 'shop' ? 'text-violet-400' : 'text-amber-500'}`}>{step.page}</span></>
                                                                                            )}
                                                                                        </p>
                                                                                        {step.itemId && (
                                                                                            <div className="flex flex-wrap items-center gap-2 mt-0.5">
                                                                                                <span className={`text-[8px] font-bold px-2 py-0.5 rounded-md truncate max-w-full italic border ${
                                                                                                    step.page === 'comptoir'
                                                                                                        ? 'bg-teal-500/10 text-teal-400/80 border-teal-500/10'
                                                                                                        : 'bg-indigo-500/10 text-indigo-400/80 border-indigo-500/10'
                                                                                                }`}>
                                                                                                    {step.page !== 'comptoir' && 'ID: '}{step.itemId}
                                                                                                </span>
                                                                                            </div>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            ))
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}

                {/* PAGINATION NUMBERS */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-1.5 pt-4">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            className={`p-2.5 rounded-xl transition-all duration-300 border-2 ${
                                darkMode 
                                    ? (currentPage === 1 ? 'border-white/5 text-stone-700' : 'border-white/5 text-stone-400 hover:bg-white/5 hover:text-white') 
                                    : (currentPage === 1 ? 'border-stone-50 text-stone-200' : 'border-stone-100 text-stone-500 hover:bg-stone-50 hover:text-stone-900')
                            } active:scale-90`}
                        >
                            <ChevronRight className="rotate-180" size={16} />
                        </button>

                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-[1.25rem] border-2 border-white/5 bg-white/[0.02]">
                            {[...Array(totalPages)].map((_, i) => {
                                const page = i + 1;
                                if (totalPages > 7) {
                                    if (page > 1 && page < totalPages && Math.abs(page - currentPage) > 1) {
                                        if (page === 2 || page === totalPages - 1) return <span key={page} className="text-stone-700 px-1 select-none">···</span>;
                                        return null;
                                    }
                                }

                                return (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`w-9 h-9 rounded-xl text-[10px] font-black transition-all duration-500 ${currentPage === page
                                            ? (darkMode ? 'bg-white text-stone-900 shadow-[0_0_20px_rgba(255,255,255,0.3)]' : 'bg-stone-900 text-white shadow-lg shadow-stone-900/20')
                                            : (darkMode ? 'text-stone-500 hover:text-white hover:bg-white/5' : 'text-stone-400 hover:text-stone-900 hover:bg-stone-100')
                                            }`}
                                    >
                                        {page}
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            className={`p-2.5 rounded-xl transition-all duration-300 border-2 ${
                                darkMode 
                                    ? (currentPage === totalPages ? 'border-white/5 text-stone-700' : 'border-white/5 text-stone-400 hover:bg-white/5 hover:text-white') 
                                    : (currentPage === totalPages ? 'border-stone-50 text-stone-200' : 'border-stone-100 text-stone-500 hover:bg-stone-50 hover:text-stone-900')
                            } active:scale-90`}
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                )}
            </div>

            {/* FOOTER INFO MODULE 5 */}
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 py-4 border-t border-white/5">
                {[
                    "Sessions admin auto-exclues",
                    "IPs blacklistées au login",
                    "Rétention data: 30 jours",
                    "Temps réel activé"
                ].map((info, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                        <div className="w-1 h-1 rounded-full bg-stone-700"></div>
                        <span className="text-[8px] font-black uppercase tracking-widest text-stone-600">{info}</span>
                    </div>
                ))}
            </div>
            </>)}
        </div>
    );
};

export default AdminAnalytics;
