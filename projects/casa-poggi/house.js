// Casa Poggi (Milano, primo piano): generator of projects/casa-poggi/scene.json. All measures in cm (x right = east, y up = north toward the courtyard, z up); output in inches.
// Usage: node projects/casa-poggi/house.js [output_file]
// Source: floor plan PDF "Planimetria_Casa_Poggi_Milano_modificata" (stato di fatto). "measured" = printed on the drawing, "estimate" = guessed.
// Basic shell only: walls, openings, floor, balconies. No furniture, no materials yet (neutral colours).
const path = require('path');
const kit = require('../../scripts/scene-kit').createScene({ defaultOn: ['porte', 'armadio', 'porta-bagno', 'pittura', 'condizionatore', 'lampada-terra', 'gatto', 'libreria'] });
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

const C = { wall: [236, 233, 228, 255], floor: [196, 186, 172, 255], balcony: [170, 168, 164, 255],
            rail: [70, 72, 76, 255], glass: [170, 205, 225, 80] };
const pf = (cx) => ({ from: cx - PF.w / 2, to: cx + PF.w / 2, head: PF.h });

// ---------- floor ----------
box('/Casa/Pavimento_Ingresso', C.floor, -TS, YI0 - TI, -4, XR + TE, YS0, 0);
box('/Casa/Pavimento_Bagno', C.floor, ROOMS.soggiorno.w, YS0, -4, XR + TE, YS1 + TE, 0);
box('/Casa/Pavimento_Soggiorno', C.floor, 0, YS0, -4, ROOMS.soggiorno.w, YS1 + TE, 0);
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
const kWall = ccw([[XK0, YS1], KA, KB, [-TS, YK0], [-TS, YK0 - TK], KB_out, KA_out, [XK0 - TK, YS1]]);
slab('/Casa/Muro_Cucina_Obliquo', C.wall, kWall, 0, H);
slab('/Casa/Pavimento_Cucina', C.floor, ccw([[XK0 - TK, YS1 + TE], KA_out, KB_out, [-TS, YK0 - TK], [0, YK0 - TK], [0, YS1 + TE]]), -4, 0);

// ---------- partitions ----------
wall('/Casa/Tramezzo_Ingresso_Camera', C.wall, [XC0, YC1, XR, YI0], H, [{ from: 230, to: 230 + DOOR_W, head: DOOR_H }]);
// the cucina / soggiorno partition is removed on request: open plan (no wall, no door); only the pier at the cortile wall stays
box('/Casa/Pilastro_Cucina', C.wall, XK1, YS1 - KP.d, 0, 0, YS1, H);
wall('/Casa/Tramezzo_Soggiorno_Bagno', C.wall, [ROOMS.soggiorno.w, YS0, XB0, YS1], H);
wall('/Casa/Tramezzo_Bagno_Ingresso', C.wall, [XB0, YI1, XR, YS0], H, [{ from: XB0 + 30, to: XB0 + 30 + 70, head: DOOR_H }]);

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
{ const P = [240, 230, 208, 255], s = 0.3;
  defGroup('pittura', 'Pareti color panna', 'Finiture', null, { fixed: true });
  group('pittura', () => {
    wall('/Pittura/Camera_Sud', P, [XC0, 0, XR, s], H, [CAM_PF]);
    wall('/Pittura/Camera_Nord', P, [XC0, YC1 - s, XR, YC1], H, [{ from: 230, to: 230 + DOOR_W, head: DOOR_H }]);
    wall('/Pittura/Camera_Ovest', P, [XC0, 0, XC0 + s, YC1], H);
    wall('/Pittura/Camera_Est', P, [XR - s, 0, XR, YC1], H);
    wall('/Pittura/Ingresso_Sud', P, [0, YI0, XR, YI0 + s], H, [{ from: 230, to: 230 + DOOR_W, head: DOOR_H }]);
    wall('/Pittura/Ingresso_Nord', P, [XB0, YI1 - s, XR, YI1], H, [{ from: XB0 + 30, to: XB0 + 100, head: DOOR_H }]);
    wall('/Pittura/Ingresso_Ovest', P, [0, YI0, s, YI1], H, [ENTRY]);
    wall('/Pittura/Ingresso_Est', P, [XR - s, YI0, XR, YI1], H);
    wall('/Pittura/Facciata_Camera', [224, 186, 124, 255], [XC0 - TW, -TE - s, XR + TE, -TE], H, [CAM_PF]);   // outside face of the camera wall, yellow like the balcony
    wall('/Pittura/Soggiorno_Nord', P, [0, YS1 - s, ROOMS.soggiorno.w, YS1], H, [SOG_PF]);
    wall('/Pittura/Soggiorno_Ovest', P, [0, YS0, s, YK0 - TK], H);
    wall('/Pittura/Soggiorno_Est', P, [ROOMS.soggiorno.w - s, YS0, ROOMS.soggiorno.w, YS1], H);
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
      tube(`/Lampada/Lampada_Vetro_${i + 1}`, OP, p, r, 28);
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
