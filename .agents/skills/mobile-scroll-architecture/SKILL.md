---
name: mobile-scroll-architecture
description: Strict, prescriptive playbook for setting up smooth scroll across mobile (iOS, Android) and desktop in React/Vite apps using Lenis + GSAP ScrollTrigger. Codifies what to do, what NEVER to do on mobile, and the exact code patterns proven on the Tous à Table codebase (29 avr. 2026 audit). Use whenever an agent must integrate Lenis, fix mobile jank, build a sticky/auto-hiding header, add scroll-linked animations, or touch any scroll listener on a touch device.
---

# Mobile Scroll Architecture

## Core Doctrine

There are **three platforms** with **three different scroll engines**, and they must never be treated identically:

| Platform | Native scroll quality | Action |
|---|---|---|
| **Desktop (mouse wheel)** | Mediocre (linear, no momentum) | **Use Lenis** to add smooth wheel scroll |
| **iOS (touch)** | Excellent (WebKit momentum) | **NEVER** override. Use 100% native. |
| **Android (touch)** | Very good in Chrome 2024+ | **NEVER** override. Use 100% native. |

**Rule of thumb** : Lenis is a desktop wheel-smoother. The moment you enable `syncTouch`, you are fighting the OS. Do not do it.

This skill assumes the stack:
- React 18+ / Vite
- `@studio-freight/lenis` (or `lenis@1.x`)
- `gsap` + `gsap/ScrollTrigger`
- Optional: Framer Motion, Three.js

## Section 1 — Lenis : the only correct setup

### 1.1 What Lenis MUST be

- A **single instance**, mounted at the App root via a custom hook.
- **Driven by `gsap.ticker`**, never by its own RAF (`autoRaf: false`). One RAF for GSAP + Lenis.
- **Disabled entirely on touch devices**.
- **Disabled entirely** when `prefers-reduced-motion: reduce`.
- Cleaned up on unmount AND on Vite HMR re-execution.

### 1.2 Reference hook (copy-paste, do not modify)

```js
// src/hooks/useLenisScroll.js
import { useEffect, useRef } from 'react';
import Lenis from '@studio-freight/lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const destroyExistingLenis = () => {
  if (typeof window === 'undefined') return;
  if (typeof window.__lenisCleanup === 'function') {
    window.__lenisCleanup();
    window.__lenisCleanup = null;
    return;
  }
  if (window.__lenis?.destroy) {
    window.__lenis.destroy();
    delete window.__lenis;
  }
};

// Touch detection — covers iOS, Android, iPadOS 13+ (MacIntel + maxTouchPoints>1).
const isTouchDevice = () => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  if (window.matchMedia?.('(pointer: coarse)').matches) return true;
  const ua = navigator.userAgent || '';
  if (/iPad|iPhone|iPod|Android/i.test(ua)) return true;
  if (navigator.platform === 'MacIntel' && (navigator.maxTouchPoints || 0) > 1) return true;
  return false;
};

export const useLenisScroll = ({ enabled = true } = {}) => {
  const lenisRef = useRef(null);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    // === Lenis = DESKTOP ONLY. Touch devices use the OS-native scroll. ===
    if (isTouchDevice()) return;

    destroyExistingLenis();

    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
      wheelMultiplier: 1.05,
      syncTouch: false,                // never true. Mobile already early-returned.
      gestureOrientation: 'vertical',
      autoRaf: false,                  // we drive from gsap.ticker
      autoResize: true,
    });

    lenisRef.current = lenis;
    window.__lenis = lenis;
    if (window.__lenisLockCount > 0) lenis.stop?.();

    // Lockstep with GSAP ScrollTrigger.
    const onLenisScroll = () => ScrollTrigger.update();
    lenis.on('scroll', onLenisScroll);

    const tickerCallback = (time) => lenis.raf(time * 1000); // gsap ticker = seconds
    gsap.ticker.add(tickerCallback);
    gsap.ticker.lagSmoothing(0); // prevents micro-jumps on dropped frames

    const cleanup = () => {
      gsap.ticker.lagSmoothing(500, 33);
      gsap.ticker.remove(tickerCallback);
      lenis.off('scroll', onLenisScroll);
      lenis.destroy();
      lenisRef.current = null;
      if (window.__lenis === lenis) delete window.__lenis;
      if (window.__lenisCleanup === cleanup) window.__lenisCleanup = null;
    };

    window.__lenisCleanup = cleanup;
    return cleanup;
  }, [enabled]);

  return lenisRef;
};
```

