import React, { useEffect, useMemo, useState } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { Image, Loader2, Save, Search, ShoppingBag, Star, Upload } from 'lucide-react';
import { db, storage } from '../../firebase/config';
import { FURNITURE_CATEGORY_ROUTES } from '../../utils/seoRoutes';
import { getFurnitureCategory } from '../../utils/furnitureCategory';
import {
    COMPTOIR_SLOT_COUNT,
    FEATURED_SLOT_COUNT,
    HOME_SEO_DEFAULT_SETTINGS,
    HOME_SEO_SETTINGS_CACHE_KEY,
    HOME_SEO_SETTINGS_DOC,
    HOME_SEO_SETTINGS_UPDATED_EVENT,
    HOME_SEO_SELECTION_PRESET_VERSION,
    applyHomeSEODefaultSelections,
    mergeHomeSEOSettings,
    normalizeSlots,
} from '../../utils/homeSEOSettings';

const SHOP_CATEGORIES = [
    { id: 'all', label: 'Tous' },
    { id: 'huiles', label: 'Huiles' },
    { id: 'cires', label: 'Cires' },
    { id: 'savons', label: 'Savons' },
    { id: 'accessoires', label: 'Accessoires' },
    { id: 'outils', label: 'Outils' },
    { id: 'renovation', label: 'Rénovation' },
];

const getItemImage = (item) => item?.images?.[0] || item?.imageUrl || item?.thumbnailUrl || '';
const getProductImage = (product) => product?.imageUrl || product?.thumbnailUrl || product?.images?.[0] || product?.gallery?.[0] || '';

const assignSlot = (ids, count, slotIndex, id) => {
    const next = normalizeSlots(ids, count);
    const previousIndex = next.indexOf(id);
    if (previousIndex !== -1) next[previousIndex] = '';
    next[slotIndex] = id;
    return next;
};

