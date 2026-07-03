/** @typedef {{ id: string, label: string, kind: string, level: number, column?: number, lane?: string }} DiagramNode */
/** @typedef {{ from: string, to: string, label?: string, flow?: 'forward'|'backward'|'both' }} DiagramEdge */
/** @typedef {{ type: string, title: string, direction: string, nodes: DiagramNode[], edges: DiagramEdge[] }} DiagramData */

import { getDiagramColors } from './theme-colors.js'; // engine-local — no kotlin dependency

const KIND_SIZE = {
  event: { w: 88, h: 44, maxW: 120 },
  task: { w: 148, h: 52, maxW: 188 },
  process: { w: 148, h: 52, maxW: 200 },
  gateway: { w: 72, h: 72, maxW: 88 },
  decision: { w: 72, h: 72, maxW: 88 },
  outcome: { w: 132, h: 48, maxW: 168 },
  data: { w: 120, h: 44, maxW: 168 },
  external: { w: 132, h: 52, maxW: 220 },
  pool: { w: 200, h: 120, maxW: 260 },
  lane: { w: 180, h: 100, maxW: 220 },
  /** UML — Use Case */
  actor: { w: 72, h: 96, maxW: 88 },
  usecase: { w: 168, h: 56, maxW: 220 },
  /** UML — Class Diagram */
  class: { w: 168, h: 80, maxW: 240 },
  /** UML — Activity (alias for gateway/event in prompts) */
  activity: { w: 148, h: 52, maxW: 188 },
};

const MIN_LEVEL_GAP = 120;
const NODE_PAD = 28;
const LANE_SPACING = 14;
const EDGE_STUB = 16;
const LABEL_CHAR_W = 6.8;
const LABEL_LINE_H = 14;
const LABEL_PAD_X = 24;
const LABEL_PAD_Y = 18;

function parseVal(raw) {
  const v = raw.trim();
  if (/^-?\d+$/.test(v)) return Number(v);
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    return v.slice(1, -1);
  }
  return v;
}

/** Parse `key: val, key2: val2` from a single-line list item. */
function parseInlineKvPairs(text) {
  /** @type {Record<string, unknown>} */
  const obj = {};
  for (const part of String(text).split(/,\s*(?=[\w-]+:)/)) {
    const kv = part.trim().match(/^([\w-]+):\s*(.*)$/);
    if (kv) obj[kv[1]] = parseVal(kv[2].trim());
  }
  return obj;
}

/** Parse `{ key: val, ... }` items inside `[ ... ]` diagram blocks (prompt JSON-style). */
function parseJsonLikeObjects(arrayBody) {
  /** @type {Record<string, unknown>[]} */
  const items = [];
  const objRe = /\{([^{}]+)\}/g;
  let m;
  while ((m = objRe.exec(arrayBody)) !== null) {
    /** @type {Record<string, unknown>} */
    const obj = {};
    for (const part of m[1].split(',')) {
      const kv = part.trim().match(/^([\w-]+)\s*:\s*(.+)$/);
      if (kv) obj[kv[1]] = parseVal(kv[2].trim());
    }
    if (Object.keys(obj).length) items.push(obj);
  }
  return items;
}

function extractInlineArray(text, key) {
  const re = new RegExp(`^${key}:\\s*\\[`, 'm');
  const startMatch = text.match(re);
  if (!startMatch || startMatch.index === undefined) return null;

  const openIdx = text.indexOf('[', startMatch.index);
  let depth = 0;
  for (let i = openIdx; i < text.length; i++) {
    if (text[i] === '[') depth++;
    else if (text[i] === ']') {
      depth--;
      if (depth === 0) {
        const body = text.slice(openIdx + 1, i);
        return { body, full: text.slice(startMatch.index, i + 1) };
      }
    }
  }
  return null;
}

