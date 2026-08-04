---
name: animejs
description: >-
  Add or debug JavaScript-driven motion on this static portfolio site using anime.js v4 —
  staggered card entrances, scroll-triggered reveals, self-drawing SVG diagrams, motion-path
  "signal flow", spring physics, number count-ups, text-split reveals. Use this skill whenever
  building or tweaking animation/motion on works/ pages (page <script> blocks, app.js cards,
  SVG figures), or whenever anime.js, "make it animate", "scroll reveal", "draw the diagram",
  "stagger", "count up", "add motion", or "make it feel alive" come up — even if the user
  doesn't name the library. NOT for plain CSS hover/transition tweaks, After Effects / video
  animation, or non-motion edits (content, link paths, portfolioData entries, analytics). It
  encodes this site's load conventions, the IntersectionObserver trigger pattern (anime.onScroll
  silently fails here), the v4 API, and the reduced-motion / static-fallback rules so the
  animation works the first time.
---

# anime.js on this site

A local build of **anime.js v4** lives at `works/js/anime.min.js` (IIFE/global build,
exposes a global `anime`). Use it to add motion that plain CSS can't do well. This skill
captures how to use it correctly on this specific site — the conventions, the API, and
the gotchas we already hit and solved.

## First principle: only reach for anime.js where CSS struggles

A plain fade/slide/stagger entrance is squarely in CSS's comfort zone (`@keyframes` +
`animation-delay`). Doing those with anime.js adds no perceptual value and just ships JS.
Reserve anime.js for what CSS can't do cleanly:

| Use anime.js for | Why CSS falls short |
|---|---|
| Orchestrated multi-element timelines | `@keyframes` can't coordinate/overlap many elements |
| Scroll-linked reveals (cross-browser) | `animation-timeline: scroll()` is Chromium-only |
| **Self-drawing SVG** (line draw, morph) | stroke-draw is hacky; path `d` morph impossible |
| **Motion along an SVG path** (flowing pulses) | `offset-path` is limited and awkward |
| Spring / elastic / physics easing | CSS easing is fixed cubic-bezier |
| Per-element values from JS (cursor, data, index, grid) | CSS has no access to JS state |
| Animating non-CSS things (numbers, SVG `d`, attributes) | not animatable in CSS |
| Text split into chars/words then staggered | requires manual `<span>` wrapping |

If the request is "just fade the cards in," push back gently and consider CSS — that
lesson is from real feedback ("沒感覺") on this site.

## Load conventions (important — easy to get wrong)

- **Load per page, only where used.** anime.min.js is ~84KB; don't add it to pages that
  don't animate. Add it **before `app.js`**, using this site's path convention:
  - root pages (`works/x.html`): `<script src="js/anime.min.js"></script>`
  - `zh/` and `ja/` pages: `<script src="../js/anime.min.js"></script>`
- **Homepage card stagger** already lives in `app.js` → `animateCards()`, called at the
  end of `renderPortfolioCards()`. anime is loaded on the three `index.html` pages only.
- **Page-specific animations** (e.g. an SVG diagram on a case-study page) go in their own
  `<script>` block at the **bottom of that page**, after `app.js` — not in `app.js`,
  which is shared by every page.

## v4 API surface (this is v4, NOT v3)

v4 renamed things. Copying old v3 examples will break. On the global IIFE build:

- `anime.animate(targets, params)` — the entry point (v3 was `anime({...})`)
- `params.ease` — easing (v3 was `easing`). e.g. `'out(2)'`, `'inOutQuad'`, `'linear'`
- `anime.stagger(ms)` — staggered `delay`/values across multiple targets
- `anime.createTimeline({ autoplay })` → `tl.add(targets, params, position)`; instance
  has `.play()`, `.pause()`, `.seek(ms)`, `.restart()`. `seek(tl.duration)` applies the
  end state synchronously (handy for verification).
- `anime.svg.createDrawable(selector)` → returns drawables; animate their `draw`
  property from `'0 0'` (nothing) to `'0 1'` (fully drawn) to "draw" a stroke
- `anime.svg.createMotionPath('#path')` → `{ translateX, translateY, rotate }`; spread
  into `animate()` to move an element along that path
- `anime.createSpring({ stiffness, damping })` → a spring easing; pass as `ease`
  (omit `duration` — the spring defines its own timing)
- `anime.utils`, `anime.eases`, `anime.onScroll` exist too — but see the onScroll gotcha.

Confirm a method exists before relying on it:
`grep -c "createMotionPath" works/js/anime.min.js`.

## GOTCHA #1 — trigger with IntersectionObserver, NOT `anime.onScroll`

On this site `anime.onScroll(...)` as a timeline `autoplay` **silently no-ops** in real
browsers — no error, no playback (a scroll-draw diagram stayed blank; only the
non-onScroll loop animated). **Always trigger scroll-entry animations with a standard
`IntersectionObserver`** that calls `tl.play()`. IO also fires for elements already in
view on load, so there's no "must scroll one pixel" dead zone.

## GOTCHA #2 — author a static fallback; never let JS-off leave a blank

The diagram/figure markup must be **fully visible by default**. JS then hides the
animated bits and reveals them. So if anime is missing, JS errors, or the user prefers
reduced motion, the reader still sees the complete static content.

Rules:
- Things that **fade in** (fills, text, icons): default visible in markup; JS sets
  `opacity:0` only after setup succeeds, then animates to 1.
- Things that **draw** (strokes via `createDrawable`): the stroke is fully visible by
  default; `createDrawable` + animating `draw` from `'0 0'` handles the rest.
