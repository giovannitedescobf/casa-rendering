// Casa Poggi (Milano, primo piano): generator of projects/casa-poggi/scene.json. All measures in cm (x right = east, y up = north toward the courtyard, z up); output in inches.
// Usage: node projects/casa-poggi/house.js [output_file]
// Source: floor plan PDF "Planimetria_Casa_Poggi_Milano_modificata" (stato di fatto). "measured" = printed on the drawing, "estimate" = guessed.
// Basic shell only: walls, openings, floor, balconies. No furniture, no materials yet (neutral colours).
const path = require('path');
const kit = require('../../scripts/scene-kit').createScene({ defaultOn: ['porte', 'armadio', 'porta-bagno', 'pittura', 'condizionatore', 'split-camera', 'lampada-terra', 'gatto', 'libreria', 'consolle-50', 'divano-soderhamn', 'credenza-zoom', 'porta-camera', 'pavimento-terrazzo'] });
const { box, wall, slab, tube, rbox, group, defGroup, light } = kit;

// ---------- dimensions (cm) ----------
const H = 330;                     // ceiling height                                   measured
const TE = 35;                     // bearing walls: cortile and via Poggi facades, east wall   measured on the drawing (scale 3.53 cm/pt)
const TW = 20;                     // camera west wall, cucina outer walls                    measured on the drawing
const TS = 15;                     // wall towards the common stair (soggiorno, ingresso)     measured on the drawing
const TI = 10;                     // partitions                                       user
const TB = 10;                     // partition soggiorno / bagno                     user
const ROOMS = {                    // clear interior sizes
  soggiorno: { w: 360, d: 440 },   // measured
  bagno:     { w: 129, d: 440 },   // measured
  cucina:    { w: 99,  d: 185 },   // measured (cucinotto separato; the oblique corner of the drawing is simplified to a rectangle)
  ingresso:  { w: 500, d: 160 },   // measured
  camera:    { w: 350, d: 485 },   // measured
};
const PARQUET = { tile: 59.4, bandOff: 25, bandW: 5, band: [92, 52, 28, 255] };   // tile = texture repeat (6 * sqrt(2) * 7 cm); border band 25 cm from the walls, 5 cm wide   estimate
const BALC_D = 120;                // balcony depth                                    estimate (2 balconies ~ 7 m2 as on the drawing)
const PF = { w: 120, h: 280 };     // porte-finestre (soggiorno, camera)               measured
const WB = { w: 40, h: 150, sill: 110 };   // bathroom window; sill                    measured w/h, sill estimate
const DOOR_H = 210, DOOR_W = 80;   // interior doors                                   estimate
const ENTRY_W = 90;                // front door                                       estimate
const K_SLANT = { west: 134, south: 63 };   // cucina oblique corner: straight west side 134 of 185, straight south side from the slant to the partition 99 - 63 = 36   estimate (read off the drawing)
const TK = TW;                     // cucina outer walls

// ---------- layout (derived) ----------
const XR = ROOMS.ingresso.w;                       // inner face of the east wall (500)
const YC1 = ROOMS.camera.d;                        // camera north face (485)
const YI0 = YC1 + TI, YI1 = YI0 + ROOMS.ingresso.d;   // ingresso 495..655
const YS0 = YI1 + TI, YS1 = YS0 + ROOMS.soggiorno.d;  // soggiorno / bagno 665..1105
const XC0 = XR - ROOMS.camera.w;                   // camera west face (150)
const XB0 = ROOMS.soggiorno.w + TB;                // bagno west face (371)
const KP = { w: 50, d: 35 };                       // pier left of the old cucina doorway, against the cortile wall (kept: can't be removed)   measured on the drawing
const XK1 = -KP.w, XK0 = XK1 - ROOMS.cucina.w;     // cucina -149..-50 (the 99 cm run ends at the pier)
const YK0 = YS1 - ROOMS.cucina.d;                  // cucina south face (920)

const WHITE = [250, 250, 248, 255];   // interior wall paint   user
const C = { wall: [236, 233, 228, 255], floor: [196, 186, 172, 255], balcony: [170, 168, 164, 255],
            rail: [70, 72, 76, 255], glass: [170, 205, 225, 80] };
const pf = (cx) => ({ from: cx - PF.w / 2, to: cx + PF.w / 2, head: PF.h });

// ---------- floor ----------
box('/Casa/Pavimento_Ingresso', C.floor, -TS, YI0 - TI, -4, XR + TE, YS0, 0);
box('/Casa/Pavimento_Bagno', C.floor, ROOMS.soggiorno.w, YS0, -4, XR + TE, YS1 + TE, 0);
box('/Casa/Pavimento_Soggiorno', C.floor, 0, YS0, -4, ROOMS.soggiorno.w, YS1 + TE, 0);
// terrazzo floor (Hus Milano "Rainbow Gleam", from the user's photo): 40 x 40 cm tiles, straight lay, no joints, every tile different (handmade),
// soggiorno + ingresso only, flush with the wall faces (not under the door thresholds). Thin skin over the base floor,
// in its own switchable group   tile size user
{ const TZ = { tile: 40, n: 5, z: 0.3 };   // the texture holds n x n different tiles (scripts/terrazzo-texture.py)
  defGroup('pavimento-terrazzo', 'Pavimento terrazzo Rainbow Gleam (40 x 40)', 'Finiture', 'pavimento', { fixed: true });
  group('pavimento-terrazzo', () => {
    // one piece for soggiorno + ingresso, also across the opening between them (user: no strip there)
    for (const [n, poly] of [['Soggiorno', [[0, YI0], [XR, YI0], [XR, YI1], [ROOMS.soggiorno.w, YI1], [ROOMS.soggiorno.w, YS1], [0, YS1]]]]) {
      slab(`/Pavimento_Terrazzo/Terrazzo_${n}`, [120, 112, 104, 255], poly, 0, TZ.z);
      kit.items[kit.items.length - 1].tex = { url: 'textures/terrazzo-rainbow-gleam.png', tile: kit.inch(TZ.tile * TZ.n) };
    }
  }); }

// alternative floor (off by default, the user picks it): Marazzi Frammento Macro Verde Naturale, rectified porcelain
// stoneware 60 x 120 cm, 9 mm (product sheet). Same area as the terrazzo; same variant, so only one floor is on at a time.
// Texture = 120 x 120 cm: 2 rows of one tile, long side along x, straight lay, 2 mm rectified joints; image from the shop
// page (one photo square = 60 x 60 cm, mirrored copies)   lay direction and image scale estimate
{ const MZ = { tile: 120, z: 0.3 };
  defGroup('pavimento-marazzi', 'Piastrella Marazzi Frammento Macro Verde Naturale (60 x 120)', 'Finiture', 'pavimento', { fixed: true });
  group('pavimento-marazzi', () => {
    slab('/Pavimento_Marazzi/Marazzi_Soggiorno', [228, 230, 224, 255], [[0, YI0], [XR, YI0], [XR, YI1], [ROOMS.soggiorno.w, YI1], [ROOMS.soggiorno.w, YS1], [0, YS1]], 0, MZ.z);
    kit.items[kit.items.length - 1].tex = { url: 'textures/marazzi-frammento-macro-verde.jpg', tile: kit.inch(MZ.tile) };
  }); }

// alternative floor (off by default, the user picks it): Marazzi Crogiolo D_Segni Colore Tappeto 8, cement-look tiles
// 20 x 20 cm, 10 mm, matt, R9 (product sheet). Same area and same variant as the other floors (one on at a time).
// Texture = one tile from the shop photo (white quarter diamonds in the corners make the pattern of the room photo),
// straight lay, thin joints   joint width estimate
{ const CG = { tile: 20, z: 0.3 };
  defGroup('pavimento-crogiolo', 'Marazzi Crogiolo Disegni (20 x 20)', 'Finiture', 'pavimento', { fixed: true });
  group('pavimento-crogiolo', () => {
    slab('/Pavimento_Crogiolo/Crogiolo_Soggiorno', [214, 196, 176, 255], [[0, YI0], [XR, YI0], [XR, YI1], [ROOMS.soggiorno.w, YI1], [ROOMS.soggiorno.w, YS1], [0, YS1]], 0, CG.z);
    kit.items[kit.items.length - 1].tex = { url: 'textures/marazzi-crogiolo-d-segni-tappeto8.jpg', tile: kit.inch(CG.tile) };
  }); }

