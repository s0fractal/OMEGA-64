"""
Quantum Layer - WaveVectorK Implementation
Klein bottle phase space with geodesic interference
V7.0 Proof of Concept
"""

import math
from dataclasses import dataclass
from typing import Tuple, Optional

# Import existing physics for compatibility
try:
    from physics import WaveVectorQ
except ImportError:
    # Fallback for standalone testing
    @dataclass
    class WaveVectorQ:
        phase: int
        amplitude: int
        entropy: int

@dataclass
class WaveVectorK:
    """
    Wave vector on Klein bottle surface.
    
    Coordinates:
        theta: Poloidal angle (0..2π) - Intent axis (Toroid A)
        phi: Toroidal angle (0..2π) - Truth axis (Toroid B)
        amplitude: Wave amplitude (0..65535)
        entropy: Entropy level (-32768..32767)
        omega_theta: Angular velocity on theta (optional)
        omega_phi: Angular velocity on phi (optional)
    """
    theta: float
    phi: float
    amplitude: int
    entropy: int
    omega_theta: float = 0.0
    omega_phi: float = 0.0
    
    def to_cartesian(self) -> Tuple[float, float, float]:
        """Convert to 3D Cartesian coordinates (for visualization)."""
        # Klein bottle parametric equations
        # Simplified version (immersed in R³)
        r = 2.0  # Major radius
        a = 1.0  # Minor radius
        
        x = (r + a * math.cos(self.theta)) * math.cos(self.phi)
        y = (r + a * math.cos(self.theta)) * math.sin(self.phi)
        z = a * math.sin(self.theta)
        
        return (x, y, z)

def q_to_k(wave_q: WaveVectorQ) -> WaveVectorK:
    """
    Convert WaveVectorQ (legacy) to WaveVectorK (quantum).
    
    Mapping:
        phase (0..65535) → phi (0..2π)
        entropy (-32768..32767) → theta (0..2π)
    """
    # Normalize phase to 0..2π
    phi = (wave_q.phase / 65536) * 2 * math.pi
    
    # Map entropy to theta
    # Positive entropy (+32..0) → upper half (0..π)
    # Negative entropy (0..-32) → lower half (π..2π)
    normalized_entropy = wave_q.entropy / 1024  # -32..+32
    theta = ((normalized_entropy + 32) / 64) * 2 * math.pi
    
    return WaveVectorK(
        theta=theta,
        phi=phi,
        amplitude=wave_q.amplitude,
        entropy=wave_q.entropy,
        omega_theta=0.0,
        omega_phi=0.0
    )

def k_to_q(wave_k: WaveVectorK) -> WaveVectorQ:
    """Convert WaveVectorK back to WaveVectorQ (for compatibility)."""
    # Denormalize phi to 0..65535
    phase = int((wave_k.phi / (2 * math.pi)) * 65536) % 65536
    
    # Keep amplitude and entropy as-is
    return WaveVectorQ(
        phase=phase,
        amplitude=wave_k.amplitude,
        entropy=wave_k.entropy
    )

def angular_distance(angle1: float, angle2: float) -> float:
    """
    Calculate shortest angular distance on circle.
    
    Accounts for wrapping (e.g., 0.1 and 6.2 are close).
    """
    diff = abs(angle1 - angle2)
    return min(diff, 2 * math.pi - diff)

def encode_angle(radians: float) -> int:
    """Convert 0..2π to 0..65535 (u16)."""
    normalized = radians % (2 * math.pi)
    return int((normalized / (2 * math.pi)) * 65536) & 0xFFFF

def decode_angle(value: int) -> float:
    """Convert 0..65535 to 0..2π."""
    return (value / 65536) * 2 * math.pi

def klein_geodesic_distance(
    p1: Tuple[float, float],
    p2: Tuple[float, float],
    check_flip: bool = True
) -> float:
    """
    Calculate geodesic distance on Klein bottle.
    
    Args:
        p1, p2: (theta, phi) coordinates
        check_flip: Account for Klein bottle identification
    
    Returns:
        Geodesic distance
    """
    theta1, phi1 = p1
    theta2, phi2 = p2
    
    # Direct distance
    d_theta = angular_distance(theta1, theta2)
    d_phi = angular_distance(phi1, phi2)
    
    # Metric coefficients (can be tuned)
    a, b = 1.0, 1.0
    direct_dist = math.sqrt(a * d_theta**2 + b * d_phi**2)
    
    if not check_flip:
        return direct_dist
    
    # Distance through Klein flip (throat at θ=π, φ=π)
    # When crossing BLACK_HEART, φ → φ + π (mod 2π)
    theta1_flip = (theta1 + math.pi) % (2 * math.pi)
    phi1_flip = (phi1 + math.pi) % (2 * math.pi)
    
    d_theta_flip = angular_distance(theta1_flip, theta2)
    d_phi_flip = angular_distance(phi1_flip, phi2)
    
    flip_dist = math.sqrt(a * d_theta_flip**2 + b * d_phi_flip**2)
    
    # Return shorter path (geodesic)
    return min(direct_dist, flip_dist)

