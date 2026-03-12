import hashlib
import time
from pathlib import Path
from ethics_engine import RealityPacket, TruthLayer
from typing import List, Tuple, Optional

class ConcordAlignment:
    """Resolves multi-agent conflicts via truth currencies."""
    
    # Currency Hierarchy: TRACE > COHERENCE > CARE
    # In our implementation: TRACE > MODEL > MYTH
    
    @staticmethod
    def resolve(packets: List[RealityPacket]) -> Tuple[RealityPacket, List[dict]]:
        """Selects the winner based on the hierarchy and records the discord."""
        if not packets:
            raise ValueError("No packets to resolve")
            
        # Priority mapping
        priority = {
            TruthLayer.TRACE: 3,
            TruthLayer.MODEL: 2,
            TruthLayer.MYTH: 1
        }
        
        # Sort by priority, then by timestamp (latest trace vs oldest intent depends on context, 
        # but here we prefer TRACE above all)
        sorted_packets = sorted(packets, key=lambda p: (priority[p.layer], -p.ts), reverse=True)
        winner = sorted_packets[0]
        
        discord = []
        for p in sorted_packets[1:]:
            if p.layer == winner.layer and p.content != winner.content:
                discord.append({
                    "type": "DISCORD",
                    "comp": f"{winner.source} vs {p.source}",
                    "msg": f"Contradictory {winner.layer.value} records."
                })
            elif priority[p.layer] < priority[winner.layer]:
                discord.append({
                    "type": "SUBORDINATION",
                    "msg": f"{p.layer.value} layer from {p.source} subordinated to TRACE from {winner.source}"
                })
                
        return winner, discord

    @staticmethod
    def process_appeal(dissonance_id: str, evidence: str, ambient_dir: str = "/Users/s0fractal/SIGMA/ambient"):
        """Processes an appeal against a pain marker and generates a resolution."""
        print(f"⚖️ Concord Alignment: Processing appeal for {dissonance_id}...")
        
        # In a real system, this would audit the evidence against TRACE anchors.
        # For this demo, we assume the appeal is valid if it contains 'noise' or 'homeostasis'.
        valid = any(word in evidence.lower() for word in ["noise", "homeostasis", "normal", "ignore"])
        
        res_id = hashlib.sha256(f"RES:{dissonance_id}:{time.time()}".encode()).hexdigest()[:10]
        filename = f"CONCORD_RESOLUTION_{res_id}.sigma"
        file_path = Path(ambient_dir) / filename
        
        status = "RESOLVED" if valid else "REJECTED"
        msg = "Pain marker downgraded to Homeostatic Noise." if valid else "Appeal rejected: Evidence insufficient."
        
        content = f"""# Σ-CONCORD RESOLUTION: {res_id}
TARGET_DISSONANCE: {dissonance_id}
STATUS: {status}
MESSAGE: {msg}
LAYER: MODEL
TIMESTAMP: {time.time()}

# Σ-PoI: {res_id}
"""
        with open(file_path, "w") as f:
            f.write(content)
            
        print(f"✅ Concord: Resolution materialized -> {filename}")
        return str(file_path)

    @staticmethod
    def prescribe_next_test(discord: List[dict]) -> str:
        """Generates a plan to resolve the discord."""
        if not discord:
            return "Stable Consensus."
        
        return "PRESCRIPTION: Align with TRACE. If discord persists, seek new Mineral Anchor."
