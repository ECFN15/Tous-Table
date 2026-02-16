import React, { useState, useEffect, useRef } from 'react';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase/config';
import { Upload, X, Save, Image as ImageIcon, Loader, Info, Check, Download } from 'lucide-react';

import { compressImage } from '../../utils/imageUtils';
import AdminImageCard from './components/AdminImageCard';
import TextEditorModal from './components/TextEditorModal';
import ImageCropperModal from './components/ImageCropperModal';

// CONFIGURATION DES IMAGES DU HOMEPAGE
// Cette structure définit toutes les images modifiables ET les textes associés
const HOMEPAGE_CONFIG = [
    {
        section: "Manifesto",
        description: "Section d'introduction 'Héritage'",
        items: [
            {
                key: "manifesto_1",
                label: "Image 1 - Le Plateau",
                format: "Portrait (3:4)",
                default: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?q=80&w=1200",
                textSchema: [
                    { key: "title", label: "Titre (Utilisez <br/> pour un retour à la ligne)", type: "text", placeholder: "Le Plateau d'Antan" },
                    { key: "desc", label: "Description / Matières", type: "textarea", placeholder: "Chêne de pays — Finition à la cire d'abeille." }
                ]
            },
            {
                key: "manifesto_2",
                label: "Image 2 - La Console",
                format: "Portrait (4:5)",
                default: "https://images.unsplash.com/photo-1618220179428-22790b461013?q=80&w=1200",
                textSchema: [
                    { key: "title", label: "Titre (Utilisez <br/> pour un retour à la ligne)", type: "text", placeholder: "La Console Royale" },
                    { key: "desc", label: "Description / Apposition", type: "textarea", placeholder: "Noyer sculpté — XIXème siècle." }
                ]
            },
            {
                key: "manifesto_3",
                label: "Image 3 - La Renaissance",
                format: "Paysage (16:9)",
                default: "https://images.unsplash.com/photo-1567016432779-094069958ea5?q=80&w=1400",
                textSchema: [
                    { key: "title", label: "Titre (Utilisez <br/> pour un retour à la ligne)", type: "text", placeholder: "La Renaissance <br /> d'un Chef-d'œuvre" },
                    { key: "desc", label: "Paragraphe descriptif", type: "textarea", placeholder: "Après 400 heures de restauration méticuleuse..." },
                    { key: "btn", label: "Texte Bouton", type: "text", placeholder: "Découvrir la pièce" }
                ]
            }
        ]
    },
    {
        section: "Process (Étapes)",
        description: "Les 5 étapes du rituel de restauration",
        items: [
            {
                key: "process_1",
                label: "Étape I - L'Essence",
                format: "Paysage (16:9)",
                default: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?q=80&w=1400",
                textSchema: [
                    { key: "t", label: "Titre de l'étape", type: "text", placeholder: "L'Essence" },
                    { key: "d", label: "Description courte", type: "textarea", placeholder: "Sélection rigoureuse des billes de bois précieux." },
                    { key: "info", label: "Tag technique", type: "text", placeholder: "Matière première" }
                ]
            },
            {
                key: "process_2",
                label: "Étape II - L'Analyse",
                format: "Paysage (16:9)",
                default: "https://images.unsplash.com/photo-1644358686685-4ed525a59663?q=80&w=2000&auto=format&fit=crop",
                textSchema: [
                    { key: "t", label: "Titre de l'étape", type: "text", placeholder: "L'Analyse" },
                    { key: "d", label: "Description courte", type: "textarea", placeholder: "Diagnostic structurel et scan de la patine historique." },
                    { key: "info", label: "Tag technique", type: "text", placeholder: "Étude microscopique" }
                ]
            },
            {
                key: "process_3",
                label: "Étape III - Le Dessin",
                format: "Paysage (16:9)",
                default: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=2000&auto=format&fit=crop",
                textSchema: [
                    { key: "t", label: "Titre de l'étape", type: "text", placeholder: "Le Dessin" },
                    { key: "d", label: "Description courte", type: "textarea", placeholder: "Tracé géométrique pour les greffes complexes." },
                    { key: "info", label: "Tag technique", type: "text", placeholder: "Perspective d'art" }
                ]
            },
            {
                key: "process_4",
                label: "Étape IV - La Cure",
                format: "Paysage (16:9)",
                default: "https://images.unsplash.com/photo-1600585152220-90363fe7e115?q=80&w=1400",
                textSchema: [
                    { key: "t", label: "Titre de l'étape", type: "text", placeholder: "La Cure" },
                    { key: "d", label: "Description courte", type: "textarea", placeholder: "Greffes invisibles et consolidation structurelle." },
                    { key: "info", label: "Tag technique", type: "text", placeholder: "Renaissance physique" }
                ]
            },
            {
                key: "process_5",
                label: "Étape V - L'Éclat",
                format: "Paysage (16:9)",
                default: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=1400",
                textSchema: [
                    { key: "t", label: "Titre de l'étape", type: "text", placeholder: "L'Éclat" },
                    { key: "d", label: "Description courte", type: "textarea", placeholder: "Secret du vernis au tampon selon la tradition normande." },
                    { key: "info", label: "Tag technique", type: "text", placeholder: "Miroir de bois" }
                ]
            }
        ]
    },
    {
        section: "En Vedette (Cartes)",
        description: "Les 4 cartes empilées (Stacked Cards)",
        items: [
            // CARTE 1
            {
                key: "featured_1",
                label: "Carte 1 - Voltaire (PC)",
                format: "Paysage Panoramique (3:1)",
                default: "https://images.unsplash.com/photo-1567016432779-094069958ea5?q=80&w=1200",
                textSchema: [
                    { key: "subtitle", label: "Badge (Texte dans la pillule)", type: "text", placeholder: "Exposition Temporaire" },
                    { key: "title_1", label: "Titre Principal", type: "text", placeholder: "Le Voltaire" },
                    { key: "title_2", label: "Sous-titre (Italique)", type: "text", placeholder: "Signature" },
                    { key: "show_title_2", label: "Afficher le sous-titre ?", type: "toggle" },
                    { key: "desc", label: "Description (Style Museum - Majuscules automatiques)", type: "textarea", placeholder: "Une renaissance historique pour l'époque contemporaine." }
                ]
            },
            {
                key: "featured_1_mobile",
                label: "Carte 1 - Voltaire (Mobile)",
                format: "Portrait (4:5)",
                default: "https://images.unsplash.com/photo-1567016432779-094069958ea5?q=80&w=800",
                isVariant: true
            },
            // CARTE 2
            {
                key: "featured_2",
                label: "Carte 2 - Console (PC)",
                format: "Paysage Panoramique (3:1)",
                default: "https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?q=80&w=1200",
                textSchema: [
                    { key: "subtitle", label: "Badge (Texte dans la pillule)", type: "text", placeholder: "Collection Permanente" },
                    { key: "title_1", label: "Titre Principal", type: "text", placeholder: "Console" },
                    { key: "title_2", label: "Sous-titre (Italique)", type: "text", placeholder: "Héritage" },
                    { key: "show_title_2", label: "Afficher le sous-titre ?", type: "toggle" },
                    { key: "desc", label: "Description (Style Museum - Majuscules automatiques)", type: "textarea", placeholder: "Formes épurées et assemblage traditionnel." }
                ]
            },
            {
                key: "featured_2_mobile",
                label: "Carte 2 - Console (Mobile)",
                format: "Portrait (4:5)",
                default: "https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?q=80&w=800",
                isVariant: true
            },
            // CARTE 3
            {
                key: "featured_3",
                label: "Carte 3 - Secrétaire (PC)",
                format: "Paysage Panoramique (3:1)",
                default: "https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?q=80&w=1200",
                textSchema: [
                    { key: "subtitle", label: "Badge (Texte dans la pillule)", type: "text", placeholder: "Pièce Unique" },
                    { key: "title_1", label: "Titre Principal", type: "text", placeholder: "Le Secrétaire" },
                    { key: "title_2", label: "Sous-titre (Italique)", type: "text", placeholder: "Secret" },
                    { key: "show_title_2", label: "Afficher le sous-titre ?", type: "toggle" },
                    { key: "desc", label: "Description (Style Museum - Majuscules automatiques)", type: "textarea", placeholder: "Bois de rose et marqueterie complexe." }
                ]
            },
            {
                key: "featured_3_mobile",
                label: "Carte 3 - Secrétaire (Mobile)",
                format: "Portrait (4:5)",
                default: "https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?q=80&w=800",
                isVariant: true
            },
            // CARTE 4
            {
                key: "featured_4",
                label: "Carte 4 - Bibliothèque (PC)",
                format: "Paysage Panoramique (3:1)",
                default: "https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?q=80&w=1200",
                textSchema: [
                    { key: "subtitle", label: "Badge (Texte dans la pillule)", type: "text", placeholder: "Nouvelle Acquisition" },
                    { key: "title_1", label: "Titre Principal", type: "text", placeholder: "Bibliothèque" },
                    { key: "title_2", label: "Sous-titre (Italique)", type: "text", placeholder: "Céleste" },
                    { key: "show_title_2", label: "Afficher le sous-titre ?", type: "toggle" },
                    { key: "desc", label: "Description (Style Museum - Majuscules automatiques)", type: "textarea", placeholder: "Chêne massif et échelles en laiton." }
                ]
            },
            {
                key: "featured_4_mobile",
                label: "Carte 4 - Bibliothèque (Mobile)",
                format: "Portrait (4:5)",
                default: "https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?q=80&w=800",
                isVariant: true
            }
        ]
    },
    {
        section: "Textes & Chiffres Clés",
        description: "Bandeau défilant et statistiques (Section 12)",
        items: [
            {
                key: "ticker",
                label: "Bandeau Défilant",
                format: "Texte seul",
                default: null,
                isTextOnly: true,
                textSchema: [
                    { key: "text_left", label: "Texte Gauche", type: "text", placeholder: "Patrimoine Durable" },
                    { key: "text_right", label: "Texte Droite", type: "text", placeholder: "L'Excellence du geste" }
                ]
            },
            {
                key: "stat_1",
                label: "Mesure 01",
                format: "Statistique",
                default: null,
                isTextOnly: true,
                textSchema: [
                    { key: "value", label: "Chiffre", type: "text", placeholder: "25" },
                    { key: "suffix", label: "Suffixe", type: "text", placeholder: "+" },
                    { key: "label", label: "Label", type: "text", placeholder: "Années d'excellence" }
                ]
            },
            {
                key: "stat_2",
                label: "Mesure 02",
                format: "Statistique",
                default: null,
                isTextOnly: true,
                textSchema: [
                    { key: "value", label: "Chiffre", type: "text", placeholder: "400" },
                    { key: "suffix", label: "Suffixe", type: "text", placeholder: "h" },
                    { key: "label", label: "Label", type: "text", placeholder: "Heures par projet" }
                ]
            },
            {
                key: "stat_3",
                label: "Mesure 03",
                format: "Statistique",
                default: null,
                isTextOnly: true,
                textSchema: [
                    { key: "value", label: "Chiffre", type: "text", placeholder: "1500" },
                    { key: "suffix", label: "Suffixe", type: "text", placeholder: "" },
                    { key: "label", label: "Label", type: "text", placeholder: "Outils traditionnels" }
                ]
            },
            {
                key: "stat_4",
                label: "Mesure 04",
                format: "Statistique",
                default: null,
                isTextOnly: true,
                textSchema: [
                    { key: "value", label: "Chiffre", type: "text", placeholder: "85" },
                    { key: "suffix", label: "Suffixe", type: "text", placeholder: "+" },
                    { key: "label", label: "Label", type: "text", placeholder: "Patrimoines sauvés" }
                ]
            }
        ]
    },
    {
        section: "Équipe & Autres",
        description: "Images de la direction et autres sections",
        items: [
            {
                key: "team_main",
                label: "Portrait Direction",
                format: "Portrait (2:3)",
                default: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1600",
                textSchema: [
                    { key: "name_line1", label: "Prénom", type: "text", placeholder: "Jean" },
                    { key: "name_line2", label: "Nom", type: "text", placeholder: "Lefebvre" },
                    { key: "quote", label: "Citation", type: "textarea", placeholder: "\"Nous ne luttons pas contre le temps...\"" },
                    { key: "exp_years", label: "Années Expérience (chiffres romains)", type: "text", placeholder: "XXV Ans" }
                ]
            },
            {
                key: "faq_main",
                label: "Image FAQ & Questions",
                format: "Paysage (16:9)",
                default: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=1600",
                textSchema: [
                    { key: "q1", label: "Question 1", type: "text", placeholder: "Comment se déroule la restauration..." },
                    { key: "a1", label: "Réponse 1", type: "textarea", placeholder: "Chaque projet commence par..." },
                    { key: "q2", label: "Question 2", type: "text", placeholder: "Puis-je personnaliser..." },
                    { key: "a2", label: "Réponse 2", type: "textarea", placeholder: "Absolument. Bien que..." },
                    { key: "q3", label: "Question 3", type: "text", placeholder: "Utilisez-vous des produits écologiques ?" },
                    { key: "a3", label: "Réponse 3", type: "textarea", placeholder: "Oui, nous privilégions..." },
                    { key: "q4", label: "Question 4", type: "text", placeholder: "Quels sont les délais moyens ?" },
                    { key: "a4", label: "Réponse 4", type: "textarea", placeholder: "Cela dépend de la complexité..." },
                    { key: "q5", label: "Question 5", type: "text", placeholder: "Livrez-vous à l'international ?" },
                    { key: "a5", label: "Réponse 5", type: "textarea", placeholder: "Oui, nous organisons l'expédition..." }
                ]
            }
        ]
    }
];

