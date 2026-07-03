#!/usr/bin/env node
/**
 * Validate all subjects from stdin or CLI args.
 * Exit 1 on any error.
 *
 * Usage:
 *   node build/detect-changed-subjects.mjs --base origin/main | node build/validate-changed.mjs
 *   node build/validate-changed.mjs year-3/os year-1/foo
 */
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const ENGINE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

async function readSubjectsFromStdin() {
  if (process.stdin.isTTY) return [];
  const chunks = [];
  for await (const c of process.stdin) chunks.push(c);
  const text = Buffer.concat(chunks).toString('utf8').trim();
  if (!text) return [];
  return text.split('\n').map(s => s.trim()).filter(Boolean);
}

async function main() {
  const fromArgs = process.argv.slice(2).filter(a => !a.startsWith('-'));
  const subjects = fromArgs.length ? fromArgs : await readSubjectsFromStdin();

  if (!subjects.length) {
    console.log('No subject changes to validate.');
    process.exit(0);
  }

  let failed = false;
  for (const subject of subjects) {
    console.log(`\n=== Validating ${subject} ===`);
    const r = spawnSync('node', ['build/validate.mjs', '--subject', subject], {
      cwd: ENGINE_ROOT,
      stdio: 'inherit',
      encoding: 'utf8',
    });
    if (r.status !== 0) failed = true;
  }

  if (failed) {
    console.error('\n✗ Validation failed — fix errors before merge.');
    process.exit(1);
  }
  console.log('\n✓ All changed subjects validated.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