// camera: herringbone parquet (honey oak, 7 x 42 cm boards at 45 degrees, from the user's photo) + darker border band   pattern measured on photo, sizes estimate
slab('/Casa/Camera/Parquet', [150, 95, 50, 255], [[XC0 - TW, -TE], [XR + TE, -TE], [XR + TE, YI0 - TI], [XC0 - TW, YI0 - TI]], -4, 0);
kit.items[kit.items.length - 1].tex = { url: 'textures/parquet-spina.png', tile: kit.inch(PARQUET.tile) };
{ const o = PARQUET.bandOff, w = PARQUET.bandW, x0 = XC0, x1 = XR, y0 = 0, y1 = YC1, z = 0.3;
  box('/Casa/Camera/Fascia_Sud', PARQUET.band, x0 + o, y0 + o, 0, x1 - o, y0 + o + w, z);
  box('/Casa/Camera/Fascia_Nord', PARQUET.band, x0 + o, y1 - o - w, 0, x1 - o, y1 - o, z);
  box('/Casa/Camera/Fascia_Ovest', PARQUET.band, x0 + o, y0 + o + w, 0, x0 + o + w, y1 - o - w, z);
  box('/Casa/Camera/Fascia_Est', PARQUET.band, x1 - o - w, y0 + o + w, 0, x1 - o, y1 - o - w, z); }

// ---------- exterior walls ----------
const ENTRY = { from: YI0 + 35, to: YI0 + 35 + ENTRY_W, head: DOOR_H };
const SOG_PF = pf(140), CAM_PF = pf(XC0 + 145), BAGNO_WIN = { from: XB0 + 30, to: XB0 + 30 + WB.w, sill: WB.sill, head: WB.sill + WB.h };
wall('/Casa/Muro_Nord', C.wall, [XK0 - TK, YS1, XR + TE, YS1 + TE], H, [SOG_PF, BAGNO_WIN]);
wall('/Casa/Muro_Est', C.wall, [XR, -TE, XR + TE, YS1], H);
wall('/Casa/Muro_Sud', C.wall, [XC0 - TW, -TE, XR, 0], H, [CAM_PF]);
wall('/Casa/Muro_Ovest_Camera', C.wall, [XC0 - TW, 0, XC0, YC1], H);
wall('/Casa/Muro_Ovest_Ingresso', C.wall, [-TS, YC1, 0, YK0 - TK], H, [ENTRY]);   // front door from the common stair
wall('/Casa/Muro_Ingresso_Camera_Ovest', C.wall, [-TS, YC1, XC0, YI0], H);

// ---------- cucina: west wall, oblique wall, south wall in one polygon (inner path, then the outer path offset by TK) ----------
const KA = [XK0, YS1 - K_SLANT.west], KB = [XK0 + K_SLANT.south, YK0];       // ends of the slant (inner face)
const meet = (p1, d1, p2, d2) => { const t = ((p2[0] - p1[0]) * d2[1] - (p2[1] - p1[1]) * d2[0]) / (d1[0] * d2[1] - d1[1] * d2[0]); return [p1[0] + t * d1[0], p1[1] + t * d1[1]]; };
const dS = [KB[0] - KA[0], KB[1] - KA[1]], lS = Math.hypot(...dS), nS = [dS[1] / lS, -dS[0] / lS];   // outward normal of the slant (down-left)
const oS = [KA[0] + nS[0] * TK, KA[1] + nS[1] * TK];
const KA_out = meet(oS, dS, [XK0 - TK, 0], [0, 1]), KB_out = meet(oS, dS, [0, YK0 - TK], [1, 0]);
const ccw = (poly) => poly.reduce((a, p, i) => { const q = poly[(i + 1) % poly.length]; return a + p[0] * q[1] - q[0] * p[1]; }, 0) > 0 ? poly : poly.slice().reverse();
const kWall = ccw([[XK0, YS1], KA, KB, [0, YK0], [0, YK0 - TK], KB_out, KA_out, [XK0 - TK, YS1]]);   // south wall runs to the soggiorno face: closed corner with the stair wall
slab('/Casa/Muro_Cucina_Obliquo', C.wall, kWall, 0, H);
slab('/Casa/Pavimento_Cucina', C.floor, ccw([[XK0 - TK, YS1 + TE], KA_out, KB_out, [-TS, YK0 - TK], [0, YK0 - TK], [0, YS1 + TE]]), -4, 0);

// ---------- partitions ----------
const CAM_DOOR = { from: 220, to: 320, head: DOOR_H };   // double door 2 x 50 cm   user
wall('/Casa/Tramezzo_Ingresso_Camera', C.wall, [XC0, YC1, XR, YI0], H, [CAM_DOOR]);
// the cucina / soggiorno partition is removed on request: open plan (no wall, no door); only the pier at the cortile wall stays
box('/Casa/Pilastro_Cucina', WHITE, XK1, YS1 - KP.d, 0, 0, YS1, H);
wall('/Casa/Tramezzo_Soggiorno_Bagno', C.wall, [ROOMS.soggiorno.w, YS0, XB0, YS1], H);
wall('/Casa/Tramezzo_Bagno_Ingresso', C.wall, [ROOMS.soggiorno.w, YI1, XR, YS0], H,   // starts under the soggiorno/bagno partition: closed corner
   [{ from: XB0 + 30, to: XB0 + 30 + 70, head: DOOR_H }]);

// ---------- front door: brown leaf, open 90 degrees outward onto the common stair landing, hinged on the north jamb ----------
const DOOR_C = [112, 72, 44, 255], DOOR_T = 5;
defGroup('porte', 'Porta di ingresso', 'Porte', null, { fixed: true });
group('porte', () => {
  const XO = -TS;                                                       // outer face of the wall
  box('/Casa/Porta_Ingresso/Anta', DOOR_C, XO - (ENTRY_W - 4), ENTRY.to - DOOR_T, 0, XO, ENTRY.to, DOOR_H - 2);
  tube('/Casa/Porta_Ingresso/Maniglia', [200, 200, 200, 255], [[XO - (ENTRY_W - 14), ENTRY.to - DOOR_T - 1, 105], [XO - (ENTRY_W - 14), ENTRY.to - DOOR_T - 7, 105], [XO - (ENTRY_W - 26), ENTRY.to - DOOR_T - 7, 105]], [1.2, 1.2, 1.2]);
});

// ---------- cream paint on the walls of camera and soggiorno (bagno, cucina, ingresso stay white) ----------
// thin skins on the room faces, in a default-on group so the Plan sheet keeps measuring the bare walls   colour estimate from photos
{ const P = WHITE, s = 0.3;   // inner faces white (user); outer faces keep the raw wall colour
  defGroup('pittura', 'Pareti bianche (interni)', 'Finiture', null, { fixed: true });
  group('pittura', () => {
    wall('/Pittura/Camera_Sud', P, [XC0, 0, XR, s], H, [CAM_PF]);
    wall('/Pittura/Camera_Nord', P, [XC0, YC1 - s, XR, YC1], H, [CAM_DOOR]);
    wall('/Pittura/Camera_Ovest', P, [XC0, 0, XC0 + s, YC1], H);
    wall('/Pittura/Camera_Est', P, [XR - s, 0, XR, YC1], H);
    wall('/Pittura/Ingresso_Sud', P, [0, YI0, XR, YI0 + s], H, [CAM_DOOR]);
    wall('/Pittura/Ingresso_Nord', P, [XB0, YI1 - s, XR, YI1], H, [{ from: XB0 + 30, to: XB0 + 100, head: DOOR_H }]);
    wall('/Pittura/Ingresso_Ovest', P, [0, YI0, s, YI1], H, [ENTRY]);
    wall('/Pittura/Ingresso_Est', P, [XR - s, YI0, XR, YI1], H);
    wall('/Pittura/Facciata_Camera', [224, 186, 124, 255], [XC0 - TW, -TE - s, XR + TE, -TE], H, [CAM_PF]);   // outside face of the camera wall, yellow like the balcony
    wall('/Pittura/Soggiorno_Nord', P, [0, YS1 - s, ROOMS.soggiorno.w, YS1], H, [SOG_PF]);
    wall('/Pittura/Soggiorno_Ovest', P, [0, YS0, s, YK0 - TK], H);
    wall('/Pittura/Soggiorno_Est', P, [ROOMS.soggiorno.w - s, YS0, ROOMS.soggiorno.w, YS1], H);
    wall('/Pittura/Bagno_Ovest', P, [XB0, YS0, XB0 + s, YS1], H);
    wall('/Pittura/Bagno_Est', P, [XR - s, YS0, XR, YS1], H);
    wall('/Pittura/Bagno_Nord', P, [XB0, YS1 - s, XR, YS1], H, [BAGNO_WIN]);
    wall('/Pittura/Bagno_Sud', P, [XB0, YS0, XR, YS0 + s], H, [{ from: XB0 + 30, to: XB0 + 100, head: DOOR_H }]);
    wall('/Pittura/Cucina_Ovest', P, [XK0, KA[1], XK0 + s, YS1], H);
    wall('/Pittura/Cucina_Nord', P, [XK0, YS1 - s, XK1, YS1], H);
    wall('/Pittura/Cucina_Sud', P, [KB[0], YK0, -TS, YK0 + s], H);
    { const n = [KB[1] - KA[1], -(KB[0] - KA[0])], l = Math.hypot(...n), o = [n[0] / l * s, n[1] / l * s];   // oblique wall: a thin slab on its inner face
      slab('/Pittura/Cucina_Obliqua', P, ccw([KA, KB, [KB[0] - o[0], KB[1] - o[1]], [KA[0] - o[0], KA[1] - o[1]]]), 0, H); }
  });
}

