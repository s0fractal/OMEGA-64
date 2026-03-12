import sys
import os
import re
import argparse
import hashlib
from pathlib import Path

# Σ-GLYPH CLI: The System Orchestrator
# V2.3.1 - Deterministic Resonance: Absolute Path Immunity

import materializer
import guard
import protocol
import physics
import collider
import akasha
import lut_codec

TEMPLATE_V2_3 = """Σ-GLYPH SEED: {NAME}
🧬IDENTITY: {ID}

---
# === 🧬 IDENTITY ===
🧬: {NAME}
DNA: {DNA}
⚛️: {ATOM}
🎨: #FFFFFF

# === ⚖️ PHYSICS (Wave Function) ===
⚙️: 0
🚩: 1
🌊: {PHASE}
🔊: 65535
🌀: -32768

# === 🔗 GRAVITY (Dependencies) ===
🔗:
  - SATOSHI
---

# {NAME}

Intent for {NAME} established.

🌊

@[dna]
{DNA}

🔒: {ID}
"""

def get_repo_root() -> Path:
    """Discovery with override support."""
    override = os.environ.get("SIGMA_ROOT") or os.environ.get("SIGMA_GARDEN")
    if override:
        return Path(override).resolve()
    return protocol.ROOT

def calc_spectral_analysis(text: str):
    h = hashlib.sha256(text.encode()).hexdigest()
    color = f"#{h[:6].upper()}"
    return h, color

def cmd_forge(name: str, phase: int = 0, dna: str = None):
    """Forges a new seed at p32 with V2.3 Identity."""
    if not dna: dna = name
    atom, _ = calc_spectral_analysis(name)
    
    temp_id = "00"*32 
    content = TEMPLATE_V2_3.format(
        NAME=name,
        ID=temp_id,
        DNA=dna,
        ATOM=atom,
        PHASE=phase
    )
    
    # DETERNMINISTIC PATHS
    target_path = get_repo_root() / "sigma" / "p32" / f"{name}.sigma"
    target_path.parent.mkdir(parents=True, exist_ok=True)
    target_path.write_text(content, encoding="utf-8")
    
    # Self-Seal immediately
    guard.audit_lattice(fix=True)
    print(f"✨ Forged and Sealed: {name}.sigma")

def cmd_path_check():
    """CI Test: Ensure no absolute paths exist in the lattice or tools."""
    root = get_repo_root()
    print(f"🧐 Auditing for Path Leaks in {root} (Strict Mode)...")
    
    # Expanded patterns to detect
    patterns = [
        "/" + "Users" + "/",
        "/" + "home" + "/",
        "C" + ":" + "\\",
        "file" + ":" + "//",
        "~" + "/"
    ]
    
    found = False
    
    # Scan PY, TS, sigma, SH, MD, LOCK, JSON
    for dir_name in ["PY", "TS", "sigma", "SH", "MD", "LOCK", "JSON"]:
        search_dir = root / dir_name
        if not search_dir.exists(): continue
        
        for path in sorted(search_dir.glob("**/*"), key=lambda p: str(p)):
            if path.is_dir() or path.suffix in [".png", ".jpg", ".bin", ".pyc", ".lock"]: continue
            try:
                content = path.read_text(encoding="utf-8")
                
                for p in patterns:
                    if p in content:
                        # Extra check: is it inside a .sigma block?
                        # We just report it regardless of context for strict determinism.
                        print(f"   [FAIL] Leak '{p}' in: {path.relative_to(root)}")
                        found = True
                        break # Only report once per file
            except Exception as e:
                # print(f"   [SKIP] {path.name}: {e}")
                continue
            
    if found:
        print("\n❌ PATH AUDIT FAILED. Purge absolute references.")
        sys.exit(1)
    else:
        print("\n✅ ZERO PATH LEAKS DETECTED.")

