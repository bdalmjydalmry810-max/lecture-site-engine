# Build pipeline

| Script | Purpose |
| --- | --- |
| `validate.mjs` | SCHEMA checks + parser — line-level errors |
| `cli.mjs` | validate → parse → copy shell → `dist/` |

```bash
node build/validate.mjs --subject year-1/my-subject
node build/cli.mjs --subject year-1/my-subject
```
