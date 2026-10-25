// Glass-and-steel kitchen cage (from the user's photos), shared by the base (hidden) and casa-poggi-gabbia-cucina (on).
// Projects 50 cm into the soggiorno, two sides: a short return on the line of the cucina south wall and a long side
// parallel to the west wall up to the window wall (north); white half-wall 80 cm high under black-framed glass up to the
// ceiling; an 80 cm passage (210 cm high, glass above) in the long side next to the corner.
// One movable piece: every leaf name starts with "Gabbia", no digits.
// projection, half-wall height, passage width user; bar sizes and grid spacing estimate (from the photos)
module.exports = function ({ box, group, defGroup, items }, { H, Y0, Y1, WHITE }) {
  const X1 = 50, HW = 80, DH = 210, PW = 80, t = 8, b = 4, BK = [30, 30, 32, 255], GL = [205, 218, 222, 50];
  const yp0 = Y0 + t, yp1 = yp0 + PW;                       // passage along the long side
  defGroup('gabbia-cucina', 'Gabbia cucina in vetro e ferro', 'Porte');
  group('gabbia-cucina', () => {
    let k = 0;
    const id = () => String.fromCharCode(97 + Math.floor(k / 26)) + String.fromCharCode(97 + k++ % 26);
    // long side, outer face 50 cm from the wall
    const xa = X1 - t, xc = X1 - t / 2 - b / 2;
    box('/Gabbia_Cucina/Gabbia_Muretto_Lungo', WHITE, xa, yp1, 0, X1, Y1, HW);
    box('/Gabbia_Cucina/Gabbia_Vetro_Lungo', GL, xc + 1, yp1, HW, xc + 3, Y1, H);
    box('/Gabbia_Cucina/Gabbia_Vetro_Sopraluce', GL, xc + 1, yp0, DH, xc + 3, yp1, H);
    const vy = [yp0, yp1];
    for (let y = yp1 + 42; y < Y1 - 20; y += 42) vy.push(y);
    vy.push(Y1 - b);
    for (const y of vy) box(`/Gabbia_Cucina/Gabbia_Montante_${id()}`, BK, xc, y, y >= yp1 ? HW : 0, xc + b, y + b, H);
    for (const z of [HW, 145, DH, 270, H - b]) box(`/Gabbia_Cucina/Gabbia_Traverso_${id()}`, BK, xc, z < DH ? yp1 : yp0, z, xc + b, Y1, z + b);
    box(`/Gabbia_Cucina/Gabbia_Montante_${id()}`, BK, xc, yp0 + PW / 2, DH, xc + b, yp0 + PW / 2 + b, H);
    // short return, from the wall face (x = 0) to the corner
    const yc = Y0 + t / 2 - b / 2;
    box('/Gabbia_Cucina/Gabbia_Muretto_Corto', WHITE, 0, Y0, 0, X1, Y0 + t, HW);
    box('/Gabbia_Cucina/Gabbia_Vetro_Corto', GL, 0, yc + 1, HW, xc, yc + 3, H);
    for (const x of [0, 23]) box(`/Gabbia_Cucina/Gabbia_Montante_${id()}`, BK, x, yc, HW, x + b, yc + b, H);
    box(`/Gabbia_Cucina/Gabbia_Montante_${id()}`, BK, xc, yc, 0, xc + b, yc + b, H);   // corner post
    for (const z of [HW, 145, DH, 270, H - b]) box(`/Gabbia_Cucina/Gabbia_Traverso_${id()}`, BK, 0, yc, z, xc, yc + b, z + b);
  });
  items.filter(i => i.n.includes('Gabbia_Vetro')).forEach(i => { i.ne = 1; });
};
