import os
import re

for root, _, files in os.walk("src"):
    for file in files:
        if not file.endswith(".ts"):
            continue
            
        filepath = os.path.join(root, file)
        
        # Calculate relative path to src/00/STATE_MATRIX.ts
        depth = root.count(os.sep) - "src".count(os.sep)
        if depth == 0:
            rel_path = "./00/STATE_MATRIX.ts"
        else:
            rel_path = "../" * depth + "00/STATE_MATRIX.ts"
            
        with open(filepath, "r") as f:
            content = f.read()
            
        old_content = content
        
        # fix depth
        content = content.replace('"../../00/STATE_MATRIX.ts"', f'"{rel_path}"')
        
        # fix absolute path that TS-morph might have accidentally added, e.g. "/Users/..."
        # Though the errors showed: import { RISC } from "/Users/s0fractal/OMEGA/src/_/mod.ts";
        # Wait, if a file had RISC from _/mod.ts, let's just remove the RISC and SYS imports from those directly.
        
        import_mod_regex = re.compile(r'import\s+\{([^}]*)\}\s+from\s+[\'"](.*_/mod\.ts)[\'"];')
        def repl_mod(m):
            vars_str = m.group(1)
            path = m.group(2)
            parts = [p.strip() for p in vars_str.split(',')]
            keep = [p for p in parts if p and p not in ["RISC", "SYS", "STRUCTURE"]]
            if not keep:
                return ''
            return f'import {{ {", ".join(keep)} }} from "{path}";'
            
        content = import_mod_regex.sub(repl_mod, content)

        if content != old_content:
            with open(filepath, "w") as f:
                f.write(content)
            print(f"Fixed {filepath}")
