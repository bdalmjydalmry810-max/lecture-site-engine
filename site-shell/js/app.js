import { createRenderer } from '../engine/renderer/index.js';
import { initDiagrams, refreshDiagrams } from '../engine/renderer/diagram/diagram.js';
import { applySiteSettings } from '../themes/apply-theme.js';
import { GUIDE_CONFIG } from './guide-config.js';

const STORAGE_THEME = `${GUIDE_CONFIG.storagePrefix || 'study-guide'}-theme`;
const STORAGE_LAST_LECTURE = `${GUIDE_CONFIG.storagePrefix || 'study-guide'}-last-lecture`;

const {
  renderLecture,
  buildTocData,
  shortLectureTitle,
  initInteractivity,
  setRefContext,
  clearRefContext,
  PART_MAT_ICONS,
} = createRenderer({ config: GUIDE_CONFIG });

/** @type {{ manifest: object|null, items: Array }} */
const appState = { manifest: null, items: [] };
let currentLectureIndex = -1;
let siteTitle = GUIDE_CONFIG.defaultTitle || 'Study Guide';

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function initTheme() {
  const saved = localStorage.getItem(STORAGE_THEME);
  const dark = saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.classList.toggle('dark', dark);
  const icon = document.getElementById('themeIcon');
  if (icon) icon.textContent = dark ? 'light_mode' : 'dark_mode';
  document.getElementById('themeToggle')?.addEventListener('click', () => {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem(STORAGE_THEME, isDark ? 'dark' : 'light');
    if (icon) icon.textContent = isDark ? 'light_mode' : 'dark_mode';
    refreshDiagrams();
  });
}

function showView(name) {
  document.getElementById('homeView')?.classList.toggle('hidden', name !== 'home');
  document.getElementById('lectureView')?.classList.toggle('hidden', name !== 'lecture');
  document.getElementById('backToHomeBtn')?.classList.toggle('hidden', name === 'home');
}

async function loadManifest() {
  const res = await fetch('lectures/manifest.json');
  if (!res.ok) throw new Error('تعذّر تحميل manifest.json');
  return res.json();
}

async function loadLectureJson(path) {
  const res = await fetch(`lectures/${path}`);
  if (!res.ok) throw new Error(`تعذّر تحميل ${path}`);
  return res.json();
}

function renderHomeGrid() {
  const grid = document.getElementById('lectureGrid');
  if (!grid) return;
  grid.innerHTML = appState.items.map((item, i) => {
    const title = shortLectureTitle(item.lec.title);
    return `
      <button type="button" class="lecture-card group text-right" data-idx="${i}">
        <span class="lecture-card__icon" aria-hidden="true">${esc(item.icon)}</span>
        <span class="lecture-card__title">${esc(title)}</span>
        <span class="lecture-card__badge">${esc(item.lec.tag || '')}</span>
      </button>`;
  }).join('');

  grid.querySelectorAll('[data-idx]').forEach(btn => {
    btn.addEventListener('click', () => {
      loadLectureView(Number(btn.dataset.idx));
    });
  });
}

function renderSidebarToc(item) {
  const nav = document.getElementById('sidebarToc');
  if (!nav || !item.toc) return;
  nav.innerHTML = item.toc.parts.map(part => `
    <div class="toc-part mb-md">
      <a href="#${esc(part.id)}" class="toc-part__title block px-lg py-sm font-label-md text-primary hover:bg-surface-variant">${esc(part.title)}</a>
      ${(part.sections || []).map(s => `
        <a href="#${esc(s.id)}" class="toc-section block px-xl py-xs font-label-sm text-on-surface-variant hover:text-primary">${esc(s.text)}</a>
      `).join('')}
    </div>
  `).join('');
}

