#!/usr/bin/env python3
from __future__ import annotations
import re
from pathlib import Path
import protocol
import core_materialize
import physics

# Σ-GLYPH HEURISTIC MATERIALIZER
# V2.4.0 - Templates & Axiom Injection

SOURCE_DIR = protocol.ROOT / "sigma"

def parse_yaml_metadata(text: str) -> dict:
    data = {}
    if not text: return data
    for line in text.splitlines():
        line = line.split("#")[0].strip()
        if not line or ":" not in line: continue
        key, val = line.split(":", 1)
        data[key.strip().upper()] = val.strip().strip("'\"")
    return data

def materialize_heuristics(source_dir: Path = SOURCE_DIR):
    """Adds imports and axiom injection (HEURISTICS) to the lattice."""
    sigma_files = sorted(list(source_dir.glob("**/*.sigma")), key=lambda p: str(p))
    
    # 1. Map Glyph IDs to relative paths for Import generation
    glyph_registry = {}
    for path in sigma_files:
        gid = core_materialize.get_glyph_id(path)
        glyph_registry[gid] = path.relative_to(SOURCE_DIR)

    # 2. Extract Spectrum Configs (@[yaml] blocks in base dimension files)
    spectrum_configs = {}
    for gid, rel_path in glyph_registry.items():
        if gid in core_materialize.TAG_MAP:
            content = (SOURCE_DIR / rel_path).read_text(encoding="utf-8")
            yaml_block = core_materialize.extract_block(content, "yaml")
            if yaml_block:
                spectrum_configs[gid] = parse_yaml_metadata(yaml_block)

    # 3. Process each file for Heuristic injection
    for path in sigma_files:
        content = path.read_text(encoding="utf-8")
        gid = core_materialize.get_glyph_id(path)
        
        # Determine Stratum
        phys_match = re.search(r"^🌀:?\s*(-?\d+)", content, re.MULTILINE)
        entropy = int(phys_match.group(1)) if phys_match else 0
        stratum = physics.entropy_to_stratum(entropy)

        # Extract Dependencies (DNA)
        dna_match = re.search(r"^(?:🧬DNA|DNA:|🔗|🔗:):\s*\n+((?:\s*(?:-\s*|Ref:\s*)?[\w=]+\n?)*)", content, re.MULTILINE)
        dependencies = []
        if dna_match:
            raw_dna = dna_match.group(1)
            dependencies = [d.replace("Ref:", "").strip("- ").strip() for d in raw_dna.splitlines() if d.strip("- ").strip()]

        for tag, ext in core_materialize.TAG_MAP.items():
            block = core_materialize.extract_block(content, tag)
            if block is None: continue
            
            # 3a. Axiom Injection (Atoms)
            atoms = []
            for dep in dependencies:
                if dep in glyph_registry:
                    dep_content = (SOURCE_DIR / glyph_registry[dep]).read_text(encoding="utf-8")
                    atom_block = core_materialize.extract_block(dep_content, tag)
                    if atom_block: atoms.append(atom_block)
            
            final_block = (("\n\n".join(atoms) + "\n\n") if atoms else "") + block

            # 3b. Import Templating
            if stratum != "z00" and tag in spectrum_configs:
                config = spectrum_configs[tag]
                if "IMPORT" in config:
                    template = config["IMPORT"]
                    imports = []
                    for d in dependencies:
                        if d in glyph_registry and d != gid:
                            # Heuristic: Predict relative path for imports
                            rel_dep = str(glyph_registry[d].with_suffix("")).replace(".sigma", "").replace(tag, "::" if tag=="rs" else "/")
                            imports.append(template.replace("%n", d).replace("%p", rel_dep))
                    if imports: final_block = "\n".join(imports) + "\n\n" + final_block

            # Overwrite the core-materialized file with heuristic version
            dim_dir = protocol.ROOT / tag.upper()
            target_path = dim_dir / stratum / f"{gid}{ext}"
            target_path.write_text(final_block + "\n", encoding="utf-8")

if __name__ == "__main__":
    materialize_heuristics()
