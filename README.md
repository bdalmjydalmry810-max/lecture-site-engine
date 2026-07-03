# Lecture Site Engine

Token-efficient prompt pipeline for turning PDF lectures into interactive study-guide sites. Output is **marker-based Markdown** (not JSON) — compatible with existing site parsers in `kotlin/`, `software_eng/`, `data-operations/`, `programming_lang/`.

## Quick start

### 1. Choose or create a subject brief

Copy the master template:

```bash
cp subject-brief.template.yaml my-subject.yaml
```

Or start from an example in [`examples/`](examples/):

| File | Subject |
| --- | --- |
| `kotlin-android.yaml` | Android / Kotlin & Compose |
| `data-operations.yaml` | Systems Analysis & Design |
| `software-eng.yaml` | Software Engineering 2 |
| `programming-lang.yaml` | Programming Languages labs |
| `generic-cs.yaml` | Generic CS (OS, signals, etc.) |

Edit `enabled: true/false` for parts and blocks your subject needs.

### 2. Generate `custom_prompt.md` (one time per subject)

Send to Claude (attach all files in one message):

1. [`meta-prompt.md`](meta-prompt.md)
2. [`SCHEMA.md`](SCHEMA.md)
3. Your `my-subject.yaml` (or an example)
4. Relevant files from [`templates/`](templates/) for enabled parts/blocks

Prompt:

```
Generate custom_prompt.md for the attached subject brief.
Follow meta-prompt.md rules. Keep output under 120 lines.
```

Save the response as `custom_prompt.md` in your subject folder (e.g. `kotlin/custom_prompt.md`).

### 3. Extract each lecture (per PDF)

Send:

1. `custom_prompt.md`
2. The PDF lecture (or pasted text)

Save output as `lectures/parN.md`.

### 4. Deploy the site

Add the file to `lectures/manifest.json` and serve statically:

```bash
python3 -m http.server 8080
```

### 5. Theme & site metadata

Each subject declares theme and display name in `lectures/manifest.json`:

```json
"settings": {
  "subjectName": "تطوير تطبيقات Android",
  "subjectNameEn": "Kotlin & Compose",
  "year": "2025-2026",
  "theme": "kotlin-pink-blue"
}
```

See [`themes/README.md`](themes/README.md) for available palettes and wiring.

## Folder layout

```
lecture-site-engine/
├── subjects/                   # Content per year + subject (contributors edit here)
│   ├── _template/
│   ├── year-1/ … year-5/
├── site-shell/                 # Generic HTML/CSS/JS student UI
├── build/                      # validate.mjs + cli.mjs
├── dist/                       # Build output (gitignored)
├── parser/                     # MD → JSON
├── renderer/                   # JSON → HTML
├── themes/                     # Shared palettes + apply-theme.js
├── meta-prompt.md              # Meta-prompt → custom_prompt.md
├── SCHEMA.md                   # Fixed block markers
├── templates/                  # Compact snippets for prompts
└── examples/                   # Filled subject-brief YAMLs
```

## Build & validate

```bash
npm test
npm run validate -- --subject year-1/my-subject
npm run build -- --subject year-1/my-subject
cd dist/year-1/my-subject && python3 -m http.server 8080
```

## Pipeline

```
subject-brief.yaml  ──┐
SCHEMA.md           ──┼──► meta-prompt.md ──► custom_prompt.md
templates/          ──┘                              │
                                                     ▼
                                              PDF lecture
                                                     │
                                                     ▼
                                              lectures/parN.md
                                                     │
                                                     ▼
                                    parser/ → renderer/ → static site
```

## Parts reference (enable in brief)

| Key | Site parser type | Typical use |
| --- | --- | --- |
| `integration_map` | detail | Course roadmap table |
| `detail` | detail | Main explanation |
| `summary` | summary | Tables, glossary |
| `mcq` | mcq | Multiple choice |
| `debug` | debug | Fix buggy code |
| `exercise` | exercise | Fill gaps, code fix |
| `analysis_exercise` | exercise | Case studies (no code) |
| `interpreter_exercise` | exercise | Full interpreter labs |
| `theory` | theory | Exam essay questions |
| `cheat_sheet` | cheat | Quick reference |
| `qa_cards` | qa | Q&A flip cards |
| `reference_code` | reference | Full project code |
| `checklist` | summary | Self-review checklist |

## Blocks reference (enable in brief)

| Key | Use when |
| --- | --- |
| `code` | Real code snippets |
| `line_explain` | Line-by-line code explanation |
| `diagrams` | BPMN, flowchart, DFD + `diagram` YAML |
| `uml` | Use case, class, activity diagrams |
| `screen_description` | GIS / IDE screenshots (text only) |
| `structured_english` | Analysis pseudocode (not real code) |
| `fill_gaps` / `code_fix` | Exercise subtypes |
| `think_prompt` | Self-check questions |
| `callouts` | Exam tips, notes, lessons |

Full marker syntax: [`SCHEMA.md`](SCHEMA.md).

## Token tips (free Claude tier)

- Do **not** re-attach `SCHEMA.md` with every lecture — only `custom_prompt.md` + PDF.
- Keep `custom_prompt.md` under 120 lines (meta-prompt enforces this).
- If a lecture is cut off, ask for parts separately: "الجزء الأول والثاني فقط".
- Markdown markers use fewer tokens than JSON.

## Aligning with `guide-config.js`

Set in your brief:

- `lecture.unit_label` → must match parser split (`المختبر` vs `المحاضرة`)
- `lecture.split_regex` → same as `lectureSplit` in guide-config
- Part headings → must contain keywords in `partTypes` regex (e.g. `MCQ`, `تصحيح`, `تمارين`)

## CI / GitHub Pages

| Workflow | When | What |
| --- | --- | --- |
| [`.github/workflows/validate.yml`](.github/workflows/validate.yml) | Pull Request | Validate changed `subjects/…/lectures/*.md` — **merge blocked if red** (enable branch protection) |
| [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) | Push to `main` | Build → `dist/` → deploy one Pages site |

**Pages URLs:**
- Hub: `https://<user>.github.io/<repo>/`
- Subject: `https://<user>.github.io/<repo>/year-3/my-subject/`

**One-time GitHub setup:**
1. Settings → Pages → Source: **GitHub Actions**
2. Settings → Branches → `main` → require **Validate lectures** check before merge

See [CONTRIBUTING.md](CONTRIBUTING.md).

## Future work

- Decap CMS contributor UI (`admin/`)
- Wire remaining legacy sites to shared engine
