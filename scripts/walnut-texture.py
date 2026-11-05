# Seamless figured-walnut texture (grain along the vertical axis of the image, like the photo's door fronts).
import numpy as np, sys
from PIL import Image
N = 1024; rng = np.random.default_rng(3)
y, x = np.mgrid[0:N, 0:N] / N * 2 * np.pi
def noise(k, amp):   # periodic smooth noise from random Fourier terms
    s = np.zeros((N, N))
    for _ in range(k):
        fx, fy = rng.integers(1, 6), rng.integers(1, 4); ph = rng.uniform(0, 6.3)
        s += np.sin(fx * x + fy * y + ph) * rng.uniform(.3, 1)
    return s / k * amp
warp = noise(14, 1.0) + 0.5 * noise(6, 1.0)
cath = 0.9 * np.abs(np.sin(y / 2 + 0.6 * noise(5, 1)))                   # cathedral arches
d = x / (2 * np.pi) * 30 + 2.2 * warp + 1.5 * cath + 0.4 * noise(20, 1)
f = d - np.floor(d)
lines = np.exp(-((f - 0.5) / 0.16) ** 2)                                # thin dark latewood lines
streak = 0.5 + 0.5 * np.sin(x * 3 + 2 * warp)                           # broad light / dark bands
fine = 0.5 + 0.5 * np.sin(x * 160 + 8 * warp)
d2 = x / (2 * np.pi) * 70 + 2.2 * warp + 1.5 * cath; l2 = np.exp(-(((d2 - np.floor(d2)) - 0.5) / 0.12) ** 2)
v = 0.6 + 0.3 * (streak - 0.5) + 0.1 * noise(9, 1) - 0.30 * lines - 0.10 * l2 - 0.04 * fine
v = np.clip(v, 0, 1)[..., None]
dark, light = np.array([52, 28, 14]), np.array([168, 104, 58])
img = dark + (light - dark) * v
img += rng.normal(0, 3, (N, N, 1))
Image.fromarray(np.clip(img, 0, 255).astype(np.uint8)).save(sys.argv[1], quality=90)
