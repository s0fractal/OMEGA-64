import os
import re
from pathlib import Path
import protocol

# Σ-GLYPH GENETIC REPAIR: Mass DNA Purge
# V2.3.1 - Aligned with Protocol

M32_DIR = protocol.ROOT / "sigma" / "m32"

if not M32_DIR.exists():
    print(f"Error: Directory {M32_DIR} not found.")
else:
    for path in sorted(M32_DIR.glob("*.sigma")):
        content = path.read_text(encoding="utf-8")
        if "DNA: - SATOSHI" in content:
            name = path.stem
            print(f"🧬 Repairing DNA: {name}")
            
            # Replace YAML DNA
            content = re.sub(r"DNA: - SATOSHI", f"DNA: {name}", content)
            
            # Replace @[dna] block content
            content = re.sub(r"@\[dna\]\n- SATOSHI", f"@[dna]\n{name}", content)
            
            # Reset checksum for sealing
            content = re.sub(r"🔒:.*", "🔒: VALIDATING...", content)
            
            path.write_text(content, encoding="utf-8")

    print("✅ Genetic Repair Complete.")
