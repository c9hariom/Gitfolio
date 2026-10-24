# C9Hariom Portfolio

Single-page personal portfolio for Hariom Singh — Full Stack AI & Cyber Security Engineer. Plain HTML, CSS and JavaScript, deployed on GitHub Pages at [c9hariom.com](https://c9hariom.com/). There is **no build step and no runtime dependency install**.

## Stack

- `index.html` — semantic page structure, metadata, JSON-LD (`WebSite`, `ProfilePage`, `Person`)
- `styles.css` — responsive dark "cyber" visual system, tokens, motion and reduced-motion handling
- `script.js` — vanilla ES2015+ interactions; no libraries or CDNs
- `assets/` — locally hosted logos, responsive portrait, PWA icons, social card
- `CNAME` — custom domain for GitHub Pages

External runtime requests: Google Fonts (Space Grotesk 400/500/600, DM Mono 400/500) and Google Analytics 4 (`G-QWEMRJDGVD`). GA is intentionally loaded unconditionally; it is the largest third-party request (~180 KB) and should be revisited if privacy or performance requirements change.

## Features

- Short boot sequence (once per session, skipped on mobile, reduced motion and Save-Data)
- Mouse-reactive neural-network canvas with a 30 fps cap and mobile point reduction
- Decrypt/scramble headings, glitch hero text, typed terminal line that pauses offscreen
- 3D tilt cards, magnetic buttons, cursor reticle, HUD frame, scroll progress
- Animated SVG data links on the systems map and architecture diagram
- Security section with radar and an explicitly illustrative SOC event stream
- All motion respects `prefers-reduced-motion`; content remains visible without JavaScript
- Skip link, visible keyboard focus, `aria-current` navigation state, pausable ticker, 44px touch targets

## Responsive behaviour

Breakpoints are `900px` (tablet/mobile navigation and single-column grids) and `620px` (phone refinements). The mobile menu button appears at **900px and below**; it previously disappeared between 761–900px. Verify 899/900/901 when changing navigation.

## Visual assets

All brand marks are local. Names match the actual encoded format:

| File | Rendered size | Source |
|---|---|---|
| `assets/economist.webp` | 48–96px | 96×96 |
| `assets/pwc.webp` | 48–96px | 112×85 |
| `assets/nokia.webp` | 48–96px | 192×100 |
| `assets/hcltech.webp` | 48–96px | 96×96 |
| `assets/lilly.webp` | 15–52px | 104×104 |
| `assets/hariom-ai-lab-portrait-*.webp` | 245–350px | 500w / 900w responsive |
| `assets/hariom-ai-lab-portrait.jpg` | fallback | 744×1034 |
| `assets/og-card.jpg` | social preview | 1200×630 |

The portrait is served through `<picture>` with a WebP `srcset` and a JPEG fallback. Company marks identify professional/project context only and do not imply endorsement.

## Deploy

1. Push to the `main` branch of the repository behind `CNAME` (`c9hariom.com`).
2. **Settings → Pages → Deploy from a branch → main / root**.
3. Keep **Enforce HTTPS** enabled after DNS is configured.

To preview locally (serve rather than opening `file://` so MIME types match production):

```bash
python -m http.server 8080
# open http://localhost:8080
```

## Content checklist

Update these together when a role, date or link changes:

- Hero eyebrow, current-role card, timeline, brand strip, JSON-LD `worksFor`
- Contact email (`mailto:` in the nav pill, contact panel and JSON-LD) — currently `c9hariom@gmail.com`
- Blog, LinkedIn and GitHub URLs in the contact panel, `rel="me"` links and `sameAs`
- `og:description` / `meta description` (keep OG around 150–160 characters)
- Project rows: public case-study URLs are still needed. Until they exist the rows say "Details on request" and link to a prefilled email CTA.
- Sitemap image URLs if asset filenames change

`dateModified` and `<lastmod>` were removed rather than left stale; add them back only if they will be maintained on every release.

## Pre-release test pass

1. **Widths:** 320, 375, 620, 768, 899, 900, 901, 1024, 1440. No horizontal scroll; nav reachable at every width; floating blog orb does not cover the contact panel or footer.
2. **Keyboard:** skip link appears first; tab order is logical; Escape closes the mobile menu and returns focus; ticker pause works; nav links update the hash and focus target; focus rings visible.
3. **Reduced motion:** emulate `prefers-reduced-motion: reduce` and reload — no boot, no marquee/glitch/drift, typing shows a static phrase, canvas renders one frame.
4. **JavaScript disabled and JS blocked:** all sections visible, navigation usable, no permanently open boot overlay.
5. **Lighthouse:** accessibility, best practices and SEO at 100; performance roughly ≥85 mobile / ≥95 desktop given GA4.
6. **Assets:** no 404s; portrait served as WebP; logos under 2 KB each; renamed assets resolve in HTML, JSON-LD and sitemap.
7. **Browsers:** Chrome and Firefox desktop, Safari iOS (100svh, backdrop-filter, sticky nav, menu focus), iPad Safari at 768.
