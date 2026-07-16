# LocalIntel

Static marketing/directory website for LocalIntel (Florida local business intelligence). Plain HTML/CSS/JS, deployed on Vercel (`vercel.json`, `framework: null` — no build step). The frontend calls a hosted backend at `https://gsb-swarm-production.up.railway.app` (the `gsb-swarm` service, which lives in a separate repo). Node scripts in the repo root generate the per-ZIP / per-neighborhood / per-business landing pages from that backend (with local `*Seed.json` fallbacks).

## Cursor Cloud specific instructions

- This repo has no application backend of its own; it is a static site. There is nothing to compile — "running the app" means serving the static files.
- Dev server: `npm run dev` serves the site at http://localhost:3000 using `serve`, with clean-URL routing configured in `serve.json` to mirror `vercel.json` (e.g. `/zip/32256` → `zip/32256.html`, `/neighborhood/:slug`, `/biz/:slug`). Serving with a plain server that lacks clean-URL rewrites will 404 on those pretty paths.
- Live data: the homepage and directory pages fetch live stats/results from the Railway backend (`https://gsb-swarm-production.up.railway.app`). Outbound HTTPS to that host is required for numbers/search results to populate; the static shell still renders without it.
- Page generators (`generate-zip-pages.js`, `generate-neighborhood-pages.js`, `generate-biz-pages.js`, `scripts/scaffold-zip.js`) are build-time tools that only use Node core modules (no npm deps). They fetch from the Railway backend and fall back to the committed `*Seed.json` files. Running them rewrites the committed generated HTML (e.g. all files under `zip/`, `neighborhood/`) — do not commit that regenerated output unless the page changes are the intent of your task.
- There is no test suite and no linter configured. The closest "lint" is `node --check <file>` on the JS files.
