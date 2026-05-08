# Archive code newsletter

Date : 8 mai 2026

Objectif : retirer completement la newsletter du site public et de l'admin, tout en gardant une trace documentaire du code supprime.

## Fichiers sources retires

- `src/components/auth/NewsletterModal.jsx`
- `src/features/admin/AdminNewsletter.jsx`

## Integrations retirees

### Popup public dans `src/App.jsx`

```jsx
import NewsletterModal from './components/auth/NewsletterModal';

const hasTriggeredPopup = useRef(false);
const hasViewedProduct = useRef(false);
const [showNewsletter, setShowNewsletter] = useState(false);

useEffect(() => {
  if (view === 'detail') {
    hasViewedProduct.current = true;
  }
}, [view]);

useEffect(() => {
  const isNewsletterSubscribed = localStorage.getItem('newsletterSubscribed') === 'true';
  const isNewsletterDismissed = localStorage.getItem('newsletterDismissed') === 'true';

  if (
    view === 'gallery' &&
    hasViewedProduct.current &&
    (!user || user.isAnonymous) &&
    !authLoading &&
    !hasTriggeredPopup.current &&
    !isNewsletterSubscribed &&
    !isNewsletterDismissed
  ) {
    hasTriggeredPopup.current = true;
    const timer = setTimeout(() => {
      setShowNewsletter(true);
    }, 2000);
    return () => clearTimeout(timer);
  }
}, [view, user, authLoading]);

<NewsletterModal
  showNewsletter={showNewsletter}
  setShowNewsletter={setShowNewsletter}
/>
```

### Entree admin dans `src/Router.jsx`

```jsx
import { Mail } from 'lucide-react';

const AdminNewsletter = React.lazy(() => import('./features/admin/AdminNewsletter'));

{ id: 'newsletter', label: 'Newsletter', icon: Mail },

adminCollection === 'newsletter' ? (
  <AdminNewsletter darkMode={darkMode} />
) : ...
```

### Formulaire footer dans `src/components/layout/Footer.jsx`

```jsx
<h3 className="text-[#dba45f] text-[11px] font-black uppercase tracking-[0.24em]">
  Recevoir nos nouveautes
</h3>
<p>
  Nouveaux arrivages, pieces uniques et inspirations directement dans votre boite mail.
</p>
<form onSubmit={(event) => event.preventDefault()}>
  <input type="email" placeholder="Votre adresse email" aria-label="Votre adresse email" />
  <button type="submit" aria-label="S'inscrire a la newsletter">
    <ArrowRight size={23} strokeWidth={1.5} />
  </button>
</form>
```

## Comportement public archive

Le popup public etait un tunnel en trois etapes :

1. saisie email ou telephone ;
2. saisie prenom et nom ;
3. ecriture Firestore dans `newsletter_subscribers`, stockage `newsletterSubscribed=true`, puis animation de confirmation.

La fermeture volontaire stockait `newsletterDismissed=true`.

L'ecriture Firestore supprimée :

```jsx
await addDoc(collection(db, 'newsletter_subscribers'), {
  contactInfo: leadStore.contact,
  firstName,
  lastName,
  createdAt: serverTimestamp(),
  source: 'v3_premium_popup',
});
```

## Comportement admin archive

L'ecran admin supprimé lisait `newsletter_subscribers` trie par `createdAt desc`, permettait :

- recherche par contact, prenom, nom ;
- export CSV avec `exportRowsToCsv` ;
- suppression d'un abonne via `deleteDoc(doc(db, 'newsletter_subscribers', id))`.

Extrait principal :

```jsx
const q = query(
  collection(db, 'newsletter_subscribers'),
  orderBy('createdAt', 'desc')
);

const unsub = onSnapshot(q, (snapshot) => {
  const subs = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
  setSubscribers(subs);
  setLoading(false);
});

const handleDelete = async (id, email) => {
  if (!window.confirm(`Voulez-vous vraiment supprimer l'abonne ${email} ?`)) return;
  await deleteDoc(doc(db, 'newsletter_subscribers', id));
};
```

## Notes de reprise

Pour restaurer la newsletter plus tard, repartir de l'historique Git des deux fichiers sources retires ci-dessus, puis remettre explicitement les integrations `App.jsx`, `Router.jsx` et `Footer.jsx`.
