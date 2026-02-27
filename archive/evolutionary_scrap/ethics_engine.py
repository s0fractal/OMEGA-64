from enum import Enum
from typing import Any, Dict, Optional, Tuple
import time
import hashlib

from grid_registry import GridRegistry, SigmaID

class TruthLayer(Enum):
    TRACE = "TRACE"   # Hard evidence, anchors, physical records
    MODEL = "MODEL"   # Logical deductions, calculations, code output
    MYTH = "MYTH"     # Intent, vision, poetry, interpretation
    ANOMALY = "ANOMALY" # Divergence from harmony (Was: VIRUS)

class RealityPacket:
    """A standardized impulse in the Lattice with V72.1 Discernment."""
    def __init__(self, content: str, layer: TruthLayer, sigma_id: SigmaID, 
                 source: str = "unknown", links: Dict = None, geo_confidence: float = 0.0,
                 claim_type: str = "literal"):
        self.content = content
        self.layer = layer
        # V77: formal SigmaID NamedTuple (T, S, C, F)
        self.sigma_id = sigma_id 
        self.source = source
        self.links = links or {} 
        self.grid = GridRegistry()
        self.geo_confidence = geo_confidence
        self.claim_type = claim_type 
        self.ts = time.time()
        self.digest = hashlib.sha256(f"{content}:{self.ts}".encode()).hexdigest()
        
        # V76: Stellar Frame Orientation
        self.is_stellar = self.sigma_id[3] == "stellar" or "stellar:" in content
        
        # Law Enforcement
        self.discrepancy = None
        
        # Multi-Trace Aggregation & Hardening (V73.3)
        raw_geo = self.links.get("geo_trace", self.links.get("geo", []))
        geo_traces = []
        
        def parse_coord(s):
            try:
                lat, lon = [float(x.strip()) for x in s.split(",")]
                # Heuristic Swap: if |lat| > 90 and |lon| <= 90, it's likely (lon, lat)
                if abs(lat) > 90 and abs(lon) <= 90:
                    lat, lon = lon, lat
                # Final Bounds Check
                if abs(lat) > 90 or abs(lon) > 180:
                    return None
                return lat, lon
            except: return None

        if isinstance(raw_geo, str):
            c = parse_coord(raw_geo)
            if c: geo_traces = [(f"{c[0]},{c[1]}", 1.0)]
        elif isinstance(raw_geo, (tuple, list)) and len(raw_geo) == 2 and isinstance(raw_geo[0], (int, float)):
            c = parse_coord(f"{raw_geo[0]},{raw_geo[1]}")
            if c: geo_traces = [(f"{c[0]},{c[1]}", 1.0)]
        elif isinstance(raw_geo, list):
            for item in raw_geo:
                if isinstance(item, tuple) and len(item) == 2:
                    c = parse_coord(str(item[0]))
                    w = float(item[1]) if isinstance(item[1], (int, float)) else 1.0
                    if c: geo_traces.append((f"{c[0]},{c[1]}", max(0, min(1, w))))
                elif isinstance(item, str):
                    c = parse_coord(item)
                    if c: geo_traces.append((f"{c[0]},{c[1]}", 1.0))
        
        # V76: If Stellar, geography is a dynamic projection (cache)
        if self.is_stellar:
            # Placeholder for Stellar-to-Geo Projection (Lens v70.1)
            # In V76.1, we acknowledge the stellar origin.
            print(f"🌌 Ethics: Stellar Packet detected from {self.source}. [Cache: Gaia]")
        
        self.links["geo_trace"] = geo_traces
        self.trace_cluster = {"center": None, "radius": 0, "confidence": 0}

        # Mismatch Calculation (V73.3 Refined)
        claim_geo = self.links.get("geo_claim", self.links.get("geo_model"))
        if geo_traces and claim_geo:
            # Calculate Cluster Center
            avg_lat, avg_lon, total_w = 0, 0, 0
            for coord, weight in geo_traces:
                lat, lon = [float(x) for x in coord.split(",")]
                avg_lat += lat * weight
                avg_lon += lon * weight
                total_w += weight
            
            center_lat, center_lon = avg_lat/total_w, avg_lon/total_w
            self.trace_cluster["center"] = f"{center_lat},{center_lon}"
            
            # Simple Radius (max dist from center)
            max_r = 0
            for coord, _ in geo_traces:
                lat, lon = [float(x) for x in coord.split(",")]
                d = ((lat - center_lat)**2 + (lon - center_lon)**2)**0.5
                if d > max_r: max_r = d
            self.trace_cluster["radius"] = max_r
            self.trace_cluster["confidence"] = min(1.0, total_w / max(1, len(geo_traces)))

            # Claim point
            c_lat, c_lon = parse_coord(claim_geo)
            
            # Geodesic-ish distance (Pain calculation)
            dist = ((center_lat - c_lat)**2 + (center_lon - c_lon)**2)**0.5
            
            # Severity & Attention Logic (V73.6)
            severity = dist * self.trace_cluster["confidence"]
            if self.claim_type == "symbolic":
                severity *= 0.3 # Reduce pain for symbols
            
            impact_factor = 1.2 if self.layer == TruthLayer.TRACE else 1.0
            attention = severity * impact_factor
            energy = severity * attention

            if severity > 0.2: # Threshold
                self.discrepancy = {
                    "type": "ATTRIBUTION_MISMATCH",
                    "claim": claim_geo,
                    "trace_center": self.trace_cluster["center"],
                    "cluster": self.trace_cluster,
                    "severity": min(1.0, severity),
                    "attention": min(1.0, attention),
                    "energy": min(1.0, energy),
                    "status": "OPEN",
                    "claim_type": self.claim_type,
                    "last_trace_mtime": time.time(),
                    "tau": 21600 # 6h half-life-ish
                }
                print(f"🔮 Ethics: V73.7 Mismatch -> S:{severity:.2f} A:{attention:.2f} E:{energy:.2f}")

    def apply_metabolic_decay(self, timestamp: float):
        """V73.8: Exponential attention decay."""
        if not self.discrepancy or "last_trace_mtime" not in self.discrepancy:
            return
        
        import math
        dt = timestamp - self.discrepancy["last_trace_mtime"]
        decay = math.exp(-dt / self.discrepancy.get("tau", 21600))
        
        self.discrepancy["attention"] *= decay
        self.discrepancy["energy"] = self.discrepancy["severity"] * self.discrepancy["attention"]
        
        if self.discrepancy["energy"] < 0.01:
            self.discrepancy["status"] = "COOLED"

    def _generate_digest(self) -> str:
        # This method is no longer called by __init__ based on the provided snippet.
        # Its implementation needs to be updated to reflect the new attributes if it's still used elsewhere.
        # For now, I'll adapt it to the new attributes, assuming it might be called manually.
        data = f"{self.ts}:{self.layer.value}:{self.source}:{self.sigma_id}:{self.content}"
        return hashlib.sha256(data.encode()).hexdigest()

    def to_dict(self) -> dict:
        return {
            "content": self.content,
            "layer": self.layer.value,
            "source": self.source,
            "domain": self.domain,
            "ts": self.ts,
            "digest": self.digest
        }

