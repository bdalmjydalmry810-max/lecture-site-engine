# Subject template

Copy this folder to `subjects/year-{N}/{subject-id}/` when adding a new course.

## Required files

| File | Purpose |
| --- | --- |
| `guide-config.js` | Parser regexes, titles, storage prefix |
| `subject-brief.yaml` | Parts/blocks enabled (from `examples/`) |
| `custom_prompt.md` | AI extraction prompt (generate via meta-prompt) |
| `lectures/manifest.json` | Site index + **settings** (theme, name, year) |
| `lectures/parN.md` | Lecture content |

## manifest.json settings

```json
"settings": {
  "subjectName": "اسم المادة بالعربي",
  "subjectNameEn": "English name",
  "year": "2025-2026",
  "academicYear": 1,
  "theme": "amber-default",
  "department": "القسم"
}
```

Themes: see `themes/themes.json` (`kotlin-pink-blue`, `software-purple`, `gis-earth`, …).

## Build

```bash
npm run validate -- --subject year-1/my-subject
npm run build -- --subject year-1/my-subject
# Output: dist/year-1/my-subject/
```
