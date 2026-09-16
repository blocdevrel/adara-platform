"""Download real partner logos from official sites and verified vector sources."""

from __future__ import annotations

import html
import re
import urllib.parse
import urllib.request
from pathlib import Path

DIR = Path(__file__).resolve().parents[1] / "public" / "assets" / "partners"
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}


def fetch(name: str, url: str) -> bool:
    try:
        data = urllib.request.urlopen(
            urllib.request.Request(url, headers=UA),
            timeout=25,
        ).read()
    except Exception as exc:
        print(f"FAIL {name}: {exc}")
        return False

    if len(data) < 200:
        print(f"FAIL {name}: response too small ({len(data)} bytes)")
        return False

    if data.lstrip()[:15].lower().startswith(b"<!doctype") or data.lstrip()[:5].lower() == b"<html":
        print(f"FAIL {name}: got HTML instead of image")
        return False

    (DIR / name).write_bytes(data)
    print(f"OK   {name} ({len(data)} bytes) <- {url}")
    return True


def scrape_links(page_url: str, pattern: str) -> list[str]:
    page = urllib.request.urlopen(
        urllib.request.Request(page_url, headers=UA),
        timeout=25,
    ).read().decode("utf-8", "replace")
    return re.findall(pattern, page, flags=re.I)


def save_jumia_white_logo() -> bool:
    page = urllib.request.urlopen(
        urllib.request.Request("https://group.jumia.com", headers=UA),
        timeout=25,
    ).read().decode("utf-8", "replace")
    for match in re.finditer(r"data:image/svg\+xml,([^\"']+)", page):
        raw = match.group(1)
        if "441.1" not in raw or "FFFFFF" not in raw.upper():
            continue
        svg = urllib.parse.unquote(html.unescape(raw))
        (DIR / "jumia.svg").write_text(svg, encoding="utf-8")
        print(f"OK   jumia.svg ({len(svg)} chars) <- group.jumia.com")
        return True
    return False


def make_wave_white_logo() -> None:
    path = DIR / "wave.png"
    if not path.exists():
        return
    try:
        from PIL import Image
    except ImportError:
        print("SKIP wave-white.png: Pillow not installed")
        return

    img = Image.open(path).convert("RGBA")
    px = img.load()
    for y in range(img.height):
        for x in range(img.width):
            _, _, _, alpha = px[x, y]
            if alpha > 20:
                px[x, y] = (255, 255, 255, alpha)
    img.save(DIR / "wave-white.png")
    print("OK   wave-white.png (white lockup for dark backgrounds)")


def fix_safaricom() -> None:
    path = DIR / "safaricom.svg"
    if not path.exists():
        return
    text = path.read_text(encoding="utf-8")
    text = re.sub(r'<path fill="#fff" d="M0 0h192\.756v192\.756H0V0z"/>', "", text)
    path.write_text(text, encoding="utf-8")
    print("OK   safaricom.svg (removed white backdrop)")


def main() -> None:
    DIR.mkdir(parents=True, exist_ok=True)

    sources = [
        # Official / primary sources
        ("wave.png", "https://www.wave.com/img/nav-logo.png"),
        (
            "chipper.svg",
            "https://cdn.prod.website-files.com/63c81b0c3ad929013f062d70/63c81b0c3ad929a04e062dde_chipper-logo-white.svg",
        ),
        ("mtn.svg", "https://upload.wikimedia.org/wikipedia/commons/a/af/MTN_Logo.svg"),
        # Verified brand vectors (worldvectorlogo CDN)
        ("safaricom.svg", "https://cdn.worldvectorlogo.com/logos/safaricom.svg"),
        ("flutterwave.svg", "https://cdn.worldvectorlogo.com/logos/flutterwave-1.svg"),
        ("paystack.svg", "https://cdn.worldvectorlogo.com/logos/paystack-2.svg"),
        ("jumia.svg", "https://cdn.worldvectorlogo.com/logos/jumia-1.svg"),
        ("andela.svg", "https://cdn.worldvectorlogo.com/logos/andela.svg"),
    ]

    for name, url in sources:
        fetch(name, url)

    # Prefer Jumia white wordmark from official site when available
    if save_jumia_white_logo():
        pass  # overwrote worldvectorlogo version

    # Try Flutterwave press kit assets from page scripts
    for link in scrape_links(
        "https://flutterwave.com/ke/press-kit",
        r'https?://[^"\']+\.(?:svg|png)',
    ):
        if "flutterwave" in link.lower() and link.endswith(".svg"):
            if fetch("flutterwave.svg", link):
                break

    # Andela header logo from official site
    for link in scrape_links("https://www.andela.com", r'https?://[^"\']+andela[^"\']*\.(?:svg|png)'):
        if fetch("andela.svg", link):
            break

    make_wave_white_logo()
    fix_safaricom()


if __name__ == "__main__":
    main()
