"""Seamless corduroy (velvet with ribs) texture: ribs vary along the image x axis (vertical stripes).
usage: python3 scripts/corduroy-texture.py OUT.jpg R,G,B [ribs=32] [size=512]
R,G,B = the average colour of the fabric (e.g. sampled from a photo of it); the ribs are lighter, the grooves darker."""
import sys, numpy as np
from PIL import Image

out, rgb = sys.argv[1], np.array([float(v) for v in sys.argv[2].split(',')])
ribs = int(sys.argv[3]) if len(sys.argv) > 3 else 32
N = int(sys.argv[4]) if len(sys.argv) > 4 else 512
rng = np.random.default_rng(7)

def periodic_noise(shape, fx, fy):                       # smooth noise that wraps on both axes (FFT-filtered white noise)
    w = np.fft.fft2(rng.standard_normal(shape))
    ky, kx = np.meshgrid(np.fft.fftfreq(shape[0]) * shape[0], np.fft.fftfreq(shape[1]) * shape[1], indexing='ij')
    w *= np.exp(-(kx / fx) ** 2 - (ky / fy) ** 2)
    n = np.real(np.fft.ifft2(w)); return (n - n.mean()) / (n.std() + 1e-9)

x = np.arange(N) / N * ribs                               # rib coordinate
ph = (x % 1.0)
profile = np.sin(np.pi * ph) ** 0.6                       # rounded rib, narrow dark groove between ribs
shade = 0.74 + 0.36 * profile                             # groove ~0.74, rib top ~1.10
img = np.tile(shade, (N, 1))
img *= 1 + 0.05 * periodic_noise((N, N), N / 2, 3)         # fibre streaks along the ribs
img *= 1 + 0.015 * periodic_noise((N, N), 3, 3)            # a hint of crushed-velvet shading
img *= 1 + 0.015 * rng.standard_normal((N, N))              # pile grain
col = np.clip(img[..., None] * rgb[None, None, :] / shade.mean(), 0, 255).astype(np.uint8)
Image.fromarray(col).save(out, quality=90)
print('wrote', out)
