import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Search, ArrowRight, Trash2, Send, CornerDownRight } from 'lucide-react';
import { db, appId } from '../firebase/config';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, addDoc, serverTimestamp, increment } from 'firebase/firestore';
import { getMillis } from '../utils/time';

const AdminComments = () => {
    // State
    const [itemsWithComments, setItemsWithComments] = useState([]);
    const [selectedItemId, setSelectedItemId] = useState(null);
    const [selectedItemCollection, setSelectedItemCollection] = useState('furniture'); // 'furniture' | 'cutting_boards'
    const [activeComments, setActiveComments] = useState([]);
    const [replyText, setReplyText] = useState('');
    const [loading, setLoading] = useState(true);

    const messagesEndRef = useRef(null);

    // 1. Fetch ALL items to find those with comments
    useEffect(() => {
        const fetchItems = () => {
            // We listen to both collections
            const unsubFurniture = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'furniture'), (snap) => {
                updateItemsList('furniture', snap.docs);
            });
            const unsubBoards = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'cutting_boards'), (snap) => {
                updateItemsList('cutting_boards', snap.docs);
            });
            return () => { unsubFurniture(); unsubBoards(); };
        };

        const itemsMap = { furniture: [], cutting_boards: [] };

        const updateItemsList = (colName, docs) => {
            itemsMap[colName] = docs.map(d => ({ id: d.id, ...d.data(), _collection: colName }));

            // Merge and sort by most recent interaction (simulated by having comments)
            // Ideally we'd have a 'lastCommentAt' field, but for now we filter count > 0
            const all = [...itemsMap.furniture, ...itemsMap.cutting_boards]
                .filter(i => i.commentCount > 0)
                .sort((a, b) => (b.commentCount || 0) - (a.commentCount || 0)); // Sort by popularity for now

            setItemsWithComments(all);
            setLoading(false);
        };

        const cleanup = fetchItems();
        return cleanup;
    }, []);

    // 2. Load Conversation when Item Selected
    useEffect(() => {
        if (!selectedItemId) return;

        const col = itemsWithComments.find(i => i.id === selectedItemId)?._collection || 'furniture';
        setSelectedItemCollection(col);

        const q = query(collection(db, 'artifacts', appId, 'public', 'data', col, selectedItemId, 'comments'), orderBy('createdAt', 'asc'));

        const unsub = onSnapshot(q, (snap) => {
            setActiveComments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
        });

        return () => unsub();
    }, [selectedItemId, itemsWithComments]);

    // Actions
    const handleReply = async (e) => {
        e.preventDefault();
        if (!replyText.trim() || !selectedItemId) return;

        try {
            await addDoc(collection(db, 'artifacts', appId, 'public', 'data', selectedItemCollection, selectedItemId, 'comments'), {
                text: replyText.trim(),
                userId: 'ADMIN',
                userName: 'Atelier Normand (Admin)',
                isAdmin: true,
                createdAt: serverTimestamp()
            });

            // Increment count
            const itemRef = doc(db, 'artifacts', appId, 'public', 'data', selectedItemCollection, selectedItemId);
            await updateDoc(itemRef, { commentCount: increment(1) });

            setReplyText('');
        } catch (error) {
            console.error("Error replying:", error);
            alert("Erreur envoi réponse");
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!confirm("Supprimer ce message ?")) return;
        try {
            await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', selectedItemCollection, selectedItemId, 'comments', commentId));

            // Decrement count
            const itemRef = doc(db, 'artifacts', appId, 'public', 'data', selectedItemCollection, selectedItemId);
            await updateDoc(itemRef, { commentCount: increment(-1) });

        } catch (error) { console.error(error); }
    };

    const selectedItem = itemsWithComments.find(i => i.id === selectedItemId);

    return (
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-stone-200 overflow-hidden min-h-[600px] flex">
            {/* --- SIDEBAR LISTE --- */}
            <div className={`w-full md:w-80 border-r border-stone-100 flex flex-col bg-stone-50/50 ${selectedItemId ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-6 border-b border-stone-100 flex justify-between items-center">
                    <h3 className="font-black uppercase tracking-widest text-xs text-stone-500">Boîte de réception</h3>
                    <span className="bg-stone-200 text-stone-600 text-[10px] font-bold px-2 py-0.5 rounded-full">{itemsWithComments.length}</span>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {itemsWithComments.length === 0 ? (
                        <div className="p-8 text-center opacity-40">
                            <MessageCircle className="mx-auto mb-2" />
                            <p className="text-xs font-bold">Aucun commentaire</p>
                        </div>
                    ) : (
                        itemsWithComments.map(item => (
                            <div
                                key={item.id}
                                onClick={() => setSelectedItemId(item.id)}
                                className={`p-4 border-b border-stone-100 cursor-pointer hover:bg-white transition-all group ${selectedItemId === item.id ? 'bg-white border-l-4 border-l-stone-900 shadow-sm' : 'border-l-4 border-l-transparent'}`}
                            >
                                <div className="flex gap-3">
                                    <div className="w-12 h-12 rounded-lg bg-stone-200 overflow-hidden flex-shrink-0">
                                        <img src={item.images?.[0] || item.imageUrl} className="w-full h-full object-cover" alt="" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-bold text-sm text-stone-900 truncate">{item.name}</h4>
                                            {item.commentCount > 0 && <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 rounded-full">{item.commentCount}</span>}
                                        </div>
                                        <p className="text-[10px] text-stone-400 font-medium uppercase tracking-wider mt-1">{item._collection === 'furniture' ? 'Mobilier' : 'Planche'}</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* --- ZONE CONVERSATION --- */}
            <div className={`flex-1 flex flex-col bg-[#FAF9F6] ${!selectedItemId ? 'hidden md:flex' : 'flex'}`}>
                {!selectedItemId ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-stone-300 opacity-50">
                        <CornerDownRight size={48} strokeWidth={1} />
                        <p className="mt-4 font-serif text-xl">Sélectionnez un article</p>
                    </div>
                ) : (
                    <>
                        {/* HEADER CONVERSATION */}
                        <div className="p-6 bg-white border-b border-stone-100 flex items-center justify-between shadow-sm z-10">
                            <div className="flex items-center gap-4">
                                <button onClick={() => setSelectedItemId(null)} className="md:hidden p-2 -ml-2 text-stone-400"><ArrowRight className="rotate-180" size={20} /></button>
                                <div className="flex items-center gap-3">
                                    <img src={selectedItem?.images?.[0] || selectedItem?.imageUrl} className="w-10 h-10 rounded-full object-cover border border-stone-200" alt="" />
                                    <div>
                                        <h3 className="font-bold text-stone-900">{selectedItem?.name}</h3>
                                        <p className="text-[10px] text-stone-400 uppercase tracking-widest">{selectedItem?._collection}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* MESSAGES LIST */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {activeComments.length === 0 ? (
                                <p className="text-center text-xs text-stone-400 italic py-10">Chargement des messages...</p>
                            ) : (
                                activeComments.map((msg) => (
                                    <div key={msg.id} className={`flex flex-col gap-1 ${msg.isAdmin ? 'items-end' : 'items-start'} animate-in slide-in-from-bottom-2`}>
                                        <div className={`max-w-[80%] rounded-2xl p-4 text-sm relative group ${msg.isAdmin ? 'bg-stone-900 text-white rounded-tr-none' : 'bg-white border border-stone-200 text-stone-800 rounded-tl-none shadow-sm'}`}>
                                            <p>{msg.text}</p>
                                            <button
                                                onClick={() => handleDeleteComment(msg.id)}
                                                className="absolute -top-2 -right-2 bg-red-100 text-red-500 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white shadow-sm"
                                                title="Supprimer"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                        <span className="text-[9px] text-stone-400 font-medium px-2 flex items-center gap-1">
                                            {msg.userName} {msg.isAdmin && '(Admin)'} • {msg.createdAt ? new Date(getMillis(msg.createdAt)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}
                                        </span>
                                    </div>
                                ))
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* INPUT REPLY */}
                        <form onSubmit={handleReply} className="p-4 bg-white border-t border-stone-200 flex gap-3">
                            <input
                                type="text"
                                value={replyText}
                                onChange={e => setReplyText(e.target.value)}
                                placeholder="Répondre en tant qu'administrateur..."
                                className="flex-1 bg-stone-100 rounded-full px-5 py-3 text-sm focus:ring-2 ring-stone-900/10 outline-none transition-all"
                            />
                            <button type="submit" disabled={!replyText.trim()} className="p-3 bg-stone-900 text-white rounded-full hover:scale-105 disabled:opacity-50 disabled:scale-100 transition-all shadow-md">
                                <Send size={18} />
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default AdminComments;
