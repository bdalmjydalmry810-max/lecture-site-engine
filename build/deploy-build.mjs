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
  subjectHasBuildableLectures,
  subjectNeedsReviewBuild,
} from './lib/subject-paths.mjs';
import { readSubjectsFromStdin } from './lib/read-subjects-stdin.mjs';
import { scaffoldSubjects } from './lib/scaffold-subject.mjs';
import { syncSiteShellToAllDist } from './lib/sync-site-shell.mjs';

const ENGINE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function runBuild(subject) {
  console.log(`\n=== Building ${subject} ===`);
  const r = spawnSync('node', ['build/cli.mjs', '--subject', subject], {
    cwd: ENGINE_ROOT,
    stdio: 'inherit',
  });
  return r.status === 0;
}

async function needsBuild(subject) {
  const out = distDir(subject);
  // Stub pages from generate-dist-index only have index.html — not a real build.
  if (!existsSync(path.join(out, 'lectures', 'manifest.json'))) return true;
  return subjectNeedsReviewBuild(subject);
}

async function main() {
  await scaffoldSubjects();
  const allFlag = process.argv.includes('--all');
  let toBuild = new Set();

  if (allFlag) {
    for (const s of await listAllSubjectsWithLectures()) toBuild.add(s);
  } else {
    const changed = await readSubjectsFromStdin();
    for (const s of changed) {
      if (await subjectHasBuildableLectures(s)) toBuild.add(s);
      else console.log(`Skipping ${s} — no par*.md lectures yet`);
    }

    for (const s of await listAllSubjectsWithLectures()) {
      if (await needsBuild(s)) toBuild.add(s);
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

  const admin = spawnSync('node', ['build/generate-admin.mjs'], {
    cwd: ENGINE_ROOT,
    stdio: 'inherit',
    env: { ...process.env },
  });
  if (admin.status !== 0) process.exit(1);

  const idx = spawnSync('node', ['build/generate-dist-index.mjs'], {
    cwd: ENGINE_ROOT,
    stdio: 'inherit',
  });
  if (idx.status !== 0) process.exit(1);

  const contrib = spawnSync('node', ['build/generate-contrib-page.mjs'], {
    cwd: ENGINE_ROOT,
    stdio: 'inherit',
    env: { ...process.env },
  });
  if (contrib.status !== 0) process.exit(1);

  await syncSiteShellToAllDist();

  console.log('\n✓ Deploy build complete.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
