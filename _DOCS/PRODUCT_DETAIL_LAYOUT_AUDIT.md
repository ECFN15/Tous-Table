# Product detail layout audit

## 2026-05-17 - Mobile mixed-ratio gallery pass

Scope: mobile and tablet flow below the desktop `lg` grid.

Context: product publications can mix portrait and landscape photos. On mobile, the main gallery used the active image's natural ratio directly in normal flow, so switching between landscape and portrait photos resized the whole hero and made the content below jump. The main image also felt too close to the fullscreen zoom size.

Changes applied:

- Added stable mobile/tablet gallery stage sizing in `src/index.css`, so the lower product content keeps the same vertical anchor while the active image changes orientation.
- Added `tat-product-image-frame--portrait` and `tat-product-image-frame--landscape` sizing caps in `src/designs/architectural/ArchitecturalProductDetail.jsx` and `src/index.css`.
- Kept the real image aspect ratio through a CSS ratio variable, while reducing the inline gallery image below the fullscreen lightbox size.
- Left desktop `lg+` product detail proportions unchanged.

Verification:

- `git diff --check -- src/designs/architectural/ArchitecturalProductDetail.jsx src/index.css _DOCS/PRODUCT_DETAIL_LAYOUT_AUDIT.md` : OK, with CRLF working-copy warnings only.
- `npm run build` : OK after rerun outside the sandbox because the first attempt hit the known esbuild `spawn EPERM` sandbox failure. Existing generated CSS and large chunk warnings remain.

## 2026-05-17 - Google Ads and product sheet proportion pass

Scope: `src/designs/architectural/ArchitecturalProductDetail.jsx`.

Context: after adding Google Ads containers, the desktop product page felt oversized on compact browser widths. The visible issues were the "Retour Collection" control, the top and side ad slots, the central image frame, and the right purchase panel.

FrontSymmetry audit:

- Main shell: flow grid on desktop, `lg:grid`, with the gallery column and purchase column as siblings.
- Gallery header: flow child of the gallery column; the back button is absolute inside that header on desktop, while the top ad remains centered in flow.
- Image row: flex row on desktop; left ad, image wrapper, and right ad are siblings, so ad width directly affects image breathing room.
- Purchase panel: flow content inside the right grid column; text, price, specs and CTA share vertical space inside a fixed viewport-height column.

Changes applied:

- Reduced desktop right column from `minmax(420px,34vw)` / `minmax(500px,34vw)` to smaller `lg`, `xl`, and `2xl` tracks.
- Reduced desktop gallery padding and top header height.
- Reduced top ad from 90px high and 728px wide to responsive clamp widths and 64/72px height.
- Reduced side ads from 120px to 72/88/96px depending on breakpoint.
- Capped image frame height with viewport-aware `max-height` values so compact desktop formats do not overfill the first view.
- Reduced product title, price, description height, mobile ad placeholder, and purchase CTA proportions.
- Removed the desktop minimum width on the back button and reduced its text/icon sizing.
- Reduced the between-sections Google Ads slot so lower-page ad rhythm matches the first viewport.
- Shortened the desktop back control label from "Retour Collection" to "Retour" to avoid overlap with the top Google Ads container.

Verification:

- `npm run build` passed on 2026-05-17 after rerun outside the sandbox because the first attempt hit `spawn EPERM` from esbuild.
- Vite still reports existing bundle-size warnings and one generated CSS optimizer warning unrelated to this product detail change.

Remaining visual check:

- Confirm in browser at compact desktop widths around the screenshot format that the side ads, main image, and right purchase panel feel balanced.

## 2026-05-17 - Tablet breakpoint pass

Scope: tablet widths between the mobile layout and the desktop `lg` grid.

FrontSymmetry audit:

- Below `lg`, the page remains in a vertical flow: gallery first, then product information.
- The image frame and right product panel are siblings in the outer flow, so tablet fixes must use `md:` sizing on each sibling instead of changing the desktop grid.
- The description block used the compact desktop scroll box on tablet, which created an awkward internal scrollbar while the whole page was already scrollable.

Changes applied:

- Added `md` image max widths so tablet does not use a full-width oversized mobile image while preserving the real image ratio.
- Added `md` gallery padding to separate the tablet image from the fixed header.
- Centered the product information panel on tablet with a wider `md:max-w-[640px]`, then restored the desktop right alignment at `lg`.
- Reduced the tablet title size from the inherited `md:text-5xl` to `md:text-[42px]`.
- Let the description scroll naturally on tablet, while keeping the compact scroll box on desktop.
- Widened the mobile/tablet ad slot slightly at `md` so it aligns with the tablet content rhythm.

