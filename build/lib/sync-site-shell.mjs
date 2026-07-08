/**
 * Copy shared site assets into every built subject under dist/.
 * Preserves each subject's js/guide-config.js.
 */
import { cp, readFile, writeFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { ENGINE_ROOT } from './subject-paths.mjs';
import { patchSubjectIndexHtml, patchSubjectStoragePrefix } from './patch-subject-index.mjs';

async function listBuiltSubjects() {
  /** @type {string[]} */
  const found = [];
  const distRoot = path.join(ENGINE_ROOT, process.env.OUTPUT_DIR || 'dist');
  if (!existsSync(distRoot)) return found;

  for (let y = 1; y <= 5; y++) {
    const yearDir = path.join(distRoot, `year-${y}`);
    if (!existsSync(yearDir)) continue;
    const entries = await readdir(yearDir, { withFileTypes: true });
    for (const ent of entries) {
      if (!ent.isDirectory() || ent.name.startsWith('.')) continue;
      const rel = `year-${y}/${ent.name}`;
      const outDir = path.join(distRoot, rel);
      if (existsSync(path.join(outDir, 'index.html'))) found.push(rel);
    }
  }
  return found.sort();
}

/**
 * @param {string} subjectRel
 */
async function syncOne(subjectRel) {
  const outDir = path.join(ENGINE_ROOT, process.env.OUTPUT_DIR || 'dist', subjectRel);
  const guidePath = path.join(outDir, 'js/guide-config.js');
  const guideBackup = existsSync(guidePath)
    ? await readFile(guidePath, 'utf8')
    : null;

  await cp(path.join(ENGINE_ROOT, 'site-shell'), outDir, { recursive: true });
  await cp(path.join(ENGINE_ROOT, 'themes'), path.join(outDir, 'themes'), { recursive: true });
  await cp(
    path.join(ENGINE_ROOT, 'renderer'),
    path.join(outDir, 'engine/renderer'),
    { recursive: true },
  );

  if (guideBackup) await writeFile(guidePath, guideBackup);

  await patchSubjectIndexHtml(outDir, subjectRel);
  await patchSubjectStoragePrefix(outDir);
}

export async function syncSiteShellToAllDist() {
  const subjects = await listBuiltSubjects();
  if (!subjects.length) {
    console.log('No built subjects in dist/ — skip site-shell sync.');
    return;
  }
  for (const subject of subjects) {
    await syncOne(subject);
    console.log(`  synced site-shell → dist/${subject}`);
  }
  console.log(`✓ Site shell synced to ${subjects.length} subject(s).`);
}
