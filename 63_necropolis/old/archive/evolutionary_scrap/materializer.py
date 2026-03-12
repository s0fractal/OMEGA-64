#!/usr/bin/env python3
from __future__ import annotations
import os
import re
import struct
import hashlib
import sys
import math
import json
from pathlib import Path

# Σ-GLYPH MATERIALIZER: Atomic Fusion Engine
# V3.0.0 - Unified Physics & PoI Injection

import protocol
import scr1
import physics
import Universal

# --- CONFIGURATION ---
SIGMA_ROOT = protocol.ROOT
SOURCE_DIR = SIGMA_ROOT / "sigma"

TAG_MAP = {
    "md": (SIGMA_ROOT / "MD", ".md"),
    "ts": (SIGMA_ROOT / "TS", ".ts"),
    "rs": (SIGMA_ROOT / "RS", ".rs"),
    "dna": (SIGMA_ROOT / "DNA", ".dna"),
    "sh": (SIGMA_ROOT / "SH", ".sh"),
    "rb": (SIGMA_ROOT / "RB", ".rb"),
    "py": (SIGMA_ROOT / "PY", ".py"),
    "json": (SIGMA_ROOT / "JSON", ".json"),
    "lock": (SIGMA_ROOT / "LOCK", ".lock"),
    # NOTE: .glyph removed - materialized deterministically from PHYSICS
}

# --- UNIFIED LOGIC ---

# extract_block, parse_physics, parse_yaml_metadata imported from physics

def should_materialize_glyph(phys: dict) -> bool:
    """Determines if PHYSICS metadata should materialize a .glyph file."""
    # Materialize if it's a LITERAL opcode with ATOM flag
    return phys.get("OP") == protocol.OP_LITERAL and (phys.get("FLAGS", 0) & protocol.F_ATOM)

def extract_link(text: str) -> str | None:
    return physics.extract_block(text, "link")

def compute_poi(content: str) -> str:
    """Computes PoI Hash (SHA256 of content)."""
    return hashlib.sha256(content.encode("utf-8")).hexdigest()

def get_comment_style(ext: str) -> str | None:
    """Returns comment style for PoI injection based on file extension."""
    if ext in [".ts", ".rs", ".json", ".js", ".c", ".cpp", ".java", ".go"]:
        return "//"
    if ext in [".py", ".sh", ".rb", ".yaml", ".yml", ".toml", ".sigma", ".dna", ".lock"]:
        return "#"
    if ext == ".md": 
        return "<!--"
    return "#"  # Default

def inject_poi(content: str, ext: str) -> str:
    """Injects PoI signature into content. PoI hash is calculated BEFORE injection."""
    # Skip binary files
    if ext == ".glyph":
        return content
    
    # Calculate PoI hash from pure content (before signature)
    poi_hash = compute_poi(content)
    comment = get_comment_style(ext)
    
    # Build signature based on comment style
    if comment == "<!--":
        signature = f"\n\n<!-- Σ-PoI: {poi_hash} -->"
    else:
        signature = f"\n\n{comment} Σ-PoI: {poi_hash}"
    
    return content + signature + "\n"

