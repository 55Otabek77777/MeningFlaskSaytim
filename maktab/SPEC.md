# ULUGʻBEK LOGISTICS — build spec (read fully before writing code)

## 0. Mission
We are building a **single self-contained HTML file**: a landing site for a fictional Uzbek logistics company,
**"Mirzo Ulugʻbek Logistics"** (short brand: **ULUGʻBEK** / "Ulugʻbek Logistics").
The user is running a head-to-head test: the same prompt went to a competitor AI. The page must make a viewer
say "vau" within 3 seconds and keep surprising them all the way to the footer. Target: Awwwards "Site of the Day"
craft — cinematic, **extremely animation-rich**, yet smooth (60 fps), polished, readable and bug-free.
Every section needs (a) an entrance choreography, (b) scroll-linked motion, (c) ambient/idle life, and
(d) pointer/touch interactivity where it makes sense. Nothing static, nothing generic, nothing half-finished.
No lorem ipsum, no placeholder boxes, no emoji-as-icons: every icon/illustration is hand-built inline SVG, CSS or canvas/WebGL.

## 1. Concept & voice
- **Big idea:** *"Yulduzlar aniqligida"* — "with the precision of the stars." Mirzo Ulugʻbek (1394–1449), astronomer-king of
  Samarqand, catalogued 1018 stars in his observatory (completed 1429). Caravans on the Silk Road navigated by the stars.
  We are the **New Silk Road** — the same precision, now with GPS, rail, sea and air.
- **Visual world:** night sky + astrolabe brass + Registan majolica tiles. Deep ink backgrounds, turquoise/azure data glow,
  gold/coral warmth for highlights and CTAs, 8-point girih stars, orbits, constellations, meridian arcs, route lines.
- **Language:** all visible copy is **Uzbek (Latin)**. Use the proper modifier letter **ʻ (U+02BB)** in oʻ / gʻ
  (Ulugʻbek, yoʻl, oʻz, bogʻlaymiz, Qozogʻiston) and **ʼ (U+02BC)** for tutuq belgisi (maʼlumot, sunʼiy). Numbers in Uzbek
  style: thousands separated by a thin space, decimal comma → use `MU.fmt(n, decimals)` or `data-count`.
- **Tone:** confident, premium, warm, short sentences. Headline-first. No marketing fluff paragraphs.

## 2. Fact sheet (use these numbers everywhere — consistency matters)
| Fact | Value |
|---|---|
| Founded | 2009, Toshkent — 17 yillik tajriba |
| HQ | Toshkent sh., Mirzo Ulugʻbek tumani, Buyuk Ipak Yoʻli koʻchasi, 1429-uy |
| Phone / Email / Telegram | +998 71 200 14 29 · salom@ulugbek-logistics.uz · @ulugbek_logistics |
| Coverage | 47 davlat · 180+ shahar |
| Fleet | 1 240 fura (tyagach), 320 refrijerator, 86 konteyner platforma, Euro-6 |
| Warehouses | 36 ombor · 210 000 m² |
| Volume | 2,4 mln tonna / yil |
| On time | 99,3 % oʻz vaqtida |
| Clients | 12 000+ mijoz |
| Customs clearance | oʻrtacha 2 soat |
| Support | 24/7 dispetcherlik markazi |
| Transit examples | Shanghai→Toshkent (temir yoʻl) 10 kun · Toshkent→Moskva (avto) 6 kun · Toshkent→Istanbul (avto) 8 kun · Toshkent→Duisburg (multimodal) 18 kun · Toshkent→Dubay (avia) 1 kun |
| Silk-road corridor (route section) | Shanghai → Sian → Urumchi → Qorgʻos → Olmaota → Toshkent → Samarqand → Buxoro → Turkmanboshi → Boku → Tbilisi → Istanbul → Duisburg ≈ 11 000 km, 18 kun |
| Tracking demo codes | `UL-2026-TAS-0718` (yoʻlda, Shanghai→Toshkent, 68 %) · `UL-2026-SAM-1420` (yetkazildi) · `UL-2026-IST-0909` (bojxonada) |
| Services | Avto (FTL/LTL, tent, refrijerator) · Temir yoʻl (konteyner poyezdlari) · Dengiz (FCL/LCL, multimodal) · Avia (ekspress, 24–72 soat) · Omborxona (3PL, WMS) · Bojxona (broker xizmati) |
Client / testimonial companies and people are **invented** (e.g. "Registon Textil", "Zarafshon Agro", "Oltin Vodiy Fruits",
"Kamalak Pharm", "Sayyora Electronics") — never use real company names. Currency in the calculator: USD ($).

