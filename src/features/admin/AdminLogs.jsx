import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { AlertTriangle, Trash2, Calendar, ShieldAlert, Monitor, User, Globe, ChevronDown, ChevronUp } from 'lucide-react';

const AdminLogs = ({ darkMode }) => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [clearing, setClearing] = useState(false);
    const [expandedLogId, setExpandedLogId] = useState(null);

    useEffect(() => {
        const q = query(
            collection(db, 'client_errors'),
            orderBy('timestamp', 'desc'),
            limit(100)
        );

        const unsub = onSnapshot(q, (snap) => {
            const logsData = snap.docs.map(docSnap => ({
                id: docSnap.id,
                ...docSnap.data()
            }));
            setLogs(logsData);
            setLoading(false);
        }, (err) => {
            console.error("Error loading client logs:", err);
            setLoading(false);
        });

        return () => unsub();
    }, []);

    const handleDeleteLog = async (logId, e) => {
        e.stopPropagation();
        if (!window.confirm("Supprimer ce log d'erreur ?")) return;
        try {
            await deleteDoc(doc(db, 'client_errors', logId));
        } catch (error) {
            console.error("Error deleting log:", error);
            alert("Erreur : " + error.message);
        }
    };

    const handleClearAll = async () => {
        if (!window.confirm("Voulez-vous vraiment vider TOUS les logs d'erreurs affichés (max 100) ?")) return;
        setClearing(true);
        try {
            const promises = logs.map(log => deleteDoc(doc(db, 'client_errors', log.id)));
            await Promise.all(promises);
        } catch (error) {
            console.error("Error clearing logs:", error);
            alert("Erreur lors de la suppression : " + error.message);
        } finally {
            setClearing(false);
        }
    };

    const toggleExpandLog = (logId) => {
        setExpandedLogId(prev => prev === logId ? null : logId);
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return 'En cours...';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    if (loading) return <div className="p-12 text-center animate-pulse opacity-50">Chargement des logs d'erreurs client...</div>;

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 pb-20">
            {/* Header Card */}
            <div className={`p-8 rounded-[2.5rem] shadow-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border border-transparent ${darkMode ? 'bg-[#161616] border-white/5' : 'bg-white border-stone-200/60'}`}>
                <div>
                    <h2 className="text-3xl font-black tracking-tighter mb-2 flex items-center gap-3">
                        <AlertTriangle className="text-amber-500 animate-pulse" size={28} />
                        Logs d'Erreurs Client
                    </h2>
                    <p className={`font-medium text-xs tracking-wide ${darkMode ? 'text-white/40' : 'text-stone-400'}`}>
                        Consultez et gérez les anomalies et échecs rencontrés par vos visiteurs en direct.
                    </p>
                </div>
                {logs.length > 0 && (
                    <button
                        onClick={handleClearAll}
                        disabled={clearing}
                        className={`group w-full sm:w-auto px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] transition-all duration-300 flex items-center justify-center gap-3 shadow-xl ${
                            darkMode 
                                ? 'bg-red-500/10 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/20' 
                                : 'bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border border-red-100'
                        }`}
                    >
                        <Trash2 size={16} /> 
                        {clearing ? 'Suppression...' : 'Vider les logs'}
                    </button>
                )}
            </div>

            {/* Logs List */}
            <div className="space-y-4">
                {logs.map(log => {
                    const isExpanded = expandedLogId === log.id;
                    return (
                        <div
                            key={log.id}
                            onClick={() => toggleExpandLog(log.id)}
                            className={`p-6 rounded-[1.75rem] border transition-all duration-300 cursor-pointer overflow-hidden relative group ${
                                darkMode 
                                    ? 'bg-[#111111] border-white/5 hover:border-white/10' 
                                    : 'bg-white border-stone-100 shadow-sm hover:shadow-md'
                            }`}
                        >
                            {/* Summary row */}
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-start gap-4 flex-1 min-w-0">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
                                        darkMode ? 'bg-white/5 border-white/5 text-amber-500' : 'bg-amber-50 border-amber-100 text-amber-600'
                                    }`}>
                                        <ShieldAlert size={22} strokeWidth={1.5} />
                                    </div>
                                    <div className="min-w-0 flex-1 space-y-1">
                                        <div className="flex items-center gap-2.5 flex-wrap">
                                            <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider ${
                                                darkMode ? 'bg-white/5 text-stone-400' : 'bg-stone-100 text-stone-600'
                                            }`}>
                                                {log.page}
                                            </span>
                                            <span className={`text-[10px] font-semibold flex items-center gap-1.5 opacity-55`}>
                                                <Calendar size={12} /> {formatDate(log.timestamp)}
                                            </span>
                                        </div>
                                        <h3 className={`text-base font-bold leading-snug truncate ${darkMode ? 'text-white' : 'text-stone-900'}`}>
                                            {log.message}
                                        </h3>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 justify-end shrink-0">
                                    {/* Quick user display */}
                                    <div className={`hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold ${
                                        darkMode ? 'bg-white/5 text-stone-400' : 'bg-stone-50 text-stone-500'
                                    }`}>
                                        <User size={12} />
                                        <span className="truncate max-w-[120px]">{log.userEmail || log.userId?.substring(0, 8) || 'anonymous'}</span>
                                    </div>
                                    
                                    {/* Action buttons */}
                                    <button
                                        onClick={(e) => handleDeleteLog(log.id, e)}
                                        className={`p-2.5 rounded-lg transition-colors ${
                                            darkMode ? 'hover:bg-white/5 text-stone-500 hover:text-red-400' : 'hover:bg-stone-100 text-stone-400 hover:text-red-600'
                                        }`}
                                    >
                                        <Trash2 size={15} />
                                    </button>
                                    
                                    <div className={`p-1 opacity-45 group-hover:opacity-100 transition-opacity`}>
                                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                    </div>
                                </div>
                            </div>

                            {/* Details section */}
                            {isExpanded && (
                                <div
                                    className={`mt-6 pt-6 border-t space-y-6 animate-in fade-in slide-in-from-top-2 duration-300 ${
                                        darkMode ? 'border-white/5' : 'border-stone-100'
                                    }`}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {/* Metadata / Stack Trace */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40 flex items-center gap-1.5">
                                                <Monitor size={12} /> Environnement
                                            </h4>
                                            <div className={`p-4 rounded-xl text-xs space-y-2 font-mono ${darkMode ? 'bg-[#0A0A0A] text-stone-400' : 'bg-stone-50 text-stone-600'}`}>
                                                <p><span className="opacity-50">Browser/OS :</span> {log.userAgent}</p>
                                                <p><span className="opacity-50">Page :</span> {log.page}</p>
                                                <p><span className="opacity-50">Utilisateur ID :</span> {log.userId}</p>
                                                {log.userEmail && <p><span className="opacity-50">Utilisateur Email :</span> {log.userEmail}</p>}
                                            </div>
                                        </div>

                                        {log.metadata && Object.keys(log.metadata).length > 0 && (
                                            <div className="space-y-4">
                                                <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40 flex items-center gap-1.5">
                                                    <Globe size={12} /> Contexte Métadonnées
                                                </h4>
                                                <pre className={`p-4 rounded-xl text-xs overflow-x-auto font-mono ${darkMode ? 'bg-[#0A0A0A] text-stone-400' : 'bg-stone-50 text-stone-600'}`}>
                                                    {JSON.stringify(log.metadata, null, 2)}
                                                </pre>
                                            </div>
                                        )}
                                    </div>

                                    {log.stack && (
                                        <div className="space-y-4">
                                            <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40">
                                                Trace d'exécution (Stack Trace)
                                            </h4>
                                            <pre className={`p-4 rounded-xl text-xs overflow-x-auto max-h-48 font-mono ${darkMode ? 'bg-[#0A0A0A] text-red-400/80' : 'bg-red-50/40 text-red-800/80 border border-red-500/5'}`}>
                                                {log.stack}
                                            </pre>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}

                {logs.length === 0 && (
                    <div className="text-center py-20 text-stone-400 italic">
                        Aucun log d'erreur client enregistré. Votre site fonctionne parfaitement ! 🚀
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminLogs;