function normalizeDiagramNodes(nodes) {
  nodes.forEach((n, i) => {
    if (n.level === undefined || n.level === null || Number.isNaN(Number(n.level))) {
      n.level = i;
    } else {
      n.level = Number(n.level);
    }
    if (n.column !== undefined && n.column !== null) n.column = Number(n.column);
    if (!n.kind) n.kind = 'task';
    if (!n.id) n.id = `node_${i}`;
    if (!n.label) n.label = n.id;
  });
}

/** Minimal YAML parser for diagram blocks from the lecture prompt. */
export function parseDiagramYaml(text) {
  /** @type {DiagramData} */
  const result = { type: 'flowchart', title: '', direction: 'TD', nodes: [], edges: [] };

  let body = text;
  for (const key of ['nodes', 'edges']) {
    const extracted = extractInlineArray(body, key);
    if (extracted) {
      const items = parseJsonLikeObjects(extracted.body);
      if (key === 'nodes') result.nodes = /** @type {DiagramNode[]} */ (items);
      else result.edges = /** @type {DiagramEdge[]} */ (items);
      body = body.replace(extracted.full, `${key}: __inline__`);
    }
  }

  /** @type {'nodes'|'edges'|null} */
  let section = null;
  /** @type {Record<string, unknown>|null} */
  let current = null;

  for (const raw of body.split('\n')) {
    const line = raw.replace(/\t/g, '  ');
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const top = trimmed.match(/^([a-zA-Z][\w-]*):\s*(.*)$/);
    if (top && !line.startsWith(' ') && !line.startsWith('\t')) {
      const [, key, val] = top;
      if (key === 'nodes' || key === 'edges') {
        if (val === '__inline__') {
          section = null;
          current = null;
          continue;
        }
        section = key;
        current = null;
        continue;
      }
      section = null;
      current = null;
      if (val !== '__inline__') result[key] = parseVal(val);
      continue;
    }

    if (/^-\s+/.test(trimmed)) {
      current = {};
      if (section === 'nodes') result.nodes.push(/** @type {DiagramNode} */ (current));
      else if (section === 'edges') result.edges.push(/** @type {DiagramEdge} */ (current));
      const inline = trimmed.replace(/^-\s+/, '');
      Object.assign(current, parseInlineKvPairs(inline));
      continue;
    }

    const kv = trimmed.match(/^([\w-]+):\s*(.*)$/);
    if (kv && current) {
      current[kv[1]] = parseVal(kv[2]);
    }
  }

  normalizeDiagramNodes(result.nodes);
  inferEdgeFlow(result);
  assignColumns(result);

  return result;
}

/** Place nodes in vertical columns when `column` is not set (e.g. pyramid diagrams). */
function assignColumns(data) {
  const hasExplicitColumn = data.nodes.some(
    n => n.column !== undefined && n.column !== null && !Number.isNaN(n.column),
  );
  if (hasExplicitColumn) return;

  if (!data.edges.length) {
    const byLevel = groupByLevel(data.nodes);
    for (const [, group] of byLevel) {
      group.forEach((node, idx) => { node.column = idx; });
    }
    return;
  }

  const byId = new Map(data.nodes.map(n => [n.id, n]));
  const children = new Map();
  const parentCount = new Map();

  for (const e of data.edges) {
    const from = byId.get(e.from);
    const to = byId.get(e.to);
    const flow = e.flow || 'forward';
    if (flow === 'backward' || (from && to && to.level < from.level)) continue;

    if (!children.has(e.from)) children.set(e.from, []);
    children.get(e.from).push(e.to);
    parentCount.set(e.to, (parentCount.get(e.to) || 0) + 1);
  }

  const minLevel = Math.min(...data.nodes.map(n => n.level));
  const nodeOrder = new Map(data.nodes.map((n, i) => [n.id, i]));
  const roots = data.nodes
    .filter(n => n.level === minLevel && !parentCount.has(n.id))
    .sort((a, b) => (nodeOrder.get(a.id) ?? 0) - (nodeOrder.get(b.id) ?? 0));

  if (!roots.length) {
    data.nodes.filter(n => n.level === minLevel).forEach((n, i) => { n.column = i; });
    return;
  }

  roots.forEach((root, colIdx) => {
    const queue = [root.id];
    const seen = new Set();
    while (queue.length) {
      const id = queue.shift();
      if (seen.has(id)) continue;
      seen.add(id);
      const node = data.nodes.find(n => n.id === id);
      if (node) node.column = colIdx;
      for (const child of children.get(id) || []) queue.push(child);
    }
  });

  data.nodes.forEach((n, i) => {
    if (n.column === undefined || n.column === null) n.column = i;
  });

  spreadParallelColumns(data);
}

