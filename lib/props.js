// Bibliothek platzierbarer Gegenstände im Low-Poly-Stil des Spiels (flache Farben, Flat-Shading).
// Jeder Eintrag: id, cat, name, fp = Grundfläche [Breite, Tiefe] in Metern, solid = blockiert den Spieler, vars = Anzahl Varianten
// (Taste V im Editor), wall = hängt an Wänden, lamp = leuchtet nachts wie eine Straßenlaterne, build(v) = Erzeugung.
// Die Vorderseite eigener Modelle zeigt nach +z.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const MC = {};
const M = (c, o = {}) => { const k = c + JSON.stringify(o); return MC[k] || (MC[k] = new THREE.MeshLambertMaterial(Object.assign({ color: c, flatShading: true }, o))); };
const GL = c => { const k = 'g' + c; return MC[k] || (MC[k] = new THREE.MeshBasicMaterial({ color: c })); };
const B = (w, h, d, c, x, y, z, rx = 0, ry = 0, rz = 0) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), typeof c === 'object' ? c : M(c)); m.position.set(x, y + h / 2, z); m.rotation.set(rx, ry, rz); return m; };
const C = (r1, r2, h, c, x, y, z, seg = 8) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r2, r1, h, seg), typeof c === 'object' ? c : M(c)); m.position.set(x, y + h / 2, z); return m; };
const CO = (r, h, c, x, y, z, seg = 7) => { const m = new THREE.Mesh(new THREE.ConeGeometry(r, h, seg), M(c)); m.position.set(x, y + h / 2, z); return m; };
const I = (r, c, x, y, z, sx = 1, sy = 1, sz = 1, ry = 0) => { const m = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 0), M(c)); m.position.set(x, y, z); m.scale.set(sx, sy, sz); m.rotation.y = ry; return m; };
const G = (...k) => { const g = new THREE.Group(); k.flat().forEach(c => c && g.add(c)); return g; };
let sd = 5; const R = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
const pick = (a, v) => a[v % a.length];

const LEAF = [[0x5a6a2a, 0x6a7a30, 0x4a5a24], [0x9a8a30, 0xb09a38, 0x8a7a2a], [0x9a5a28, 0xb06a30, 0x8a4a22], [0x3a5a2a, 0x486a30, 0x2e4a22]];
const CARCOL = [0x3a4a5a, 0x7a2a2a, 0x4a4a42, 0x2a3a2a, 0xb8b4a8, 0x1e1e24, 0x6a5a3a, 0x8a8a84, 0x2a4a7a, 0xc8b040];

