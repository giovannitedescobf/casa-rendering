#!/usr/bin/env python3
"""Convert texture images to WebP (smaller downloads, same look), next to the originals.

Usage: python3 scripts/to-webp.py [-q QUALITY] IMAGE [IMAGE ...]      (default quality 86)
Then cite the .webp in the generator (`tex: { url: 'textures/x.webp', ... }`) and delete the original.
Measured on the textures of the repo: tile / wood photos shrink by 50-90 %, noisy stone ones by 20-80 %.
"""
import os, sys
from PIL import Image

args = sys.argv[1:]
quality = 86
if args[:1] == ['-q']:
    quality = int(args[1]); args = args[2:]
if not args:
    sys.exit(__doc__)
for src in args:
    out = os.path.splitext(src)[0] + '.webp'
    Image.open(src).convert('RGB').save(out, 'WEBP', quality=quality, method=6)
    print(f'{src}: {os.path.getsize(src)} -> {out}: {os.path.getsize(out)} bytes')