## 3. Visual system (already in `src/base/base.css` — use it, do not redefine tokens)
- Colors (CSS vars): `--ink-950 #03050c` (page) `--ink-900 --ink-850 --ink-800 --ink-700 --ink-600`; lines `--line --line-2 --line-3`;
  text `--text --text-2 --text-3`; accents `--turq #2ee6d6 --azure #3d8bff --lapis --violet #8b6cff --gold #ffc861 --amber --coral #ff5a36 --rose --green`;
  rgb triplets `--turq-rgb --azure-rgb --violet-rgb --gold-rgb --coral-rgb` for `rgba(var(--turq-rgb), .3)`;
  gradients `--grad-cool` (turq→azure→violet) `--grad-warm` (gold→amber→coral) `--grad-aurora` `--grad-surface`.
  Role: cool = data/tech/glow; warm = CTA, highlights, heritage/brass. Keep the palette; do not introduce new hues.
- Fonts (inlined, latin subset): `--font-display` **Unbounded** (wide geometric display, 300–900), `--font-body` **Manrope** (300–800),
  `--font-mono` **JetBrains Mono** (labels, codes, data). Unbounded is WIDE: size headlines accordingly and test at 390 px.
- Type classes: `.h-mega .h-hero .h2 .h3 .lead .eyebrow (.idx, --gold) .mono .muted .dim .grad-text(--warm) .accent-turq/gold/coral/azure .tabular`.
- Layout: `.container` (1320 max + gutter), `.section` (position:relative + vertical padding), `.sec-head(--center)`.
- Components: `.btn` + `.btn--primary` (warm) / `.btn--cool` / `.btn--ghost` + `.btn--sm/--lg` with the rolling label markup:
  ```html
  <a class="btn btn--primary" data-magnetic href="#kalkulyator">
    <span class="btn__label" data-text="Narxni hisoblash"><span>Narxni hisoblash</span></span>
    <svg class="btn__icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
  </a>
  ```
  `.glass` (frosted card), `.chip`, `.dot-live` (pinging green dot), `.sr-only`.
- Section heading pattern (use it for consistency):
  ```html
  <div class="sec-head">
    <span class="eyebrow" data-scramble><span class="idx">02</span>&nbsp;— Xizmatlar</span>
    <h2 class="h2" data-split="lines">Har qanday yuk. <span class="accent-gold">Har qanday masofa.</span></h2>
    <p class="lead" data-reveal="blur">…</p>
  </div>
  ```
- Radii `--r-sm 12 / --r-md 18 / --r-lg 28 / --r-xl 40 / --r-pill`. Easing `--ease-out`, `--ease-in-out` (CSS) / `'mu.out'`, `'mu.inOut'` (GSAP).
- z-index scale: content ≤ 10 inside your section; `--z-grain 700 --z-nav 800 --z-progress 850 --z-menu 900 --z-cursor 990 --z-preloader 1000` (core only).
- A **global fixed star-sky canvas** (owned by core) sits behind all content. Keep section backgrounds transparent or
  semi-transparent (gradients with alpha) unless a solid panel is a deliberate design moment, so the sky shows through.
  Every part root must be `position: relative` (`.section` already is) so it paints above the sky.

## 4. Architecture (single file, built from parts)
```
logistika/
  SPEC.md            ← this file
  build.mjs          ← node build.mjs [--only a,b] [--release]
  qa.mjs             ← headless screenshots + console errors + overflow checks
  src/template.html  src/base/base.css  src/base/bootstrap.js   ← SHARED — do not edit
  src/parts/NN-name/ ← one folder per part: part.html, *.css (sorted), *.js (sorted); *.mjs = build-time scripts (not shipped)
  dist/              ← build output (previews), qa/ ← screenshots
```
- **Runtime libraries are inlined by the build** — globals available: `gsap` + plugins (ScrollTrigger, SplitText, MotionPathPlugin,
  DrawSVGPlugin, CustomEase, Flip, Observer, ScrambleTextPlugin, MorphSVGPlugin, ScrollToPlugin, Draggable, InertiaPlugin — all registered),
  `Lenis`, and `THREE` (tree-shaken: the build scans your code for `THREE.Name` and bundles just those; addons available as
  `THREE.EffectComposer, THREE.RenderPass, THREE.UnrealBloomPass, THREE.OutputPass, THREE.ShaderPass, THREE.RoundedBoxGeometry, THREE.BufferGeometryUtils`).
  Always write `THREE.Vector3` etc. (or `const { A, B } = THREE;`) so the scanner sees it.
