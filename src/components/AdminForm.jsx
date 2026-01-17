import React, { useState, useEffect, useRef } from 'react';
import { Upload, Trash2 } from 'lucide-react';
import { doc, addDoc, updateDoc, collection, serverTimestamp, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, appId } from '../firebase/config';
import { getMillis } from '../utils/time';

function AdminForm({ editData, onCancelEdit }) {
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
  const [imageFiles, setImageFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState("");
  const fileInputRef = useRef();

  useEffect(() => {
    if (editData) {
      const duration = editData.auctionEnd ? Math.round((getMillis(editData.auctionEnd) - Date.now()) / 60000) : 0;
      setFormData({
        name: editData.name || '',
        description: editData.description || '',
        startingPrice: editData.startingPrice || 0,
        material: editData.material || '',
        dimensions: editData.dimensions || '',
        width: editData.width || '',
        depth: editData.depth || '',
        height: editData.height || '',
        auctionActive: editData.auctionActive || false,
        durationMinutes: duration > 0 ? duration : 0
      });
      setPreviews(editData.images || [editData.imageUrl] || []);
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
    setImageFiles([]); setPreviews([]);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setImageFiles(prev => [...prev, ...files]);
      setPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
    }
  };

  const addMeuble = async () => {
    if (!formData.name) { setMsg("⚠️ Nom requis"); return; }
    setUploading(true); setMsg("⏳ Envoi...");
    try {
      let imageUrls = [...previews.filter(p => !p.startsWith('blob:'))];
      if (imageFiles.length > 0) {
        for (const file of imageFiles) {
          const imageRef = ref(storage, `furniture/${Date.now()}_${file.name}`);
          await uploadBytes(imageRef, file);
          imageUrls.push(await getDownloadURL(imageRef));
        }
      }
      const data = {
        ...formData, images: imageUrls, imageUrl: imageUrls[0],
        currentPrice: Number(formData.startingPrice),
        startingPrice: Number(formData.startingPrice),
        durationMinutes: Number(formData.durationMinutes),
        auctionEnd: formData.auctionActive ? Timestamp.fromMillis(Date.now() + (Number(formData.durationMinutes) * 60000)) : null,
      };
      if (editData) {
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'furniture', editData.id), data);
        onCancelEdit();
      } else {
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'furniture'), { ...data, status: 'draft', bidCount: 0, createdAt: serverTimestamp() });
      }
      setMsg("✅ Succès !"); resetForm();
    } catch (err) { setMsg(`❌ Erreur: ${err.message}`); }
    finally { setUploading(false); setTimeout(() => setMsg(""), 3000); }
  };

  return (
    <div className="p-8 md:p-12 bg-white rounded-[3rem] border border-stone-200/60 shadow-2xl space-y-10 animate-in slide-in-from-top-4 text-stone-900">
      <div className="flex justify-between items-center border-b border-stone-100 pb-6 text-stone-900">
        <p className="text-xs font-black uppercase tracking-widest text-stone-900">{editData ? 'Modification en cours' : 'Nouvelle création'}</p>
        {editData && <button onClick={onCancelEdit} className="text-[10px] font-black text-red-500 uppercase hover:text-red-700 transition-colors">Annuler</button>}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 text-stone-900">
        <div className="lg:col-span-4 space-y-4">
          <div className="grid grid-cols-2 gap-3 text-stone-900">
            {previews.map((url, idx) => (
              <div key={idx} className="aspect-square rounded-2xl overflow-hidden relative group shadow-md border border-stone-50 text-stone-900">
                <img src={url} className="w-full h-full object-cover text-stone-900" alt="" />
                <button onClick={() => { setPreviews(p => p.filter((_, i) => i !== idx)); setImageFiles(f => f.filter((_, i) => i !== idx)); }} className="absolute inset-0 bg-red-500/80 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300 text-white text-white"><Trash2 size={20} /></button>
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
              <input placeholder="Chêne, noyer..." className="w-full p-4 rounded-xl bg-stone-50 border-none font-bold outline-none text-sm focus:ring-4 ring-stone-100 transition-all shadow-inner text-stone-900 text-stone-900" value={formData.material} onChange={e => setFormData({ ...formData, material: e.target.value })} />
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
            <textarea placeholder="Décrivez l'origine du bois, le temps de travail, les détails uniques..." className="w-full p-5 rounded-2xl bg-stone-50 border-none font-bold text-sm h-32 resize-none outline-none focus:ring-4 ring-stone-100 transition-all shadow-inner text-stone-900 text-stone-900" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
          </div>
        </div>
      </div>
      <div className="flex flex-col items-end gap-3 border-t border-stone-100 pt-6 text-stone-900">
        {msg && <div className={`text-[9px] font-black uppercase px-4 py-2 rounded-full border shadow-sm ${msg.includes('✅') ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>{msg}</div>}
        <button onClick={addMeuble} disabled={uploading} className="w-full md:w-auto px-16 py-5 bg-stone-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl hover:bg-stone-800 hover:translate-y-[-2px] active:translate-y-[1px] transition-all disabled:opacity-50 text-white">
          {editData ? "Confirmer les modifications" : "Publier l'ouvrage"}
        </button>
      </div>
    </div>
  );
}

export default AdminForm;