def materialize():
    print("=== Σ-GLYPH MATERIALIZER: Unified V3.0.0 ===\n")
    if not SOURCE_DIR.exists():
        print(f"Error: Source directory {SOURCE_DIR} not found.")
        return

    glyph_registry = {}
    sigma_files = sorted(list(SOURCE_DIR.glob("**/*.sigma")), key=lambda p: str(p))
    
    for path in sigma_files:
        try:
            content = path.read_text(encoding="utf-8")
            glyph_match = re.search(r"^(?:🧬|GLYPH|Σ-GLYPH SEED):\s*([\w=]+)", content, re.MULTILINE)
            if glyph_match:
                glyph_registry[glyph_match.group(1)] = path.relative_to(SOURCE_DIR)
        except: continue

    spectrum_configs = {}
    for path in sigma_files:
        try:
             content = path.read_text(encoding="utf-8")
             yaml_block = physics.extract_block(content, "yaml")
             if yaml_block:
                 config = physics.parse_yaml_metadata(yaml_block)
                 # Map by ID
                 match = re.search(r"^(?:🧬|GLYPH|Σ-GLYPH SEED):\s*([\w=]+)", content, re.MULTILINE)
                 if match: spectrum_configs[match.group(1)] = config
        except: continue

    for path in sigma_files:
        try: content = path.read_text(encoding="utf-8")
        except: continue
            
        phys = physics.parse_physics(content)
        stratum = physics.entropy_to_stratum(phys["ENTROPY"])
        glyph_match = re.search(r"^(?:🧬|GLYPH|Σ-GLYPH SEED):\s*([\w=]+)", content, re.MULTILINE)
        this_glyph = glyph_match.group(1) if glyph_match else path.stem
        
        dna_match = re.search(r"^(?:🧬DNA|DNA:|🔗|🔗:):\s*\n+((?:\s*(?:-\s*|Ref:\s*)?[\w=]+\n?)*)", content, re.MULTILINE)
        dependencies = []
        if dna_match:
            raw_dna = dna_match.group(1)
            dependencies = [d.replace("Ref:", "").strip("- ").strip() for d in raw_dna.splitlines() if d.strip("- ").strip()]
        
        # Deterministic Glyph Materialization (V2.6)
        # If PHYSICS indicates this should be a glyph, materialize it as pure binary
        if should_materialize_glyph(phys):
            stratum = physics.entropy_to_stratum(phys["ENTROPY"])
            glyph_path = SIGMA_ROOT / "GLYPH" / stratum / f"{this_glyph}.glyph"
            
            # Create atom from glyph name (primordial pattern)
            atom = this_glyph.encode().ljust(32, b"\x00")
            
            # Create SigmaNode from PHYSICS
            node = physics.from_physics_metadata(phys, atom=atom)
            
            # Serialize to pure binary (40 bytes)
            binary_data = node.serialize()
            
            # Write binary file (NO PoI injection for binary)
            glyph_path.parent.mkdir(parents=True, exist_ok=True)
            glyph_path.write_bytes(binary_data)
            
            print(f"   💎 Materialized Glyph: {glyph_path.name} ({len(binary_data)} bytes) | {node.hash()[:8]}")
        
        # 1. Parse Links
        links_map = {}
        link_block = extract_link(content)
        if link_block:
            for line in link_block.splitlines():
                if ":" in line:
                    k, v = line.split(":", 1)
                    links_map[k.strip()] = v.strip()
                elif line.strip():
                    links_map["*"] = line.strip()

        for tag, (out_dir, ext) in TAG_MAP.items():
            block = physics.extract_block(content, tag)
            if block is not None:
                glyph_fn = this_glyph if tag == "glyph" else path.stem
                target_path = out_dir / stratum / f"{glyph_fn}{ext}"
                
                # Axiom Injection
                atoms = []
                for dep in dependencies:
                    if dep in glyph_registry:
                        try:
                            # Projection S: Disable Axiom Injection for MD
                            if tag == "md": continue
                            
                            dep_path = SOURCE_DIR / glyph_registry[dep]
                            dep_content = dep_path.read_text(encoding="utf-8")
                            atom_block = physics.extract_block(dep_content, tag)
                            if atom_block: atoms.append(atom_block)
                        except: continue
                
                final_block = (("\n\n".join(atoms) + "\n\n") if atoms else "") + block

                if stratum != "z00" and this_glyph in spectrum_configs:
                    config = spectrum_configs[this_glyph]
                    if "IMPORT" in config:
                        template = config["IMPORT"]
                        imports = []
                        for d in dependencies:
                            if d in glyph_registry and d != this_glyph:
                                rel_dep = str(glyph_registry[d].with_suffix("")).replace(".sigma", "").replace(tag, "::" if tag=="rs" else "/")
                                imports.append(template.replace("%n", d).replace("%p", rel_dep))
                        if imports: final_block = "\n".join(imports) + "\n\n" + final_block

                # PoI Injection (using extracted function)
                content_with_sig = inject_poi(final_block, ext)

                target_path.parent.mkdir(parents=True, exist_ok=True)
                target_path.write_text(content_with_sig, encoding="utf-8")
                
                # 2. Link Processing
                link_target_str = links_map.get(tag) or links_map.get("*")
                if link_target_str:
                    link_name = (SIGMA_ROOT / link_target_str).resolve()
                    try:
                         link_name.relative_to(SIGMA_ROOT)
                    except ValueError:
                         continue

                    link_name.parent.mkdir(parents=True, exist_ok=True)
                    try:
                        rel_target = os.path.relpath(target_path, link_name.parent)
                        if link_name.exists() or link_name.is_symlink():
                            link_name.unlink()
                        os.symlink(rel_target, link_name)
                    except Exception as e:
                        pass

    print("\n--- Materialization Complete. The Lattice is Reified. ---")

if __name__ == "__main__":
    materialize()
