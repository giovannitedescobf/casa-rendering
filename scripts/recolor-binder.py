#!/usr/bin/env python3
"""Recolour the binder (the cement between the chips) of a terrazzo / graniglia texture, leaving the chips as they are.

    python3 scripts/recolor-binder.py IN OUT R,G,B [radius]

The binder is found as the pixels close to its median colour (estimated from the greenish/greyish low-saturation
pixels that cover most of the tile); each pixel is moved by (target - median), weighted by how close it is to the
median (smooth fall-off over `radius`, default 38 in RGB units), so chip edges blend and the chips keep their colour.
Use it when the viewer's light shifts a binder colour away from the product photos: choose the target so the RENDER
matches the photos, measure the render, repeat.
"""
import sys
import numpy as np
from PIL import Image

src, out, rgb = sys.argv[1], sys.argv[2], np.array([float(v) for v in sys.argv[3].split(',')])
radius = float(sys.argv[4]) if len(sys.argv) > 4 else 38.0
a = np.asarray(Image.open(src).convert('RGB')).astype(float)
px = a.reshape(-1, 3)
sat = px.max(1) - px.min(1)
cand = px[(sat < 60) & (px.mean(1) > 60) & (px.mean(1) < 200) & (px[:, 1] >= px[:, 0]) & (px[:, 1] >= px[:, 2])]
med = np.median(cand, 0)
d = np.sqrt(((a - med) ** 2).sum(2))
w = np.clip(1 - (d / radius) ** 2, 0, 1)[..., None]
res = np.clip(a + w * (rgb - med), 0, 255)
Image.fromarray(res.round().astype(np.uint8)).save(out, quality=86) if out.endswith('.webp') else Image.fromarray(res.round().astype(np.uint8)).save(out)
print('binder median', med.round().astype(int).tolist(), '->', rgb.round().astype(int).tolist(), 'pixels moved %.0f%%' % (100 * (w > 0.5).mean()))
