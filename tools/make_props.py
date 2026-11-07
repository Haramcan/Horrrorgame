import bpy, bmesh, math, sys, os
from mathutils import Vector

OUT = '/home/user/horrrorgame/assets/models/props/'
os.makedirs(OUT, exist_ok=True)
PREVIEW = sys.argv[-1]

def clear():
    bpy.ops.wm.read_factory_settings(use_empty=True)

def mat(name, color, rough=0.7, metal=0.0, emit=None, emit_strength=0):
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (*color, 1); b.inputs['Roughness'].default_value = rough; b.inputs['Metallic'].default_value = metal
    if emit:
        b.inputs['Emission Color'].default_value = (*emit, 1); b.inputs['Emission Strength'].default_value = emit_strength
    return m

def obj_from_bm(bm, name, material):
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new(name, me); bpy.context.collection.objects.link(o)
    o.data.materials.append(material)
    for p in me.polygons: p.use_smooth = True
    return o

def box(name, size, loc, material, rot=(0, 0, 0), bevel=0.004):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc, rotation=rot)
    o = bpy.context.active_object; o.name = name; o.scale = size
    bpy.ops.object.transform_apply(scale=True)
    if bevel:
        bv = o.modifiers.new('bv', 'BEVEL'); bv.width = bevel; bv.segments = 2
    o.data.materials.append(material); return o

def cyl(name, r, h, loc, material, rot=(0, 0, 0), seg=24, r2=None):
    if r2 is None:
        bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=h, location=loc, rotation=rot, vertices=seg)
    else:
        bpy.ops.mesh.primitive_cone_add(radius1=r, radius2=r2, depth=h, location=loc, rotation=rot, vertices=seg)
    o = bpy.context.active_object; o.name = name; o.data.materials.append(material)
    for p in o.data.polygons: p.use_smooth = True
    return o

def arc_plank(name, radius, a0, a1, width, thick, material, steps=40):
    """Gebogenes Brett (Kufe, Hufeisen): Bogen in der XZ-Ebene, Dicke nach außen, Breite in Y."""
    bm = bmesh.new(); rings = []
    for i in range(steps + 1):
        a = a0 + (a1 - a0) * i / steps
        d = Vector((math.cos(a), 0, math.sin(a)))
        v = []
        for ro, y in ((radius, -width / 2), (radius + thick, -width / 2), (radius + thick, width / 2), (radius, width / 2)):
            v.append(bm.verts.new(d * ro + Vector((0, y, 0))))
        rings.append(v)
    for i in range(steps):
        for k in range(4):
            bm.faces.new((rings[i][k], rings[i][(k + 1) % 4], rings[i + 1][(k + 1) % 4], rings[i + 1][k]))
    bm.faces.new(rings[0]); bm.faces.new(list(reversed(rings[-1])))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return obj_from_bm(bm, name, material)

def join(objs, name):
    bpy.ops.object.select_all(action='DESELECT')
    for o in objs: o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    for o in objs:
        for m in list(o.modifiers):
            bpy.context.view_layer.objects.active = o
            bpy.ops.object.modifier_apply(modifier=m.name)
    bpy.ops.object.select_all(action='DESELECT')
    for o in objs: o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    bpy.ops.object.join(); o = bpy.context.active_object; o.name = name; return o

wood = lambda: mat('Holz', (0.30, 0.17, 0.08), 0.8)
woodl = lambda: mat('HolzHell', (0.45, 0.28, 0.14), 0.8)
iron = lambda: mat('Eisen', (0.08, 0.08, 0.09), 0.55, 0.9)
brass = lambda: mat('Messing', (0.75, 0.55, 0.22), 0.35, 1.0)

