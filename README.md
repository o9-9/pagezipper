# PageZipper

Merges multi-page articles and galleries into one scrollable page.

- **Bookmarklet**: https://github.com/o9-9/pagezipper
- **Chrome Extension**: Load from `dist/extension` (Manifest V3)

## Build

```bash
npm install
npm run build
```

Output: `dist/pagezipper.js` (bookmarklet), `dist/extension/` (Chrome extension)

## Project layout

- **`src/`** — editable sources; **`dist/`** — Gulp output (gitignored unless you force-add).
- **`img/`** — toolbar/menu PNG assets for bookmarklet CDN URLs (`loader_bookmarklet.js`).
- **`bookmarklet.js`** — bookmarklet shim for deploying the bookmarklet loader.
- **`archives/`** — non-build artifacts kept for reference: duplicate root `pagezipper.js` bundle, unused `LAB.min.js`, legacy `setup/`, Jasmine tests and HTML fixtures (`test/`).