// Glass-and-steel kitchen cage (from the user's photos), shared by the base (hidden) and casa-poggi-gabbia-cucina (on).
// Projects 50 cm into the soggiorno, two sides: a short return on the line of the cucina south wall and a long side
// parallel to the west wall up to the window wall (north); black-framed glass from the floor, a white wall band 80 cm
// high at the top up to the ceiling (user: white on top, not below); an 80 cm passage (210 cm high, glass above up to
// the band) in the long side next to the corner.
// One movable piece: every leaf name starts with "Gabbia", no digits.
// projection, band height, passage width user; bar sizes and grid spacing estimate (from the photos)
module.exports = function ({ box, group, defGroup, items }, { H, Y0, Y1, WHITE }) {
  const X1 = 50, ZB = H - 80, DH = 210, PW = 80, t = 8, b = 4, BK = [30, 30, 32, 255], GL = [205, 218, 222, 50];
  const yp0 = (Y0 + Y1) / 2 - PW / 2, yp1 = yp0 + PW;       // passage in the middle of the long side (user)
  const ZS = [ZB / 3, 2 * ZB / 3, ZB - b];                  // horizontal bars under the band
  defGroup('gabbia-cucina', 'Gabbia cucina in vetro e ferro', 'Porte');
  group('gabbia-cucina', () => {
    let k = 0;
    const id = () => String.fromCharCode(97 + Math.floor(k / 26)) + String.fromCharCode(97 + k++ % 26);
    // long side, outer face 50 cm from the wall
    const xa = X1 - t, xc = X1 - t / 2 - b / 2;
    box('/Gabbia_Cucina/Gabbia_Fascia_Lunga', WHITE, xa, Y0, ZB, X1, Y1, H);
    box('/Gabbia_Cucina/Gabbia_Vetro_Sopraluce', GL, xc + 1, yp0, DH, xc + 3, yp1, ZB);
    for (const [ya, yb] of [[Y0 + t / 2, yp0], [yp1, Y1]]) {   // glass panels either side of the passage
      box(`/Gabbia_Cucina/Gabbia_Vetro_Lungo_${id()}`, GL, xc + 1, ya, 0, xc + 3, yb, ZB);
      const n = Math.max(1, Math.round((yb - ya) / 42)), vy = [];
      for (let i = 0; i <= n; i++) vy.push(Math.min(ya + i * (yb - ya) / n, yb - b));
      for (const y of vy) box(`/Gabbia_Cucina/Gabbia_Montante_${id()}`, BK, xc, y, 0, xc + b, y + b, ZB);
      box(`/Gabbia_Cucina/Gabbia_Traverso_${id()}`, BK, xc, ya, 0, xc + b, yb, b);                  // bottom bar
      for (const z of ZS) box(`/Gabbia_Cucina/Gabbia_Traverso_${id()}`, BK, xc, ya, z, xc + b, yb, z + b);
    }
    box(`/Gabbia_Cucina/Gabbia_Traverso_${id()}`, BK, xc, yp0, DH, xc + b, yp1, DH + b);            // passage head
    box(`/Gabbia_Cucina/Gabbia_Traverso_${id()}`, BK, xc, yp0, ZB - b, xc + b, yp1, ZB);
    // short return, from the wall face (x = 0) to the corner
    const yc = Y0 + t / 2 - b / 2;
    box('/Gabbia_Cucina/Gabbia_Fascia_Corta', WHITE, 0, Y0, ZB, xa, Y0 + t, H);
    box('/Gabbia_Cucina/Gabbia_Vetro_Corto', GL, 0, yc + 1, 0, xc, yc + 3, ZB);
    for (const x of [0, 23]) box(`/Gabbia_Cucina/Gabbia_Montante_${id()}`, BK, x, yc, 0, x + b, yc + b, ZB);
    box(`/Gabbia_Cucina/Gabbia_Montante_${id()}`, BK, xc, yc, 0, xc + b, yc + b, ZB);   // corner post (passage jamb)
    box(`/Gabbia_Cucina/Gabbia_Traverso_${id()}`, BK, 0, yc, 0, xc, yc + b, b);
    for (const z of ZS) box(`/Gabbia_Cucina/Gabbia_Traverso_${id()}`, BK, 0, yc, z, xc, yc + b, z + b);
  });
  items.filter(i => i.n.includes('Gabbia_Vetro')).forEach(i => { i.ne = 1; });
};
