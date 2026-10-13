"""Foto prodotto Vinted in stile set fotografico (opzione B).
Uso: python3 studio.py OUT_DIR foto1.jpg [foto2.jpg ...]
  CAPO_CHIARO=1  -> capi chiari: usa solo lo scontorno rembg
Richiede: pip install rembg onnxruntime pillow numpy scipy
Per screenshot del telefono ritagliare prima barre e pulsanti dell'interfaccia.
Risultato: fondale da studio (parete + pavimento), capo appeso a un'asta cromata
con ombra realistica; primi piani a tutto campo. Nessun elemento dell'originale.
"""
import sys, os
import numpy as np
from PIL import Image, ImageEnhance, ImageFilter, ImageDraw
from scipy import ndimage as nd
from rembg import remove, new_session

W, H = 1200, 1600      # 3:4
RAIL_Y = 150           # quota asta appendiabiti
HORIZON = 0.86         # linea parete/pavimento

def fondale():
    y = np.linspace(0, 1, H)[:, None]; x = np.linspace(-1, 1, W)[None, :]
    wall = 250 - 10 * y - 8 * x ** 2
    floor = 236 - 18 * (y - HORIZON) - 6 * x ** 2
    t = np.clip((y - HORIZON) / 0.03 + 0.5, 0, 1)        # raccordo morbido (limbo)
    a = np.clip(wall * (1 - t) + floor * t, 0, 255)
    return Image.fromarray(np.dstack([a, a, a * 0.995]).astype('uint8'))

def asta(img, x0, x1):
    d = ImageDraw.Draw(img)
    for i, c in enumerate([150, 200, 235, 205, 160, 130]):   # cilindro cromato
        d.line([(x0, RAIL_Y - 3 + i), (x1, RAIL_Y - 3 + i)], fill=(c, c, c))
    for xb in (x0, x1):                                      # supporti a parete
        d.rectangle([xb - 7, RAIL_Y - 14, xb + 7, RAIL_Y + 14], fill=(175, 175, 175))
        d.rectangle([xb - 7, RAIL_Y - 14, xb + 7, RAIL_Y - 10], fill=(215, 215, 215))
    sh = Image.new('L', (W, H), 0)
    ImageDraw.Draw(sh).line([(x0, RAIL_Y + 12), (x1, RAIL_Y + 12)], fill=70, width=6)
    img.paste(Image.new('RGB', (W, H), (120, 120, 120)), (0, 0), sh.filter(ImageFilter.GaussianBlur(6)))

def maschera(im, sess, scuro, soglia=75, chiusura=6):
    rb = np.array(remove(im, session=sess))[..., 3] > 128
    if not scuro:
        return nd.binary_fill_holes(rb)
    lum = np.array(im).astype(float).mean(2)
    dark = nd.binary_opening(lum < soglia, iterations=2)
    lab, n = nd.label(dark)
    capo = lab == (np.argmax(nd.sum(dark, lab, range(1, n + 1))) + 1)
    capo = nd.binary_fill_holes(nd.binary_closing(capo, iterations=chiusura))
    top = np.where(capo.any(1))[0][0]
    gruccia = np.zeros_like(capo); gruccia[:top + 40] = rb[:top + 40]
    m = capo | gruccia; lab, _ = nd.label(m)
    return nd.binary_fill_holes(lab == lab[np.where(capo)][0])

def punteggio(im, m, scuro=True):
    """Check automatico della maschera: 0 = perfetta, più alto = peggio.
    Penalizza frammenti staccati, bordi seghettati e residui di sfondo."""
    if m.sum() < 0.03 * m.size:
        return 99.0, 'maschera vuota'
    lab, n = nd.label(m)
    aree = np.sort(nd.sum(m, lab, range(1, n + 1)))[::-1]
    frammenti = aree[1:].sum() / aree[0] if n > 1 else 0.0
    liscia = nd.binary_closing(nd.binary_opening(m, iterations=3), iterations=3)
    bordo = m ^ nd.binary_erosion(m)
    seghettatura = (m ^ liscia).sum() / max(bordo.sum(), 1)
    arr = np.asarray(im).astype(float)
    fuori = arr[~nd.binary_dilation(m, iterations=15)]
    bg = np.median(fuori, 0) if len(fuori) else np.array([255.0] * 3)
    dentro = arr[nd.binary_erosion(m, iterations=4)]
    residui = (np.abs(dentro - bg).sum(1) < 25).mean() if len(dentro) else 1.0
    estranei = 0.0
    if scuro:  # capo scuro: zone chiare nella parte bassa = specchi/pavimento inclusi per errore
        rows = np.where(m.any(1))[0]; y0 = rows[0] + int(0.4 * (rows[-1] - rows[0]))
        basso = m.copy(); basso[:y0] = False
        lum = arr.mean(2)
        estranei = (lum[basso] > 140).mean() if basso.any() else 0.0
    tot = frammenti * 10 + seghettatura * 2 + residui * 10 + estranei * 20
    return tot, f'frammenti={frammenti:.3f} seghettatura={seghettatura:.2f} residui={residui:.3f} estranei={estranei:.3f}'