### 1.3 Mandatory CSS baseline

```css
html.lenis,
html.lenis body { height: auto; }

.lenis.lenis-smooth { scroll-behavior: auto !important; }

.lenis.lenis-smooth [data-lenis-prevent] { overscroll-behavior: contain; }

.lenis.lenis-stopped { overflow: hidden; }
```

These classes are added by Lenis only when it instantiates → on mobile they never appear, which is correct.

### 1.4 Programmatic scroll helper (works on both desktop and mobile)

```js
// src/utils/smoothScroll.js
const DEFAULT_EASING = (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t));

export const getLenis = () => (typeof window === 'undefined' ? null : window.__lenis || null);

export const scrollToTarget = (target, options = {}) => {
  if (typeof window === 'undefined') return;
  const { offset = 0, duration = 0.95, immediate = false, easing = DEFAULT_EASING, force = true } = options;

  const lenis = getLenis();
  if (lenis?.scrollTo) {
    lenis.scrollTo(target, { offset, duration, immediate, easing, force });
    return;
  }
  // Mobile fallback — native smooth scroll.
  if (typeof target === 'number') {
    window.scrollTo({ top: target, behavior: immediate ? 'auto' : 'smooth' });
    return;
  }
  const el = typeof target === 'string' ? document.querySelector(target) : target;
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY + offset;
  window.scrollTo({ top, behavior: immediate ? 'auto' : 'smooth' });
};

export const scrollToTop = (options = {}) =>
  scrollToTarget(0, { immediate: true, duration: 0, ...options });

export const lockLenis = () => {
  if (typeof window === 'undefined') return () => {};
  window.__lenisLockCount = (window.__lenisLockCount || 0) + 1;
  getLenis()?.stop?.();
  let released = false;
  return () => {
    if (released) return;
    released = true;
    window.__lenisLockCount = Math.max((window.__lenisLockCount || 1) - 1, 0);
    if (window.__lenisLockCount === 0) getLenis()?.start?.();
  };
};
```

`getLenis()` returns `null` on mobile → the helper falls back to native `window.scrollTo({behavior:'smooth'})`. **This is intentional.** Do not add a Lenis polyfill for mobile.

## Section 2 — The mobile anti-patterns (do NOT do these)

These patterns destroy fluidity on iOS and Android. Search the codebase for them before claiming the audit is done.

### 2.1 ❌ Calling `setState` on every scroll event

```jsx
// 🛑 NEVER DO THIS
useEffect(() => {
  const onScroll = () => {
    if (window.scrollY > lastY.current) setIsVisible(false);
    else setIsVisible(true);
    lastY.current = window.scrollY;
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  return () => window.removeEventListener('scroll', onScroll);
}, []);
```

**Why it kills mobile** : the scroll event fires 60–120×/sec. Each call re-renders the component (and on a sticky header with `backdrop-blur-xl`, the GPU also recomposites). Combined with React reconciliation on every pixel scrolled, you lose 5–15 ms per frame on mid-range Android.

### 2.2 ✅ Correct sticky / auto-hiding header pattern

```jsx
const [isVisible, setIsVisible] = useState(true);
const visibleRef = useRef(true);
const lastYRef = useRef(0);
const rafRef = useRef(0);

useEffect(() => {
  const SCROLL_DELTA = 8; // px threshold — kills flip-flop on iOS micro-jitter

  const compute = () => {
    rafRef.current = 0;
    const y = window.scrollY;
    const delta = y - lastYRef.current;

    let next = visibleRef.current;
    if (y <= 0) next = true;
    else if (Math.abs(delta) >= SCROLL_DELTA) next = delta < 0;

    if (Math.abs(delta) >= SCROLL_DELTA) lastYRef.current = y;
    if (next !== visibleRef.current) {
      visibleRef.current = next;
      setIsVisible(next);   // setState only when value actually changes
    }
  };

  const onScroll = () => {
    if (rafRef.current) return;            // RAF coalesce
    rafRef.current = requestAnimationFrame(compute);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  return () => {
    window.removeEventListener('scroll', onScroll);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  };
}, []);
```