// ---------- glass ----------
box('/Casa/Vetro_Finestra_Bagno', C.glass, BAGNO_WIN.from, YS1 + 14, BAGNO_WIN.sill, BAGNO_WIN.to, YS1 + 16, BAGNO_WIN.head);

// ---------- bathroom door (from the user's photo): cream leaf with 5 raised panels, hinged on the east jamb, left open into the bagno ----------
// the viewer can't rotate boxes, so the leaf and its panels are slab polygons in a local frame (u along the leaf, v across it)   open angle, panel sizes estimate
{ const BD = { x0: XB0 + 30, x1: XB0 + 100, ang: 90, t: 4, c: [242, 234, 214, 255], p: [238, 229, 208, 255] };
  const a = BD.ang * Math.PI / 180, w = BD.x1 - BD.x0 - 2, hx = BD.x1 - 1, hy = YS0;
  const u = [-Math.cos(a), Math.sin(a)], v = [Math.sin(a), Math.cos(a)];
  const P = (pu, pv) => [hx + u[0] * pu + v[0] * pv, hy + u[1] * pu + v[1] * pv];
  const quad = (u0, u1, v0, v1) => ccw([P(u0, v0), P(u1, v0), P(u1, v1), P(u0, v1)]);
  defGroup('porta-bagno', 'Porta del bagno', 'Porte', null, { fixed: true });
  group('porta-bagno', () => {
    slab('/Casa/Porta_Bagno/Anta', BD.c, quad(0, w, 0, BD.t), 0, DOOR_H - 1);
    const m = 9, zs = [15, 50, 85, 120, 155, DOOR_H - 11];   // bottom rail 15, 7 cm rails, top rail 11
    for (let i = 0; i < 5; i++)
      slab(`/Casa/Porta_Bagno/Riquadro_${i + 1}`, BD.p, quad(m, w - m, -0.6, 0), zs[i] + (i ? 3.5 : 0), zs[i + 1] - 3.5);
    const g = [205, 170, 80, 255], hu = w - 6, pa = P(hu, -0.6), pb = P(hu, -6), pc = P(hu - 11, -6);
    slab('/Casa/Porta_Bagno/Placca', g, quad(hu - 2, hu + 2, -1, -0.6), 90, 120);
    tube('/Casa/Porta_Bagno/Maniglia', g, [[...pa, 105], [...pb, 105], [...pc, 105]], [1, 1, 1]);
  });
}

// ---------- double door ingresso / camera (from the user's photo): 2 white leaves of 50 x 210 (rails and panel scaled from the photo), glass above, a recessed
// panel below, brass handle on the right leaf; hinged on the jambs, opening into the camera, drawn partly open so the
// passage stays free. One movable piece (every leaf name starts with "Porta", no digits)   sizes user, open angle estimate
{ const CD = { w: 50, h: DOOR_H, t: 4, ang: 75, st: 8, top: 9, bot: 60, pTop: 9, pBot: 15, c: [246, 245, 240, 255], glass: [225, 222, 212, 150] };
  defGroup('porta-camera', 'Porta doppia camera (vetro, 100 x 210)', 'Porte');
  group('porta-camera', () => {
    const a = CD.ang * Math.PI / 180;
    const leaf = (n, hx, sgn) => {                     // sgn +1: hinge on the west jamb, -1: on the east jamb
      const u = [sgn * Math.cos(a), -Math.sin(a)], v = [Math.sin(a), sgn * Math.cos(a)];
      const hy = YC1 - 0.5;
      const P = (pu, pv) => [hx + u[0] * pu + v[0] * pv, hy + u[1] * pu + v[1] * pv];
      const q = (u0, u1, v0, v1) => ccw([P(u0, v0), P(u1, v0), P(u1, v1), P(u0, v1)]);
      const part = (m, c, u0, u1, v0, v1, z0, z1) => slab(`/Porta_Camera/Porta_${n}_${m}`, c, q(u0, u1, v0, v1), z0, z1);
      const { w, h, t, st } = CD, pz0 = CD.pBot, pz1 = CD.bot - CD.pTop;
      part('Montante_Cerniera', CD.c, 0, st, 0, t, 0, h);
      part('Montante_Battuta', CD.c, w - st, w, 0, t, 0, h);
      part('Traverso_Alto', CD.c, st, w - st, 0, t, h - CD.top, h);
      part('Traverso_Basso', CD.c, st, w - st, 0, t, 0, pz0);
      part('Traverso_Medio', CD.c, st, w - st, 0, t, pz1, CD.bot);
      part('Pannello', [236, 235, 229, 255], st, w - st, 1, t - 1, pz0, pz1);   // recessed 1 cm on both faces
      part('Vetro', CD.glass, st, w - st, t / 2 - 0.4, t / 2 + 0.4, CD.bot, h - CD.top);
      kit.items[kit.items.length - 1].ne = 1;
      return P;
    };
    leaf('Sx', 220, 1);
    const P = leaf('Dx', 320, -1);
    const g = [176, 128, 52, 255], hu = CD.w - 5;    // brass lever on both faces of the right leaf
    for (const [m, s] of [['Camera', -1], ['Ingresso', 1]]) {
      const v0 = s < 0 ? 0 : CD.t, v1 = v0 + s * 0.8, v2 = v0 + s * 6;
      slab(`/Porta_Camera/Porta_Placca_${m}`, g, ccw([P(hu - 2, v0), P(hu + 2, v0), P(hu + 2, v1), P(hu - 2, v1)]), 92, 118);
      tube(`/Porta_Camera/Porta_Maniglia_${m}`, g, [[...P(hu, v1), 108], [...P(hu, v2), 108], [...P(hu - 12, v2), 108]], [1, 1, 1]);
      kit.items[kit.items.length - 1].mt = [1, 0.3];
    }
  });
}

