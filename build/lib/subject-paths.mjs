import { existsSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ENGINE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

/** @param {string} filePath */
export function parseSubjectFromPath(filePath) {
  const norm = filePath.replace(/\\/g, '/');
  const m = norm.match(/subjects\/(year-[1-5])\/([^/]+)\//);
  if (m) return `${m[1]}/${m[2]}`;
  const m2 = norm.match(/^(year-[1-5])\/([^/]+)\//);
  if (m2) return `${m2[1]}/${m2[2]}`;
  return null;
}

/** @param {string[]} files */
export function subjectsFromChangedFiles(files) {
  const set = new Set();
  for (const f of files) {
    const s = parseSubjectFromPath(f);
    if (s && s !== 'year-1/_template' && !s.endsWith('/_template')) {
      const parts = s.split('/');
      if (parts[1] !== '_template') set.add(s);
    }
  }
  return [...set].sort();
}

/**
 * @param {string} subjectRel e.g. year-3/kotlin
 */
export function subjectDir(subjectRel) {
  return path.join(ENGINE_ROOT, 'subjects', subjectRel);
}

export function distDir(subjectRel) {
  return path.join(ENGINE_ROOT, 'dist', subjectRel);
}

export function subjectHasLectures(subjectRel) {
  const lectures = path.join(subjectDir(subjectRel), 'lectures');
  if (!existsSync(lectures)) return false;
  return true;
}

/** All subjects under year-1..year-5 that have lectures/ and at least one par*.md */
export async function listAllSubjectsWithLectures() {
  /** @type {string[]} */
  const found = [];
  for (let y = 1; y <= 5; y++) {
    const yearDir = path.join(ENGINE_ROOT, 'subjects', `year-${y}`);
    if (!existsSync(yearDir)) continue;
    const entries = await readdir(yearDir, { withFileTypes: true });
    for (const ent of entries) {
      if (!ent.isDirectory() || ent.name === '_template' || ent.name.startsWith('.')) continue;
      const rel = `year-${y}/${ent.name}`;
      const lecturesDir = path.join(yearDir, ent.name, 'lectures');
      if (!existsSync(lecturesDir)) continue;
      const files = await readdir(lecturesDir);
      if (files.some(f => /^par.+\.md$/i.test(f))) found.push(rel);
    }
  }
  return found.sort();
}

export { ENGINE_ROOT };
