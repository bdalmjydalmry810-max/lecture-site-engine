import { esc } from '../core/escape.js';
import { inlineMd } from '../core/inline-md.js';
import { ms } from '../core/icons.js';
import { renderBlocks } from '../blocks/index.js';

function diffBadgeClass(d) {
  if (d === 'سهل') return 'bg-primary/20 text-primary';
  if (d === 'صعب') return 'bg-error-container text-on-error-container';
  return 'bg-tertiary-fixed text-on-tertiary-fixed-variant';
}

export function renderMCQ(questions, partId) {
  let html = `<div class="mcq-progress sticky top-16 z-10 bg-surface-container-lowest dark:bg-[#10121f]/90 border border-outline-variant dark:border-[#1e40af] rounded-xl p-md mb-lg custom-shadow box-animate box-hover backdrop-blur-sm" data-part="${partId}">
    <div class="flex items-center gap-md mb-sm">
      ${ms('quiz', false, 'text-primary')}
      <span class="font-label-md text-on-surface-variant">تقدّم الاختبار: <strong class="text-primary mcq-score">0</strong> / ${questions.length}</span>
    </div>
    <div class="h-1.5 bg-surface-container-high rounded-full overflow-hidden">
      <div class="mcq-progress-fill h-full bg-primary rounded-full transition-all duration-300" style="width:0%"></div>
    </div>
  </div>
  <div class="space-y-lg">`;

  questions.forEach(q => {
    const cardId = `${partId}-q${q.num}`;
    html += `<article class="mcq-card bg-surface-container-lowest dark:bg-[#161b30] border border-outline-variant dark:border-[#1e40af] rounded-xl p-lg custom-shadow box-animate box-hover" id="${cardId}" data-correct="${q.correct}">
      <div class="flex items-center gap-md mb-md">
        <span class="px-sm py-xs bg-secondary-container text-on-secondary-container rounded-lg font-code-sm text-code-sm">س${q.num}</span>
        <span class="font-label-md px-sm py-xs rounded-full ${diffBadgeClass(q.difficulty)}">${esc(q.difficulty)}</span>
      </div>
      <p class="font-headline-sm text-headline-sm mb-lg">${inlineMd(q.question)}</p>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-md mcq-options">`;

    q.options.forEach(opt => {
      html += `<button type="button" class="mcq-opt w-full text-right p-md border border-outline-variant rounded-lg hover:bg-surface-variant hover:border-primary transition-all font-body-md flex items-center gap-md" data-key="${opt.key}" data-correct="${q.correct}">
        <span class="w-8 h-8 rounded-lg bg-secondary-fixed text-secondary flex items-center justify-center font-bold shrink-0">${opt.key.toUpperCase()}</span>
        <span class="opt-text flex-1">${inlineMd(opt.text)}</span>
      </button>`;
    });

    html += `</div>
      <div class="mcq-feedback mt-md font-label-md font-bold min-h-[1.4em]" aria-live="polite"></div>
      <div class="mcq-explain hidden mt-md p-md bg-primary/10 rounded-lg border-r-4 border-primary font-body-md">
        <strong class="text-primary">التعليل:</strong> ${inlineMd(q.explain)}
      </div>
    </article>`;
  });

  return html + '</div>';
}

export function renderDebug(questions, partId, ctx) {
  const codeCounterRef = ctx.codeCounterRef || { n: 0 };
  return questions.map(q => `
    <details class="accordion-card group bg-surface-container-lowest dark:bg-[#161b30] border border-outline-variant dark:border-[#1e40af] rounded-xl mb-md overflow-hidden custom-shadow box-animate box-hover">
      <summary class="flex items-center gap-md p-lg cursor-pointer list-none hover:bg-surface-container-high dark:hover:bg-[#1c2440] transition-colors">
        ${ms('bug_report', false, 'text-error')}
        <span class="acc-title flex-1 font-headline-sm text-headline-sm">${esc(q.title)}</span>
        ${ms('expand_more', false, 'text-on-surface-variant acc-chevron transition-transform shrink-0')}
      </summary>
      <div class="acc-body p-lg pt-0 border-t border-outline-variant prose-content">${renderBlocks(q.blocks, { ...ctx, partId, partType: 'debug', codeCounterRef })}</div>
    </details>`).join('');
}

