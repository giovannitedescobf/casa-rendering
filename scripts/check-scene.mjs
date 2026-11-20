#!/usr/bin/env node
// Quick checks before showing a furniture change (no browser, a second or so):
//   node scripts/check-scene.mjs <project> [group,group,...]
// 1. saved positions: what moved.json holds for the pieces of the groups checked (the user's drags and turns are
//    added to the generator's coordinates, so moving a piece in the generator moves it again on top of them);
// 2. clashes: each movable piece (moved.json offsets applied) against the fixed shell (walls, not floors) and against
//    the other movable pieces of the groups checked, part by part (item bounding boxes), as the viewer's drag does.
// Groups checked: the ones given, else moved.json "_groups", else the scene's defaultOn. Rotated pieces are checked
// without their rotation (reported). Exit code 1 when a clash is found.
import fs from 'node:fs';
import path from 'node:path';

const [id, gArg] = process.argv.slice(2);
if (!id) { console.error('usage: node scripts/check-scene.mjs <project> [group,group,...]'); process.exit(2); }
const dir = path.join(path.dirname(new URL(import.meta.url).pathname), '..', 'projects', id);
const scene = JSON.parse(fs.readFileSync(path.join(dir, 'scene.json'), 'utf8'));
let moved = {};
try { moved = JSON.parse(fs.readFileSync(path.join(dir, 'moved.json'), 'utf8')); } catch (e) {}
const CM = 2.54, cm = v => Math.round(v * CM);
const groups = scene.groups || [];
const fixed = new Set(groups.filter(g => g.fixed).map(g => g.id));
const on = new Set(gArg ? gArg.split(',') : moved._groups || groups.filter(g => g.on).map(g => g.id));
const gone = new Set([...(moved._trash || []), ...(moved._deleted || [])]);

const moveKey = it => {                                   // same rule as the viewer
  const gs = [].concat(it.g || []);
  if (!gs.length || gs.every(g => fixed.has(g))) return null;
  const parts = it.n.split('/'), leaf = parts.pop().split('_');
  return parts.join('/') + '/' + leaf[0] + '#' + (leaf.find(w => /^\d+$/.test(w)) ?? '');
};
const bbox = it => {
  if (it.box) return it.box;
  if (it.rbox) return it.rbox.b;
  const pts = it.slab ? it.slab.o.map(p => [...p, it.slab.z[0]]).concat(it.slab.o.map(p => [...p, it.slab.z[1]]))
    : it.tray ? it.tray.o.map(p => [...p, it.tray.z[0]]).concat(it.tray.o.map(p => [...p, it.tray.z[1]]))
    : it.tube ? it.tube.p.flatMap((p, i) => { const r = it.tube.r[i]; return [[p[0] - r, p[1] - r, p[2] - r], [p[0] + r, p[1] + r, p[2] + r]]; })
    : it.faces ? it.faces.flatMap(f => Array.isArray(f) ? f : f.v) : null;
  if (!pts) return null;
  const mn = i => Math.min(...pts.map(p => p[i])), mx = i => Math.max(...pts.map(p => p[i]));
  return [mn(0), mn(1), mn(2), mx(0), mx(1), mx(2)];
};

const shell = [], pieces = new Map();
for (const it of scene.items) {
  const gs = [].concat(it.g || []), b = bbox(it);
  if (!b) continue;
  if (!gs.length) { if (!(it.c && it.c[3] < 255) && !/Rimosso|Removed/.test(it.n) && b[5] - b[2] > 20) shell.push({ n: it.n, b, o: it.slab && it.slab.o }); continue; }   // walls, not floors or glass; slabs keep their plan polygon
  if (!gs.some(g => on.has(g)) || gs.every(g => gone.has(g))) continue;
  const k = moveKey(it);
  if (!k) continue;
  const off = moved[k] || [0, 0];
  const p = pieces.get(k) || { k, off, parts: [] };
  p.parts.push({ n: it.n, b: [b[0] + off[0], b[1] + off[1], b[2], b[3] + off[0], b[4] + off[1], b[5]] });
  pieces.set(k, p);
}

console.log(`groups checked: ${[...on].join(', ') || '(none)'}`);
const saved = [...pieces.values()].filter(p => moved[p.k]);
console.log(saved.length ? 'saved positions (moved.json, cm):' : 'saved positions: none for these pieces');
for (const p of saved) console.log(`  ${p.k}: dx ${cm(p.off[0])}, dy ${cm(p.off[1])}${p.off[2] ? `, turned ${p.off[2]}° (clash check ignores the turn)` : ''}`);

const hit = (a, b, s = 0.3) => a[3] - s > b[0] && a[0] + s < b[3] && a[4] - s > b[1] && a[1] + s < b[4] && a[5] > b[2] + 1 && a[2] + 1 < b[5];
const inPoly = (o, x, y) => { let c = false; for (let i = 0, j = o.length - 1; i < o.length; j = i++) if ((o[i][1] > y) !== (o[j][1] > y) && x < (o[j][0] - o[i][0]) * (y - o[i][1]) / (o[j][1] - o[i][1]) + o[i][0]) c = !c; return c; };
const hitWall = (a, w) => {                               // a box wall: its box; a slab wall (oblique): a part corner inside the polygon or a polygon corner inside the part
  if (!hit(a, w.b)) return false;
  if (!w.o) return true;
  const s = 0.3, r = [a[0] + s, a[1] + s, a[3] - s, a[4] - s];
  return [[r[0], r[1]], [r[2], r[1]], [r[2], r[3]], [r[0], r[3]]].some(p => inPoly(w.o, ...p)) || w.o.some(p => p[0] > r[0] && p[0] < r[2] && p[1] > r[1] && p[1] < r[3]);
};
// pieces of a group that follows another one ("follow", e.g. chairs and their table) are designed together: not checked against each other
const tagsOf = k => { const it = scene.items.find(i => moveKey(i) === k), t = new Set(); for (const g of [].concat(it.g)) { t.add(g); const d = groups.find(x => x.id === g); if (d?.variant) t.add(d.variant); } return t; };
const followOf = k => { const it = scene.items.find(i => moveKey(i) === k); return [].concat(it.g).map(g => groups.find(x => x.id === g)?.follow).find(Boolean); };
const linked = (a, b) => { const fa = followOf(a), fb = followOf(b); return (fa && tagsOf(b).has(fa)) || (fb && tagsOf(a).has(fb)); };
const out = [];
const list = [...pieces.values()];
for (const p of list) {
  for (const w of shell) { const q = p.parts.find(a => hitWall(a.b, w)); if (q) { out.push(`${p.k} is inside the wall ${w.n} (${q.n})`); break; } }
}
for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) {
  if (linked(list[i].k, list[j].k)) continue;
  let f = null;
  for (const a of list[i].parts) { f = list[j].parts.find(b => hit(a.b, b.b)) && a; if (f) break; }
  if (f) out.push(`${list[i].k} overlaps ${list[j].k} (${f.n})`);
}
console.log(out.length ? `clashes (${out.length}):\n  ` + out.join('\n  ') : 'clashes: none');
process.exit(out.length ? 1 : 0);