/* ---------- Bäume ---------- */
function crown(cx, cy, cz, r, v) {
  const p = pick(LEAF, v), g = [];
  [[0, 0, 0, 1], [0.6, -0.15, 0.3, 0.75], [-0.55, -0.1, -0.3, 0.8], [0.15, 0.55, -0.4, 0.7], [-0.2, 0.5, 0.45, 0.65], [0.1, -0.35, 0, 0.8]].forEach(([dx, dy, dz, k], i) => g.push(I(r * k, p[i % 3], cx + dx * r, cy + dy * r, cz + dz * r, 1, 0.9, 1, R() * 6)));
  return g;
}
const birke = v => { const t = 0xd6d2c6; return G(C(0.16, 0.1, 5.2, t, 0, 0, 0, 6), B(0.12, 0.05, 0.2, 0x222222, 0.08, 1.2, 0), B(0.12, 0.05, 0.2, 0x222222, -0.07, 2.4, 0.04), crown(0, 5.8, 0, 1.7, 1 + (v % 2) * 2)); };
const eiche = v => G(C(0.45, 0.3, 3.4, 0x4a3a2a, 0, 0, 0), B(0.18, 1.6, 0.18, 0x4a3a2a, 0.45, 2.6, 0, 0, 0, -0.8), B(0.18, 1.6, 0.18, 0x4a3a2a, -0.45, 2.7, 0, 0, 0, 0.8), crown(0, 5.3, 0, 3.0, v));
const tanne = () => G(C(0.3, 0.2, 2.2, 0x3a2a20, 0, 0, 0, 6), [0, 1, 2, 3].map(i => CO(2.0 - i * 0.42, 2.4, [0x1e3a26, 0x244630, 0x1e3a26, 0x2a4a34][i], 0, 1.6 + i * 1.5, 0, 8)), CO(0.5, 1.5, 0x2a4a34, 0, 7.4, 0, 8));
const pappel = v => G(C(0.28, 0.2, 4, 0x4a4030, 0, 0, 0, 6), I(1.4, pick(LEAF[v % 4], 0), 0, 6.8, 0, 1, 2.0, 1), I(1.0, pick(LEAF[v % 4], 1), 0.15, 9.3, 0.1, 1, 1.5, 1));
const toterBaum = () => G(C(0.34, 0.22, 4.2, 0x3a3028, 0, 0, 0, 6), [[1.4, 0.7, 0], [-1.1, 0.9, 0.3], [0.2, 0.6, 1.2], [0.1, 0.8, -1.1], [0.9, 0.5, 0.9]].map(([dx, dz, a], i) => B(0.1, 1.9, 0.1, 0x3a3028, 0, 2.7 + i * 0.3, 0, dz * 0.7, i * 1.3, 0.9)));
const jungbaum = v => G(C(0.1, 0.07, 2.2, 0x5a4630, 0, 0, 0, 6), crown(0, 2.8, 0, 0.9, v));
/* ---------- Büsche und Hecken ---------- */
const busch = v => G(I(0.8, pick(LEAF[v % 4], 0), 0, 0.6, 0, 1, 0.8, 1), I(0.6, pick(LEAF[v % 4], 1), 0.6, 0.45, 0.3), I(0.55, pick(LEAF[v % 4], 2), -0.55, 0.45, -0.2));
const buschFlach = v => G(I(1.0, pick(LEAF[v % 4], 0), 0, 0.3, 0, 1.3, 0.4, 1), I(0.7, pick(LEAF[v % 4], 1), 0.9, 0.25, 0.1, 1, 0.4, 1));
const hecke = L => v => G(B(L, 0.95, 0.9, 0x1e3418, 0, 0, 0), ...Array.from({ length: Math.floor(L / 0.9) }, (_, i) => I(0.5, pick([0x24401c, 0x1e3418, 0x2a4a20], i + v), -L / 2 + 0.45 + i * 0.9, 0.95, 0, 1, 0.55, 1)));
/* ---------- Zäune und Mauern ---------- */
const zaunGrau = v => G(B(0.08, 1.2, 0.08, 0x606068, -1.1, 0, 0), B(0.08, 1.2, 0.08, 0x606068, 1.1, 0, 0), B(2.2, 0.04, 0.04, 0x606068, 0, 1.15, 0), B(2.2, 0.04, 0.04, 0x606068, 0, 0.1, 0), ...Array.from({ length: 10 }, (_, i) => B(0.015, 1.0, 0.015, 0x888890, -0.99 + i * 0.22, 0.12, 0)));
const zaunHolz = v => G(B(0.1, 1.1, 0.1, pick([0x6a5030, 0x7a7a74, 0x4a6a4a], v), -1, 0, 0), B(0.1, 1.1, 0.1, pick([0x6a5030, 0x7a7a74, 0x4a6a4a], v), 1, 0, 0), ...Array.from({ length: 9 }, (_, i) => B(0.1, 0.95 + (i % 2) * 0.1, 0.03, pick([0x7a5a38, 0x8a8a84, 0x5a7a5a], v), -0.9 + i * 0.225, 0.05, 0)));
const zaunGruen = () => G(B(0.08, 1.4, 0.08, 0x1c3a2a, -1.1, 0, 0), B(0.08, 1.4, 0.08, 0x1c3a2a, 1.1, 0, 0), B(2.2, 0.05, 0.05, 0x1c3a2a, 0, 1.3, 0), B(2.2, 0.05, 0.05, 0x1c3a2a, 0, 0.75, 0), B(2.2, 0.05, 0.05, 0x1c3a2a, 0, 0.2, 0));
const mauerNiedrig = v => G(B(2.2, 0.8, 0.3, pick([0xa09c92, 0x8a5a44, 0x7a7a74], v), 0, 0, 0), B(2.3, 0.08, 0.38, 0xb0aca2, 0, 0.8, 0));
const absperr = () => G(B(0.06, 1.1, 0.06, 0x888888, -1, 0, 0.2), B(0.06, 1.1, 0.06, 0x888888, 1, 0, 0.2), B(0.06, 1.1, 0.06, 0x888888, -1, 0, -0.2), B(0.06, 1.1, 0.06, 0x888888, 1, 0, -0.2), B(2.2, 0.2, 0.04, 0xd8d8d0, 0, 0.8, 0), B(2.2, 0.2, 0.04, 0xd83a2a, 0, 0.55, 0), B(2.2, 0.2, 0.04, 0xd8d8d0, 0, 0.3, 0));
/* ---------- Lampen ---------- */
const laterne = () => G(B(0.14, 5.4, 0.14, 0x74747c, 0, 0, 0), B(0.1, 0.1, 1.0, 0x74747c, 0, 5.3, 0.45), B(0.45, 0.1, 0.5, GL(0xffb060), 0, 5.2, 0.9));
const poller = () => G(C(0.12, 0.12, 0.9, 0x3a3a40, 0, 0, 0, 8), C(0.1, 0.1, 0.12, GL(0xffc880), 0, 0.9, 0, 8));
const gartenlampe = () => G(B(0.07, 2.2, 0.07, 0x2a2a30, 0, 0, 0), I(0.22, 0xffd890, 0, 2.35, 0), B(0.3, 0.05, 0.3, 0x2a2a30, 0, 2.62, 0));
const wandlampe = () => G(B(0.2, 0.16, 0.08, 0x606068, 0, 0, 0), B(0.16, 0.12, 0.16, GL(0xffd890), 0, 0.02, 0.1));
/* ---------- Autos (Länge entlang z, Front +z) ---------- */
function car(kind, v) {
  const c = pick(CARCOL, v), g = new THREE.Group(), dark = 0x16202a;
  const L = { klein: 3.7, limo: 4.5, kombi: 4.6, van: 4.9, taxi: 4.5 }[kind], H = kind === 'van' ? 1.35 : 0.62;
  g.add(B(1.7, 0.62, L, c, 0, 0.18, 0));
  if (kind === 'klein') { g.add(B(1.6, 0.55, 2.1, c, 0, 0.8, -0.35), B(1.62, 0.34, 1.7, dark, 0, 0.88, -0.35)); }
  else if (kind === 'limo' || kind === 'taxi') { g.add(B(1.6, 0.52, 2.1, c, 0, 0.8, -0.25), B(1.62, 0.3, 1.8, dark, 0, 0.88, -0.25)); }
  else if (kind === 'kombi') { g.add(B(1.6, 0.55, 2.9, c, 0, 0.8, -0.55), B(1.62, 0.34, 2.5, dark, 0, 0.88, -0.55)); }
  else { g.add(B(1.7, 0.95, 3.2, c, 0, 0.8, -0.8), B(1.72, 0.35, 0.9, dark, 0, 1.2, 0.7)); }
  if (kind === 'taxi') g.add(B(0.6, 0.18, 0.25, GL(0xffd060), 0, 1.42, -0.2));
  for (const [sx, sz] of [[-1, 1], [1, 1], [-1, -1], [1, -1]]) g.add(B(0.2, 0.62, 0.62, 0x0a0a0a, sx * 0.85, 0, sz * L * 0.3));
  g.add(B(1.5, 0.1, 0.05, GL(0xe8e0c0), 0, 0.45, L / 2), B(1.5, 0.1, 0.05, 0x802020, 0, 0.45, -L / 2));
  return g;
}
/* ---------- Straße und Stadt ---------- */
const mullTonne = v => G(C(0.32, 0.3, 0.95, pick([0x2a4a2a, 0x3a3a40, 0x8a7a20, 0x2a3a6a], v), 0, 0, 0, 8), B(0.68, 0.08, 0.68, 0x1a1a1a, 0, 0.95, 0));
const container = () => G(B(2.0, 1.25, 1.0, 0x2a4a3a, 0, 0.1, 0), B(2.05, 0.1, 1.05, 0x1a2a22, 0, 1.35, 0), B(0.1, 0.1, 1.0, 0x666666, 0, 0, 0.0));
const bank = v => G(B(1.6, 0.08, 0.5, pick([0x6a5030, 0x4a6a4a, 0x7a7a74], v), 0, 0.45, 0), B(1.6, 0.5, 0.06, pick([0x6a5030, 0x4a6a4a, 0x7a7a74], v), 0, 0.55, -0.25), B(0.08, 0.45, 0.45, 0x2a2a30, -0.7, 0, 0), B(0.08, 0.45, 0.45, 0x2a2a30, 0.7, 0, 0));
const fahrradstaender = () => G(...[-0.6, 0, 0.6].map(x => G(B(0.04, 0.8, 0.04, 0x606068, x, 0, 0), B(0.04, 0.04, 0.5, 0x606068, x, 0.8, 0.25), B(0.04, 0.04, 0.5, 0x606068, x, 0, 0.25))));
const fahrrad = v => G((() => { const w = (z) => { const m = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.025, 4, 12), M(0x1a1a1a)); m.position.set(0, 0.36, z); m.rotation.y = Math.PI / 2; return m; }; return G(w(0.55), w(-0.55)); })(), B(0.04, 0.04, 1.1, pick([0x8a2a2a, 0x2a4a7a, 0x4a4a42], v), 0, 0.5, 0), B(0.04, 0.5, 0.04, pick([0x8a2a2a, 0x2a4a7a, 0x4a4a42], v), 0, 0.4, -0.2), B(0.5, 0.04, 0.04, 0x1a1a1a, 0, 0.9, 0.5));
const schild = v => G(B(0.06, 2.4, 0.06, 0x808088, 0, 0, 0), (() => { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.04, 10), M(pick([0xc83a2a, 0x2a5a9a, 0xd8c030], v))); m.rotation.x = Math.PI / 2; m.position.set(0, 2.2, 0.04); return m; })(), (() => { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.05, 10), M(0xe8e8e0)); m.rotation.x = Math.PI / 2; m.position.set(0, 2.2, 0.05); return m; })());
const briefkasten = () => G(B(0.07, 1.3, 0.07, 0x606068, 0, 0, 0), B(0.45, 0.35, 0.3, 0xd8b020, 0, 1.1, 0), B(0.3, 0.04, 0.02, 0x222222, 0, 1.35, 0.16));
const stromkasten = () => G(B(0.9, 1.4, 0.45, 0x8a8a84, 0, 0, 0), B(0.86, 0.04, 0.02, 0x4a4a46, 0, 0.7, 0.24));
const papierkorb = () => G(C(0.2, 0.17, 0.55, 0x4a4a52, 0, 0.55, 0, 8), B(0.07, 0.55, 0.07, 0x4a4a52, 0, 0, 0));
const kiste = v => G(B(0.9, 0.7, 0.9, pick([0x8a6a3a, 0x6a5a3a], v), 0, 0, 0), B(0.95, 0.08, 0.95, 0x5a4a2a, 0, 0.7, 0));
const palette = () => G(...[0, 1, 2].map(i => B(1.2, 0.05, 0.14, 0x9a7a4a, 0, 0.1, -0.4 + i * 0.4)), B(1.2, 0.1, 0.12, 0x7a5a30, 0, 0, -0.5), B(1.2, 0.1, 0.12, 0x7a5a30, 0, 0, 0), B(1.2, 0.1, 0.12, 0x7a5a30, 0, 0, 0.5));
/* ---------- Spielplatz ---------- */
const sandkasten = () => G(B(2.6, 0.3, 0.14, 0x9a8a62, 0, 0, -1.3), B(2.6, 0.3, 0.14, 0x9a8a62, 0, 0, 1.3), B(0.14, 0.3, 2.6, 0x9a8a62, -1.3, 0, 0), B(0.14, 0.3, 2.6, 0x9a8a62, 1.3, 0, 0), B(2.4, 0.2, 2.4, 0xb8a672, 0, 0, 0));
const wippe = () => G(B(0.1, 0.5, 0.1, 0x606068, 0, 0, 0), B(3.0, 0.1, 0.3, 0xb03a2a, 0, 0.5, 0, 0, 0.0, 0.12), B(0.3, 0.3, 0.1, 0x222222, -1.3, 0.55, 0), B(0.3, 0.3, 0.1, 0x222222, 1.3, 0.55, 0));
const rutsche = () => G(B(0.08, 1.9, 0.08, 0x606068, -0.5, 0, -0.5), B(0.08, 1.9, 0.08, 0x606068, 0.5, 0, -0.5), B(0.08, 1.9, 0.08, 0x606068, -0.5, 0, 0.5), B(0.08, 1.9, 0.08, 0x606068, 0.5, 0, 0.5), B(1.2, 0.1, 1.2, 0x606068, 0, 1.8, 0), B(0.9, 0.08, 3.4, 0xa02820, 0, 0.9, 2.3, 0.55, 0, 0));
const schaukel = () => G(B(0.12, 2.8, 0.12, 0x606068, -2.1, 0, 0), B(0.12, 2.8, 0.12, 0x606068, 2.1, 0, 0), B(4.4, 0.12, 0.12, 0x606068, 0, 2.7, 0), ...[-0.8, 0.8].map(x => G(B(0.03, 1.9, 0.03, 0x666666, x, 0.8, 0), B(0.7, 0.06, 0.28, 0x7a5a38, x, 0.75, 0))));
/* ---------- Innen: Bücher, Möbel, Deko ---------- */
const BUCH = [0x7a2a2a, 0x2a4a6a, 0x3a6a4a, 0xc8b070, 0x5a3a6a, 0x8a6a30, 0x2a2a30, 0xa04a2a];
const buch = v => G(B(0.2, 0.04, 0.28, pick(BUCH, v), 0, 0, 0), B(0.19, 0.03, 0.27, 0xe8dcc0, 0.005, 0.005, 0));
const buchStapel = v => G(...[0, 1, 2, 3].map(i => B(0.2 + (i % 2) * 0.03, 0.045, 0.28 - (i % 3) * 0.02, pick(BUCH, v + i), (i % 2) * 0.01, i * 0.05, 0, 0, i * 0.3, 0)));
const buchReihe = v => { const g = new THREE.Group(); let x = 0; for (let i = 0; i < 9; i++) { const w = 0.03 + R() * 0.03, h = 0.2 + R() * 0.12; g.add(B(w, h, 0.2, pick(BUCH, v + i * 3), x + w / 2, 0, 0)); x += w + 0.002; } g.children.forEach(c => c.position.x -= x / 2); return g; };
const buchAufgeschlagen = () => G(B(0.2, 0.02, 0.28, 0x7a2a2a, -0.1, 0, 0), B(0.2, 0.02, 0.28, 0x7a2a2a, 0.1, 0, 0), B(0.19, 0.012, 0.26, 0xe8dcc0, -0.1, 0.02, 0, 0, 0, 0.05), B(0.19, 0.012, 0.26, 0xe8dcc0, 0.1, 0.02, 0, 0, 0, -0.05));
const regalGefuellt = v => { const g = G(B(0.04, 1.8, 0.32, 0x6a4a2a, -0.58, 0, 0), B(0.04, 1.8, 0.32, 0x6a4a2a, 0.58, 0, 0), B(1.2, 0.04, 0.32, 0x6a4a2a, 0, 0, 0), B(1.2, 0.04, 0.32, 0x6a4a2a, 0, 1.78, 0), B(1.2, 1.8, 0.02, 0x4a3320, 0, 0, -0.15)); for (let r = 0; r < 5; r++) { g.add(B(1.2, 0.03, 0.32, 0x6a4a2a, 0, 0.3 + r * 0.35, 0)); let x = -0.54; while (x < 0.5) { const w = 0.03 + R() * 0.035, h = 0.2 + R() * 0.1; g.add(B(w, h, 0.2, pick(BUCH, Math.floor(R() * 8) + v), x + w / 2, 0.33 + r * 0.35, 0.02)); x += w + 0.004; if (R() < 0.08) x += 0.12; } } return g; };
const regalLeer = () => G(B(0.04, 1.8, 0.32, 0x6a4a2a, -0.58, 0, 0), B(0.04, 1.8, 0.32, 0x6a4a2a, 0.58, 0, 0), ...[0, 0.45, 0.9, 1.35, 1.78].map(y => B(1.2, 0.04, 0.32, 0x6a4a2a, 0, y, 0)), B(1.2, 1.8, 0.02, 0x4a3320, 0, 0, -0.15));
const tisch = v => G(B(1.3, 0.07, 0.8, pick([0x8a6a3a, 0xb8a888, 0x5a4030], v), 0, 0.72, 0), ...[[-0.6, -0.34], [0.6, -0.34], [-0.6, 0.34], [0.6, 0.34]].map(([x, z]) => B(0.07, 0.72, 0.07, 0x4a3a28, x, 0, z)));
const stuhl = v => G(B(0.44, 0.05, 0.44, pick([0x8a6a3a, 0x7a2a2a, 0x2a4a6a], v), 0, 0.45, 0), B(0.44, 0.5, 0.05, pick([0x8a6a3a, 0x7a2a2a, 0x2a4a6a], v), 0, 0.5, -0.2), ...[[-0.19, -0.19], [0.19, -0.19], [-0.19, 0.19], [0.19, 0.19]].map(([x, z]) => B(0.04, 0.45, 0.04, 0x4a3a28, x, 0, z)));
const hocker = () => G(C(0.22, 0.2, 0.42, 0x7a5a38, 0, 0, 0, 8), C(0.24, 0.24, 0.05, 0x8a6a40, 0, 0.42, 0, 8));
const stehlampe = () => G(C(0.16, 0.16, 0.03, 0x4a4a52, 0, 0, 0, 8), B(0.03, 1.4, 0.03, 0x606068, 0, 0.03, 0), C(0.22, 0.14, 0.3, GL(0xffe4b0), 0, 1.4, 0, 8));
const tischlampe = () => G(C(0.1, 0.1, 0.03, 0x4a4a52, 0, 0, 0, 8), B(0.03, 0.28, 0.03, 0x606068, 0, 0.03, 0), C(0.14, 0.09, 0.2, GL(0xffe4b0), 0, 0.3, 0, 8));
const pflanze = v => G(C(0.2, 0.15, 0.3, 0x8a4a30, 0, 0, 0, 8), ...Array.from({ length: 5 + v * 2 }, (_, i) => B(0.03, 0.4 + R() * 0.4, 0.12, 0x2f6a30, Math.cos(i * 1.3) * 0.08, 0.3, Math.sin(i * 1.3) * 0.08, 0.5 * Math.sin(i * 1.3), i, 0.5 * Math.cos(i * 1.3))));
const kissen = v => G(B(0.45, 0.12, 0.45, pick([0x7a2a2a, 0x2a4a6a, 0xc8b070, 0x3a6a4a], v), 0, 0, 0));
const teppich = v => G(B(2.4, 0.02, 1.6, pick([0x6a2a2a, 0x2a3a5a, 0x5a5a4a, 0x3a5a3a], v), 0, 0, 0), B(2.2, 0.025, 1.4, pick([0x8a4a3a, 0x3a4a7a, 0x7a7a60, 0x4a7a4a], v), 0, 0, 0));
const bild = v => G(B(0.7, 0.5, 0.05, 0x4a3320, 0, 0, 0), B(0.62, 0.42, 0.02, pick([0x4a6a8a, 0x8a6a40, 0x4a7a5a, 0x9a8a60], v), 0, 0.04, 0.03), B(0.62, 0.16, 0.02, pick([0x2a3a2a, 0x4a3a2a, 0x2a4a3a], v), 0, 0.04, 0.045));
const uhr = () => { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.05, 12), M(0xe8e4d8)); m.rotation.x = Math.PI / 2; m.position.set(0, 0.2, 0.03); return G(m, B(0.02, 0.15, 0.02, 0x111111, 0, 0.2, 0.06)); };
const wandspiegel = () => G(B(0.6, 1.0, 0.04, 0x4a3320, 0, 0, 0), B(0.5, 0.9, 0.02, 0x9aa8b0, 0, 0.05, 0.03));
const tv = () => G(B(1.1, 0.65, 0.07, 0x16161a, 0, 0.1, 0), B(1.0, 0.55, 0.02, 0x3a4a56, 0, 0.15, 0.04), B(0.4, 0.05, 0.2, 0x16161a, 0, 0.05, 0));
const karton = v => G(B(0.7 - v * 0.1, 0.5 - v * 0.05, 0.6, 0x9a7a4e, 0, 0, 0), B(0.72 - v * 0.1, 0.03, 0.04, 0x7a5a30, 0, 0.5 - v * 0.05, 0));
const koffer = v => G(B(0.75, 0.5, 0.28, pick([0x32465a, 0x7a2a2a, 0x2a2a30], v), 0, 0.05, 0), B(0.2, 0.05, 0.1, 0x111111, 0, 0.55, 0), B(0.05, 0.08, 0.05, 0x111111, -0.3, 0, 0), B(0.05, 0.08, 0.05, 0x111111, 0.3, 0, 0));
const bettEinfach = v => G(B(1.0, 0.3, 2.0, 0x6a4a2a, 0, 0, 0), B(0.92, 0.2, 1.9, pick([0xd8d2c4, 0x8a9ab0, 0xa07a6a], v), 0, 0.3, 0), B(0.6, 0.12, 0.35, 0xf0ece0, 0, 0.5, -0.7), B(1.0, 0.7, 0.06, 0x6a4a2a, 0, 0, -1.03));
const kommode = v => G(B(1.1, 0.8, 0.5, pick([0x8a6a3a, 0xc8b898, 0x4a3a2a], v), 0, 0, 0), ...[0, 1, 2].map(i => B(0.3, 0.04, 0.02, 0x222222, 0, 0.18 + i * 0.25, 0.26)));
const schrankEinfach = v => G(B(1.2, 2.0, 0.55, pick([0x8a6a3a, 0xc8b898, 0x4a3a2a], v), 0, 0, 0), B(0.02, 1.9, 0.02, 0x222222, 0, 0.05, 0.28), B(0.04, 0.2, 0.04, 0x222222, -0.1, 1.0, 0.29), B(0.04, 0.2, 0.04, 0x222222, 0.1, 1.0, 0.29));
const vase = v => G(C(0.1, 0.07, 0.28, pick([0x7aa0b0, 0xa05a3a, 0xd8d0c0], v), 0, 0, 0, 8), v % 2 ? B(0.02, 0.35, 0.02, 0x3a6a30, 0, 0.28, 0) : null);

