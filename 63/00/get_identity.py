import re
import hashlib
from typing import Optional

def get_identity(text: str, glyph_name: str, hardware_id: Optional[str] = None) -> bytes:
    # V48.0: Support Cosmit Hybrid Identity
    cosmit_match = re.search(r"🧬COSMIT:\s*([a-fA-F0-9]{64})", text)
    if cosmit_match:
        base_id = bytes.fromhex(cosmit_match.group(1))
        # Hybrids are inherently bound to resonance freq
        return hashlib.sha256(base_id + b":HYBRID:16384").digest()

    id_match = re.search(r"🧬IDENTITY:\s*([a-fA-F0-9]{64})", text)
    if id_match:
        base_id = bytes.fromhex(id_match.group(1))
        if hardware_id:
            # V46.0: Resonate with hardware
            return hashlib.sha256(base_id + hardware_id.encode()).digest()
        return base_id

    first_block_match = re.search(r"@\[\w+\]\n(.*?)\n(?=@\[|$)", text, re.DOTALL)
    content = first_block_match.group(1).strip() if first_block_match else glyph_name
    
    seed = content.encode("utf-8")
    if hardware_id:
        seed += hardware_id.encode()
        
    return hashlib.sha256(seed).digest()

# Σ-PoI: 0c8ca15da615017725adcb5c9b0bf2054b2f5a0230f010995228958a4a300cf2