/** Give distinct columns to nodes that share the same level and column (e.g. Storage + Output). */
function spreadParallelColumns(data) {
  const byLevel = groupByLevel(data.nodes);
  for (const group of byLevel.values()) {
    const buckets = new Map();
    for (const node of group) {
      const col = node.column ?? 0;
      if (!buckets.has(col)) buckets.set(col, []);
      buckets.get(col).push(node);
    }
    for (const nodes of buckets.values()) {
      if (nodes.length <= 1) continue;
      nodes.sort((a, b) => {
        const ai = data.nodes.findIndex(n => n.id === a.id);
        const bi = data.nodes.findIndex(n => n.id === b.id);
        return ai - bi;
      });
      const base = nodes[0].column ?? 0;
      nodes.forEach((node, idx) => { node.column = base + idx; });
    }
  }
}

function groupByLevel(nodes) {
  const map = new Map();
  for (const node of nodes) {
    const lvl = node.level ?? 0;
    if (!map.has(lvl)) map.set(lvl, []);
    map.get(lvl).push(node);
  }
  return map;
}

/** Detect feedback / backward edges from level when `flow` not set explicitly. */
function inferEdgeFlow(data) {
  const byId = new Map(data.nodes.map(n => [n.id, n]));
  for (const edge of data.edges) {
    if (!edge.flow) edge.flow = 'forward';
    if (edge.flow !== 'forward') continue;
    const from = byId.get(edge.from);
    const to = byId.get(edge.to);
    if (from && to && to.level < from.level) edge.flow = 'backward';
  }
}

function nodeSize(kind) {
  return KIND_SIZE[kind] || KIND_SIZE.task;
}

/** Split label into lines that fit inside max inner width (px). */
function wrapLabel(label, maxInnerW) {
  const text = String(label || '').trim();
  if (!text) return [''];

  const maxChars = Math.max(6, Math.floor(maxInnerW / LABEL_CHAR_W));
  const words = text.split(/\s+/);
  /** @type {string[]} */
  const lines = [];
  let current = '';

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length <= maxChars) {
      current = next;
      continue;
    }
    if (current) lines.push(current);
    if (word.length <= maxChars) {
      current = word;
    } else {
      for (let i = 0; i < word.length; i += maxChars) {
        lines.push(word.slice(i, i + maxChars));
      }
      current = '';
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [text];
}

/** Compute node box + wrapped lines from label length. */
function measureNode(node) {
  const base = nodeSize(node.kind);
  const maxInnerW = base.maxW || base.w;
  let lines = wrapLabel(node.label, maxInnerW);
  const longest = Math.max(...lines.map(l => l.length), 1);

  let w = Math.max(base.w, Math.min(maxInnerW, longest * LABEL_CHAR_W + LABEL_PAD_X));
  let h = Math.max(base.h, LABEL_PAD_Y + lines.length * LABEL_LINE_H);

  // If still too tight after first wrap, widen once and re-wrap.
  const innerW = w - LABEL_PAD_X;
  const reflow = wrapLabel(node.label, innerW);
  if (reflow.length < lines.length || (reflow.length === lines.length && reflow.some((l, i) => l.length < lines[i].length))) {
    lines = reflow;
    w = Math.max(w, Math.min(maxInnerW, Math.max(...lines.map(l => l.length)) * LABEL_CHAR_W + LABEL_PAD_X));
    h = Math.max(base.h, LABEL_PAD_Y + lines.length * LABEL_LINE_H);
  }

  return { w, h, lines };
}