export const CATS = ['Bäume', 'Büsche', 'Zäune', 'Lampen', 'Autos', 'Straße', 'Spielplatz', 'Möbel', 'Bücher', 'Deko', 'Modelle'];
const E = (id, cat, name, fp, o) => Object.assign({ id, cat, name, fp, solid: false, vars: 1 }, o);
const GLB = (id, name, file, sc, fp, extra = {}) => E(id, 'Modelle', name, fp, Object.assign({ solid: true, glb: 'furniture/' + file, sc }, extra));
export const ITEMS = [
  E('baum_birke', 'Bäume', 'Birke', [1, 1], { solid: true, vars: 2, build: birke }), E('baum_eiche', 'Bäume', 'Eiche', [1.2, 1.2], { solid: true, vars: 4, build: eiche }),
  E('baum_tanne', 'Bäume', 'Tanne', [1.2, 1.2], { solid: true, build: tanne }), E('baum_pappel', 'Bäume', 'Pappel (schmal, hoch)', [1, 1], { solid: true, vars: 4, build: pappel }),
  E('baum_tot', 'Bäume', 'Toter Baum', [1, 1], { solid: true, build: toterBaum }), E('baum_jung', 'Bäume', 'Jungbaum', [0.6, 0.6], { solid: true, vars: 4, build: jungbaum }),
  E('busch', 'Büsche', 'Busch', [1.4, 1.4], { solid: true, vars: 4, build: busch }), E('busch_flach', 'Büsche', 'Busch flach', [2, 1.4], { vars: 4, build: buschFlach }),
  E('hecke2', 'Büsche', 'Hecke 2 m', [2, 1], { solid: true, vars: 3, build: hecke(2) }), E('hecke4', 'Büsche', 'Hecke 4 m', [4, 1], { solid: true, vars: 3, build: hecke(4) }), E('hecke8', 'Büsche', 'Hecke 8 m', [8, 1], { solid: true, vars: 3, build: hecke(8) }),
  E('zaun_grau', 'Zäune', 'Maschendrahtzaun 2,2 m', [2.2, 0.2], { solid: true, build: zaunGrau }), E('zaun_holz', 'Zäune', 'Lattenzaun 2 m', [2.2, 0.2], { solid: true, vars: 3, build: zaunHolz }),
  E('zaun_gruen', 'Zäune', 'Grüner Zaun 2,2 m', [2.2, 0.2], { solid: true, build: zaunGruen }), E('mauer', 'Zäune', 'Mauer niedrig 2,2 m', [2.3, 0.4], { solid: true, vars: 3, build: mauerNiedrig }), E('absperr', 'Zäune', 'Absperrgitter', [2.2, 0.5], { solid: true, build: absperr }),
  E('laterne', 'Lampen', 'Straßenlaterne (leuchtet)', [0.3, 0.3], { solid: true, lamp: true, build: laterne }), E('poller', 'Lampen', 'Pollerleuchte', [0.3, 0.3], { solid: true, build: poller }),
  E('gartenlampe', 'Lampen', 'Gartenlampe', [0.3, 0.3], { build: gartenlampe }), E('wandlampe', 'Lampen', 'Wandlampe', [0.3, 0.2], { wall: true, build: wandlampe }),
  E('auto_klein', 'Autos', 'Kleinwagen', [1.8, 3.8], { solid: true, vars: 10, build: v => car('klein', v) }), E('auto_limo', 'Autos', 'Limousine', [1.8, 4.6], { solid: true, vars: 10, build: v => car('limo', v) }),
  E('auto_kombi', 'Autos', 'Kombi', [1.8, 4.7], { solid: true, vars: 10, build: v => car('kombi', v) }), E('auto_van', 'Autos', 'Transporter', [1.8, 5], { solid: true, vars: 10, build: v => car('van', v) }), E('auto_taxi', 'Autos', 'Taxi', [1.8, 4.6], { solid: true, build: () => car('taxi', 4) }),
  E('tonne', 'Straße', 'Mülltonne', [0.7, 0.7], { solid: true, vars: 4, build: mullTonne }), E('container', 'Straße', 'Altglascontainer', [2, 1], { solid: true, build: container }), E('bank', 'Straße', 'Parkbank', [1.7, 0.6], { solid: true, vars: 3, build: bank }),
  E('fahrradstaender', 'Straße', 'Fahrradständer', [1.4, 0.6], { build: fahrradstaender }), E('fahrrad', 'Straße', 'Fahrrad', [0.4, 1.2], { vars: 3, build: fahrrad }), E('schild', 'Straße', 'Verkehrsschild', [0.3, 0.3], { solid: true, vars: 3, build: schild }),
  E('briefkasten', 'Straße', 'Briefkasten (Straße)', [0.5, 0.4], { solid: true, build: briefkasten }), E('stromkasten', 'Straße', 'Stromkasten', [1, 0.5], { solid: true, build: stromkasten }), E('papierkorb', 'Straße', 'Papierkorb', [0.4, 0.4], { build: papierkorb }),
  E('kiste', 'Straße', 'Holzkiste', [1, 1], { solid: true, vars: 2, build: kiste }), E('palette', 'Straße', 'Palette', [1.2, 1.2], { build: palette }),
  E('sandkasten', 'Spielplatz', 'Sandkasten', [2.8, 2.8], { build: sandkasten }), E('wippe', 'Spielplatz', 'Wippe', [3, 0.5], { solid: true, build: wippe }), E('rutsche', 'Spielplatz', 'Rutsche', [1.2, 4.5], { solid: true, build: rutsche }), E('schaukel', 'Spielplatz', 'Schaukel', [4.4, 0.4], { solid: true, build: schaukel }),
  E('tisch', 'Möbel', 'Tisch', [1.3, 0.8], { solid: true, vars: 3, build: tisch }), E('stuhl', 'Möbel', 'Stuhl', [0.5, 0.5], { vars: 3, build: stuhl }), E('hocker', 'Möbel', 'Hocker', [0.5, 0.5], { build: hocker }),
  E('bett', 'Möbel', 'Bett einfach', [1.0, 2.0], { solid: true, vars: 3, build: bettEinfach }), E('kommode', 'Möbel', 'Kommode', [1.1, 0.5], { solid: true, vars: 3, build: kommode }), E('schrank', 'Möbel', 'Schrank', [1.2, 0.55], { solid: true, vars: 3, build: schrankEinfach }),
  E('regal', 'Möbel', 'Regal leer', [1.2, 0.32], { solid: true, build: regalLeer }), E('tv', 'Möbel', 'Fernseher', [1.1, 0.2], { build: tv }), E('stehlampe', 'Möbel', 'Stehlampe', [0.35, 0.35], { build: stehlampe }), E('tischlampe', 'Möbel', 'Tischlampe', [0.25, 0.25], { build: tischlampe }),
  E('buch', 'Bücher', 'Buch', [0.2, 0.28], { vars: 8, build: buch }), E('buchstapel', 'Bücher', 'Bücherstapel', [0.25, 0.3], { vars: 8, build: buchStapel }), E('buchreihe', 'Bücher', 'Buchreihe (9 Bücher)', [0.45, 0.2], { vars: 8, build: buchReihe }),
  E('buchauf', 'Bücher', 'Aufgeschlagenes Buch', [0.4, 0.28], { build: buchAufgeschlagen }), E('regal_voll', 'Bücher', 'Bücherregal gefüllt', [1.2, 0.32], { solid: true, vars: 8, build: regalGefuellt }),
  E('pflanze', 'Deko', 'Zimmerpflanze', [0.4, 0.4], { vars: 4, build: pflanze }), E('kissen', 'Deko', 'Kissen', [0.45, 0.45], { vars: 4, build: kissen }), E('teppich', 'Deko', 'Teppich', [2.4, 1.6], { vars: 4, build: teppich }),
  E('bild', 'Deko', 'Bild (Wand)', [0.7, 0.05], { wall: true, vars: 4, build: bild }), E('uhr', 'Deko', 'Wanduhr', [0.4, 0.05], { wall: true, build: uhr }), E('wandspiegel', 'Deko', 'Wandspiegel', [0.6, 0.05], { wall: true, build: wandspiegel }),
  E('karton', 'Deko', 'Karton', [0.7, 0.6], { solid: true, vars: 3, build: karton }), E('koffer', 'Deko', 'Koffer', [0.75, 0.3], { vars: 3, build: koffer }), E('vase', 'Deko', 'Vase', [0.2, 0.2], { vars: 3, build: vase }),
  GLB('m_sofa', 'Sofa (Modell)', 'SofaDouble.glb', 1.4, [1.0, 1.9]), GLB('m_sofalang', 'Sofa lang (Modell)', 'SofaLong.glb', 1.4, [1.9, 1.9]), GLB('m_sessel', 'Sessel (Modell)', 'Sofa.glb', 1.4, [1, 1.2]),
  GLB('m_bettgross', 'Doppelbett (Modell)', 'BedKing.glb', 1.3, [1.9, 1.8]), GLB('m_bett', 'Bett (Modell)', 'Bed.glb', 1.3, [1.9, 1.2]), GLB('m_tisch', 'Tisch (Modell)', 'Table.glb', 1.2, [1.3, 1.2]),
  GLB('m_couchtisch', 'Couchtisch (Modell)', 'CoffeeTable.glb', 1.2, [0.7, 1.2]), GLB('m_stuhl', 'Stuhl (Modell)', 'Chair.glb', 0.95, [0.5, 0.5], { solid: false }), GLB('m_stuhl2', 'Stuhl mit Polster (Modell)', 'ChairCushioned.glb', 0.95, [0.5, 0.5], { solid: false }),
  GLB('m_regalbuecher', 'Regal mit Büchern (Modell)', 'BookCaseBooks.glb', 1.3, [0.6, 1.0]), GLB('m_regalgross', 'Großes Regal (Modell)', 'BookCaseLarge.glb', 1.3, [0.6, 2.0]), GLB('m_schrank', 'Kleiderschrank (Modell)', 'Closet.glb', 1.35, [0.5, 0.9]),
  GLB('m_schrank2', 'Schrank niedrig (Modell)', 'Closet2.glb', 1.35, [0.6, 0.9]), GLB('m_lampe', 'Stehlampe (Modell)', 'Lamp.glb', 1.5, [0.35, 0.35], { solid: false }), GLB('m_pflanze', 'Pflanze (Modell)', 'Plant.glb', 3, [0.5, 0.5], { solid: false }), GLB('m_hocker', 'Hocker (Modell)', 'Stool.glb', 1.2, [0.5, 0.5], { solid: false })
];
export const BYID = Object.fromEntries(ITEMS.map(i => [i.id, i]));