- Decorative motion (e.g. flowing pulses): default `opacity="0"` in markup, shown only
  when JS animates them — so no-JS simply omits them, content is unaffected.
- Wrap setup in `try/catch`; on error, restore (`el.style.opacity=''`,
  clear `strokeDasharray`/`strokeDashoffset`) so the static figure shows.
- Bail early (leaving the static figure) when:
  `typeof anime === 'undefined'`, the needed `anime.svg.*` method is absent, or
  `matchMedia('(prefers-reduced-motion: reduce)').matches`.

## Canonical template (copy, then adapt)

Page-specific `<script>` at the bottom of the page, after `app.js`:

```html
<script>
  /* <page> — <what it animates> (anime.js v4) */
  (function () {
    var svg = document.getElementById('my-figure');     // or any container
    if (!svg) return;
    // bail to static fallback if unsupported / reduced-motion
    if (typeof anime === 'undefined' || !anime.svg || !anime.svg.createDrawable) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    try {
      var drawEls = anime.svg.createDrawable('#my-figure .draw');
      // hide fade-in bits only AFTER setup succeeds
      svg.querySelectorAll('.box-fill, .fade').forEach(function (el) { el.style.opacity = 0; });

      var tl = anime.createTimeline({ autoplay: false });   // built paused
      tl.add(drawEls, { draw: ['0 0', '0 1'], ease: 'inOutQuad', duration: 600, delay: anime.stagger(120) })
        .add('#my-figure .box-fill', { opacity: [0, 1], duration: 350, delay: anime.stagger(120) }, 260)
        .add('#my-figure .fade',     { opacity: [0, 1], duration: 320, delay: anime.stagger(40) }, 520);

      // play once when scrolled into view (IntersectionObserver, NOT anime.onScroll)
      if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (entries) {
          entries.forEach(function (en) { if (en.isIntersecting) { tl.play(); io.disconnect(); } });
        }, { threshold: 0.25 });
        io.observe(svg);
      } else {
        tl.play();
      }
    } catch (e) {
      // restore complete static figure
      svg.querySelectorAll('.draw').forEach(function (el) { el.style.strokeDasharray = ''; el.style.strokeDashoffset = ''; });
      svg.querySelectorAll('.box-fill, .fade').forEach(function (el) { el.style.opacity = ''; });
      console.log('animation skipped, static fallback —', e);
    }
  })();
</script>
```

### Recipe: self-drawing SVG (separate stroke from fill)
Give each box **two** elements: a filled rect (`class="box-fill"`, no stroke, faded in)
behind a stroked rect (`class="draw"`, `fill="none"`, drawn). Drawing the outline and
fading the fill are independent, so the outline can "draw" while the fill materializes.
Connectors/arrows are `<line>`/`<path class="draw">`; text/icons are `class="fade"`.

### Recipe: motion-path flow (continuous, "alive")
Make the cable a `<path id="cable1" class="draw">`. Place pulse dots as
`<circle class="dot" cx="0" cy="0" opacity="0">`. Then:
```js
var mp = anime.svg.createMotionPath('#cable1');
document.querySelectorAll('.dot1').forEach(function (d) { d.style.opacity = 1; });
anime.animate('.dot1', { translateX: mp.translateX, translateY: mp.translateY,
                         ease: 'linear', duration: 1500, loop: true, delay: anime.stagger(750) });
```
A looping flow reads as "alive" far more than a one-shot scroll reveal — reach for it
when a static diagram feels flat. Start the loop on IO-enter (or a short `setTimeout`
after the build-in so cables draw first).

### Recipe: spring entrance
```js
anime.animate('.node', { opacity: [0, 1], scale: [.7, 1],
                         ease: anime.createSpring({ stiffness: 110, damping: 12 }),
                         delay: anime.stagger(110) });
```
For SVG `<g>` scale to grow from center, set `transform-box: fill-box; transform-origin: center` (CSS).

## GOTCHA #3 — verifying in Codex's preview

The headless preview here is a **zero-size viewport** (`window.innerHeight === 0`) with
**frozen `requestAnimationFrame`**. So scroll-linked, IntersectionObserver-triggered, and
rAF-driven motion **cannot be exercised** there, and screenshots of mid-animation hang.

What you CAN verify in-preview (and should):
- no console errors; the script reached setup (e.g. `.fade` opacity is `0`, `.draw` has a
  `stroke-dasharray` from `createDrawable`) → confirms the code armed without error
- API presence: `typeof anime`, `anime.svg.createDrawable`, `createMotionPath`, etc.
- timeline mechanics: build a throwaway `createTimeline({autoplay:false})`, `tl.seek(tl.duration)`,
  read back the end state synchronously
- layout/wording of the *final* state: force-reveal via DOM (set opacity 1, clear dashes),
  then check `getBBox()` for text overflow

The **actual motion must be confirmed in a real browser** (`http://localhost:8230/works/<page>.html`,
hard-refresh **Ctrl+F5**). Always tell the user this explicitly rather than claiming you saw it move.

## Live reference in this repo

`works/a_builder.html` — three-layer architecture diagram that draws itself on scroll
(`createDrawable` + IntersectionObserver, with icons + static fallback). Read its bottom
`<script>` and the `#arch-svg` markup for a working end-to-end example.

## Tone reminder

This is an interview-oriented portfolio (see the project's AGENTS.md / tone rules). Motion
should serve reading and demonstrate craft, not perform. Prefer one tasteful, content-meaningful
animation (e.g. a diagram that visualizes the actual system) over many flourishes.
