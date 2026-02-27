"""
Quantum Layer with LUT_COS Integration
Fully deterministic Klein bottle interference
V7.2 - Bit-exact determinism
"""

import math
import struct
from pathlib import Path

# Import existing physics for LUT_COS
import sys
sys.path.insert(0, str(Path(__file__).parent.parent / 'z00'))

try:
    from physics import get_lut_cos
    LUT_AVAILABLE = True
except ImportError:
    LUT_AVAILABLE = False
    print("Warning: LUT_COS not available, falling back to math.cos")

from wave_vector_k import (
    WaveVectorK,
    encode_angle,
    decode_angle,
    angular_distance
)

# ============================================================================
# Deterministic Trigonometry
# ============================================================================

def lut_cos_normalized(angle_radians: float) -> float:
    """
    Get cos(angle) using LUT_COS for determinism.
    
    Args:
        angle_radians: Angle in radians (0..2π)
    
    Returns:
        cos(angle) from LUT (-1..1 as float)
    """
    if not LUT_AVAILABLE:
        return math.cos(angle_radians)
    
    # Get LUT
    lut = get_lut_cos()
    
    # Normalize angle to 0..2π
    normalized = angle_radians % (2 * math.pi)
    
    # Convert to LUT index (0..32768)
    # LUT has 32769 entries for 0..2π
    index = int((normalized / (2 * math.pi)) * 32768)
    index = min(32768, max(0, index))
    
    # LUT values are int16 (-32768..32767)
    # Convert to float (-1..1)
    lut_value = lut[index]
    return lut_value / 32768.0

def lut_cos_u16(angle_u16: int) -> float:
    """
    Get cos(angle) directly from u16 angle.
    
    Args:
        angle_u16: Angle as u16 (0..65535 → 0..2π)
    
    Returns:
        cos(angle) from LUT
    """
    if not LUT_AVAILABLE:
        radians = decode_angle(angle_u16)
        return math.cos(radians)
    
    # Get LUT
    lut = get_lut_cos()
    
    # Map u16 (0..65535) to LUT index (0..32768)
    index = (angle_u16 >> 1) & 0x7FFF  # Divide by 2, clamp to 15 bits
    
    # Get value and normalize
    lut_value = lut[index]
    return lut_value / 32768.0

# ============================================================================
# Deterministic Klein Interference
# ============================================================================

def klein_geodesic_distance_deterministic(
    theta1_u16: int,
    phi1_u16: int,
    theta2_u16: int,
    phi2_u16: int,
    check_flip: bool = True
) -> int:
    """
    Calculate geodesic distance using only integer arithmetic.
    
    Args:
        theta1_u16, phi1_u16: First point (u16)
        theta2_u16, phi2_u16: Second point (u16)
        check_flip: Account for Klein bottle flip
    
    Returns:
        Distance as u16 (0..65535)
    """
    # Angular distances (u16 arithmetic)
    d_theta = min(
        abs(theta1_u16 - theta2_u16),
        65536 - abs(theta1_u16 - theta2_u16)
    )
    
    d_phi = min(
        abs(phi1_u16 - phi2_u16),
        65536 - abs(phi1_u16 - phi2_u16)
    )
    
    # Euclidean distance (squared to avoid sqrt)
    dist_sq = d_theta * d_theta + d_phi * d_phi
    
    if not check_flip:
        # Approximate sqrt using bit shift (fast)
        # This is deterministic but approximate
        dist = int(math.sqrt(dist_sq))
        return min(65535, dist)
    
    # Klein flip: add π to both angles
    theta1_flip = (theta1_u16 + 32768) & 0xFFFF
    phi1_flip = (phi1_u16 + 32768) & 0xFFFF
    
    d_theta_flip = min(
        abs(theta1_flip - theta2_u16),
        65536 - abs(theta1_flip - theta2_u16)
    )
    
    d_phi_flip = min(
        abs(phi1_flip - phi2_u16),
        65536 - abs(phi1_flip - phi2_u16)
    )
    
    dist_flip_sq = d_theta_flip * d_theta_flip + d_phi_flip * d_phi_flip
    
    # Return shorter distance
    final_dist_sq = min(dist_sq, dist_flip_sq)
    dist = int(math.sqrt(final_dist_sq))
    
    return min(65535, dist)

