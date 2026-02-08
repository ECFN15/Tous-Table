import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase/config';

function LoginView({ onSuccess }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const handle = async (e) => {
    e.preventDefault();
    try { await signInWithEmailAndPassword(auth, email, pass); onSuccess(); }
    catch (err) { setErrorMsg("Identifiants incorrects."); }
  };
  return (
    <div className="max-w-xs mx-auto py-40 text-center space-y-6 animate-in zoom-in-95 text-stone-900">
      <div className="w-16 h-16 bg-stone-900 text-white rounded-2xl flex items-center justify-center mx-auto shadow-xl transition-transform hover:scale-105 hover:rotate-3"><Lock size={32} /></div>
      <div className="space-y-2 text-stone-900">
        <h2 className="text-3xl font-black tracking-tighter leading-tight text-stone-900">Portail Maître</h2>
        <p className="text-stone-400 text-xs italic font-serif">Accès restreint à l&apos;administration</p>
      </div>
      <div className="space-y-4">
        <button
          onClick={async () => {
            try { await signInWithPopup(auth, googleProvider); onSuccess(); }
            catch (e) { setErrorMsg("Erreur Google : " + e.message); }
          }}
          className="w-full py-4 bg-white text-stone-900 border-2 border-stone-200 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg hover:bg-stone-50 hover:border-stone-300 transition-all flex items-center justify-center gap-3"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
          Continuer avec Google
        </button>

        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-stone-200"></div>
          <span className="flex-shrink-0 mx-4 text-stone-300 text-[10px] font-bold uppercase tracking-widest">Ou classique</span>
          <div className="flex-grow border-t border-stone-200"></div>
        </div>

        <form onSubmit={handle} className="space-y-3">
          <input type="email" placeholder="Email artisan" className="w-full p-4 rounded-xl bg-white border border-stone-200 font-bold outline-none focus:ring-4 ring-amber-50 transition-all shadow-sm text-stone-900 text-sm" onChange={e => setEmail(e.target.value)} required />
          <input type="password" placeholder="Mot de passe" className="w-full p-4 rounded-xl bg-white border border-stone-200 font-bold outline-none focus:ring-4 ring-amber-50 transition-all shadow-sm text-stone-900 text-sm" onChange={e => setPass(e.target.value)} required />
          {errorMsg && <p className="text-[10px] text-red-600 font-bold bg-red-50 py-2 rounded-lg">{errorMsg}</p>}
          <button type="submit" className="w-full py-4 bg-stone-900 text-white rounded-xl font-black uppercase text-xs tracking-widest shadow-lg hover:bg-stone-800 active:scale-95 transition-all text-white">Connexion</button>
        </form>
      </div>
    </div>
  );
}

export default LoginView;