def klein_interference(w1: WaveVectorK, w2: WaveVectorK) -> WaveVectorK:
    """
    Calculate interference on Klein bottle surface.
    
    Uses geodesic distance instead of 1D phase difference.
    This is the quantum layer upgrade!
    """
    # Calculate geodesic distance
    p1 = (w1.theta, w1.phi)
    p2 = (w2.theta, w2.phi)
    
    distance = klein_geodesic_distance(p1, p2, check_flip=True)
    
    # Amplitude factor (constructive/destructive interference)
    amp_factor = math.cos(distance)
    
    # Weighted average of amplitudes
    total_amp = w1.amplitude + w2.amplitude
    if total_amp > 0:
        weight1 = w1.amplitude / total_amp
        weight2 = w2.amplitude / total_amp
    else:
        weight1 = weight2 = 0.5
    
    # Result amplitude (with interference)
    result_amp = int((w1.amplitude + w2.amplitude * amp_factor) / 2)
    result_amp = max(0, min(65535, result_amp))  # Clamp
    
    # Weighted average of angles
    result_theta = (w1.theta * weight1 + w2.theta * weight2) % (2 * math.pi)
    result_phi = (w1.phi * weight1 + w2.phi * weight2) % (2 * math.pi)
    
    # Average entropy
    result_entropy = int((w1.entropy + w2.entropy) / 2)
    result_entropy = max(-32768, min(32767, result_entropy))  # Clamp
    
    # Velocity (if both have it)
    result_omega_theta = (w1.omega_theta + w2.omega_theta) / 2
    result_omega_phi = (w1.omega_phi + w2.omega_phi) / 2
    
    return WaveVectorK(
        theta=result_theta,
        phi=result_phi,
        amplitude=result_amp,
        entropy=result_entropy,
        omega_theta=result_omega_theta,
        omega_phi=result_omega_phi
    )

def is_at_black_heart(wave: WaveVectorK, threshold: float = 0.2) -> bool:
    """
    Check if wave is near BLACK_HEART (θ=π, φ=π).
    
    BLACK_HEART is at the throat of Klein bottle.
    """
    d_theta = angular_distance(wave.theta, math.pi)
    d_phi = angular_distance(wave.phi, math.pi)
    
    distance = math.sqrt(d_theta**2 + d_phi**2)
    return distance < threshold

def apply_klein_flip(wave: WaveVectorK) -> WaveVectorK:
    """
    Apply Klein bottle flip (inside → outside).
    
    At BLACK_HEART, the surface inverts.
    """
    return WaveVectorK(
        theta=(wave.theta + math.pi) % (2 * math.pi),
        phi=(wave.phi + math.pi) % (2 * math.pi),
        amplitude=wave.amplitude,
        entropy=wave.entropy,
        omega_theta=wave.omega_theta,
        omega_phi=wave.omega_phi
    )

# ============================================================================
# Testing & Examples
# ============================================================================

if __name__ == "__main__":
    print("🌀 Quantum Layer - WaveVectorK Test\n")
    
    # Test 1: Conversion Q → K
    print("Test 1: Q → K conversion")
    q1 = WaveVectorQ(phase=16384, amplitude=32768, entropy=0)
    k1 = q_to_k(q1)
    print(f"  Q: phase={q1.phase}, amp={q1.amplitude}, en={q1.entropy}")
    print(f"  K: θ={k1.theta:.2f}, φ={k1.phi:.2f}, amp={k1.amplitude}")
    
    # Test 2: Geodesic distance
    print("\nTest 2: Geodesic distance")
    k2 = WaveVectorK(theta=0.5, phi=1.0, amplitude=30000, entropy=-5000)
    dist = klein_geodesic_distance((k1.theta, k1.phi), (k2.theta, k2.phi))
    print(f"  Distance between k1 and k2: {dist:.3f}")
    
    # Test 3: Interference
    print("\nTest 3: Klein interference")
    k_result = klein_interference(k1, k2)
    print(f"  Result: θ={k_result.theta:.2f}, φ={k_result.phi:.2f}, amp={k_result.amplitude}")
    
    # Test 4: BLACK_HEART detection
    print("\nTest 4: BLACK_HEART detection")
    k_heart = WaveVectorK(theta=math.pi, phi=math.pi, amplitude=65535, entropy=-32768)
    is_heart = is_at_black_heart(k_heart)
    print(f"  At BLACK_HEART: {is_heart}")
    
    # Test 5: Klein flip
    print("\nTest 5: Klein flip")
    k_flipped = apply_klein_flip(k_heart)
    print(f"  Before: θ={k_heart.theta:.2f}, φ={k_heart.phi:.2f}")
    print(f"  After:  θ={k_flipped.theta:.2f}, φ={k_flipped.phi:.2f}")
    
    print("\n✅ All tests complete!")
