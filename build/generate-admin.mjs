#!/usr/bin/env node
/**
 * Generate dist/admin/ — GitHub Device Flow editor (no Decap CMS / OAuth proxy).
 */
import { existsSync } from 'node:fs';
import { readFile, writeFile, mkdir, cp } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { listAllSubjectDirs } from './lib/scaffold-subject.mjs';
import { ENGINE_ROOT } from './lib/subject-paths.mjs';

const REPO = process.env.GITHUB_REPOSITORY || 'Shahd-Abbara/lecture-site-engine';
const BRANCH = process.env.GITHUB_BRANCH || 'main';
const CLIENT_ID = process.env.GITHUB_OAUTH_CLIENT_ID || '';

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** @param {string} subjectRel */
async function subjectTitle(subjectRel) {
  const manifestPath = path.join(ENGINE_ROOT, 'subjects', subjectRel, 'lectures/manifest.json');
  if (existsSync(manifestPath)) {
    try {
      const m = JSON.parse(await readFile(manifestPath, 'utf8'));
      return m.settings?.subjectName || m.title || subjectRel;
    } catch { /* ignore */ }
  }
  return subjectRel;
}

async function main() {
  const subjectRels = (await listAllSubjectDirs()).filter(s =>
    existsSync(path.join(ENGINE_ROOT, 'subjects', s, 'lectures')),
  );

  const subjects = await Promise.all(subjectRels.map(async id => ({
    id,
    year: Number(id.match(/^year-(\d)/)?.[1] || 0),
    title: await subjectTitle(id),
    lecturePath: `subjects/${id}/lectures`,
  })));

  subjects.sort((a, b) => a.year - b.year || a.title.localeCompare(b.title, 'ar'));

  const config = { repo: REPO, branch: BRANCH, clientId: CLIENT_ID, subjects };
  const configJson = JSON.stringify(config).replace(/</g, '\\u003c');

  const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex">
  <title>إدارة المحاضرات</title>
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; }
    body { font-family: 'IBM Plex Sans Arabic', sans-serif; margin: 0; padding: 2rem 1.5rem; background: #f0f4f8; color: #1a1a1a; line-height: 1.6; }
    .wrap { max-width: 900px; margin: 0 auto; }
    h1 { font-size: 1.5rem; margin: 0 0 0.5rem; }
    .lead { color: #555; margin: 0 0 1.5rem; font-size: 0.95rem; }
    .back { display: inline-block; margin-bottom: 1rem; color: #1e5a8a; text-decoration: none; }
    .panel { background: #fff; border-radius: 12px; padding: 1.25rem 1.5rem; margin-bottom: 1rem; border: 1px solid #dde3ea; }
    .field { margin-bottom: 1rem; }
    .field label { display: block; font-weight: 600; margin-bottom: 0.35rem; font-size: 0.9rem; }
    .field select, .field input, .field textarea { width: 100%; padding: 0.6rem 0.75rem; border-radius: 8px; border: 1px solid #c5d0dc; font-family: inherit; font-size: 1rem; }
    .field textarea { min-height: 320px; font-family: ui-monospace, monospace; font-size: 0.85rem; line-height: 1.5; resize: vertical; }
    .row { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; }
    .btn { display: inline-block; padding: 0.55rem 1rem; border-radius: 8px; font-size: 0.9rem; border: 1px solid #c5d0dc; background: #e8eef4; color: #1a1a1a; cursor: pointer; font-family: inherit; }
    .btn:hover { background: #dce6f0; }
    .btn--primary { background: #2563eb; color: #fff; border-color: #2563eb; }
    .btn--primary:hover { background: #1d4ed8; }
    .btn--ghost { background: transparent; }
    .toolbar { display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center; margin-bottom: 1rem; }
    .status { font-size: 0.85rem; color: #444; margin-top: 0.75rem; word-break: break-word; }
    .status--error { color: #b00020; }
    .code-box { background: #f5f8fb; border-radius: 8px; padding: 1rem; margin: 1rem 0; text-align: center; }
    .code-box .code { font-size: 2rem; font-weight: 700; letter-spacing: 0.15em; font-family: monospace; color: #2563eb; }
    .setup { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 1rem; font-size: 0.9rem; margin-bottom: 1rem; }
    .setup code { background: #e0f2fe; padding: 0.1rem 0.35rem; border-radius: 4px; }
    .meta { font-size: 0.8rem; color: #666; font-family: monospace; margin-bottom: 0.5rem; }
    .user-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; font-size: 0.9rem; }
    .new-file { display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: end; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #dde3ea; }
    .new-file input { flex: 1; min-width: 140px; }
  </style>
</head>
<body>
  <div class="wrap">
    <a class="back" href="../">← الصفحة الرئيسية</a>
    <h1>⚙️ إدارة المحاضرات</h1>
    <p class="lead">تسجيل دخول GitHub → اختر المادة → عدّل المحاضرة → احفظ مباشرة على المستودع.</p>

    <div id="setup-missing" class="setup" hidden>
      <strong>إعداد مطلوب:</strong> أضف <code>GITHUB_OAUTH_CLIENT_ID</code> في GitHub → Settings → Secrets and variables → Actions.
      راجع <code>admin/README.md</code> لإنشاء OAuth App (Device Flow — بدون callback URL).
    </div>

    <div id="login-panel" class="panel" hidden>
      <p>سجّل الدخول عبر GitHub Device Flow — لا يحتاج خادم OAuth.</p>
      <button type="button" class="btn btn--primary" id="login-btn">تسجيل الدخول بـ GitHub</button>
      <div id="login-wait" hidden>
        <div class="code-box">
          <p>افتح الرابط وأدخل الرمز:</p>
          <p class="code" id="user-code">------</p>
          <p><a id="verify-link" href="#" target="_blank" rel="noopener">github.com/login/device</a></p>
        </div>
        <p>بانتظار الموافقة على الجهاز…</p>
      </div>
    </div>

    <div id="editor-panel" hidden>
      <div class="user-bar">
        <span>👤 <span id="user-label">—</span></span>
        <button type="button" class="btn btn--ghost" id="logout-btn">تسجيل الخروج</button>
      </div>

      <div class="panel">
        <div class="row">
          <div class="field">
            <label for="year-select">السنة</label>
            <select id="year-select"></select>
          </div>
          <div class="field">
            <label for="subject-select">المادة</label>
            <select id="subject-select"></select>
          </div>
          <div class="field">
            <label for="file-select">الملف</label>
            <select id="file-select"></select>
          </div>
        </div>

        <div class="field">
          <label for="commit-msg">رسالة الـ commit (اختياري)</label>
          <input type="text" id="commit-msg" placeholder="Update par5.md via admin">
        </div>

        <p class="meta" id="editor-meta"></p>
        <div class="field">
          <label for="editor-area">المحتوى</label>
          <textarea id="editor-area" spellcheck="false" dir="auto"></textarea>
        </div>

        <div class="toolbar">
          <button type="button" class="btn btn--primary" id="save-btn">💾 حفظ على GitHub</button>
        </div>

        <div class="new-file">
          <div class="field" style="margin:0;flex:1">
            <label for="new-filename">محاضرة جديدة</label>
            <input type="text" id="new-filename" placeholder="par6.md أو par6-sec1.md">
          </div>
          <button type="button" class="btn" id="create-btn">➕ إنشاء</button>
        </div>
      </div>
    </div>

    <p class="status" id="status"></p>
  </div>
  <script>window.__ADMIN_CONFIG__ = ${configJson};</script>
  <script src="./app.js"></script>
</body>
</html>`;

  const dest = path.join(ENGINE_ROOT, process.env.OUTPUT_DIR || 'dist', 'admin');
  const appSrc = path.join(ENGINE_ROOT, 'admin', 'app.js');
  await mkdir(dest, { recursive: true });
  await writeFile(path.join(dest, 'index.html'), html);
  await cp(appSrc, path.join(dest, 'app.js'));
  const cidNote = CLIENT_ID ? 'client ID set' : 'no client ID — login disabled until secret added';
  console.log(`✓ dist/admin/index.html + app.js (${subjects.length} subject(s), ${cidNote})`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
