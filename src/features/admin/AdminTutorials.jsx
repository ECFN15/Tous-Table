import React, { useState, useEffect, useMemo } from 'react';
import {
    collection, onSnapshot, addDoc, updateDoc, deleteDoc,
    doc, serverTimestamp, query, orderBy
} from 'firebase/firestore';
import { db, appId } from '../../firebase/config';
import {
    Plus, Trash2, Film, Link2, ExternalLink,
    ChevronDown, ChevronUp, X, Check, Play, GripVertical,
    Youtube, Package
} from 'lucide-react';

// ─── CONSTANTES ───────────────────────────────────────────────────────────────

const CATEGORIES = [
    { id: 'huiles',       label: 'Huiles & Nourrissants',    title: 'Protection Profonde' },
    { id: 'cires',        label: 'Cires, Peintures & Effets', title: 'Patine & Finition' },
    { id: 'savons',       label: 'Savons & Nettoyants',       title: 'Le Geste Quotidien' },
    { id: 'accessoires',  label: 'Accessoires Essentiels',    title: "L'Essentiel du Quotidien" },
    { id: 'renovation',   label: 'Décapage & Retouches',      title: 'Seconde Jeunesse' },
    { id: 'outils',       label: 'Outils & Matériel Pro',     title: 'La Boîte à Outils' },
];

const EMPTY_TUTORIAL = {
    videoId: '',
    label: '',
    productId: '',
    category: 'huiles',
    order: 0,
};

// ─── EXTRACTION YOUTUBE ID ───────────────────────────────────────────────────

const extractYouTubeId = (input) => {
    if (!input) return '';
    // Si c'est déjà juste un ID (11 chars)
    if (/^[a-zA-Z0-9_-]{11}$/.test(input.trim())) return input.trim();
    // Sinon extraire depuis URL
    const match = input.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : input.trim();
};

// ─── YOUTUBE THUMBNAIL ──────────────────────────────────────────────────────

