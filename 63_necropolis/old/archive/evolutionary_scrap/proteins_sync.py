```py
#!/usr/bin/env python3
import argparse
import base64
import os
import subprocess
from pathlib import Path
from datetime import datetime, timedelta


def dig_txt(name: str) -> list[str]:
    try:
        out = subprocess.check_output(
            ["dig", "+short", "TXT", name], stderr=subprocess.DEVNULL
        ).decode("utf-8", errors="ignore")
    except Exception:
        return []
    lines = []
    for raw in out.splitlines():
        raw = raw.strip()
        if raw.startswith('"') and raw.endswith('"'):
            raw = raw[1:-1]
        lines.append(raw)
    return lines


def cache_dir() -> Path:
    return Path.home() / ".cache" / "s0fractal" / "proteins"


def write_wasm(glyph: str, payload_b64: str) -> Path:
    data = base64.b64decode(payload_b64)
    out_dir = cache_dir()
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / f"{glyph}.wasm"
    out_path.write_bytes(data)
    return out_path


def write_meta(glyph: str, meta: dict) -> Path:
    out_dir = cache_dir()
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / f"{glyph}.meta"
    lines = []
    for key in ("port", "ipfs", "mass", "ttl", "sig"):
        if key in meta and meta[key]:
            lines.append(f"{key}:{meta[key]}")
    out_path.write_text("\n".join(lines) + ("\n" if lines else ""), encoding="utf-8")
    return out_path


def prune_cache(days: int):
    cutoff = datetime.utcnow() - timedelta(days=days)
    out_dir = cache_dir()
    if not out_dir.exists():
        return
    for p in out_dir.glob("*.wasm"):
        mtime = datetime.utcfromtimestamp(p.stat().st_mtime)
        if mtime < cutoff:
            p.unlink(missing_ok=True)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("glyphs", nargs="+", help="Glyphs to sync (e.g. I K S)")
    parser.add_argument("--domain", default="sigma.s0fractal.io")
    parser.add_argument("--prune-days", type=int, default=30)
    args = parser.parse_args()

    for glyph in args.glyphs:
        name = f"{glyph}.{args.domain}"
        records = dig_txt(name)
        payload = ""
        meta = {}
        for r in records:
            if r.startswith("b64:"):
                payload = r[4:]
                continue
            if r.startswith("ipfs:"):
                meta["ipfs"] = r[5:]
                continue
            if r.startswith("port:"):
                meta["port"] = r[5:]
                continue
            if r.startswith("mass:"):
                meta["mass"] = r[5:]
                continue
            if r.startswith("ttl:"):
                meta["ttl"] = r[4:]
                continue
            if r.startswith("sig:"):
                meta["sig"] = r[4:]
                continue
        if not payload:
            if meta:
                out_meta = write_meta(glyph, meta)
                print(f"⚠️  {glyph}: no b64 payload, saved meta {out_meta}")
            else:
                print(f"⚠️  {glyph}: no b64 payload in TXT ({name})")
            continue
        out = write_wasm(glyph, payload)
        out_meta = write_meta(glyph, meta) if meta else None
        if out_meta:
            print(f"✅ {glyph}: cached {out} + {out_meta}")
        else:
            print(f"✅ {glyph}: cached {out}")

    prune_cache(args.prune_days)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

```

🌊

# Σ-PoI: 516a8be2a651c64ab0baaa2250eef02267aa99a4352ab73dfcac4cfb9dc4cc7a
