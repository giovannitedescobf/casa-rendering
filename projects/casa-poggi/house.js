// Casa Poggi (Milano, primo piano): generator of projects/casa-poggi/scene.json. All measures in cm (x right = east, y up = north toward the courtyard, z up); output in inches.
// Usage: node projects/casa-poggi/house.js [output_file]
// Source: floor plan PDF "Planimetria_Casa_Poggi_Milano_modificata" (stato di fatto). "measured" = printed on the drawing, "estimate" = guessed.
// Basic shell only: walls, openings, floor, balconies. No furniture, no materials yet (neutral colours).
const path = require('path');
const kit = require('../../scripts/scene-kit').createScene({ defaultOn: [] });
const { box, wall } = kit;

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
const BALC_D = 120;                // balcony depth                                    estimate (2 balconies ~ 7 m2 as on the drawing)
const PF = { w: 120, h: 280 };     // porte-finestre (soggiorno, camera)               measured
const WB = { w: 40, h: 150, sill: 110 };   // bathroom window; sill                    measured w/h, sill estimate
const DOOR_H = 210, DOOR_W = 80;   // interior doors                                   estimate
const ENTRY_W = 90;                // front door                                       estimate

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
box('/Casa/Pavimento_Zona_Giorno', C.floor, -TE, YI0 - TI, -4, XR + TE, YS1 + TE, 0);
box('/Casa/Pavimento_Cucina', C.floor, XK0 - TE, YK0 - TI, -4, -TE, YS1 + TE, 0);
box('/Casa/Pavimento_Camera', C.floor, XC0 - TE, -TE, -4, XR + TE, YI0 - TI, 0);

// ---------- exterior walls ----------
const SOG_PF = pf(140), CAM_PF = pf(XC0 + 145), BAGNO_WIN = { from: XB0 + 30, to: XB0 + 30 + WB.w, sill: WB.sill, head: WB.sill + WB.h };
wall('/Casa/Muro_Nord', C.wall, [XK0 - TE, YS1, XR + TE, YS1 + TE], H, [SOG_PF, BAGNO_WIN]);
wall('/Casa/Muro_Est', C.wall, [XR, -TE, XR + TE, YS1], H);
wall('/Casa/Muro_Sud', C.wall, [XC0 - TE, -TE, XR, 0], H, [CAM_PF]);
wall('/Casa/Muro_Ovest_Camera', C.wall, [XC0 - TE, 0, XC0, YC1], H);
wall('/Casa/Muro_Ovest_Ingresso', C.wall, [-TE, YC1, 0, YK0 - TI], H, [{ from: YI0 + 35, to: YI0 + 35 + ENTRY_W, head: DOOR_H }]);   // front door from the common stair
wall('/Casa/Muro_Ingresso_Camera_Ovest', C.wall, [-TE, YC1, XC0, YI0], H);
wall('/Casa/Muro_Ovest_Cucina', C.wall, [XK0 - TE, YK0 - TI, XK0, YS1], H);
wall('/Casa/Muro_Sud_Cucina', C.wall, [XK0 - TE, YK0 - TI, XK1, YK0], H);

// ---------- partitions ----------
wall('/Casa/Tramezzo_Ingresso_Camera', C.wall, [XC0, YC1, XR, YI0], H, [{ from: 230, to: 230 + DOOR_W, head: DOOR_H }]);
wall('/Casa/Tramezzo_Cucina_Soggiorno', C.wall, [XK1, YK0 - TI, 0, YS1], H, [{ from: YS1 - 25 - 70, to: YS1 - 25, head: DOOR_H }]);
wall('/Casa/Tramezzo_Soggiorno_Bagno', C.wall, [ROOMS.soggiorno.w, YS0, XB0, YS1], H);
wall('/Casa/Tramezzo_Bagno_Ingresso', C.wall, [XB0, YI1, XR, YS0], H, [{ from: XB0 + 30, to: XB0 + 30 + 70, head: DOOR_H }]);

// ---------- glass ----------
box('/Casa/Vetro_PF_Soggiorno', C.glass, SOG_PF.from, YS1 + 14, 0, SOG_PF.to, YS1 + 16, PF.h);
box('/Casa/Vetro_PF_Camera', C.glass, CAM_PF.from, -16, 0, CAM_PF.to, -14, PF.h);
box('/Casa/Vetro_Finestra_Bagno', C.glass, BAGNO_WIN.from, YS1 + 14, BAGNO_WIN.sill, BAGNO_WIN.to, YS1 + 16, BAGNO_WIN.head);

// ---------- balconies ----------
const balcony = (n, x0, x1, y0, y1, side) => {
  box(`/Casa/${n}/Soletta`, C.balcony, x0, y0, -16, x1, y1, -2);
  const yr = side > 0 ? y1 - 4 : y0;
  box(`/Casa/${n}/Parapetto_Fronte`, C.rail, x0, yr, -2, x1, yr + 4, 100);
  box(`/Casa/${n}/Parapetto_Ovest`, C.rail, x0, Math.min(y0, y1), -2, x0 + 4, Math.max(y0, y1), 100);
  box(`/Casa/${n}/Parapetto_Est`, C.rail, x1 - 4, Math.min(y0, y1), -2, x1, Math.max(y0, y1), 100);
};
balcony('Balcone_Cortile', 0, 330, YS1 + TE, YS1 + TE + BALC_D, 1);
balcony('Balcone_Via_Poggi', XC0 - TE, XC0 + 210, -TE - BALC_D, -TE, -1);

const out = process.argv[2] || path.join(__dirname, 'scene.json');
kit.write(out, {
  camera: kit.camera([1400, -900, 1900], [200, 550, 40]),
  spawn: kit.spawn([30, YI0 + 80], 0),
  ceiling: kit.ceiling([[XC0, 0], [XR, 0], [XR, YS1], [XK0, YS1], [XK0, YK0], [0, YK0], [0, YI0], [XC0, YI0]], H, H + 2),
});
console.log('wrote', path.relative(process.cwd(), out), '-', kit.items.length, 'items');
