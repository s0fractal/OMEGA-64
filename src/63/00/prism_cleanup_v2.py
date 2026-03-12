"""
Σ-GLYPH Prism Cleanup V2 - Fix Remaining Issues
Fixes duplicate @[dna] blocks and remaining floating waves
V2.4.1
"""

import re
from pathlib import Path
import sys

def fix_duplicates_and_waves(sigma_file: Path, dry_run: bool = True) -> dict:
    """
    Fix remaining issues:
    1. Remove duplicate @[dna] blocks (keep first one)
    2. Remove ALL floating 🌊 symbols
    """
    content = sigma_file.read_text()
    original = content
    changes = []
    
    # Fix 1: Remove duplicate @[dna] blocks
    dna_blocks = list(re.finditer(r'@\[dna\]', content))
    if len(dna_blocks) > 1:
        # Keep first, remove others
        for match in reversed(dna_blocks[1:]):  # Reverse to maintain positions
            # Find the block content (until next @[...] or 🔒)
            start = match.end()
            next_block = re.search(r'\n(@\[|\n🔒:)', content[start:])
            if next_block:
                end = start + next_block.start()
                # Remove this duplicate block
                content = content[:match.start()] + content[end:]
                changes.append(f"Removed duplicate @[dna] block")
    
    # Fix 2: Remove ALL floating waves (more aggressive)
    lines = content.split('\n')
    new_lines = []
    
    for i, line in enumerate(lines):
        if line.strip() == '🌊':
            # Check if it's in PHYSICS section (within 3 lines of PHYSICS keyword)
            context_before = '\n'.join(lines[max(0, i-3):i])
            context_after = '\n'.join(lines[i:min(len(lines), i+3)])
            context = context_before + context_after
            
            # Only keep if it's clearly in PHYSICS metadata
            if '# === ⚖️ PHYSICS' in context or 'PHASE:' in context or 'AMPLITUDE:' in context:
                new_lines.append(line)
            else:
                changes.append(f"Removed floating wave at line {i+1}")
                continue
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
    parser = argparse.ArgumentParser(description="Fix duplicate @[dna] and floating waves")
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
            result = fix_duplicates_and_waves(f, dry_run=not args.apply)
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
