"""
Σ-GLYPH LUT Codec
Canonical binary encoding for lookup tables
V2.4.0 - LUT Authority
"""

import struct
import hashlib
import json
from pathlib import Path


def json_to_canonical_blob(json_path: Path) -> tuple[bytes, str]:
    """
    Convert LUT JSON to canonical binary blob.
    
    Encoding: int16 big-endian (>h) concatenation
    Hash: SHA-256 of raw bytes
    
    Returns:
        (blob_bytes, sha256_hex)
    """
    with open(json_path, 'r') as f:
        data = json.load(f)
    
    lut_values = data['values']
    N = len(lut_values)
    
    # Encode as int16 big-endian
    payload = b''.join(struct.pack('>h', val) for val in lut_values)
    
    # Compute SHA-256
    blob_hash = hashlib.sha256(payload).hexdigest()
    
    return payload, blob_hash


def blob_to_lut(blob_bytes: bytes) -> list[int]:
    """
    Decode canonical blob to LUT array.
    
    Args:
        blob_bytes: Raw binary blob (int16 big-endian)
    
    Returns:
        List of int16 values
    """
    if len(blob_bytes) % 2 != 0:
        raise ValueError(f"Invalid blob size: {len(blob_bytes)} (must be even)")
    
    N = len(blob_bytes) // 2
    lut = [struct.unpack('>h', blob_bytes[i*2:(i+1)*2])[0] for i in range(N)]
    
    return lut


def verify_lut_blob(blob_bytes: bytes, expected_hash: str) -> bool:
    """
    Verify LUT blob integrity.
    
    Args:
        blob_bytes: Raw binary blob
        expected_hash: Expected SHA-256 hex string
    
    Returns:
        True if hash matches, False otherwise
    """
    actual_hash = hashlib.sha256(blob_bytes).hexdigest()
    return actual_hash == expected_hash


# Canonical LUT_COS hash for v2.4.0
LUT_COS_HASH = "c16701c44851da342f5d1f977ba5284e66dde3abd2c6740b979e39ac1d4d38b2"
LUT_COS_SIZE = 32769