- **No network at runtime.** No CDN, no `<img src="http…">`, no fetch. The container cannot reach CDNs anyway.
  npm registry **is** reachable: `world-atlas`, `topojson-client`, `d3-geo` are installed for build-time geometry — write a
  `gen-*.mjs` in your part folder that outputs a `.js` data file (commit the generated data file; keep it compact, ideally < 60 KB).
- Parts are concatenated in folder order into one page. **Each JS file is wrapped by the build in its own `try { … }` block**, so
  top-level `const/let/class` are private to that file. To share data between files of your part (e.g. a generated `a-land.js` data
  file read by `part.js`), assign it to a prefixed global: `window.muHeroLand = "…"`. Keep all other code inside `MU.part(...)`
  callbacks / local helpers; never leak unprefixed globals.
- Sections flow over one continuous night sky: avoid hard horizontal seams between sections. If you paint a background, fade it in/out
  with soft gradients at the top/bottom edges.

### Section map (DOM order, ids are nav anchors)
| Folder | data-part | root id | Eyebrow | Owner |
|---|---|---|---|---|
| 00-core | core | (preloader, cursor, sky, nav, menu, progress, grain) | — | A |
| 10-hero | hero | `bosh` | — | B |
| 15-ticker | ticker | `ticker` | — | B |
| 20-heritage | heritage | `meros` | 01 — Ulugʻbek merosi | C |
| 30-services | services | `xizmatlar` | 02 — Xizmatlar | D |
| 35-modes | modes | `transport` | 03 — Transport turlari | D |
| 40-route | route | `marshrut` | 04 — Yangi Ipak yoʻli | E |
| 45-stats | stats | `raqamlar` | 05 — Raqamlarda | C |
| 50-fleet | fleet | `park` | 06 — Aqlli park | F |
| 55-tracking | tracking | `kuzatuv` | 07 — Real vaqtda kuzatuv | G |
| 60-process | process | `jarayon` | 08 — Qanday ishlaymiz | E |
| 65-calculator | calculator | `kalkulyator` | 09 — Narx kalkulyatori | F |
| 70-why | why | `afzalliklar` | 10 — Nega aynan biz | H |
| 75-reviews | reviews | `mijozlar` | 11 — Mijozlar fikri | G |
| 80-contact | contact | `aloqa` | 12 — Aloqa | H |
| 99-footer | footer | `footer` (`<footer>`) | — | A |
Nav links (core): Xizmatlar `#xizmatlar` · Marshrut `#marshrut` · Kuzatuv `#kuzatuv` · Kalkulyator `#kalkulyator` · Aloqa `#aloqa`; CTA "Buyurtma berish" → `#aloqa`.
Hero CTAs: "Yukni kuzatish" → `#kuzatuv`, "Narxni hisoblash" → `#kalkulyator`.

## 5. Runtime API — `window.MU` (src/base/bootstrap.js; read it)
```js
MU.part('hero', {
  init(root, MU) { /* build DOM/canvas, create ScrollTriggers, timelines. Runs after fonts load, in DOM order. */ },
  reveal(root, MU) { /* runs once when the preloader finishes (or immediately in previews) — first-screen intro */ }
});
```
- Lifecycle: DOMContentLoaded → Lenis created → fonts ready → for each `[data-part]` element in DOM order: its part's `init(root)`
  then declarative behaviors inside it → `ScrollTrigger.refresh()` → `MU.ready` / `'ready'` event → preloader releases →
  every part's `reveal()` + `'reveal'` event. Create ScrollTriggers **inside init** (DOM order matters for pin spacing).
