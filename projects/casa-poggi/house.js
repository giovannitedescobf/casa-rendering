// Casa Poggi (Milano, primo piano): generator of projects/casa-poggi/scene.json. All measures in cm (x right = east, y up = north toward the courtyard, z up); output in inches.
// Usage: node projects/casa-poggi/house.js [output_file]
// Source: floor plan PDF "Planimetria_Casa_Poggi_Milano_modificata" (stato di fatto). "measured" = printed on the drawing, "estimate" = guessed.
// Basic shell only: walls, openings, floor, balconies. No furniture, no materials yet (neutral colours).
const path = require('path');
const kit = require('../../scripts/scene-kit').createScene({ defaultOn: ['porte', 'armadio', 'porta-bagno', 'pittura', 'condizionatore'] });
const { box, wall, slab, tube, rbox, group, defGroup } = kit;

// ---------- dimensions (cm) ----------
const H = 330;                     // ceiling height                                   measured
const TE = 30;                     // exterior / bearing walls                         estimate
const TI = 10;                     // partitions                                       estimate
const TB = 11;                     // partition soggiorno / bagno (360 + TB + 129 = ingresso 500)   estimate
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
const TK = 15;                     // cucina outer walls (thin on the drawing)         estimate

// ---------- layout (derived) ----------
const XR = ROOMS.ingresso.w;                       // inner face of the east wall (500)
const YC1 = ROOMS.camera.d;                        // camera north face (485)
const YI0 = YC1 + TI, YI1 = YI0 + ROOMS.ingresso.d;   // ingresso 495..655
const YS0 = YI1 + TI, YS1 = YS0 + ROOMS.soggiorno.d;  // soggiorno / bagno 665..1105
const XC0 = XR - ROOMS.camera.w;                   // camera west face (150)
const XB0 = ROOMS.soggiorno.w + TB;                // bagno west face (371)
const XK1 = -TI, XK0 = XK1 - ROOMS.cucina.w;       // cucina -109..-10
const YK0 = YS1 - ROOMS.cucina.d;                  // cucina south face (920)

const C = { wall: [236, 233, 228, 255], floor: [196, 186, 172, 255], balcony: [170, 168, 164, 255],
            rail: [70, 72, 76, 255], glass: [170, 205, 225, 80] };
const pf = (cx) => ({ from: cx - PF.w / 2, to: cx + PF.w / 2, head: PF.h });

// ---------- floor ----------
box('/Casa/Pavimento_Ingresso', C.floor, -TE, YI0 - TI, -4, XR + TE, YS0, 0);
box('/Casa/Pavimento_Bagno', C.floor, ROOMS.soggiorno.w, YS0, -4, XR + TE, YS1 + TE, 0);
box('/Casa/Pavimento_Soggiorno', C.floor, 0, YS0, -4, ROOMS.soggiorno.w, YS1 + TE, 0);
// camera: herringbone parquet (honey oak, 7 x 42 cm boards at 45 degrees, from the user's photo) + darker border band   pattern measured on photo, sizes estimate
slab('/Casa/Camera/Parquet', [150, 95, 50, 255], [[XC0 - TE, -TE], [XR + TE, -TE], [XR + TE, YI0 - TI], [XC0 - TE, YI0 - TI]], -4, 0);
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
wall('/Casa/Muro_Sud', C.wall, [XC0 - TE, -TE, XR, 0], H, [CAM_PF]);
wall('/Casa/Muro_Ovest_Camera', C.wall, [XC0 - TE, 0, XC0, YC1], H);
wall('/Casa/Muro_Ovest_Ingresso', C.wall, [-TE, YC1, 0, YK0 - TK], H, [ENTRY]);   // front door from the common stair
wall('/Casa/Muro_Ingresso_Camera_Ovest', C.wall, [-TE, YC1, XC0, YI0], H);

// ---------- cucina: west wall, oblique wall, south wall in one polygon (inner path, then the outer path offset by TK) ----------
const KA = [XK0, YS1 - K_SLANT.west], KB = [XK0 + K_SLANT.south, YK0];       // ends of the slant (inner face)
const meet = (p1, d1, p2, d2) => { const t = ((p2[0] - p1[0]) * d2[1] - (p2[1] - p1[1]) * d2[0]) / (d1[0] * d2[1] - d1[1] * d2[0]); return [p1[0] + t * d1[0], p1[1] + t * d1[1]]; };
const dS = [KB[0] - KA[0], KB[1] - KA[1]], lS = Math.hypot(...dS), nS = [dS[1] / lS, -dS[0] / lS];   // outward normal of the slant (down-left)
const oS = [KA[0] + nS[0] * TK, KA[1] + nS[1] * TK];
const KA_out = meet(oS, dS, [XK0 - TK, 0], [0, 1]), KB_out = meet(oS, dS, [0, YK0 - TK], [1, 0]);
const ccw = (poly) => poly.reduce((a, p, i) => { const q = poly[(i + 1) % poly.length]; return a + p[0] * q[1] - q[0] * p[1]; }, 0) > 0 ? poly : poly.slice().reverse();
const kWall = ccw([[XK0, YS1], KA, KB, [XK1, YK0], [XK1, YK0 - TK], KB_out, KA_out, [XK0 - TK, YS1]]);
slab('/Casa/Muro_Cucina_Obliquo', C.wall, kWall, 0, H);
slab('/Casa/Pavimento_Cucina', C.floor, ccw([[XK0 - TK, YS1 + TE], KA_out, KB_out, [XK1, YK0 - TK], [0, YK0 - TK], [0, YS1 + TE]]), -4, 0);

