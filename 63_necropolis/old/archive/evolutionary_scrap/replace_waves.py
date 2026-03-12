"""
Simple Prism Replacement Script
Replaces floating 🌊 with Prism header
V2.4.1 - Safe approach
"""

import re
from pathlib import Path

def replace_floating_wave_with_prism(sigma_file: Path, dry_run: bool = True) -> dict:
    """
    Replace floating 🌊 with Prism header.
    Only replaces waves that are NOT in PHYSICS section.
    """
    content = sigma_file.read_text()
    original = content
    changes = []
    
    lines = content.split('\n')
    new_lines = []
    
    for i, line in enumerate(lines):
        if line.strip() == '🌊':
            # Check if it's in PHYSICS section
            context_before = '\n'.join(lines[max(0, i-3):i])
            context_after = '\n'.join(lines[i:min(len(lines), i+3)])
            context = context_before + context_after
            
            # Only replace if NOT in PHYSICS metadata
            if '# === ⚖️ PHYSICS' not in context and 'PHASE:' not in context and 'AMPLITUDE:' not in context and '🌊:' not in context:
                new_lines.append('# === 🌈 The Isomorphic Prism ===')
                changes.append(f"Replaced floating wave at line {i+1} with Prism header")
            else:
                new_lines.append(line)
        else:
            new_lines.append(line)
    
    content = '\n'.join(new_lines)
    
    if content != original:
        if not dry_run:
            sigma_file.write_text(content)
            changes.append("✅ File updated")
        else:
            changes.append("🔄 Would update (dry run)")
        
        return {"file": sigma_file.name, "changes": changes, "success": True}
    else:
        return {"file": sigma_file.name, "changes": ["No changes needed"], "success": True}

def main():
    import argparse
    parser = argparse.ArgumentParser(description="Replace floating waves with Prism header")
    parser.add_argument("--apply", action="store_true", help="Actually apply changes")
    parser.add_argument("--file", help="Fix specific file")
    args = parser.parse_args()
    
    if args.file:
        files = [Path(args.file)]
    else:
        files = sorted(Path("sigma").rglob("*.sigma"))
    
    results = []
    for f in files:
        try:
            result = replace_floating_wave_with_prism(f, dry_run=not args.apply)
            results.append(result)
            
            if result["changes"] and result["changes"] != ["No changes needed"]:
                print(f"{'✅' if result['success'] else '❌'} {result['file']}")
                for change in result["changes"]:
                    print(f"   {change}")
        except Exception as e:
            print(f"❌ {f.name}: Error - {e}")
    
    fixed = sum(1 for r in results if r["success"] and r["changes"] != ["No changes needed"])
    print(f"\n📊 Summary: {fixed}/{len(results)} files {'would be ' if not args.apply else ''}fixed")
    
    if not args.apply and fixed > 0:
        print("\n🔄 This was a DRY RUN. Use --apply to actually make changes.")

if __name__ == "__main__":
    main()
