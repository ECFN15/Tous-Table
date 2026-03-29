import React, { useState, useEffect, useMemo } from 'react';
import {
    collection, onSnapshot, addDoc, updateDoc, deleteDoc,
    doc, serverTimestamp, query, orderBy, getDocs
} from 'firebase/firestore';
import { db, appId } from '../../firebase/config';
import {
    Plus, Pencil, Trash2, ExternalLink, Eye, EyeOff,
    Star, StarOff, MousePointerClick, ShoppingBag, TrendingUp,
    Package, X, Check, ChevronDown
} from 'lucide-react';

// ─── CONSTANTES ───────────────────────────────────────────────────────────────

const CATEGORIES = [
    { id: 'patines_cires',  label: 'Patines & Cires' },
    { id: 'peintures',      label: 'Peintures & Finitions' },
    { id: 'huiles',         label: 'Huiles & Protection' },
    { id: 'resines',        label: 'Résines & Effets' },
    { id: 'preparation',    label: 'Préparation & Décapage' },
    { id: 'outils',         label: 'Outils & Accessoires' },
];

const TIERS = [
    { id: 'essentiel', label: 'Essentiel', style: 'bg-stone-200 text-stone-700' },
    { id: 'premium',   label: 'Premium',   style: 'bg-amber-100 text-amber-800' },
    { id: 'expert',    label: 'Expert',    style: 'bg-stone-900 text-white border border-white/10' },
];

const PROGRAMS = [
    { id: 'amazon',      label: 'Amazon' },
    { id: 'manomano',    label: 'ManoMano' },
    { id: 'leroymerlin', label: 'Leroy Merlin' },
    { id: 'rakuten',     label: 'Rakuten' },
    { id: 'castorama',   label: 'Castorama' },
    { id: 'direct',      label: 'Direct (marque)' },
];

const EMPTY_FORM = {
    name: '',
    brand: '',
    description: '',
    category: 'patines_cires',
    tier: 'premium',
    price: '',
    affiliateUrl: '',
    affiliateProgram: 'amazon',
    imageUrl: '',
    whyWeRecommend: '',
    proTip: '',
    featured: false,
    status: 'draft',
};

// ─── COMPOSANTS UTILITAIRES ───────────────────────────────────────────────────

