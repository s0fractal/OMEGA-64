"""
Quantum Layer Demo - Complete Flow
MD → .qwave → .sigma (optional materialization)
V7.0 Proof of Concept
"""

import math
from pathlib import Path
from datetime import datetime

from wave_vector_k import (
    WaveVectorK, WaveVectorQ,
    q_to_k, k_to_q,
    klein_interference,
    klein_geodesic_distance,
    is_at_black_heart,
    apply_klein_flip
)

from quantum_record import (
    QuantumRecord,
    BlockAnchor,
    TrajectoryPoint
)

def demo_complete_flow():
    """
    Demonstrate complete quantum layer flow:
    1. Create intent (MD)
    2. Generate quantum record (.qwave)
    3. Interference with existing glyphs
    4. Optional collapse to .sigma
    """
    
    print("=" * 60)
    print("🌀 QUANTUM LAYER - Complete Flow Demo")
    print("=" * 60)
    
    # Step 1: Intent (simulated from MD)
    print("\n📝 Step 1: Intent Layer (MD)")
    print("-" * 60)
    
    intent_md = """
    # INTENT: Create Harmony Glyph
    
    - Layer: m16 (Cyan, Kinetic Logic)
    - Phase: Quarter rotation (+16384)
    - Purpose: Bridge chaos and order
    - Trajectory: Spiral toward BLACK_HEART
    """
    
    print(intent_md)
    
    # Step 2: Crystallize to quantum record
    print("\n🔮 Step 2: Crystallization (LLM → .qwave)")
    print("-" * 60)
    
    # Parse intent → coordinates
    coord = WaveVectorK(
        theta=math.pi / 2,  # m16 layer
        phi=math.pi / 2,    # Quarter rotation
        amplitude=40000,
        entropy=-16384,     # m16
        omega_theta=-0.1,   # Moving toward BLACK_HEART
        omega_phi=0.05
    )
    
    # Create trajectory ensemble (superposition)
    distribution = [
        TrajectoryPoint(theta=1.57, phi=1.57, weight=0.6),  # Most likely
        TrajectoryPoint(theta=1.50, phi=1.60, weight=0.3),  # Alternative 1
        TrajectoryPoint(theta=1.64, phi=1.54, weight=0.1),  # Alternative 2
    ]
    
    # Blockchain anchors
    anchors = [
        BlockAnchor(
            hash="000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f",
            height=0
        ),
    ]
    
    qrec = QuantumRecord(
        glyph_id="HARMONY",
        anchors=anchors,
        coord=coord,
        distribution=distribution,
        created_at=datetime.now().isoformat(),
        intent_source="intent/harmony.md"
    )
    
    print(f"  Glyph ID: {qrec.glyph_id}")
    print(f"  Coord: θ={qrec.coord.theta:.2f}, φ={qrec.coord.phi:.2f}")
    print(f"  Superposition: {len(qrec.distribution)} trajectories")
    
    # Save quantum record
    qwave_path = Path("HARMONY.qwave.json")
    qrec.save(qwave_path)
    print(f"  Saved: {qwave_path}")
    
    # Step 3: Interference with existing glyphs
    print("\n🌊 Step 3: Interference Check")
    print("-" * 60)
    
    # Simulate existing glyph (e.g., BLACK_HEART)
    existing = WaveVectorK(
        theta=math.pi,
        phi=math.pi,
        amplitude=65535,
        entropy=-32768,
        omega_theta=0.0,
        omega_phi=0.0
    )
    
    print(f"  Existing: BLACK_HEART at θ={existing.theta:.2f}, φ={existing.phi:.2f}")
    
    # Calculate interference
    result = klein_interference(qrec.coord, existing)
    
    print(f"  Result: θ={result.theta:.2f}, φ={result.phi:.2f}, amp={result.amplitude}")
    
    # Geodesic distance
    distance = klein_geodesic_distance(
        (qrec.coord.theta, qrec.coord.phi),
        (existing.theta, existing.phi),
        check_flip=True
    )
    
    print(f"  Geodesic distance: {distance:.3f}")
    
    # Check if near BLACK_HEART
    near_heart = is_at_black_heart(result)
    print(f"  Near BLACK_HEART: {near_heart}")
    
    # Step 4: Materialization decision
    print("\n💎 Step 4: Materialization Decision")
    print("-" * 60)
    
    should_materialize = qrec.should_materialize(impedance_threshold=0.5)
    
    print(f"  Should materialize: {should_materialize}")
    
    if should_materialize:
        # Collapse quantum state
        collapsed = qrec.collapse()
        print(f"  Collapsed: θ={collapsed.theta:.2f}, φ={collapsed.phi:.2f}")
        
        # Convert back to Q for .sigma generation
        wave_q = k_to_q(collapsed)
        print(f"  WaveVectorQ: phase={wave_q.phase}, amp={wave_q.amplitude}, en={wave_q.entropy}")
        
        print("\n  ✅ Ready to generate .sigma file")
        print("     (Would call materializer.py here)")
    else:
        print("\n  🌀 Keeping in quantum superposition")
        print("     (No .sigma materialization needed)")
    
    # Step 5: Summary
    print("\n" + "=" * 60)
    print("📊 Summary")
    print("=" * 60)
    print(f"  Intent: {qrec.glyph_id}")
    print(f"  Quantum state: {qwave_path}")
    print(f"  Interference: Constructive (amp={result.amplitude})")
    print(f"  Materialized: {should_materialize}")
    print("\n✨ Quantum layer operational!")
    
    # Cleanup
    qwave_path.unlink()

if __name__ == "__main__":
    demo_complete_flow()
