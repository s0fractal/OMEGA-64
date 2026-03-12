import struct
import hashlib

TYPE_BLOB = 0x01
TYPE_NODE = 0x02
TYPE_EVENT = 0x03

def encode_packet(ptype: int, payload: bytes) -> bytes:
    length = len(payload)
    header = struct.pack(">BI", ptype, length)
    packet = header + payload
    checksum = hashlib.sha256(packet).digest()
    return packet + checksum

def decode_packet(data: bytes) -> tuple[int, bytes]:
    if len(data) < 5 + 32:
        raise ValueError("Packet too short")
    ptype, length = struct.unpack(">BI", data[:5])
    payload = data[5:5+length]
    expected_checksum = data[5+length:5+length+32]
    
    actual_checksum = hashlib.sha256(data[:5+length]).digest()
    if actual_checksum != expected_checksum:
        raise ValueError("Wire Corruption: Checksum mismatch")
    
    return ptype, payload

# Σ-PoI: 1c9b567c331fd4395c67cd0786d17ce2773b0e8f824b97dabc07d403306fdb5d