// ---------- balconies ----------
const balcony = (n, x0, x1, y0, y1, side) => {
  box(`/Casa/${n}/Soletta`, C.balcony, x0, y0, -16, x1, y1, -2);
  const yr = side > 0 ? y1 - 4 : y0;
  box(`/Casa/${n}/Parapetto_Fronte`, C.rail, x0, yr, -2, x1, yr + 4, 100);
  box(`/Casa/${n}/Parapetto_Ovest`, C.rail, x0, Math.min(y0, y1), -2, x0 + 4, Math.max(y0, y1), 100);
  box(`/Casa/${n}/Parapetto_Est`, C.rail, x1 - 4, Math.min(y0, y1), -2, x1, Math.max(y0, y1), 100);
};
// soggiorno balcony, from the user's photos: beige 30 x 30 cm tiles, stone curb, grey railing with vertical bars on the three open sides   tile size, curb, rail sizes estimate
{ const x0 = 0, x1 = 330, y0 = YS1 + TE, y1 = y0 + BALC_D, G = [150, 154, 158, 255], CURB = [226, 214, 190, 255];
  box('/Casa/Balcone_Cortile/Soletta', C.balcony, x0, y0, -16, x1, y1, -3);
  slab('/Casa/Balcone_Cortile/Piastrelle', [214, 198, 172, 255], [[x0, y0], [x1, y0], [x1, y1], [x0, y1]], -3, -2);
  kit.items[kit.items.length - 1].tex = { url: 'textures/piastrelle-balcone.png', tile: kit.inch(60) };
  const cb = 10, ch = 8;   // curb width / height
  box('/Casa/Balcone_Cortile/Cordolo_Fronte', CURB, x0, y1 - cb, -2, x1, y1, ch);
  box('/Casa/Balcone_Cortile/Cordolo_Ovest', CURB, x0, y0, -2, x0 + cb, y1 - cb, ch);
  box('/Casa/Balcone_Cortile/Cordolo_Est', CURB, x1 - cb, y0, -2, x1, y1 - cb, ch);
  const c = cb / 2, xa = x0 + c, xb = x1 - c, yb = y1 - c, R = 'Casa/Balcone_Cortile/Ringhiera';
  // rails: bottom flat bar on the curb, a second rail and the handrail on top
  for (const [k, z, h, w] of [['Base', ch, 3, 4], ['Traverso', 88, 2, 3], ['Corrimano', 100, 4, 6]]) {
    box(`/${R}/${k}_Fronte`, G, xa - w / 2, yb - w / 2, z, xb + w / 2, yb + w / 2, z + h);
    box(`/${R}/${k}_Ovest`, G, xa - w / 2, y0, z, xa + w / 2, yb - w / 2, z + h);
    box(`/${R}/${k}_Est`, G, xb - w / 2, y0, z, xb + w / 2, yb - w / 2, z + h);
  }
  const bar = (n, x, y) => box(`/${R}/${n}`, G, x - 1, y - 1, ch + 3, x + 1, y + 1, 100);
  const STEP = 12;
  for (let i = 0, nx = Math.round((xb - xa) / STEP); i <= nx; i++) bar(`Barra_Fronte_${i}`, xa + i * (xb - xa) / nx, yb);
  for (let i = 0, ny = Math.round((yb - y0) / STEP); i < ny; i++) {
    const y = y0 + 4 + i * (yb - y0 - 4) / ny;
    bar(`Barra_Ovest_${i}`, xa, y); bar(`Barra_Est_${i}`, xb, y);
  }
}
// camera balcony, from the user's photos: medium-grey concrete floor, solid yellow parapet on the three open sides,
// granite coping 10 cm wide that overhangs the yellow wall by 2 cm on both faces   heights estimate
{ const x0 = CAM_PF.from + PF.w / 2 - 120, x1 = x0 + 240, y0 = -TE - BALC_D, y1 = -TE, B = 'Casa/Balcone_Via_Poggi';
  const YEL = [224, 186, 124, 255], GRAN = [168, 166, 160, 255], cap = 10, ov = 2, wt = cap - 2 * ov, hp = 95, hc = 5;
  box(`/${B}/Soletta`, [128, 128, 126, 255], x0, y0, -16, x1, y1, -2);
  box(`/${B}/Parapetto_Fronte`, YEL, x0 + ov, y0 + ov, -2, x1 - ov, y0 + ov + wt, hp);
  box(`/${B}/Parapetto_Ovest`, YEL, x0 + ov, y0 + ov + wt, -2, x0 + ov + wt, y1, hp);
  box(`/${B}/Parapetto_Est`, YEL, x1 - ov - wt, y0 + ov + wt, -2, x1 - ov, y1, hp);
  box(`/${B}/Copertina_Fronte`, GRAN, x0, y0, hp, x1, y0 + cap, hp + hc);
  box(`/${B}/Copertina_Ovest`, GRAN, x0, y0 + cap, hp, x0 + cap, y1, hp + hc);
  box(`/${B}/Copertina_Est`, GRAN, x1 - cap, y0 + cap, hp, x1, y1, hp + hc);
}

// air-conditioner outdoor unit on the camera balcony, from the user's photo: beside the door,
// touching nothing   sizes estimate
{ const xp = CAM_PF.from + PF.w / 2 + 120 - 8, l = 50, w = 25, h = 27, x1 = xp - 6, x0 = x1 - l, y1 = -TE - 6, y0 = y1 - w;   // east of the door (left seen from inside), long side along the facade
  defGroup('condizionatore', 'Motore condizionatore', 'Impianti');
  group('condizionatore', () => {
    const WH = [244, 244, 240, 255], BK = [30, 30, 30, 255], cx = x0 + 20, cz = 3 + h / 2;
    box('/Condizionatore/Motore_Corpo', WH, x0, y0, 3, x1, y1, 3 + h);
    box('/Condizionatore/Motore_Piede_Ovest', [90, 90, 90, 255], x0 + 4, y0 + 2, 0, x0 + 8, y1 - 2, 3);
    box('/Condizionatore/Motore_Piede_Est', [90, 90, 90, 255], x1 - 8, y0 + 2, 0, x1 - 4, y1 - 2, 3);
    tube('/Condizionatore/Motore_Ventola', [60, 62, 64, 255], [[cx, y0 + 0.2, cz], [cx, y0 - 0.5, cz]], [11, 11], 24);   // fan grille on the front
    tube('/Condizionatore/Motore_Mozzo', WH, [[cx, y0 - 0.5, cz], [cx, y0 - 1, cz]], [3, 3], 16);
    tube('/Condizionatore/Motore_Tubo', BK, [[x1 - 8, y1, cz], [x1 - 8, -TE + 1, cz], [x1 - 8, -TE + 1, cz + 25]], [1.5, 1.5, 1.5], 12);   // black pipe behind, into the facade
  });
}

// air-conditioner indoor unit (split) in the camera: high on the south wall, east of the porte-finestre (left seen from
// inside), 20 cm from the opening. One movable piece (leaf names start with "Split", no digits)   size: typical 9000 BTU unit, estimate
{ const SP = { l: 80, h: 29, d: 22, gap: 20, top: 315 }, x0 = CAM_PF.to + SP.gap, x1 = x0 + SP.l, y0 = 0.3, y1 = y0 + SP.d, z0 = SP.top - SP.h;
  defGroup('split-camera', 'Split aria condizionata camera (80 x 29)', 'Impianti');
  group('split-camera', () => {
    const WH = [246, 246, 243, 255];
    rbox('/Split_Camera/Split_Corpo', WH, [x0, y0, z0 + 4, x1, y1, SP.top], 2, 3);
    rbox('/Split_Camera/Split_Fondo', WH, [x0 + 0.5, y0, z0, x1 - 0.5, y1 - 4, z0 + 4], 2, 0, 2);
    box('/Split_Camera/Split_Bocchetta', [70, 72, 76, 255], x0 + 4, y1 - 9, z0 - 0.2, x1 - 4, y1 - 4, z0 + 0.5);   // air outlet underneath
    box('/Split_Camera/Split_Aletta', [232, 232, 228, 255], x0 + 4, y1 - 4, z0 - 0.6, x1 - 4, y1 - 0.5, z0 + 0.4);   // flap
    box('/Split_Camera/Split_Display', [40, 40, 44, 255], x1 - 14, y1 - 0.1, z0 + 6, x1 - 6, y1 + 0.1, z0 + 8);
  });
}

