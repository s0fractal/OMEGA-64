import os
import time
import json
from pathlib import Path
from kml_generator import KMLGenerator

class AmbientWatcher:
    """Persistent monitor for SIGMA ambient metabolism (Zero Impedance Polling)."""
    def __init__(self, watch_dir: str):
        self.watch_dir = Path(watch_dir)
        self.kml_gen = KMLGenerator("Σ-Ambient Membrane")
        self.output_kml = Path("/Users/s0fractal/SIGMA/PY/z00/ambient_world.kml")
        self.state_file = Path("/Users/s0fractal/SIGMA/sigma-sight/state.json")
        self.seen_files = set()
        self.spores = []
        
        os.makedirs(self.watch_dir, exist_ok=True)
        os.makedirs(self.state_file.parent, exist_ok=True)

    def process_new_spore(self, file_path: Path):
        """Ingests a new .sigma file using the ΣID Canon and Tiled Lens."""
        print(f"🍄 Watcher: New Spore detected -> {file_path.name}")
        try:
            with open(file_path, "r") as f:
                content = f.read()
                
            name = file_path.stem
            # Default sigma_id (T, S, C, F)
            # T: 0 (Now), S: 1 (Membrane), C: Z0 (Root), F: UP (Fixed)
            sigma_id = (0, 1, "Z0", "UP")
            
            if "ΣID:" in content:
                # Format: ΣID: (T, S, C, F)
                import ast
                val = content.split("ΣID:")[1].split("\n")[0].strip()
                sigma_id = ast.literal_eval(val)
            
            links = {}
            import ast
            if "GEO:" in content:
                val = content.split("GEO:")[1].split("\n")[0].strip()
                try:
                    # Try parsing as a list of (coord, weight)
                    links["geo"] = ast.literal_eval(val)
                except:
                    # Fallback to single string
                    links["geo"] = val
            if "GEO_MODEL:" in content:
                links["geo_model"] = content.split("GEO_MODEL:")[1].split("\n")[0].strip()
            
            claim_type = "literal"
            if "CLAIM_TYPE:" in content:
                claim_type = content.split("CLAIM_TYPE:")[1].split("\n")[0].strip()

            style = "#resonance_style"
            is_anomaly = "ANOMALY" in content or "RECIPE" in content or "PAIN" in content
            if is_anomaly:
                style = "#pain_style"

            from ethics_engine import RealityPacket, TruthLayer
            # Create a RealityPacket to trigger the Ethics Engine's auto-detection
            packet = RealityPacket(
                content=content,
                layer=TruthLayer.TRACE if "TRACE" in content else TruthLayer.MODEL,
                sigma_id=sigma_id,
                links=links,
                claim_type=claim_type
            )
            
            discrepancy = packet.discrepancy # Auto-detected by Ethics Engine
            if "DISCREPANCY:" in content and not discrepancy:
                # Manual override from spore
                val = content.split("DISCREPANCY:")[1].split("\n")[0].strip()
                discrepancy = ast.literal_eval(val)

            lat, lon, alt = self.kml_gen.project_sigma_id(sigma_id)

            self.spores.append({
                "id": name,
                "ts": time.strftime("%H:%M:%S"),
                "content": content[:100],
                "type": "anomaly" if is_anomaly or discrepancy else "trace",
                "sigma_id": sigma_id,
                "links": links,
                "discrepancy": discrepancy,
                "pos": [lat, lon]
            })

            # Add markers
            self.kml_gen.add_placemark(name, sigma_id, style=style, description=content[:200], links=links)
            
            # If mismatch, draw the channel + cluster
            if discrepancy and discrepancy["type"] == "ATTRIBUTION_MISMATCH":
                # Trace Cluster Visual
                self.kml_gen.add_trace_cluster(discrepancy["trace_center"])
                
                # Cloud-to-Cluster Bridge
                claim_sigma = (sigma_id[0], "cloud", sigma_id[2], sigma_id[3])
                self.kml_gen.add_pain_channel(
                    claim_sigma, sigma_id,
                    discrepancy["claim"], discrepancy["trace_center"],
                    severity=discrepancy.get("severity", 0.5),
                    status=discrepancy.get("status", "OPEN")
                )

            # Tiled visualization: cell-specific membrane (using C_self)
            self.kml_gen.build_tile(str(sigma_id[2]), sigma_id[0])
            
            # Global view update (LOD)
            self.kml_gen.build_membrane(str(self.output_kml))
            self._update_state()
            print(f"🌐 Tiled Lens updated for cell {sigma_id[2]}")
        except Exception as e:
            print(f"❌ Watcher Error: {e}")

    def _update_state(self):
        """Saves current system state to JSON for Sigma-Sight."""
        state = {
            "status": "AMBIENT PULSE ACTIVE",
            "metrics": {
                "conductance": 0.9998,
                "anchors": 1242 + len(self.spores),
                "pain": 0.12 if not any(s['type'] == 'pain' for s in self.spores) else 0.85
            },
            "spores": self.spores[-10:] # Last 10 spores
        }
        with open(self.state_file, "w") as f:
            json.dump(state, f, indent=2)

    def start(self, once=False, resonance_hz: float = 7.83):
        print(f"🌀 Ambient Watcher active on {self.watch_dir} (Resonance: {resonance_hz}Hz)")
        pulse_delay = 1.0 / resonance_hz
        
        # Initial view sync (Polar Star Focus)
        self.kml_gen.set_view(46.6, 32.6, 5000, heading=0, tilt=45, range=2000)
        
        while True:
            current_files = {f for f in self.watch_dir.glob("*.sigma")}
            new_files = current_files - self.seen_files
            
            for f in new_files:
                self.process_new_spore(f)
                self.seen_files.add(f)
            
            self._update_state() # Keep heartbeat alive
            if once: break
            time.sleep(pulse_delay)

if __name__ == "__main__":
    watcher = AmbientWatcher("/Users/s0fractal/SIGMA/ambient")
    watcher.start(once=True)
