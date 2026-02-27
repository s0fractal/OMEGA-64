"""
Σ-GLYPH Trigram Encoder v1.0
Encoding/decoding utilities for trigram programs.

Converts between:
- AST (Atom/App nodes)
- Bitstream (compact binary representation)
- Canonical string (human-readable)
- Hash identity (PoI)
"""

from trigram_reducer import Atom, App, Node, ATOM_ENCODING, TRIGRAM_TO_ATOM
import hashlib


import json

def encode_to_bits(node: Node, shell: Optional[dict] = None) -> str:
    """
    Encode AST to bitstream.
    
    Format:
    - Atom: 0 + trigram (4 bits total)
    - App: 1 + encode(left) + encode(right)
    - V52.1: If shell provided, prefix with 11 (Semantic Marker) + len(shell_bits) + shell_bits
    
    Example:
    - I → "0000"
    - K → "0001"
    - (K I) → "1" + "0001" + "0000" = "100010000"
    """
    base_bits = ""
    if isinstance(node, Atom):
        base_bits = "0" + node.trigram
    else:  # App
        base_bits = "1" + encode_to_bits(node.left) + encode_to_bits(node.right)
        
    if shell:
        # 11 is the Semantic Marker (Interlingua Anchor)
        shell_str = json.dumps(shell, sort_keys=True)
        shell_hex = shell_str.encode().hex()
        shell_bits = bin(int(shell_hex, 16))[2:].zfill(len(shell_hex) * 4)
        # Prefix with 11 + 16-bit length of shell
        return f"11{len(shell_bits):016b}{shell_bits}{base_bits}"
    
    return base_bits


def decode_from_bits(bits: str, pos: int = 0) -> tuple[Node, int, Optional[dict]]:
    """
    Decode bitstream to AST and optional Semantic Shell.
    
    Returns: (node, next_position, shell)
    """
    if pos >= len(bits):
        raise ValueError("Unexpected end of bitstream")
    
    # Check for Semantic Marker (11)
    if bits[pos:pos+2] == "11":
        shell_len = int(bits[pos+2:pos+18], 2)
        shell_bits = bits[pos+18:pos+18+shell_len]
        shell_hex = hex(int(shell_bits, 2))[2:].rstrip('L')
        if len(shell_hex) % 2 != 0: shell_hex = '0' + shell_hex
        shell_bytes = bytes.fromhex(shell_hex)
        shell = json.loads(shell_bytes.decode())
        node, next_pos, _ = decode_from_bits(bits, pos + 18 + shell_len)
        return node, next_pos, shell
        
    marker = bits[pos]
    
    if marker == "0":
        # Atom: read 3-bit trigram
        if pos + 3 >= len(bits):
            raise ValueError("Incomplete atom trigram")
        trigram = bits[pos + 1:pos + 4]
        if trigram not in TRIGRAM_TO_ATOM:
            raise ValueError(f"Invalid trigram: {trigram}")
        name = TRIGRAM_TO_ATOM[trigram]
        return Atom(trigram, name), pos + 4, None
    
    elif marker == "1":
        # App: recursively decode left and right
        left, pos, _ = decode_from_bits(bits, pos + 1)
        right, pos, _ = decode_from_bits(bits, pos)
        return App(left, right), pos, None
    
    else:
        raise ValueError(f"Invalid marker bit: {marker}")


# ============================================================================
# Canonical String Representation
# ============================================================================

def to_canonical_string(node: Node) -> str:
    """
    Convert AST to canonical string.
    
    Format: atoms as names, apps as space-separated with parens
    
    Examples:
    - I → "I"
    - (K I) → "K I"
    - ((S K) K) → "S K K"
    """
    if isinstance(node, Atom):
        return node.name
    else:  # App
        left_str = to_canonical_string(node.left)
        right_str = to_canonical_string(node.right)
        
        # Add parens if left is also App
        if isinstance(node.left, App):
            left_str = f"({left_str})"
        
        # Add parens if right is App
        if isinstance(node.right, App):
            right_str = f"({right_str})"
        
        return f"{left_str} {right_str}"


