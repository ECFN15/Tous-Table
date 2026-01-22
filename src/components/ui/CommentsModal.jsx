import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Trash2 } from 'lucide-react';
import { db, appId } from '../../firebase/config';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, deleteDoc, doc, updateDoc, increment } from 'firebase/firestore';
import { getMillis } from '../../utils/time';

const CommentsModal = ({ isOpen, onClose, itemId, user, isAdmin, activeCollection = 'furniture' }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const messagesEndRef = useRef(null);

    // Scroll to bottom on new message
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (!isOpen || !itemId) return;

        // Path: artifacts/{appId}/public/data/{collection}/{itemId}/comments
        const commentsRef = collection(db, 'artifacts', appId, 'public', 'data', activeCollection, itemId, 'comments');
        const q = query(commentsRef, orderBy('createdAt', 'asc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setComments(msgs);
            setTimeout(scrollToBottom, 100);
        });

        return () => unsubscribe();
    }, [isOpen, itemId, activeCollection]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim() || !user) return; // Should allow anon? Maybe not for storage spam reasons.

        setIsSubmitting(true);
        try {
            const commentsRef = collection(db, 'artifacts', appId, 'public', 'data', activeCollection, itemId, 'comments');
            await addDoc(commentsRef, {
                text: newComment.trim(),
                userId: user.uid,
                userName: user.displayName || 'Anonyme',
                userEmail: user.email || 'anonyme@tat.fr', // Useful for Admin
                createdAt: serverTimestamp(),
                isAdmin: isAdmin || false
            });

            // Increment comment count on parent
            const itemRef = doc(db, 'artifacts', appId, 'public', 'data', activeCollection, itemId);
            await updateDoc(itemRef, {
                commentCount: increment(1)
            });

            setNewComment('');
        } catch (error) {
            console.error("Error adding comment:", error);
            alert("Erreur lors de l'envoi du commentaire.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (commentId) => {
        if (!isAdmin && !confirm("Voulez-vous vraiment supprimer ce commentaire ?")) return;
        try {
            await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', activeCollection, itemId, 'comments', commentId));

            // Decrement comment count? (Optional but consistent)
            const itemRef = doc(db, 'artifacts', appId, 'public', 'data', activeCollection, itemId);
            await updateDoc(itemRef, {
                commentCount: increment(-1)
            });

        } catch (e) {
            console.error(e);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

            {/* Modal */}
            <div className="relative w-full max-w-md bg-[#FAF9F6] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-stone-200">
                    <h3 className="font-serif text-2xl font-bold text-[#1D1D1F]">Commentaires</h3>
                    <button onClick={onClose} className="p-2 hover:bg-stone-200 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white/50">
                    {comments.length === 0 ? (
                        <div className="text-center py-10 opacity-40">
                            <p className="text-sm font-bold uppercase tracking-widest">Aucun commentaire</p>
                            <p className="text-xs mt-2">Soyez le premier à donner votre avis !</p>
                        </div>
                    ) : (
                        comments.map((msg) => (
                            <div key={msg.id} className={`flex flex-col gap-1 ${msg.userId === user?.uid ? 'items-end' : 'items-start'} group`}>
                                <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed relative ${msg.userId === user?.uid
                                        ? 'bg-[#1D1D1F] text-white rounded-tr-sm'
                                        : 'bg-white border border-stone-100 shadow-sm text-[#1D1D1F] rounded-tl-sm'
                                    }`}>
                                    <p>{msg.text}</p>

                                    {/* Admin Delete Action */}
                                    {(isAdmin || msg.userId === user?.uid) && (
                                        <button
                                            onClick={() => handleDelete(msg.id)}
                                            className="absolute -top-2 -right-2 bg-red-100 text-red-500 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-500 hover:text-white"
                                        >
                                            <Trash2 size={10} />
                                        </button>
                                    )}
                                </div>
                                <span className="text-[9px] text-stone-400 font-medium px-2">
                                    {msg.userName} • {msg.createdAt ? new Date(getMillis(msg.createdAt)).toLocaleDateString() : 'A l\'instant'}
                                </span>
                            </div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-stone-200 flex gap-3 items-center">
                    <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Ajouter un commentaire..."
                        className="flex-1 bg-stone-100 rounded-full px-5 py-3 text-sm font-medium outline-none focus:ring-2 ring-[#1D1D1F]/20 transition-all placeholder:text-stone-400"
                        disabled={!user}
                    />
                    <button
                        type="submit"
                        disabled={!newComment.trim() || isSubmitting || !user}
                        className="p-3 bg-[#1D1D1F] text-white rounded-full hover:scale-110 disabled:opacity-50 disabled:hover:scale-100 transition-all shadow-lg"
                    >
                        <Send size={18} />
                    </button>
                </form>
                {!user && (
                    <div className="bg-amber-50 px-4 py-2 text-center border-t border-amber-100">
                        <p className="text-[10px] font-bold text-amber-800 uppercase tracking-widest">Connectez-vous pour commenter</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommentsModal;