// ---------- partitions ----------
wall('/Casa/Tramezzo_Ingresso_Camera', C.wall, [XC0, YC1, XR, YI0], H, [{ from: 230, to: 230 + DOOR_W, head: DOOR_H }]);
wall('/Casa/Tramezzo_Cucina_Soggiorno', C.wall, [XK1, YK0 - TK, 0, YS1], H, [{ from: YS1 - 25 - 70, to: YS1 - 25, head: DOOR_H }]);
wall('/Casa/Tramezzo_Soggiorno_Bagno', C.wall, [ROOMS.soggiorno.w, YS0, XB0, YS1], H);
wall('/Casa/Tramezzo_Bagno_Ingresso', C.wall, [XB0, YI1, XR, YS0], H, [{ from: XB0 + 30, to: XB0 + 30 + 70, head: DOOR_H }]);

// ---------- front door: brown leaf, open 90 degrees outward onto the common stair landing, hinged on the north jamb ----------
const DOOR_C = [112, 72, 44, 255], DOOR_T = 5;
defGroup('porte', 'Porta di ingresso', 'Porte', null, { fixed: true });
group('porte', () => {
  const XO = -TE;                                                       // outer face of the wall
  box('/Casa/Porta_Ingresso/Anta', DOOR_C, XO - (ENTRY_W - 4), ENTRY.to - DOOR_T, 0, XO, ENTRY.to, DOOR_H - 2);
  tube('/Casa/Porta_Ingresso/Maniglia', [200, 200, 200, 255], [[XO - (ENTRY_W - 14), ENTRY.to - DOOR_T - 1, 105], [XO - (ENTRY_W - 14), ENTRY.to - DOOR_T - 7, 105], [XO - (ENTRY_W - 26), ENTRY.to - DOOR_T - 7, 105]], [1.2, 1.2, 1.2]);
});

// ---------- cream paint on the walls of camera and soggiorno (bagno, cucina, ingresso stay white) ----------
// thin skins on the room faces, in a default-on group so the Plan sheet keeps measuring the bare walls   colour estimate from photos
{ const P = [240, 230, 208, 255], s = 0.3, KD = { from: YS1 - 25 - 70, to: YS1 - 25, head: DOOR_H };
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
    wall('/Pittura/Facciata_Camera', [224, 186, 124, 255], [XC0 - TE, -TE - s, XR + TE, -TE], H, [CAM_PF]);   // outside face of the camera wall, yellow like the balcony
    wall('/Pittura/Soggiorno_Nord', P, [0, YS1 - s, ROOMS.soggiorno.w, YS1], H, [SOG_PF]);
    wall('/Pittura/Soggiorno_Ovest', P, [0, YS0, s, YS1], H, [KD]);
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
{ const x0 = XC0 - TE, x1 = XC0 + 210, y0 = -TE - BALC_D, y1 = -TE, B = 'Casa/Balcone_Via_Poggi';
  const YEL = [224, 186, 124, 255], GRAN = [168, 166, 160, 255], cap = 10, ov = 2, wt = cap - 2 * ov, hp = 95, hc = 5;
  box(`/${B}/Soletta`, [128, 128, 126, 255], x0, y0, -16, x1, y1, -2);
  box(`/${B}/Parapetto_Fronte`, YEL, x0 + ov, y0 + ov, -2, x1 - ov, y0 + ov + wt, hp);
  box(`/${B}/Parapetto_Ovest`, YEL, x0 + ov, y0 + ov + wt, -2, x0 + ov + wt, y1, hp);
  box(`/${B}/Parapetto_Est`, YEL, x1 - ov - wt, y0 + ov + wt, -2, x1 - ov, y1, hp);
  box(`/${B}/Copertina_Fronte`, GRAN, x0, y0, hp, x1, y0 + cap, hp + hc);
  box(`/${B}/Copertina_Ovest`, GRAN, x0, y0 + cap, hp, x0 + cap, y1, hp + hc);
  box(`/${B}/Copertina_Est`, GRAN, x1 - cap, y0 + cap, hp, x1, y1, hp + hc);
}

// air-conditioner outdoor unit on the camera balcony, from the user's photo: west side, long side along the west parapet,
// starting near the facade, touching nothing   width = 1/4 of the parapet-to-door stretch, length < half the depth, all estimate
{ const xp = XC0 - TE + 8, xd = CAM_PF.from, w = (xd - xp) / 4, l = 55, h = 50, gap = 8, x0 = xp + gap, y1 = -TE - 6, y0 = y1 - l;
  defGroup('condizionatore', 'Motore condizionatore', 'Impianti');
  group('condizionatore', () => {
    rbox('/Condizionatore/Motore_Corpo', [226, 222, 208, 255], [x0, y0, 3, x0 + w, y1, h], 2, 3);
    box('/Condizionatore/Motore_Piede_Nord', [90, 90, 90, 255], x0 + 2, y1 - 8, 0, x0 + w - 2, y1 - 4, 3);
    box('/Condizionatore/Motore_Piede_Sud', [90, 90, 90, 255], x0 + 2, y0 + 4, 0, x0 + w - 2, y0 + 8, 3);
    box('/Condizionatore/Motore_Griglia', [70, 72, 74, 255], x0 + w, y0 + 8, 10, x0 + w + 0.5, y0 + 36, h - 8);
  });
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