const AdminHomepage = ({ darkMode = false }) => {
    const [images, setImages] = useState({});
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(null);
    const [msg, setMsg] = useState('');

    // Modal Text Edit State
    const [editingTextItem, setEditingTextItem] = useState(null); // { key: 'manifesto_1', schema: [...] }
    const [isTextModalOpen, setIsTextModalOpen] = useState(false);

    // [NEW] Cropper State
    const [cropperConfig, setCropperConfig] = useState({ isOpen: false, image: null, key: null, aspect: 1, originalSize: 0 });
    const [lastOptimization, setLastOptimization] = useState(null); // { original, compressed }

    const formatBytes = (bytes) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const parseAspect = (formatStr) => {
        if (!formatStr) return 1;
        const match = formatStr.match(/\(([\d.]+):([\d.]+)\)/);
        if (match) return parseFloat(match[1]) / parseFloat(match[2]);
        if (formatStr.toLowerCase().includes('portrait')) return 3 / 4;
        if (formatStr.toLowerCase().includes('paysage')) return 16 / 9;
        return 1;
    };

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const docRef = doc(db, 'sys_metadata', 'homepage_images');
                const snap = await getDoc(docRef);
                if (snap.exists()) {
                    setImages(snap.data());
                } else {
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

        // Find aspect ratio from config
        let aspect = 1;
        HOMEPAGE_CONFIG.some(section => {
            const item = section.items.find(i => i.key === key);
            if (item) {
                aspect = parseAspect(item.format);
                return true;
            }
            return false;
        });

        const reader = new FileReader();
        reader.onload = () => {
            setCropperConfig({
                isOpen: true,
                image: reader.result,
                key: key,
                aspect: aspect,
                originalSize: file.size // Capture original size
            });
        };
        reader.readAsDataURL(file);
    };

    const handleCropComplete = async (croppedBlob) => {
        const key = cropperConfig.key;
        if (!key) return;

        setUploading(key);
        setMsg(`⏳ Optimisation WebP...`);

        try {
            const fileName = `cropped_${key}.webp`;
            const fileToUpload = new File([croppedBlob], fileName, { type: 'image/webp' });

            setMsg('⏳ Envoi vers le serveur...');
            // Standardized storage path for homepage
            const storagePath = `homepage/${key}_tat_${Date.now()}.webp`;
            const storageRef = ref(storage, storagePath);

            await uploadBytes(storageRef, fileToUpload, {
                cacheControl: 'public, max-age=31536000',
                contentType: 'image/webp'
            });

            const downloadUrl = await getDownloadURL(storageRef);

            setMsg('⏳ Finalisation...');
            const docRef = doc(db, 'sys_metadata', 'homepage_images');
            await setDoc(docRef, { [key]: downloadUrl }, { merge: true });

            setImages(prev => ({ ...prev, [key]: downloadUrl }));

            // Record optimization metrics
            setLastOptimization({
                original: cropperConfig.originalSize,
                compressed: fileToUpload.size,
                key: key
            });

            setMsg('✅ Mise à jour réussie !');
            setTimeout(() => setMsg(''), 5000);
        } catch (error) {
            console.error("Critical Upload Error:", error);
            setMsg(`❌ Erreur: ${error.message}`);
        } finally {
            setUploading(null);
            setCropperConfig(prev => ({ ...prev, isOpen: false, image: null }));
        }
    };

    const handleReset = async (item) => {
        if (!confirm('Revenir à l\'image par défaut ?')) return;
        const newImages = { ...images };
        delete newImages[item.key];
        setImages(newImages);
        const docRef = doc(db, 'sys_metadata', 'homepage_images');
        await setDoc(docRef, { [item.key]: item.default }, { merge: true });
    };

    const handleDownload = async (url, filename) => {
        try {
            const response = await fetch(url, { mode: 'cors' });
            if (!response.ok) throw new Error('Network response was not ok');
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
            console.warn("Download failed (likely CORS), falling back to new tab:", error);
            window.open(url, '_blank');
        }
    };

    // --- TEXT EDITING HANDLERS ---
    const handleEditText = (item) => {
        if (!item.textSchema || item.textSchema.length === 0) return;
        setEditingTextItem(item);
        setIsTextModalOpen(true);
    };

    const handleSaveText = async (key, formData) => {
        try {
            setMsg('Sauvegarde Texte...');
            const docRef = doc(db, 'sys_metadata', 'homepage_images');

            // On sauvegarde sous la clé "key_text"
            const textKey = `${key}_text`;
            await setDoc(docRef, { [textKey]: formData }, { merge: true });

            // Mise à jour locale
            setImages(prev => ({ ...prev, [textKey]: formData }));

            setIsTextModalOpen(false);
            setEditingTextItem(null);
            setMsg('Sauvegardé !');
            setTimeout(() => setMsg(''), 2000);
        } catch (error) {
            console.error("Erreur save text:", error);
            alert("Erreur: " + error.message);
        }
    };

    if (loading) return <div className="p-12 text-center animate-pulse text-stone-400">Chargement de la configuration...</div>;

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 pb-20">
            <div className={`p-8 rounded-[2.5rem] shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 will-change-transform ${darkMode ? 'bg-stone-900 text-white' : 'bg-white ring-1 ring-stone-100 text-stone-900 shadow-sm'}`}>
                <div>
                    <h2 className="text-3xl font-black tracking-tight mb-2">Page d'Accueil</h2>
                    <p className={`${darkMode ? 'text-stone-400' : 'text-stone-500'} font-medium`}>Gérez les visuels de la landing page. Vos photos sont automatiquement optimisées en WebP.</p>
                </div>

                {/* [NEW] Optimization Metrics Display */}
                {lastOptimization && (
                    <div className={`flex items-center gap-4 px-5 py-3 rounded-2xl animate-in fade-in slide-in-from-right-4 shadow-inner ${darkMode ? 'bg-stone-800/50 border border-emerald-900/30' : 'bg-emerald-50 border border-emerald-100'}`}>
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black uppercase text-emerald-500 tracking-wider">Diagnostic Poids</span>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className={`text-[10px] font-mono ${darkMode ? 'text-stone-500' : 'text-stone-400'}`}>{formatBytes(lastOptimization.original)} →</span>
                                <span className="text-xs font-black text-emerald-500">{formatBytes(lastOptimization.compressed)}</span>
                                <span className="ml-1 bg-emerald-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-md">-{((1 - lastOptimization.compressed / lastOptimization.original) * 100).toFixed(0)}%</span>
                            </div>
                        </div>
                        <button onClick={() => setLastOptimization(null)} className="text-stone-400 hover:text-emerald-500 transition-colors">
                            <X size={16} />
                        </button>
                    </div>
                )}

                {msg && (
                    <div className="bg-amber-500/10 text-amber-500 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest inline-block animate-pulse">
                        {msg}
                    </div>
                )}
            </div>

            <div className="space-y-16">
                {HOMEPAGE_CONFIG.map((section, idx) => (
                    <div key={idx} className="space-y-6">
                        <div className={`px-4 border-l-4 pl-4 ${darkMode ? 'border-stone-700' : 'border-stone-200'}`}>
                            <h3 className={`text-xl font-black uppercase tracking-widest ${darkMode ? 'text-white' : 'text-stone-900'}`}>{section.section}</h3>
                            <p className="text-xs text-stone-400 font-bold uppercase tracking-wider mt-1">{section.description}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {section.items.map((item) => {
                                const currentImage = images[item.key] || item.default;
                                const isUpdating = uploading === item.key;
                                const hasCustomImage = !!images[item.key];
                                const hasTextSchema = item.textSchema && item.textSchema.length > 0;

                                return (
                                    <AdminImageCard
                                        key={item.key}
                                        item={item}
                                        currentImage={currentImage}
                                        isUpdating={isUpdating}
                                        darkMode={darkMode}
                                        onFileSelect={(file) => handleFileChange(file, item.key)}
                                        onDownload={() => handleDownload(currentImage, `${item.key}.webp`)}
                                        onReset={() => handleReset(item)}
                                        hasCustomImage={hasCustomImage}
                                        hasTextSchema={hasTextSchema}
                                        onEditText={() => handleEditText(item)}
                                    />
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            <TextEditorModal
                isOpen={isTextModalOpen}
                onClose={() => setIsTextModalOpen(false)}
                onSave={handleSaveText}
                itemKey={editingTextItem?.key}
                fields={editingTextItem?.textSchema || []}
                initialData={images[`${editingTextItem?.key}_text`] || {}}
                darkMode={darkMode}
            />

            <ImageCropperModal
                isOpen={cropperConfig.isOpen}
                image={cropperConfig.image}
                aspect={cropperConfig.aspect}
                onClose={() => setCropperConfig(prev => ({ ...prev, isOpen: false }))}
                onCropComplete={handleCropComplete}
                darkMode={darkMode}
            />
        </div>
    );
};

export default AdminHomepage;
