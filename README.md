# C9Hariom Futuristic Portfolio

Static, dependency-free portfolio designed for GitHub Pages.

## Visual update

The hero portrait uses the supplied enhanced studio image at `assets/hariom-ai-lab-portrait.png`. The page also includes animated employer/project logo nodes and company-context cards for The Economist Group, PwC, Nokia, HCLTech, Eli Lilly, PepsiCo and Planalytics.

## Futuristic / cyber layer

- Boot sequence (once per browser session, click or any key to skip; auto-hides if JS fails)
- Mouse-reactive neural-network background with travelling data packets
- Decrypt/scramble section headings, glitch hero text, typed terminal line
- 3D tilt + glare cards, magnetic buttons, cursor reticle, HUD frame, scroll progress
- Animated data links on the systems map and architecture diagram
- Security section (SOC/SIEM, vuln mgmt & AppSec, cloud & AI security) with radar and an illustrative SOC event stream
- All motion respects `prefers-reduced-motion`

## Files

- `index.html` — page structure and content
- `styles.css` — futuristic responsive visual system + animations
- `script.js` — particles, reveal animations and interaction
- `CNAME` — custom domain

## Deploy to GitHub Pages

### Option A — user site
Create a repository named:

`c9hariom.github.io`

Push all files to the repository root, then enable GitHub Pages from:

**Settings → Pages → Deploy from a branch → main / root**

### Option B — any repository
GitHub Pages can also publish a normal repository. Enable Pages from the repository settings and select the branch/folder.

## Custom domain

The included `CNAME` contains:

`c9hariom.com`

For an apex domain, point DNS to GitHub Pages' current published IP addresses using GitHub's official documentation. If you use `www`, point it to your GitHub Pages hostname with a CNAME.

After DNS propagation, enable **Enforce HTTPS** in GitHub Pages.

## Editing

The portfolio intentionally uses plain HTML/CSS/JS so it can be deployed without npm, React or a build step. This makes it fast and easy to maintain.

Update the content directly in `index.html`.

## Notes

The career/recognition content is based on the supplied professional material and public blog information available when this portfolio was generated. Project descriptions are intentionally high-level to avoid exposing confidential client details.


## Visual assets

`assets/hariom-ai-lab-portrait.png` is the portfolio portrait prepared for the AI-lab visual treatment.

The site also uses Simple Icons CDN assets for recognizable brand marks. If you prefer a fully self-contained site, download those SVGs into `assets/logos/` and replace the CDN URLs in `index.html`.