export function renderExercise(questions, partId, ctx) {
  const codeCounterRef = ctx.codeCounterRef || { n: 0 };
  return questions.map((q, qi) => {
    const qId = q.id || `exercise-${qi + 1}`;
    return `
    <details id="${partId}-${qId}" class="accordion-card group bg-surface-container-lowest dark:bg-[#161b30] border border-outline-variant dark:border-[#1e40af] rounded-xl mb-md overflow-hidden custom-shadow box-animate box-hover scroll-mt-16" open>
      <summary class="flex items-center gap-md p-lg cursor-pointer list-none hover:bg-surface-container-high dark:hover:bg-[#1c2440] transition-colors">
        ${ms('terminal', false, 'text-secondary')}
        <span class="acc-title flex-1 font-headline-sm text-headline-sm">${esc(q.title)}</span>
        <span class="px-sm py-xs bg-tertiary-fixed text-on-tertiary-fixed-variant rounded-full font-label-md text-label-md shrink-0">مفسر</span>
        ${ms('expand_more', false, 'text-on-surface-variant acc-chevron transition-transform shrink-0')}
      </summary>
      <div class="acc-body p-lg pt-0 border-t border-outline-variant prose-content">${renderBlocks(q.blocks, { ...ctx, partId, partType: 'exercise', codeCounterRef })}</div>
    </details>`;
  }).join('');
}

function formatAnswer(text) {
  const lines = text.split('\n');
  let html = '';
  let inList = false;
  for (const line of lines) {
    const t = line.trim();
    const ul = t.match(/^[-*]\s+(.+)/);
    if (ul) {
      if (!inList) { html += '<ul class="list-disc mr-lg">'; inList = true; }
      html += `<li>${inlineMd(ul[1])}</li>`;
    } else {
      if (inList) { html += '</ul>'; inList = false; }
      if (t) html += `<p class="mb-sm">${inlineMd(t)}</p>`;
    }
  }
  if (inList) html += '</ul>';
  return html;
}

export function renderTheory(questions, partId) {
  return questions.map((q, qi) => {
    const qId = q.id || `theory-${qi + 1}`;
    return `
    <details id="${partId}-${qId}" class="accordion-card group bg-surface-container-lowest dark:bg-[#161b30] border border-outline-variant dark:border-[#1e40af] rounded-xl mb-md overflow-hidden custom-shadow box-animate box-hover scroll-mt-16">
      <summary class="flex items-center gap-md p-lg cursor-pointer list-none hover:bg-surface-container-high dark:hover:bg-[#1c2440] transition-colors">
        ${ms('edit_note', false, 'text-secondary')}
        <span class="acc-title flex-1 font-headline-sm text-headline-sm">${esc(q.title)}</span>
        ${ms('expand_more', false, 'text-on-surface-variant acc-chevron transition-transform shrink-0')}
      </summary>
      <div class="acc-body p-lg pt-0 border-t border-outline-variant">
        <div class="bg-primary-fixed/50 dark:bg-primary/10 border border-primary p-md rounded-xl">
          <div class="flex items-center gap-sm mb-sm font-label-md font-bold text-primary">${ms('checklist', false, 'text-primary')} نموذج الإجابة</div>
          <div class="prose-content font-body-md">${formatAnswer(q.answer)}</div>
        </div>
      </div>
    </details>`;
  }).join('');
}

function findSolutionSplitIndex(blocks) {
  return blocks.findIndex(b =>
    (b.type === 'h4' && /نموذج الحل/.test(b.text)) ||
    (b.type === 'paragraph' && /\*\*نموذج الحل/.test(b.text)) ||
    (b.type === 'h4' && /نموذج الحل:/.test(b.text)),
  );
}

