import re

with open("src/00/generate.ts", "r") as f:
    text = f.read()
    
# Rather than trying to let JS parse it at runtime, I will just parse TS_OFFSETS right now in python and write the actual Rust constants as a string literal.

start = text.find("const TS_OFFSETS = `")
start += len("const TS_OFFSETS = `")
end = text.find("`;\n\nconst VM_MATH", start)
ts_offsets_str = text[start:end]

lines = ts_offsets_str.split("\n")
rust_constants = []
for line in lines:
    line = line.strip()
    if "_BYTES =" in line or "_OFFSET =" in line or "INTENT_OFFSET =" in line:
        if "WASM_PAGE_BYTES" in line:
            continue
        
        raw = line
        if raw.startswith("export const "):
            raw = raw[len("export const "):]
        elif raw.startswith("const "):
            raw = raw[len("const "):]
            
        parts = raw.split("=")
        if len(parts) >= 2:
            name = parts[0].split(":")[0].strip()
            expr = parts[1].replace(";", "").strip()
            rust_constants.append(f"pub const {name}: usize = {expr};")

rust_constants_str = "\\n".join(rust_constants)

bad = r"""const rsLayoutVariables = TS_OFFSETS.split('\n')
  .filter(l => l.includes('export const') && !l.includes('WASM_PAGE_BYTES'))
  .map(l => {
    let raw = l.trim().substring('export const '.length);
    let parts = raw.split('=');
    if (parts.length < 2) return "";
    let name = parts[0].split(':')[0].trim();
    let expr = parts[1].replace(';', '').trim();
    return "pub const " + name + ": usize = " + expr + ";";
  }).filter(l => l.length > 0).join('\n');"""

good = f'const rsLayoutVariables = "{rust_constants_str}";'

if bad in text:
    text = text.replace(bad, good)
else:
    print("Could not replacement target")
    
with open("src/00/generate.ts", "w") as f:
    f.write(text)
    
