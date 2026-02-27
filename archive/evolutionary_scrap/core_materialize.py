#!/usr/bin/env python3
from __future__ import annotations
import os
import re
import hashlib
from pathlib import Path
import protocol
import scr1
import physics

# Σ-GLYPH CORE MATERIALIZER
# V2.4.0 - Deterministic Extraction

SOURCE_DIR = protocol.ROOT / "sigma"

TAG_MAP = {
    "py": ".py",
    "ts": ".ts",
    "rs": ".rs",
    "sh": ".sh",
    "glyph": ".glyph",
    "dna": ".dna",
    "json": ".json",
    "lock": ".lock",
    "md": ".md"
}

def extract_block(text: str, tag: str) -> str | None:
    """Strictly extracts a block from a .sigma file."""
    content = text.replace("\r\n", "\n").replace("\r", "\n")
    start_marker = f"@[{tag}]"
    
    parts = re.split(f"^{re.escape(start_marker)}\\n?", content, flags=re.MULTILINE)
    if len(parts) < 2: return None
    
    payload_raw = parts[1]
    # End search: next block or seal, or physics separator
    end_match = re.search(r"\n(@\[|🔒:|CHECKSUM:|🌊)", payload_raw, re.MULTILINE)
    payload = payload_raw[:end_match.start()] if end_match else payload_raw
    
    return payload.strip("\n")

def get_glyph_id(path: Path) -> str:
    """Extracts glyph name from identity line or filename."""
    try:
        content = path.read_text(encoding="utf-8")
        match = re.search(r"^(?:🧬|Σ-GLYPH SEED):\s*([\w=]+)", content, re.MULTILINE)
        if match: return match.group(1)
    except: pass
    return path.stem

def materialize_core(source_dir: Path = SOURCE_DIR):
    """Deterministically extracts all core blocks into the lattice."""
    sigma_files = sorted(list(source_dir.glob("**/*.sigma")), key=lambda p: str(p))
    
    for path in sigma_files:
        content = path.read_text(encoding="utf-8")
        
        # Determine Stratum
        phys_match = re.search(r"^🌀:?\s*(-?\d+)", content, re.MULTILINE)
        if not phys_match:
            print(f"⚠️  No Entropy in {path.name}, defaulting to m00")
            entropy = 0
        else:
            entropy = int(phys_match.group(1))
            
        stratum = physics.entropy_to_stratum(entropy)
        glyph_id = get_glyph_id(path)

        for tag, ext in TAG_MAP.items():
            block = extract_block(content, tag)
            if block is not None:
                dim_dir = protocol.ROOT / tag.upper()
                target_path = dim_dir / stratum / f"{glyph_id}{ext}"
                target_path.parent.mkdir(parents=True, exist_ok=True)
                target_path.write_text(block + "\n", encoding="utf-8")

if __name__ == "__main__":
    materialize_core()
