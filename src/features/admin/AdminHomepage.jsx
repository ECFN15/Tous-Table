import React, { useState, useEffect, useRef } from 'react';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase/config';
import { Upload, X, Save, Image as ImageIcon, Loader, Info, Check, Download } from 'lucide-react';

import { compressImage } from '../../utils/imageUtils';
import AdminImageCard from './components/AdminImageCard';
import TextEditorModal from './components/TextEditorModal';

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
                    { key: "title", label: "Titre Principal", type: "text", placeholder: "Le Plateau d'Antan" },
                    { key: "desc", label: "Description / Matières", type: "textarea", placeholder: "Chêne de pays — Finition à la cire d'abeille." }
                ]
            },
            {
                key: "manifesto_2",
                label: "Image 2 - La Console",
                format: "Portrait (4:5)",
                default: "https://images.unsplash.com/photo-1618220179428-22790b461013?q=80&w=1200",
                textSchema: [
                    { key: "title", label: "Titre Principal", type: "text", placeholder: "La Console Royale" },
                    { key: "desc", label: "Description / Apposition", type: "textarea", placeholder: "Noyer sculpté — XIXème siècle." }
                ]
            },
            {
                key: "manifesto_3",
                label: "Image 3 - La Renaissance",
                format: "Paysage (16:9)",
                default: "https://images.unsplash.com/photo-1567016432779-094069958ea5?q=80&w=1400",
                textSchema: [
                    { key: "title", label: "Titre (Avec saut de ligne <br/>)", type: "text", placeholder: "La Renaissance <br /> d'un Chef-d'œuvre" },
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
                format: "Portrait/Paysage",
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
                format: "Portrait/Paysage",
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
                format: "Portrait/Paysage",
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
                format: "Portrait/Paysage",
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
                format: "Portrait/Paysage",
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
            {
                key: "featured_1",
                label: "Carte 1 - Voltaire",
                format: "Portrait",
                default: "https://images.unsplash.com/photo-1567016432779-094069958ea5?q=80&w=1200",
                textSchema: [
                    { key: "subtitle", label: "Badge (Pillule)", type: "text", placeholder: "Exposition Temporaire" },
                    { key: "title_1", label: "Titre Ligne 1", type: "text", placeholder: "Le Voltaire" },
                    { key: "title_2", label: "Titre Ligne 2 (Italique)", type: "text", placeholder: "Signature" },
                    { key: "desc", label: "Citation / Description", type: "textarea", placeholder: "\"Une renaissance historique pour l'époque contemporaine.\"" }
                ]
            },
            {
                key: "featured_2",
                label: "Carte 2 - Console",
                format: "Portrait",
                default: "https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?q=80&w=1200",
                textSchema: [
                    { key: "subtitle", label: "Badge (Pillule)", type: "text", placeholder: "Collection Permanente" },
                    { key: "title_1", label: "Titre Ligne 1", type: "text", placeholder: "Console" },
                    { key: "title_2", label: "Titre Ligne 2 (Italique)", type: "text", placeholder: "Héritage" },
                    { key: "desc", label: "Citation / Description", type: "textarea", placeholder: "\"Formes épurées et assemblage traditionnel...\"" }
                ]
            },
            {
                key: "featured_3",
                label: "Carte 3 - Secrétaire",
                format: "Portrait",
                default: "https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?q=80&w=1200",
                textSchema: [
                    { key: "subtitle", label: "Badge (Pillule)", type: "text", placeholder: "Pièce Unique" },
                    { key: "title_1", label: "Titre Ligne 1", type: "text", placeholder: "Le Secrétaire" },
                    { key: "title_2", label: "Titre Ligne 2 (Italique)", type: "text", placeholder: "Secret" },
                    { key: "desc", label: "Citation / Description", type: "textarea", placeholder: "\"Bois de rose et marqueterie complexe...\"" }
                ]
            },
            {
                key: "featured_4",
                label: "Carte 4 - Bibliothèque",
                format: "Portrait",
                default: "https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?q=80&w=1200",
                textSchema: [
                    { key: "subtitle", label: "Badge (Pillule)", type: "text", placeholder: "Nouvelle Acquisition" },
                    { key: "title_1", label: "Titre Ligne 1", type: "text", placeholder: "Bibliothèque" },
                    { key: "title_2", label: "Titre Ligne 2 (Italique)", type: "text", placeholder: "Céleste" },
                    { key: "desc", label: "Citation / Description", type: "textarea", placeholder: "\"Chêne massif et échelles en laiton...\"" }
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
                format: "Carré (1:1)",
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

        setUploading(key);
        setMsg(`Traitement de ${file.name}...`);

        try {
            setMsg('Compression WebP...');
            const compressedFile = await compressImage(file);

            setMsg('Upload vers Firebase...');
            const storagePath = `homepage/${key}_${Date.now()}.webp`;
            const storageRef = ref(storage, storagePath);
            await uploadBytes(storageRef, compressedFile, { cacheControl: 'public, max-age=31536000' });
            const downloadUrl = await getDownloadURL(storageRef);

            setMsg('Sauvegarde...');
            const docRef = doc(db, 'sys_metadata', 'homepage_images');
            await setDoc(docRef, { [key]: downloadUrl }, { merge: true });

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
        </div>
    );
};

export default AdminHomepage;
