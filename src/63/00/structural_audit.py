import os
from pathlib import Path

def structural_audit(root_dir: str):
    """Verifies that all files adhere to the V66 Lattice Canon."""
    print(f"\n🔍 [AUDIT] Starting Lattice Structural Audit on {root_dir}")
    # Core Canon extensions
    core_ext = {".sigma", ".spore", ".trace", ".py", ".md", ".json", ".html", ".kml"}
    # Substrate extensions (allowed in specific dirs)
    substrate_ext = {".ts", ".rs", ".js", ".dna", ".c", ".cpp", ".glyph", ".sh", ".dna"}
    
    issues = 0
    for root, dirs, files in os.walk(root_dir):
        # Skip hidden dirs
        dirs[:] = [d for d in dirs if not d.startswith('.')]
        relative_root = Path(root).relative_to(root_dir)
        is_substrate = any(part in ["TS", "DNA", "substrate", "GLYPH", "SH", "DNA"] for part in relative_root.parts)
        
        for file in files:
            path = Path(root) / file
            ext = path.suffix
            
            # Check Extension
            allowed = core_ext if not is_substrate else core_ext.union(substrate_ext)
            if ext not in allowed:
                print(f"   [WARN] Non-canonical extension: {path.relative_to(root_dir)}")
                issues += 1
            
            # Check for SIGMA invariants in .sigma files
            if ext == ".sigma":
                with open(path, "r", errors="ignore") as f:
                    content = f.read()
                    if "Σ-PoI:" not in content:
                        print(f"   [FAIL] Missing PoI Anchor: {path.relative_to(root_dir)}")
                        issues += 1

    if issues == 0:
        print("\n✅ [PASS] Structural Purity Verified. The Canon is satisfied.")
    else:
        print(f"\n⚠️ [AUDIT COMPLETE] {issues} structural issues detected.")

if __name__ == "__main__":
    structural_audit("/Users/s0fractal/SIGMA")
