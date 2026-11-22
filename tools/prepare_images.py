"""
Prepare ChatGPT function illustrations for the website.

For each PNG/JPG given:
  1. If it already has a transparent background, keep it.
     If it has a plain white background, cut the white away
     (only white that touches the image edge, so white inside the picture stays).
  2. Resize to 640 x 640 (keeps the square shape; pads if needed).
  3. Save as a compressed WebP into assets/images/ with the name you give.

Needs only Pillow:   pip install pillow
Usage:
  python tools/prepare_images.py <input-file> <output-name.webp> [<input> <output> ...]
Example:
  python tools/prepare_images.py "C:/Downloads/fn-chak.png" fn-chak.webp
"""
import os
import sys
from collections import deque

try:
    from PIL import Image
except ImportError:
    sys.exit("Pillow is not installed. Run:  pip install pillow   (or: python -m pip install pillow)")

HERE = os.path.dirname(os.path.abspath(__file__))
OUT_DIR = os.path.join(HERE, "..", "assets", "images")
SIZE = 640


def cut_white_background(img):
    """Make border-connected near-white pixels transparent, with a soft 1-2px edge."""
    img = img.convert("RGBA")
    w, h = img.size
    px = img.load()

    def whiteish(x, y, limit=236):
        r, g, b, a = px[x, y]
        return min(r, g, b) >= limit

    bg = bytearray(w * h)
    q = deque()
    for x in range(w):
        for y in (0, h - 1):
            if whiteish(x, y) and not bg[y * w + x]:
                bg[y * w + x] = 1
                q.append((x, y))
    for y in range(h):
        for x in (0, w - 1):
            if whiteish(x, y) and not bg[y * w + x]:
                bg[y * w + x] = 1
                q.append((x, y))
    while q:
        x, y = q.popleft()
        for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if 0 <= nx < w and 0 <= ny < h and not bg[ny * w + nx] and whiteish(nx, ny):
                bg[ny * w + nx] = 1
                q.append((nx, ny))

    for y in range(h):
        row = y * w
        for x in range(w):
            if bg[row + x]:
                px[x, y] = (255, 255, 255, 0)
            else:
                # soften the edge: pale pixels right next to the background become partly transparent
                near = (x > 0 and bg[row + x - 1]) or (x < w - 1 and bg[row + x + 1]) or \
                       (y > 0 and bg[row - w + x]) or (y < h - 1 and bg[row + w + x])
                if near:
                    r, g, b, a = px[x, y]
                    m = min(r, g, b)
                    alpha = max(0.0, min(1.0, (255 - m) / 105.0))
                    if alpha < 1:
                        un = lambda c: int(max(0, min(255, (c - 255 * (1 - alpha)) / max(alpha, 0.02))))
                        px[x, y] = (un(r), un(g), un(b), int(alpha * 255))
    return img


def has_real_transparency(img):
    if img.mode not in ("RGBA", "LA", "PA"):
        return False
    alpha = img.getchannel("A")
    lo, _ = alpha.getextrema()
    return lo < 20


def prepare(src, out_name):
    img = Image.open(src)
    if has_real_transparency(img):
        img = img.convert("RGBA")
        how = "already transparent"
    else:
        img = cut_white_background(img)
        how = "white background removed"
    # square it without stretching
    w, h = img.size
    side = max(w, h)
    if w != h:
        canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
        canvas.paste(img, ((side - w) // 2, (side - h) // 2))
        img = canvas
    img = img.resize((SIZE, SIZE), Image.LANCZOS)
    os.makedirs(OUT_DIR, exist_ok=True)
    out = os.path.join(OUT_DIR, out_name)
    img.save(out, "WEBP", quality=80, method=6)
    kb = os.path.getsize(out) // 1024
    print(f"{os.path.basename(src)} -> assets/images/{out_name}  ({how}, {SIZE}x{SIZE}, {kb} KB)")


if __name__ == "__main__":
    args = sys.argv[1:]
    if not args or len(args) % 2:
        sys.exit(__doc__)
    for i in range(0, len(args), 2):
        if not args[i + 1].endswith(".webp"):
            sys.exit("Output name must end with .webp, e.g. fn-chak.webp")
        prepare(args[i], args[i + 1])