const SlotCard = ({ title, item, image, isActive, darkMode, onClick, onClear }) => (
    <button
        type="button"
        onClick={onClick}
        className={`group overflow-hidden rounded-3xl border text-left transition-all ${isActive
            ? 'border-amber-400 ring-4 ring-amber-400/20'
            : darkMode ? 'border-white/10 bg-white/[0.04] hover:border-white/25' : 'border-stone-200 bg-white hover:border-stone-400'
        }`}
    >
        <div className={`flex items-center justify-between px-4 py-3 text-[10px] font-black uppercase tracking-[0.22em] ${darkMode ? 'text-stone-300' : 'text-stone-500'}`}>
            <span>{title}</span>
            {item && (
                <span
                    role="button"
                    tabIndex={0}
                    onClick={(event) => { event.stopPropagation(); onClear?.(); }}
                    onKeyDown={(event) => { if (event.key === 'Enter') { event.stopPropagation(); onClear?.(); } }}
                    className="rounded-full bg-red-500/10 px-2 py-1 text-red-400"
                >
                    Retirer
                </span>
            )}
        </div>
        <div className={`aspect-[4/3] ${darkMode ? 'bg-stone-950' : 'bg-stone-100'}`}>
            {image ? (
                <img src={image} alt={item?.name || title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" decoding="async" />
            ) : (
                <div className="flex h-full items-center justify-center text-xs font-black uppercase tracking-widest opacity-35">Slot vide</div>
            )}
        </div>
        <div className="p-4">
            <p className={`line-clamp-2 font-serif text-xl leading-tight ${darkMode ? 'text-white' : 'text-stone-950'}`}>{item?.name || 'Cliquez puis choisissez un élément'}</p>
            {item?.material && <p className="mt-2 truncate text-[10px] font-black uppercase tracking-widest text-amber-500">{item.material}</p>}
        </div>
    </button>
);

const AdminHomeSEO = ({ darkMode = false, items = [], affiliateProducts = [] }) => {
    const [settings, setSettings] = useState(HOME_SEO_DEFAULT_SETTINGS);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingKey, setUploadingKey] = useState('');
    const [message, setMessage] = useState('');
    const [activeFurnitureSlot, setActiveFurnitureSlot] = useState(0);
    const [activeComptoirSlot, setActiveComptoirSlot] = useState(0);
    const [furnitureCategory, setFurnitureCategory] = useState('all');
    const [furnitureSearch, setFurnitureSearch] = useState('');
    const [shopCategory, setShopCategory] = useState('all');
    const [shopSearch, setShopSearch] = useState('');

    useEffect(() => {
        let mounted = true;
        getDoc(doc(db, 'sys_metadata', HOME_SEO_SETTINGS_DOC))
            .then((snap) => {
                if (!mounted) return;
                setSettings(snap.exists() ? mergeHomeSEOSettings(snap.data()) : HOME_SEO_DEFAULT_SETTINGS);
            })
            .catch((error) => {
                console.error('HomeSEO settings load error:', error);
                setMessage('Impossible de charger HomeSEO.');
            })
            .finally(() => {
                if (mounted) setLoading(false);
            });
        return () => { mounted = false; };
    }, []);

    const furnitureById = useMemo(() => new Map(items.map((item) => [item.id, item])), [items]);
    const productById = useMemo(() => new Map(affiliateProducts.map((product) => [product.id, product])), [affiliateProducts]);
    const settingsWithDefaults = useMemo(
        () => applyHomeSEODefaultSelections(settings, items, affiliateProducts),
        [settings, items, affiliateProducts]
    );

    const filteredFurniture = useMemo(() => {
        const search = furnitureSearch.trim().toLowerCase();
        return items
            .filter((item) => item.status === 'published' && item.auctionActive !== true && !item.sold)
            .filter((item) => furnitureCategory === 'all' || getFurnitureCategory(item) === furnitureCategory)
            .filter((item) => !search || `${item.name || ''} ${item.material || ''}`.toLowerCase().includes(search))
            .slice(0, 80);
    }, [items, furnitureCategory, furnitureSearch]);

    const filteredProducts = useMemo(() => {
        const search = shopSearch.trim().toLowerCase();
        return affiliateProducts
            .filter((product) => product.status === 'published')
            .filter((product) => shopCategory === 'all' || product.category === shopCategory)
            .filter((product) => !search || `${product.name || ''} ${product.brand || ''} ${product.category || ''}`.toLowerCase().includes(search));
    }, [affiliateProducts, shopCategory, shopSearch]);

    const cardClass = darkMode ? 'bg-stone-900 border-white/10 text-white' : 'bg-white border-stone-200 text-stone-950';
    const inputClass = darkMode ? 'bg-stone-950 border-white/10 text-white placeholder:text-stone-600' : 'bg-stone-50 border-stone-200 text-stone-950 placeholder:text-stone-400';
    const mutedText = darkMode ? 'text-stone-400' : 'text-stone-500';

    const updateField = (field, value) => {
        setSettings((prev) => ({ ...prev, [field]: value }));
    };

    const updateHeroSlide = (index, field, value) => {
        setSettings((prev) => ({
            ...prev,
            heroSlides: prev.heroSlides.map((slide, slideIndex) => slideIndex === index ? { ...slide, [field]: value } : slide),
        }));
    };

    const uploadHeroImage = async (index, field, file) => {
        if (!file) return;
        const key = `hero_${index + 1}_${field}`;
        setUploadingKey(key);
        setMessage('Envoi de l image...');
        try {
            const extension = file.name.split('.').pop() || 'jpg';
            const storageRef = ref(storage, `home-seo/${key}_${Date.now()}.${extension}`);
            await uploadBytes(storageRef, file, {
                cacheControl: 'public, max-age=31536000',
                contentType: file.type || 'image/jpeg',
            });
            const url = await getDownloadURL(storageRef);
            updateHeroSlide(index, field, url);
            setMessage('Image prête. Pensez à enregistrer.');
        } catch (error) {
            console.error('HomeSEO image upload error:', error);
            setMessage(`Erreur upload : ${error.message}`);
        } finally {
            setUploadingKey('');
        }
    };

    const selectFurniture = (item) => {
        setSettings((prev) => ({
            ...prev,
            featuredFurnitureIds: assignSlot(prev.featuredFurnitureIds, FEATURED_SLOT_COUNT, activeFurnitureSlot, item.id),
        }));
        setActiveFurnitureSlot((prev) => Math.min(prev + 1, FEATURED_SLOT_COUNT - 1));
    };

    const selectProduct = (product) => {
        setSettings((prev) => ({
            ...prev,
            comptoirProductIds: assignSlot(prev.comptoirProductIds, COMPTOIR_SLOT_COUNT, activeComptoirSlot, product.id),
        }));
        setActiveComptoirSlot((prev) => Math.min(prev + 1, COMPTOIR_SLOT_COUNT - 1));
    };

    const clearFurnitureSlot = (slotIndex) => {
        setSettings((prev) => {
            const next = normalizeSlots(prev.featuredFurnitureIds, FEATURED_SLOT_COUNT);
            next[slotIndex] = '';
            return { ...prev, featuredFurnitureIds: next };
        });
    };

    const clearComptoirSlot = (slotIndex) => {
        setSettings((prev) => {
            const next = normalizeSlots(prev.comptoirProductIds, COMPTOIR_SLOT_COUNT);
            next[slotIndex] = '';
            return { ...prev, comptoirProductIds: next };
        });
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage('Sauvegarde...');
        try {
            const payload = {
                ...settingsWithDefaults,
                featuredFurnitureIds: normalizeSlots(settingsWithDefaults.featuredFurnitureIds, FEATURED_SLOT_COUNT).filter(Boolean),
                comptoirProductIds: normalizeSlots(settingsWithDefaults.comptoirProductIds, COMPTOIR_SLOT_COUNT).filter(Boolean),
                selectionPresetVersion: HOME_SEO_SELECTION_PRESET_VERSION,
                updatedAt: Date.now(),
            };
            await setDoc(doc(db, 'sys_metadata', HOME_SEO_SETTINGS_DOC), payload, { merge: true });
            try {
                localStorage.setItem(HOME_SEO_SETTINGS_CACHE_KEY, JSON.stringify(payload));
                window.dispatchEvent(new CustomEvent(HOME_SEO_SETTINGS_UPDATED_EVENT, { detail: payload }));
            } catch {
                // Firestore is the source of truth; local sync only refreshes the current tab.
            }
            setSettings(mergeHomeSEOSettings(payload));
            setMessage('HomeSEO enregistré.');
        } catch (error) {
            console.error('HomeSEO save error:', error);
            setMessage(`Erreur sauvegarde : ${error.message}`);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-12 text-center animate-pulse text-stone-400">Chargement HomeSEO...</div>;

    return (
        <div className={`space-y-10 pb-24 ${darkMode ? 'text-white' : 'text-stone-950'}`}>
            <div className={`rounded-[2.5rem] border p-6 md:p-8 ${cardClass}`}>
                <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.32em] text-amber-500">Personnalisation SEO</p>
                        <h2 className="mt-2 text-3xl font-black tracking-tight md:text-5xl">HomeSEO</h2>
                        <p className={`mt-3 max-w-3xl text-sm leading-relaxed ${mutedText}`}>Pilotez la landing SEO : hero, meubles en vedette et Comptoir. Les valeurs actuelles restent utilisées si aucun réglage n est choisi.</p>
                    </div>
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving || !!uploadingKey}
                        className="inline-flex h-14 items-center justify-center gap-3 rounded-2xl bg-emerald-600 px-8 text-[11px] font-black uppercase tracking-[0.22em] text-white transition hover:bg-emerald-500 disabled:opacity-50"
                    >
                        {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        Enregistrer
                    </button>
                </div>
                {message && <div className="mt-5 rounded-2xl bg-amber-500/10 px-4 py-3 text-xs font-bold text-amber-500">{message}</div>}
            </div>

            <section className={`rounded-[2.5rem] border p-6 md:p-8 ${cardClass}`}>
                <div className="mb-8 flex items-center gap-3">
                    <Image className="text-amber-500" size={22} />
                    <div>
                        <h3 className="text-xl font-black uppercase tracking-widest">Hero</h3>
                        <p className={`text-xs ${mutedText}`}>Textes visibles et deux images du carousel principal.</p>
                    </div>
                </div>
                <div className="grid gap-5 lg:grid-cols-2">
                    <label className="space-y-2">
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Sur-titre</span>
                        <input value={settingsWithDefaults.heroEyebrow} onChange={(event) => updateField('heroEyebrow', event.target.value)} className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none ${inputClass}`} />
                    </label>
                    <label className="space-y-2">
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Texte carte localisation</span>
                        <input value={settingsWithDefaults.heroLocationText} onChange={(event) => updateField('heroLocationText', event.target.value)} className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none ${inputClass}`} />
                    </label>
                    <label className="space-y-2 lg:col-span-2">
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-60">H1 SEO visible</span>
                        <textarea value={settingsWithDefaults.heroTitle} onChange={(event) => updateField('heroTitle', event.target.value)} rows={2} className={`w-full rounded-2xl border px-4 py-3 font-serif text-2xl outline-none ${inputClass}`} />
                    </label>
                    <label className="space-y-2 lg:col-span-2">
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Description hero</span>
                        <textarea value={settingsWithDefaults.heroDescription} onChange={(event) => updateField('heroDescription', event.target.value)} rows={3} className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none ${inputClass}`} />
                    </label>
                </div>
                <div className="mt-8 grid gap-5 lg:grid-cols-2">
                    {settingsWithDefaults.heroSlides.map((slide, index) => (
                        <div key={slide.key || index} className={`rounded-3xl border p-4 ${darkMode ? 'border-white/10 bg-white/[0.03]' : 'border-stone-200 bg-stone-50'}`}>
                            <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-stone-950/20">
                                {slide.image && <img src={slide.image} alt={slide.alt || `Hero ${index + 1}`} className="h-full w-full object-cover" />}
                            </div>
                            <div className="mt-4 space-y-3">
                                <input value={slide.alt || ''} onChange={(event) => updateHeroSlide(index, 'alt', event.target.value)} placeholder="Texte alternatif" className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none ${inputClass}`} />
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <label className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-amber-500/50 text-[10px] font-black uppercase tracking-widest text-amber-500">
                                        <Upload size={14} /> Desktop
                                        <input type="file" accept="image/*" className="hidden" onChange={(event) => uploadHeroImage(index, 'image', event.target.files?.[0])} />
                                    </label>
                                    <label className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-amber-500/50 text-[10px] font-black uppercase tracking-widest text-amber-500">
                                        <Upload size={14} /> Mobile
                                        <input type="file" accept="image/*" className="hidden" onChange={(event) => uploadHeroImage(index, 'mobile', event.target.files?.[0])} />
                                    </label>
                                </div>
                                {uploadingKey.startsWith(`hero_${index + 1}`) && <p className="text-xs text-amber-500">Upload en cours...</p>}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section className={`rounded-[2.5rem] border p-6 md:p-8 ${cardClass}`}>
                <div className="mb-8 flex items-center gap-3">
                    <Star className="text-amber-500" size={22} />
                    <div>
                        <h3 className="text-xl font-black uppercase tracking-widest">Meubles mis en avant</h3>
                        <p className={`text-xs ${mutedText}`}>Choisissez 4 meubles dans l ordre d affichage : gauche, puis les suivants.</p>
                    </div>
                </div>
                <div className="mb-6 grid gap-4 lg:grid-cols-2">
                    <input value={settingsWithDefaults.featuredEyebrow} onChange={(event) => updateField('featuredEyebrow', event.target.value)} className={`rounded-2xl border px-4 py-3 text-sm outline-none ${inputClass}`} />
                    <input value={settingsWithDefaults.featuredTitle} onChange={(event) => updateField('featuredTitle', event.target.value)} className={`rounded-2xl border px-4 py-3 text-sm outline-none ${inputClass}`} />
                </div>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {normalizeSlots(settingsWithDefaults.featuredFurnitureIds, FEATURED_SLOT_COUNT).map((id, index) => {
                        const item = furnitureById.get(id);
                        return (
                            <SlotCard
                                key={index}
                                title={`Position ${index + 1}`}
                                item={item}
                                image={getItemImage(item)}
                                isActive={activeFurnitureSlot === index}
                                darkMode={darkMode}
                                onClick={() => setActiveFurnitureSlot(index)}
                                onClear={() => clearFurnitureSlot(index)}
                            />
                        );
                    })}
                </div>
                <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-wrap gap-2">
                        {Object.entries(FURNITURE_CATEGORY_ROUTES).map(([id, route]) => (
                            <button key={id} type="button" onClick={() => setFurnitureCategory(id)} className={`rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-widest transition ${furnitureCategory === id ? 'bg-amber-500 text-stone-950' : darkMode ? 'bg-white/5 text-stone-300' : 'bg-stone-100 text-stone-600'}`}>{route.label}</button>
                        ))}
                    </div>
                    <div className={`flex items-center gap-2 rounded-2xl border px-4 py-3 ${inputClass}`}>
                        <Search size={16} className="opacity-40" />
                        <input value={furnitureSearch} onChange={(event) => setFurnitureSearch(event.target.value)} placeholder="Rechercher un meuble" className="w-full bg-transparent text-sm outline-none" />
                    </div>
                </div>
                <div className="mt-5 grid max-h-[620px] gap-4 overflow-y-auto pr-1 md:grid-cols-2 xl:grid-cols-3">
                    {filteredFurniture.map((item) => (
                        <button key={item.id} type="button" onClick={() => selectFurniture(item)} className={`group flex gap-4 rounded-3xl border p-3 text-left transition ${darkMode ? 'border-white/10 bg-white/[0.03] hover:border-amber-500/60' : 'border-stone-200 bg-stone-50 hover:border-amber-500'}`}>
                            <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-stone-200">
                                {getItemImage(item) && <img src={getItemImage(item)} alt={item.name} className="h-full w-full object-cover" loading="lazy" decoding="async" />}
                            </div>
                            <div className="min-w-0 py-1">
                                <p className="line-clamp-2 font-serif text-lg leading-tight">{item.name}</p>
                                <p className="mt-2 text-[9px] font-black uppercase tracking-widest text-amber-500">{FURNITURE_CATEGORY_ROUTES[getFurnitureCategory(item)]?.label || 'Meuble'}</p>
                                <p className={`mt-1 truncate text-xs ${mutedText}`}>{item.material || 'Bois massif'}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </section>

            <section className={`rounded-[2.5rem] border p-6 md:p-8 ${cardClass}`}>
                <div className="mb-8 flex items-center gap-3">
                    <ShoppingBag className="text-amber-500" size={22} />
                    <div>
                        <h3 className="text-xl font-black uppercase tracking-widest">Partie Comptoir</h3>
                        <p className={`text-xs ${mutedText}`}>Choisissez les produits du carousel dans l ordre voulu.</p>
                    </div>
                </div>
                <div className="mb-6 grid gap-4 lg:grid-cols-2">
                    <input value={settingsWithDefaults.comptoirEyebrow} onChange={(event) => updateField('comptoirEyebrow', event.target.value)} className={`rounded-2xl border px-4 py-3 text-sm outline-none ${inputClass}`} />
                    <input value={settingsWithDefaults.comptoirTitle} onChange={(event) => updateField('comptoirTitle', event.target.value)} className={`rounded-2xl border px-4 py-3 text-sm outline-none ${inputClass}`} />
                    <textarea value={settingsWithDefaults.comptoirDescription} onChange={(event) => updateField('comptoirDescription', event.target.value)} rows={3} className={`rounded-2xl border px-4 py-3 text-sm outline-none lg:col-span-2 ${inputClass}`} />
                </div>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {normalizeSlots(settingsWithDefaults.comptoirProductIds, COMPTOIR_SLOT_COUNT).map((id, index) => {
                        const product = productById.get(id);
                        return (
                            <SlotCard
                                key={index}
                                title={`Comptoir ${index + 1}`}
                                item={product}
                                image={getProductImage(product)}
                                isActive={activeComptoirSlot === index}
                                darkMode={darkMode}
                                onClick={() => setActiveComptoirSlot(index)}
                                onClear={() => clearComptoirSlot(index)}
                            />
                        );
                    })}
                </div>
                <div className={`mt-8 rounded-3xl border p-4 ${darkMode ? 'border-white/10 bg-white/[0.03]' : 'border-stone-200 bg-stone-50'}`}>
                    <p className="mb-3 text-[10px] font-black uppercase tracking-[0.24em] text-amber-500">Emplacement à modifier</p>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-8">
                        {normalizeSlots(settingsWithDefaults.comptoirProductIds, COMPTOIR_SLOT_COUNT).map((id, index) => {
                            const product = productById.get(id);
                            return (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => setActiveComptoirSlot(index)}
                                    className={`min-h-14 rounded-2xl border px-3 py-2 text-left transition ${activeComptoirSlot === index
                                        ? 'border-amber-400 bg-amber-400/12 text-amber-200 ring-2 ring-amber-400/15'
                                        : darkMode ? 'border-white/10 bg-black/20 text-stone-300 hover:border-white/25' : 'border-stone-200 bg-white text-stone-700 hover:border-stone-400'
                                    }`}
                                >
                                    <span className="block text-[9px] font-black uppercase tracking-[0.18em]">Comptoir {index + 1}</span>
                                    <span className="mt-1 block truncate text-xs opacity-70">{product?.detailDraft?.shortTitle || product?.name || 'Slot vide'}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
                <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-wrap gap-2">
                        {SHOP_CATEGORIES.map((category) => (
                            <button key={category.id} type="button" onClick={() => setShopCategory(category.id)} className={`rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-widest transition ${shopCategory === category.id ? 'bg-amber-500 text-stone-950' : darkMode ? 'bg-white/5 text-stone-300' : 'bg-stone-100 text-stone-600'}`}>{category.label}</button>
                        ))}
                    </div>
                    <div className={`flex items-center gap-2 rounded-2xl border px-4 py-3 ${inputClass}`}>
                        <Search size={16} className="opacity-40" />
                        <input value={shopSearch} onChange={(event) => setShopSearch(event.target.value)} placeholder="Rechercher un produit" className="w-full bg-transparent text-sm outline-none" />
                    </div>
                </div>
                <div className="mt-5 grid gap-4 pr-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                    {filteredProducts.map((product) => (
                        <button key={product.id} type="button" onClick={() => selectProduct(product)} className={`group flex gap-4 rounded-3xl border p-3 text-left transition ${darkMode ? 'border-white/10 bg-white/[0.03] hover:border-amber-500/60' : 'border-stone-200 bg-stone-50 hover:border-amber-500'}`}>
                            <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-stone-200 p-2">
                                {getProductImage(product) && <img src={getProductImage(product)} alt={product.name} className="h-full w-full object-contain" loading="lazy" decoding="async" />}
                            </div>
                            <div className="min-w-0 py-1">
                                <p className="line-clamp-2 font-serif text-lg leading-tight">{product.detailDraft?.shortTitle || product.name}</p>
                                <p className="mt-2 text-[9px] font-black uppercase tracking-widest text-amber-500">{product.brand || 'Sélection atelier'}</p>
                                <p className={`mt-1 truncate text-xs ${mutedText}`}>{product.category || 'Comptoir'}</p>
                                <p className="mt-3 text-[9px] font-black uppercase tracking-[0.18em] text-amber-500/90">Placer en Comptoir {activeComptoirSlot + 1}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default AdminHomeSEO;