function loadLectureView(idx, hashPart) {
  const item = appState.items[idx];
  if (!item) return;
  currentLectureIndex = idx;
  localStorage.setItem(STORAGE_LAST_LECTURE, String(idx));

  document.getElementById('sidebarCourseTitle').textContent = shortLectureTitle(item.lec.title);
  document.getElementById('sidebarCourseSub').textContent = item.lec.tag || '';
  document.getElementById('sidebarMatIcon').textContent = item.matIcon || 'school';

  setRefContext({ lectureRef: item.lec.id, sectionMap: item.sectionIndex || {} });
  const html = renderLecture(item.lec, 'primary', item.icon, item.sectionIndex);
  clearRefContext();

  document.getElementById('content').innerHTML = html;
  renderSidebarToc(item);
  showView('lecture');
  initInteractivity(document.getElementById('content'));
  initDiagrams(document.getElementById('content'));
  if (window.hljs) document.querySelectorAll('pre code').forEach(el => hljs.highlightElement(el));

  const hash = hashPart || item.lec.id;
  if (location.hash !== `#${hash}`) location.hash = hash;
}

function initJumpQuiz() {
  document.getElementById('jumpQuizBtn')?.addEventListener('click', () => {
    const item = appState.items[currentLectureIndex];
    if (!item) return;
    const quiz = item.toc?.parts?.find(p => /mcq|اختبار/i.test(p.title));
    if (quiz) location.hash = quiz.id;
    else document.getElementById('content')?.querySelector('.mcq-part')?.scrollIntoView({ behavior: 'smooth' });
  });
}

function initScrollFab() {
  const fab = document.getElementById('scrollTopFab');
  if (!fab) return;
  window.addEventListener('scroll', () => {
    const show = window.scrollY > 400;
    fab.classList.toggle('opacity-0', !show);
    fab.classList.toggle('pointer-events-none', !show);
  });
  fab.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

function getLectureIndexFromHash(hash) {
  if (!hash || hash === 'home') return -1;
  return appState.items.findIndex(it => it.lec.id === hash || hash.startsWith(`${it.lec.id}-`));
}

function resolveRoute() {
  const hash = location.hash.replace('#', '');
  const idx = getLectureIndexFromHash(hash);
  if (idx >= 0) loadLectureView(idx, hash);
  else showView('home');
}

async function init() {
  initTheme();
  initInteractivity();
  initScrollFab();
  initJumpQuiz();
  document.getElementById('backToHomeBtn')?.addEventListener('click', () => { location.hash = 'home'; });
  document.getElementById('brandBtn')?.addEventListener('click', () => { location.hash = 'home'; });
  window.addEventListener('hashchange', resolveRoute);

  try {
    const manifest = await loadManifest();
    appState.manifest = manifest;

    applySiteSettings(manifest, { guideConfig: GUIDE_CONFIG, basePath: 'themes/' });
    siteTitle = manifest.settings?.subjectName || manifest.title || GUIDE_CONFIG.defaultTitle;

    const defaultIcons = manifest.lectureIcons || ['📌'];
    const defaultMatIcons = manifest.lectureMatIcons || ['school'];
    const files = manifest.files || [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const doc = await loadLectureJson(file.path);
      const lec = doc.lectures?.[0];
      if (!lec) continue;
      lec.id = lec.id || `lec${appState.items.length + 1}`;
      appState.items.push({
        lec,
        icon: file.icon || defaultIcons[i] || '📌',
        matIcon: file.matIcon || defaultMatIcons[i] || 'school',
        sectionIndex: doc.sectionIndex || {},
        toc: buildTocData([lec])[0],
      });
    }

    if (!appState.items.length) {
      document.getElementById('lectureGrid').innerHTML =
        '<p class="text-center text-on-surface-variant col-span-full py-xl">لا توجد محاضرات بعد.</p>';
    } else {
      renderHomeGrid();
    }

    resolveRoute();
  } catch (err) {
    document.getElementById('lectureGrid').innerHTML = `
      <div class="col-span-full text-center py-xl text-on-surface-variant">
        <p class="text-error mb-md">⚠️ ${esc(err.message)}</p>
        <p class="font-label-md">شغّل من مجلد dist بعد البناء: <code class="bg-surface-container-high px-sm py-xs rounded">python3 -m http.server 8080</code></p>
      </div>`;
    console.error(err);
  }
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
