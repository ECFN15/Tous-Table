---
name: scroll-fluidity-performance
description: Expert workflow for auditing and improving scroll smoothness, Lenis/GSAP integration, scroll-linked animations, route transitions, modals, media-heavy pages, product grids, and high refresh-rate performance. Use when Codex is asked to diagnose jank, freezes, micro-stutters, scroll bugs, animation desync, poor mobile scroll, or performance issues across app pages, especially React/Vite/Next apps using Lenis, GSAP, Framer Motion, Three.js, videos, iframes, image grids, drawers, modals, product pages, or ecommerce/catalog layouts.
---

# Scroll Fluidity Performance

## Standard

Treat scroll fluidity as a system problem, not a single CSS tweak. Diagnose the full pipeline: input, scroll driver, animation tick, React renders, paint/composite cost, media loading, route changes, modals, and cleanup.

Aim for stable behavior across 60 Hz, 90 Hz, 120 Hz, 144 Hz, and 160 Hz screens. Do not assume 16.67 ms frames are the only target. Avoid code that hardcodes 60 fps timing or drives independent animation loops without coordination.

## Workflow

1. Read existing audit docs or comments first. Preserve the project's prior decisions and update the audit after the fix.
2. Map the scroll stack:
   - Find smooth-scroll libraries: Lenis, locomotive-scroll, GSAP ScrollSmoother, custom RAF loops.
   - Find animation engines: GSAP ScrollTrigger, Framer Motion, Three.js, CSS scroll animations.
   - Find native scroll calls: `window.scrollTo`, `scrollIntoView`, anchor jumps, router scroll restoration.
   - Find body locks and scroll containers: modals, drawers, sidebars, checkout overlays, lightboxes.
   - Find heavy content: product grids, masonry layouts, videos, iframes, 3D canvas, image analysis, hover parallax.
3. Reproduce before editing. Use the dev server and browser automation when available. Record key pages, frame timing, console errors, and visible symptoms.
4. Fix the highest leverage causes first: duplicate scroll loops, native scroll fighting smooth scroll, React state during scroll, heavy media during scroll, and permanent GPU hints.
5. Re-test the same pages after each meaningful pass. Build at the end.
6. Update the local audit document with diagnosis, changed files, validation results, and remaining risks.

## Search Checklist

Use fast source search:

```bash
rg "Lenis|useLenis|ScrollTrigger|gsap\\.ticker|requestAnimationFrame|window\\.scrollTo|scrollIntoView|scroll-behavior|overflow-hidden|data-lenis-prevent|mousemove|iframe|youtube|vimeo|will-change|content-visibility|Three|Canvas|motion\\." src
```

If `rg` is unavailable, use the platform equivalent. Inspect matches before changing anything.

## Core Fix Patterns

### One Scroll Authority

Ensure there is one app-level scroll authority. If Lenis is used, create it once near the app root and expose a small helper module for programmatic scroll:

- `getLenis()`
- `scrollToTarget(target, options)`
- `scrollToTop(options)`
- `lockLenis()` with a refcount for nested modals

Replace scattered native `window.scrollTo` and `scrollIntoView` with that helper. Keep native fallback only for reduced motion, missing Lenis, tests, or unsupported environments.

### Lenis And GSAP

When Lenis and GSAP ScrollTrigger coexist:

- Drive Lenis from `gsap.ticker` or otherwise ensure Lenis writes and ScrollTrigger reads in the same tick.
- Call `ScrollTrigger.update` from Lenis scroll events.
- Disable or tune GSAP lag smoothing only intentionally; restore defaults during cleanup.
- Destroy stale Lenis instances during hot reload.
- Avoid multiple independent `requestAnimationFrame` loops for scroll.

Use the official Lenis CSS baseline:

```css
html.lenis,
html.lenis body {
  height: auto;
}

.lenis.lenis-smooth {
  scroll-behavior: auto !important;
}

.lenis.lenis-smooth [data-lenis-prevent] {
  overscroll-behavior: contain;
}

.lenis.lenis-stopped {
  overflow: hidden;
}
```

### Modals, Drawers, And Internal Scroll