**Three layers of throttling** are required:
1. **RAF coalesce** — at most one calc per animation frame.
2. **Delta threshold** — ignore movements < 8 px to absorb iOS momentum jitter.
3. **Diff via ref** — call `setState` only when the boolean truly flips.

Result: scroll session of 1000 px on Android → ~2 React renders instead of ~600.

### 2.3 ❌ Lenis with `syncTouch: true` on mobile

```js
// 🛑 NEVER ON MOBILE
new Lenis({ syncTouch: true, syncTouchLerp: 0.075, touchInertiaMultiplier: 35 });
```

- **iOS** : doubles JS scroll on top of WebKit momentum → the two engines fight, micro-stutters appear, scroll feels "alive" in a bad way.
- **Android** : with default `touchInertiaMultiplier: 35`, deceleration is so soft it feels "floaty" and lagged. Lenis's RAF on a mid-range Snapdragon is also expensive.

**The correct answer is not to tune `syncTouch` better. It is to disable Lenis on touch devices entirely** (Section 1.2).

### 2.4 ❌ `mousemove` listeners that fire on touch as well

`pointermove` fires on touch. `mousemove` does not on most mobile browsers, but some emit it. Always gate cursor-tracking effects:

```js
if (window.matchMedia?.('(hover: hover)').matches) {
  // attach mousemove only on devices that actually have a mouse
}
```

### 2.5 ❌ WebGL / Three.js running unconditionally

Three.js with a permanent `requestAnimationFrame` loop is a **death sentence** for mid-range Android (drains battery, triggers thermal throttling, GPU memory pressure → scroll jank elsewhere on the page).

**Correct pattern**: early-return on touch devices or small screens.

```js
const isTouchOrSmallScreen = () => {
  if (window.matchMedia?.('(pointer: coarse)').matches) return true;
  if (/iPad|iPhone|iPod|Android/i.test(navigator.userAgent)) return true;
  if (navigator.platform === 'MacIntel' && (navigator.maxTouchPoints || 0) > 1) return true;
  return window.innerWidth < 900;
};

useEffect(() => {
  if (isTouchOrSmallScreen()) return; // no WebGL on mobile
  // … rest of Three.js setup …
}, []);
```

If the visual is critical on mobile, replace it with a static SVG / image, not a pixel-ratio-reduced WebGL fallback.

### 2.6 ❌ Permanent `will-change` on many elements

```css
/* 🛑 BAD — permanent GPU layer for every parallax image */
.img-parallax img { will-change: transform; }
```

Each `will-change: transform` element forces the browser to keep a dedicated GPU compositor layer. On mobile with 8–12 such elements, GPU memory saturates → main-thread paint stalls → scroll jitters.

**Correct usage** : add `will-change` only **during** an active animation, remove on completion. GSAP does this automatically with `force3D: true`.

```js
// Manual pattern when GSAP is not used
el.style.willChange = 'transform';
animate(el).then(() => { el.style.willChange = 'auto'; });
```

### 2.7 ❌ Heavy `backdrop-filter: blur()` on sticky / fixed elements

```html
<!-- 🛑 Cher en GPU sur mobile -->
<header className="sticky top-0 backdrop-blur-xl bg-black/90">
```

`backdrop-filter` recomposites every frame the underlying scroll moves. On mid-range Android with a `blur(20px)` sticky header, expect 8–12 ms of compositor cost per frame.

**Mitigation hierarchy** :
1. Best : remove the blur on mobile via media query (`@media (pointer: coarse)`).
2. Acceptable : reduce to `blur(8px)` on mobile.
3. Avoid stacking blur on multiple sticky/fixed layers simultaneously.

### 2.8 ❌ `requestAnimationFrame` loops without coordination

Multiple independent RAFs (Lenis + GSAP + Three.js + custom) compete and drift. **One RAF authority, period** — wire everything through `gsap.ticker` (Section 1.2).

### 2.9 ❌ Async image analysis (canvas, getImageData) during scroll

If you do canvas-based image analysis (letterbox detection, dominant color, etc.) :
- Defer with `requestIdleCallback` / `setTimeout(..., 120)`.
- **Pause** the queue while `window.__lenis?.isScrolling` is true (or while a `scroll` event fired in the last 200 ms).
- Cap queue depth (e.g. 32 items) to avoid runaway work.