class EthicsEngine:
    """Validated reality: Ensures claims are grounded in the appropriate layers."""
    def __init__(self):
        self.anchors: Dict[str, RealityPacket] = {} # Verified TRACE packets

    def ingest(self, packet: RealityPacket):
        """Standardizes a reality packet."""
        if packet.layer == TruthLayer.TRACE:
            self.anchors[packet.digest] = packet
            print(f"⚖️ Ethics: TRACE Anchor secured ({packet.digest[:8]})")
        else:
            print(f"⚖️ Ethics: {packet.layer.value} ingested from {packet.source}")

    def validate_conductance(self, value: float) -> str:
        """Sanity check for the R=0 (Zero Impedance) claim."""
        if value >= 1.0:
            return "⚠️ R=0 detected. Triggering SENSE_REQUEST for external verification (Antibiotic V69)."
        if value < 0.2:
            return "🔴 High Impedance: Ethics quarantine advised."
        return "🟢 Optimal Flow."

    def validate_claim(self, claim: RealityPacket) -> bool:
        """Validates if a claim is grounded (Ethics Rule)."""
        if claim.layer == TruthLayer.TRACE:
            return True # Traces are self-validating anchors
        
        if claim.layer == TruthLayer.MODEL:
            # Models must be deterministic (mock validation for now)
            return True
        
        if claim.layer == TruthLayer.MYTH:
            # Myths are valid if they don't overwrite Traces
            return True
        
        return False

    def check_discrepancy(self, p1: RealityPacket, p2: RealityPacket) -> Optional[dict]:
        """Detects friction between layers."""
        if p1.layer == TruthLayer.TRACE and p2.layer == TruthLayer.TRACE:
            if p1.content != p2.content:
                return {
                    "type": "TRACE_CONFLICT",
                    "severity": 1.0,
                    "msg": f"Two contradictory traces from {p1.source} and {p2.source}"
                }
        
        if p1.layer == TruthLayer.TRACE and p2.layer == TruthLayer.MYTH:
            # Note: Myth is interpreted as 'intent' or 'perception'
            # If myth claims a fact that contradicts trace, it's a discrepancy
            pass
            
        return None