## 2026-05-17 - Small tablet anti-offset pass

Scope: narrow tablet widths just below Tailwind `md`, around 640-767px.

Issue: the viewport in the in-app browser can sit just under `md`, so the page still used the mobile/sm flow. The product panel was right-aligned by the base `ml-auto mr-0`, while the following sections used wider page padding, creating a visible horizontal offset.

Changes applied:

- Added `sm` image max widths so small tablet stays centered without forcing a fake horizontal frame.
- Added `sm:mx-auto sm:max-w-[560px]` to the product panel, then kept the larger `md:max-w-[640px]` above it.
- Aligned the in-product ad slot to the same small-tablet width as the CTA.
- Constrained "Vous aimerez aussi", the between-sections ad, and the care-feature block to the same `sm`/`md` content axis, restoring the wide layout only at `lg`.

Follow-up correction:

- Removed the forced `sm`/`md` image heights because they broke the adaptive image container and cropped portrait furniture photos into a horizontal frame. The image frame is back to natural ratio sizing below `lg`, with only max-width constraints.

## 2026-05-17 - Desktop bottom breathing pass

Scope: desktop first viewport only, same component.

Context: on a 1920px desktop viewport, the central product image and the right product sheet left too much unused space near the bottom of the screen, while the Google Ads containers and the back button needed to stay untouched.

FrontSymmetry audit:

- Back button and top ad: siblings inside the gallery header; no change applied.
- Side ads: siblings of the central image stage; no `ProductDetailAdSlot` class or ad container class changed.
- Central image frame: independent class computed from image orientation; safe place to increase the image's own max-height without changing the ad slot declarations.
- Right product sheet: separate grid column, with the description scroll box and price/action block in normal flow.

Changes applied:

- Increased only the desktop image frame caps from 560/600px to 590/620px, still bounded by viewport-aware `calc(100vh - 158px)`.
- Increased the desktop description scroll allowance from `clamp(120px,20vh,190px)` to `clamp(150px,24vh,238px)`.
- Reduced the desktop margin under the price/spec row by one step so the CTA/livraison block keeps a small bottom margin instead of touching the viewport.

Verification:

- `git diff --check -- src/designs/architectural/ArchitecturalProductDetail.jsx _DOCS/PRODUCT_DETAIL_LAYOUT_AUDIT.md` : OK.
- `npm run build` : OK after rerun outside the sandbox because the first attempt hit the known esbuild `spawn EPERM` sandbox failure. Existing generated CSS and large chunk warnings remain.
- Browser smoke attempted on `/produit/no-37-table-de-ferme-DMlKgOf0EWtV8JZwWnuA` at 1920 x 1032, but the isolated in-app browser did not load the product catalogue in that session, so final visual confirmation should be done in the already-running local Chrome page.

Follow-up responsive correction:

- Replaced the fixed Tailwind media-row transform with `.tat-product-media-row` in `src/index.css`, preserving the 28px visual descent.
- Added `.tat-product-hero-shell` height overrides for shorter desktop-responsive windows: below 860px viewport height the hero reserves more vertical flow space, and below 760px it reserves a larger buffer. Follow-up visual pass increased those buffers slightly to keep the recommendations module from sitting too close to the image bottom.
- Reason: `transform` is visual-only and does not reserve flow space, so the next `tat-heavy-section` could appear to eat the bottom of the product hero on shorter desktop-responsive windows. The correction now adjusts the hero's flow height instead of lifting the media/ad row.

Follow-up portrait navigation correction:

- Removed the conditional active-image offsets because mixed-format galleries made the arrows jump position when switching between portrait and landscape photos.
- Added stable `.tat-product-gallery-nav--prev` / `--next` desktop offsets in `src/index.css`, using `calc(50% - min(38vw, 420px))`. The arrows sit closer to portrait images than the old edge-of-stage placement while keeping one fixed position for the whole publication and staying outside horizontal images.

Follow-up top Google Ads correction:

- Enlarged the first-viewport top horizontal Google Ads placeholder toward the larger recommended leaderboard rhythm already used lower on the page.
- The top slot now reaches 728px on desktop and 900px on wider screens, while reserving side breathing room so it does not collide with the `Retour` control.
- Increased only the gallery header row height to contain the taller top slot.