def make_cradle():
    w, wl = wood(), woodl(); parts = []
    # Boden und geneigte Seitenbretter
    parts.append(box('boden', (0.46, 0.84, 0.03), (0, 0, 0.16), w))
    for s in (-1, 1):
        parts.append(box('seite', (0.03, 0.84, 0.30), (s * 0.27, 0, 0.30), wl, rot=(0, s * 0.22, 0)))
    # Kopf- und Fußbrett (Kopfende höher)
    parts.append(box('kopf', (0.58, 0.03, 0.46), (0, -0.42, 0.37), wl))
    parts.append(box('fuss', (0.56, 0.03, 0.32), (0, 0.42, 0.30), wl))
    # Zierleiste mit Zacken am Kopfbrett
    for i in range(5): parts.append(box('zier', (0.04, 0.03, 0.07), (-0.2 + i * 0.1, -0.42, 0.63), w, bevel=0.003))
    # Kufen (gebogen) unter der Wiege
    for s in (-1, 1):
        k = arc_plank('kufe', 0.55, math.radians(226), math.radians(314), 0.035, 0.035, w, 32)
        k.rotation_euler = (0, 0, math.radians(90)); k.location = (s * 0.22, 0, 0.56)
        # Bogen liegt in XZ; auf YZ drehen, so dass er entlang der Wiege-Länge verläuft
        parts.append(k)
    # Verbindungsstreben Kufe-Wiege
    for s in (-1, 1):
        for y in (-0.33, 0.33): parts.append(box('strebe', (0.035, 0.035, 0.14), (s * 0.22, y, 0.09), w))
    return join(parts, 'Wiege')

def make_lamp():
    parts = []; b = brass(); g = mat('Glas', (0.9, 0.95, 1.0), 0.03, 0.0); g.node_tree.nodes['Principled BSDF'].inputs['Transmission Weight'].default_value = 1.0; g.node_tree.nodes['Principled BSDF'].inputs['IOR'].default_value = 1.45
    parts.append(cyl('fuss', 0.07, 0.03, (0, 0, 0.015), b, seg=24))
    parts.append(cyl('tank', 0.085, 0.07, (0, 0, 0.075), b, seg=24, r2=0.06))
    parts.append(cyl('hals', 0.03, 0.03, (0, 0, 0.125), b, seg=16))
    parts.append(cyl('brenner', 0.045, 0.025, (0, 0, 0.152), b, seg=16))
    parts.append(cyl('glas', 0.055, 0.17, (0, 0, 0.25), g, seg=24, r2=0.04))
    parts.append(cyl('kappe', 0.045, 0.02, (0, 0, 0.345), b, seg=16))
    parts.append(cyl('docht', 0.012, 0.012, (0, 0, 0.17), mat('Flamme', (1, 0.6, 0.15), 0.5, 0, (1.0, 0.55, 0.1), 6), seg=10))
    # Henkel
    bm = bmesh.new(); bmesh.ops.create_circle(bm, radius=0.1, segments=24)
    h = arc_plank('henkel', 0.1, math.radians(20), math.radians(160), 0.012, 0.012, b, 24); h.location = (0, 0, 0.09); h.rotation_euler = (0, 0, 0)
    parts.append(h)
    return join(parts, 'Oellampe')

def make_horseshoe():
    i = iron()
    a = arc_plank('eisen', 0.075, math.radians(-60), math.radians(240), 0.03, 0.018, i, 40)
    # Enden etwas dicker, Nagellöcher als kleine Zylinder-Marken
    parts = [a]
    for ang in (-40, -10, 20, 160, 190, 220):
        r = math.radians(ang); c = cyl('nagel', 0.0045, 0.034, (math.cos(r) * 0.084, 0, math.sin(r) * 0.084), mat('Nagel', (0.02, 0.02, 0.02), 0.6, 0.5), rot=(math.pi / 2, 0, 0), seg=8)
        c.location.y = 0; parts.append(c)
    o = join(parts, 'Hufeisen'); o.rotation_euler = (math.pi / 2, 0, 0); bpy.ops.object.transform_apply(rotation=True); return o