export function renderTrace(questions, partId, ctx) {
  const codeCounterRef = ctx.codeCounterRef || { n: 0 };
  return questions.map((q, qi) => {
    const qId = q.id || `trace-${qi + 1}`;
    const splitIdx = findSolutionSplitIndex(q.blocks || []);
    const promptBlocks = splitIdx >= 0 ? q.blocks.slice(0, splitIdx) : q.blocks;
    const solutionBlocks = splitIdx >= 0 ? q.blocks.slice(splitIdx) : [];

    return `
    <details id="${partId}-${qId}" class="accordion-card trace-exercise group bg-surface-container-lowest dark:bg-[#161b30] border border-outline-variant dark:border-[#1e40af] rounded-xl mb-md overflow-hidden custom-shadow box-animate box-hover scroll-mt-16" open>
      <summary class="flex items-center gap-md p-lg cursor-pointer list-none hover:bg-surface-container-high dark:hover:bg-[#1c2440] transition-colors">
        ${ms('track_changes', false, 'text-secondary')}
        <span class="acc-title flex-1 font-headline-sm text-headline-sm">${esc(q.title)}</span>
        <span class="px-sm py-xs bg-secondary-container text-on-secondary-container rounded-full font-label-md text-label-md shrink-0">تتبع</span>
        ${ms('expand_more', false, 'text-on-surface-variant acc-chevron transition-transform shrink-0')}
      </summary>
      <div class="acc-body p-lg pt-0 border-t border-outline-variant">
        <div class="trace-prompt prose-content mb-md">${renderBlocks(promptBlocks, { ...ctx, partId, partType: 'trace', codeCounterRef })}</div>
        ${solutionBlocks.length ? `<details class="trace-solution-reveal border border-primary/30 rounded-xl overflow-hidden">
          <summary class="flex items-center gap-sm p-md cursor-pointer bg-primary/10 font-label-md font-bold text-primary list-none">
            ${ms('visibility', false, 'text-primary')} عرض نموذج الحل
          </summary>
          <div class="p-md prose-content border-t border-primary/20">${renderBlocks(solutionBlocks, { ...ctx, partId, partType: 'trace', codeCounterRef })}</div>
        </details>` : ''}
      </div>
    </details>`;
  }).join('');
}

export function renderDesign(questions, partId, ctx) {
  const codeCounterRef = ctx.codeCounterRef || { n: 0 };
  return questions.map((q, qi) => {
    const qId = q.id || `design-${qi + 1}`;
    const criteriaHtml = q.criteria?.length
      ? `<ul class="design-criteria list-none space-y-xs mb-lg">
          ${q.criteria.map(c => `<li class="flex items-start gap-sm font-body-md text-on-surface-variant">
            ${ms('check_box_outline_blank', false, 'text-primary shrink-0 text-sm')}
            <span>${inlineMd(c)}</span>
          </li>`).join('')}
        </ul>`
      : '';

    return `
    <details id="${partId}-${qId}" class="accordion-card design-exercise group bg-surface-container-lowest dark:bg-[#161b30] border border-outline-variant dark:border-[#1e40af] rounded-xl mb-md overflow-hidden custom-shadow box-animate box-hover scroll-mt-16">
      <summary class="flex items-center gap-md p-lg cursor-pointer list-none hover:bg-surface-container-high dark:hover:bg-[#1c2440] transition-colors">
        ${ms('architecture', false, 'text-secondary')}
        <span class="acc-title flex-1 font-headline-sm text-headline-sm">${esc(q.title)}</span>
        ${ms('expand_more', false, 'text-on-surface-variant acc-chevron transition-transform shrink-0')}
      </summary>
      <div class="acc-body p-lg pt-0 border-t border-outline-variant">
        ${q.required ? `<div class="design-required mb-lg p-md bg-surface-container-high rounded-xl border border-outline-variant">
          <div class="flex items-center gap-sm mb-sm font-label-md font-bold text-primary">${ms('assignment', false, 'text-primary')} المطلوب</div>
          <div class="font-body-md text-on-surface-variant">${inlineMd(q.required).replace(/\n/g, '<br>')}</div>
        </div>` : ''}
        ${criteriaHtml}
        <details class="design-answer-reveal border border-primary/30 rounded-xl overflow-hidden">
          <summary class="flex items-center gap-sm p-md cursor-pointer bg-primary/10 font-label-md font-bold text-primary list-none">
            ${ms('visibility', false, 'text-primary')} عرض نموذج الإجابة
          </summary>
          <div class="p-md prose-content border-t border-primary/20">${renderBlocks(q.blocks || [], { ...ctx, partId, partType: 'design', codeCounterRef })}</div>
        </details>
      </div>
    </details>`;
  }).join('');
}

/**
 * @param {Array<{ type: string, render: Function }>} [extraHandlers]
 */
export function createDefaultPartHandlers(extraHandlers = []) {
  return [
    ...extraHandlers,
    { type: 'mcq', render: (part, ctx) => renderMCQ(part.questions, ctx.partId) },
    { type: 'debug', render: (part, ctx) => renderDebug(part.questions, ctx.partId, ctx) },
    { type: 'exercise', render: (part, ctx) => renderExercise(part.questions, ctx.partId, ctx) },
    { type: 'theory', render: (part, ctx) => renderTheory(part.questions, ctx.partId) },
    { type: 'trace', render: (part, ctx) => renderTrace(part.questions, ctx.partId, ctx) },
    { type: 'design', render: (part, ctx) => renderDesign(part.questions, ctx.partId, ctx) },
  ];
}