const YouTubeThumbnail = ({ videoId, darkMode }) => {
    if (!videoId) return (
        <div className={`w-full aspect-video rounded-xl flex items-center justify-center ${darkMode ? 'bg-white/5' : 'bg-stone-100'}`}>
            <Film size={24} className={darkMode ? 'text-stone-600' : 'text-stone-300'} />
        </div>
    );

    return (
        <div className="relative group w-full aspect-video rounded-xl overflow-hidden">
            <img
                src={`https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`}
                alt="YouTube thumbnail"
                className="w-full h-full object-cover"
                onError={(e) => { e.target.style.display = 'none'; }}
            />
            <a
                href={`https://www.youtube.com/watch?v=${videoId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center"
            >
                <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-300 shadow-xl">
                    <Play size={16} className="text-white ml-0.5" fill="white" />
                </div>
            </a>
        </div>
    );
};

// ─── FORMULAIRE TUTORIEL ─────────────────────────────────────────────────────

const TutorialForm = ({ editData, products, onSave, onCancel, darkMode }) => {
    const [form, setForm] = useState(EMPTY_TUTORIAL);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [videoIdInput, setVideoIdInput] = useState('');

    useEffect(() => {
        if (editData) {
            setForm({ ...EMPTY_TUTORIAL, ...editData });
            setVideoIdInput(editData.videoId || '');
        } else {
            setForm(EMPTY_TUTORIAL);
            setVideoIdInput('');
        }
        setError('');
    }, [editData]);

    const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

    const handleVideoIdChange = (val) => {
        setVideoIdInput(val);
        const extracted = extractYouTubeId(val);
        set('videoId', extracted);
    };

    // Filtrer les produits par la catégorie sélectionnée
    const filteredProducts = useMemo(() => {
        return products.filter(p => p.category === form.category && p.status === 'published');
    }, [products, form.category]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.videoId.trim() || !form.label.trim()) {
            setError('L\'ID vidéo YouTube et le label sont obligatoires.');
            return;
        }
        setSaving(true);
        setError('');
        try {
            const payload = {
                videoId: form.videoId.trim(),
                label: form.label.trim(),
                productId: form.productId || '',
                category: form.category,
                order: form.order || 0,
                updatedAt: serverTimestamp(),
            };
            const colRef = collection(db, 'artifacts', appId, 'public', 'data', 'shop_tutorials');
            if (editData?.id) {
                await updateDoc(doc(colRef, editData.id), payload);
            } else {
                await addDoc(colRef, { ...payload, createdAt: serverTimestamp() });
            }
            onSave();
        } catch (err) {
            setError('Erreur : ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const inputCls = `w-full px-4 py-3 rounded-xl text-sm border transition-colors outline-none focus:ring-2 ${
        darkMode
            ? 'bg-white/5 border-white/10 text-white placeholder-stone-600 focus:ring-white/20 focus:border-white/20 [&>option]:bg-stone-900'
            : 'bg-stone-50 border-stone-200 text-stone-900 placeholder-stone-400 focus:ring-stone-900/10 focus:border-stone-400'
    }`;
    const labelCls = `block text-[10px] font-black uppercase tracking-widest mb-1.5 ${darkMode ? 'text-stone-500' : 'text-stone-400'}`;

    const linkedProduct = form.productId ? products.find(p => p.id === form.productId) : null;

    return (
        <form onSubmit={handleSubmit} className={`rounded-3xl border p-6 space-y-5 ${darkMode ? 'bg-[#161616] border-white/5' : 'bg-white border-stone-200'}`}>
            <div className="flex items-center justify-between">
                <h3 className={`text-sm font-black uppercase tracking-widest flex items-center gap-2 ${darkMode ? 'text-white' : 'text-stone-900'}`}>
                    <Film size={16} />
                    {editData ? 'Modifier le tutoriel' : 'Ajouter un tutoriel vidéo'}
                </h3>
                {editData && (
                    <button type="button" onClick={onCancel} className={`p-2 rounded-xl transition-colors ${darkMode ? 'hover:bg-white/5 text-stone-500' : 'hover:bg-stone-100 text-stone-400'}`}>
                        <X size={16} />
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Colonne gauche — Vidéo */}
                <div className="space-y-4">
                    {/* YouTube ID / URL */}
                    <div>
                        <label className={labelCls}>
                            <Youtube size={12} className="inline mr-1 -mt-0.5" />
                            ID ou URL YouTube *
                        </label>
                        <input
                            className={inputCls}
                            value={videoIdInput}
                            onChange={e => handleVideoIdChange(e.target.value)}
                            placeholder="https://youtube.com/watch?v=xxxxx ou juste l'ID"
                        />
                        {form.videoId && form.videoId !== videoIdInput && (
                            <p className={`mt-1 text-[10px] ${darkMode ? 'text-stone-500' : 'text-stone-400'}`}>
                                ID extrait : <span className="font-mono font-bold">{form.videoId}</span>
                            </p>
                        )}
                    </div>

                    {/* Preview */}
                    <YouTubeThumbnail videoId={form.videoId} darkMode={darkMode} />
                </div>

                {/* Colonne droite — Détails */}
                <div className="space-y-4">
                    {/* Label */}
                    <div>
                        <label className={labelCls}>Label de la vidéo *</label>
                        <input
                            className={inputCls}
                            value={form.label}
                            onChange={e => set('label', e.target.value)}
                            placeholder="Application du produit sur meuble en chêne..."
                        />
                    </div>

                    {/* Catégorie */}
                    <div>
                        <label className={labelCls}>Catégorie</label>
                        <select className={inputCls} value={form.category} onChange={e => { set('category', e.target.value); set('productId', ''); }}>
                            {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.title} — {c.label}</option>)}
                        </select>
                    </div>

                    {/* Produit lié */}
                    <div>
                        <label className={labelCls}>
                            <Link2 size={12} className="inline mr-1 -mt-0.5" />
                            Produit lié (optionnel)
                        </label>
                        <select className={inputCls} value={form.productId} onChange={e => set('productId', e.target.value)}>
                            <option value="">— Aucun produit lié —</option>
                            {filteredProducts.map(p => (
                                <option key={p.id} value={p.id}>
                                    {p.brand} — {p.name} {p.price ? `(${p.price.toFixed(2)}€)` : ''}
                                </option>
                            ))}
                        </select>
                        {linkedProduct && (
                            <div className={`mt-2 flex items-center gap-2 p-2 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-stone-50'}`}>
                                {linkedProduct.imageUrl && (
                                    <img src={linkedProduct.imageUrl} alt="" className="w-8 h-8 rounded-lg object-cover" />
                                )}
                                <span className={`text-xs font-medium truncate ${darkMode ? 'text-stone-300' : 'text-stone-700'}`}>
                                    {linkedProduct.name}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Ordre */}
                    <div>
                        <label className={labelCls}>Ordre d'affichage</label>
                        <input
                            className={inputCls}
                            type="number"
                            min="0"
                            value={form.order}
                            onChange={e => set('order', parseInt(e.target.value) || 0)}
                            placeholder="0"
                        />
                    </div>
                </div>
            </div>

            {error && <p className="text-red-400 text-xs font-medium">{error}</p>}

            <div className="flex items-center gap-3 pt-2">
                <button
                    type="submit"
                    disabled={saving}
                    className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${
                        saving ? 'opacity-50 cursor-not-allowed' : ''
                    } ${darkMode ? 'bg-white text-stone-900 hover:bg-stone-100' : 'bg-stone-900 text-white hover:bg-stone-700'}`}
                >
                    {saving ? 'Enregistrement...' : (editData ? <><Check size={14} /> Mettre à jour</> : <><Plus size={14} /> Ajouter le tutoriel</>)}
                </button>
                {editData && (
                    <button type="button" onClick={onCancel} className={`px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest border transition-all ${darkMode ? 'border-white/10 text-stone-400 hover:text-white' : 'border-stone-200 text-stone-500 hover:text-stone-900'}`}>
                        Annuler
                    </button>
                )}
            </div>
        </form>
    );
};

// ─── CARTE TUTORIEL ──────────────────────────────────────────────────────────

const TutorialCard = ({ tutorial, product, onEdit, onDelete, darkMode }) => (
    <div className={`group relative flex flex-col sm:flex-row items-stretch gap-4 p-4 rounded-2xl border transition-all duration-200 ${
        darkMode
            ? 'bg-[#161616] border-white/5 hover:border-white/10'
            : 'bg-white border-stone-200 hover:border-stone-300 hover:shadow-sm'
    }`}>
        {/* Thumbnail */}
        <div className="w-full sm:w-48 shrink-0">
            <YouTubeThumbnail videoId={tutorial.videoId} darkMode={darkMode} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
            <div>
                <p className={`text-sm font-bold leading-snug mb-1 ${darkMode ? 'text-white' : 'text-stone-900'}`}>
                    {tutorial.label}
                </p>
                <p className={`text-[10px] font-mono ${darkMode ? 'text-stone-600' : 'text-stone-400'}`}>
                    ID: {tutorial.videoId}
                </p>
            </div>

            {/* Produit lié */}
            {product ? (
                <div className={`mt-2 flex items-center gap-2 p-2 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-stone-50'}`}>
                    {product.imageUrl ? (
                        <img src={product.imageUrl} alt="" className="w-8 h-8 rounded-lg object-cover shrink-0" />
                    ) : (
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${darkMode ? 'bg-white/5' : 'bg-stone-100'}`}>
                            <Package size={12} className={darkMode ? 'text-stone-600' : 'text-stone-400'} />
                        </div>
                    )}
                    <span className={`text-[11px] font-medium truncate ${darkMode ? 'text-stone-300' : 'text-stone-700'}`}>
                        {product.name}
                    </span>
                </div>
            ) : (
                <p className={`mt-2 text-[10px] italic ${darkMode ? 'text-stone-600' : 'text-stone-400'}`}>
                    Aucun produit lié
                </p>
            )}
        </div>

        {/* Actions */}
        <div className="flex sm:flex-col items-center justify-end gap-1 shrink-0">
            <a
                href={`https://www.youtube.com/watch?v=${tutorial.videoId}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`p-2 rounded-xl transition-colors ${darkMode ? 'hover:bg-white/5 text-stone-600 hover:text-red-400' : 'hover:bg-stone-100 text-stone-300 hover:text-red-500'}`}
                title="Voir sur YouTube"
            >
                <ExternalLink size={14} />
            </a>
            <button
                onClick={() => onEdit(tutorial)}
                className={`p-2 rounded-xl transition-colors ${darkMode ? 'hover:bg-white/5 text-stone-600 hover:text-stone-300' : 'hover:bg-stone-100 text-stone-300 hover:text-stone-600'}`}
                title="Modifier"
            >
                <ChevronUp size={14} />
            </button>
            <button
                onClick={() => onDelete(tutorial)}
                className={`p-2 rounded-xl transition-colors ${darkMode ? 'hover:bg-red-900/20 text-stone-600 hover:text-red-400' : 'hover:bg-red-50 text-stone-300 hover:text-red-500'}`}
                title="Supprimer"
            >
                <Trash2 size={14} />
            </button>
        </div>
    </div>
);

// ─── COMPOSANT PRINCIPAL ─────────────────────────────────────────────────────

const AdminTutorials = ({ darkMode, products = [] }) => {
    const [tutorials, setTutorials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editData, setEditData] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [expandedCat, setExpandedCat] = useState(null);

    const colRef = useMemo(() => collection(db, 'artifacts', appId, 'public', 'data', 'shop_tutorials'), []);

    // Listener temps réel
    useEffect(() => {
        const q = query(colRef, orderBy('createdAt', 'desc'));
        const unsub = onSnapshot(q, snap => {
            setTutorials(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            setLoading(false);
        }, () => setLoading(false));
        return () => unsub();
    }, [colRef]);

    // Grouper par catégorie
    const grouped = useMemo(() => {
        const map = {};
        CATEGORIES.forEach(c => { map[c.id] = []; });
        tutorials.forEach(t => {
            if (map[t.category]) {
                map[t.category].push(t);
            }
        });
        // Trier chaque groupe par ordre
        Object.values(map).forEach(arr => arr.sort((a, b) => (a.order || 0) - (b.order || 0)));
        return map;
    }, [tutorials]);

    const handleDelete = async (tutorial) => {
        if (!confirm(`Supprimer le tutoriel "${tutorial.label}" ?`)) return;
        await deleteDoc(doc(colRef, tutorial.id));
    };

    const handleEdit = (tutorial) => {
        setEditData(tutorial);
        setShowForm(true);
    };

    const handleSave = () => {
        setEditData(null);
        setShowForm(false);
    };

    const toggleCategory = (catId) => {
        setExpandedCat(prev => prev === catId ? null : catId);
    };

    if (loading) return (
        <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-stone-200 border-t-stone-800 rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <p className={`text-[10px] uppercase font-black tracking-[0.3em] mb-1 ${darkMode ? 'text-stone-500' : 'text-stone-400'}`}>Éditorial</p>
                    <h3 className={`text-xl font-black tracking-tight ${darkMode ? 'text-white' : 'text-stone-900'}`}>
                        Tutoriels Vidéo
                    </h3>
                    <p className={`text-xs mt-1 ${darkMode ? 'text-stone-500' : 'text-stone-400'}`}>
                        Associez des vidéos YouTube à vos produits pour chaque catégorie du Comptoir.
                    </p>
                </div>
                <button
                    onClick={() => { setEditData(null); setShowForm(!showForm); }}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        showForm
                            ? (darkMode ? 'bg-white/5 text-stone-400 hover:text-white' : 'bg-stone-100 text-stone-500 hover:text-stone-900')
                            : (darkMode ? 'bg-white text-stone-900 hover:bg-stone-100' : 'bg-stone-900 text-white hover:bg-stone-700')
                    }`}
                >
                    {showForm ? <><X size={12} /> Fermer</> : <><Plus size={12} /> Ajouter</>}
                </button>
            </div>

            {/* KPI rapide */}
            <div className="grid grid-cols-3 gap-3">
                <div className={`p-3 rounded-xl border text-center ${darkMode ? 'bg-[#161616] border-white/5' : 'bg-white border-stone-200'}`}>
                    <p className={`text-2xl font-black tabular-nums ${darkMode ? 'text-white' : 'text-stone-900'}`}>{tutorials.length}</p>
                    <p className={`text-[9px] font-black uppercase tracking-widest ${darkMode ? 'text-stone-600' : 'text-stone-400'}`}>Tutoriels</p>
                </div>
                <div className={`p-3 rounded-xl border text-center ${darkMode ? 'bg-[#161616] border-white/5' : 'bg-white border-stone-200'}`}>
                    <p className={`text-2xl font-black tabular-nums ${darkMode ? 'text-white' : 'text-stone-900'}`}>{tutorials.filter(t => t.productId && products.some(p => p.id === t.productId)).length}</p>
                    <p className={`text-[9px] font-black uppercase tracking-widest ${darkMode ? 'text-stone-600' : 'text-stone-400'}`}>Liés à un produit</p>
                </div>
                <div className={`p-3 rounded-xl border text-center ${darkMode ? 'bg-[#161616] border-white/5' : 'bg-white border-stone-200'}`}>
                    <p className={`text-2xl font-black tabular-nums ${darkMode ? 'text-white' : 'text-stone-900'}`}>{CATEGORIES.filter(c => grouped[c.id]?.length > 0).length}/{CATEGORIES.length}</p>
                    <p className={`text-[9px] font-black uppercase tracking-widest ${darkMode ? 'text-stone-600' : 'text-stone-400'}`}>Catégories couvertes</p>
                </div>
            </div>

            {/* Formulaire */}
            {showForm && (
                <TutorialForm
                    editData={editData}
                    products={products}
                    onSave={handleSave}
                    onCancel={() => { setEditData(null); setShowForm(false); }}
                    darkMode={darkMode}
                />
            )}

            {/* Liste par catégorie (accordéon) */}
            <div className="space-y-3">
                {CATEGORIES.map(cat => {
                    const items = grouped[cat.id] || [];
                    const isOpen = expandedCat === cat.id;

                    return (
                        <div key={cat.id} className={`rounded-2xl border overflow-hidden transition-all ${darkMode ? 'border-white/5' : 'border-stone-200'}`}>
                            {/* Header catégorie */}
                            <button
                                onClick={() => toggleCategory(cat.id)}
                                className={`w-full flex items-center justify-between px-5 py-4 transition-colors ${
                                    darkMode
                                        ? 'bg-[#161616] hover:bg-white/[0.02]'
                                        : 'bg-white hover:bg-stone-50'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className={`text-sm font-black ${darkMode ? 'text-white' : 'text-stone-900'}`}>
                                        {cat.title}
                                    </span>
                                    <span className={`text-[10px] ${darkMode ? 'text-stone-600' : 'text-stone-400'}`}>
                                        {cat.label}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-black ${
                                        items.length > 0
                                            ? (darkMode ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600')
                                            : (darkMode ? 'bg-white/5 text-stone-600' : 'bg-stone-100 text-stone-400')
                                    }`}>
                                        {items.length}
                                    </span>
                                    {isOpen ? <ChevronUp size={14} className={darkMode ? 'text-stone-500' : 'text-stone-400'} /> : <ChevronDown size={14} className={darkMode ? 'text-stone-500' : 'text-stone-400'} />}
                                </div>
                            </button>

                            {/* Contenu */}
                            {isOpen && (
                                <div className={`px-5 pb-5 space-y-3 ${darkMode ? 'bg-[#0e0e0e]' : 'bg-stone-50/50'}`}>
                                    {items.length === 0 ? (
                                        <div className={`text-center py-8 ${darkMode ? 'text-stone-600' : 'text-stone-400'}`}>
                                            <Film size={24} className="mx-auto mb-2 opacity-40" />
                                            <p className="text-xs">Aucun tutoriel dans cette catégorie</p>
                                            <button
                                                onClick={() => { setEditData(null); setShowForm(true); }}
                                                className={`mt-2 text-[10px] font-black uppercase tracking-widest ${darkMode ? 'text-stone-400 hover:text-white' : 'text-stone-500 hover:text-stone-900'}`}
                                            >
                                                + Ajouter un tutoriel
                                            </button>
                                        </div>
                                    ) : (
                                        items.map(t => {
                                            const product = t.productId ? products.find(p => p.id === t.productId) : null;
                                            return (
                                                <TutorialCard
                                                    key={t.id}
                                                    tutorial={t}
                                                    product={product}
                                                    onEdit={handleEdit}
                                                    onDelete={handleDelete}
                                                    darkMode={darkMode}
                                                />
                                            );
                                        })
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default AdminTutorials;