- `MU.on('ready'|'reveal'|'navigate', fn)`, `MU.emit(evt, data)`, `MU.holdReveal()` (core preloader only).
- `MU.renderLoop(el, fn(timeSec, dtSec, frame))` → `{start, stop, running, destroy}` — runs on gsap.ticker **only while el is on screen and the tab is visible**. Use it for EVERY continuous canvas/WebGL/JS loop.
- `MU.onVisible(el, cb(isVisible))` — for pausing CSS/GSAP loops offscreen (e.g. `tl.pause()`/`tl.play()`), or add class `is-inview`.
- `MU.scrollTo(target, opts)` (Lenis-aware), `MU.lenis` (null when reduced motion), `MU.mm` (gsap.matchMedia), `MU.reduced`, `MU.isTouch`,
  `MU.isMobile` (≤ 768px), `MU.dpr(max)` (caps DPR: ≤2 desktop, ≤1.5 mobile), `MU.clamp/lerp/map/damp/rand`, `MU.fmt(n, dec)` (uz number format).
- GSAP defaults: `ease: 'mu.out'` (expo-like), duration 1. Custom eases: `mu.out`, `mu.inOut`, `mu.soft`.
- **Declarative behaviors** (work anywhere inside a part):
  - `data-reveal="up|down|left|right|fade|scale|zoom|blur|clip|wipe|flip"` (+ `data-delay`, `data-duration`);
    add `data-reveal-children` to stagger the element's children instead (`data-stagger`, default .09).
  - `data-split="lines|words|chars"` → masked SplitText reveal (+ `data-delay`). Don't put `.grad-text` (background-clip) inside
    `chars`/`words` splits — use `.accent-*` solid colors there; gradients are OK with `lines`.
  - `data-on="reveal"` on any reveal/split/count/scramble element → plays on the preloader reveal instead of on scroll (hero/first screen).
  - `data-count="2400000"` (+ `data-decimals data-prefix data-suffix data-duration data-delay`) → counts up on enter.
  - `data-scramble` (optional value = charset e.g. `"0123456789"`) → ScrambleText decode on enter. Great for mono labels/eyebrows.
  - `data-parallax="0.2"` → scrubbed Y parallax. Never combine with data-reveal on the same element (wrap instead).
  - `data-magnetic="0.35"` (+ child `data-magnetic-inner`) → magnetic hover (desktop only).
  - `data-tilt="8"` → 3D hover tilt, also sets `--mx/--my` (%) for glare; `data-spotlight` → sets `--mx/--my` (px) on pointermove.
  - `data-cursor="Koʻrish"` → the custom cursor grows and shows this label on hover (`data-cursor="drag"` shows a drag state). Core implements it.
- Lenis smooth scroll is on for desktop wheel; touch uses native scroll. `ScrollTrigger` works as usual (Lenis is wired in).
  Pins: use `pin: true` on the section root or an inner wrapper, `anticipatePin: 1`, `invalidateOnRefresh: true`, lengths via functions.
  Horizontal scroll: `containerAnimation` for nested triggers.

## 6. Engineering rules (hard requirements)
1. **Scope everything.** Root element carries `data-part` and the id from the table. All CSS selectors start with your root id
   or your part-prefixed class (e.g. `.hero-…`, `.trk-…`). No bare element selectors, no global class redefinitions, no `:root` edits.
   Your IDs/classes must not collide with other parts. Keyframe names prefixed (`@keyframes hero-orbit`).
2. **Edit only your own part folders.** Never touch `src/base/*`, `src/template.html`, `build.mjs`, `qa.mjs`, `SPEC.md` or other parts.
   If you need something shared, implement it locally inside your part and mention it in your report.
3. **Performance:** animate transform/opacity (and SVG attrs) — avoid animating layout, big blur filters, box-shadows on many nodes,
   or `backdrop-filter` on moving/large elements. Every infinite loop (rAF, gsap repeat:-1 timelines, CSS animations that matter) must
   pause offscreen (`MU.renderLoop`, `MU.onVisible`, ScrollTrigger `toggleActions`/`onToggle`). Canvas/WebGL: `MU.dpr()`, handle resize
   (ResizeObserver), halve particle counts on mobile, no more than one WebGL context per part (only the hero uses bloom),
   dispose nothing needed but never create renderers in a loop. Keep each part's JS reasonably sized (< ~60 KB excl. generated data).
4. **Responsive:** design for 1440×900 desktop and 390×844 mobile (also sane at 1280, 820 tablet). No horizontal page overflow
   (the QA script reports offenders). Unbounded headlines must fit at 390 px. Pinned/horizontal sections must work on touch
   (native scroll) — simplify or shorten on mobile via `MU.mm.add('(max-width: 768px)', …)` when needed. Hover effects only on `(hover:hover)`.
