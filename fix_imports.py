import os
import re

directories = ["src"]
file_extensions = [".ts"]

pattern_all = re.compile(r'\b(OP_[A-Z0-9_]+|PROP_[A-Z0-9_]+|SYS_[A-Z0-9_]+|STR_[A-Z0-9_]+|ROLE_[A-Z0-9_]+)\b')
import_regex = re.compile(r'import\s+\{([^}]*)\}\s+from\s+[\'"](.*(?:STATE_MATRIX|ATOM_ACCESS|00/mod).*?)[\'"];', re.MULTILINE | re.DOTALL)

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find used items
    used_items = set()
    for match in pattern_all.finditer(content):
        used_items.add(match.group(1))

    if not used_items:
        return

    def repl_import(match):
        imported_vars_str = match.group(1)
        import_path = match.group(2)
        
        imported_vars = [v.strip() for v in imported_vars_str.replace('\n', ' ').split(',')]
        
        keep = set()
        has_target_namespace = False
        for v in imported_vars:
            if not v: continue
            if v in ["RISC", "SYS", "STRUCTURE"]:
                has_target_namespace = True
            else:
                keep.add(v)
                
        # If this import statement had the old namespaces, inject used items
        # OR if it's the only STATE_MATRIX import we might just inject it here anyway
        # Actually let's always inject used items into this import block
        keep.update(used_items)
            
        sorted_imports = sorted(list(keep))
        
        if len(sorted_imports) > 5:
            lines = []
            chunk = []
            for imp in sorted_imports:
                chunk.append(imp)
                if sum(len(c) for c in chunk) > 80:
                    lines.append("  " + ", ".join(chunk))
                    chunk = []
            if chunk:
                lines.append("  " + ", ".join(chunk))
            import_str = "import {\n" + ",\n".join(lines) + "\n} from \"" + import_path + "\";"
        else:
            import_str = "import { " + ", ".join(sorted_imports) + " } from \"" + import_path + "\";"
            
        return import_str
        
    old_content = content
    # Try to substitute
    (new_content, count) = import_regex.subn(repl_import, content)
    
    # If count == 0 but we have used_items, the file might not import STATE_MATRIX anymore and we need to add it!
    # Or maybe the import is just format nicely without RISC string.
    # Actually, we can just replace.
    if count == 0 and used_items:
        # no match, we just prepend it if there are used items and it's not mod.ts
        if "mod.ts" not in filepath and "ATOM_ACCESS.ts" not in filepath:
            # wait, we must figure out the relative path to _/00/mod.ts or STATE_MATRIX.ts
            pass
            
    if new_content != old_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated imports in {filepath}")

for root, _, files in os.walk("src"):
    for file in files:
        if any(file.endswith(ext) for ext in file_extensions):
            process_file(os.path.join(root, file))
