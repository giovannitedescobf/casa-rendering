// Realistic finishing details (on by default): white skirting boards in every
// room, the porte-finestre (fixed frame + two glazed leaves drawn open 90 degrees inward, so the balconies stay reachable
// in first person), stone thresholds, the bathroom window frame and the architraves around the interior doors.
// Two fixed groups (finishes, like the paint and the floors: they belong to the walls and never move).
// every size here is an estimate (typical joinery), none was measured
module.exports = function (kit, d) {
  const { box, wall, slab, tube, group, defGroup, items } = kit;
  const { XR, XC0, XB0, SW, YC1, YI0, YI1, YS0, YS1, YK0, XK0, XK1, KP, KA, KB, PF, CAM_PF, SOG_PF, CAM_DOOR, BATH_DOOR, ENTRY, BAGNO_WIN, DOOR_H, ccw } = d;
  const WH = [245, 244, 240, 255], GL = [200, 222, 232, 60], STONE = [222, 216, 204, 255], BRASS = [176, 128, 52, 255];
  const B = (n, c, x0, y0, z0, x1, y1, z1) => box(n, c, Math.min(x0, x1), Math.min(y0, y1), z0, Math.max(x0, x1), Math.max(y0, y1), z1);

  // ---------- skirting boards: s = +1 when the room lies on the + side of the wall face ----------
  const SK = { h: 8, t: 1.3 };
  defGroup('battiscopa', 'Battiscopa bianco (h 8 cm)', 'Finiture', null, { fixed: true });
  group('battiscopa', () => {
    const h = (n, x0, x1, y, s, gaps = []) => wall(`/Battiscopa/Battiscopa_${n}`, WH, s > 0 ? [x0, y, x1, y + SK.t] : [x0, y - SK.t, x1, y], SK.h, gaps);
    const v = (n, y0, y1, x, s, gaps = []) => wall(`/Battiscopa/Battiscopa_${n}`, WH, s > 0 ? [x, y0, x + SK.t, y1] : [x - SK.t, y0, x, y1], SK.h, gaps);
    h('Camera_Sud', XC0, XR, 0, 1, [CAM_PF]); h('Camera_Nord', XC0, XR, YC1, -1, [CAM_DOOR]);
    v('Camera_Ovest', 0, YC1, XC0, 1); v('Camera_Est', 0, YC1, XR, -1);
    h('Ingresso_Sud', 0, XR, YI0, 1, [CAM_DOOR]); h('Ingresso_Nord', SW, XR, YI1, -1, [BATH_DOOR]);
    v('Ovest', YI0, YK0, 0, 1, [ENTRY]);                                  // ingresso + soggiorno west wall, up to the cucina opening
    h('Soggiorno_Nord', 0, SW, YS1, -1, [SOG_PF]); v('Soggiorno_Est', YI1, YS1, SW, -1);
    h('Bagno_Sud', XB0, XR, YS0, 1, [BATH_DOOR]); h('Bagno_Nord', XB0, XR, YS1, -1);
    v('Bagno_Ovest', YS0, YS1, XB0, 1); v('Bagno_Est', YS0, YS1, XR, -1);
    v('Cucina_Ovest', KA[1], YS1, XK0, 1); h('Cucina_Nord', XK0, XK1, YS1, -1); h('Cucina_Sud', KB[0], 0, YK0, 1);
    v('Pilastro_Ovest', YS1 - KP.d, YS1, XK1, -1); h('Pilastro_Sud', XK1, 0, YS1 - KP.d, -1); v('Pilastro_Est', YS1 - KP.d, YS1, 0, 1);
    const dS = [KB[0] - KA[0], KB[1] - KA[1]], l = Math.hypot(...dS), o = [-dS[1] / l * SK.t, dS[0] / l * SK.t];   // oblique wall: offset towards the room
    slab('/Battiscopa/Battiscopa_Cucina_Obliquo', WH, ccw([KA, KB, [KB[0] + o[0], KB[1] + o[1]], [KA[0] + o[0], KA[1] + o[1]]]), 0, SK.h);
  });

  // ---------- windows and door trims ----------
  defGroup('infissi', 'Infissi: porte-finestre, finestra bagno, cornici porte', 'Finiture', null, { fixed: true });
  group('infissi', () => {
    // porte-finestre: yIn = inner wall face, s = +1 when the outside is towards +y; frame 6 x 7 cm set 8 cm into the reveal
    const FR = { w: 6, d0: 8, d1: 15, t: 5 };
    const portaFinestra = (n, O, yIn, s) => {
      const P = `/Infissi/${n}`, y = p => yIn + s * p, zt = PF.h - FR.w;
      B(`${P}_Telaio_Sx`, WH, O.from, y(FR.d0), 0, O.from + FR.w, y(FR.d1), PF.h);
      B(`${P}_Telaio_Dx`, WH, O.to - FR.w, y(FR.d0), 0, O.to, y(FR.d1), PF.h);
      B(`${P}_Telaio_Alto`, WH, O.from + FR.w, y(FR.d0), zt, O.to - FR.w, y(FR.d1), PF.h);
      B(`${P}_Soglia`, STONE, O.from, y(0), 0, O.to, y(35), 0.6);
      const lw = (O.to - O.from) / 2 - FR.w;                           // leaf width; open leaves run from the frame into the room
      for (const [m, xa, xb] of [['Sx', O.from + FR.w, O.from + FR.w + FR.t], ['Dx', O.to - FR.w - FR.t, O.to - FR.w]]) {
        const L = (k, c, v0, v1, z0, z1, inset = 0) => B(`${P}_Anta_${m}_${k}`, c, xa + inset, y(FR.d0 - v0), z0, xb - inset, y(FR.d0 - v1), z1);
        L('Montante_Cerniera', WH, 0, 6, 2, zt); L('Montante_Battuta', WH, lw - 6, lw, 2, zt);
        L('Traverso_Basso', WH, 6, lw - 6, 2, 14); L('Traverso_Medio', WH, 6, lw - 6, 95, 101); L('Traverso_Alto', WH, 6, lw - 6, zt - 6, zt);
        L('Vetro', GL, 6, lw - 6, 14, zt - 6, 2);
        items[items.length - 1].ne = 1;
      }
      const hx = O.from + FR.w + FR.t, hy = y(FR.d0 - lw + 3);         // lever handle on the free stile of the west leaf
      tube(`${P}_Maniglia`, BRASS, [[hx, hy, 105], [hx + 5, hy, 105], [hx + 5, hy, 93]], [0.9, 0.9, 0.9]);
      items[items.length - 1].mt = [1, 0.3];
    };
    portaFinestra('Soggiorno', SOG_PF, YS1, 1);
    portaFinestra('Camera', CAM_PF, 0, -1);
    // bathroom window: frame around the existing glass + inner sill board
    { const W = BAGNO_WIN, P = '/Infissi/Bagno', y0 = YS1 + 12, y1 = YS1 + 18, w = 3.5;
      box(`${P}_Telaio_Sx`, WH, W.from, y0, W.sill, W.from + w, y1, W.head);
      box(`${P}_Telaio_Dx`, WH, W.to - w, y0, W.sill, W.to, y1, W.head);
      box(`${P}_Telaio_Basso`, WH, W.from + w, y0, W.sill, W.to - w, y1, W.sill + w);
      box(`${P}_Telaio_Alto`, WH, W.from + w, y0, W.head - w, W.to - w, y1, W.head);
      box(`${P}_Davanzale`, STONE, W.from - 2, YS1 - 2, W.sill, W.to + 2, y0, W.sill + 2); }
    // architraves: 7 x 1.5 cm trims on the wall faces around a door opening (outside the opening, so the leaves stay free)
    const TR = { w: 7, t: 1.5 };
    const trimX = (n, c, O, yF, s, head = DOOR_H) => {                  // door in a wall along x; yF = wall face, s = side the trim stands out to
      B(`/Infissi/Cornice_${n}_Sx`, c, O.from - TR.w, yF, 0, O.from, yF + s * TR.t, head);
      B(`/Infissi/Cornice_${n}_Dx`, c, O.to, yF, 0, O.to + TR.w, yF + s * TR.t, head);
      B(`/Infissi/Cornice_${n}_Alta`, c, O.from - TR.w, yF, head, O.to + TR.w, yF + s * TR.t, head + TR.w);
    };
    const CREAM = [242, 234, 214, 255];
    trimX('Camera_Lato_Camera', WH, CAM_DOOR, YC1, -1); trimX('Camera_Lato_Ingresso', WH, CAM_DOOR, YI0, 1);
    trimX('Bagno_Lato_Ingresso', CREAM, BATH_DOOR, YI1, -1); trimX('Bagno_Lato_Bagno', CREAM, BATH_DOOR, YS0, 1);
    { const c = [100, 64, 40, 255], O = ENTRY;                          // front door, inside face of the stair wall (x = 0)
      box('/Infissi/Cornice_Ingresso_Sud', c, 0, O.from - TR.w, 0, TR.t, O.from, DOOR_H);
      box('/Infissi/Cornice_Ingresso_Nord', c, 0, O.to, 0, TR.t, O.to + TR.w, DOOR_H);
      box('/Infissi/Cornice_Ingresso_Alta', c, 0, O.from - TR.w, DOOR_H, TR.t, O.to + TR.w, DOOR_H + TR.w); }
  });
};
