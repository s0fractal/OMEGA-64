"""
Σ-GLYPH Prism Cleanup Automation
Fixes .sigma files to comply with Isomorphic Prism standard
V2.4.1 - Mass Formalization
"""

import re
from pathlib import Path
import sys

def fix_sigma_file(sigma_file: Path, dry_run: bool = True) -> dict:
    """
    Fix a single .sigma file to comply with Prism standard.
    
    Fixes:
    1. Remove floating 🌊 symbols (outside PHYSICS section)
    2. Add Prism header if missing
    3. Add @[md] block if missing
    4. Ensure @[dna] comes before @[lang] blocks
    """
    content = sigma_file.read_text()
    original = content
    changes = []
    
    # Find the separator (---)
    separator_match = re.search(r'^---$', content, re.MULTILINE)
    if not separator_match:
        return {"file": sigma_file.name, "changes": ["No separator found"], "success": False}
    
    separator_pos = separator_match.end()
    
    # Split into metadata and implementation
    metadata = content[:separator_pos]
    implementation = content[separator_pos:]
    
    # Check if Prism header exists
    has_prism = "# === 🌈 The Isomorphic Prism ===" in implementation
    
    if not has_prism:
        # Find first @[lang] block
        first_block_match = re.search(r'\n(@\[\w+\])', implementation)
        
        if first_block_match:
            insert_pos = first_block_match.start()
            
            # Extract DNA from header
            dna_match = re.search(r'^DNA:\s*(.+)$', metadata, re.MULTILINE)
            dna_value = dna_match.group(1).strip() if dna_match else "- SATOSHI"
            
            # Extract glyph name
            name_match = re.search(r'^🧬:\s*(.+?)(?:\s*#|$)', metadata, re.MULTILINE)
            glyph_name = name_match.group(1).strip() if name_match else "Unknown"
            
            # Create Prism section
            prism_section = f"""
# === 🌈 The Isomorphic Prism ===

@[md]
Intent for {glyph_name} established.

@[dna]
{dna_value}

"""
            
            implementation = implementation[:insert_pos] + prism_section + implementation[insert_pos:]
            changes.append("Added Prism header with @[md] and @[dna]")
    
    # Remove floating waves (not in PHYSICS section)
    lines = implementation.split('\n')
    new_lines = []
    
    for i, line in enumerate(lines):
        if line.strip() == '🌊':
            # Check context
            context = '\n'.join(lines[max(0, i-5):i+5])
            if 'PHYSICS' not in context and 'PHASE' not in context and 'AMPLITUDE' not in context and '# ===' not in context:
                changes.append(f"Removed floating wave at line {i+1}")
                continue  # Skip this line
        new_lines.append(line)
    
    implementation = '\n'.join(new_lines)
    
    # Reconstruct file
    new_content = metadata + implementation
    
    if new_content != original:
        if not dry_run:
            sigma_file.write_text(new_content)
            changes.append("✅ File updated")
        else:
            changes.append("🔄 Would update (dry run)")
        
        return {"file": sigma_file.name, "changes": changes, "success": True}
    else:
        return {"file": sigma_file.name, "changes": ["No changes needed"], "success": True}

def main():
    import argparse
    parser = argparse.ArgumentParser(description="Fix .sigma files for Prism compliance")
    parser.add_argument("--apply", action="store_true", help="Actually apply changes (default is dry run)")
    parser.add_argument("--file", help="Fix specific file (optional)")
    args = parser.parse_args()
    
    if args.file:
        files = [Path(args.file)]
    else:
        files = sorted(Path("sigma").rglob("*.sigma"))
    
    results = []
    for f in files:
        try:
            result = fix_sigma_file(f, dry_run=not args.apply)
            results.append(result)
            
            if result["changes"] and result["changes"] != ["No changes needed"]:
                print(f"{'✅' if result['success'] else '❌'} {result['file']}")
                for change in result["changes"]:
                    print(f"   {change}")
        except Exception as e:
            print(f"❌ {f.name}: Error - {e}")
    
    # Summary
    fixed = sum(1 for r in results if r["success"] and r["changes"] != ["No changes needed"])
    print(f"\n📊 Summary: {fixed}/{len(results)} files {'would be ' if not args.apply else ''}fixed")
    
    if not args.apply and fixed > 0:
        print("\n🔄 This was a DRY RUN. Use --apply to actually make changes.")

if __name__ == "__main__":
    main()