5. **Reduced motion:** if `MU.reduced`, skip heavy/looping motion and show final, readable states (the declarative behaviors already comply).
6. **Accessibility:** semantic HTML (section/h2/ul/button/label), `aria-hidden="true"` on decorative SVG/canvas, real `<button>` for
   actions, labels for inputs, visible focus, readable contrast (body text ≥ `--text-2` on ink). Only the hero has an `<h1>`.
7. **Zero console errors/warnings** in QA on desktop and mobile. No `alert()`. Forms never submit to a network (preventDefault + animated fake success).
8. Never rely on `window.scrollY` sampling in rAF when ScrollTrigger can do it; use `ScrollTrigger` callbacks / `MU.lenis.velocity` for velocity.

## 7. Workflow & verification (do this, iteratively)
```bash
cd /home/user/MeningFlaskSaytim/logistika
node build.mjs --only hero,ticker                      # → dist/preview-hero-ticker.html (only your parts)
node qa.mjs --file dist/preview-hero-ticker.html --out qa/B --vp desktop,mobile \
     --shots "hero@0,hero@0.5,hero@1,ticker@0" [--frames 0,700,1800] [--wait 1400]
```
Then **look at the PNGs with the Read tool** (they are real renders incl. WebGL via SwiftShader) and fix what you see.
- `name@p` scrolls so the part's top (or its pin-spacer's top) is at the viewport top, plus `p` × (height − viewport). Use several
  `p` values to inspect scroll-scrubbed / pinned choreography mid-way. `--frames` captures a filmstrip after the scroll (ms).
- For interactions (typing, clicking, hovering), write a small script in your `qa/<you>/` dir that imports helpers:
  `import { openPage, scrollTo, shoot } from '../../qa.mjs'` (paths relative to the script), e.g. `page.click`, `page.fill`, `page.mouse.move`.
- The report lists console errors, page errors, overflow offenders, ScrollTrigger/pin counts. Fix everything.
- SwiftShader WebGL is slow in headless; judge visuals, not FPS. Previews have no preloader, so `reveal()` runs immediately.
- Iterate until: zero errors on both viewports, no overflow, it looks stunning in screenshots at every scroll stage, text readable,
  layout tight at 390 px. Then stop and report.

## 8. Report (your final answer)
Return: parts built · the animation/interaction features implemented (bullet list) · anything you could not finish ·
known issues/risks for integration (pins, heavy loops, sizes) · QA result (errors per viewport = 0?).

---
## 9. Part briefs (the minimum — exceed them)

### A · 00-core + 99-footer
- **Preloader** (`.pl`, fixed, z preloader): ink bg; center an SVG **astrolabe** — concentric rings with tick marks and zodiac-like
  glyph marks drawing in (DrawSVG), rings counter-rotating, a rete/pointer sweeping; big counter `000 → 100` (Unbounded, tabular) and a
  mono status line cycling with ScrambleText: "Yulduzlar xaritasi yuklanmoqda…", "Koordinatalar aniqlanmoqda…", "Marshrutlar hisoblanmoqda…".
  At 100 the astrolabe collapses into a bright star point that flashes, then a cinematic exit (e.g. circular clip-path iris or split
  panels) reveals the page; call the release from `MU.holdReveal()` so the hero intro overlaps the exit. Total ≈ 2.6–3.2 s. Wait for
  `MU.on('ready')` before finishing. Take `holdReveal()` synchronously at script top level. Respect reduced motion (quick fade).
- **Global sky**: fixed full-screen canvas behind everything: ~220 stars (120 mobile) with twinkle and slight depth parallax; when the
  user scrolls fast, stars stretch into **warp streaks** proportional to `MU.lenis.velocity` (or ScrollTrigger velocity); occasional
  shooting star. Cheap 2D canvas, paused when tab hidden.
- **Custom cursor** (desktop/hover only): dot (mix-blend difference) + lagging ring (quickTo); grows over `a, button, [data-cursor]`;
  shows the `data-cursor` label in a pill; hides when leaving the window; hidden on touch. Native cursor stays for text inputs.
