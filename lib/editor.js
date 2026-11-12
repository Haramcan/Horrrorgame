// Karten-Editor für home.html. Taste Tab schaltet ihn ein und aus.
// Bedienung: Maus rechts gedrückt halten und ziehen = umsehen, W A S D = fliegen, Q / E = runter / hoch, Shift = schneller.
// Linke Maustaste = Platzieren, Löschen oder Aufnehmen (je nach Werkzeug). Alle Änderungen werden im Browser gespeichert und
// können als Text exportiert werden. Der Export enthält die ganze Änderungsliste; sie wird in map/home_edits.json abgelegt.
import * as THREE from 'three';
import { CATS, ITEMS, BYID, buildItem } from './props.js';

const KEY = 'destur_home_edits_v1';

export function initEditor(ctx) {
  const { scene, world, apt, camera, canvas, look, colliders, streetLamps, say, getPlayerPose, onToggle, merged } = ctx;
  const S = {
    on: false, tool: 'place', item: null, variant: 0, ry: 0, s: 1, snap: true, bright: true, radius: 0,
    cam: { pos: new THREE.Vector3(), yaw: 0, pitch: 0 }, keys: new Set(), rmb: false, ghost: null, ghostBusy: false,
    adds: [], removes: [], objs: new Map(), undo: [], nextId: 1, hover: null, mouse: { x: 0, y: 0, in: false }, lights: [], prevLook: true, prevFog: 0
  };
  window.__EDIT = S;
  const ray = new THREE.Raycaster(); ray.far = 600;
  const hi = new THREE.Box3Helper(new THREE.Box3(), 0xffd34d); hi.visible = false; hi.userData.noPick = true; scene.add(hi);
  const info = document.createElement('div');

  /* ---------- Oberfläche ---------- */
  const css = document.createElement('style');
  css.textContent = `
  #ed{position:fixed;left:8px;top:8px;bottom:8px;width:236px;background:#0d1016ee;border:1px solid #39445a;color:#dde1e8;font:13px "Segoe UI",system-ui,sans-serif;z-index:9;display:none;flex-direction:column;user-select:none}
  #ed h3{margin:0;padding:8px 10px;font-size:14px;letter-spacing:.12em;border-bottom:1px solid #39445a;background:#161c28}
  #ed .row{display:flex;flex-wrap:wrap;gap:4px;padding:6px 8px;border-bottom:1px solid #263042}
  #ed button{font:12px "Segoe UI",system-ui,sans-serif;color:#dde1e8;background:#1b2332;border:1px solid #39445a;padding:4px 7px;cursor:pointer}
  #ed button:hover{border-color:#e0894a}#ed button.on{border-color:#e0894a;color:#e0894a;background:#2a2118}
  #ed .cats{display:flex;flex-wrap:wrap;gap:3px;padding:6px 8px}
  #ed .items{flex:1;overflow:auto;padding:4px 8px;display:flex;flex-direction:column;gap:3px}
  #ed .items button{text-align:left}
  #ed label{font-size:12px;display:flex;align-items:center;gap:4px}
  #edinfo{position:fixed;left:252px;top:8px;right:8px;z-index:9;display:none;font:13px "Segoe UI",system-ui,sans-serif;color:#fff;text-shadow:0 0 4px #000,0 0 2px #000;pointer-events:none;line-height:1.5}
  #edinfo b{color:#ffd34d}
  #edmodal{position:fixed;inset:0;background:#000a;z-index:20;display:none;align-items:center;justify-content:center}
  #edmodal div{background:#0d1016;border:1px solid #39445a;padding:14px;width:min(760px,92vw);color:#dde1e8;font:13px "Segoe UI",system-ui,sans-serif}
  #edmodal textarea{width:100%;height:300px;background:#05070a;color:#bfe0bf;border:1px solid #39445a;font:11px Consolas,monospace}
  #edmodal button{margin:8px 6px 0 0;font:13px "Segoe UI",system-ui,sans-serif;color:#dde1e8;background:#1b2332;border:1px solid #39445a;padding:6px 12px;cursor:pointer}`;
  document.head.appendChild(css);
  const ui = document.createElement('div'); ui.id = 'ed';
  ui.innerHTML = `<h3>EDITOR</h3>
  <div class="row" id="edtools"><button data-t="place">Platzieren</button><button data-t="delete">Löschen</button><button data-t="pick">Aufnehmen</button></div>
  <div class="row"><button id="edundo">Rückgängig (Strg+Z)</button><label><input type="checkbox" id="edsnap" checked> Raster 0,5 m</label><label><input type="checkbox" id="edbright" checked> Hell</label>
  <label style="width:100%">Löschradius <input type="range" id="edrad" min="0" max="6" step="0.5" value="0" style="flex:1"> <span id="edradv">0</span> m</label></div>
  <div class="cats" id="edcats"></div><div class="items" id="editems"></div>
  <div class="row"><button id="edexp">Exportieren</button><button id="edimp">Importieren</button><button id="edres">Alles zurücksetzen</button><button id="edquit" style="width:100%">Editor beenden (Tab)</button></div>`;
  document.body.appendChild(ui); info.id = 'edinfo'; document.body.appendChild(info);
  const modal = document.createElement('div'); modal.id = 'edmodal'; modal.innerHTML = '<div><b id="edmt"></b><p id="edmp" style="margin:6px 0;opacity:.8"></p><textarea id="edmta" spellcheck="false"></textarea><br><button id="edmok">OK</button><button id="edmcopy">Kopieren</button><button id="edmx">Schließen</button></div>';
  document.body.appendChild(modal);
  const $ = id => document.getElementById(id);
  let curCat = CATS[0];
  function renderItems() {
    $('edcats').innerHTML = CATS.map(c => `<button data-c="${c}" class="${c === curCat ? 'on' : ''}">${c}</button>`).join('');
    $('editems').innerHTML = ITEMS.filter(i => i.cat === curCat).map(i => `<button data-i="${i.id}" class="${S.item && S.item.id === i.id ? 'on' : ''}">${i.name}${i.vars > 1 ? ' · ' + i.vars + ' Farben' : ''}</button>`).join('');
  }
  renderItems();
  $('edcats').onclick = e => { const c = e.target.dataset.c; if (c) { curCat = c; renderItems(); } };
  $('editems').onclick = e => { const id = e.target.dataset.i; if (id) { selectItem(BYID[id]); setTool('place'); } };
  $('edtools').onclick = e => { const t = e.target.dataset.t; if (t) setTool(t); };
  $('edsnap').onchange = e => S.snap = e.target.checked;
  $('edbright').onchange = e => { S.bright = e.target.checked; applyBright(); };
  $('edrad').oninput = e => { S.radius = +e.target.value; $('edradv').textContent = S.radius; };
  $('edundo').onclick = () => undo();
  $('edquit').onclick = () => toggle(false);
  $('edexp').onclick = () => openModal('Export', 'Kopiere den ganzen Text und füge ihn im Chat ein. Daraus wird die feste Karte.', exportText(), false);
  $('edimp').onclick = () => openModal('Import', 'Füge hier einen exportierten Text ein und klicke OK. Er ersetzt die aktuellen Änderungen.', '', true);
  $('edres').onclick = () => { if (confirm_('Alle Änderungen verwerfen und die Seite neu laden?')) { try { localStorage.removeItem(KEY); } catch (e) { } location.reload(); } };
  let modalOk = null;
  function openModal(t, p, text, canOk) { $('edmt').textContent = t; $('edmp').textContent = p; $('edmta').value = text; $('edmok').style.display = canOk ? '' : 'none'; modalOk = canOk ? () => { importText($('edmta').value); modal.style.display = 'none'; } : null; modal.style.display = 'flex'; }
  $('edmx').onclick = () => modal.style.display = 'none';
  $('edmok').onclick = () => modalOk && modalOk();
  $('edmcopy').onclick = () => { $('edmta').select(); try { navigator.clipboard.writeText($('edmta').value); } catch (e) { document.execCommand('copy'); } };
  const confirm_ = t => { try { return window.confirm(t); } catch (e) { return false; } };

  function setTool(t) { S.tool = t; document.querySelectorAll('#edtools button').forEach(b => b.classList.toggle('on', b.dataset.t === t)); if (t !== 'place') clearGhost(); else refreshGhost(); }
  function selectItem(it) { S.item = it; S.variant = 0; S.ry = it && it.glb ? 0 : 0; S.s = 1; renderItems(); refreshGhost(); }

  /* ---------- Hell-Modus ---------- */
  let amb = null;
  function applyBright() {
    if (!S.on) return;
    if (S.bright) { if (!amb) { amb = new THREE.AmbientLight(0xffffff, 1.9); amb.userData.noPick = true; scene.add(amb); } amb.visible = true; look.enabled = false; scene.fog.density = 0.0006; }
    else { if (amb) amb.visible = false; look.enabled = S.prevLook; scene.fog.density = S.prevFog; }
  }

  /* ---------- Speichern, Exportieren ---------- */
  function exportText() { return JSON.stringify({ v: 1, adds: S.adds, removes: S.removes }); }
  function save() { try { localStorage.setItem(KEY, exportText()); } catch (e) { } }
  async function importText(txt) {
    let d; try { d = JSON.parse(txt); } catch (e) { say('Das ist kein gültiger Export.', 4); return; }
    try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) { }
    say('Importiert. Die Seite lädt neu, damit alles stimmt.', 3); setTimeout(() => location.reload(), 800);
  }

  /* ---------- Gegenstände platzieren ---------- */
  const lvlOf = y => (y > 2 ? 1 : 0);
  function colliderFor(obj, entry, item) {
    if (!item.solid) return null;
    obj.updateMatrixWorld(true); const b = new THREE.Box3().setFromObject(obj), s = b.getSize(new THREE.Vector3());
    if (s.x < 0.05 || s.z < 0.05) return null;
    const c = { minX: b.min.x, maxX: b.max.x, minZ: b.min.z, maxZ: b.max.z, lvl: lvlOf(entry.y), ed: entry.id };
    colliders.push(c); return c;
  }
  async function spawn(entry, record = true) {
    const item = BYID[entry.t]; if (!item) return null;
    const g = await buildItem(item, entry.v || 0);
    g.position.set(entry.x, entry.y, entry.z); g.rotation.y = entry.ry || 0; g.scale.setScalar(entry.s || 1);
    g.userData.editId = entry.id; g.traverse(o => { if (o.isMesh) { o.castShadow = false; } });
    scene.add(g);
    const col = colliderFor(g, entry, item); let lampRef = null;
    if (item.lamp) { lampRef = { x: entry.x, z: entry.z, y: entry.y }; streetLamps.push(lampRef); }
    S.objs.set(entry.id, { obj: g, entry, col, lampRef });
    return g;
  }
  function removeEdObj(id) {
    const o = S.objs.get(id); if (!o) return;
    scene.remove(o.obj); if (o.col) { const i = colliders.indexOf(o.col); if (i >= 0) colliders.splice(i, 1); }
    if (o.lampRef) { const i = streetLamps.indexOf(o.lampRef); if (i >= 0) streetLamps.splice(i, 1); }
    S.objs.delete(id);
  }
  async function place(p, normal) {
    if (!S.item) return;
    const it = S.item;
    const rd = v => Math.round(v * 1000) / 1000;
    const entry = { id: 'e' + (S.nextId++), t: it.id, v: S.variant, x: rd(p.x), y: rd(p.y), z: rd(p.z), ry: rd(S.ry), s: S.s };
    if (it.wall && normal) { entry.ry = Math.atan2(normal.x, normal.z); entry.x += normal.x * 0.03; entry.z += normal.z * 0.03; entry.y = p.y; }
    S.adds.push(entry); await spawn(entry); S.undo.push({ k: 'add', id: entry.id }); save();
  }

  /* ---------- Löschen gewachsener Teile ---------- */
  function partRanges(mesh) { let a = 0; return mesh.userData.parts.map(pt => { const r = [a, a + pt.tris]; a += pt.tris; return r; }); }
  const isHuge = bb => { const s = bb.getSize(new THREE.Vector3()); return s.x > 40 || s.z > 40; };   // Boden, Straßen und Rasen sind nicht löschbar
  function removePart(mesh, i, rec) {
    const pt = mesh.userData.parts[i]; if (pt.removed || isHuge(pt.bb)) return null;
    const pos = mesh.geometry.attributes.position, rg = partRanges(mesh)[i], from = rg[0] * 3, to = rg[1] * 3;
    const backup = pos.array.slice(from * 3, to * 3); const c = pt.bb.getCenter(new THREE.Vector3());
    for (let v = from; v < to; v++) pos.setXYZ(v, c.x, c.y, c.z);
    pos.needsUpdate = true; pt.removed = true;
    const cols = takeColliders(pt.bb);
    return { mesh, i, from, backup, cols };
  }
  function restorePart(r) { const pos = r.mesh.geometry.attributes.position; pos.array.set(r.backup, r.from * 3); pos.needsUpdate = true; r.mesh.userData.parts[r.i].removed = false; colliders.push(...r.cols); }
  function takeColliders(bb) {
    const out = []; if (isHuge(bb)) return out;
    const c0 = bb.getCenter(new THREE.Vector3()), s0 = bb.getSize(new THREE.Vector3()), lv = bb.min.y > 2 ? 1 : 0;
    for (let i = colliders.length - 1; i >= 0; i--) {
      const c = colliders[i]; if (c.ed || (c.lvl || 0) !== lv) continue;
      const cw = c.maxX - c.minX, cd = c.maxZ - c.minZ, cx = (c.minX + c.maxX) / 2, cz = (c.minZ + c.maxZ) / 2;
      if (Math.hypot(cx - c0.x, cz - c0.z) < 0.7 && Math.abs(cw - s0.x) < 0.8 && Math.abs(cd - s0.z) < 0.8) { out.push(c); colliders.splice(i, 1); }
    }
    return out;
  }
  const tl = o => { while (o.parent && o.parent !== scene && o.parent !== world && o.parent !== apt) o = o.parent; return o; };
  const sig = o => o.isMesh ? o.geometry.type + (o.geometry.parameters ? [o.geometry.parameters.width, o.geometry.parameters.height, o.geometry.parameters.depth].map(v => v === undefined ? '' : (+v).toFixed(2)).join('/') : '') : 'Group' + o.children.length;
  const r2 = v => Math.round(v * 100) / 100;
  function removeTop(o) { const b = new THREE.Box3().setFromObject(o); const parent = o.parent; const cols = takeColliders(b); parent.remove(o); return { o, parent, cols }; }
  function restoreTop(r) { r.parent.add(r.o); colliders.push(...r.cols); }

  /* ---------- Zielauswahl ---------- */
  function visibleDeep(o) { for (let p = o; p; p = p.parent) { if (!p.visible) return false; if (p.userData.noPick) return false; } return true; }
  function pickAt(cx, cy) {
    const r = canvas.getBoundingClientRect(); ray.setFromCamera(new THREE.Vector2(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1), camera);
    const hits = ray.intersectObjects(scene.children, true);
    for (const h of hits) {
      const o = h.object; if (!o.isMesh || !visibleDeep(o) || o === S.ghost) continue;
      let p = o, ghost = false; for (; p; p = p.parent) if (p === S.ghost) ghost = true; if (ghost) continue;
      return h;
    }
    return null;
  }
  function describe(h) {
    if (!h) return null;
    for (let p = h.object; p; p = p.parent) if (p.userData.editId) return { kind: 'ed', id: p.userData.editId, obj: p, label: BYID[S.objs.get(p.userData.editId).entry.t].name };
    if (h.object.userData.parts) {
      const rg = partRanges(h.object), ti = h.faceIndex; let i = rg.findIndex(r => ti >= r[0] && ti < r[1]); if (i < 0) return null;
      return { kind: 'part', mesh: h.object, i, label: 'Teil (' + h.object.userData.key + ')', box: h.object.userData.parts[i].bb };
    }
    const t = tl(h.object); return { kind: 'top', obj: t, label: t.isMesh ? 'Objekt (' + t.geometry.type.replace('Geometry', '') + ')' : 'Objektgruppe' };
  }

  function doDelete(h) {
    const d = describe(h); if (!d) return;
    if (d.kind === 'ed') { const o = S.objs.get(d.id); const entry = o.entry; S.adds = S.adds.filter(a => a.id !== entry.id); removeEdObj(entry.id); S.undo.push({ k: 'deled', entry }); save(); return; }
    const group = [];
    if (d.kind === 'part') {
      const c = h.point.clone();
      if (S.radius > 0) { for (const m of merged) { const rg = m.userData.parts; rg.forEach((pt, i) => { if (!pt.removed && pt.bb.distanceToPoint(c) < S.radius) { const sz = pt.bb.getSize(new THREE.Vector3()); if (sz.x < 8 && sz.z < 8) group.push([m, i]); } }); } for (const [id, o] of [...S.objs]) { if (o.obj.position.distanceTo(c) < S.radius) { S.adds = S.adds.filter(a => a.id !== id); removeEdObj(id); S.undo.push({ k: 'deled', entry: o.entry, chain: true }); } } }
      else group.push([d.mesh, d.i]);
      const done = [], recs = [];
      for (const [m, i] of group) { const rr = removePart(m, i); if (rr) { done.push(rr); const pt = m.userData.parts[i], cc = pt.bb.getCenter(new THREE.Vector3()); recs.push(['p', m.userData.key, r2(cc.x), r2(cc.y), r2(cc.z), pt.tris]); } }
      if (done.length) { S.removes.push(...recs); S.undo.push({ k: 'delpart', done, n: recs.length }); save(); } else say('Das lässt sich nicht löschen (Boden oder Straße).', 3);
    } else {
      const p = new THREE.Vector3(); d.obj.getWorldPosition(p); const rec = ['m', sig(d.obj), r2(p.x), r2(p.y), r2(p.z)];
      const rr = removeTop(d.obj); S.removes.push(rec); S.undo.push({ k: 'deltop', rr, rec }); save();
    }
  }
  async function undo() {
    const u = S.undo.pop(); if (!u) { say('Nichts zum Rückgängigmachen.', 2); return; }
    if (u.k === 'add') { S.adds = S.adds.filter(a => a.id !== u.id); removeEdObj(u.id); }
    else if (u.k === 'deled') { S.adds.push(u.entry); await spawn(u.entry); }
    else if (u.k === 'delpart') { u.done.forEach(restorePart); S.removes.splice(S.removes.length - u.n, u.n); }
    else if (u.k === 'deltop') { restoreTop(u.rr); const i = S.removes.indexOf(u.rec); if (i >= 0) S.removes.splice(i, 1); }
    save();
  }

  /* ---------- Gespeicherte Änderungen anwenden (beim Start) ---------- */
  async function applyData(d) {
    S.adds = []; S.removes = [];
    for (const rec of d.removes || []) {
      if (rec[0] === 'p') {
        const m = merged.find(x => x.userData.key === rec[1]); if (!m) continue;
        const i = m.userData.parts.findIndex(pt => !pt.removed && pt.tris === rec[5] && pt.bb.getCenter(new THREE.Vector3()).distanceTo(new THREE.Vector3(rec[2], rec[3], rec[4])) < 0.04);
        if (i >= 0) { removePart(m, i); S.removes.push(rec); }
      } else {
        const p = new THREE.Vector3(), cand = [];
        for (const par of [scene, world, apt]) par.children.forEach(o => { if (!o.userData.editId && !o.userData.parts && !o.isLight && o !== hi) cand.push(o); });
        const o = cand.find(o => { o.getWorldPosition(p); return sig(o) === rec[1] && Math.abs(p.x - rec[2]) < 0.03 && Math.abs(p.y - rec[3]) < 0.03 && Math.abs(p.z - rec[4]) < 0.03; });
        if (o) { removeTop(o); S.removes.push(rec); }
      }
    }
    for (const e of d.adds || []) { S.adds.push(e); S.nextId = Math.max(S.nextId, (parseInt(String(e.id).slice(1)) || 0) + 1); await spawn(e); }
  }
  async function loadInitial() {
    let d = null; try { const s = localStorage.getItem(KEY); if (s) d = JSON.parse(s); } catch (e) { }
    if (!d) { try { const r = await fetch('map/home_edits.json?v=' + Date.now()); if (r.ok) d = await r.json(); } catch (e) { } }
    if (d) await applyData(d);
  }

  /* ---------- Vorschau-Geist ---------- */
  function clearGhost() { if (S.ghost) { scene.remove(S.ghost); S.ghost = null; } }
  async function refreshGhost() {
    clearGhost(); if (!S.on || S.tool !== 'place' || !S.item || S.ghostBusy) return;
    S.ghostBusy = true; const it = S.item, v = S.variant;
    try { const g = await buildItem(it, v); g.userData.noPick = true; g.traverse(o => { if (o.isMesh) { o.material = o.material.clone(); o.material.transparent = true; o.material.opacity = 0.6; o.userData.noPick = true; } }); if (S.on && S.tool === 'place' && S.item === it && S.variant === v) { S.ghost = g; scene.add(g); } } catch (e) { console.error(e); }
    S.ghostBusy = false;
  }
  let lastHit = null;
  function updateGhost(h) {
    if (!S.ghost || !h) { if (S.ghost) S.ghost.visible = false; return; }
    const p = h.point.clone(); if (S.snap && !S.item.wall) { p.x = Math.round(p.x * 2) / 2; p.z = Math.round(p.z * 2) / 2; }
    S.ghost.visible = true; S.ghost.position.copy(p); S.ghost.scale.setScalar(S.s);
    let ry = S.ry; const n = h.face ? h.face.normal.clone().transformDirection(h.object.matrixWorld) : null;
    if (S.item.wall && n && Math.abs(n.y) < 0.5) { ry = Math.atan2(n.x, n.z); S.ghost.position.addScaledVector(n, 0.03); }
    S.ghost.rotation.y = ry; lastHit = { p, n };
  }

  /* ---------- Umschalten, Steuerung ---------- */
  function toggle(on) {
    if (on === S.on) return;
    S.on = on;
    if (on) {
      const pose = getPlayerPose(); S.cam.pos.copy(pose.pos); S.cam.pos.y += 1.0; S.cam.yaw = pose.yaw; S.cam.pitch = Math.min(0, pose.pitch);
      S.prevLook = look.enabled; S.prevFog = scene.fog.density; ctx.setFree(S.cam);
      if (document.pointerLockElement) document.exitPointerLock();
      ui.style.display = 'flex'; info.style.display = 'block'; for (const id of ['tasks', 'sub']) { const el = document.getElementById(id); if (el) el.style.visibility = 'hidden'; } applyBright(); setTool(S.tool); refreshGhost();
    } else {
      for (const id of ['tasks', 'sub']) { const el = document.getElementById(id); if (el) el.style.visibility = ''; }
      ctx.setFree(null); clearGhost(); hi.visible = false; ui.style.display = 'none'; info.style.display = 'none'; modal.style.display = 'none';
      if (amb) amb.visible = false; look.enabled = S.prevLook; scene.fog.density = S.prevFog;
    }
    onToggle && onToggle(on);
  }
  addEventListener('keydown', e => {
    if (!S.on) return;
    if (modal.style.display === 'flex') return;
    if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName) && e.target.type !== 'checkbox' && e.target.type !== 'range') return;
    if (e.code === 'Tab') return;
    S.keys.add(e.code);
    if (e.code === 'KeyR') { S.ry += (e.shiftKey ? -1 : 1) * Math.PI / 4; if (S.item && S.ghost) S.ghost.rotation.y = S.ry; }
    if (e.code === 'KeyV' && S.item && S.item.vars > 1) { S.variant = (S.variant + 1) % S.item.vars; refreshGhost(); }
    if (e.code === 'Equal' || e.code === 'NumpadAdd') S.s = Math.min(3, +(S.s + 0.1).toFixed(2));
    if (e.code === 'Minus' || e.code === 'NumpadSubtract') S.s = Math.max(0.3, +(S.s - 0.1).toFixed(2));
    if (e.code === 'KeyZ' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); undo(); }
    if (e.code === 'Delete' || e.code === 'Backspace') { const h = pickAt(S.mouse.x, S.mouse.y); doDelete(h); }
    if (e.code === 'Escape') { S.item = null; clearGhost(); renderItems(); }
    if (e.code === 'Digit1') setTool('place'); if (e.code === 'Digit2') setTool('delete'); if (e.code === 'Digit3') setTool('pick');
    if (['Space', 'ArrowUp', 'ArrowDown'].includes(e.code)) e.preventDefault();
  });
  addEventListener('keyup', e => S.keys.delete(e.code));
  addEventListener('mousemove', e => { if (!S.on) return; S.mouse.x = e.clientX; S.mouse.y = e.clientY; S.mouse.in = e.target === canvas; if (S.rmb) { S.cam.yaw -= e.movementX * 0.004; S.cam.pitch = Math.max(-1.5, Math.min(1.5, S.cam.pitch - e.movementY * 0.004)); } });
  canvas.addEventListener('mousedown', async e => {
    if (!S.on) return;
    if (e.button === 2) { S.rmb = true; return; }
    if (e.button !== 0) return;
    const h = pickAt(e.clientX, e.clientY); if (!h) return;
    if (S.tool === 'place') { if (lastHit && S.item) await place(lastHit.p, lastHit.n && S.item.wall ? lastHit.n : null); }
    else if (S.tool === 'delete') doDelete(h);
    else if (S.tool === 'pick') { const d = describe(h); if (d && d.kind === 'ed') { const o = S.objs.get(d.id), en = o.entry; S.adds = S.adds.filter(a => a.id !== en.id); removeEdObj(en.id); save(); selectItem(BYID[en.t]); S.variant = en.v || 0; S.ry = en.ry || 0; S.s = en.s || 1; setTool('place'); } else say('Nur selbst platzierte Dinge lassen sich aufnehmen. Zum Entfernen nimm „Löschen“.', 3); }
  });
  addEventListener('mouseup', e => { if (e.button === 2) S.rmb = false; });
  canvas.addEventListener('contextmenu', e => { if (S.on) e.preventDefault(); });
  canvas.addEventListener('wheel', e => { if (!S.on) return; e.preventDefault(); const f = new THREE.Vector3(-Math.sin(S.cam.yaw) * Math.cos(S.cam.pitch), Math.sin(S.cam.pitch), -Math.cos(S.cam.yaw) * Math.cos(S.cam.pitch)); S.cam.pos.addScaledVector(f, -e.deltaY * 0.02); }, { passive: false });

  let hoverT = 0;
  function update(dt) {
    if (!S.on) return;
    const k = S.keys, sp = (k.has('ShiftLeft') || k.has('ShiftRight') ? 28 : 7) * dt, cy = S.cam.yaw, cp = S.cam.pitch;
    const f = (k.has('KeyW') ? 1 : 0) - (k.has('KeyS') ? 1 : 0), r = (k.has('KeyD') ? 1 : 0) - (k.has('KeyA') ? 1 : 0), u = (k.has('KeyE') ? 1 : 0) - (k.has('KeyQ') ? 1 : 0);
    S.cam.pos.x += (-Math.sin(cy) * Math.cos(cp) * f + Math.cos(cy) * r) * sp; S.cam.pos.z += (-Math.cos(cy) * Math.cos(cp) * f - Math.sin(cy) * r) * sp; S.cam.pos.y += (Math.sin(cp) * f + u) * sp;
    hoverT -= dt;
    if (hoverT <= 0 && S.mouse.in && !S.rmb && modal.style.display !== 'flex') {
      hoverT = 0.12; const h = pickAt(S.mouse.x, S.mouse.y); S.hover = h;
      const d = describe(h);
      if (S.tool === 'place') updateGhost(h);
      if (d && S.tool !== 'place') {
        const b = new THREE.Box3(); if (d.kind === 'part') b.copy(d.box); else b.setFromObject(d.obj);
        if (S.tool === 'delete' && S.radius > 0 && h) { b.setFromCenterAndSize(h.point, new THREE.Vector3(S.radius * 2, S.radius * 2, S.radius * 2)); }
        hi.box.copy(b); hi.visible = true; hi.material.color.set(S.tool === 'delete' ? 0xff5a4a : 0x4adf7a);
      } else if (S.tool === 'delete' && S.radius > 0 && h) { hi.box.setFromCenterAndSize(h.point, new THREE.Vector3(S.radius * 2, S.radius * 2, S.radius * 2)); hi.visible = true; hi.material.color.set(0xff5a4a); }
      else hi.visible = false;
      const it = S.item;
      info.innerHTML = `<b>${S.tool === 'place' ? 'Platzieren' : S.tool === 'delete' ? 'Löschen' : 'Aufnehmen'}</b>` + (S.tool === 'place' ? (it ? `: ${it.name} · Farbe ${S.variant + 1}/${it.vars} · Drehung ${Math.round(S.ry * 180 / Math.PI) % 360}° · Größe ${S.s}` : ': links einen Gegenstand wählen') : (d ? ': ' + d.label : '')) +
        `<br>Maus rechts halten = umsehen · W A S D Q E fliegen · <b>R</b> drehen · <b>V</b> Farbe · <b>+ −</b> Größe · <b>Entf</b> löschen · <b>Strg+Z</b> zurück · <b>1 2 3</b> Werkzeug · Tab beenden`;
    }
  }
  return { toggle, update, loadInitial, state: S, exportText, applyData };
}
