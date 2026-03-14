import os
import re

directories = ["src"]
file_extensions = [".ts", ".md"]

mapping = {
    "RISC.OP_": "OP_",
    "RISC.PROP_": "PROP_",
    "RISC.ENTANGLE": "OP_HEBB",
    "RISC.ROLE": "OP_SECRETE_PLASMID",
    "SYS.": "SYS_",
    "STRUCTURE.": "STR_"
}

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content
    imports_to_add = set()

    for old, new_prefix in mapping.items():
        pattern = r'\b' + re.escape(old) + r'([A-Z0-9_]*)\b'
        def repl(match):
            suffix = match.group(1)
            # if the match is RISC.ENTANGLE or RISC.ROLE, new_prefix is already the full string and suffix is empty
            if old in ["RISC.ENTANGLE", "RISC.ROLE"]:
                replacement = new_prefix
            else:
                replacement = new_prefix + suffix
            imports_to_add.add(replacement)
            return replacement

        content = re.sub(pattern, repl, content)

    if content != original_content:
        # We need to handle imports.
        # This is a naive regex import addition.
        # We look for: import { ... } from "../_/00/mod.ts" (or similar)
        # However, it's safer to just let the user or IDE auto-import, OR we can try to inject them.
        # Given Deno, and we just removed RISC, SYS, STRUCTURE from imports, we can add the specific constants.
        
        # We replace `RISC`, `SYS`, `STRUCTURE` in imports with the newly used constants.
        # Actually, let's just do the replacement of usages first.
        # Then we'll deal with imports.
        pass

    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")

for root, _, files in os.walk("src"):
    for file in files:
        if any(file.endswith(ext) for ext in file_extensions):
            process_file(os.path.join(root, file))
