"""Baut das Dorf Kuyulu neu auf: Gassen, die sich verzweigen, und Häusergruppen (2 bis 3 Häuser, die sich
gegenüberstehen), dazwischen freie Stücke. Schreibt 'lanes' und 'houses' in map/kuyulu_map.json und setzt die
14 freien Wohnhäuser (wh1..wh14) auf Häuser der neuen Gruppen.  Aufruf: python3 tools/gen_village.py"""
import json, math, random, os
P = os.path.join(os.path.dirname(__file__), '..', 'map', 'kuyulu_map.json')
m = json.load(open(P, encoding='utf-8'))
rnd = random.Random(7)
pl = {p['id']: p for p in m['places']}

# ---- Gassennetz: Hauptgasse durch das Dorf, davon zweigen Gassen ab, von denen wieder kurze Stichgassen abgehen
LANES = {
  'haupt_w':  [[480, 510], [452, 517], [420, 520], [372, 524], [320, 536], [280, 534], [240, 532], [195, 536], [148, 540]],   # Platz -> Schmiede -> Friedhofstor
  'oma':      [[480, 510], [492, 486], [512, 462], [540, 440], [572, 431], [600, 430], [628, 430], [650, 432]],               # Platz -> Haus der Großmutter
  'moschee':  [[480, 510], [482, 480], [480, 450], [480, 432]],
  'hamam':    [[480, 510], [476, 548], [470, 580], [462, 612], [450, 640], [428, 668], [400, 690], [370, 708], [340, 722]],
  'muehle':   [[480, 510], [508, 552], [540, 600], [570, 650], [600, 700], [632, 738], [660, 770]],
  'west_n':   [[480, 510], [456, 492], [430, 470], [406, 450], [385, 432]],                                                   # zum Haus mit dem Tagebuch
  'berg_m':   [[540, 440], [552, 400], [560, 360], [568, 330], [575, 300], [580, 196]],                                        # Bergpfad zur Hütte Mitte
  'quelle':   [[430, 470], [427, 425], [425, 380], [436, 342], [450, 308]],
  'berg_w':   [[336, 534], [342, 505], [322, 470], [300, 420], [318, 320], [338, 221]],
  'berg_o':   [[650, 432], [680, 392], [710, 350], [742, 290], [770, 236]],
  # neue Stichgassen
  'gasthaus': [[420, 520], [412, 546], [402, 562]],
  'sued_w':   [[400, 584], [398, 612], [400, 640]],
  'haus1':    [[508, 552], [534, 566], [552, 574]],
  'ost_s':    [[640, 480], [652, 512], [648, 548], [628, 576], [600, 590]],
  'brunnen_o':[[560, 500], [582, 512], [600, 520]],
  'nordost':  [[600, 430], [612, 396], [632, 368], [660, 352]],
  'nordwest': [[425, 380], [396, 368], [366, 362], [340, 366]],
  'west_s':   [[320, 536], [306, 562], [296, 598], [300, 634]],
  'saege':    [[540, 600], [530, 660], [524, 720], [520, 768]],
  'kinder':   [[540, 440], [552, 444], [560, 452]],
}
# Abschnitte, an denen Häuser stehen dürfen (Bergpfade nur am Dorfrand)
BUILD = {'haupt_w': (22, 250), 'oma': (26, 150), 'hamam': (30, 190), 'muehle': (30, 175), 'west_n': (24, 95), 'berg_m': (18, 105), 'quelle': (18, 120),
         'berg_w': (22, 95), 'berg_o': (26, 80), 'ost_s': (16, 150), 'nordost': (14, 90), 'nordwest': (14, 90), 'west_s': (16, 110), 'saege': (20, 100), 'sued_w': (6, 60)}
road = m['road']

def seglen(a, b): return math.hypot(b[0] - a[0], b[1] - a[1])
def at(L, s):
    for a, b in zip(L, L[1:]):
        l = seglen(a, b)
        if s <= l: t = s / l; return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t], [(b[0] - a[0]) / l, (b[1] - a[1]) / l]
        s -= l
    a, b = L[-2], L[-1]; l = seglen(a, b); return list(b), [(b[0] - a[0]) / l, (b[1] - a[1]) / l]
