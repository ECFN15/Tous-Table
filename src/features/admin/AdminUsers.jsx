import React, { useState, useEffect } from 'react';
import { httpsCallable } from 'firebase/functions';
import { collection, doc, onSnapshot } from 'firebase/firestore';
import { functions, db } from '../../firebase/config';
import { Users, UserPlus, Trash2, Shield, Loader, AlertCircle } from 'lucide-react';

const AdminUsers = ({ darkMode }) => {
    const [users, setUsers] = useState([]); // Array of user objects
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Form State
    const [newEmail, setNewEmail] = useState('');
    const [newName, setNewName] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    // --- 1. Fetch Users from Firestore ---
    useEffect(() => {
        const unsub = onSnapshot(doc(db, 'sys_metadata', 'admin_users'), (docSnap) => {
            if (docSnap.exists() && docSnap.data().users) {
                const usersMap = docSnap.data().users;
                const usersArray = Object.entries(usersMap).map(([uid, data]) => ({
                    uid,
                    ...data
                }));
                setUsers(usersArray);
            } else {
                setUsers([]);
            }
            setLoading(false);
        }, (err) => {
            console.error("Error fetching admin users:", err);
            setLoading(false);
        });

        return () => unsub();
    }, []);

    // --- 2. Add User Handler ---
    const handleAddUser = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setErrorMsg('');

        try {
            const addAdminFn = httpsCallable(functions, 'addAdminUser');
            // Call Cloud Function
            const result = await addAdminFn({
                email: newEmail,
                name: newName
            });

            if (result.data.success) {
                setIsAddModalOpen(false);
                setNewEmail('');
                setNewName('');
                alert(result.data.userExists ? "Compte trouvé ! L'utilisateur est désormais Admin." : "Invitation ajoutée ! L'utilisateur deviendra Admin dès sa première connexion Google.");
            } else {
                setErrorMsg(result.data.message || "Une erreur est survenue lors de l'ajout.");
            }
        } catch (error) {
            console.error(error);
            setErrorMsg(error.message || "Une erreur est survenue.");
        } finally {
            setSubmitting(false);
        }
    };

    // --- 3. Remove User Handler ---
    const handleRemoveUser = async (uid, email) => {
        if (!confirm(`Voulez-vous vraiment retirer les droits d'administration à ${email} ?`)) return;

        try {
            const removeAdminFn = httpsCallable(functions, 'removeAdminUser');
            await removeAdminFn({ uid, email });
            // Firestore sync is automatic via onSnapshot
        } catch (error) {
            console.error(error);
            alert("Erreur: " + error.message);
        }
    };

    if (loading) return <div className="p-12 text-center animate-pulse opacity-50">Chargement des maîtres du lieu...</div>;

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 pb-20">
            {/* Header */}
            <div className={`p-8 rounded-[2.5rem] shadow-xl flex justify-between items-center ${darkMode ? 'bg-stone-900 text-white' : 'bg-stone-900 text-white'}`}>
                <div>
                    <h2 className="text-3xl font-black tracking-tight mb-2">Maîtres des Lieux</h2>
                    <p className="text-stone-400 font-medium">Gérez l'accès au portail d'administration.</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="px-6 py-4 bg-white text-stone-900 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-stone-200 transition-colors flex items-center gap-3 shadow-lg"
                >
                    <UserPlus size={16} /> Ajouter
                </button>
            </div>

            {/* Users Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {users.map(user => (
                    <div key={user.uid} className={`p-6 rounded-[2rem] ring-1 relative group will-change-transform ${darkMode ? 'bg-stone-800 ring-stone-700/50' : 'bg-white ring-stone-100 shadow-sm'}`}>
                        <div className="flex items-start justify-between mb-6">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${darkMode ? 'bg-stone-700 text-stone-300' : 'bg-stone-100 text-stone-500'}`}>
                                <Shield size={24} />
                            </div>

                            {/* Bouton Supprimer : Visible uniquement si ce n'est PAS moi et PAS le compte intouchable */}
                            {user.email !== 'matthis.fradin2@gmail.com' && (
                                <button
                                    onClick={() => handleRemoveUser(user.uid, user.email)}
                                    className={`p-2 rounded-lg transition-colors opacity-0 group-hover:opacity-100 ${darkMode ? 'hover:bg-red-900/30 text-red-500' : 'hover:bg-red-50 text-red-500'}`}
                                    title="Révoquer les droits"
                                >
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>

                        <div>
                            <h3 className={`text-lg font-black tracking-tight ${darkMode ? 'text-white' : 'text-stone-900'}`}>{user.name}</h3>
                            <p className="text-sm text-stone-400 font-mono mt-1 mb-4 flex flex-col gap-1">
                                <span>{user.email}</span>
                                {user.uid.startsWith('pending_') && (
                                    <span className="text-[10px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full w-fit font-bold">En attente d'inscription</span>
                                )}
                            </p>

                            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest ${darkMode ? 'bg-stone-900 text-stone-400' : 'bg-stone-50 text-stone-500'}`}>
                                <Users size={12} />
                                {user.role || 'Admin'}
                            </div>
                        </div>

                        <div className="absolute top-6 right-6">
                            <div className={`w-2 h-2 rounded-full shadow-[0_0_10px_currentColor] ${user.uid.startsWith('pending_') ? 'bg-amber-500 text-amber-500' : 'bg-emerald-500 text-emerald-500'}`}></div>
                        </div>
                    </div>
                ))}

                {users.length === 0 && (
                    <div className="col-span-full text-center py-20 text-stone-400">
                        Aucun administrateur trouvé.
                    </div>
                )}
            </div>

            {/* ADD USER MODAL */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)}></div>
                    <div className={`relative w-full max-w-md rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 ${darkMode ? 'bg-stone-800' : 'bg-white'}`}>
                        <h3 className={`text-2xl font-black mb-1 ${darkMode ? 'text-white' : 'text-stone-900'}`}>Inviter un Admin</h3>
                        <p className="text-stone-400 text-xs mb-6">L'accès se fera via leur compte Google.</p>

                        <form onSubmit={handleAddUser} className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-stone-400 mb-2">Prénom / Nom</label>
                                <input
                                    type="text"
                                    value={newName} onChange={e => setNewName(e.target.value)}
                                    placeholder="Ex: Jean Dupont"
                                    className={`w-full p-4 rounded-xl font-bold outline-none border-2 focus:border-stone-500 transition-all ${darkMode ? 'bg-stone-900 border-stone-700 text-white' : 'bg-stone-50 border-stone-100 text-stone-900'}`}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-stone-400 mb-2">Email Google</label>
                                <input
                                    type="email"
                                    value={newEmail} onChange={e => setNewEmail(e.target.value)}
                                    placeholder="email@gmail.com"
                                    className={`w-full p-4 rounded-xl font-bold outline-none border-2 focus:border-stone-500 transition-all ${darkMode ? 'bg-stone-900 border-stone-700 text-white' : 'bg-stone-50 border-stone-100 text-stone-900'}`}
                                    required
                                />
                            </div>

                            {errorMsg && (
                                <div className="p-3 rounded-xl bg-red-500/10 text-red-500 text-xs font-bold flex items-center gap-2">
                                    <AlertCircle size={14} /> {errorMsg}
                                </div>
                            )}

                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setIsAddModalOpen(false)} className={`flex-1 py-4 rounded-xl font-bold uppercase text-xs tracking-widest ${darkMode ? 'bg-stone-700 text-stone-400 hover:text-white' : 'bg-stone-100 text-stone-500 hover:text-stone-900'}`}>Annuler</button>
                                <button type="submit" disabled={submitting} className="flex-1 py-4 bg-stone-900 text-white rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-black transition-colors flex items-center justify-center gap-2">
                                    {submitting ? <Loader size={14} className="animate-spin" /> : 'Inviter'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUsers;