// Mogg Zoom sideboard (credenza), 212 x 50 x 79 cm, from the maker's 3D file (.3ds, mm) and the user's photo: a black
// steel-bar glass box (90 cm, two glass shelves) at one end, a walnut 3-door cabinet on legs running through it.
// In the soggiorno against the wall towards the bagno, perpendicular to the bookcase, glass box towards the north end
// (on the left seen from the room, as in the photo). One movable piece (every leaf name starts with "Credenza", no digits)
// sizes from the 3D file; position along the wall estimate (10 cm past the bookcase)
{ const XW = ROOMS.soggiorno.w, Y1 = 715 + 212;      // wall face, north end of the piece
  // file frame (mm): X along the length -150..1962 (glass box at -150), Y depth 0 = front .. 500 = back, Z up
  const P = (X, Y) => [XW - (500 - Y) / 10, Y1 - (X + 150) / 10];
  const B = (n, c, X0, X1, Ya, Yb, Z0, Z1) => { const a = P(X0, Ya), b = P(X1, Yb);
    box(`/Credenza_Zoom/Credenza_${n}`, c, Math.min(a[0], b[0]), Math.min(a[1], b[1]), Z0 / 10, Math.max(a[0], b[0]), Math.max(a[1], b[1]), Z1 / 10); };
  const BK = [28, 28, 30, 255], WD = [118, 70, 40, 255], WD2 = [104, 60, 34, 255], GL = [210, 225, 225, 70], t = 18;
  defGroup('credenza-zoom', 'Credenza Zoom (Mogg) 212 x 50 x 79', 'Arredi');
  group('credenza-zoom', () => {
    // glass box: 12 steel bars of 18 mm, x -150..750, depth 0..500, height 0..790
    for (const [Xa, Xb] of [[-150, -150 + t], [750 - t, 750]]) for (const [Ya, Yb] of [[0, t], [500 - t, 500]]) B('Teca_Montante', BK, Xa, Xb, Ya, Yb, 0, 790);
    for (const [Za, Zb] of [[0, t], [790 - t, 790]]) {
      for (const [Ya, Yb] of [[0, t], [500 - t, 500]]) B('Teca_Traverso', BK, -150, 750, Ya, Yb, Za, Zb);
      for (const [Xa, Xb] of [[-150, -150 + t], [750 - t, 750]]) B('Teca_Traverso', BK, Xa, Xb, 0, 500, Za, Zb);
    }
    for (const [Za, Zb] of [[212, 218], [784, 790]]) B('Teca_Vetro', GL, -130.5, 730.5, 19.5, 480.5, Za, Zb);
    // walnut cabinet 366..1962 on legs, body z 235..755, doors on the front face
    B('Mobile_Corpo', WD, 366, 1962, 52, 465, 254, 736);
    B('Mobile_Top', WD, 364, 1964, 37, 463, 736, 755);
    B('Mobile_Fondo', WD, 364, 1964, 37, 463, 235, 254);
    B('Mobile_Anta_Sinistra', WD2, 366, 714, 33, 52, 237, 753);
    B('Mobile_Montante', WD, 716, 766, 33, 52, 237, 753);
    B('Mobile_Anta_Centrale', WD2, 768, 1364, 33, 52, 237, 753);
    B('Mobile_Anta_Destra', WD2, 1366, 1962, 33, 52, 237, 753);
    for (const [Ya, Yb] of [[58 + 51, 58 + 69], [322 + 51, 322 + 69]]) B('Gamba', BK, 1796, 1814, Ya, Yb, 0, 235);   // two thin black legs (the glass box carries the other end)
  });
  kit.items.filter(i => i.n.includes('Credenza_Teca_Vetro')).forEach(i => { i.ne = 1; });
  // walnut grain (procedural, scripts/walnut-texture.py: the 3D file has none): vertical on the fronts, along the length on the top
  const WT = { url: 'textures/noce-venato.jpg', tile: kit.inch(60) };
  kit.items.filter(i => /Credenza_Mobile_(Anta|Montante|Corpo)/.test(i.n)).forEach(i => { i.tex = { ...WT, face: '-x' }; });
  kit.items.filter(i => /Credenza_Mobile_Top/.test(i.n)).forEach(i => { i.tex = { ...WT, face: '+z' }; });
}

// ---------- sofas on the soggiorno west wall (back against the wall, centred on the solid stretch of wall) ----------
// local frame: u along the wall (world y = Y0 + u), v from the wall face (world x = v); variant 'divano' = one sofa at a time
{ const WALL0 = YS0, WALL1 = YK0 - TK, YC = (WALL0 + WALL1) / 2;
  const sofa = (Y0) => ({
    B: (n, c, u0, u1, v0, v1, z0, z1) => box(n, c, v0, Y0 + u0, z0, v1, Y0 + u1, z1),
    R: (n, c, u0, u1, v0, v1, z0, z1, r, top, bot = 0) => rbox(n, c, [v0, Y0 + u0, z0, v1, Y0 + u1, z1], r, top, bot),
    T: (n, c, pts, rr) => tube(n, c, pts.map(([u, v, z]) => [v, Y0 + u, z]), rr, 12) });

  // IKEA Söderhamn 3-seat, Alhamn orange-red velvet: 198 x 99 x 83 cm, seat 40, armrest 69, legs 14 (product drawing)
  // thin armrest panels, 2 seat cushions, 2 back + 2 lumbar cushions, chrome legs   cushion sizes estimate (from the photo)
  { const W = 198, { B, R, T } = sofa(YC - W / 2), C = [170, 60, 34, 255], C2 = [152, 50, 28, 255], CH = [205, 208, 212, 255];
    defGroup('divano-soderhamn', 'Divano IKEA Söderhamn 3 posti (Alhamn arancione-rosso)', 'Arredi', 'divano');
    group('divano-soderhamn', () => {
      for (const [u, v, s] of [[12, 10, 'Sx'], [W - 12, 10, 'Dx'], [12, 89, 'Sx'], [W - 12, 89, 'Dx']])
        T(`/Divano_Soderhamn/Divano_Gamba_${s}_${v < 50 ? 'Retro' : 'Fronte'}`, CH, [[u, v, 0], [u, v, 14]], [1.1, 1.1]);
      R('/Divano_Soderhamn/Divano_Base', C2, 6, W - 6, 2, 97, 14, 30, 2, 2);
      R('/Divano_Soderhamn/Divano_Bracciolo_Sx', C, 0, 7, 0, 99, 16, 69, 3, 3, 2);
      R('/Divano_Soderhamn/Divano_Bracciolo_Dx', C, W - 7, W, 0, 99, 16, 69, 3, 3, 2);
      R('/Divano_Soderhamn/Divano_Schienale', C2, 7, W - 7, 0, 12, 30, 62, 2, 3);
      R('/Divano_Soderhamn/Divano_Seduta_Sx', C, 7, W / 2, 14, 99, 30, 40, 4, 4);
      R('/Divano_Soderhamn/Divano_Seduta_Dx', C, W / 2, W - 7, 14, 99, 30, 40, 4, 4);
      R('/Divano_Soderhamn/Divano_Cuscino_Sx', C, 12, W / 2 - 2, 10, 28, 40, 83, 6, 7);
      R('/Divano_Soderhamn/Divano_Cuscino_Dx', C, W / 2 + 2, W - 12, 10, 28, 40, 83, 6, 7);
      R('/Divano_Soderhamn/Divano_Lombare_Sx', C2, 27, 75, 28, 39, 42, 64, 4, 5);
      R('/Divano_Soderhamn/Divano_Lombare_Dx', C2, W - 75, W - 27, 28, 39, 42, 64, 4, 5);
    });
  }

  // La Redoute sofa bed, mustard-yellow corduroy (as in the shop photos; the shop calls the colour "cannella"), 168 x 100 x 82 cm,
  // seat 49 (product drawing). Open (shop photo): arms and back stay, a white mattress on a grey steel frame folds out, 168 x 200 in all.
  // Two groups, closed and open, with "alt" pointing at each other: select the sofa and press L to switch. Both use the
  // same path and first word ("Divano"), so they share the moved offset   mattress thickness and frame estimate
  { const W = 168, { B, R, T } = sofa(YC - W / 2), C = [204, 156, 52, 255], C2 = [182, 136, 42, 255], FT = [30, 28, 26, 255];
    const MT = [238, 238, 234, 255], GR = [90, 92, 96, 255], WH = [246, 246, 244, 255];
    const feet = (n, d) => { for (const [u, v] of [[8, 8], [W - 8, 8], [8, d - 8], [W - 8, d - 8]]) B(`/Divano_Redoute/Divano_${n}_Piede_${u < W / 2 ? 'Sx' : 'Dx'}${v < 50 ? 'Retro' : 'Fronte'}`, FT, u - 2.5, u + 2.5, v - 2.5, v + 2.5, 0, 5); };
    defGroup('divano-redoute', 'Divano letto La Redoute 168 (giallo senape) – chiuso', 'Arredi', 'divano', { alt: 'divano-redoute-aperto' });
    defGroup('divano-redoute-aperto', 'Divano letto La Redoute 168 (giallo senape) – aperto', 'Arredi', 'divano', { alt: 'divano-redoute' });
    group('divano-redoute', () => {                 // proportions from the La Redoute front photo: low base, thick seat cushions overhanging the front, armrests ~58 cm
      feet('Chiuso', 100);
      R('/Divano_Redoute/Divano_Base', C2, 18, W - 18, 0, 95, 5, 27, 5, 4);
      R('/Divano_Redoute/Divano_Bracciolo_Sx', C, 0, 19, 0, 100, 5, 58, 7, 9, 4);
      R('/Divano_Redoute/Divano_Bracciolo_Dx', C, W - 19, W, 0, 100, 5, 58, 7, 9, 4);
      R('/Divano_Redoute/Divano_Schienale', C2, 18, W - 18, 0, 16, 5, 56, 4, 6);
      R('/Divano_Redoute/Divano_Seduta_Sx', C, 19, W / 2, 14, 100, 27, 49, 9, 10, 6);
      R('/Divano_Redoute/Divano_Seduta_Dx', C, W / 2, W - 19, 14, 100, 27, 49, 9, 10, 6);
      R('/Divano_Redoute/Divano_Cuscino_Sx', C, 20, W / 2 - 1, 4, 30, 44, 80, 8, 11);
      R('/Divano_Redoute/Divano_Cuscino_Dx', C, W / 2 + 1, W - 20, 4, 30, 44, 80, 8, 11);
    });
    group('divano-redoute-aperto', () => {
      for (const [u, v] of [[8, 8], [W - 8, 8], [8, 92], [W - 8, 92]]) B(`/Divano_Redoute/Divano_Aperto_Piede_${u < W / 2 ? 'Sx' : 'Dx'}${v < 50 ? 'Retro' : 'Fronte'}`, FT, u - 2.5, u + 2.5, v - 2.5, v + 2.5, 0, 5);
      R('/Divano_Redoute/Divano_Aperto_Bracciolo_Sx', C, 0, 19, 0, 100, 5, 58, 7, 9, 4);
      R('/Divano_Redoute/Divano_Aperto_Bracciolo_Dx', C, W - 19, W, 0, 100, 5, 58, 7, 9, 4);
      R('/Divano_Redoute/Divano_Aperto_Schienale', C2, 19, W - 19, 0, 16, 5, 56, 4, 6);
      R('/Divano_Redoute/Divano_Aperto_Cuscini', C2, 19, W - 19, 16, 100, 5, 16, 4, 3);     // the folded seat cushions under the frame
      B('/Divano_Redoute/Divano_Telaio_Sx', GR, 20, 22, 16, 200, 26, 30);                  // grey steel frame
      B('/Divano_Redoute/Divano_Telaio_Dx', GR, W - 22, W - 20, 16, 200, 26, 30);
      T('/Divano_Redoute/Divano_Telaio_Gambe', GR, [[24, 196, 30], [24, 196, 1], [W - 24, 196, 1], [W - 24, 196, 30]], [1, 1, 1, 1]);
      T('/Divano_Redoute/Divano_Telaio_Gambe_Medie', GR, [[24, 140, 26], [24, 140, 1], [W - 24, 140, 1], [W - 24, 140, 26]], [1, 1, 1, 1]);
      R('/Divano_Redoute/Divano_Materasso', MT, 20, W - 20, 16, 200, 30, 42, 3, 3);
      R('/Divano_Redoute/Divano_Guanciale_Sx', WH, 26, W / 2 - 3, 18, 56, 42, 54, 8, 6);
      R('/Divano_Redoute/Divano_Guanciale_Dx', WH, W / 2 + 3, W - 26, 18, 56, 42, 54, 8, 6);
    });
  }
}

