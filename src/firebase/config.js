import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, TwitterAuthProvider, OAuthProvider } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';
import { getAnalytics } from 'firebase/analytics';

// --- CONFIGURATION FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyCtuul_bp1r6W__c_6B37ank6Nl7Im0H8o",
  authDomain: "tatmadeinnormandie.firebaseapp.com",
  projectId: "tatmadeinnormandie",
  storageBucket: "tatmadeinnormandie.firebasestorage.app",
  messagingSenderId: "116427088828",
  appId: "1:116427088828:web:614ea24f006431d4d581b9",
  measurementId: "G-Z58ZWH97Z2"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const functions = getFunctions(app, 'us-central1'); // Region important for functions
const analytics = getAnalytics(app);
const appId = 'tat-made-in-normandie';

// --- PROVIDERS AUTHENTIFICATION ---
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();
const twitterProvider = new TwitterAuthProvider();
const appleProvider = new OAuthProvider('apple.com');
const microsoftProvider = new OAuthProvider('microsoft.com');

export { auth, db, storage, functions, analytics, appId, googleProvider, facebookProvider, twitterProvider, appleProvider, microsoftProvider };