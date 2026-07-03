# Subject themes

Shared palette system for all lecture sites. Each subject picks a theme in `lectures/manifest.json` under `settings.theme`.

## How it works

1. **`tokens-base.css`** — semantic design tokens (`--color-primary`, spacing, typography). Loaded by every site.
2. **`{theme}.css`** — overrides only `--palette-*` source colors. Loaded via `<link id="siteTheme">`.
3. **`apply-theme.js`** — reads `manifest.settings` and swaps the theme link + updates titles/year in the DOM.

## Available themes

| ID | Name | Used by |
| --- | --- | --- |
| `amber-default` | Classic Amber | Generic / fallback |
| `kotlin-pink-blue` | Pink & Blue | Kotlin / Android |
| `software-purple` | Professional Purple | Software Engineering |
| `programming-blue-lavender` | Blue & Lavender | Programming Languages |
| `parallel-teal` | Teal Green | Parallel Programming |
| `gis-earth` | GIS Earth | Data Operations / GIS |

Full catalog: [`themes.json`](themes.json).

## Manifest settings

Add to `lectures/manifest.json`:

```json
{
  "settings": {
    "subjectName": "تطوير تطبيقات Android",
    "subjectNameEn": "Kotlin & Compose",
    "year": "2025-2026",
    "academicYear": 1,
    "theme": "kotlin-pink-blue",
    "department": "القسم العملي"
  },
  "title": "…",
  "subtitle": "…",
  "files": []
}
```

| Field | Purpose |
| --- | --- |
| `subjectName` | Arabic name — hero title, footer, browser tab |
| `subjectNameEn` | English name — appended in `<title>` |
| `year` | Academic year label — footer + browser tab (e.g. `2025-2026`) |
| `academicYear` | Faculty year level `1`–`5` — matches `subjects/year-N/` folder |
| `theme` | Theme id from `themes.json` |
| `department` | Optional section label (documentation only) |

## Wire a new subject site

In `index.html` `<head>`:

```html
<link rel="stylesheet" href="../lecture-site-engine/themes/tokens-base.css">
<link id="siteTheme" rel="stylesheet" href="../lecture-site-engine/themes/amber-default.css">
```

In footer (optional but recommended):

```html
© <span id="siteYear">2025-2026</span> — <span id="siteSubject">Subject</span> — المكتب الأكاديمي
```

In `js/app.js` after loading manifest:

```js
import { applySiteSettings } from '../../lecture-site-engine/themes/apply-theme.js';

const manifest = await loadManifest();
const siteMeta = applySiteSettings(manifest, { guideConfig: GUIDE_CONFIG });
```

## Add a new theme

1. Copy an existing palette file (e.g. `software-purple.css`).
2. Change `--palette-*` values only.
3. Register in `themes.json` with a unique `id`.
4. Set `"theme": "your-id"` in the subject manifest.