- **Nav** (fixed): logo = SVG 8-point girih star with rotating orbit ring + wordmark "ULUGʻBEK" + small "LOGISTICS"; links with rolling
  text hover and active-section indicator (pill that slides between links via ScrollTrigger + Flip/quickTo); CTA button; hides on
  scroll down / shows on scroll up; becomes glass after 40 px. **Mobile**: burger morph → fullscreen menu overlay revealed by a
  circular clip-path from the burger, big staggered links (Unbounded) with numbers, contact info, socials; closes on link click/Esc.
  Also a language pill "UZ" (static) is a nice touch.
- **Scroll progress**: thin gradient bar at top + a circular progress ring around a "back to top" button (bottom-right, appears after hero).
- **Grain**: subtle animated film grain overlay (SVG feTurbulence data-URI, opacity ≈ .05, pointer-events none).
- **Footer** (`99-footer`, `<footer id="footer" data-part="footer">`): giant "ULUGʻBEK" wordmark that assembles letter-by-letter with
  scroll scrub + gradient sweep; columns (Xizmatlar, Kompaniya, Aloqa), newsletter input with animated submit, socials (Telegram,
  Instagram, LinkedIn, YouTube inline SVG icons with hover fill), address/phone, a thin horizon line where a tiny **camel caravan**
  silhouette walks and morphs/transitions into a **truck convoy** (old → new Silk Road), "© 2026 Ulugʻbek Logistics · Konsept-demo",
  back-to-top.

### B · 10-hero + 15-ticker
- **Hero** (`<section id="bosh" data-part="hero">`, 100svh, min 680px, contains the only `<h1>`): full-bleed **Three.js scene**:
  dotted Earth (land dots from `world-atlas` land-110m computed at build time → compact data file; round soft point sprites via
  shader, colored turq→azure with subtle twinkle), dark ocean sphere with fresnel rim + additive **atmosphere glow**, a thin orbit
  ring with a tiny satellite, **3–4k-point starfield** with twinkle, glowing **route arcs** from Toshkent (41.31N 69.24E, gold marker
  + vertical light beam + pulsing rings) to hubs (Shanghai, Pekin, Moskva, Istanbul, Berlin, Rotterdam, Dubay, Mumbay, Olmaota,
  Tehron, Boku, London) with animated traveling light pulses; **UnrealBloom** on desktop. Central Asia faces the camera at start;
  slow auto-rotation, pointer parallax, drag-to-spin with inertia (desktop). Intro on `reveal()`: camera dolly-in, globe spins in,
  arcs draw one by one. Scroll-scrub through the hero: globe rotates/zooms, text lifts & blurs away.
  Overlay: eyebrow (scramble) "Toshkent · 2009-yildan · 47 davlat", H1 with char flip-in e.g. "Dunyoni / bogʻlaymiz" plus a
  **rotating slot word** line ("quruqlikda." / "relslarda." / "dengizda." / "osmonda.") cycling with vertical masked motion and color
  change, a lead paragraph (Ulugʻbek 1018 stars → we track every cargo), 2 CTAs (magnetic), a **live shipment glass card**
  (UL-2026-TAS-0718 · Shanghai → Toshkent · progress bar 68 % · ETA countdown ticking), mini stats row (count-up), scroll cue.
  Desktop: text left, globe right (large, partly off-canvas). Mobile: globe behind/above text with a legibility scrim; reduce dots/stars, no bloom.
- **Ticker** (`#ticker`): two crossing, slightly rotated infinite marquee bands (one warm-gradient solid with dark text, one glass
  with outline/filled alternating text): services "AVTO ✦ TEMIR YOʻL ✦ DENGIZ ✦ AVIA ✦ OMBOR ✦ BOJXONA" and cities
  "TOSHKENT ✦ SAMARQAND ✦ SHANGHAI ✦ ISTANBUL ✦ DUISBURG ✦ DUBAY ✦ MOSKVA ✦ BUXORO". Speed/direction and skew react to scroll
  velocity; the ✦ separators are small rotating SVG girih stars. Seamless loop, no gaps at any width.

