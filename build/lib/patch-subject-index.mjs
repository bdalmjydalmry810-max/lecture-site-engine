/**
 * Inject <base href="…"> so relative assets work when the URL has no trailing slash
 * (e.g. /year-4/kotlin instead of /year-4/kotlin/).
 */
import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const BASE_TAG_RE = /<base\s[^>]*href=["'][^"']*["'][^>]*>\s*/i;
const STORAGE_PREFIX_RE = /data-storage-prefix="[^"]*"/;

/** @returns {string} e.g. "/" or "/lecture-site-engine/" */
export function resolveSiteBasePrefix() {
  const fromEnv = process.env.SITE_BASE?.trim();
  if (fromEnv) {
    const withSlash = fromEnv.startsWith('/') ? fromEnv : `/${fromEnv}`;
    return withSlash.endsWith('/') ? withSlash : `${withSlash}/`;
  }
  const repo = process.env.GITHUB_REPOSITORY?.split('/')[1];
  if (repo) return `/${repo}/`;
  return '/';
}

/** @param {string} subjectRel e.g. year-4/android-dev-fundamentals */
export function subjectDocumentBaseHref(subjectRel) {
  const prefix = resolveSiteBasePrefix();
  const rel = subjectRel.replace(/^\/+|\/+$/g, '');
  return `${prefix}${rel}/`;
}

/**
 * @param {string} outDir absolute path to built subject folder
 * @param {string} subjectRel relative path under dist/
 */
export async function patchSubjectIndexHtml(outDir, subjectRel) {
  const indexPath = path.join(outDir, 'index.html');
  if (!existsSync(indexPath)) return;

  const href = subjectDocumentBaseHref(subjectRel);
  const tag = `<base href="${href}">\n  `;
  let html = await readFile(indexPath, 'utf8');

  if (BASE_TAG_RE.test(html)) {
    html = html.replace(BASE_TAG_RE, tag);
  } else {
    html = html.replace(/<head>\s*\n/i, `<head>\n  ${tag}`);
  }

  await writeFile(indexPath, html);
}

/**
 * Align inline FOUC theme script with per-subject guide-config storagePrefix.
 * @param {string} outDir absolute path to built subject folder
 */
export async function patchSubjectStoragePrefix(outDir) {
  const guidePath = path.join(outDir, 'js/guide-config.js');
  const indexPath = path.join(outDir, 'index.html');
  if (!existsSync(guidePath) || !existsSync(indexPath)) return;

  const guideText = await readFile(guidePath, 'utf8');
  const match = guideText.match(/storagePrefix:\s*['"]([^'"]+)['"]/);
  const prefix = match?.[1] || 'study-guide';

  let html = await readFile(indexPath, 'utf8');
  if (STORAGE_PREFIX_RE.test(html)) {
    html = html.replace(STORAGE_PREFIX_RE, `data-storage-prefix="${prefix}"`);
  } else {
    html = html.replace(
      /<html([^>]*)>/i,
      `<html$1 data-storage-prefix="${prefix}">`,
    );
  }

  await writeFile(indexPath, html);
}
