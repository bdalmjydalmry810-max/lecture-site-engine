/** @param {string} name CSS custom property name (with or without leading --) */
export function cssVar(name) {
  const key = name.startsWith('--') ? name : `--${name}`;
  return getComputedStyle(document.documentElement).getPropertyValue(key).trim();
}

/** Colors for SVG diagram rendering — reads from tokens.css */
export function getDiagramColors() {
  const dark = document.documentElement.classList.contains('dark');
  return {
    nodeFill: cssVar(dark ? 'dm-elevated' : 'color-surface-container-low'),
    nodeStroke: cssVar(dark ? 'color-inverse-primary' : 'color-primary'),
    textFill: cssVar(dark ? 'dm-text' : 'color-on-surface'),
    edgeStroke: cssVar(dark ? 'color-secondary-accent' : 'color-secondary'),
    backStroke: cssVar(dark ? 'color-flow-backward-dark' : 'color-flow-backward'),
  };
}
