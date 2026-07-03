# Site shell

Generic student-facing UI copied into `dist/{year}/{subject}/` on build.

- `index.html` — layout, theme links, lecture grid + reader
- `css/` — styles + tailwind config
- `js/app.js` — loads pre-parsed `lectures/*.json`, uses `engine/renderer/`

Subject-specific `guide-config.js` is injected from `subjects/…/guide-config.js` at build time.

Themes live in `themes/` (copied to `dist/…/themes/`). Manifest `settings.theme` selects the palette.
