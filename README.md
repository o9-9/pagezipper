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

See [PAGEZIPPER_FILES.md](PAGEZIPPER_FILES.md) for the detailed source tree.

## Folder Structure

```
PageZipper/
├── gulpfile.js
├── package.json
├── img/
│   └── (toolbar PNGs for bookmarklet CDN)
├── archives/
│   ├── root-bundle-duplicate/pagezipper.js
│   ├── unused-libs/LAB.min.js
│   ├── setup/setup.html
│   └── test/   (legacy Jasmine + HTML fixtures)
├── src/
│   ├── header.js
│   ├── pagezipper.js
│   ├── compat.js
│   ├── image.js
│   ├── menu.js
│   ├── nextlink.js
│   ├── next_url.js
│   ├── next_url_trials.js
│   ├── page_loader.js
│   ├── page_loader_ajax.js
│   ├── page_loader_iframe.js
│   ├── util.js
│   ├── loader_bookmarklet.js
│   ├── loader_chrome.js
│   ├── lib/
│   │   ├── jquery.js
│   │   ├── jstoolkit.js
│   │   └── levenshtein.js
│   ├── extension/
│   │   ├── manifest.json
│   │   ├── service_worker.js
│   │   └── icons/
│   └── options/
│       ├── options.html
│       ├── options.js
│       ├── options.css
│       ├── common.js
│       ├── _add_site.html
│       └── lib/
│           ├── angular.min.js
│           └── angular-route.min.js
└── dist/
    ├── pagezipper.js
    └── extension/
        ├── manifest.json
        ├── service_worker.js
        ├── pagezipper.js
        ├── options/
        └── icons/
```

## Summary

| Purpose              | Files                                                                                                       |
| -------------------- | ----------------------------------------------------------------------------------------------------------- |
| **Core**             | header.js, pagezipper.js, compat.js, image.js, menu.js, nextlink.js, next_url*.js, page_loader*.js, util.js |
| **Libs**             | jquery.js, jstoolkit.js, levenshtein.js                                                                     |
| **Bookmarklet**      | loader_bookmarklet.js → dist/pagezipper.js                                                                  |
| **Chrome Extension** | manifest.json, service_worker.js, loader_chrome.js, options/, icons/                                        |
| **Archives**         | Old root bundle, LAB.min.js, setup helper, legacy tests (see `archives/`)                                   |

## Deployment

- **Bookmarklet**: Host `dist/pagezipper.js` at `https://raw.githubusercontent.com/o9-9/pagezipper/refs/heads/main/pagezipper.js`
- **Extension**: Load unpacked from `dist/extension` in chrome://extensions
- **UI assets**: `https://raw.githubusercontent.com/o9-9/pagezipper/refs/heads/main/img/` (menu icons, etc.)