When an overlay is open:

- Stop the smooth-scroll instance with a refcounted lock.
- Restore body state and scroll position on close.
- Mark internal scroll regions with `data-lenis-prevent`.
- Add `overscroll-behavior: contain` to prevent scroll chaining.
- Avoid fighting Lenis with `position: fixed` body locks unless the app already uses that pattern safely.

Test cart drawers, menus, newsletter modals, checkout/payment modals, lightboxes, and mobile sidebars.

### React During Scroll

Do not run React state updates every scroll tick unless unavoidable.

Prefer:

- refs plus `requestAnimationFrame` for header visibility and scroll direction
- CSS variables for hover parallax
- `useMemo` for sorted/grouped product lists
- `React.memo` for repeated cards
- cleanup for every listener, timer, ScrollTrigger, RAF, and animation context

Avoid:

- `setState` in `mousemove`, `scroll`, or every animation tick
- recreating large filtered/sorted arrays during every render
- using Framer Motion for dozens of simple repeated hover effects when CSS can handle them
- running image/canvas analysis while Lenis is actively scrolling

### Paint And Composite Budget

Use containment on repeated or off-screen heavy sections:

```css
.perf-card-shell {
  content-visibility: auto;
  contain-intrinsic-size: auto 520px;
  contain: layout paint style;
}

.perf-heavy-section {
  content-visibility: auto;
  contain-intrinsic-size: auto 1100px;
}
```

Use `will-change` only during active animation and remove it afterward. Permanent `will-change`, `translateZ(0)`, blur/filter stacks, and huge fixed backgrounds can create memory pressure and stutter.

### Media And Product Pages

On catalog, shop, product, editorial, or media-heavy pages:

- Lazy-load non-critical images.
- Add `decoding="async"` to large images.
- Avoid creating YouTube/Vimeo iframes before user intent; use click-to-load embeds.
- Defer canvas/image analysis with `requestIdleCallback`, and postpone it while scrolling.
- Keep masonry/product cards stable with intrinsic sizes or aspect ratios.
- Do not let hover animations change layout dimensions.

### 3D And Canvas

For Three.js or canvas backgrounds:

- Pause or heavily throttle RAF loops when offscreen, hidden, or intentionally paused.
- Lower quality on weak devices or when frame timing is poor.
- Avoid running 3D, scroll-triggered animations, and large media decoding at the same time during route transitions.

## Validation

Always validate with both build and browser behavior.

Minimum:

```bash
npm run build
```

Browser pass:

- Home or main landing page
- Every high-scroll catalog/grid page
- Any product/detail page
- Menu/drawer/cart/sidebar
- Checkout/payment overlay if present
- Mobile viewport and desktop viewport

Collect:

- Whether the smooth-scroll instance exists exactly once
- Scroll height per page
- Card/item count for grids
- average frame delta
- p95 frame delta
- max frame delta
- long frame count
- console errors and failed network requests

Example frame sampler for the browser console or Playwright `page.evaluate`:

```js
async function sampleFrames(duration = 2500) {
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
        const avg = frames.reduce((a, b) => a + b, 0) / frames.length;
        resolve({
          count: frames.length,
          avg: Number(avg.toFixed(2)),
          p95: Number(sorted[Math.floor(sorted.length * 0.95)].toFixed(2)),
          max: Number(Math.max(...frames).toFixed(2)),
          longFrames: frames.filter((x) => x > 50).length,
        });
      }
    }
    requestAnimationFrame(tick);
  });
}
```

Interpret metrics relative to the device and app complexity. A home page with 3D and large GSAP scenes may keep a few long frames under stress; catalog and product pages should be much cleaner.

## Completion Criteria

The task is not done until:

- Scroll APIs are centralized or intentionally documented.
- Duplicate smooth-scroll instances are removed.
- Modals/drawers no longer fight page scroll.
- Repeated cards avoid React render work during pointer/scroll interactions.
- Heavy media does not instantiate during passive scrolling.
- Build passes.
- Key routes are tested in browser.
- The audit file or project notes are updated with concrete results and remaining risks.