function computeLayoutGaps(nodes, direction = 'TD') {
  let maxW = 0;
  let maxH = 0;
  const sizes = new Map();
  for (const node of nodes) {
    const m = measureNode(node);
    sizes.set(node.id, m);
    maxW = Math.max(maxW, m.w);
    maxH = Math.max(maxH, m.h);
  }

  const isLR = direction === 'LR';
  let levelGap = Math.max(MIN_LEVEL_GAP, (isLR ? maxW : maxH) + (isLR ? 72 : 80));

  if (isLR) {
    const byLevel = groupByLevel(nodes);
    const levels = [...byLevel.keys()].sort((a, b) => a - b);
    for (let i = 0; i < levels.length - 1; i++) {
      const w1 = Math.max(...byLevel.get(levels[i]).map(n => sizes.get(n.id).w));
      const w2 = Math.max(...byLevel.get(levels[i + 1]).map(n => sizes.get(n.id).w));
      levelGap = Math.max(levelGap, w1 / 2 + w2 / 2 + 48);
    }
  } else {
    const byLevel = groupByLevel(nodes);
    const levels = [...byLevel.keys()].sort((a, b) => a - b);
    for (let i = 0; i < levels.length - 1; i++) {
      const h1 = Math.max(...byLevel.get(levels[i]).map(n => sizes.get(n.id).h));
      const h2 = Math.max(...byLevel.get(levels[i + 1]).map(n => sizes.get(n.id).h));
      levelGap = Math.max(levelGap, h1 / 2 + h2 / 2 + 56);
    }
  }

  return { sizes, levelGap };
}

/** Place column centers from max width per column (avoids side-by-side overlap). */
function computeColumnCenters(nodes, sizes, minGap = 44) {
  const colIndices = [...new Set(nodes.map(n => n.column ?? 0))].sort((a, b) => a - b);
  if (colIndices.length === 0) return new Map([[0, 0]]);

  const colWidths = new Map();
  for (const col of colIndices) {
    const widths = nodes
      .filter(n => (n.column ?? 0) === col)
      .map(n => (sizes.get(n.id) || measureNode(n)).w);
    colWidths.set(col, Math.max(...widths, 120));
  }

  const raw = new Map();
  let cursor = 0;
  for (const col of colIndices) {
    const w = colWidths.get(col);
    cursor += w / 2;
    raw.set(col, cursor);
    cursor += w / 2 + minGap;
  }

  const span = cursor - minGap;
  const offset = span / 2;
  const centers = new Map();
  for (const col of colIndices) {
    centers.set(col, raw.get(col) - offset);
  }
  return centers;
}

function layoutNodes(data) {
  const { sizes, levelGap } = computeLayoutGaps(data.nodes, data.direction);
  const columnCenters = computeColumnCenters(data.nodes, sizes);
  const isLR = data.direction === 'LR';
  const positions = new Map();
  const byLevel = groupByLevel(data.nodes);
  const levels = [...byLevel.keys()].sort((a, b) => a - b);

  let maxCols = 1;
  for (const group of byLevel.values()) {
    const cols = new Set(group.map(n => n.column ?? 0));
    maxCols = Math.max(maxCols, cols.size);
  }

  for (const lvl of levels) {
    const group = [...byLevel.get(lvl)].sort((a, b) => (a.column ?? 0) - (b.column ?? 0));

    group.forEach(node => {
      const measured = sizes.get(node.id) || measureNode(node);
      const { w, h, lines } = measured;
      const col = node.column ?? 0;
      const cx = columnCenters.get(col) ?? 0;
      const cy = lvl * levelGap + 56;

      let x;
      let y;
      if (isLR) {
        x = (maxCols - 1 - lvl) * levelGap + 80;
        y = cx;
      } else {
        x = cx;
        y = cy;
      }

      positions.set(node.id, { x, y, w, h, lines, node });
    });
  }

  return positions;
}