## Section 3 — Modal / drawer / overlay scroll lock

When a modal opens, the body must lock without breaking iOS scroll position.

```js
import { lockLenis } from '@/utils/smoothScroll';

useEffect(() => {
  if (!isOpen) return;
  const release = lockLenis();          // refcounted — supports nested modals
  document.body.classList.add('modal-open');
  return () => {
    release();
    document.body.classList.remove('modal-open');
  };
}, [isOpen]);
```

```css
/* iOS-safe scroll lock — preserves scroll position on close */
body.modal-open {
  position: fixed;
  width: 100%;
  height: 100% !important;
  background-color: #000 !important;
}
```

For internal scroll regions inside a modal, mark them so Lenis (desktop) doesn't hijack them:

```html
<div data-lenis-prevent class="overflow-y-auto" style="overscroll-behavior: contain;">
```

## Section 4 — Mandatory verification checklist

Before claiming a scroll task is done, run through this checklist:

```bash
# 1. No `setState` on scroll without RAF + threshold + diff
rg "addEventListener\\(['\"]scroll" src --files-with-matches | xargs rg -l "setState|set[A-Z]"

# 2. No Lenis instantiation on mobile (early return must exist)
rg "new Lenis\\(" src

# 3. No syncTouch:true anywhere
rg "syncTouch:\\s*true" src

# 4. No mousemove without (hover: hover) gate
rg "addEventListener\\(['\"]mousemove" src

# 5. No permanent will-change on many elements
rg "will-change:\\s*transform" src --type css

# 6. WebGL/Three.js gated for mobile
rg "WebGLRenderer|new Scene\\(" src
```

Then build and test:

```bash
npm run build
```

Then test in a real browser on both:
- **iOS Safari** (real device or BrowserStack) — scroll must feel **silky**, identical to native iOS apps.
- **Chrome Android** mid-range device (Pixel 5 / Galaxy A-series) — scroll must reach 60 fps consistently.

Use this frame sampler in the device's remote DevTools console:

```js
async function sampleFrames(duration = 3000) {
  const frames = [];
  let last = performance.now();
  const end = last + duration;
  return new Promise((resolve) => {
    function tick(now) {
      frames.push(now - last);
      last = now;
      if (now < end) requestAnimationFrame(tick);
      else {
        const sorted = [...frames].sort((a, b) => a - b);
        resolve({
          count: frames.length,
          avg: +(frames.reduce((a, b) => a + b, 0) / frames.length).toFixed(2),
          p95: +sorted[Math.floor(sorted.length * 0.95)].toFixed(2),
          max: +Math.max(...frames).toFixed(2),
          longFrames: frames.filter((x) => x > 50).length,
        });
      }
    }
    requestAnimationFrame(tick);
  });
}
sampleFrames().then(console.log);
```

**Targets** :
- Mobile mid-range: `avg ≤ 18 ms`, `p95 ≤ 22 ms`, `longFrames ≤ 2` for a 3-second scroll.
- Desktop: `avg ≤ 9 ms`, `p95 ≤ 12 ms`, `longFrames = 0`.

## Section 5 — Decision tree (when adding a new feature)

```
Does the feature read scroll position?
├─ Yes
│   ├─ Does it update DOM/styles directly (no React state)? → use refs + RAF, OK.
│   └─ Does it trigger setState? → use the RAF + threshold + diff pattern (§2.2). NEVER raw.
└─ No → proceed normally.

Does the feature run on mobile?
├─ Yes
│   ├─ WebGL/Canvas RAF loop? → early-return on touch devices (§2.5).
│   ├─ backdrop-filter blur? → check stacking, consider mobile media query (§2.7).
│   └─ mousemove listener? → gate with (hover: hover) (§2.4).
└─ No → desktop-only is fine, but document it.

Does the feature need programmatic scroll?
└─ Always use scrollToTarget() / scrollToTop() from utils/smoothScroll.js. Never raw window.scrollTo in components.
```

## Section 6 — Update the journal

After every scroll-related change, append a dated entry to `AGENTS.md` (or the project's equivalent journal) with:

- File(s) touched
- Cause analysis
- Solution summary
- Build verification result
- Residual risks

This skill itself was extracted from such an audit on the Tous à Table codebase (29 avr. 2026). Treat the journal as the source of truth for scroll architecture decisions.