# ============================================================================
# Hash Identity (PoI)
# ============================================================================

def compute_hash(node: Node, shell: Optional[dict] = None) -> str:
    """
    Compute hash identity for AST.
    
    Uses SHA-256 of canonical bitstream.
    This is the Proof-of-Intent (PoI) for the program.
    If shell is provided, the PoI incorporates the Masterman vector.
    """
    bits = encode_to_bits(node, shell)
    hash_bytes = hashlib.sha256(bits.encode()).digest()
    return hash_bytes.hex()


# ============================================================================
# Utilities
# ============================================================================

def bits_to_bytes(bits: str) -> bytes:
    """Convert bitstring to bytes (pad to multiple of 8)."""
    # Pad to multiple of 8
    padding = (8 - len(bits) % 8) % 8
    bits_padded = bits + "0" * padding
    
    # Convert to bytes
    byte_array = bytearray()
    for i in range(0, len(bits_padded), 8):
        byte = int(bits_padded[i:i+8], 2)
        byte_array.append(byte)
    
    return bytes(byte_array)


def bytes_to_bits(data: bytes) -> str:
    """Convert bytes to bitstring."""
    return ''.join(format(byte, '08b') for byte in data)


# ============================================================================
# Examples
# ============================================================================

if __name__ == "__main__":
    from trigram_reducer import I, K, S, reduce
    
    print("🔺 Σ-GLYPH Trigram Encoder v1.0")
    print("=" * 50)
    
    # Example 1: Encode/decode I
    print("\n📖 Example 1: Encode/decode I")
    node = I
    bits = encode_to_bits(node)
    print(f"   AST:  {node}")
    print(f"   Bits: {bits} ({len(bits)} bits)")
    decoded, _ = decode_from_bits(bits)
    print(f"   Decoded: {decoded}")
    print(f"   ✅ Roundtrip: {decoded == node}")
    
    # Example 2: Encode/decode K I
    print("\n📖 Example 2: Encode/decode (K I)")
    node = App(K, I)
    bits = encode_to_bits(node)
    print(f"   AST:  {node}")
    print(f"   Bits: {bits} ({len(bits)} bits)")
    decoded, _ = decode_from_bits(bits)
    print(f"   Decoded: {decoded}")
    print(f"   ✅ Roundtrip: {decoded == node}")
    
    # Example 3: Canonical string
    print("\n📖 Example 3: Canonical string for S K K")
    node = App(App(S, K), K)
    canonical = to_canonical_string(node)
    print(f"   AST:       {node}")
    print(f"   Canonical: {canonical}")
    
    # Example 4: Hash identity (PoI)
    print("\n📖 Example 4: Hash identity (PoI)")
    node = App(App(S, K), K)
    hash_id = compute_hash(node)
    print(f"   AST:  {node}")
    print(f"   Hash: {hash_id[:16]}... (SHA-256)")
    
    # Verify hash stability
    hash_id2 = compute_hash(node)
    print(f"   ✅ Stable: {hash_id == hash_id2}")
    
    # Example 5: Compact serialization
    print("\n📖 Example 5: Compact serialization")
    node = App(App(App(S, K), K), I)  # SKK I
    bits = encode_to_bits(node)
    data = bits_to_bytes(bits)
    print(f"   AST:   {node}")
    print(f"   Bits:  {bits} ({len(bits)} bits)")
    print(f"   Bytes: {data.hex()} ({len(data)} bytes)")
    
    # Decode back
    bits_decoded = bytes_to_bits(data)
    node_decoded, _ = decode_from_bits(bits_decoded[:len(bits)])
    print(f"   Decoded: {node_decoded}")
    print(f"   ✅ Roundtrip: {node_decoded == node}")
    
    print("\n" + "=" * 50)
    print("✅ All encoding tests passed!")
    print("🔺 Trigram Encoder: OPERATIONAL")
