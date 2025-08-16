# NVOID (nullvoid) — Website

Static, zero-build site with a black & white pixel/block theme.

## Structure
- `index.html` — home with intro, projects, team, contact
- `docs/sei-mcp.html` — docs page rendering README from GitHub for `sei-mcp`
- `assets/css/style.css` — theme styles
- `assets/js/main.js` — small UX scripts

## Run locally
```bash
# from the repo root
python3 -m http.server 8080
# open http://localhost:8080
```

## Add a new project
1. Duplicate `docs/sei-mcp.html` to `docs/<project>.html`.
2. Change the raw GitHub URL to the README of the project.
3. Add a new card in `index.html` under `#projects` linking to the new docs page.

## Notes
- Fonts: VT323 (pixel-ish mono) via Google Fonts.
- No build pipeline; deploy to any static host (GitHub Pages, Netlify, etc.).