function escSvg(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderNodeShape(pos, colors) {
  const { x, y, w, h, node, lines: presetLines } = pos;
  const kind = node.kind;
  const label = escSvg(node.label);
  const { nodeFill: fill, nodeStroke: stroke, textFill } = colors;
  const lines = presetLines || wrapLabel(node.label, w - LABEL_PAD_X);
  const fs = lines.some(l => l.length > 24) ? 10 : (lines.length > 3 ? 10 : 11);

  let shape = '';
  let labelBelow = false;
  if (kind === 'actor') {
    const headR = Math.min(w, h) * 0.11;
    const top = y - h / 2 + 4;
    const bodyTop = top + headR * 2.4;
    const legY = y + h / 2 - 6;
    shape = `<circle cx="${x}" cy="${top + headR}" r="${headR}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>
      <line x1="${x}" y1="${bodyTop}" x2="${x}" y2="${legY - headR * 1.2}" stroke="${stroke}" stroke-width="2"/>
      <line x1="${x - w * 0.22}" y1="${bodyTop + (legY - bodyTop) * 0.35}" x2="${x + w * 0.22}" y2="${bodyTop + (legY - bodyTop) * 0.35}" stroke="${stroke}" stroke-width="2"/>
      <line x1="${x}" y1="${legY - headR * 1.2}" x2="${x - w * 0.2}" y2="${legY}" stroke="${stroke}" stroke-width="2"/>
      <line x1="${x}" y1="${legY - headR * 1.2}" x2="${x + w * 0.2}" y2="${legY}" stroke="${stroke}" stroke-width="2"/>`;
    labelBelow = true;
  } else if (kind === 'usecase') {
    shape = `<ellipse cx="${x}" cy="${y}" rx="${w / 2}" ry="${h / 2}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`;
  } else if (kind === 'class') {
    const left = x - w / 2;
    const top = y - h / 2;
    const divY = top + Math.min(28, h * 0.32);
    shape = `<rect x="${left}" y="${top}" width="${w}" height="${h}" rx="4" fill="${fill}" stroke="${stroke}" stroke-width="2"/>
      <line x1="${left}" y1="${divY}" x2="${left + w}" y2="${divY}" stroke="${stroke}" stroke-width="1.5"/>`;
  } else if (kind === 'event') {
    shape = `<ellipse cx="${x}" cy="${y}" rx="${w / 2}" ry="${h / 2}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`;
  } else if (kind === 'gateway' || kind === 'decision') {
    const pts = `${x},${y - h / 2} ${x + w / 2},${y} ${x},${y + h / 2} ${x - w / 2},${y}`;
    shape = `<polygon points="${pts}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`;
  } else if (kind === 'data') {
    const left = x - w / 2;
    const top = y - h / 2;
    const fold = Math.min(14, w * 0.12);
    shape = `<path d="M${left + fold} ${top} H${left + w} V${top + h} H${left} V${top + fold} Z" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`;
  } else {
    const rx = kind === 'outcome' ? 14 : 8;
    shape = `<rect x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`;
  }

  const blockH = lines.length * LABEL_LINE_H;
  const labelY = labelBelow ? y + h / 2 - 4 : y - blockH / 2 + LABEL_LINE_H * 0.35;
  const tspans = lines.map((ln, i) =>
    `<tspan x="${x}" dy="${i === 0 ? 0 : LABEL_LINE_H}">${escSvg(ln)}</tspan>`,
  ).join('');

  return `${shape}<text x="${x}" y="${labelY}" text-anchor="middle" dominant-baseline="middle" fill="${textFill}" font-size="${fs}" font-family="'IBM Plex Sans Arabic', sans-serif">${tspans}</text>`;
}

function anchorPoint(pos, toward, direction) {
  const { x, y, w, h } = pos;
  const isLR = direction === 'LR';
  if (isLR) {
    if (toward.x < x) return { x: x - w / 2, y };
    return { x: x + w / 2, y };
  }
  if (toward.y > y) return { x, y: y + h / 2 };
  if (toward.y < y) return { x, y: y - h / 2 };
  if (toward.x > x) return { x: x + w / 2, y };
  return { x: x - w / 2, y };
}

/**
 * Spread edge routes so lines from the same node / to the same node use separate lanes.
 * @param {DiagramEdge[]} edges
 * @param {Map<string, { x: number, y: number, w: number, h: number }>} positions
 */
function assignEdgeLanes(edges, positions) {
  /** @type {Array<{ sourceLane: number, sourceTotal: number, targetLane: number, targetTotal: number, backLane: number, backTotal: number, midLane: number, midTotal: number }>} */
  const lanes = edges.map(() => ({
    sourceLane: 0,
    sourceTotal: 1,
    targetLane: 0,
    targetTotal: 1,
    backLane: 0,
    backTotal: 1,
    midLane: 0,
    midTotal: 1,
  }));

  const byFrom = new Map();
  const byTo = new Map();
  /** @type {number[]} */
  const backward = [];

  edges.forEach((edge, i) => {
    const flow = edge.flow || 'forward';
    if (flow === 'backward') {
      backward.push(i);
      return;
    }
    if (!byFrom.has(edge.from)) byFrom.set(edge.from, []);
    byFrom.get(edge.from).push(i);
    if (!byTo.has(edge.to)) byTo.set(edge.to, []);
    byTo.get(edge.to).push(i);
  });

  const sortByX = (ids, nodeKey) => ids.sort((a, b) => {
    const pa = positions.get(edges[a][nodeKey]);
    const pb = positions.get(edges[b][nodeKey]);
    return (pa?.x ?? 0) - (pb?.x ?? 0);
  });

  for (const ids of byFrom.values()) {
    sortByX(ids, 'to');
    ids.forEach((idx, lane) => {
      lanes[idx].sourceLane = lane;
      lanes[idx].sourceTotal = ids.length;
    });
  }

  for (const ids of byTo.values()) {
    sortByX(ids, 'from');
    ids.forEach((idx, lane) => {
      lanes[idx].targetLane = lane;
      lanes[idx].targetTotal = ids.length;
    });
  }

  backward.forEach((idx, lane) => {
    lanes[idx].backLane = lane;
    lanes[idx].backTotal = backward.length;
  });

  const midGroups = new Map();
  edges.forEach((edge, i) => {
    if ((edge.flow || 'forward') === 'backward') return;
    const fp = positions.get(edge.from);
    const tp = positions.get(edge.to);
    if (!fp || !tp) return;
    const band = Math.round((tp.y - fp.y) / 24);
    const key = `${edge.from}:${band}`;
    if (!midGroups.has(key)) midGroups.set(key, []);
    midGroups.get(key).push(i);
  });

  for (const ids of midGroups.values()) {
    if (ids.length <= 1) continue;
    sortByX(ids, 'to');
    ids.forEach((idx, lane) => {
      lanes[idx].midLane = lane;
      lanes[idx].midTotal = ids.length;
    });
  }

  return lanes;
}

function laneOffset(lane, total, spacing = LANE_SPACING) {
  if (total <= 1) return 0;
  return (lane - (total - 1) / 2) * spacing;
}

function orthogonalPath(start, end, flow, allPositions, lanes) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;

  if (flow === 'backward' || dy < -12) {
    const xs = [...allPositions.values()].map(p => p.x);
    const minX = Math.min(...xs) - 80 - laneOffset(lanes.backLane, lanes.backTotal);
    const drop = EDGE_STUB + laneOffset(lanes.backLane, lanes.backTotal, 10);
    return [
      `M ${start.x} ${start.y}`,
      `L ${start.x} ${start.y + drop}`,
      `L ${minX} ${start.y + drop}`,
      `L ${minX} ${end.y - drop}`,
      `L ${end.x} ${end.y - drop}`,
      `L ${end.x} ${end.y}`,
    ].join(' ');
  }

  const srcOff = laneOffset(lanes.sourceLane, lanes.sourceTotal);
  const tgtOff = laneOffset(lanes.targetLane, lanes.targetTotal);
  const midOff = laneOffset(lanes.midLane, lanes.midTotal);

  if (Math.abs(dx) < 10) {
    const x = start.x + srcOff * 0.5 + tgtOff * 0.5;
    return `M ${start.x} ${start.y} L ${x} ${start.y + EDGE_STUB} L ${x} ${end.y - EDGE_STUB} L ${end.x} ${end.y}`;
  }

  const stubY = start.y + Math.sign(dy || 1) * EDGE_STUB;
  const midY = start.y + dy * 0.5 + midOff;
  const forkX = start.x + srcOff;
  const landX = end.x + tgtOff * 0.6;

  return [
    `M ${start.x} ${start.y}`,
    `L ${forkX} ${stubY}`,
    `L ${forkX} ${midY}`,
    `L ${landX} ${midY}`,
    `L ${landX} ${end.y - Math.sign(dy || 1) * EDGE_STUB}`,
    `L ${end.x} ${end.y}`,
  ].join(' ');
}

