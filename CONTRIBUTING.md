# Contributing lecture content

## What you can change

Contributors should **only** edit files under:

```
subjects/year-{1-5}/{subject-id}/lectures/*.md
```

Optionally update `lectures/manifest.json` when adding a new `parN.md` file.

Do **not** modify `parser/`, `renderer/`, `site-shell/`, or `build/` unless you are a maintainer.

## Add or update a lecture

1. Copy `subjects/_template/` to `subjects/year-N/your-subject/` (maintainer may do this once).
2. Generate `custom_prompt.md` from `meta-prompt.md` + `subject-brief.yaml`.
3. Use AI to produce `lectures/parN.md` following `SCHEMA.md`.
4. Add an entry in `lectures/manifest.json` if it is a new file.
5. Open a Pull Request to `main`.

## CI on Pull Request

Workflow **Validate lectures** runs automatically:

- `npm test` — engine smoke test
- Validates every **changed subject** (`npm run validate`)

If validation fails, the PR check is red — **do not merge** until fixed.

## After merge

Workflow **Deploy GitHub Pages** runs on `main`:

- Restores previous `dist/` from cache
- Builds changed subjects and any subject missing from `dist/`
- Generates `dist/index.html` (hub page)
- Deploys to GitHub Pages

## Local commands

```bash
npm run validate -- --subject year-3/my-subject
npm run build -- --subject year-3/my-subject
cd dist/year-3/my-subject && python3 -m http.server 8080
```

## manifest.json settings

Each subject must have `lectures/manifest.json` with:

```json
"settings": {
  "subjectName": "اسم المادة",
  "subjectNameEn": "English name",
  "year": "2025-2026",
  "academicYear": 3,
  "theme": "amber-default",
  "department": "القسم"
}
```

Themes: see `themes/themes.json`.
