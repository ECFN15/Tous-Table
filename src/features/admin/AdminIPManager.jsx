import React, { useState, useEffect } from 'react';
import { httpsCallable } from 'firebase/functions';
import { doc, onSnapshot } from 'firebase/firestore';
import { functions, db } from '../../firebase/config';
import { Globe, Clock, Trash2, AlertCircle, Shield } from 'lucide-react';

const AdminIPManager = ({ darkMode }) => {
    const [adminIPs, setAdminIPs] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsub = onSnapshot(doc(db, 'sys_metadata', 'admin_ips'), (docSnap) => {
            if (docSnap.exists() && docSnap.data().ips) {
                setAdminIPs(docSnap.data().ips);
            } else {
                setAdminIPs({});
            }
            setLoading(false);
        }, (err) => {
            console.error("Error fetching admin IPs:", err);
            setLoading(false);
        });

        return () => unsub();
    }, []);

    const formatTimestamp = (timestamp) => {
        if (!timestamp) return 'Inconnu';
        const date = timestamp.toDate();
        return date.toLocaleString('fr-FR', { 
            day: '2-digit', 
            month: '2-digit', 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    if (loading) return <div className="p-12 text-center animate-pulse opacity-50">Chargement des IPs admin...</div>;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            {/* Header */}
            <div className={`p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-xl ${darkMode ? 'bg-stone-900 text-white' : 'bg-stone-900 text-white'}`}>
                <div>
                    <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-1 md:mb-2">IPs Administrateurs</h2>
                    <p className="text-stone-400 font-medium text-xs md:text-sm">
                        Liste des adresses IP blacklistées pour les statistiques de trafic.
                    </p>
                </div>
            </div>

            {/* IPs List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(adminIPs).map(([ip, data]) => (
                    <div key={ip} className={`p-6 rounded-[2rem] ring-1 relative group ${darkMode ? 'bg-stone-800 ring-stone-700/50' : 'bg-white ring-stone-100 shadow-sm'}`}>
                        <div className="flex items-start justify-between mb-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${darkMode ? 'bg-stone-700 text-stone-300' : 'bg-stone-100 text-stone-500'}`}>
                                <Shield size={24} />
                            </div>
                            <div className={`w-2 h-2 rounded-full shadow-[0_0_10px_currentColor] bg-emerald-500 text-emerald-500`}></div>
                        </div>

                        <div>
                            <p className={`font-mono text-sm font-bold mb-2 ${darkMode ? 'text-white' : 'text-stone-900'}`}>
                                {ip}
                            </p>
                            <p className="text-sm text-stone-400 font-medium mb-1">
                                {data.adminEmail}
                            </p>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-[10px] text-stone-500">
                                    <Clock size={10} />
                                    <span>Première visite: {formatTimestamp(data.firstSeen)}</span>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] text-stone-500">
                                    <Clock size={10} />
                                    <span>Dernière visite: {formatTimestamp(data.lastSeen)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {Object.keys(adminIPs).length === 0 && (
                    <div className="col-span-full text-center py-20 text-stone-400">
                        <div className="flex flex-col items-center gap-4">
                            <AlertCircle size={48} className="opacity-50" />
                            <p>Aucune IP admin enregistrée.</p>
                            <p className="text-sm">Les IPs seront automatiquement enregistrées lors de l'accès au backoffice.</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Info */}
            <div className={`p-6 rounded-2xl ${darkMode ? 'bg-stone-800 border border-stone-700' : 'bg-stone-50 border border-stone-200'}`}>
                <div className="flex items-start gap-3">
                    <AlertCircle size={20} className="text-stone-400 mt-0.5" />
                    <div className="text-sm text-stone-400">
                        <p className="mb-2">
                            <strong>Fonctionnement automatique :</strong> Les adresses IP des administrateurs sont automatiquement enregistrées lorsqu'ils accèdent au backoffice.
                        </p>
                        <p className="mb-2">
                            <strong>Exclusion des statistiques :</strong> Toutes les sessions provenant de ces IPs sont automatiquement exclues des statistiques de trafic.
                        </p>
                        <p>
                            <strong>Nettoyage automatique :</strong> Les IPs non utilisées depuis plus de 90 jours sont automatiquement supprimées.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminIPManager;