function pathMidpoint(start, end, flow, allPositions, lanes) {
  if (flow === 'backward' || end.y < start.y - 12) {
    const xs = [...allPositions.values()].map(p => p.x);
    const minX = Math.min(...xs) - 80 - laneOffset(lanes.backLane, lanes.backTotal);
    return { x: minX, y: (start.y + end.y) / 2 };
  }

  const midOff = laneOffset(lanes.midLane, lanes.midTotal);
  const midY = start.y + (end.y - start.y) * 0.5 + midOff;
  const forkX = start.x + laneOffset(lanes.sourceLane, lanes.sourceTotal);
  const landX = end.x + laneOffset(lanes.targetLane, lanes.targetTotal) * 0.6;
  return { x: (forkX + landX) / 2, y: midY - 8 };
}

function renderEdge(edge, positions, direction, colors, markerId, markerStartId, allPositions, lanes) {
  const fromPos = positions.get(edge.from);
  const toPos = positions.get(edge.to);
  if (!fromPos || !toPos) return '';

  const flow = edge.flow || 'forward';
  const toC = { x: toPos.x, y: toPos.y };
  const fromC = { x: fromPos.x, y: fromPos.y };
  const start = anchorPoint(fromPos, toC, direction);
  const end = anchorPoint(toPos, fromC, direction);
  const stroke = flow === 'backward' ? colors.backStroke : colors.edgeStroke;
  const dash = flow === 'backward' ? ' stroke-dasharray="6 4"' : '';
  const d = orthogonalPath(start, end, flow, allPositions, lanes);

  const mid = pathMidpoint(start, end, flow, allPositions, lanes);
  const label = edge.label
    ? `<text x="${mid.x}" y="${mid.y - 8}" text-anchor="middle" fill="${stroke}" font-size="11" font-family="'IBM Plex Sans Arabic', sans-serif">${escSvg(edge.label)}</text>`
    : '';

  let markers = '';
  if (flow === 'both') {
    markers = ` marker-start="url(#${markerStartId})" marker-end="url(#${markerId})"`;
  } else if (flow === 'backward') {
    markers = ` marker-start="url(#${markerStartId})"`;
  } else {
    markers = ` marker-end="url(#${markerId})"`;
  }

  return `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="2"${dash}${markers}/>${label}`;
}