def main():
    parser = argparse.ArgumentParser(description="Σ-GLYPH CLI: System Orchestrator V2.3.1")
    subparsers = parser.add_subparsers(dest="command")

    sync_parser = subparsers.add_parser("sync", help="Materialize all intents (SCR-1).")
    sync_parser.add_argument("--core-only", action="store_true", help="Only extract deterministic blocks.")

    check_parser = subparsers.add_parser("check", help="Audit lattice (SCR-1/Identity).")
    check_parser.add_argument("--fix", action="store_true")
    check_parser.add_argument("--strict", action="store_true", help="Fail hard on any dissonance.")
    
    test_parser = subparsers.add_parser("test", help="Run system tests.")
    test_parser.add_argument("suite", choices=["path-check"])

    calc_parser = subparsers.add_parser("calc", help="Spectral analysis.")
    calc_parser.add_argument("text")

    poi_parser = subparsers.add_parser("poi", help="Harmonization Layer (PoI).")
    poi_parser.add_argument("--strict", action="store_true", help="Fail on 🔴.")
    poi_parser.add_argument("--json", action="store_true", help="Output JSON report.")

    forge_parser = subparsers.add_parser("forge", help="Forge seed (V2.3).")
    forge_parser.add_argument("name")
    forge_parser.add_argument("--phase", type=int, default=0)
    forge_parser.add_argument("--dna")

    akasha_parser = subparsers.add_parser("akasha", help="Akasha Record Store operations.")
    akasha_subparsers = akasha_parser.add_subparsers(dest="subcommand", required=True)
    akasha_subparsers.add_parser("init", help="Initialize Akasha with canonical LUT blobs.")
    akasha_subparsers.add_parser("verify", help="Verify LUT blob exists and is valid.")

    resonance_parser = subparsers.add_parser("resonance", help="Check self-explanation quality (Prism compliance).")
    resonance_parser.add_argument("file", nargs="?", help="Specific .sigma file to check (optional)")

    subparsers.add_parser("version", help="System version.")

    args = parser.parse_args()

def calculate_resonance(sigma_file: Path) -> dict:
    """
    Calculate resonance score for .sigma file.
    
    Resonance = measure of self-explanation quality
    100% = perfect metadata-implementation alignment
    """
    content = sigma_file.read_text()
    score = 0
    max_score = 100
    issues = []
    
    # Check 1: Prism header exists (20 points)
    if "# === 🌈 The Isomorphic Prism ===" in content:
        score += 20
    else:
        issues.append("Missing Prism header")
    
    # Check 2: @[md] block exists and non-empty (30 points)
    md_block = physics.extract_block(content, "md")
    if md_block and len(md_block) > 50:
        score += 30
    elif md_block:
        score += 15
        issues.append("@[md] block too short")
    else:
        score += 0
        issues.append("BLIND SPOT: @[md] block missing")
    
    # Check 3: DNA parity (30 points)
    dna_header = re.search(r'^DNA:\s*(.+)$', content, re.MULTILINE)
    dna_block = physics.extract_block(content, "dna")
    
    if dna_header and dna_block:
        header_dna = dna_header.group(1).strip()
        block_dna = dna_block.strip()
        
        # Normalize whitespace
        header_norm = re.sub(r'\s+', ' ', header_dna)
        block_norm = re.sub(r'\s+', ' ', block_dna)
        
        if header_norm == block_norm:
            score += 30
        else:
            issues.append(f"DNA DISSONANCE: header='{header_dna}' ≠ block='{block_dna}'")
    else:
        if not dna_header:
            issues.append("Missing DNA header")
        if not dna_block:
            issues.append("Missing @[dna] block")
    
    # Check 4: No floating artifacts (20 points)
    lines = content.split('\n')
    floating_waves = []
    for i, line in enumerate(lines):
        if line.strip() == '🌊':
            context = '\n'.join(lines[max(0, i-5):i+5])
            if 'PHYSICS' not in context and 'PHASE' not in context and 'AMPLITUDE' not in context:
                floating_waves.append(i+1)
    
    if not floating_waves:
        score += 20
    else:
        issues.append(f"Floating wave symbols at lines: {floating_waves}")
    
    return {
        "file": sigma_file.name,
        "score": score,
        "max": max_score,
        "percentage": (score / max_score) * 100,
        "issues": issues
    }

