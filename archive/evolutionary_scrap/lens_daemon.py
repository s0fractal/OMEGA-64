from daemon_core import BaseDaemon
from kml_generator import KMLGenerator
import os
import ast

class LensDaemon(BaseDaemon):
    """Journal -> KML: The Visual Membrane."""
    def __init__(self, name: str):
        super().__init__(name)
        self.kml = KMLGenerator()
        self.world_kml = "/Users/s0fractal/SIGMA/PY/z00/ambient_world.kml"

    def run_once(self):
        # Note: LensDaemon might need to scan the *entire* journal to rebuild the world, 
        # but for V73.0 MVP, we process increments and append marks.
        journal_files = self.scan_channel("journal")
        if not journal_files:
            return

        for fpath, mtime in journal_files:
            with open(fpath, "r") as f:
                content = f.read()
            
            # Simple metadata extraction
            sigma_id = (0, "sea", "void", "global")
            if "ΣID:" in content:
                val = content.split("ΣID:")[1].split("\n")[0].strip()
                try: sigma_id = ast.literal_eval(val)
                except: pass
            
            links = {}
            if "geo_trace:" in content:
                val = content.split("geo_trace:")[1].split("\n")[0].strip()
                try: links["geo_trace"] = ast.literal_eval(val)
                except: links["geo_trace"] = val
            elif "GEO:" in content:
                links["geo_trace"] = content.split("GEO:")[1].split("\n")[0].strip()

            if "geo_claim:" in content:
                links["geo_claim"] = content.split("geo_claim:")[1].split("\n")[0].strip()
            elif "GEO_MODEL:" in content:
                links["geo_claim"] = content.split("GEO_MODEL:")[1].split("\n")[0].strip()

            self.kml.add_placemark(
                name=os.path.basename(fpath),
                sigma_id=sigma_id,
                description=content[:200],
                links=links
            )
            
            # If discrepancy already in journal (from previous ethics pass or manual)
            if "DISCREPANCY:" in content:
                val = content.split("DISCREPANCY:")[1].split("\n")[0].strip()
                try:
                    d = ast.literal_eval(val)
                    if d["type"] == "ATTRIBUTION_MISMATCH":
                        self.kml.add_trace_cluster(d["trace_center"])
                        claim_sigma = (sigma_id[0], "cloud", sigma_id[2], sigma_id[3])
                        self.kml.add_pain_channel(
                            claim_sigma, sigma_id,
                            claim_geo=d["claim"], 
                            trace_geo=d["trace_center"],
                            severity=d.get("severity", 0.5),
                            attention=d.get("attention", 0.5),
                            energy=d.get("energy", 0.5),
                            status=d.get("status", "OPEN")
                        )
                except: pass

        self.kml.build_membrane(self.world_kml)
        print(f"🌐 LensDaemon: KML Membrane updated -> {self.world_kml}")
        self.log_flow_metric("KML", len(journal_files))

if __name__ == "__main__":
    d = LensDaemon("Lens")
    d.run_once()
