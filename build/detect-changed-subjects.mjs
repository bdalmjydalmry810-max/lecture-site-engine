#!/usr/bin/env node
/**
 * List subject paths (year-N/id) touched in a git diff.
 *
 * Usage:
 *   node build/detect-changed-subjects.mjs --base origin/main
 *   node build/detect-changed-subjects.mjs --range HEAD~1..HEAD
 */
import { execSync } from 'node:child_process';
import { subjectsFromChangedFiles } from './lib/subject-paths.mjs';

function parseArgs(argv) {
  const args = { base: null, range: null };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--base' && argv[i + 1]) args.base = argv[++i];
    else if (argv[i] === '--range' && argv[i + 1]) args.range = argv[++i];
  }
  return args;
}

function gitChangedFiles(base, range) {
  let cmd;
  if (range) {
    cmd = `git diff --name-only ${range}`;
  } else if (base) {
    cmd = `git diff --name-only ${base}...HEAD`;
  } else {
    cmd = 'git diff --name-only HEAD~1..HEAD';
  }
  const out = execSync(cmd, { encoding: 'utf8' }).trim();
  return out ? out.split('\n').filter(Boolean) : [];
}

const args = parseArgs(process.argv);
const files = gitChangedFiles(args.base, args.range);
const subjects = subjectsFromChangedFiles(files);

if (process.env.DEBUG) {
  console.error('Changed files:', files);
  console.error('Subjects:', subjects);
}

for (const s of subjects) console.log(s);
