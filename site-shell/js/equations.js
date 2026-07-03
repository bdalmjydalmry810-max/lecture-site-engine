/** Typeset KaTeX in lecture content (block equations + inline $...$). */
export function initEquations(root) {
  if (!root || !window.katex) return;

  root.querySelectorAll('.equation-block__math').forEach(el => {
    const latex = el.textContent?.trim();
    if (!latex) return;
    try {
      window.katex.render(latex, el, {
        displayMode: el.dataset.katexDisplay !== 'false',
        throwOnError: false,
      });
    } catch { /* skip bad latex */ }
  });

  if (typeof window.renderMathInElement === 'function') {
    window.renderMathInElement(root, {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '$', right: '$', display: false },
      ],
      throwOnError: false,
    });
  }
}