### C · 20-heritage + 45-stats
- **Heritage** (`#meros`, 01 — Ulugʻbek merosi): pinned story (desktop ≈ +200 %, shorter on mobile). A canvas of ~1400 particles
  (700 mobile) that **morph with scroll**: random twinkling starfield → the **meridian arc of Ulugʻbek's observatory** (sextant arc with
  graduation ticks) → a **constellation network** of Silk-Road cities connected by lines with Toshkent at center → the brand's
  **8-point girih star**. Pointer repels particles. Text panels swap per phase with split/blur transitions:
  "1429-yil. Samarqand." / "Yulduzlar karvonlarga yoʻl koʻrsatgan." / "Har bir yuk — bitta yulduz." with short leads and a counter
  (1018 yulduz → 12 000+ mijoz). A phase indicator (I–III) and the year ticking 1429 → 2026. After the pin, a big statement paragraph
  whose words **light up progressively with scroll** (scrubbed color fill).
- **Stats** (`#raqamlar`, 05 — Raqamlarda): bento of big numbers with count-ups (47 davlat, 1 240 fura, 2,4 mln tonna, 99,3 %,
  12 000+, 36 ombor), a circular ring drawing to 99,3 %, bars of yearly volume (2019–2026) growing, an **odometer** of total
  kilometers with rolling digit strips that keeps ticking, a "bugun yetkazildi" live counter that increments with a flip. Drifting
  gradient orbs in the background; cards with spotlight hover.

### D · 30-services + 35-modes
- **Services** (`#xizmatlar`, 02 — Xizmatlar): 6 cards (3×2 desktop, 1 col mobile) — Avto, Temir yoʻl, Dengiz, Avia, Omborxona,
  Bojxona. Each: index, **custom animated line icon** (draws on reveal, then idle micro-loop: wheels spin, ship bobs, plane banks,
  train wheels/smoke, boxes stack, stamp stamps — only while in view), title, short text, 3 chips, "Batafsil →". Effects: data-tilt,
  glare/spotlight via --mx/--my, animated conic gradient border on hover (`@property --angle`), staggered 3D flip-in reveal.
- **Modes** (`#transport`, 03 — Transport turlari): pinned **horizontal scroll** of 4 full-viewport panels, each an **illustrated,
  living SVG/CSS scene** with parallax layers driven by `containerAnimation`: (1) Avto — night highway, Chimgan mountains, distant
  Registan domes/minarets, moving lane dashes, truck with spinning wheels & headlight cone, road sign "Samarqand 280 km";
  (2) Temir yoʻl — desert dunes, container train crossing, ghost camel caravan moving the opposite way (old vs new Silk Road);
  (3) Dengiz — container ship on layered animated waves, port cranes loading, lighthouse beam; (4) Avia — plane climbing through
  parallax clouds with contrails, blinking nav lights, stars. Each panel: big index, mode name, key metric counter, 3 facts, example
  route. Background hue shifts per panel. Progress bar + 4 labeled dots. Mobile: keep it working (horizontal pin via native scroll is
  OK) with stacked text-over-scene layout, or a vertical stack — must look great at 390 px.

### E · 40-route + 60-process
- **Route** (`#marshrut`, 04 — Yangi Ipak yoʻli): pinned (≈ +250 %). An **SVG map of Eurasia** generated at build time from
  `world-atlas` (d3-geo projection focused on Europe→China; land as dotted pattern or fine outline, Uzbekistan highlighted). The
  corridor path through the fact-sheet cities **draws with scroll** (DrawSVG), a vehicle icon follows it (MotionPath, autoRotate),
  the map "camera" pans/zooms to follow the vehicle and zooms out at the end, city nodes pop with ring pulses + labels
  ("1-kun · Shanghai" … "18-kun · Duisburg"), a faint gold dashed **historic caravan route** beneath. HUD glass panel: current leg,
  km counter 0 → 11 000, day counter 1 → 18, mode icon switching (poyezd → fura → parom → poyezd), progress bar. Mobile-friendly.
- **Process** (`#jarayon`, 08 — Qanday ishlaymiz): 5 steps (Ariza → Rejalashtirish → Yuklash → Yoʻlda nazorat → Yetkazish va hisobot).
  Desktop: sticky left column with a huge rolling step number (01…05) + circular progress; right column cards scroll by, the active
  one lights up (others dim), a vertical line fills with gradient, each step has an animated icon. Mobile: left timeline with nodes.

