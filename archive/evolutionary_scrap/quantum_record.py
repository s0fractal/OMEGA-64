"""
Quantum Record Format (.qwave)
Stores wave trajectories without collapsing to .sigma
V7.0 Proof of Concept
"""

import json
from dataclasses import dataclass, asdict
from typing import List, Dict, Optional
from pathlib import Path

try:
    from wave_vector_k import WaveVectorK
except ImportError:
    # Fallback
    @dataclass
    class WaveVectorK:
        theta: float
        phi: float
        amplitude: int
        entropy: int
        omega_theta: float = 0.0
        omega_phi: float = 0.0

@dataclass
class BlockAnchor:
    """Bitcoin block anchor for temporal coordinate."""
    hash: str
    height: int

@dataclass
class TrajectoryPoint:
    """Single point in trajectory ensemble."""
    theta: float
    phi: float
    weight: float  # Probability weight (0..1)

@dataclass
class QuantumRecord:
    """
    Quantum wave record - superposition of trajectories.
    
    This is the "non-collapsed" state before materialization.
    """
    # Identity
    glyph_id: str
    
    # Temporal anchors
    anchors: List[BlockAnchor]
    
    # Current state (most likely)
    coord: WaveVectorK
    
    # Trajectory ensemble (superposition)
    distribution: List[TrajectoryPoint]
    
    # Metadata
    created_at: Optional[str] = None
    intent_source: Optional[str] = None  # MD file that generated this
    
    def to_dict(self) -> Dict:
        """Convert to dictionary for serialization."""
        return {
            'glyph_id': self.glyph_id,
            'anchors': [
                {'hash': a.hash, 'height': a.height}
                for a in self.anchors
            ],
            'coord': {
                'theta': self.coord.theta,
                'phi': self.coord.phi,
                'amplitude': self.coord.amplitude,
                'entropy': self.coord.entropy,
                'omega_theta': self.coord.omega_theta,
                'omega_phi': self.coord.omega_phi,
            },
            'distribution': [
                {'theta': p.theta, 'phi': p.phi, 'weight': p.weight}
                for p in self.distribution
            ],
            'created_at': self.created_at,
            'intent_source': self.intent_source,
        }
    
    @classmethod
    def from_dict(cls, data: Dict) -> 'QuantumRecord':
        """Load from dictionary."""
        anchors = [
            BlockAnchor(hash=a['hash'], height=a['height'])
            for a in data['anchors']
        ]
        
        coord_data = data['coord']
        coord = WaveVectorK(
            theta=coord_data['theta'],
            phi=coord_data['phi'],
            amplitude=coord_data['amplitude'],
            entropy=coord_data['entropy'],
            omega_theta=coord_data.get('omega_theta', 0.0),
            omega_phi=coord_data.get('omega_phi', 0.0),
        )
        
        distribution = [
            TrajectoryPoint(theta=p['theta'], phi=p['phi'], weight=p['weight'])
            for p in data['distribution']
        ]
        
        return cls(
            glyph_id=data['glyph_id'],
            anchors=anchors,
            coord=coord,
            distribution=distribution,
            created_at=data.get('created_at'),
            intent_source=data.get('intent_source'),
        )
    
    def save(self, path: Path):
        """Save quantum record to JSON file."""
        data = self.to_dict()
        
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2)
    
    @classmethod
    def load(cls, path: Path) -> 'QuantumRecord':
        """Load quantum record from JSON file."""
        with open(path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        return cls.from_dict(data)
    
    def collapse(self) -> WaveVectorK:
        """
        Collapse quantum state to single trajectory.
        
        Uses weighted average of distribution.
        """
        if not self.distribution:
            return self.coord
        
        # Weighted average
        total_weight = sum(p.weight for p in self.distribution)
        
        theta = sum(p.theta * p.weight for p in self.distribution) / total_weight
        phi = sum(p.phi * p.weight for p in self.distribution) / total_weight
        
        return WaveVectorK(
            theta=theta,
            phi=phi,
            amplitude=self.coord.amplitude,
            entropy=self.coord.entropy,
            omega_theta=self.coord.omega_theta,
            omega_phi=self.coord.omega_phi,
        )
    
    def should_materialize(self, impedance_threshold: float = 0.1) -> bool:
        """
        Decide if quantum state should collapse to .sigma.
        
        Based on impedance (coherence) of distribution.
        """
        if not self.distribution:
            return True  # No superposition, materialize
        
        # Calculate variance (spread) of distribution
        collapsed = self.collapse()
        
        variance = 0.0
        for point in self.distribution:
            d_theta = abs(point.theta - collapsed.theta)
            d_phi = abs(point.phi - collapsed.phi)
            variance += (d_theta**2 + d_phi**2) * point.weight
        
        # Low variance = high coherence = should materialize
        return variance < impedance_threshold

# ============================================================================
# Testing & Examples
# ============================================================================

if __name__ == "__main__":
    import math
    from datetime import datetime
    
    print("🌊 Quantum Record Test\n")
    
    # Create quantum record
    print("Test 1: Create quantum record")
    
    anchors = [
        BlockAnchor(
            hash="000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f",
            height=0
        ),
        BlockAnchor(
            hash="00000000839a8e6886ab5951d76f411475428afc90947ee320161bbf18eb6048",
            height=1
        ),
    ]
    
    coord = WaveVectorK(
        theta=math.pi / 2,
        phi=math.pi / 4,
        amplitude=32768,
        entropy=0,
        omega_theta=0.1,
        omega_phi=0.2,
    )
    
    distribution = [
        TrajectoryPoint(theta=1.5, phi=0.7, weight=0.5),
        TrajectoryPoint(theta=1.6, phi=0.8, weight=0.3),
        TrajectoryPoint(theta=1.4, phi=0.75, weight=0.2),
    ]
    
    qrec = QuantumRecord(
        glyph_id="TEST_GLYPH",
        anchors=anchors,
        coord=coord,
        distribution=distribution,
        created_at=datetime.now().isoformat(),
        intent_source="experiments/test_intent.md",
    )
    
    print(f"  Created: {qrec.glyph_id}")
    print(f"  Anchors: {len(qrec.anchors)} blocks")
    print(f"  Distribution: {len(qrec.distribution)} trajectories")
    
    # Test 2: Save/Load
    print("\nTest 2: Save/Load")
    
    test_path = Path("test_quantum.json")
    qrec.save(test_path)
    print(f"  Saved to: {test_path}")
    
    qrec_loaded = QuantumRecord.load(test_path)
    print(f"  Loaded: {qrec_loaded.glyph_id}")
    print(f"  Coord: θ={qrec_loaded.coord.theta:.2f}, φ={qrec_loaded.coord.phi:.2f}")
    
    # Test 3: Collapse
    print("\nTest 3: Collapse quantum state")
    
    collapsed = qrec.collapse()
    print(f"  Collapsed: θ={collapsed.theta:.2f}, φ={collapsed.phi:.2f}")
    
    # Test 4: Should materialize?
    print("\nTest 4: Materialization decision")
    
    should_mat = qrec.should_materialize(impedance_threshold=0.5)
    print(f"  Should materialize: {should_mat}")
    
    # Cleanup
    test_path.unlink()
    print("\n✅ All tests complete!")