/**
 * @param {DiagramData} data
 * @param {{ isDark?: boolean }} [opts]
 */
export function diagramToSvg(data, opts = {}) {
  const isDark = opts.isDark ?? (typeof document !== 'undefined' && document.documentElement.classList.contains('dark'));
  const colors = typeof document !== 'undefined' ? getDiagramColors() : {
    nodeFill: isDark ? '' : '',
    nodeStroke: '',
    textFill: '',
    edgeStroke: '',
    backStroke: '',
  };
  const positions = layoutNodes(data);
  const edgeLanes = assignEdgeLanes(data.edges, positions);
  const markerId = `arrow-${Math.random().toString(36).slice(2, 9)}`;
  const markerStartId = `arrow-start-${Math.random().toString(36).slice(2, 9)}`;
  const { edgeStroke: stroke, backStroke } = colors;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const pos of positions.values()) {
    minX = Math.min(minX, pos.x - pos.w / 2 - NODE_PAD - 80);
    minY = Math.min(minY, pos.y - pos.h / 2 - NODE_PAD);
    maxX = Math.max(maxX, pos.x + pos.w / 2 + NODE_PAD);
    maxY = Math.max(maxY, pos.y + pos.h / 2 + NODE_PAD + 28);
  }

  if (!Number.isFinite(minX)) {
    minX = 0; minY = 0; maxX = 300; maxY = 200;
  }

  const width = maxX - minX;
  const height = maxY - minY;
  const tx = -minX;
  const ty = -minY;

  const markerDef = `<defs>
    <marker id="${markerId}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="${stroke}"/>
    </marker>
    <marker id="${markerStartId}" viewBox="0 0 10 10" refX="1" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M 10 0 L 0 5 L 10 10 z" fill="${backStroke}"/>
    </marker>
  </defs>`;

  const edges = data.edges
    .map((e, i) => renderEdge(e, positions, data.direction, colors, markerId, markerStartId, positions, edgeLanes[i]))
    .join('');
  const nodes = [...positions.values()].map(p => renderNodeShape(p, colors)).join('');

  return `<svg class="diagram-svg" viewBox="0 0 ${width} ${height}" width="100%" height="${height}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${escSvg(data.title || 'مخطط')}"><g transform="translate(${tx}, ${ty})">${markerDef}${edges}${nodes}</g></svg>`;
}

