"""
Chromatic Birth - Visual Signature System
Extracts color, material, and archetype from glyph hash
"""

def hash_to_color(hash_hex: str) -> tuple:
    """Extract color from first nibble of hash."""
    first_nibble = int(hash_hex[0], 16)
    
    color_map = {
        (0x0, 0x1): ("Violet", "#9400D3", "m32"),
        (0x2, 0x3): ("Blue", "#0000FF", "m24"),
        (0x4, 0x5): ("Cyan", "#00FFFF", "m16"),
        (0x6, 0x7): ("Green", "#00FF00", "m08"),
        (0x8, 0x9): ("Gold", "#FFD700", "z00"),
        (0xA, 0xB): ("Yellow", "#F7931A", "p08"),
        (0xC, 0xD): ("Orange", "#FF8800", "p16"),
        (0xE, 0xF): ("Red", "#FF0000", "p32"),
    }
    
    for (low, high), (name, hex_color, layer) in color_map.items():
        if low <= first_nibble <= high:
            return name, hex_color, layer
    
    return "Unknown", "#FFFFFF", "z00"

def hash_to_material(hash_hex: str) -> tuple:
    """Extract material state from second nibble."""
    second_nibble = int(hash_hex[1], 16)
    
    if second_nibble < 0x4:
        return "Crystalline", "💎"
    elif second_nibble < 0x8:
        return "Metallic", "🔩"
    elif second_nibble < 0xC:
        return "Fluid", "💧"
    else:
        return "Plasma", "🔥"

def hash_to_archetype(hash_hex: str) -> tuple:
    """Extract archetypal symbol from bytes 2-3."""
    byte_value = int(hash_hex[2:4], 16)
    
    if byte_value < 0x40:
        return "Blue Heart", "💙"
    elif byte_value < 0x80:
        return "Red Crystal", "🔴💎"
    elif byte_value < 0xC0:
        return "Golden Membrane", "🟡⚪"
    else:
        return "Spiral", "🌀"

def is_shadow_phase(phase: int) -> bool:
    """Check if glyph is in shadow phase."""
    return phase >= 16384

def invert_color(color_name: str) -> str:
    """Invert color through Möbius flip."""
    inversion_map = {
        "Violet": "Red",      # m32 ↔ p32
        "Blue": "Orange",     # m24 ↔ p16
        "Cyan": "Yellow",     # m16 ↔ p08
        "Green": "Gold",      # m08 ↔ z00
        "Gold": "Green",      # z00 ↔ m08
        "Yellow": "Cyan",     # p08 ↔ m16
        "Orange": "Blue",     # p16 ↔ m24
        "Red": "Violet",      # p32 ↔ m32
    }
    return inversion_map.get(color_name, color_name)

def get_chromatic_signature(hash_hex: str, phase: int) -> dict:
    """
    Get complete chromatic birth signature for a glyph.
    
    Args:
        hash_hex: SHA-256 hash of glyph (hex string)
        phase: Phase value (0..65535)
    
    Returns:
        {
            'color': (name, hex, layer),
            'material': (name, emoji),
            'archetype': (name, emoji),
            'shadow': bool,
            'inverted_color': name or None
        }
    """
    color_name, color_hex, layer = hash_to_color(hash_hex)
    material_name, material_emoji = hash_to_material(hash_hex)
    archetype_name, archetype_emoji = hash_to_archetype(hash_hex)
    
    is_shadow = is_shadow_phase(phase)
    inverted = invert_color(color_name) if is_shadow else None
    
    return {
        'color': (color_name, color_hex, layer),
        'material': (material_name, material_emoji),
        'archetype': (archetype_name, archetype_emoji),
        'shadow': is_shadow,
        'inverted_color': inverted
    }

if __name__ == "__main__":
    # Example usage
    test_hash = "a7b3c2d1e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1"
    test_phase = 24576  # Shadow phase
    
    sig = get_chromatic_signature(test_hash, test_phase)
    
    print(f"🌈 Chromatic Signature:")
    print(f"  Color: {sig['color'][0]} ({sig['color'][1]}) - Layer {sig['color'][2]}")
    print(f"  Material: {sig['material'][0]} {sig['material'][1]}")
    print(f"  Archetype: {sig['archetype'][0]} {sig['archetype'][1]}")
    print(f"  Shadow Phase: {sig['shadow']}")
    if sig['inverted_color']:
        print(f"  Inverted to: {sig['inverted_color']}")