### F · 50-fleet + 65-calculator
- **Fleet** (`#park`, 06 — Aqlli park): pinned (≈ +200 %) **Three.js** scene: a 40ft shipping container (corrugated walls via
  canvas-generated texture/bump, brand wordmark decal, lapis/turq paint, dark reflective floor, soft studio lights). Scroll sequence:
  container rotates into 3/4 view → **doors swing open** → pallets/boxes slide out into an exploded, floating arrangement → IoT
  sensor nodes glow with **HTML callouts** projected from 3D (GPS · har 30 soniyada, Harorat +4 °C, Namlik 45 %, Elektron muhr ✓).
  Then fleet chips (1 240 fura · 320 refrijerator · 86 platforma · Euro-6). Pointer adds a subtle camera orbit. Mobile: simpler, shorter.
- **Calculator** (`#kalkulyator`, 09 — Narx kalkulyatori): glass panel. Inputs: Qayerdan / Qayerga (custom animated dropdowns, not
  ugly native selects), transport mode segmented control with a sliding indicator (Avto/Temir yoʻl/Dengiz/Avia), weight slider
  (100–40 000 kg) with floating value bubble, volume slider (m³), toggles (Sugʻurta, Bojxona, Harorat nazorati, Ekspress). Output:
  price with **rolling odometer digits** in $, ETA days, CO₂ kg with per-mode comparison bars animating, a mini route line with a moving
  vehicle icon, "Buyurtma berish" CTA (→ #aloqa), "*taxminiy narx" note. Plausible formula: distance table × mode rate × weight/volume
  factor + extras. Everything reacts with motion.

### G · 55-tracking + 75-reviews
- **Tracking** (`#kuzatuv`, 07 — Real vaqtda kuzatuv): big mono input with animated gradient border and a typewriter placeholder
  cycling the sample codes; sample chips. **When the section first enters the viewport it auto-demos** (types `UL-2026-TAS-0718` and
  submits) so viewers see the magic without clicking. Submit → laser-scan animation over a barcode + scrambling "Qidirilmoqda…" →
  result card (Flip): code (scramble), route, status badge, 5-stage stepper (Qabul qilindi → Omborda → Yoʻlda → Bojxona → Yetkazildi)
  filling sequentially with a vehicle gliding to the current stage, mini SVG map with the vehicle dot moving along a path and a pulsing
  marker ("Joriy joylashuv: Olmaota, Qozogʻiston"), live ETA countdown (kun:soat:daq:son), details grid (ogʻirlik, konteyner, harorat
  with a tiny live sparkline). Different sample codes produce different states. Invalid code → shake + friendly error.
- **Reviews** (`#mijozlar`, 11 — Mijozlar fikri): 3D stacked card carousel of 5 testimonials (invented people/companies) — front card
  with quote (word reveal), avatar initials in gradient rings, star rating fill; cards behind are offset/rotated; auto-advance with a
  progress line; drag/swipe to throw a card (Draggable + inertia) with rotation; prev/next buttons. Below: client wordmark marquee
  (invented SVG/typographic logos, grayscale → color on hover).

### H · 70-why + 80-contact
- **Why** (`#afzalliklar`, 10 — Nega aynan biz): bento grid (4 cols desktop, varied spans; 1 col mobile) of 6–7 tiles, each with a
  **live micro-animation** paused offscreen: 24/7 monitoring **radar sweep** with blips (big tile); Sugʻurta 100 % shield drawing
  + check; Bojxona 2 soatda stopwatch; Real-time GPS mini map with moving dots; Harorat nazorati −25…+25 °C gauge + snowflakes;
  Raqamli hujjatlar stacking with a "TASDIQLANDI" stamp; Yashil logistika (Euro-6, CO₂ −18 %) leaf growth. Grid-level spotlight
  border glow following the pointer (`data-spotlight`), subtle tilt, staggered reveal.
- **Contact** (`#aloqa`, 12 — Aloqa): giant closing headline (e.g. "Keyingi yuk — / bizdan.") with animated gradient fill; a
  **rotating circular text badge** ("BUYURTMA BERISH • 24/7 • ULUGʻBEK LOGISTICS •") around a magnetic arrow button; glass form
  (Ism, Telefon with +998 mask, Email, Yuk turi custom select, Qayerdan–Qayerga, Xabar) with floating labels, focus glow underline,
  validation shake; submit → button morphs to a loading ring → check mark, burst of small stars, a paper plane flies away, success
  message. Contact cards (phone, email, Telegram, address) with hover motion, stylized mini map of Tashkent with a pulsing pin in
  Mirzo Ulugʻbek tumani. Aurora gradient blobs drifting in the background.