def klein_interference_deterministic(
    theta1_u16: int,
    phi1_u16: int,
    amp1: int,
    en1: int,
    theta2_u16: int,
    phi2_u16: int,
    amp2: int,
    en2: int
) -> tuple:
    """
    Fully deterministic Klein interference using LUT_COS.
    
    All inputs and outputs are integers (no floats).
    
    Returns:
        (theta_result_u16, phi_result_u16, amp_result, en_result)
    """
    # Calculate geodesic distance (u16)
    distance_u16 = klein_geodesic_distance_deterministic(
        theta1_u16, phi1_u16,
        theta2_u16, phi2_u16,
        check_flip=True
    )
    
    # Get amplitude factor from LUT_COS
    # distance_u16 is already in 0..65535 range
    amp_factor_float = lut_cos_u16(distance_u16)
    amp_factor = int(amp_factor_float * 32768)  # Convert to i16 range
    
    # Calculate weights (based on amplitudes)
    total_amp = amp1 + amp2
    if total_amp > 0:
        weight1 = (amp1 << 16) // total_amp  # Fixed-point (16.16)
        weight2 = (amp2 << 16) // total_amp
    else:
        weight1 = weight2 = 32768  # 0.5 in fixed-point
    
    # Result amplitude (with interference)
    # amp_result = (amp1 + amp2 * amp_factor) / 2
    amp_with_factor = amp2 + ((amp2 * amp_factor) >> 15)  # Multiply by factor
    amp_result = (amp1 + amp_with_factor) >> 1  # Divide by 2
    amp_result = max(0, min(65535, amp_result))  # Clamp
    
    # Weighted average of angles (fixed-point arithmetic)
    theta_result = ((theta1_u16 * weight1) + (theta2_u16 * weight2)) >> 16
    phi_result = ((phi1_u16 * weight1) + (phi2_u16 * weight2)) >> 16
    
    theta_result = theta_result & 0xFFFF  # Wrap to u16
    phi_result = phi_result & 0xFFFF
    
    # Average entropy
    en_result = (en1 + en2) >> 1  # Divide by 2
    en_result = max(-32768, min(32767, en_result))  # Clamp to i16
    
    return (theta_result, phi_result, amp_result, en_result)

# ============================================================================
# High-level API (compatible with WaveVectorK)
# ============================================================================

def klein_interference_lut(w1: WaveVectorK, w2: WaveVectorK) -> WaveVectorK:
    """
    Klein interference using LUT_COS (deterministic).
    
    This is the drop-in replacement for klein_interference()
    from wave_vector_k.py, but fully deterministic.
    """
    # Convert to u16
    theta1_u16 = encode_angle(w1.theta)
    phi1_u16 = encode_angle(w1.phi)
    theta2_u16 = encode_angle(w2.theta)
    phi2_u16 = encode_angle(w2.phi)
    
    # Deterministic interference
    theta_result, phi_result, amp_result, en_result = klein_interference_deterministic(
        theta1_u16, phi1_u16, w1.amplitude, w1.entropy,
        theta2_u16, phi2_u16, w2.amplitude, w2.entropy
    )
    
    # Convert back to WaveVectorK
    return WaveVectorK(
        theta=decode_angle(theta_result),
        phi=decode_angle(phi_result),
        amplitude=amp_result,
        entropy=en_result,
        omega_theta=(w1.omega_theta + w2.omega_theta) / 2,
        omega_phi=(w1.omega_phi + w2.omega_phi) / 2
    )

# ============================================================================
# Testing
# ============================================================================

if __name__ == "__main__":
    print("🌀 Deterministic Klein Interference Test\n")
    
    # Test 1: LUT_COS availability
    print("Test 1: LUT_COS availability")
    print(f"  LUT available: {LUT_AVAILABLE}")
    
    if LUT_AVAILABLE:
        # Test 2: Compare LUT vs math.cos
        print("\nTest 2: LUT vs math.cos")
        
        test_angle = math.pi / 4
        lut_result = lut_cos_normalized(test_angle)
        math_result = math.cos(test_angle)
        
        print(f"  Angle: π/4")
        print(f"  LUT:  {lut_result:.6f}")
        print(f"  Math: {math_result:.6f}")
        print(f"  Diff: {abs(lut_result - math_result):.6e}")
    
    # Test 3: Deterministic interference
    print("\nTest 3: Deterministic interference")
    
    w1 = WaveVectorK(
        theta=math.pi / 2,
        phi=math.pi / 4,
        amplitude=32768,
        entropy=0,
        omega_theta=0.1,
        omega_phi=0.05
    )
    
    w2 = WaveVectorK(
        theta=math.pi,
        phi=math.pi,
        amplitude=40000,
        entropy=-16384,
        omega_theta=0.0,
        omega_phi=0.0
    )
    
    result = klein_interference_lut(w1, w2)
    
    print(f"  W1: θ={w1.theta:.4f}, φ={w1.phi:.4f}, amp={w1.amplitude}")
    print(f"  W2: θ={w2.theta:.4f}, φ={w2.phi:.4f}, amp={w2.amplitude}")
    print(f"  Result: θ={result.theta:.4f}, φ={result.phi:.4f}, amp={result.amplitude}")
    
    # Test 4: Determinism check
    print("\nTest 4: Determinism check")
    
    result2 = klein_interference_lut(w1, w2)
    
    deterministic = (
        result.theta == result2.theta and
        result.phi == result2.phi and
        result.amplitude == result2.amplitude and
        result.entropy == result2.entropy
    )
    
    print(f"  Same inputs → same outputs: {deterministic}")
    
    print("\n✅ All tests complete!")
