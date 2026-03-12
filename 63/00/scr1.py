import hashlib
import re

# Σ-GLYPH SCR-1: Stable Canonical Resonance
# V2.3.1 - Standard Implementation

def canonicalize_sigma(text: str) -> bytes:
    """
    SCR-1 Canonicalization Algorithm:
    1. Normalize CRLF to LF.
    2. Remove trailing whitespace on each line.
    3. Remove the 🧬IDENTITY header line anywhere.
    4. Remove everything from the last '\n🔒:' or '\nCHECKSUM:' to the end.
    5. Ensure the result ends with exactly one '\n'.
    6. Return UTF-8 bytes.
    """
    # 0. Empty file check
    if not text:
        return b"\n"

    # 1. Normalize Line Endings
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    
    # 2. Strip Seal (Strict Regex Matching)
    # Specified regex: r"\n(?:🔒:|CHECKSUM:)\s*[0-9a-f]{64}\s*$"
    # We use MULTILINE to match $ at the end of lines, but we want the VERY last one.
    seal_pattern = r"\n(?:🔒:|CHECKSUM:)\s*[0-9a-f]{64}\s*$"
    match = list(re.finditer(seal_pattern, text, re.MULTILINE))
    if match:
        text = text[:match[-1].start()]
    
    # 3. Process lines: trailing whitespace and Identity filtering
    # 3. Process lines: trailing whitespace and Identity filtering
    lines = text.split("\n")
    processed_lines = []
    
    in_protected_block = False
    
    for line in lines:
        stripped_line = line.rstrip() 
        
        # Check for block markers (simplified check for @[dna])
        if line.startswith("@[dna]"):
            in_protected_block = True
            processed_lines.append(stripped_line) 
            continue
            
        # If in protected block, check if it ends? 
        # Actually, blocks end with new blocks or seals or physics separators?
        # The prompt says: "Modify scr1.py: replace line.rstrip() with logic that removes ONLY trailing spaces OUTSIDE @[dna] blocks."
        # And "The block @[dna] must be preserved byte-for-byte (except final \n)."
        
        # Let's improve the logic. We need to know state.
        # But SCR-1 strips seals FIRST. So we are iterating through the body.
        
        # The separator "🌊" usually ends blocks?
        # Let's assume a simpler state machine.
        
        # Re-eval: The user prompt says "Modify scr1.py: replace line.rstrip() with logic that removes ONLY trailing spaces OUTSIDE @[dna] blocks."
        
        if in_protected_block:
             # Check exit conditions
             if line.startswith("🔒:") or line.startswith("CHECKSUM:") or line.strip() == "🌊":
                 in_protected_block = False
                 # Fall through to normal processing? No, 🌊 is its own line.
             elif line.startswith("@["):
                 # New block starts, old one ends.
                 # Actually, if we hit @[py] or something, we are in a new block.
                 # But the instruction specifically mentioned @[dna].
                 # Let's assume generic @[tag] starts a block?
                 # But the prompt specifically said "OUTSIDE @[dna] blocks". 
                 # Maybe other blocks *should* be stripped?
                 # Let's be safe and protect all @[...] blocks?
                 # The user instruction was explicit about DNA.
                 pass
        
        if line.startswith("@[dna]"):
             in_protected_block = True
             processed_lines.append(stripped_line)
             continue
             
        # Detect end of block (empty line before new block? or just next marker?)
        # Standard sigma blocks are often separated by double newlines.
        # But here we just iterate lines.
        
        # We need a robust state machine if we want "byte-for-byte".
        # But splitting by "\n" already lost "byte-for-byte" if we had CRLF.
        # We already normalized to LF.
        
        if in_protected_block:
            # We keep the line as is, BUT we still normalized line endings effectively by split/join.
            # We just avoid rstrip().
            
            # Check for block exit?
            # If we see a new header-like thing?
            if line.startswith("🌊") or line.startswith("@[") or line.startswith("🔒:"):
                in_protected_block = False
                processed_lines.append(line.rstrip())
            else:
                processed_lines.append(line)
        else:
            # IDENTITY filtering
            if re.match(r"^(🧬IDENTITY:|IDENTITY:)", stripped_line.strip()):
                continue
            processed_lines.append(stripped_line)
        
    # 4. Join and ensure single final newline
    # Note: strip() might be too aggressive if leading/trailing empty lines are normative.
    # The standard says "remove trailing whitespace on each line".
    # And "Identity MUST NOT depend on... aesthetic markers".
    # But it also says "CanonicalBody = entire file excluding...".
    # Let's join and then handle the final newline.
    
    # Re-join
    result = "\n".join(processed_lines)
    
    # Ensure final newline exists and is exactly one '\n'
    # First, strip existing trailing newlines to be safe, then add one.
    result = result.rstrip("\n") + "\n"
    
    return result.encode("utf-8")

def get_node_hash(text: str) -> str:
    """Convenience for SHA-256 of canonical bytes."""
    return hashlib.sha256(canonicalize_sigma(text)).hexdigest()

def calculate_poi(intent_hash: str, code_hash: str) -> str:
    """PoI-1: Proof of Intent. SHA-256(IntentHash || CodeHash)."""
    return hashlib.sha256((intent_hash + code_hash).encode()).hexdigest()
