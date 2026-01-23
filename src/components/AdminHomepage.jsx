import React, { useState, useEffect, useRef } from 'react';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase/config';
import { Upload, X, Save, Image as ImageIcon, Loader, Info, Check, Download } from 'lucide-react';
import { compressImage } from '../utils/imageUtils';

// CONFIGURATION DES IMAGES DU HOMEPAGE
// Cette structure définit toutes les images modifiables
const HOMEPAGE_CONFIG = [
    {
        section: "Manifesto",
        description: "Section d'introduction 'Héritage'",
        items: [
            { key: "manifesto_1", label: "Image 1 - Le Plateau", format: "Portrait (3:4)", default: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?q=80&w=1200" },
            { key: "manifesto_2", label: "Image 2 - La Console", format: "Portrait (4:5)", default: "https://images.unsplash.com/photo-1618220179428-22790b461013?q=80&w=1200" },
            { key: "manifesto_3", label: "Image 3 - La Renaissance", format: "Paysage (16:9)", default: "https://images.unsplash.com/photo-1567016432779-094069958ea5?q=80&w=1400" }
        ]
    },
    {
        section: "Process (Étapes)",
        description: "Les 5 étapes du rituel de restauration",
        items: [
            { key: "process_1", label: "Étape I - L'Essence", format: "Portrait/Paysage", default: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?q=80&w=1400" },
            { key: "process_2", label: "Étape II - L'Analyse", format: "Portrait/Paysage", default: "https://images.unsplash.com/photo-1644358686685-4ed525a59663?q=80&w=2000&auto=format&fit=crop" },
            { key: "process_3", label: "Étape III - Le Dessin", format: "Portrait/Paysage", default: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=2000&auto=format&fit=crop" },
            { key: "process_4", label: "Étape IV - La Cure", format: "Portrait/Paysage", default: "https://images.unsplash.com/photo-1600585152220-90363fe7e115?q=80&w=1400" },
            { key: "process_5", label: "Étape V - L'Éclat", format: "Portrait/Paysage", default: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=1400" }
        ]
    },
    {
        section: "En Vedette (Cartes)",
        description: "Les 4 cartes empilées (Stacked Cards)",
        items: [
            { key: "featured_1", label: "Carte 1 - Voltaire", format: "Portrait", default: "https://images.unsplash.com/photo-1567016432779-094069958ea5?q=80&w=1200" },
            { key: "featured_2", label: "Carte 2 - Console", format: "Portrait", default: "https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?q=80&w=1200" },
            { key: "featured_3", label: "Carte 3 - Secrétaire", format: "Portrait", default: "https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?q=80&w=1200" },
            { key: "featured_4", label: "Carte 4 - Bibliothèque", format: "Portrait", default: "https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?q=80&w=1200" }
        ]
    },
    {
        section: "Équipe & Autres",
        description: "Images de la direction et autres sections",
        items: [
            { key: "team_main", label: "Portrait Direction", format: "Portrait (2:3)", default: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1600" },
            { key: "faq_main", label: "Image FAQ", format: "Carré (1:1)", default: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=1600" }
        ]
    }
];

const AdminHomepage = () => {
    const [images, setImages] = useState({});
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(null); // Key of the image currently uploading
    const [msg, setMsg] = useState('');

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const docRef = doc(db, 'sys_metadata', 'homepage_images');
                const snap = await getDoc(docRef);
                if (snap.exists()) {
                    setImages(snap.data());
                } else {
                    // Initialize with empty object, will fallback to defaults
                    setImages({});
                }
            } catch (error) {
                console.error("Error fetching homepage config:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchConfig();
    }, []);

    const handleFileChange = async (file, key) => {
        if (!file) return;

        setUploading(key);
        setMsg(`Traitement de ${file.name}...`);

        try {
            // 1. Compression Client
            setMsg('Compression WebP...');
            const compressedFile = await compressImage(file);

            // 2. Upload Storage
            setMsg('Upload vers Firebase...');
            const storagePath = `homepage/${key}_${Date.now()}.webp`;
            const storageRef = ref(storage, storagePath);
            await uploadBytes(storageRef, compressedFile);
            const downloadUrl = await getDownloadURL(storageRef);

            // 3. Update Firestore
            setMsg('Sauvegarde...');
            const docRef = doc(db, 'sys_metadata', 'homepage_images');
            await setDoc(docRef, { [key]: downloadUrl }, { merge: true });

            // 4. Update Local State
            setImages(prev => ({ ...prev, [key]: downloadUrl }));
            setMsg('');
        } catch (error) {
            console.error("Error uploading image:", error);
            setMsg('Erreur lors de l\'upload.');
            alert('Erreur: ' + error.message);
        } finally {
            setUploading(null);
        }
    };

    const handleDrop = (e, key) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileChange(e.dataTransfer.files[0], key);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDownload = async (url, filename) => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = filename || 'image';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error("Error downloading image:", error);
            alert("Erreur lors du téléchargement de l'image. Vérifiez votre connexion.");
        }
    };

    if (loading) return <div className="p-12 text-center animate-pulse text-stone-400">Chargement de la configuration...</div>;

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 pb-20">
            <div className="bg-stone-900 text-white p-8 rounded-[2.5rem] shadow-xl">
                <h2 className="text-3xl font-black tracking-tight mb-2">Page d'Accueil</h2>
                <p className="text-stone-400 font-medium">Gérez l'intégralité des visuels de la landing page. Glissez-déposez vos images pour les remplacer.</p>
                {msg && (
                    <div className="mt-4 bg-amber-500/10 text-amber-500 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest inline-block animate-pulse">
                        {msg}
                    </div>
                )}
            </div>

            <div className="space-y-16">
                {HOMEPAGE_CONFIG.map((section, idx) => (
                    <div key={idx} className="space-y-6">
                        <div className="px-4 border-l-4 border-stone-200 pl-4">
                            <h3 className="text-xl font-black text-stone-900 uppercase tracking-widest">{section.section}</h3>
                            <p className="text-xs text-stone-400 font-bold uppercase tracking-wider mt-1">{section.description}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {section.items.map((item) => {
                                const currentImage = images[item.key] || item.default;
                                const isUpdating = uploading === item.key;

                                return (
                                    <div
                                        key={item.key}
                                        className="bg-white p-4 rounded-3xl border border-stone-100 shadow-sm hover:shadow-md transition-all group relative"
                                        onDrop={(e) => handleDrop(e, item.key)}
                                        onDragOver={handleDragOver}
                                    >
                                        {/* HEADER INFO */}
                                        <div className="mb-4">
                                            <p className="font-bold text-stone-800 text-sm truncate" title={item.label}>{item.label}</p>
                                            <span className="text-[10px] uppercase font-bold text-stone-400 bg-stone-50 px-2 py-1 rounded-md inline-block mt-1">
                                                {item.format}
                                            </span>
                                        </div>

                                        {/* PREVIEW IMAGE */}
                                        <div className="aspect-square w-full bg-stone-100 rounded-2xl overflow-hidden relative mb-4 border border-stone-100">
                                            <img
                                                src={currentImage}
                                                alt={item.label}
                                                className={`w-full h-full object-cover transition-all duration-500 ${isUpdating ? 'opacity-50 blur-sm' : 'group-hover:scale-105'}`}
                                            />

                                            {/* LOADING OVERLAY */}
                                            {isUpdating && (
                                                <div className="absolute inset-0 flex items-center justify-center flex-col gap-2">
                                                    <Loader size={24} className="animate-spin text-stone-900" />
                                                    <span className="text-[9px] font-black uppercase text-stone-900">Upload...</span>
                                                </div>
                                            )}

                                            {/* HOVER OVERLAY (Drag Hint) */}
                                            {!isUpdating && (
                                                <div className="absolute inset-0 bg-stone-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                                    <div className="text-center text-white p-4">
                                                        <ImageIcon size={24} className="mx-auto mb-2" />
                                                        <p className="text-[10px] font-black uppercase tracking-widest">Glisser une image</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* ACTIONS */}
                                        <div className="flex gap-2">
                                            <label className={`flex-1 py-3 rounded-xl border-2 border-dashed border-stone-200 hover:border-stone-900 hover:bg-stone-50 cursor-pointer flex items-center justify-center gap-2 transition-all group/btn ${isUpdating ? 'opacity-50 pointer-events-none' : ''}`}>
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={(e) => handleFileChange(e.target.files[0], item.key)}
                                                    disabled={isUpdating}
                                                />
                                                <Upload size={14} className="text-stone-400 group-hover/btn:text-stone-900" />
                                                <span className="text-[10px] font-black uppercase text-stone-400 group-hover/btn:text-stone-900">Changer</span>
                                            </label>

                                            <button
                                                onClick={() => handleDownload(currentImage, `${item.key}.webp`)}
                                                className="w-10 flex items-center justify-center rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 transition-colors"
                                                title="Télécharger l'image"
                                            >
                                                <Download size={14} />
                                            </button>

                                            {/* RESET BUTTON (If changed) */}
                                            {images[item.key] && (
                                                <button
                                                    onClick={async () => {
                                                        if (!confirm('Revenir à l\'image par défaut ?')) return;
                                                        const newImages = { ...images };
                                                        delete newImages[item.key];
                                                        setImages(newImages);
                                                        // Firebase Update (delete key essentially)
                                                        const docRef = doc(db, 'sys_metadata', 'homepage_images');
                                                        // NOTE: Firestore update doesn't easily support deleting map fields without 'deleteField()', 
                                                        // but setting to null or undefined might work depending on config.
                                                        // For now, simpler to just set it back to default string explicitly if we wanted, 
                                                        // or just ignore it. Let's kept it simple: just remove from local state means it shows default, 
                                                        // but to persist we need to update DB.
                                                        // Actually, let's just re-set the default URL in DB.
                                                        await setDoc(docRef, { [item.key]: item.default }, { merge: true });
                                                    }}
                                                    className="w-10 flex items-center justify-center rounded-xl bg-stone-100 hover:bg-red-50 hover:text-red-500 transition-colors"
                                                    title="Rétablir défaut"
                                                >
                                                    <X size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminHomepage;
