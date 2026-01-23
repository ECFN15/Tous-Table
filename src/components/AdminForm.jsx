import React, { useState, useEffect, useRef } from 'react';
import { Upload, Trash2, Download } from 'lucide-react';
import { doc, addDoc, updateDoc, collection, serverTimestamp, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, appId } from '../firebase/config';
import { getMillis } from '../utils/time';
import { compressImage } from '../utils/imageUtils'; // [NEW] Import compression utility

const WOOD_TYPES = [
  "Acacia", "Acajou", "Bambou", "Bouleau", "Châtaignier",
  "Chêne", "Ébène", "Épicéa", "Érable", "Frêne", "Hêtre",
  "Iroko", "Manguier", "Mélèze", "Merisier", "Noyer",
  "Olivier", "Orme", "Palissandre", "Pin", "Peuplier",
  "Rotin", "Sapin", "Teck", "Wengé", "Autre"
];

const AdminForm = ({ editData, onCancelEdit, collectionName = 'furniture' }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startingPrice: 0,
    material: '',
    dimensions: '',
    width: '',
    depth: '',
    height: '',
    auctionActive: false,
    durationMinutes: 0
  });

  // Unified state for images
  const [galleryItems, setGalleryItems] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState("");
  const fileInputRef = useRef();

  // New state for drag reordering
  const [isDragging, setIsDragging] = useState(false);
  const [draggedItemIndex, setDraggedItemIndex] = useState(null);

  // New state for custom material input
  const [isCustomMaterial, setIsCustomMaterial] = useState(false);

  // [NEW] Metrics
  const totalOriginalSize = galleryItems.reduce((acc, item) => acc + (item.originalSize || (item.file ? item.file.size : 0)), 0);
  const [totalCompressedSize, setTotalCompressedSize] = useState(0);

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  useEffect(() => {
    if (editData) {
      const duration = editData.auctionEnd ? Math.round((getMillis(editData.auctionEnd) - Date.now()) / 60000) : 0;

      const material = editData.material || '';
      const isCustom = material && !WOOD_TYPES.includes(material) && material !== "Autre";
      setIsCustomMaterial(isCustom);

      setFormData({
        name: editData.name || '',
        description: editData.description || '',
        startingPrice: editData.startingPrice || 0,
        material: material,
        dimensions: editData.dimensions || '',
        width: editData.width || '',
        depth: editData.depth || '',
        height: editData.height || '',
        auctionActive: editData.auctionActive || false,
        durationMinutes: duration > 0 ? duration : 0
      });

      const initialImages = editData.images || (editData.imageUrl ? [editData.imageUrl] : []);
      setGalleryItems(initialImages.map((url, idx) => ({
        id: `existing-${idx}-${Date.now()}`,
        file: null,
        preview: url,
        isExisting: true
      })));
    } else { resetForm(); }
  }, [editData]);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      startingPrice: 0,
      material: '',
      dimensions: '',
      width: '',
      depth: '',
      height: '',
      auctionActive: false,
      durationMinutes: 0
    });
    setGalleryItems([]);
    setIsCustomMaterial(false);
    setTotalCompressedSize(0);
  };

  const processFiles = (files) => {
    const newItems = files.map(file => ({
      id: `new-${Date.now()}-${Math.random()}`,
      file: file,
      preview: URL.createObjectURL(file),
      originalSize: file.size, // Store original size for metrics
      isExisting: false,
      isCompressed: false
    }));
    setGalleryItems(prev => [...prev, ...newItems]);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) processFiles(files);
  };

  const handleOptimizeImages = async (e) => {
    e.preventDefault(); // Prevent form submission if button is inside form
    setMsg("⏳ Optimisation en cours...");
    let newItems = [...galleryItems];
    let newTotalSize = 0;
    let anyCompressed = false;

    for (let i = 0; i < newItems.length; i++) {
      if (newItems[i].file && !newItems[i].isCompressed) {
        try {
          const compressed = await compressImage(newItems[i].file);
          newItems[i].file = compressed;
          newItems[i].isCompressed = true;
          // Keep the preview as is, or update if we wanted to show webp specifically
          newTotalSize += compressed.size;
          anyCompressed = true;
        } catch (error) {
          console.error("Compression failed for", newItems[i].file.name, error);
          newTotalSize += newItems[i].file.size; // Fallback
        }
      } else if (newItems[i].file) {
        newTotalSize += newItems[i].file.size;
      }
    }

    setGalleryItems(newItems);
    setTotalCompressedSize(newTotalSize);
    if (anyCompressed) setMsg("✅ Images optimisées !");
  };

  const handleDownloadImages = (e) => {
    e.preventDefault();
    let count = 0;
    galleryItems.forEach((item, index) => {
      if (item.file && item.isCompressed) {
        setTimeout(() => {
          const url = URL.createObjectURL(item.file);
          const a = document.createElement('a');
          a.href = url;
          a.download = item.file.name;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setTimeout(() => URL.revokeObjectURL(url), 100);
        }, count * 500); // 500ms delay between each
        count++;
      }
    });
    setMsg(`✅ Téléchargement de ${count} images lancé !`);
  };

  const addMeuble = async () => {
    if (!formData.name) { setMsg("⚠️ Nom requis"); return; }
    setUploading(true); setMsg("⏳ Optimisation & Envoi..."); // Updated message
    try {
      let finalImageUrls = [];

      let accumulatedCompressedSize = 0;
      for (const item of galleryItems) {
        if (item.isExisting) {
          finalImageUrls.push(item.preview);
        } else if (item.file) {
          let fileToUpload = item.file;
          const originalSizeStr = formatBytes(item.originalSize || item.file.size);

          if (!item.isCompressed) {
            // Auto-compress if not done manually
            setMsg(`⏳ Compression: ${item.file.name} (${originalSizeStr})...`);
            fileToUpload = await compressImage(item.file);
          }

          const sizeStr = formatBytes(fileToUpload.size);
          setMsg(`⏳ Upload: ${fileToUpload.name} (${originalSizeStr} -> ${sizeStr})...`);

          const imageRef = ref(storage, `${collectionName}/${Date.now()}_${fileToUpload.name}`);
          await uploadBytes(imageRef, fileToUpload);
          finalImageUrls.push(await getDownloadURL(imageRef));

          if (!item.isCompressed) {
            accumulatedCompressedSize += fileToUpload.size;
            setTotalCompressedSize(accumulatedCompressedSize);
          }
        }
      }

      const data = {
        ...formData,
        images: finalImageUrls,
        imageUrl: finalImageUrls[0] || "",
        currentPrice: Number(formData.startingPrice),
        startingPrice: Number(formData.startingPrice),
        durationMinutes: Number(formData.durationMinutes),
        auctionEnd: formData.auctionActive ? Timestamp.fromMillis(Date.now() + (Number(formData.durationMinutes) * 60000)) : null,
      };
      if (editData) {
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', collectionName, editData.id), data);
        onCancelEdit();
      } else {
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', collectionName), { ...data, status: 'published', bidCount: 0, createdAt: serverTimestamp() });
      }
      setMsg("✅ Succès !"); resetForm();
    } catch (err) {
      console.error("FULL ERROR:", err);
      // Try to identify if it is storage or firestore
      let errorPrefix = "Erreur incomprise";
      if (err.message.includes("storage")) errorPrefix = "Erreur Stockage (Images)";
      else if (err.code === "permission-denied") errorPrefix = "Erreur Permissions (Règles Firebase non mises à jour ?)";

      setMsg(`❌ ${errorPrefix}: ${err.message}`);
    } finally { setUploading(false); setTimeout(() => setMsg(""), 5000); }
  };

  // Drag handlers
  const handleDragEnter = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
  const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); };
  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false);
    const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
    if (files.length > 0) processFiles(files);
  };

  const onDragStartItem = (e, index) => {
    setDraggedItemIndex(index);
  };
  const onDragOverItem = (e, index) => {
    e.preventDefault();
  };
  const onDropItem = (e, dropIndex) => {
    e.preventDefault();
    if (draggedItemIndex === null || draggedItemIndex === dropIndex) return;
    const newItems = [...galleryItems];
    const [draggedItem] = newItems.splice(draggedItemIndex, 1);
    newItems.splice(dropIndex, 0, draggedItem);
    setGalleryItems(newItems);
    setDraggedItemIndex(null);
  };

  return (
    <div className="p-5 md:p-12 bg-white rounded-3xl md:rounded-[3rem] border border-stone-200/60 shadow-2xl space-y-10 animate-in slide-in-from-top-4 text-stone-900">
      <div className="flex justify-between items-center border-b border-stone-100 pb-6 text-stone-900">
        <p className="text-xs font-black uppercase tracking-widest text-stone-900">{editData ? 'Modification en cours' : 'Nouvelle création'}</p>
        {editData && <button onClick={onCancelEdit} className="text-[10px] font-black text-red-500 uppercase hover:text-red-700 transition-colors">Annuler</button>}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 text-stone-900">
        <div className="lg:col-span-4 space-y-4">
          {/* ... (keep image upload section) */}
          <div
            className={`grid grid-cols-2 gap-3 text-stone-900 p-4 rounded-3xl transition-all border-2 border-dashed ${isDragging ? 'border-amber-500 bg-amber-50/50 scale-[1.02]' : 'border-transparent'}`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {galleryItems.map((item, idx) => (
              <div
                key={item.id}
                draggable
                onDragStart={(e) => onDragStartItem(e, idx)}
                onDragOver={(e) => onDragOverItem(e, idx)}
                onDrop={(e) => onDropItem(e, idx)}
                className={`aspect-square rounded-2xl overflow-hidden relative group shadow-md border text-stone-900 cursor-move transition-all ${draggedItemIndex === idx ? 'opacity-50 scale-95 border-amber-500' : 'border-stone-50 hover:scale-[1.02]'}`}
              >
                <img src={item.preview} className="w-full h-full object-cover text-stone-900 pointer-events-none" alt="" />
                <button onClick={(e) => { e.stopPropagation(); setGalleryItems(items => items.filter((_, i) => i !== idx)); }} className="absolute inset-0 bg-red-500/80 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300 text-white text-white"><Trash2 size={20} /></button>
                <div className="absolute top-2 left-2 bg-black/50 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">{idx + 1}</div>
              </div>
            ))}
            <button onClick={() => !uploading && fileInputRef.current.click()} className="aspect-square rounded-2xl bg-stone-50 border-2 border-dashed border-stone-200 flex flex-col items-center justify-center hover:bg-stone-100 hover:border-stone-300 transition-all text-stone-300"><Upload size={20} /></button>
          </div>
          <input type="file" id="fileInput" ref={fileInputRef} className="hidden" accept="image/*" multiple onChange={handleImageChange} />
        </div>
        <div className="lg:col-span-8 space-y-6 text-stone-900">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-stone-900">
            <div className="space-y-1.5 text-stone-900">
              <label className="text-[9px] font-black uppercase text-stone-400 ml-2">Nom de l'ouvrage</label>
              <input placeholder="Table de monastère..." className="w-full p-4 rounded-xl bg-stone-50 border-none font-bold outline-none focus:ring-4 ring-stone-100 transition-all shadow-inner text-stone-900 text-stone-900" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div className="space-y-1.5 text-stone-900">
              <label className="text-[9px] font-black uppercase text-stone-400 ml-2">Prix de départ (€)</label>
              <input type="number" placeholder="0" className="w-full p-4 rounded-xl bg-stone-50 border-none font-bold outline-none focus:ring-4 ring-stone-100 transition-all shadow-inner text-stone-900 text-stone-900" value={formData.startingPrice === 0 ? "" : formData.startingPrice} onChange={e => setFormData({ ...formData, startingPrice: e.target.value === "" ? 0 : Number(e.target.value) })} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-stone-900">
            <div className="space-y-1.5 text-stone-900">
              <label className="text-[9px] font-black uppercase text-stone-400 ml-2">Essence de bois</label>
              <div className="relative space-y-2">
                <div className="relative">
                  <select
                    className="w-full p-4 rounded-xl bg-stone-50 border-none font-bold outline-none text-sm focus:ring-4 ring-stone-100 transition-all shadow-inner text-stone-900 appearance-none cursor-pointer"
                    value={isCustomMaterial ? "Autre" : formData.material}
                    onChange={e => {
                      const val = e.target.value;
                      if (val === "Autre") {
                        setIsCustomMaterial(true);
                        setFormData({ ...formData, material: "" });
                      } else {
                        setIsCustomMaterial(false);
                        setFormData({ ...formData, material: val });
                      }
                    }}
                  >
                    <option value="" disabled>Sélectionner...</option>
                    {WOOD_TYPES.map(wood => (
                      <option key={wood} value={wood}>{wood}</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                  </div>
                </div>
                {isCustomMaterial && (
                  <input
                    autoFocus
                    placeholder="Précisez l'essence de bois..."
                    className="w-full p-4 rounded-xl bg-amber-50 border border-amber-200/50 font-bold outline-none text-sm focus:ring-4 ring-amber-100 transition-all shadow-inner text-stone-900 animate-in slide-in-from-top-2"
                    value={formData.material}
                    onChange={e => setFormData({ ...formData, material: e.target.value })}
                  />
                )}
              </div>
            </div>
            <div className="space-y-1.5 text-stone-900">
              <label className="text-[9px] font-black uppercase text-stone-400 ml-2">Dimensions (L x P x H cm)</label>
              <div className="grid grid-cols-3 gap-2 text-stone-900">
                <input type="number" placeholder="L" className="w-full p-4 rounded-xl bg-stone-50 border-none font-bold outline-none text-xs text-center focus:ring-4 ring-stone-100 text-stone-900 text-stone-900" value={formData.width} onChange={e => setFormData({ ...formData, width: e.target.value })} />
                <input type="number" placeholder="P" className="w-full p-4 rounded-xl bg-stone-50 border-none font-bold outline-none text-xs text-center focus:ring-4 ring-stone-100 text-stone-900 text-stone-900" value={formData.depth} onChange={e => setFormData({ ...formData, depth: e.target.value })} />
                <input type="number" placeholder="H" className="w-full p-4 rounded-xl bg-stone-50 border-none font-bold outline-none text-xs text-center focus:ring-4 ring-stone-100 text-stone-900 text-stone-900" value={formData.height} onChange={e => setFormData({ ...formData, height: e.target.value })} />
              </div>
            </div>
          </div>
          <div className="bg-amber-50/60 p-6 rounded-3xl border border-amber-200/40 flex flex-col sm:flex-row justify-between items-center gap-6 shadow-sm text-stone-900">
            <div className="flex items-center gap-4 cursor-pointer text-stone-900 text-stone-900 text-stone-900" onClick={() => setFormData({ ...formData, auctionActive: !formData.auctionActive })}>
              <div className={`w-12 h-7 rounded-full p-1 transition-all ${formData.auctionActive ? 'bg-amber-500 shadow-inner' : 'bg-stone-200 shadow-inner'}`}><div className={`w-5 h-5 bg-white rounded-full transition-all shadow-md ${formData.auctionActive ? 'translate-x-5' : ''}`} /></div><p className="text-[10px] font-black uppercase tracking-widest text-stone-900">Vendre aux enchères</p>
            </div>
            {formData.auctionActive && (
              <div className="flex flex-col gap-3 w-full sm:w-auto text-stone-900 text-stone-900">
                <div className="flex items-center gap-4 text-stone-900 text-stone-900 text-stone-900">
                  <span className="text-[9px] font-black uppercase text-amber-700">Durée (min) :</span>
                  <input
                    type="number"
                    className="w-full sm:w-24 bg-white px-3 py-2 rounded-xl font-bold text-xs outline-none border border-amber-200/50 shadow-sm focus:ring-2 ring-amber-100 text-stone-900 text-stone-900"
                    value={formData.durationMinutes === 0 ? "" : formData.durationMinutes}
                    onChange={(e) => setFormData({ ...formData, durationMinutes: e.target.value === "" ? 0 : Number(e.target.value) })}
                    placeholder="0"
                  />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide text-stone-900 text-stone-900">
                  {[1440, 2880, 4320].map(m => (
                    <button key={m} type="button" onClick={() => setFormData({ ...formData, durationMinutes: m })} className={`px-3 py-1 rounded-lg text-[8px] font-black border transition-all whitespace-nowrap ${formData.durationMinutes === m ? 'bg-stone-900 text-white border-stone-900 shadow-md' : 'bg-white text-stone-400 border-stone-100 hover:border-amber-200'}`}>
                      {m / 60}H
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="space-y-1.5 text-stone-900">
            <label className="text-[9px] font-black uppercase text-stone-400 ml-2">L'histoire de l'objet</label>
            <textarea placeholder="Décrivez l'origine du bois, le temps de travail, les détails uniques..." className="w-full p-5 rounded-2xl bg-stone-50 border-none font-bold text-sm h-64 resize-none outline-none focus:ring-4 ring-stone-100 transition-all shadow-inner text-stone-900 text-stone-900" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
          </div>
        </div>
      </div>

      {/* Metrics Display */}
      {(totalOriginalSize > 0 || totalCompressedSize > 0) && (
        <div className="flex items-center justify-end px-6 pb-2 gap-4 mt-4">
          <div className="text-[10px] font-mono text-stone-500">
            <span>Poids initial: {formatBytes(totalOriginalSize)}</span>
            {totalCompressedSize > 0 && <span className="text-emerald-600 font-bold ml-2">→ Optimisé: {formatBytes(totalCompressedSize)} (-{((1 - totalCompressedSize / totalOriginalSize) * 100).toFixed(0)}%)</span>}
          </div>

          {/* Optimization Button */}
          {galleryItems.some(i => i.file && !i.isCompressed) && (
            <button
              onClick={handleOptimizeImages}
              className="px-3 py-1 bg-amber-100 text-amber-800 rounded-lg text-[10px] font-black uppercase hover:bg-amber-200 transition-colors shadow-sm"
            >
              ⚡ Transformer en WebP
            </button>
          )}

          {/* Download Button */}
          {totalCompressedSize > 0 && (
            <button
              onClick={handleDownloadImages}
              className="flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-[10px] font-black uppercase hover:bg-emerald-200 transition-colors shadow-sm"
            >
              <Download size={12} /> Télécharger
            </button>
          )}
        </div>
      )}


      <div className="flex flex-col items-end gap-3 border-t border-stone-100 pt-6 text-stone-900">
        {msg && <div className={`text-[9px] font-black uppercase px-4 py-2 rounded-full border shadow-sm ${msg.includes('✅') ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>{msg}</div>}
        <button onClick={addMeuble} disabled={uploading} className="w-full md:w-auto px-16 py-5 bg-stone-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl hover:bg-stone-800 hover:translate-y-[-2px] active:translate-y-[1px] transition-all disabled:opacity-50 text-white">
          {editData ? "Confirmer les modifications" : "Publier l'ouvrage"}
        </button>
      </div>
    </div >
  );
}

export default AdminForm;