# Builds a terrazzo texture of N x N different tiles from ONE photo of a tile: the chips are cut out of the photo
# (colour distance from the cement) and scattered again at random, rotated and flipped, on the cement colour.
# usage: python3 -I scripts/terrazzo-texture.py <photo> <out.png>   (needs numpy, scipy, Pillow)
import numpy as np, sys
from PIL import Image
from scipy import ndimage as nd
src = np.asarray(Image.open(sys.argv[1]).convert('RGB')).astype(float)
# background = grey cement: low saturation, mid-dark value
mx, mn = src.max(2), src.min(2)
bgmask = ((mx - mn) < 22) & (mx > 60) & (mx < 125)
bgmask = nd.binary_opening(bgmask, iterations=1)
bgcol = np.median(src[bgmask], axis=0); print('bg', bgcol)
d = np.sqrt(((src - bgcol) ** 2).sum(2))
chip = nd.binary_opening(d > 40, iterations=2); chip = nd.binary_fill_holes(chip)
chip = nd.binary_erosion(chip, iterations=1)
lab, n = nd.label(chip)
sprites = []
for i, sl in enumerate(nd.find_objects(lab), 1):
    m = lab[sl] == i
    if m.sum() < 60: continue
    # skip chips touching the border (cut)
    if sl[0].start == 0 or sl[1].start == 0 or sl[0].stop == src.shape[0] or sl[1].stop == src.shape[1]:
        if m.sum() < 400: continue
    rgba = np.dstack([src[sl], m * 255.0]).astype(np.uint8)
    sprites.append(Image.fromarray(rgba, 'RGBA'))
cov = chip.mean()
rng = np.random.default_rng(7)
T, N = 400, 5            # px per tile, tiles per side
S = T / src.shape[0]     # photo = one 40 cm tile
small = [s for s in sprites if s.width * s.height < 900]
out = Image.new('RGB', (T * N, T * N))
for ty in range(N):
  for tx in range(N):
    # cement with fine grain: the real background, shuffled in small blocks
    base = np.ones((T, T, 3)) * bgcol + rng.normal(0, 6, (T, T, 1))
    tile = Image.fromarray(np.clip(base, 0, 255).astype(np.uint8)).convert('RGBA')
    occ = np.zeros((T, T), bool)
    big = sorted(range(len(sprites)), key=lambda i: -sprites[i].width*sprites[i].height)
    order = list(rng.permutation(big[:60])) + list(rng.permutation(len(sprites)))*6
    for k in order:
        if occ.mean() > cov * 0.92: break
        s = sprites[k]
        if rng.random() < .5: s = s.transpose(Image.FLIP_LEFT_RIGHT)
        s = s.rotate(rng.uniform(0, 360), expand=True, resample=Image.BICUBIC)
        sc = S * rng.uniform(.85, 1.15)
        s = s.resize((max(2, int(s.width * sc)), max(2, int(s.height * sc))), Image.LANCZOS)
        a = np.asarray(s)[:, :, 3] > 128
        for _ in range(120):
            x, y = rng.integers(-s.width // 2, T - s.width // 2), rng.integers(-s.height // 2, T - s.height // 2)
            x0, y0, x1, y1 = max(x, 0), max(y, 0), min(x + s.width, T), min(y + s.height, T)
            sub = a[y0 - y:y1 - y, x0 - x:x1 - x]
            gap = nd.binary_dilation(occ[max(y0-2,0):y1+2, max(x0-2,0):x1+2], iterations=1)[(y0 - max(y0-2,0)):(y0 - max(y0-2,0)) + sub.shape[0], (x0 - max(x0-2,0)):(x0 - max(x0-2,0)) + sub.shape[1]]
            if not (sub & gap).any():
                tile.alpha_composite(s, (x, y)) if x >= 0 and y >= 0 else tile.paste(s, (x, y), s)
                occ[y0:y1, x0:x1] |= sub; break
    # tiny flecks
    t = np.asarray(tile.convert('RGB')).copy()
    for _ in range(120):
        x, y = rng.integers(0, T - 2, 2)
        if not occ[y, x]: t[y:y+rng.integers(1,3), x:x+rng.integers(1,3)] = src[rng.integers(0,720), rng.integers(0,720)]
    out.paste(Image.fromarray(t), (tx * T, ty * T))
out.save(sys.argv[2], optimize=True); print('done')
