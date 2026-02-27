"""
Binary .qwave Codec
Deterministic serialization for quantum records
V7.1 - Binary Format
"""

import struct
import hashlib
import time
import math
from dataclasses import dataclass
from typing import List, Tuple

# Import WaveVectorK
try:
    from wave_vector_k import WaveVectorK
except ImportError:
    @dataclass
    class WaveVectorK:
        theta: float
        phi: float
        amplitude: int
        entropy: int
        omega_theta: float = 0.0
        omega_phi: float = 0.0

# Constants
MAGIC = b'QWAV'
VERSION = 0x0100  # 1.0
OMEGA_SCALE = (2 * math.pi) / 65536  # Quantization scale

# ============================================================================
# Conversion Functions
# ============================================================================

def encode_angle(radians: float) -> int:
    """Convert 0..2π to 0..65535 (u16)."""
    normalized = radians % (2 * math.pi)
    return int((normalized / (2 * math.pi)) * 65536) & 0xFFFF

def decode_angle(value: int) -> float:
    """Convert 0..65535 to 0..2π."""
    return (value / 65536) * 2 * math.pi

def encode_omega(omega: float) -> int:
    """Convert angular velocity to i16."""
    quantized = int(omega / OMEGA_SCALE)
    return max(-32768, min(32767, quantized))

def decode_omega(value: int) -> float:
    """Convert i16 to angular velocity."""
    return value * OMEGA_SCALE

def encode_weight(weight: float) -> int:
    """Convert probability (0..1) to u16."""
    return int(weight * 65535) & 0xFFFF

def decode_weight(value: int) -> float:
    """Convert u16 to probability (0..1)."""
    return value / 65535

# ============================================================================
# Binary Encoding
# ============================================================================

def encode_wave_vector_k(wave: WaveVectorK) -> bytes:
    """
    Encode WaveVectorK to 16 bytes.
    
    Layout:
      0-1:   theta (u16)
      2-3:   phi (u16)
      4-5:   amplitude (u16)
      6-7:   entropy (i16)
      8-9:   omega_theta (i16)
      10-11: omega_phi (i16)
      12-15: reserved (u32)
    """
    return struct.pack(
        '<HHHhhhI',  # Little-endian
        encode_angle(wave.theta),
        encode_angle(wave.phi),
        wave.amplitude,
        wave.entropy,
        encode_omega(wave.omega_theta),
        encode_omega(wave.omega_phi),
        0  # reserved
    )

def decode_wave_vector_k(data: bytes) -> WaveVectorK:
    """Decode 16 bytes to WaveVectorK."""
    theta_u16, phi_u16, amplitude, entropy, omega_theta_i16, omega_phi_i16, _ = struct.unpack(
        '<HHHhhhI', data
    )
    
    return WaveVectorK(
        theta=decode_angle(theta_u16),
        phi=decode_angle(phi_u16),
        amplitude=amplitude,
        entropy=entropy,
        omega_theta=decode_omega(omega_theta_i16),
        omega_phi=decode_omega(omega_phi_i16)
    )

def encode_trajectory_point(theta: float, phi: float, weight: float) -> bytes:
    """
    Encode trajectory point to 10 bytes.
    
    Layout:
      0-1: theta (u16)
      2-3: phi (u16)
      4-5: weight (u16)
      6-9: reserved (u32)
    """
    return struct.pack(
        '<HHHI',
        encode_angle(theta),
        encode_angle(phi),
        encode_weight(weight),
        0  # reserved
    )

def decode_trajectory_point(data: bytes) -> Tuple[float, float, float]:
    """Decode 10 bytes to (theta, phi, weight)."""
    theta_u16, phi_u16, weight_u16, _ = struct.unpack('<HHHI', data)
    
    return (
        decode_angle(theta_u16),
        decode_angle(phi_u16),
        decode_weight(weight_u16)
    )

# ============================================================================
# .qwave File Format
# ============================================================================

def encode_qwave(
    glyph_id: str,
    wave: WaveVectorK,
    trajectories: List[Tuple[float, float, float]] = None,
    block_height: int = 0,
    flags: int = 0
) -> bytes:
    """
    Encode complete .qwave file.
    
    Args:
        glyph_id: Glyph identifier
        wave: Current wave state
        trajectories: List of (theta, phi, weight) tuples
        block_height: Bitcoin block anchor
        flags: Feature flags
    
    Returns:
        Binary .qwave file content
    """
    if trajectories is None:
        trajectories = []
    
    # Header (32 bytes)
    glyph_hash = hashlib.sha256(glyph_id.encode()).digest()[:8]
    timestamp = int(time.time())
    
    header = struct.pack(
        '<4sHHQQQ',
        MAGIC,
        VERSION,
        flags,
        int.from_bytes(glyph_hash, 'little'),
        block_height,
        timestamp
    )
    
    # WaveVectorK (16 bytes)
    wave_data = encode_wave_vector_k(wave)
    
    # Trajectory ensemble (2 + N*10 bytes)
    count = len(trajectories)
    ensemble = struct.pack('<H', count)
    
    for theta, phi, weight in trajectories:
        ensemble += encode_trajectory_point(theta, phi, weight)
    
    # Body (everything except checksum)
    body = header + wave_data + ensemble
    
    # Footer: SHA-256 checksum (32 bytes)
    checksum = hashlib.sha256(body).digest()
    
    return body + checksum