// Diotti "Marshall" extending console, from the maker's page and photos: closed 90 x 50 x 75 cm, laminate top 2 cm in the
// textured wood finish, bronze legs and apron, fluted wood on the outside of the legs that pull out. It extends to
// 100 / 150 / 200 / 250 / 300 cm with leaves of 50 cm: one group per length, chained with "alt" (select it and press L
// to go to the next length, after 300 it closes). All lengths share path and first word, so they move together.
// In the camera against the west wall (on the right entering from the ingresso), near the north corner, extending east.
// leg and apron sizes estimate (from the photos)
{ const X0 = XC0, Y0 = YC1 - 5 - 90, W = 90, BR = [96, 80, 58, 255], WD = [96, 62, 40, 255], TOP = [120, 80, 52, 255];
  const B = (n, c, u0, u1, v0, v1, z0, z1) => box(`/Consolle_Marshall/Consolle_${n}`, c, X0 + v0, Y0 + u0, z0, X0 + v1, Y0 + u1, z1);
  const LENS = [50, 100, 150, 200, 250, 300], id = L => `consolle-${L}`;
  LENS.forEach((L, i) => defGroup(id(L), L === 50 ? 'Consolle Marshall – chiusa (90 x 50)' : `Consolle Marshall – allungata a ${L} cm`, 'Arredi', 'consolle', { alt: id(LENS[(i + 1) % LENS.length]) }));
  for (const L of LENS) group(id(L), () => {
    for (let k = 0; k * 50 < L; k++) {                       // top: one 50 cm panel per leaf, the seams show as lines
      B(`Piano_${'abcdef'[k]}`, TOP, 0, W, k * 50, Math.min(L, k * 50 + 50), 73, 75);
      kit.items[kit.items.length - 1].tex = { url: 'textures/legno-marshall.jpg', tile: kit.inch(60), face: '+z' };
    }
    B('Fascia_Muro', BR, 2, W - 2, 0, 3, 65, 73);            // bronze apron
    B('Fascia_Fronte', BR, 2, W - 2, L - 3, L, 65, 73);
    B('Fascia_Sx', BR, 0, 3, 0, L, 65, 73);
    B('Fascia_Dx', BR, W - 3, W, 0, L, 65, 73);
    for (const [s, u0, u1] of [['Sx', 0, 4], ['Dx', W - 4, W]]) {
      B(`Gamba_Muro_${s}`, BR, u0, u1, 0, 10, 0, 73);        // fixed legs at the wall end
      B(`Gamba_Fronte_${s}`, BR, u0, u1, L - 10, L, 0, 73);  // legs that pull out with the top
      const uo = s === 'Sx' ? u0 - 0.8 : u1;                 // fluted wood on their outer face
      for (let f = 0; f < 6; f++) B(`Gamba_Fronte_${s}_Doga_${'abcdef'[f]}`, WD, uo, uo + 0.8, L - 9.5 + f * 1.6, L - 8.4 + f * 1.6, 0, 73);
    }
  });
}

// Mogg Costantina Opal floor lamp (Nava + Arosio): a totem of 7 opal glass elements (cylinders, cones, double cones)
// on a polished chrome disc base   overall Ø 40 (base), H 178 (retailer datasheets); element profiles traced from the
// user's product photo (scaled on the 40 cm base disc), so their sizes are estimate
// placed in the soggiorno corner on the left when entering (west wall / ingresso side); the user moves it
{ const cx = 25, cy = YS0 + 50, OP = [246, 244, 238, 255], CR = [205, 208, 212, 255], k = 178 / 625, zp = y => (770 - y) * k;
  const EL = [   // [photo y px, half width px], top to bottom
    [[145, 31], [180, 31], [232, 13]],
    [[235, 13], [280, 32], [332, 13]],
    [[335, 13], [365, 30], [425, 30]],
    [[427, 14], [458, 41], [490, 14]],
    [[492, 30], [540, 30], [580, 13]],
    [[582, 13], [610, 40], [640, 13]],
    [[642, 13], [680, 34], [748, 12]],
  ];
  defGroup('lampada-terra', 'Lampada da terra Costantina Opal (Mogg)', 'Luci');
  group('lampada-terra', () => {
    tube('/Lampada/Lampada_Base', CR, [[cx, cy, 0], [cx, cy, 1.5]], [20, 20], 32);
    tube('/Lampada/Lampada_Attacco', CR, [[cx, cy, 1.5], [cx, cy, zp(748) + 0.5]], [3, 3], 16);
    EL.forEach((pr, i) => {
      const p = pr.slice().reverse().map(([y]) => [cx, cy, zp(y)]), r = pr.slice().reverse().map(([, w]) => w * k);
      tube(`/Lampada/Lampada_Vetro_${String.fromCharCode(97 + i)}`, OP, p, r, 28);
    });
  });
  kit.items.filter(i => i.n.startsWith('/Lampada/Lampada_Vetro')).forEach(i => { i.em = 1; i.ne = 1; });   // glowing glass, no outlines between the elements
  kit.items.filter(i => /Lampada_(Base|Attacco)/.test(i.n)).forEach(i => { i.c = [232, 234, 238, 255]; i.mt = [1, 0.04]; i.ne = 1; });   // mirror-polished silver
  light({ p: [cx, cy, 120], a: 85, pen: 1, c: [255, 236, 210], i: 60, r: 600, g: 'lampada-terra' });
}

