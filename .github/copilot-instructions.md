# Copilot Instructions - Tous à Table (TAT)

## Project Overview
**Tous à Table (TAT)** is a React-based auction marketplace for artisan-crafted wooden furniture from Normandy. It's a single-component monolithic app (`app.jsx`) with real-time bidding, admin management, and multi-provider authentication.

**Tech Stack:** React 18 + Vite + Firebase (Auth, Firestore, Storage) + Tailwind CSS  
**Build:** `npm run dev` (local), `npm run build` (production)  
**Deployment:** Firebase Hosting (configured in `firebase.json`)

---

## Architecture & Data Flow

### Single-Component Architecture
Everything lives in [app.jsx](app.jsx) as interconnected React components:
- **HomeView**: Landing page with hero slider, continuous feed marquee, features showcase
- **MarketplaceView (Gallery)**: Product grid filtered by status
- **ProductDetail**: Item page with auction timer, bidding system, bid history
- **AdminForm**: CRUD interface for furniture items with image upload
- **AdminPanel**: Admin dashboard for inventory management  
- **LoginView**: Email/password authentication
- **ConfettiRain**: Winner celebration animation
- **AuctionTimer**: Real-time countdown with millisecond accuracy

### Firebase Data Structure
```
artifacts/
  tat-made-in-normandie/
    public/data/furniture/
      {itemId}/
        - name, description, material, dimensions (w,d,h)
        - startingPrice, currentPrice
        - images[], imageUrl
        - auctionActive (boolean), auctionEnd (Timestamp)
        - status (draft|published)
        - bidCount, lastBidderName, lastBidderEmail, lastBidderPhoto
        - bids/ {bidId}
          - amount, increment, bidderName, timestamp
        - createdAt (serverTimestamp)
```

### Authentication Flow
1. **Anonymous User** (default): `signInAnonymously()` → can browse, cannot bid
2. **Social Login**: Google, Facebook, Twitter, Apple, Microsoft via `signInWithPopup()`
3. **Admin Login**: Email/password via `signInWithEmailAndPassword()` → accesses admin panel if real admin (`!u.isAnonymous && providerData.providerId === 'password'`)
4. **Admin Gate**: URL param `?admin=true` triggers secret gate

---

## Key Patterns & Conventions

### Real-Time Firebase Listeners
- **Auto-sync inventory**: `onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'furniture'))` re-fetches sorted by newest first
- **Auto-sync auth state**: `onAuthStateChanged(auth)` determines admin status
- **Cleanup on unmount**: Both listeners returned from useEffect teardown
- **Collection Path Pattern**: Always use full path: `artifacts/{appId}/public/data/furniture`

### Bidding Logic (Transaction-Based)
Located in `ProductDetail.handleQuickBid(inc)`:
1. User clicks +10€, +50€, or +100€ button
2. `runTransaction(db, async (transaction) => {...})` atomically:
   - Reads current item state via `transaction.get(itemRef)`
   - Checks `auctionActive === true` (stops after `auctionEnd` timestamp)
   - Adds increment to `currentPrice`
   - **Auto-extends auction**: If now > (auctionEnd - 5 minutes), set new auctionEnd = now + durationMinutes + 2 min
   - Records new bid in `furniture/{itemId}/bids/{bidId}` with `serverTimestamp()`
   - Updates item: `currentPrice`, `lastBidderName`, `lastBidderEmail`, `lastBidderPhoto`, `bidCount`
3. **Winner determination**: Checked in `AuctionTimer.onFinished()` → if `auctionActive` false AND current user is `lastBidderName`, show `ConfettiRain`
4. **Error handling**: Catch transaction conflicts (concurrent bids) and retry or show "Prix dépassé" message

### Image Handling
- **Upload**: Files via `uploadBytes()` to `storage/furniture/{timestamp}_{filename}`
- **URL Generation**: `getDownloadURL()` after upload
- **Storage**: Multiple images as array, displayed with thumbnail carousel
- **Preview**: `URL.createObjectURL()` for instant preview before upload

### Time Handling
- **Timestamps**: Firebase `Timestamp` objects (not JS Date)
- **Conversion**: `getMillis(ts)` → always check for `.toMillis()` method before multiplying seconds
- **Display**: `formatTime(ts)` → French locale (`fr-FR`), `HH:mm` format
- **Auction Countdown**: Compute remaining milliseconds in real-time, update every 1000ms

### UI State Management
- `view` state: 'home' | 'gallery' | 'admin' | 'login' (main app view switcher)
- `selectedItemId`: Tracks which product is displayed in ProductDetail view
- `isSecretGateOpen`: Prevents accidental admin panel exposure (gate check before viewing)
- `editingItem`: Null = create new item, Object = editing existing (same form used for both)
- `isMenuOpen`: Toggles mobile navigation sidebar
- `showFullLogin`: Shows/hides social login modal over current view
- **Admin Detection**: `isAdmin` calculated fresh on auth state change, never manually set