def decode_qwave(data: bytes) -> dict:
    """
    Decode .qwave file.
    
    Returns:
        {
            'glyph_id_hash': bytes,
            'block_height': int,
            'timestamp': int,
            'wave': WaveVectorK,
            'trajectories': List[Tuple[float, float, float]],
            'checksum_valid': bool
        }
    """
    # Verify minimum size
    if len(data) < 82:
        raise ValueError(f"Invalid .qwave file: too small ({len(data)} bytes)")
    
    # Split body and checksum
    body = data[:-32]
    checksum = data[-32:]
    
    # Verify checksum
    expected_checksum = hashlib.sha256(body).digest()
    checksum_valid = (checksum == expected_checksum)
    
    # Parse header (32 bytes)
    magic, version, flags, glyph_hash_int, block_height, timestamp = struct.unpack(
        '<4sHHQQQ', body[:32]
    )
    
    if magic != MAGIC:
        raise ValueError(f"Invalid magic: {magic}")
    
    if version != VERSION:
        raise ValueError(f"Unsupported version: {version:#x}")
    
    glyph_hash = glyph_hash_int.to_bytes(8, 'little')
    
    # Parse WaveVectorK (16 bytes)
    wave = decode_wave_vector_k(body[32:48])
    
    # Parse trajectory ensemble
    count = struct.unpack('<H', body[48:50])[0]
    
    trajectories = []
    offset = 50
    for i in range(count):
        traj_data = body[offset:offset+10]
        trajectories.append(decode_trajectory_point(traj_data))
        offset += 10
    
    return {
        'glyph_id_hash': glyph_hash,
        'block_height': block_height,
        'timestamp': timestamp,
        'wave': wave,
        'trajectories': trajectories,
        'checksum_valid': checksum_valid
    }

# ============================================================================
# Testing
# ============================================================================

if __name__ == "__main__":
    print("🌀 Binary .qwave Codec Test\n")
    
    # Test 1: Encode/Decode WaveVectorK
    print("Test 1: WaveVectorK encoding")
    
    wave = WaveVectorK(
        theta=math.pi / 2,
        phi=math.pi / 4,
        amplitude=32768,
        entropy=0,
        omega_theta=0.1,
        omega_phi=0.05
    )
    
    wave_bytes = encode_wave_vector_k(wave)
    print(f"  Encoded: {len(wave_bytes)} bytes")
    print(f"  Hex: {wave_bytes.hex()}")
    
    wave_decoded = decode_wave_vector_k(wave_bytes)
    print(f"  Decoded: θ={wave_decoded.theta:.4f}, φ={wave_decoded.phi:.4f}")
    
    # Test 2: Complete .qwave file
    print("\nTest 2: Complete .qwave file")
    
    trajectories = [
        (1.5, 0.7, 0.5),
        (1.6, 0.8, 0.3),
        (1.4, 0.75, 0.2),
    ]
    
    qwave_data = encode_qwave(
        glyph_id="TEST_GLYPH",
        wave=wave,
        trajectories=trajectories,
        block_height=824560
    )
    
    print(f"  Total size: {len(qwave_data)} bytes")
    print(f"  Header: 32 bytes")
    print(f"  Wave: 16 bytes")
    print(f"  Ensemble: {2 + len(trajectories) * 10} bytes")
    print(f"  Checksum: 32 bytes")
    
    # Test 3: Decode and verify
    print("\nTest 3: Decode and verify")
    
    decoded = decode_qwave(qwave_data)
    print(f"  Checksum valid: {decoded['checksum_valid']}")
    print(f"  Block height: {decoded['block_height']}")
    print(f"  Wave: θ={decoded['wave'].theta:.4f}, φ={decoded['wave'].phi:.4f}")
    print(f"  Trajectories: {len(decoded['trajectories'])}")
    
    # Test 4: Determinism
    print("\nTest 4: Determinism check")
    
    qwave_data2 = encode_qwave(
        glyph_id="TEST_GLYPH",
        wave=wave,
        trajectories=trajectories,
        block_height=824560
    )
    
    # Note: timestamps will differ, so compare without header
    deterministic = (qwave_data[32:-32] == qwave_data2[32:-32])
    print(f"  Deterministic (excluding timestamp): {deterministic}")
    
    print("\n✅ All tests complete!")
