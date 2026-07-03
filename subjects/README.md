# Subjects

Content-only folders — one subject per directory inside a **year** folder.

```
subjects/
├── _template/          # Copy to create a new subject
├── year-1/             # First year courses (empty — add subjects here)
├── year-2/
├── year-3/
├── year-4/
└── year-5/
```

## Add a new subject

```bash
cp -r subjects/_template subjects/year-3/my-subject
# Edit guide-config.js, subject-brief.yaml, manifest.json settings
# Add lectures/par1.md, par2.md, …
npm run validate -- --subject year-3/my-subject
npm run build -- --subject year-3/my-subject
```

## Contributor rules

- Only add/edit `lectures/parN.md`
- Filename must match `parN.md` (e.g. `par1.md`, `par5-sec1.md`)
- Do not modify `parser/`, `renderer/`, or `site-shell/`