const TierBadge = ({ tier }) => {
    const t = TIERS.find(t => t.id === tier) || TIERS[0];
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${t.style}`}>
            {t.label}
        </span>
    );
};

const KpiCard = ({ label, value, icon: Icon, darkMode, accent }) => (
    <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-[#161616] border-white/5' : 'bg-white border-stone-200'}`}>
        <div className="flex items-center justify-between mb-3">
            <span className={`text-[10px] font-black uppercase tracking-widest ${darkMode ? 'text-stone-500' : 'text-stone-400'}`}>{label}</span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${accent || (darkMode ? 'bg-white/5' : 'bg-stone-50')}`}>
                <Icon size={14} className={darkMode ? 'text-stone-300' : 'text-stone-600'} />
            </div>
        </div>
        <p className={`text-3xl font-black tracking-tighter ${darkMode ? 'text-white' : 'text-stone-900'}`}>{value}</p>
    </div>
);

// ─── FORMULAIRE PRODUIT ───────────────────────────────────────────────────────

const ProductForm = ({ editData, onSave, onCancel, darkMode }) => {
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (editData) {
            setForm({ ...EMPTY_FORM, ...editData });
        } else {
            setForm(EMPTY_FORM);
        }
        setError('');
    }, [editData]);

    const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name.trim() || !form.brand.trim() || !form.affiliateUrl.trim()) {
            setError('Nom, marque et URL affiliée sont obligatoires.');
            return;
        }
        setSaving(true);
        setError('');
        try {
            const payload = {
                name: form.name.trim(),
                brand: form.brand.trim(),
                description: form.description.trim(),
                category: form.category,
                tier: form.tier,
                price: form.price ? parseFloat(form.price) : null,
                affiliateUrl: form.affiliateUrl.trim(),
                affiliateProgram: form.affiliateProgram,
                imageUrl: form.imageUrl.trim(),
                whyWeRecommend: form.whyWeRecommend.trim(),
                proTip: form.proTip.trim(),
                featured: form.featured,
                status: form.status,
                updatedAt: serverTimestamp(),
            };
            const colRef = collection(db, 'artifacts', appId, 'public', 'data', 'affiliate_products');
            if (editData?.id) {
                await updateDoc(doc(colRef, editData.id), payload);
            } else {
                await addDoc(colRef, { ...payload, clickCount: 0, createdAt: serverTimestamp() });
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

    return (
        <form onSubmit={handleSubmit} className={`rounded-3xl border p-6 space-y-5 ${darkMode ? 'bg-[#161616] border-white/5' : 'bg-white border-stone-200'}`}>
            <div className="flex items-center justify-between">
                <h3 className={`text-sm font-black uppercase tracking-widest ${darkMode ? 'text-white' : 'text-stone-900'}`}>
                    {editData ? 'Modifier le produit' : 'Ajouter un produit'}
                </h3>
                {editData && (
                    <button type="button" onClick={onCancel} className={`p-2 rounded-xl transition-colors ${darkMode ? 'hover:bg-white/5 text-stone-500' : 'hover:bg-stone-100 text-stone-400'}`}>
                        <X size={16} />
                    </button>
                )}
            </div>

            {/* Ligne 1 — Nom + Marque */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className={labelCls}>Nom du produit *</label>
                    <input className={inputCls} value={form.name} onChange={e => set('name', e.target.value)} placeholder="Cire d'Abeille Pure 375ml" />
                </div>
                <div>
                    <label className={labelCls}>Marque *</label>
                    <input className={inputCls} value={form.brand} onChange={e => set('brand', e.target.value)} placeholder="Liberon" />
                </div>
            </div>

            {/* Ligne 2 — Categorie + Gamme + Programme */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className={labelCls}>Catégorie</label>
                    <select className={inputCls} value={form.category} onChange={e => set('category', e.target.value)}>
                        {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                    </select>
                </div>
                <div>
                    <label className={labelCls}>Gamme</label>
                    <select className={inputCls} value={form.tier} onChange={e => set('tier', e.target.value)}>
                        {TIERS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                    </select>
                </div>
                <div>
                    <label className={labelCls}>Programme</label>
                    <select className={inputCls} value={form.affiliateProgram} onChange={e => set('affiliateProgram', e.target.value)}>
                        {PROGRAMS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                    </select>
                </div>
            </div>

            {/* Ligne 3 — URL + Prix */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                    <label className={labelCls}>Lien affilié * <span className={`normal-case font-normal ${darkMode ? 'text-stone-600' : 'text-stone-400'}`}>(avec votre tag/ID)</span></label>
                    <input className={inputCls} value={form.affiliateUrl} onChange={e => set('affiliateUrl', e.target.value)} placeholder="https://www.amazon.fr/dp/...?tag=votretag-21" />
                </div>
                <div>
                    <label className={labelCls}>Prix indicatif (€)</label>
                    <input className={inputCls} type="number" step="0.01" min="0" value={form.price} onChange={e => set('price', e.target.value)} placeholder="24.90" />
                </div>
            </div>

            {/* Image URL */}
            <div>
                <label className={labelCls}>URL image produit</label>
                <input className={inputCls} value={form.imageUrl} onChange={e => set('imageUrl', e.target.value)} placeholder="https://..." />
                {form.imageUrl && (
                    <div className="mt-2 w-16 h-16 rounded-xl overflow-hidden border border-white/10">
                        <img src={form.imageUrl} alt="preview" className="w-full h-full object-cover" onError={e => { e.target.style.display='none'; }} />
                    </div>
                )}
            </div>

            {/* Description */}
            <div>
                <label className={labelCls}>Description courte</label>
                <textarea className={`${inputCls} resize-none`} rows={2} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Description du produit..." />
            </div>

            {/* Why + ProTip */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className={labelCls}>Pourquoi on le recommande</label>
                    <textarea className={`${inputCls} resize-none`} rows={2} value={form.whyWeRecommend} onChange={e => set('whyWeRecommend', e.target.value)} placeholder="Un classique de la rénovation..." />
                </div>
                <div>
                    <label className={labelCls}>Conseil pro</label>
                    <textarea className={`${inputCls} resize-none`} rows={2} value={form.proTip} onChange={e => set('proTip', e.target.value)} placeholder="Appliquer en couches fines..." />
                </div>
            </div>

            {/* Toggles */}
            <div className="flex items-center gap-6">
                <ToggleSwitch label="Mis en avant" checked={form.featured} onChange={v => set('featured', v)} darkMode={darkMode} />
                <ToggleSwitch label="Publié" checked={form.status === 'published'} onChange={v => set('status', v ? 'published' : 'draft')} darkMode={darkMode} />
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
                    {saving ? 'Enregistrement...' : (editData ? <><Check size={14} /> Mettre à jour</> : <><Plus size={14} /> Ajouter</>)}
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

// ─── TOGGLE SWITCH ────────────────────────────────────────────────────────────

const ToggleSwitch = ({ label, checked, onChange, darkMode }) => (
    <label className="flex items-center gap-3 cursor-pointer select-none">
        <div
            onClick={() => onChange(!checked)}
            className={`relative w-10 h-5 rounded-full transition-colors ${checked ? 'bg-emerald-500' : (darkMode ? 'bg-white/10' : 'bg-stone-200')}`}
        >
            <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
        </div>
        <span className={`text-[11px] font-black uppercase tracking-widest ${darkMode ? 'text-stone-400' : 'text-stone-500'}`}>{label}</span>
    </label>
);

// ─── LISTE PRODUITS ───────────────────────────────────────────────────────────

const ProductList = ({ products, onEdit, onDelete, onToggleStatus, onToggleFeatured, darkMode }) => {
    const [filterCat, setFilterCat] = useState('all');
    const [filterTier, setFilterTier] = useState('all');

    const filtered = useMemo(() => {
        return products.filter(p => {
            if (filterCat !== 'all' && p.category !== filterCat) return false;
            if (filterTier !== 'all' && p.tier !== filterTier) return false;
            return true;
        });
    }, [products, filterCat, filterTier]);

    const pillCls = (active) => `px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${
        active
            ? (darkMode ? 'bg-white text-stone-900' : 'bg-stone-900 text-white')
            : (darkMode ? 'text-stone-500 hover:text-white hover:bg-white/5' : 'text-stone-400 hover:text-stone-900 hover:bg-stone-100')
    }`;

    return (
        <div className="space-y-4">
            {/* Filtres */}
            <div className="flex flex-wrap items-center gap-2">
                <button className={pillCls(filterCat === 'all')} onClick={() => setFilterCat('all')}>Tout</button>
                {CATEGORIES.map(c => (
                    <button key={c.id} className={pillCls(filterCat === c.id)} onClick={() => setFilterCat(c.id)}>{c.label}</button>
                ))}
                <div className={`w-px h-4 mx-1 ${darkMode ? 'bg-white/10' : 'bg-stone-200'}`} />
                {TIERS.map(t => (
                    <button key={t.id} className={pillCls(filterTier === t.id)} onClick={() => setFilterTier(prev => prev === t.id ? 'all' : t.id)}>{t.label}</button>
                ))}
            </div>

            {filtered.length === 0 && (
                <div className={`text-center py-16 text-sm ${darkMode ? 'text-stone-600' : 'text-stone-400'}`}>
                    Aucun produit. Ajoutez-en un via le formulaire ci-dessus.
                </div>
            )}

            {/* Table */}
            {filtered.length > 0 && (
                <div className={`rounded-3xl border overflow-hidden ${darkMode ? 'bg-[#161616] border-white/5' : 'bg-white border-stone-200'}`}>
                    <table className="w-full">
                        <thead>
                            <tr className={`border-b text-[9px] font-black uppercase tracking-widest ${darkMode ? 'border-white/5 text-stone-600' : 'border-stone-100 text-stone-400'}`}>
                                <th className="px-5 py-3 text-left">Produit</th>
                                <th className="px-5 py-3 text-left hidden md:table-cell">Catégorie</th>
                                <th className="px-5 py-3 text-left hidden md:table-cell">Programme</th>
                                <th className="px-5 py-3 text-right">Clics</th>
                                <th className="px-5 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((p, i) => {
                                const cat = CATEGORIES.find(c => c.id === p.category);
                                const prog = PROGRAMS.find(pr => pr.id === p.affiliateProgram);
                                return (
                                    <tr
                                        key={p.id}
                                        className={`transition-colors ${i < filtered.length - 1 ? (darkMode ? 'border-b border-white/5' : 'border-b border-stone-50') : ''} ${darkMode ? 'hover:bg-white/[0.02]' : 'hover:bg-stone-50/50'}`}
                                    >
                                        {/* Produit */}
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                {p.imageUrl ? (
                                                    <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-white/5">
                                                        <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                                                    </div>
                                                ) : (
                                                    <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center ${darkMode ? 'bg-white/5' : 'bg-stone-100'}`}>
                                                        <ShoppingBag size={14} className={darkMode ? 'text-stone-600' : 'text-stone-400'} />
                                                    </div>
                                                )}
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className={`text-sm font-bold truncate max-w-[180px] ${darkMode ? 'text-white' : 'text-stone-900'}`}>{p.name}</span>
                                                        <TierBadge tier={p.tier} />
                                                        {p.featured && <span className="text-amber-400"><Star size={12} fill="currentColor" /></span>}
                                                    </div>
                                                    <span className={`text-[10px] ${darkMode ? 'text-stone-500' : 'text-stone-400'}`}>{p.brand}</span>
                                                    {p.price && <span className={`ml-2 text-[10px] font-bold ${darkMode ? 'text-stone-400' : 'text-stone-600'}`}>{p.price.toFixed(2)}€</span>}
                                                </div>
                                            </div>
                                        </td>

                                        {/* Categorie */}
                                        <td className="px-5 py-4 hidden md:table-cell">
                                            <span className={`text-[10px] ${darkMode ? 'text-stone-500' : 'text-stone-400'}`}>{cat?.label || p.category}</span>
                                        </td>

                                        {/* Programme */}
                                        <td className="px-5 py-4 hidden md:table-cell">
                                            <span className={`text-[10px] font-medium ${darkMode ? 'text-stone-400' : 'text-stone-600'}`}>{prog?.label || p.affiliateProgram}</span>
                                        </td>

                                        {/* Clics */}
                                        <td className="px-5 py-4 text-right">
                                            <span className={`text-sm font-black tabular-nums ${(p.clickCount || 0) > 0 ? 'text-emerald-500' : (darkMode ? 'text-stone-600' : 'text-stone-300')}`}>
                                                {p.clickCount || 0}
                                            </span>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-5 py-4">
                                            <div className="flex items-center justify-end gap-1">
                                                {/* Lien direct */}
                                                <a
                                                    href={p.affiliateUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={`p-2 rounded-xl transition-colors ${darkMode ? 'hover:bg-white/5 text-stone-600 hover:text-stone-400' : 'hover:bg-stone-100 text-stone-300 hover:text-stone-600'}`}
                                                    title="Ouvrir le lien"
                                                >
                                                    <ExternalLink size={14} />
                                                </a>
                                                {/* Mis en avant */}
                                                <button
                                                    onClick={() => onToggleFeatured(p)}
                                                    className={`p-2 rounded-xl transition-colors ${darkMode ? 'hover:bg-white/5' : 'hover:bg-stone-100'} ${p.featured ? 'text-amber-400' : (darkMode ? 'text-stone-600' : 'text-stone-300')}`}
                                                    title={p.featured ? 'Retirer de la mise en avant' : 'Mettre en avant'}
                                                >
                                                    {p.featured ? <Star size={14} fill="currentColor" /> : <StarOff size={14} />}
                                                </button>
                                                {/* Publié / Brouillon */}
                                                <button
                                                    onClick={() => onToggleStatus(p)}
                                                    className={`p-2 rounded-xl transition-colors ${darkMode ? 'hover:bg-white/5' : 'hover:bg-stone-100'} ${p.status === 'published' ? 'text-emerald-500' : (darkMode ? 'text-stone-600' : 'text-stone-300')}`}
                                                    title={p.status === 'published' ? 'Masquer' : 'Publier'}
                                                >
                                                    {p.status === 'published' ? <Eye size={14} /> : <EyeOff size={14} />}
                                                </button>
                                                {/* Modifier */}
                                                <button
                                                    onClick={() => onEdit(p)}
                                                    className={`p-2 rounded-xl transition-colors ${darkMode ? 'hover:bg-white/5 text-stone-600 hover:text-stone-300' : 'hover:bg-stone-100 text-stone-300 hover:text-stone-600'}`}
                                                    title="Modifier"
                                                >
                                                    <Pencil size={14} />
                                                </button>
                                                {/* Supprimer */}
                                                <button
                                                    onClick={() => onDelete(p)}
                                                    className={`p-2 rounded-xl transition-colors ${darkMode ? 'hover:bg-red-900/20 text-stone-600 hover:text-red-400' : 'hover:bg-red-50 text-stone-300 hover:text-red-500'}`}
                                                    title="Supprimer"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

// ─── COMPOSANT PRINCIPAL ──────────────────────────────────────────────────────

const AdminShop = ({ darkMode }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editData, setEditData] = useState(null);

    const colRef = useMemo(() => collection(db, 'artifacts', appId, 'public', 'data', 'affiliate_products'), []);

    // Listener temps réel
    useEffect(() => {
        const q = query(colRef, orderBy('createdAt', 'desc'));
        const unsub = onSnapshot(q, snap => {
            setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            setLoading(false);
        }, () => setLoading(false));
        return () => unsub();
    }, [colRef]);

    // KPIs
    const kpis = useMemo(() => ({
        total: products.length,
        published: products.filter(p => p.status === 'published').length,
        totalClicks: products.reduce((acc, p) => acc + (p.clickCount || 0), 0),
        topProduct: products.reduce((top, p) => (!top || (p.clickCount || 0) > (top.clickCount || 0)) ? p : top, null),
    }), [products]);

    const handleDelete = async (product) => {
        if (!confirm(`Supprimer "${product.name}" ?`)) return;
        await deleteDoc(doc(colRef, product.id));
    };

    const handleToggleStatus = async (product) => {
        await updateDoc(doc(colRef, product.id), {
            status: product.status === 'published' ? 'draft' : 'published',
            updatedAt: serverTimestamp(),
        });
    };

    const handleToggleFeatured = async (product) => {
        await updateDoc(doc(colRef, product.id), {
            featured: !product.featured,
            updatedAt: serverTimestamp(),
        });
    };

    const handleSave = () => setEditData(null);

    if (loading) return (
        <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-stone-200 border-t-stone-800 rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <p className={`text-[10px] uppercase font-black tracking-[0.3em] mb-1 ${darkMode ? 'text-stone-500' : 'text-stone-400'}`}>Affiliation</p>
                <h2 className={`text-3xl font-black tracking-tighter ${darkMode ? 'text-white' : 'text-stone-900'}`}>L'Atelier — Boutique</h2>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <KpiCard label="Produits" value={kpis.total} icon={Package} darkMode={darkMode} />
                <KpiCard label="Publiés" value={kpis.published} icon={Eye} darkMode={darkMode} accent="bg-emerald-500/10" />
                <KpiCard label="Clics totaux" value={kpis.totalClicks} icon={MousePointerClick} darkMode={darkMode} accent="bg-amber-500/10" />
                <KpiCard
                    label="Top produit"
                    value={kpis.topProduct ? `${kpis.topProduct.clickCount || 0} clics` : '—'}
                    icon={TrendingUp}
                    darkMode={darkMode}
                    accent="bg-blue-500/10"
                />
            </div>
            {kpis.topProduct && (
                <p className={`-mt-5 text-[11px] ${darkMode ? 'text-stone-600' : 'text-stone-400'}`}>
                    → {kpis.topProduct.name}
                </p>
            )}

            {/* Bannière légale */}
            <div className={`rounded-2xl border px-5 py-3 flex items-start gap-3 ${darkMode ? 'bg-amber-500/5 border-amber-500/20' : 'bg-amber-50 border-amber-200'}`}>
                <span className="text-amber-500 mt-0.5">⚠</span>
                <p className={`text-xs ${darkMode ? 'text-amber-200/70' : 'text-amber-800'}`}>
                    <strong>Rappel légal :</strong> chaque lien affilié doit être accompagné d'une mention visible ("lien partenaire"). La page boutique doit afficher un bandeau d'information. Loi française de juin 2023.
                </p>
            </div>

            {/* Formulaire */}
            <ProductForm
                editData={editData}
                onSave={handleSave}
                onCancel={() => setEditData(null)}
                darkMode={darkMode}
            />

            {/* Liste */}
            <ProductList
                products={products}
                onEdit={(p) => { setEditData(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                onDelete={handleDelete}
                onToggleStatus={handleToggleStatus}
                onToggleFeatured={handleToggleFeatured}
                darkMode={darkMode}
            />
        </div>
    );
};

export default AdminShop;