/**
 * @param {DiagramData} data
 */
const DIAGRAM_TYPE_META = {
  flowchart: { label: 'Flowchart', icon: 'account_tree' },
  bpmn: { label: 'BPMN', icon: 'account_tree' },
  'decision-tree': { label: 'Decision Tree', icon: 'fork_right' },
  dfd: { label: 'DFD', icon: 'device_hub' },
  usecase: { label: 'Use Case Diagram', icon: 'groups' },
  class: { label: 'Class Diagram', icon: 'category' },
  activity: { label: 'Activity Diagram', icon: 'timeline' },
};

export function diagramToHtml(data) {
  const meta = DIAGRAM_TYPE_META[data.type] || { label: data.type, icon: 'account_tree' };
  const typeLabel = meta.label;
  const typeIcon = meta.icon;

  const jsonAttr = escSvg(JSON.stringify(data));

  return `<div class="diagram-container box-animate box-hover" data-diagram-json="${jsonAttr}" data-diagram-type="${escSvg(data.type)}">
    <div class="diagram-header">
      <span class="material-symbols-outlined diagram-header__icon">${typeIcon}</span>
      <div class="diagram-header__text">
        <span class="diagram-header__type">${escSvg(typeLabel)}</span>
        <span class="diagram-header__title">${escSvg(data.title || 'مخطط')}</span>
      </div>
    </div>
    <div class="diagram-canvas">${diagramToSvg(data)}</div>
  </div>`;
}

/** Re-render diagrams after theme toggle. */
export function refreshDiagrams(root = document) {
  root.querySelectorAll('.diagram-container[data-diagram-json]').forEach(el => {
    try {
      const data = JSON.parse(el.dataset.diagramJson);
      inferEdgeFlow(data);
      assignColumns(data);
      const canvas = el.querySelector('.diagram-canvas');
      if (canvas) canvas.innerHTML = diagramToSvg(data);
    } catch (_) { /* ignore */ }
  });
}

export function initDiagrams(root = document) {
  refreshDiagrams(root);
}