// black cat, ~7 kg (big, roundish but not fat): standing, facing +x, in the soggiorno   sizes estimate (body ~48 cm, shoulder ~28 cm)
// leaf names carry no digits so the whole cat moves as one piece
{ const x = 180, y = 850, BK = [24, 24, 26, 255], EY = [196, 170, 40, 255], NO = [60, 44, 44, 255];
  const ball = (n, c, cx, cy, cz, r) => { const p = [], rr = [];
    for (let k = 0; k <= 10; k++) { const a = Math.PI * k / 10; p.push([cx, cy, cz - r * Math.cos(a)]); rr.push(Math.max(0.2, r * Math.sin(a))); }
    tube(n, c, p, rr, 20); };
  defGroup('gatto', 'Gatto nero (7 kg)', 'Animali');
  group('gatto', () => {
    const bz = 24, bp = [0, 3, 8, 16, 26, 36, 43, 47].map(d => [x + d, y, bz + (d > 30 ? (d - 30) * 0.12 : 0)]);
    tube('/Gatto/Gatto_Corpo', BK, bp, [4, 9, 12, 13, 13, 12, 9, 4], 22);
    for (const [n, dx, dy] of [['Ant_Sx', 40, 5], ['Ant_Dx', 40, -5], ['Post_Sx', 8, 5.5], ['Post_Dx', 8, -5.5]])
      tube(`/Gatto/Gatto_Zampa_${n}`, BK, [[x + dx, y + dy, 0], [x + dx, y + dy, 1.5], [x + dx, y + dy, bz]], [2.6, 2.4, 3.2], 12);
    const hx = x + 52, hz = bz + 12;
    ball('/Gatto/Gatto_Testa', BK, hx, y, hz, 7.5);
    ball('/Gatto/Gatto_Muso', BK, hx + 5.5, y, hz - 2.5, 3.6);
    tube('/Gatto/Gatto_Orecchio_Sx', BK, [[hx - 1, y + 4, hz + 5], [hx - 0.5, y + 5, hz + 10.5]], [2.8, 0.3], 10);
    tube('/Gatto/Gatto_Orecchio_Dx', BK, [[hx - 1, y - 4, hz + 5], [hx - 0.5, y - 5, hz + 10.5]], [2.8, 0.3], 10);
    ball('/Gatto/Gatto_Occhio_Sx', EY, hx + 6.2, y + 2.8, hz + 1.2, 1.1);
    ball('/Gatto/Gatto_Occhio_Dx', EY, hx + 6.2, y - 2.8, hz + 1.2, 1.1);
    ball('/Gatto/Gatto_Naso', NO, hx + 9, y, hz - 1.5, 0.7);
    tube('/Gatto/Gatto_Coda', BK, [[x + 1, y, bz + 3], [x - 7, y, bz + 6], [x - 11, y, bz + 16], [x - 10, y + 2, bz + 28], [x - 6, y + 3, bz + 34]], [3, 2.6, 2.4, 2.2, 1.2], 12);
  });
  kit.items.filter(i => i.n.startsWith('/Gatto/')).forEach(i => { i.ne = 1; });   // fur: no outlines
}

// open steel bookcase (from the user's photo): 3 floor-to-ceiling black flat-bar frames, staggered black steel shelves,
// books upright and in stacks, a few wooden objects; on the open line between soggiorno and ingresso, against the west wall
// 100 x 30 x 330 cm   user; shelf heights and lengths, books and objects estimate (from the photo)
// leaf names carry no digits so the whole bookcase moves as one piece
{ const x0 = 2, x1 = x0 + 100, yc = (YI1 + YS0) / 2, y0 = yc - 15, y1 = yc + 15, BL = [34, 33, 32, 255], b = 2;
  const L = i => String.fromCharCode(97 + Math.floor(i / 26)) + String.fromCharCode(97 + i % 26);   // aa, ab, ... (no digits)
  const WOOD = [[150, 108, 70, 255], [176, 132, 88, 255], [120, 84, 52, 255]];
  const BOOK = [[176, 52, 44, 255], [40, 64, 96, 255], [220, 210, 186, 255], [70, 96, 72, 255], [196, 150, 60, 255], [60, 58, 60, 255], [232, 228, 220, 255], [140, 80, 60, 255]];
  defGroup('libreria', 'Libreria in ferro nero (100 x 30 x 330)', 'Arredi');
  group('libreria', () => {
    let k = 0;
    for (const [n, xf] of [['Ovest', x0], ['Centro', (x0 + x1) / 2 - b / 2], ['Est', x1 - b]]) {   // frames: 2 posts + top and bottom bar
      box(`/Libreria/Libreria_Telaio_${n}_PostoA`, BL, xf, y0, 0, xf + b, y0 + b, H);
      box(`/Libreria/Libreria_Telaio_${n}_PostoB`, BL, xf, y1 - b, 0, xf + b, y1, H);
      box(`/Libreria/Libreria_Telaio_${n}_Base`, BL, xf, y0, 0, xf + b, y1, b);
      box(`/Libreria/Libreria_Telaio_${n}_Testa`, BL, xf, y0, H - b, xf + b, y1, H);
    }
    const SH = [[18, x0, x1], [55, x0, x0 + 52], [120, x0 + 48, x1], [175, x0, x1], [230, x0, x0 + 55], [280, x0 + 45, x1]];   // [z, from, to]
    SH.forEach(([z, a, e], i) => box(`/Libreria/Libreria_Ripiano_${L(i)}`, BL, a, y0 + 1, z, e, y1 - 1, z + 1.5));
    const book = (bx, w, h, d, c, lay) => {   // upright (lay false) or lying flat
      const z = book.z, yb = y0 + (30 - d) / 2;
      if (lay) box(`/Libreria/Libreria_Libro_${L(k++)}`, c, bx, yb, z, bx + h, yb + d, z + w);
      else box(`/Libreria/Libreria_Libro_${L(k++)}`, c, bx, yb, z, bx + w, yb + d, z + h);
    };
    const row = (z, from, list) => { book.z = z; let x = from; for (const [w, h, d] of list) { book(x, w, h, d, BOOK[k % BOOK.length], false); x += w + 0.2; } };
    const stack = (z, x, list) => { let zz = z; for (const [w, h, d] of list) { book.z = zz; book(x, w, h, d, BOOK[(k + 3) % BOOK.length], true); zz += w + 0.1; } };
    const z = i => SH[i][0] + 1.5;
    row(z(0), x0 + 6, [[3, 28, 21], [4, 30, 22], [2.5, 26, 19], [3.5, 31, 23], [3, 29, 21], [5, 32, 24], [2.5, 27, 20]]);
    stack(z(0), x0 + 62, [[4, 30, 23], [3, 28, 21], [3.5, 26, 20]]);
    row(z(1), x0 + 4, [[3, 24, 17], [2.5, 22, 16], [4, 25, 18], [3, 23, 17]]);
    stack(z(2), x0 + 52, [[3, 24, 18], [2.5, 22, 16]]);
    row(z(3), x0 + 4, [[3, 25, 18], [3.5, 27, 19], [2.5, 24, 17], [4, 28, 20], [3, 26, 18]]);
    row(z(3), x0 + 70, [[3, 23, 16], [3.5, 25, 17], [2.5, 22, 16]]);
    stack(z(4), x0 + 8, [[3, 26, 19], [2.5, 24, 18], [3, 22, 16], [2, 20, 15]]);
    row(z(5), x0 + 62, [[2.5, 22, 16], [3, 24, 17], [3.5, 25, 18], [2.5, 21, 15], [3, 23, 16]]);
    // wooden objects
    const yc2 = (y0 + y1) / 2;
    rbox('/Libreria/Libreria_Legno_Scatola', WOOD[0], [x0 + 33, yc2 - 7, z(1), x0 + 49, yc2 + 7, z(1) + 9], 1, 0.6);
    tube('/Libreria/Libreria_Legno_Vaso', WOOD[1], [[x0 + 82, yc2, z(2)], [x0 + 82, yc2, z(2) + 6], [x0 + 82, yc2, z(2) + 16], [x0 + 82, yc2, z(2) + 22]], [4, 6, 4.5, 3], 18);
    tube('/Libreria/Libreria_Legno_Ciotola', WOOD[2], [[x0 + 66, yc2, z(2)], [x0 + 66, yc2, z(2) + 2], [x0 + 66, yc2, z(2) + 6]], [4, 8, 10], 20);
    const bz = z(3) + 5; const p = [], rr = [];
    for (let i = 0; i <= 8; i++) { const a = Math.PI * i / 8; p.push([x0 + 58, yc2, bz - 5 * Math.cos(a)]); rr.push(Math.max(0.2, 5 * Math.sin(a))); }
    tube('/Libreria/Libreria_Legno_Sfera', WOOD[0], p, rr, 18);
    rbox('/Libreria/Libreria_Legno_Fermalibri', WOOD[2], [x0 + 30, yc2 - 6, z(4), x0 + 33, yc2 + 6, z(4) + 15], 0.5, 0.5);
    tube('/Libreria/Libreria_Legno_Candeliere', WOOD[1], [[x0 + 92, yc2, z(5)], [x0 + 92, yc2, z(5) + 1.5], [x0 + 92, yc2, z(5) + 18]], [3.5, 1.6, 1.4], 14);
  });
  kit.items.filter(i => /Libreria_Legno_(Vaso|Ciotola|Sfera|Candeliere)/.test(i.n)).forEach(i => { i.ne = 1; });
}