TENTATIVI = [dict(soglia=75, chiusura=6), dict(soglia=60, chiusura=8),
             dict(soglia=90, chiusura=4), dict(soglia=50, chiusura=10)]
SOGLIA_OK = 1.0

def maschera_migliore(im, sess, scuro):
    migliore = None
    for i, t in enumerate(TENTATIVI if scuro else [{}], 1):
        m = maschera(im, sess, scuro, **t)
        sc, info = punteggio(im, m, scuro)
        print(f'  tentativo {i}: punteggio {sc:.2f} ({info})')
        if migliore is None or sc < migliore[0]:
            migliore = (sc, m)
        if sc <= SOGLIA_OK:
            break
    if migliore[0] > SOGLIA_OK:
        print('  ATTENZIONE: maschera sotto lo standard, controllare e correggere a mano')
    return migliore[1]

def brillante(im):
    a = np.asarray(im).astype(float) / 255
    a = a ** 0.85                                  # apre le ombre (texture dei neri)
    im = Image.fromarray((a * 255).clip(0, 255).astype('uint8'))
    im = ImageEnhance.Contrast(im).enhance(1.08)
    im = ImageEnhance.Color(im).enhance(1.05)
    return im.filter(ImageFilter.UnsharpMask(radius=2, percent=90, threshold=2))

def elabora(path, out, sess, scuro):
    im = Image.open(path).convert('RGB'); w0, h0 = im.size
    m = maschera_migliore(im, sess, scuro)
    a = Image.fromarray((m * 255).astype('uint8')).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(1))
    cut = brillante(im).convert('RGBA'); cut.putalpha(a)
    bb = cut.getbbox(); cut = cut.crop(bb); mm = np.array(cut.split()[3]) > 128
    bg = fondale()
    if bb[1] <= 5:                                  # primo piano senza gruccia: a tutto campo
        s = max(W / cut.width, H / cut.height)
        cut = cut.resize((int(cut.width * s), int(cut.height * s)), Image.LANCZOS)
        x, y = (W - cut.width) // 2, (H - cut.height) // 2
    else:                                           # capo appeso: gancio sull'asta
        hook_x = np.where(mm[:8].any(0))[0].mean()
        intero = bb[0] > 5 and bb[2] < w0 - 5 and bb[3] < h0 - 5
        avail = (H * HORIZON - 60 - RAIL_Y) if intero else (H - RAIL_Y)
        s = avail / cut.height
        if not intero: s = max(s, W * 0.8 / cut.width)
        cut = cut.resize((int(cut.width * s), int(cut.height * s)), Image.LANCZOS)
        x = int(W / 2 - hook_x * s); y = RAIL_Y - 6
        if not intero:
            if bb[2] >= w0 - 5: x = W - cut.width
            if bb[0] <= 5: x = 0
        asta(bg, 90, W - 90)
        sh = Image.new('L', (W, H), 0)              # ombra proiettata sulla parete
        sh.paste(cut.split()[3].point(lambda p: p * 0.28), (x + 18, y + 22))
        bg.paste(Image.new('RGB', (W, H), (105, 105, 105)), (0, 0), sh.filter(ImageFilter.GaussianBlur(24)))
    bg.paste(cut, (x, y), cut)
    if bb[1] > 5:                                   # ridisegna l'asta davanti al gancio
        ImageDraw.Draw(bg).line([(x + hook_x * s - 14, RAIL_Y), (x + hook_x * s + 14, RAIL_Y)], fill=(215, 215, 215), width=4)
    bg.save(out, quality=95)

if __name__ == '__main__':
    od = sys.argv[1]; os.makedirs(od, exist_ok=True)
    sess = new_session('isnet-general-use')
    scuro = os.environ.get('CAPO_CHIARO') is None
    for i, p in enumerate(sys.argv[2:], 1):
        elabora(p, os.path.join(od, f'foto-{i}.jpg'), sess, scuro)
        print('ok', p)
