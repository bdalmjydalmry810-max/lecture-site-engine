#!/usr/bin/env node
/**
 * Generate dist/index.html — hub linking to all built subject sites.
 */
import { existsSync } from 'node:fs';
import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ENGINE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ENGINE_ROOT, 'dist');

/** @returns {Promise<{ rel: string, title: string, subtitle: string, year: string, academicYear: number }[]>} */
async function collectBuiltSubjects() {
  /** @type {Awaited<ReturnType<typeof collectBuiltSubjects>>} */
  const items = [];
  if (!existsSync(DIST)) return items;

  for (let y = 1; y <= 5; y++) {
    const yearDir = path.join(DIST, `year-${y}`);
    if (!existsSync(yearDir)) continue;
    const entries = await readdir(yearDir, { withFileTypes: true });
    for (const ent of entries) {
      if (!ent.isDirectory()) continue;
      const rel = `year-${y}/${ent.name}`;
      const indexPath = path.join(yearDir, ent.name, 'index.html');
      if (!existsSync(indexPath)) continue;

      let title = ent.name;
      let subtitle = '';
      let year = '';
      let academicYear = y;
      const manifestPath = path.join(yearDir, ent.name, 'lectures/manifest.json');
      if (existsSync(manifestPath)) {
        try {
          const m = JSON.parse(await readFile(manifestPath, 'utf8'));
          title = m.settings?.subjectName || m.title || title;
          subtitle = m.subtitle || '';
          year = m.settings?.year || '';
          academicYear = m.settings?.academicYear ?? y;
        } catch { /* ignore */ }
      }
      items.push({ rel, title, subtitle, year, academicYear });
    }
  }

  return items.sort((a, b) => a.rel.localeCompare(b.rel, 'ar'));
}

function renderHtml(subjects) {
  const byYear = {};
  for (const s of subjects) {
    const y = s.academicYear || Number(s.rel.match(/year-(\d)/)?.[1]) || 0;
    if (!byYear[y]) byYear[y] = [];
    byYear[y].push(s);
  }

  const yearSections = Object.keys(byYear).sort((a, b) => Number(a) - Number(b)).map(y => {
    const cards = byYear[y].map(s => `
      <a class="card" href="./${s.rel}/index.html">
        <span class="card__year">السنة ${y}</span>
        <span class="card__title">${escapeHtml(s.title)}</span>
        ${s.subtitle ? `<span class="card__sub">${escapeHtml(s.subtitle)}</span>` : ''}
        ${s.year ? `<span class="card__meta">${escapeHtml(s.year)}</span>` : ''}
      </a>`).join('\n');
    return `<section class="year-block"><h2>السنة ${y}</h2><div class="grid">${cards}</div></section>`;
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>دلائل الدراسة — Faculty Study Guides</title>
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; }
    body { font-family: 'IBM Plex Sans Arabic', sans-serif; margin: 0; padding: 2rem; background: #f8f6f2; color: #1a1a1a; }
    h1 { text-align: center; margin-bottom: 0.25rem; }
    .lead { text-align: center; color: #555; margin-bottom: 2rem; }
    .year-block { max-width: 960px; margin: 0 auto 2rem; }
    .year-block h2 { border-bottom: 2px solid #c9a227; padding-bottom: 0.5rem; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1rem; }
    .card { display: block; padding: 1.25rem; background: #fff; border-radius: 12px; text-decoration: none; color: inherit; border: 1px solid #e8e4dc; transition: box-shadow .2s, transform .2s; }
    .card:hover { box-shadow: 0 8px 24px rgba(0,0,0,.08); transform: translateY(-2px); }
    .card__year { font-size: 0.75rem; color: #888; display: block; }
    .card__title { font-size: 1.1rem; font-weight: 700; display: block; margin: 0.35rem 0; color: #5c3d8a; }
    .card__sub { font-size: 0.85rem; color: #666; display: block; }
    .card__meta { font-size: 0.75rem; color: #999; display: block; margin-top: 0.5rem; }
    .empty { text-align: center; color: #888; padding: 3rem; }
  </style>
</head>
<body>
  <h1>دلائل الدراسة التفاعلية</h1>
  <p class="lead">اختر المادة للبدء</p>
  ${subjects.length ? yearSections : '<p class="empty">لا توجد مواد منشورة بعد.</p>'}
</body>
</html>`;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function main() {
  await mkdir(DIST, { recursive: true });
  const subjects = await collectBuiltSubjects();
  const html = renderHtml(subjects);
  await writeFile(path.join(DIST, 'index.html'), html);
  console.log(`✓ dist/index.html (${subjects.length} subject(s))`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
