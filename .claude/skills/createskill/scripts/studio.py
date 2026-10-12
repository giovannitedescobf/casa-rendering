"""Fondale da studio per foto prodotto Vinted (opzione B).
Uso: python3 studio.py OUT_DIR foto1.jpg [foto2.jpg ...]
(per capi chiari impostare CAPO_CHIARO=1: usa solo lo scontorno rembg)
Richiede: pip install rembg onnxruntime pillow numpy scipy
Per screenshot del telefono ritagliare prima barre e pulsanti dell'interfaccia.
"""
import sys, os
import numpy as np
from PIL import Image, ImageEnhance, ImageFilter
from scipy import ndimage as nd
from rembg import remove, new_session

W, H = 1200, 1600  # 3:4

def fondale():
    y = np.linspace(0, 1, H)[:, None]; x = np.linspace(-1, 1, W)[None, :]
    a = np.clip(248 - 14 * y - 7 * x ** 2, 0, 255).astype('uint8')
    return Image.fromarray(np.dstack([a, a, a]))

def maschera(im, sess, scuro=True):
    rb = np.array(remove(im, session=sess))[..., 3] > 128
    if not scuro:
        return nd.binary_fill_holes(rb)
    # capi scuri: maschera per luminosità (più precisa con specchi/pareti) + gruccia da rembg
    lum = np.array(im).astype(float).mean(2)
    dark = nd.binary_opening(lum < 75, iterations=2)
    lab, n = nd.label(dark)
    capo = lab == (np.argmax(nd.sum(dark, lab, range(1, n + 1))) + 1)
    capo = nd.binary_fill_holes(nd.binary_closing(capo, iterations=6))
    top = np.where(capo.any(1))[0][0]
    gruccia = np.zeros_like(capo); gruccia[:top + 40] = rb[:top + 40]
    m = capo | gruccia; lab, _ = nd.label(m)
    return nd.binary_fill_holes(lab == lab[np.where(capo)][0])

def elabora(path, out, sess, scuro):
    im = Image.open(path).convert('RGB')
    m = maschera(im, sess, scuro)
    a = Image.fromarray((m * 255).astype('uint8')).filter(ImageFilter.GaussianBlur(1.2))
    rgb = ImageEnhance.Brightness(im).enhance(1.2)
    rgb = ImageEnhance.Contrast(rgb).enhance(1.05)
    rgb = ImageEnhance.Sharpness(rgb).enhance(1.3)
    cut = rgb.convert('RGBA'); cut.putalpha(a)
    bb = cut.getbbox(); cut = cut.crop(bb); w0, h0 = im.size
    bg = fondale()
    intero = bb[0] > 5 and bb[2] < w0 - 5 and bb[3] < h0 - 5
    if intero:  # capo intero: centrato con ombra morbida
        s = min(W * 0.8 / cut.width, H * 0.88 / cut.height)
        cut = cut.resize((int(cut.width * s), int(cut.height * s)), Image.LANCZOS)
        x, y = (W - cut.width) // 2, (H - cut.height) // 2
        sh = Image.new('L', (W, H), 0)
        sh.paste(cut.split()[3].point(lambda p: p * 0.3), (x + 12, y + 16))
        bg.paste(Image.new('RGB', (W, H), (110, 110, 110)), (0, 0), sh.filter(ImageFilter.GaussianBlur(26)))
    else:  # capo tagliato nello scatto: ancorato ai bordi
        s = max(H * 0.92 / cut.height, W * 0.75 / cut.width)
        cut = cut.resize((int(cut.width * s), int(cut.height * s)), Image.LANCZOS)
        if bb[0] <= 5 and bb[2] >= w0 - 5:
            cut = cut.resize((W, int(cut.height * W / cut.width)), Image.LANCZOS)
        y = H - cut.height; x = (W - cut.width) // 2
        if bb[2] >= w0 - 5: x = W - cut.width
        if bb[0] <= 5: x = 0
    bg.paste(cut, (x, y), cut)
    bg.save(out, quality=93)

if __name__ == '__main__':
    od = sys.argv[1]; os.makedirs(od, exist_ok=True)
    sess = new_session('isnet-general-use')
    for i, p in enumerate(sys.argv[2:], 1):
        elabora(p, os.path.join(od, f'foto-{i}.jpg'), sess, os.environ.get('CAPO_CHIARO') is None)
        print('ok', p)