def dseg(p, a, b):
    dx, dy = b[0] - a[0], b[1] - a[1]; l = dx * dx + dy * dy
    t = max(0, min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / l)) if l else 0
    return math.hypot(p[0] - a[0] - dx * t, p[1] - a[1] - dy * t)
def dpoly(p, L): return min(dseg(p, a, b) for a, b in zip(L, L[1:]))

story = [(p['x'], p['y'], {'hamam': 24, 'archiv': 20, 'stall': 15, 'gasthaus': 14, 'saegewerk': 14, 'muehle': 14, 'haus_oma': 19}.get(p['id'], 11))
         for p in m['places'] if p['type'] == 'building' and not p['id'].startswith('wh')]
wells = [(pl[i]['x'], pl[i]['y'], 8) for i in ('brunnen2', 'brunnen3', 'quelle')]
houses = []

def free(p, name):
    if math.hypot(p[0] - 480, p[1] - 510) < 33: return False                 # Dorfplatz bleibt frei
    if dpoly(p, road) < 12 or dpoly(p, m['river']) < 45: return False
    for n, L in LANES.items():
        if dpoly(p, L) < (7.0 if n != name else 6.5): return False            # nie auf einer Gasse
    for x, y, r in story + wells:
        if math.hypot(p[0] - x, p[1] - y) < r + 5: return False
    for h in houses:
        if math.hypot(p[0] - h['x'], p[1] - h['z']) < 11.5: return False
    return True

def put(name, s, side, off):
    L = LANES[name]; c, t = at(L, s); n = [-t[1] * side, t[0] * side]
    p = [c[0] + n[0] * off, c[1] + n[1] * off]
    if not free(p, name): return False
    rot = math.degrees(math.atan2(-n[0], -n[1])) + rnd.uniform(-7, 7)        # Haustür (lokal +z) zeigt zur Gasse
    houses.append({'x': round(p[0], 1), 'z': round(p[1], 1), 'rot': round(rot, 1), 'lane': name})
    return True

for name, (s0, s1) in BUILD.items():
    s = s0 + rnd.uniform(0, 8)
    while s < s1:
        side = rnd.choice([-1, 1]); n = rnd.choice([2, 3, 3]); k = 0
        # Gruppe: zwei nebeneinander auf einer Seite, eines gegenüber (oder nur zwei gegenüber)
        k += put(name, s, side, rnd.uniform(9.5, 11.5))
        k += put(name, s + rnd.uniform(-2, 3), -side, rnd.uniform(9.5, 12))
        if n == 3: k += put(name, s + rnd.uniform(12.5, 14.5), side, rnd.uniform(9.5, 12.5))
        s += (26 if k else 10) + rnd.uniform(42, 70)                          # danach ein freies Stück

# 14 freie Wohnhäuser (Zufallsorte mit Geschichte) gleichmäßig auf die neuen Häuser verteilen
wh = [p for p in m['places'] if p['id'].startswith('wh')]
step = len(houses) / len(wh)
for i, p in enumerate(wh):
    h = houses[int(i * step + step / 2)]; h['place'] = p['id']; p['x'], p['y'] = h['x'], h['z']
# Story-Häuser zur nächsten Gasse drehen (Großmutter bleibt nach Süden, dort ist die Zaunlücke)
for p in m['places']:
    if p['id'] in ('stall', 'gasthaus', 'schmiede', 'saegewerk', 'muehle', 'haus1', 'haus2', 'haus3'):
        best = None
        for L in LANES.values():
            for a, b in zip(L, L[1:]):
                dx, dy = b[0] - a[0], b[1] - a[1]; l = dx * dx + dy * dy; t = max(0, min(1, ((p['x'] - a[0]) * dx + (p['y'] - a[1]) * dy) / l))
                q = (a[0] + dx * t, a[1] + dy * t); d = math.hypot(q[0] - p['x'], q[1] - p['y'])
                if d > 3 and (best is None or d < best[0]): best = (d, q)
        p['rot'] = round(math.degrees(math.atan2(best[1][0] - p['x'], best[1][1] - p['y'])), 1)
m['lanes'] = [[[round(a, 1), round(b, 1)] for a, b in L] for L in LANES.values()]
m['houses'] = houses
json.dump(m, open(P, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(len(houses), 'Häuser,', len(LANES), 'Gassen')
