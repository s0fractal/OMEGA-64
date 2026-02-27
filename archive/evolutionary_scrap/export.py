#!/usr/bin/env python3
import os
from pathlib import Path
import protocol

# Σ-GLYPH EXPORTER: Universal Archival Engine
# V2.3.1 - Aligned with Protocol

SIGMA_ROOT = protocol.ROOT
EXPORT_FILE = SIGMA_ROOT / "TXT/sigma_full_codebase.txt"

def export():
    print(f"--- Exporting Σ-GLYPH Codebase to {EXPORT_FILE.name} ---")
    EXPORT_FILE.parent.mkdir(parents=True, exist_ok=True)
    
    with open(EXPORT_FILE, "w", encoding="utf-8") as f:
        # 1. Export sigma/
        f.write("# === DIMENSION: SIGMA (Intents & Seeds) ===\n\n")
        sigma_dir = SIGMA_ROOT / "sigma"
        # Deterministic order
        for path in sorted(sigma_dir.rglob("*.sigma")):
            rel_path = path.relative_to(SIGMA_ROOT)
            f.write(f"## FILE: {rel_path}\n")
            f.write("```sigma\n")
            f.write(path.read_text(encoding="utf-8"))
            f.write("\n```\n\n")
        
        # 2. Export experiments/ (V6-V7 Framework)
        f.write("# === DIMENSION: EXPERIMENTS (V6-V7 Research) ===\n\n")
        experiments_dir = SIGMA_ROOT / "experiments"
        if experiments_dir.exists():
            for path in sorted(experiments_dir.rglob("*")):
                if path.is_file() and not path.name.startswith('.'):
                    # Skip binary files (__pycache__, etc)
                    if path.suffix in ['.pyc', '.pyo', '.so', '.dylib']:
                        continue
                    
                    rel_path = path.relative_to(SIGMA_ROOT)
                    ext = path.suffix
                    lang = "python" if ext == ".py" else "markdown" if ext == ".md" else "text"
                    
                    try:
                        content = path.read_text(encoding="utf-8")
                        f.write(f"## FILE: {rel_path}\n")
                        f.write(f"```{lang}\n")
                        f.write(content)
                        f.write("\n```\n\n")
                    except (UnicodeDecodeError, PermissionError) as e:
                        # Skip files that can't be read as text
                        print(f"  Skipping {rel_path}: {e}")
                        continue
            
        # 3. Export PY/z00 (Engines)
        f.write("# === DIMENSION: PY (Python Engines & Tools) ===\n\n")
        py_dir = SIGMA_ROOT / "PY" / "z00"
        # Deterministic order
        for path in sorted(py_dir.glob("*.py")):
            rel_path = path.relative_to(SIGMA_ROOT)
            f.write(f"## FILE: {rel_path}\n")
            f.write("```python\n")
            f.write(path.read_text(encoding="utf-8"))
            f.write("\n```\n\n")

    print(f"✅ Export Complete. Volume materialized at: {EXPORT_FILE}")

if __name__ == "__main__":
    export()
