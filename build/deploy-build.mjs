#!/usr/bin/env node
/**
 * CI deploy build: rebuild changed subjects + any subject missing from dist/.
 * Restores prior dist/ from cache when present.
 *
 * Usage:
 *   node build/detect-changed-subjects.mjs --range HEAD~1..HEAD | node build/deploy-build.mjs
 *   node build/deploy-build.mjs --all
 */
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import {
  distDir,
  listAllSubjectsWithLectures,
} from './lib/subject-paths.mjs';

const ENGINE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

async function readSubjectsFromStdin() {
  if (process.stdin.isTTY) return [];
  const chunks = [];
  for await (const c of process.stdin) chunks.push(c);
  const text = Buffer.concat(chunks).toString('utf8').trim();
  if (!text) return [];
  return text.split('\n').map(s => s.trim()).filter(Boolean);
}

function runBuild(subject) {
  console.log(`\n=== Building ${subject} ===`);
  const r = spawnSync('node', ['build/cli.mjs', '--subject', subject], {
    cwd: ENGINE_ROOT,
    stdio: 'inherit',
  });
  return r.status === 0;
}

function needsBuild(subject) {
  const out = distDir(subject);
  return !existsSync(path.join(out, 'index.html'));
}

async function main() {
  const allFlag = process.argv.includes('--all');
  let toBuild = new Set();

  if (allFlag) {
    for (const s of await listAllSubjectsWithLectures()) toBuild.add(s);
  } else {
    const changed = await readSubjectsFromStdin();
    for (const s of changed) toBuild.add(s);

    // Fill missing from dist (subjects with lectures but no built site)
    for (const s of await listAllSubjectsWithLectures()) {
      if (needsBuild(s)) toBuild.add(s);
    }
  }

  if (!toBuild.size) {
    console.log('No subjects to build.');
  } else {
    let failed = false;
    for (const subject of [...toBuild].sort()) {
      if (!runBuild(subject)) failed = true;
    }
    if (failed) {
      console.error('\n✗ Build failed.');
      process.exit(1);
    }
  }

  const idx = spawnSync('node', ['build/generate-dist-index.mjs'], {
    cwd: ENGINE_ROOT,
    stdio: 'inherit',
  });
  if (idx.status !== 0) process.exit(1);

  console.log('\n✓ Deploy build complete.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
