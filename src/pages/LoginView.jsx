import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/config';

function LoginView({ onSuccess }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const handle = async (e) => {
    e.preventDefault();
    try { await signInWithEmailAndPassword(auth, email, pass); onSuccess(); }
    catch(err) { setErrorMsg("Identifiants incorrects."); }
  };
  return (
    <div className="max-w-xs mx-auto py-40 text-center space-y-6 animate-in zoom-in-95 text-stone-900">
        <div className="w-16 h-16 bg-stone-900 text-white rounded-2xl flex items-center justify-center mx-auto shadow-xl transition-transform hover:scale-105 hover:rotate-3"><Lock size={32}/></div>
        <div className="space-y-2 text-stone-900">
            <h2 className="text-3xl font-black tracking-tighter leading-tight text-stone-900">Portail Maître</h2>
            <p className="text-stone-400 text-xs italic font-serif">Accès restreint à l&apos;administration</p>
        </div>
        <form onSubmit={handle} className="space-y-3">
          <input type="email" placeholder="Email artisan" className="w-full p-5 rounded-2xl bg-white border border-stone-200 font-bold outline-none focus:ring-4 ring-amber-50 transition-all shadow-sm text-stone-900 text-stone-900" onChange={e => setEmail(e.target.value)} required />
          <input type="password" placeholder="Mot de passe" className="w-full p-5 rounded-2xl bg-white border border-stone-200 font-bold outline-none focus:ring-4 ring-amber-50 transition-all shadow-sm text-stone-900 text-stone-900" onChange={e => setPass(e.target.value)} required />
          {errorMsg && <p className="text-[10px] text-red-600 font-bold bg-red-50 py-2 rounded-lg">{errorMsg}</p>}
          <button type="submit" className="w-full py-5 bg-stone-900 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-lg hover:bg-stone-800 active:scale-95 transition-all text-white">Entrer</button>
        </form>
    </div>
  );
}

export default LoginView;