### Component-Level State (Important for Modifications)
- **ProductDetail**: Manages `bidsHistory`, `bidLoading`, `msg` (feedback messages)
- **AdminForm**: Manages `formData`, `uploading`, `msg` (for image upload progress)
- **AuctionTimer**: Manages countdown via `useEffect` interval (cleaned up on unmount)
- **HomeView**: Manages `currentHeroIdx` auto-slide state with interval cleanup

---

## Developer Workflows

### Local Development
```bash
npm install
npm run dev
# Vite dev server on http://localhost:5173
# Hot reload enabled for .jsx changes in app.jsx
# No need to restart - changes reflected instantly
```

### Adding Features
1. **New View**: Create component function (e.g., `const MyView = () => {...}`), add case in App `return` JSX under existing views
2. **New Firebase Operations**: Use existing patterns: `doc()`, `collection()`, `runTransaction()`, `onSnapshot()`
3. **New UI Components**: Keep inline in app.jsx; avoid separate files to maintain monolithic simplicity
4. **Styling**: Tailwind classes only (embedded in `className`); no CSS files; check vite.config.js for constraints
5. **Icons**: Import from lucide-react; all icons already available

### Debugging Checklist
- **Admin Access**: Open `?admin=true`, login with email/password
- **Verify Admin Status**: Check `console.log(user, isAdmin)` - requires `!isAnonymous` + `providerId === 'password'`
- **Firebase Data**: Console > Firestore > `artifacts/tat-made-in-normandie/public/data/furniture`
- **Image Upload**: Check Storage bucket for `furniture/{timestamp}_{filename}` paths
- **Timestamps**: Use `getMillis(ts)` to convert Firebase Timestamp → readable console logs
- **Auction Logic**: Check item's `auctionEnd` (Timestamp), `auctionActive` (boolean), `lastBidderName` in Firestore

### Production Build & Deploy
```bash
npm run build    # Generates dist/ folder (Vite compiles + minifies)
firebase deploy  # Pushes dist/ to Firebase Hosting (requires 'firebase login' once)
# Monitor at: https://console.firebase.google.com/project/tatmadeinnormandie
```

---

## Critical Implementation Details

### Auction End Time Extension
When a bid comes in during the final 5 minutes:
- New end time = now + original duration + 2 minutes
- `Timestamp.fromMillis(Date.now() + (durationMinutes * 60000 + 120000))`

### Form Editing
- `editingItem` null → "Nouvelle création" form, `addDoc()`
- `editingItem` populated → "Modification en cours" form, `updateDoc()`
- Reset after save: `resetForm()`, clear `editingItem` state

### Status Workflow
- Draft items: Admin-only, hidden from marketplace
- Published items: Visible in gallery, publicly bidable
- Toggle via `handleToggleStatus()` → `updateDoc({ status })`

### Marquee Animation
- Two infinite scrolling rows (left & right directions)
- 50s duration at `max-content` width
- Duplicated items array (`[...row1Items, ...row1Items]`) ensures smooth loop

### Anonymous vs. Authenticated Actions
- Anonymous: View all, read bids, cannot bid
- Verified user: Full bidding capability, can see login modal
- Admin: All above + inventory management, can edit/delete/publish

---

## Common Gotchas & Anti-Patterns

1. **Timestamp Comparison**: Always use `getMillis()` before comparing Firebase Timestamps
2. **Status Filter**: `item.status === 'published'` required in marketplace views (draft items invisible)
3. **Image File Refs**: Upload path MUST follow `furniture/{timestamp}_{filename}` pattern for Storage paths
4. **Auction Duration**: Store as minutes (`durationMinutes`), multiply by 60000ms when creating Timestamps
5. **CSS Classes**: All Tailwind; no external stylesheets (constraint in vite.config.js)
6. **Admin Detection**: Require BOTH `!isAnonymous` AND `providerData.some(p => p.providerId === 'password')`
7. **Collection Paths**: Full paths only - never abbreviate `collection()` or `doc()` calls; always specify all segments
8. **Auction Window**: Final 5 minutes = `auctionEnd - 300000` milliseconds; extension = `durationMinutes * 60000 + 120000`
9. **Transaction Errors**: Concurrent bids can cause transaction failures; always wrap bidding in try-catch with user feedback

---

## Files at a Glance

| File | Purpose |
|------|---------|
| [app.jsx](app.jsx) | Entire app (React components + Firebase logic) |
| [main.jsx](main.jsx) | React DOM mount point |
| [package.json](package.json) | Dependencies (React, Firebase, Vite, Tailwind) |
| [vite.config.js](vite.config.js) | Vite + React plugin setup |
| [firebase.json](firebase.json) | Hosting rules, rewrites, cache headers |
| [index.html](index.html) | HTML template with `<div id="root">` |

---

## Reference: Key Functions to Know

- `getMillis(ts)` – Convert Timestamp → milliseconds
- `formatTime(ts)` – Display time in French HH:mm format
- `handleQuickBid(inc)` – Bidding transaction logic
- `addMeuble()` / `handleToggleStatus()` / `handleDeleteItem()` – Admin CRUD
- `handleSocialLogin(provider)` – OAuth login dispatch
- `AuctionTimer` – Renders countdown, auto-closes auction