def cmd_resonance(file_pattern: str = None):
    """Check resonance across .sigma files."""
    if file_pattern:
        files = [Path(file_pattern)]
    else:
        files = sorted(Path("sigma").rglob("*.sigma"))
    
    results = []
    for f in files:
        try:
            res = calculate_resonance(f)
            results.append(res)
            
            # Print result
            pct = res['percentage']
            if pct == 100:
                status = "✅"
            elif pct >= 80:
                status = "🟡"
            else:
                status = "🔴"
            
            print(f"{status} {res['file']}: Resonance {pct:.0f}%")
            
            for issue in res['issues']:
                if "BLIND SPOT" in issue:
                    print(f"   ⚠️  {issue}")
                elif "DISSONANCE" in issue:
                    print(f"   🔴 {issue}")
                else:
                    print(f"   • {issue}")
        except Exception as e:
            print(f"❌ {f.name}: Error - {e}")
    
    if not results:
        print("No .sigma files found")
        return
    
    # Summary
    avg_resonance = sum(r['percentage'] for r in results) / len(results)
    print(f"\n📊 Average Resonance: {avg_resonance:.1f}%")
    
    if avg_resonance < 80:
        print("⚠️  System is failing to explain itself.")
        sys.exit(1)

    args = parser.parse_args()

    if args.command == "sync":
        materializer.materialize()
    elif args.command == "check":
        violations = guard.audit_lattice(fix=args.fix)
        if violations:
            # Check if shrapnel was detected
            has_shrapnel = any("Shrapnel" in v for v in violations)
            if has_shrapnel:
                print("\n🔴 SHRAPNEL DETECTED - System integrity compromised.")
            
            if args.strict:
                print("\n❌ STRICT MODE: Dissonance detected. Blocking evolution.")
                sys.exit(1)
            else:
                print(f"\n⚠️  Total Violations: {len(violations)}")
                # Always exit with code 1 if violations exist
                sys.exit(1)
    
    elif args.command == "akasha":
        if args.subcommand == "init":
            # Initialize Akasha with canonical LUT blobs
            store = akasha.AkashaStore(protocol.ROOT)
            
            # Convert LUT JSON to blob
            lut_json = protocol.ROOT / "sigma" / "m32" / "lut_cos.json"
            if not lut_json.exists():
                print(f"❌ LUT JSON not found: {lut_json}")
                sys.exit(1)
            
            print("🔄 Converting LUT JSON to canonical blob...")
            blob_bytes, blob_hash = lut_codec.json_to_canonical_blob(lut_json)
            
            print(f"   Size: {len(blob_bytes)} bytes")
            print(f"   Hash: {blob_hash}")
            
            # Store in Akasha
            print("🔄 Storing blob in Akasha...")
            stored_hash = store.put(blob_bytes)
            
            print(f"\n✅ LUT_COS blob stored in Akasha")
            print(f"   Hash: {stored_hash}")
            print(f"   Path: {store._blob_path(stored_hash)}")
            
            # Verify
            if store.verify(stored_hash):
                print(f"✅ Blob verified")
            else:
                print(f"❌ Blob verification failed")
                sys.exit(1)
        
        elif args.subcommand == "verify":
            # Verify LUT blob exists and is valid
            store = akasha.AkashaStore(protocol.ROOT)
            
            if store.verify(lut_codec.LUT_COS_HASH):
                print(f"✅ LUT_COS blob verified")
                print(f"   Hash: {lut_codec.LUT_COS_HASH}")
            else:
                print(f"❌ LUT_COS blob missing or corrupted")
                print(f"   Expected: {lut_codec.LUT_COS_HASH}")
                print(f"   Run: sigma akasha init")
                sys.exit(1)
        
        else:
            print(f"Unknown akasha subcommand: {args.subcommand}")
            sys.exit(1)
    
    elif args.command == "resonance":
        cmd_resonance(args.file if hasattr(args, 'file') else None)
    
    elif args.command == "test":
        if args.suite == "path-check": cmd_path_check()
    elif args.command == "calc":
        h, color = calc_spectral_analysis(args.text)
        print(f"🧬 Spectral Analysis:\n   Atom:  {h}\n   Color: {color}")
    elif args.command == "poi":
        results = collider.collide()
        if args.json:
            print(collider.generate_report(results, "json"))
        else:
            print(collider.generate_report(results, "human"))
        
        if args.strict:
            has_red = any(r.status == "🔴" for r in results)
            if has_red:
                print("\n❌ STRICT MODE: Dissonance (🔴) detected.")
                sys.exit(1)
    elif args.command == "forge":
        cmd_forge(args.name, args.phase, args.dna)
    elif args.command == "version":
        print(f"Σ-GLYPH OS V{protocol._data.get('VERSION', '2.3.1')} (Resonance Stable)")
    else:
        parser.print_help()

if __name__ == "__main__":
    main()