def make_muska():
    cloth = mat('Stoff', (0.12, 0.38, 0.26), 0.9); cord = mat('Schnur', (0.6, 0.45, 0.2), 0.9)
    bm = bmesh.new()
    t = 0.022
    a, b2, c = Vector((-0.06, 0, 0)), Vector((0.06, 0, 0)), Vector((0, 0, 0.1))
    f = [bm.verts.new(v + Vector((0, -t, 0))) for v in (a, b2, c)] + [bm.verts.new(v + Vector((0, t, 0))) for v in (a, b2, c)]
    bm.faces.new((f[0], f[2], f[1])); bm.faces.new((f[3], f[4], f[5]))
    for i in range(3): j = (i + 1) % 3; bm.faces.new((f[i], f[j], f[3 + j], f[3 + i]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    body = obj_from_bm(bm, 'muska', cloth)
    sub = body.modifiers.new('sub', 'SUBSURF'); sub.levels = 1
    loop = arc_plank('schnur', 0.02, math.radians(0), math.radians(340), 0.006, 0.006, cord, 20); loop.rotation_euler = (math.pi / 2, 0, 0); loop.location = (0, 0, 0.082)
    stitch = box('naht', (0.09, 0.047, 0.004), (0, 0, 0.012), cord, bevel=0)
    return join([body, loop, stitch], 'Muska')

def make_pocket_mirror():
    b = brass(); gl = mat('Spiegel', (0.9, 0.93, 0.97), 0.02, 1.0)
    parts = [cyl('rand', 0.045, 0.012, (0, 0, 0.006), b, seg=32), cyl('glas', 0.039, 0.004, (0, 0, 0.0138), gl, seg=32)]
    ring = arc_plank('ring', 0.046, math.radians(0), math.radians(359), 0.01, 0.004, b, 32); ring.rotation_euler = (math.pi / 2, 0, 0); ring.location = (0, 0, 0.007)
    parts.append(ring)
    parts.append(cyl('oese', 0.007, 0.004, (0.052, 0, 0.006), b, rot=(math.pi / 2, 0, 0), seg=12))
    return join(parts, 'Taschenspiegel')

MAKERS = [('Wiege', make_cradle), ('Oellampe', make_lamp), ('Hufeisen', make_horseshoe), ('Muska', make_muska), ('Taschenspiegel', make_pocket_mirror)]

# GLB-Export einzeln
import addon_utils
try: addon_utils.enable('io_scene_gltf2', default_set=True, persistent=False)
except Exception as e: print('addon:', e)
for name, fn in MAKERS:
    clear(); o = fn()
    bpy.ops.object.select_all(action='DESELECT'); o.select_set(True); bpy.context.view_layer.objects.active = o
    bpy.ops.object.shade_smooth()
    bpy.ops.export_scene.gltf(filepath=OUT + name + '.glb', export_format='GLB', use_selection=True, export_apply=True)
    print('exportiert', name)

# Vorschau: alle nebeneinander
clear()
objs = []
for k, (name, fn) in enumerate(MAKERS):
    o = fn(); o.location.x = k * 0.8 - 1.6; objs.append(o)
    bpy.context.view_layer.objects.active = o
bpy.ops.mesh.primitive_plane_add(size=8, location=(0, 0, 0)); fl = bpy.context.active_object; fl.data.materials.append(mat('Boden', (0.16, 0.13, 0.11), 0.95))
sc = bpy.context.scene; sc.render.engine = 'CYCLES'; sc.cycles.samples = 64; sc.cycles.device = 'CPU'; sc.cycles.use_denoising = False
sc.render.resolution_x = 1500; sc.render.resolution_y = 560; sc.render.filepath = PREVIEW
bpy.ops.object.light_add(type='AREA', location=(0, -2.5, 3)); L = bpy.context.active_object; L.data.energy = 220; L.data.size = 4; L.rotation_euler = (math.radians(35), 0, 0)
bpy.ops.object.light_add(type='POINT', location=(-2.5, -1.5, 1.2)); P = bpy.context.active_object; P.data.energy = 120; P.data.color = (1.0, 0.7, 0.4)
sc.world = bpy.data.worlds.new('w'); sc.world.use_nodes = True; sc.world.node_tree.nodes['Background'].inputs[0].default_value = (0.05, 0.06, 0.09, 1)
bpy.ops.object.camera_add(location=(0, -4.4, 1.0), rotation=(math.radians(80), 0, 0)); sc.camera = bpy.context.active_object; sc.camera.data.lens = 30
bpy.ops.render.render(write_still=True)
print('fertig')