// OPTION (former version casa-poggi-porta-scorrevole): kept hidden, the user switches it on in the Groups panel
// bifold glass door between soggiorno and cucina (from the user's photo), flush with the soggiorno west wall face (x = 0),
// from the end of that wall to the pier; 250 cm high under an 80 cm wall up to the ceiling. Door + wall above are one
// movable piece (every leaf name starts with "Porta", no digits). Two halves, each = 2 leaves hinged at its jamb,
// meeting in the middle; drawn half open, folded towards the soggiorno
// door height user; leaf frame sizes, transom heights (from the photo) and the opening angle estimate
{ const DH = 250, y0 = YK0 - TK, y1 = YS1 - KP.d, x = 0, GR = [62, 64, 67, 255], GL = [205, 218, 222, 60];
  const L = (y1 - y0) / 4, th = 35 * Math.PI / 180, fw = 4, ft = 1.5;   // leaf width, half fold angle, frame width, half thickness
  defGroup('porta-cucina', 'Porta a soffietto cucina (vetro, grigio scuro)', 'Porte');
  group('porta-cucina', () => {
    box('/Porta_Cucina/Porta_Muro_Sopra', WHITE, x - 10, y0, DH, x, y1, H);   // wall from the door head to the ceiling, flush with the wall face
    const leaf = (n, A, B) => {                      // one leaf from hinge line A to hinge line B (plan points)
      const d = [(B[0] - A[0]) / L, (B[1] - A[1]) / L], nr = [-d[1], d[0]];
      const P = (u, v) => [A[0] + d[0] * u + nr[0] * v, A[1] + d[1] * u + nr[1] * v];
      const part = (m, c, u0, u1, z0, z1, v) => slab(`/Porta_Cucina/Porta_${n}_${m}`, c, ccw([P(u0, -v), P(u1, -v), P(u1, v), P(u0, v)]), z0, z1);
      part('Montante_A', GR, 0, fw, 0, DH, ft);
      part('Montante_B', GR, L - fw, L, 0, DH, ft);
      part('Traverso_Basso', GR, fw, L - fw, 0, 8, ft);
      part('Traverso_Alto', GR, fw, L - fw, DH - fw, DH, ft);
      [0.25, 0.5, 0.75].forEach((f, i) => part(`Traverso_${'abc'[i]}`, GR, fw, L - fw, DH * f - 1, DH * f + 1, ft));
      part('Vetro', GL, fw, L - fw, 8, DH - fw, 0.4);
    };
    const c = Math.cos(th) * L, s2 = Math.sin(th) * L, xo = x + ft;   // hinges just in front of the wall face
    leaf('Sud_a', [xo, y0], [xo + s2, y0 + c]);            // south half: hinge on the end of the west wall
    leaf('Sud_b', [xo + s2, y0 + c], [xo, y0 + 2 * c]);
    leaf('Nord_a', [xo, y1], [xo + s2, y1 - c]);           // north half: hinge on the pier
    leaf('Nord_b', [xo + s2, y1 - c], [xo, y1 - 2 * c]);
  });
  kit.items.filter(i => i.n.endsWith('_Vetro')).forEach(i => { i.ne = 1; });
}

// OPTION (former version casa-poggi-gabbia-cucina): kept hidden, the user switches it on in the Groups panel
require('./gabbia-cucina')(kit, { H, Y0: YK0 - TK, Y1: YS1, WHITE });

const out = process.argv[2] || path.join(__dirname, 'scene.json');
// built-in wardrobe on the east end wall of the ingresso (from the user's photos): full corridor width, 10 cm side frames,
// 2 upper doors (1 panel, lock on the right one) + 2 tall lower doors (4 panels)   width/top gap measured, recessed: only 5 cm (frame + doors) stand out of the wall, split heights estimate
{ const W = { d: 2.4, side: 10, top: H - 10, split: 225, rail: 10, c: [226, 213, 186, 255], line: [222, 208, 180, 255] };
  const xf = XR - W.d, y0 = YI0, y1 = YI1, yd0 = y0 + W.side, yd1 = y1 - W.side, ym = (yd0 + yd1) / 2;
  group('armadio', () => {
    box('/Armadio/Corpo', W.c, xf, y0, 0, XR, y1, W.top);
    const leaf = (n, ya, yb, za, zb, rows) => {
      box(`/Armadio/${n}`, W.c, xf - 2, ya + 0.3, za + 0.3, xf, yb - 0.3, zb - 0.3);
      const m = 7, ph = (zb - za - m * (rows + 1)) / rows;
      for (let r = 0; r < rows; r++) {
        const z0 = za + m + r * (ph + m), z1 = z0 + ph;
        box(`/Armadio/${n}_Riquadro${r + 1}`, W.line, xf - 2.6, ya + m, z0, xf - 2, yb - m, z1);   // one raised panel: a single outline instead of 4 strips
      }
    };
    leaf('Anta_Bassa_Sx', yd0, ym, 0, W.split, 4);
    leaf('Anta_Bassa_Dx', ym, yd1, 0, W.split, 4);
    leaf('Anta_Alta_Sx', yd0, ym, W.split + W.rail, W.top - W.rail, 1);
    leaf('Anta_Alta_Dx', ym, yd1, W.split + W.rail, W.top - W.rail, 1);
    // simple outer moulding along the sides and the top of the wardrobe (not up to the ceiling)
    const MC = [205, 190, 160, 255], mw = 3;
    box('/Armadio/Cornice_Sx', MC, xf - 3, y0, 0, xf, y0 + mw, W.top + mw);
    box('/Armadio/Cornice_Dx', MC, xf - 3, y1 - mw, 0, xf, y1, W.top + mw);
    box('/Armadio/Cornice_Alta', MC, xf - 3, y0, W.top, xf, y1, W.top + mw);
    tube('/Armadio/Serratura', [80, 60, 40, 255], [[xf - 2, ym + 6, W.split + 70], [xf - 3, ym + 6, W.split + 70]], [1, 1]);
  });
  defGroup('armadio', 'Armadio a muro', 'Arredi', null, { fixed: true }); }

kit.write(out, {
  camera: kit.camera([-25, (ENTRY.from + ENTRY.to) / 2, 160], [300, 820, 120], 65),   // default view: standing in the front doorway, looking into ingresso and soggiorno
  spawn: kit.spawn([30, YI0 + 80], 0),
  ceiling: kit.ceiling([[XC0, 0], [XR, 0], [XR, YS1], [XK0, YS1], KA, KB, [0, YK0], [0, YI0], [XC0, YI0]], H, H + 2),
});
console.log('wrote', path.relative(process.cwd(), out), '-', kit.items.length, 'items');