/* ---------- Erzeugung (auch für Modelle aus Dateien) ---------- */
const FCOL = { Wood: 0x9a6a3c, DarkWood: 0x5a3a22, DarkBrown: 0x6a4a30, Sofa: 0x5a6a80, Sheets: 0xd8d2c4, White: 0xe6e0d4, Cover2: 0x7a2a2a, Cover3: 0x2a4a6a, Cover4: 0x3a6a4a, Pages: 0xd8d0b0, Top: 0xe8d8b0, Metal: 0x808088, Vase: 0x7aa0b0, Green: 0x3a7a3a, Red: 0x8a2a28 };
const loader = new GLTFLoader(), glbCache = {};
export async function buildItem(item, v = 0) {
  sd = 11 + v * 7;
  if (item.glb) {
    glbCache[item.glb] = glbCache[item.glb] || loader.loadAsync('assets/models/' + item.glb).then(g => g.scene);
    const src = (await glbCache[item.glb]).clone(true), inner = new THREE.Group(), wrap = new THREE.Group();
    src.traverse(m => { if (m.isMesh) { const o = m.material, b = (o.name || '').split('.')[0]; m.material = new THREE.MeshLambertMaterial({ color: FCOL[b] !== undefined ? FCOL[b] : 0xa89880 }); } });
    inner.add(src); inner.scale.setScalar(item.sc);
    const b1 = new THREE.Box3().setFromObject(inner), c = new THREE.Vector3(); b1.getCenter(c); inner.position.set(-c.x, -b1.min.y, -c.z);
    wrap.add(inner); wrap.rotation.y = 0; wrap.userData.glbFront = '+x'; return wrap;
  }
  return item.build(v);
}
