```py
#!/usr/bin/env python3
import argparse
import json
from pathlib import Path
import re
import subprocess
from datetime import datetime, timedelta


def repo_root() -> Path:
    cur = Path.cwd()
    for parent in [cur] + list(cur.parents):
        if (parent / ".git").exists():
            return parent
    return cur


def cache_dir(root: Path) -> Path:
    d = root / ".cache" / "edges"
    d.mkdir(parents=True, exist_ok=True)
    return d


def cache_path(root: Path, glyph: str) -> Path:
    return cache_dir(root) / f"{glyph}.json"


def load_cache(root: Path, glyph: str) -> dict:
    path = cache_path(root, glyph)
    if not path.exists():
        return {}
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return {}


def save_cache(root: Path, glyph: str, edge: dict, ttl_sec: int):
    payload = {
        "edge": edge.get("edge"),
        "resolve": edge.get("resolve"),
        "cost": edge.get("cost"),
        "ts": datetime.utcnow().isoformat() + "Z",
        "ttl": ttl_sec,
    }
    cache_path(root, glyph).write_text(json.dumps(payload, indent=2), encoding="utf-8")


def cache_valid(payload: dict) -> bool:
    try:
        ts = payload.get("ts")
        ttl = int(payload.get("ttl", 0))
        if not ts or ttl <= 0:
            return False
        t = datetime.fromisoformat(ts.replace("Z", ""))
        return datetime.utcnow() <= t + timedelta(seconds=ttl)
    except Exception:
        return False


def cache_age(payload: dict) -> str:
    try:
        ts = payload.get("ts")
        if not ts:
            return "-"
        t = datetime.fromisoformat(ts.replace("Z", ""))
        delta = datetime.utcnow() - t
        return f"{int(delta.total_seconds())}s"
    except Exception:
        return "-"


def parse_edges(path: Path) -> list[dict]:
    text = path.read_text(encoding="utf-8")
    edges = []
    in_edges = False
    current = {}
    for line in text.splitlines():
        if line.strip().startswith("🕸️EDGES:"):
            in_edges = True
            continue
        if in_edges:
            if line.startswith("  - edge:"):
                if current:
                    edges.append(current)
                current = {"edge": line.split(":", 1)[1].strip().strip('"')}
                continue
            if line.startswith("    ") and ":" in line:
                key, val = line.strip().split(":", 1)
                current[key.strip()] = val.strip().strip('"')
                continue
            if line and not line.startswith(" "):
                if current:
                    edges.append(current)
                break
    if current:
        edges.append(current)
    return edges


def iter_spectrum(root: Path):
    for path in (root / "sigma" / "spectrum").glob("*.sigma"):
        yield path


def check_cmd(cmd: str) -> bool:
    if not cmd:
        return False
    return subprocess.call(cmd, shell=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL) == 0


def run_cmd(cmd: str) -> bool:
    if not cmd:
        return False
    return subprocess.call(cmd, shell=True) == 0


def list_edges(dim: str | None):
    root = repo_root()
    for path in iter_spectrum(root):
        glyph = path.stem
        if dim and glyph != dim:
            continue
        cached = load_cache(root, glyph)
        if cache_valid(cached):
            age = cache_age(cached)
            print(f"[{glyph}] ✅ cached | {cached.get('edge','-')} | age:{age}")
            continue
        for edge in parse_edges(path):
            check = edge.get("check", "")
            status = "🟢 Linked" if check_cmd(check) else "⚫ Void"
            ttl = edge.get("ttl", "-")
            print(f"[{glyph}] {status} | {edge.get('edge','-')} | ttl:{ttl}")


def missing_edges(dim: str | None):
    root = repo_root()
    for path in iter_spectrum(root):
        glyph = path.stem
        if dim and glyph != dim:
            continue
        for edge in parse_edges(path):
            check = edge.get("check", "")
            if not check_cmd(check):
                ttl = edge.get("ttl", "-")
                print(f"[{glyph}] ⚫ Void | {edge.get('edge','-')} | ttl:{ttl}")


def collapse_edges(dim: str | None):
    root = repo_root()
    for path in iter_spectrum(root):
        glyph = path.stem
        if dim and glyph != dim:
            continue
        cached = load_cache(root, glyph)
        if cache_valid(cached):
            print(f"✅ Cached edge for {glyph}: {cached.get('edge')} (age {cache_age(cached)})")
            continue
        edges = []
        for edge in parse_edges(path):
            check = edge.get("check", "")
            if check_cmd(check):
                continue
            edges.append(edge)
        if not edges:
            continue
        # pick cheapest edge (numeric cost)
        def cost_val(e):
            try:
                return float(e.get("cost", "0"))
            except Exception:
                return 0.0
        edges.sort(key=cost_val)
        edge = edges[0]
        resolve = edge.get("resolve", "")
        ttl = int(edge.get("ttl", "86400"))
        print(f"

🌊

# Σ-PoI: fc219defa43f0cae0a2c988b0d053f66b19ee57025bb7535ae82d7f6acc26a83
