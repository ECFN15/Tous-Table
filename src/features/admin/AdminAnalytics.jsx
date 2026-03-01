import React, { useState, useEffect } from 'react';
import {
    Activity, Users, Clock, Globe, ArrowUpRight, ArrowDownRight, RefreshCw, Smartphone, Monitor
} from 'lucide-react';
import { collection, query, orderBy, limit, onSnapshot, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db, functions } from '../../firebase/config';
import { httpsCallable } from 'firebase/functions';
import { getMillis } from '../../utils/time';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart
} from 'recharts';

const AdminAnalytics = ({ darkMode = false }) => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [timeFilter, setTimeFilter] = useState('7j'); // '1h', '1j', '7j', '1mois', '1ans'
    const [expandedSessionId, setExpandedSessionId] = useState(null);

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
        const now = Date.now();
        let cutoff = 0;

        switch (filter) {
            case '1h': cutoff = now - 3600 * 1000; break;
            case '1j': cutoff = now - 24 * 3600 * 1000; break;
            case '7j': cutoff = now - 7 * 24 * 3600 * 1000; break;
            case '1mois': cutoff = now - 30 * 24 * 3600 * 1000; break;
            case '1ans': cutoff = now - 365 * 24 * 3600 * 1000; break;
            default: cutoff = now - 7 * 24 * 3600 * 1000;
        }

        const filtered = allSessions.filter(s => {
            const time = s.startedAt ? getMillis(s.startedAt) : 0;
            return time >= cutoff;
        });

        // Calculate KPIs (excluding Admin from "real" growth stats to be accurate)
        const realTraffic = filtered.filter(s => s.type !== 'admin');
        const uniques = realTraffic.length;

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

        // Generate Chart Data (Real traffic only)
        const grouped = {};
        realTraffic.forEach(s => {
            const time = s.startedAt ? getMillis(s.startedAt) : null;
            if (!time) return;

            const dateObj = new Date(time);
            let key = '';

            if (filter === '1h') key = dateObj.toLocaleTimeString('fr-FR', { minute: '2-digit', hour: '2-digit' }).slice(0, 4) + '0';
            else if (filter === '1j') key = dateObj.getHours() + 'h';
            else if (filter === '7j' || filter === '1mois') key = dateObj.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
            else if (filter === '1ans') key = dateObj.toLocaleDateString('fr-FR', { month: '2-digit', year: 'numeric' });

            if (!grouped[key]) grouped[key] = { name: key, visites: 0 };
            grouped[key].visites += 1;
        });

        const sortedChart = Object.values(grouped);
        setChartData(sortedChart);
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
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h3 className={`text-2xl font-black tracking-tight ${darkMode ? 'text-white' : 'text-stone-900'}`}>Trafic & Croissance</h3>
                    <p className="text-xs text-stone-400 font-bold uppercase tracking-widest mt-1">Analyse des flux réels</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleClearAll}
                        className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white`}
                    >
                        Vider tout
                    </button>
                    <div className={`flex p-1 rounded-xl shadow-sm border ${darkMode ? 'bg-stone-900 border-stone-800' : 'bg-stone-100 border-stone-200'}`}>
                        {['1h', '1j', '7j', '1mois', '1ans'].map(tf => (
                            <button
                                key={tf}
                                onClick={() => { setTimeFilter(tf); processData(sessions, tf); }}
                                className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${timeFilter === tf ? (darkMode ? 'bg-white text-stone-900' : 'bg-white text-stone-900 shadow-sm') : 'text-stone-500 hover:text-stone-700'}`}
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

            {/* RECHARTS - CHART */}
            <div className={`p-6 md:p-8 rounded-[2.5rem] shadow-sm ${darkMode ? 'bg-stone-800 ring-1 ring-inset ring-stone-700' : 'bg-white ring-1 ring-inset ring-stone-100'}`}>
                <h3 className={`text-lg font-black uppercase tracking-widest mb-8 ${darkMode ? 'text-white' : 'text-stone-900'}`}>Évolution du Trafic</h3>
                <div className="h-[320px] w-full">
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorVisites" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} />
                                <XAxis
                                    dataKey="name"
                                    stroke={darkMode ? '#57534e' : '#a8a29e'}
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                    dy={10}
                                    interval={chartData.length > 15 ? 2 : 0}
                                />
                                <YAxis
                                    stroke={darkMode ? '#57534e' : '#a8a29e'}
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                    dx={-10}
                                    allowDecimals={false}
                                />
                                <Tooltip
                                    cursor={{ stroke: '#10b981', strokeWidth: 2, strokeDasharray: '5 5' }}
                                    contentStyle={{
                                        borderRadius: '20px',
                                        border: 'none',
                                        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
                                        backgroundColor: darkMode ? '#1c1917' : '#ffffff',
                                        padding: '12px 16px'
                                    }}
                                    itemStyle={{ fontSize: '12px', fontWeight: '900', color: '#10b981', textTransform: 'uppercase' }}
                                    labelStyle={{ fontSize: '10px', color: '#78716c', marginBottom: '4px', fontWeight: 'bold' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="visites"
                                    stroke="#10b981"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorVisites)"
                                    animationDuration={1500}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-full text-stone-400 font-bold italic">Pas assez de données pour la période sélectionnée.</div>
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

                <div className="overflow-x-auto max-h-[650px] overflow-y-auto custom-scrollbar pr-2">
                    <table className="w-full text-left border-collapse">
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

                                return (
                                    <React.Fragment key={session.id}>
                                        <tr className={`border-b transition-colors group ${darkMode ? 'border-stone-700 hover:bg-stone-700/50' : 'border-stone-100 hover:bg-stone-50'} ${isExpanded ? (darkMode ? 'bg-stone-700/30' : 'bg-amber-50/50') : ''}`}>
                                            <td className="py-4 pl-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black ${isAdminType ? 'bg-red-100 text-red-600' : (isClient ? 'bg-indigo-100 text-indigo-600' : 'bg-stone-200 text-stone-600')}`}>
                                                        {isAdminType ? 'AD' : (isClient ? 'CO' : 'AN')}
                                                    </div>
                                                    <div>
                                                        <p className={`font-bold text-sm flex items-center gap-1.5 ${darkMode ? 'text-white' : 'text-stone-900'}`}>
                                                            <Globe size={12} className={darkMode ? 'text-stone-500' : 'text-stone-400'} />
                                                            {session.geo?.city !== 'Unknown' ? `${session.geo.city}, ${session.geo.country}` : 'Ville Inconnue'}
                                                        </p>
                                                        <p className="text-[10px] font-mono text-stone-400 mt-0.5">{session.ip}</p>
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
                                                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700">{startedTime}</span>
                                            </td>
                                            <td className="py-4 font-bold text-xs text-stone-500 dark:text-stone-400">
                                                {formatDuration(session.duration)}
                                            </td>
                                            <td className="py-4 text-right pr-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleDeleteSession(session.id)}
                                                        className={`p-2 rounded-xl transition-all border border-transparent hover:border-red-500/30 text-stone-400 hover:text-red-500`}
                                                    >
                                                        <Activity size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => setExpandedSessionId(isExpanded ? null : session.id)}
                                                        className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border ${isExpanded ? 'bg-amber-500 text-white border-amber-500' : (darkMode ? 'bg-stone-800 text-stone-300 border-stone-700 hover:border-stone-500' : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300')}`}
                                                    >
                                                        {isExpanded ? 'Fermer' : `Tracer (${session.journey?.length || 0})`}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                        {/* EXPANDED ROW (JOURNEY) */}
                                        {isExpanded && (
                                            <tr className={darkMode ? 'bg-stone-900/50' : 'bg-stone-50/50'}>
                                                <td colSpan="5" className="p-0 border-b border-indigo-100 dark:border-indigo-900/30">
                                                    <div className="p-6 md:p-8 animate-in slide-in-from-top-4 fade-in duration-300">
                                                        <h4 className={`text-xs font-black uppercase tracking-widest mb-6 ${darkMode ? 'text-stone-400' : 'text-stone-500'}`}>Détail du parcours</h4>

                                                        <div className="relative border-l-2 border-dashed border-stone-200 dark:border-stone-700 ml-4 space-y-8">
                                                            {(!session.journey || session.journey.length === 0) ? (
                                                                <p className="pl-6 text-sm italic text-stone-400">Aucune action enregistrée pour le moment.</p>
                                                            ) : (
                                                                session.journey.map((step, idx) => (
                                                                    <div key={idx} className="relative pl-8">
                                                                        <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-amber-500 ring-4 ring-white dark:ring-stone-900"></div>
                                                                        <div className="flex flex-wrap items-center gap-3">
                                                                            <span className="text-[10px] font-black text-amber-500 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded-md">{step.time}</span>
                                                                            <p className={`font-bold text-sm ${darkMode ? 'text-white' : 'text-stone-900'}`}>
                                                                                Vue : <span className="uppercase text-amber-600 dark:text-amber-400">{step.page}</span>
                                                                            </p>
                                                                            {step.itemId && (
                                                                                <span className="text-[10px] font-bold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                                                                                    Produit ID: {step.itemId}
                                                                                </span>
                                                                            )}
                                                                            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider ml-auto">
                                                                                {formatDuration(step.duration)}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                ))
                                                            )}
                                                            {/* User Left / Current */}
                                                            <div className="relative pl-8 opacity-50">
                                                                <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-stone-300 dark:bg-stone-600 ring-4 ring-white dark:ring-stone-900"></div>
                                                                <p className="text-xs font-bold text-stone-500">{session.sessionActive ? "En cours de navigation..." : "Fin de session"}</p>
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
                </div>
            </div>

        </div>
    );
};

export default AdminAnalytics;
