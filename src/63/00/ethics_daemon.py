from daemon_core import BaseDaemon
from ethics_engine import EthicsEngine, TruthLayer, RealityPacket
from gaia_grid import GaiaGrid
from kml_generator import KMLGenerator
import os
import ast
import time
import json

class EthicsDaemon(BaseDaemon):
    """Journal -> Concord: The Pulse of Discernment."""
    MAX_ENERGY_PER_CYCLE = float(os.getenv("SIGMA_ENERGY_BUDGET", 5.0))

    def __init__(self, name: str):
        super().__init__(name)
        self.engine = EthicsEngine()
        self.grid = GaiaGrid()
        self.kml = KMLGenerator()

    def run_once(self):
        journal_files = self.scan_channel("journal")
        spores_to_process = []
        
        # Load flow state for baseline (V73.9)
        baseline = 0.1
        total_pulses = 0
        fstate_path = os.path.join(self.bus_root, "flow_state.json")
        if os.path.exists(fstate_path):
            try:
                with open(fstate_path, "r") as f:
                    fstate = json.load(f)
                    baseline = fstate.get("baseline_energy", 0.1)
                    total_pulses = fstate.get("total_pulses", 0)
            except: pass

        # 1. First pass: Parse and calculate current energy
        for fpath, mtime in journal_files:
            with open(fpath, "r") as f:
                content = f.read()

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
            
            sigma_id = (0, "sea", "void", "global")
            if "ΣID:" in content:
                val = content.split("ΣID:")[1].split("\n")[0].strip()
                sigma_id = ast.literal_eval(val)

            packet = RealityPacket(
                content=content,
                layer=TruthLayer.TRACE if any(x in content for x in ["TRACE", "GEO:", "geo_trace:"]) else TruthLayer.MODEL,
                sigma_id=sigma_id,
                links=links
            )
            
            if packet.discrepancy:
                # V75: Use Local Clock for decay/persistence
                t_i = self.local_clock
                packet.apply_metabolic_decay(t_i)
                
                # V20260117.0345 Update: Debug was removed, and price added.
                energy = packet.discrepancy.get("energy", 0)
                # Integration Cost (IC): Energy to reconcile
                packet.discrepancy["ic"] = energy * 1.5 
                
                # V73.9.1: Auto-Cooling with Warm-up & Quiet State Semantics
                if total_pulses > 10 and energy < (baseline * 0.5):
                    packet.discrepancy["status"] = "COOLED"
                    packet.discrepancy["attention"] = 0.0
                    packet.discrepancy["energy"] = 0.0
                    packet.discrepancy["cool_reason"] = "baseline_below_threshold"
                    print(f"❄️ Ethics: Auto-cooling minor noise ({energy:.2f} < {baseline*0.5:.2f}) -> {os.path.basename(fpath)}")
                
                spores_to_process.append((fpath, mtime, packet))
        
        # 2. Sort by Energy (Highest First)
        spores_to_process.sort(key=lambda x: x[2].discrepancy.get("energy", 0), reverse=True)
        
        # 3. Process within Energy Budget
        current_energy = 0
        for fpath, mtime, packet in spores_to_process:
            energy = packet.discrepancy.get("energy", 0)
            if current_energy + energy > self.MAX_ENERGY_PER_CYCLE:
                print(f"⚠️ Ethics: Energy budget exceeded ({current_energy:.2f}/{self.MAX_ENERGY_PER_CYCLE}). Deferring {os.path.basename(fpath)}")
                continue
            
            current_energy += energy
            fname = os.path.basename(fpath)
            attention = packet.discrepancy.get("attention", 0)
            status = packet.discrepancy.get("status", "OPEN")

            # Transition to escalation (V73.9.1: COOLED items flow as quiet refs)
            target_sub = "open"
            if status == "COOLED":
                # Escalate as a quiet reference to 'open', but with zero attention
                target_sub = "open"
            else:
                target_sub = "review" if attention > 0.7 else "open"

            target_path = os.path.join(self.bus_root, "concord", target_sub, fname)
            
            ref_content = f"REF: journal/{fname}\n"
            ref_content += f"DIGEST: {packet.digest}\n"
            ref_content += f"DISCREPANCY: {packet.discrepancy}\n"
            ref_content += f"LOCAL_T: {self.local_clock}\n"
            ref_content += f"ATTENTION_EXP: {self.local_clock + 10.0}\n"
            
            with open(target_path, "w") as f:
                f.write(ref_content)
            
            pfx = "❄️" if status == "COOLED" else "⚡️"
            print(f"{pfx} Ethics: [REF:{target_sub.upper()}] E:{energy:.2f} -> {fname}")
            
            # Log with Metadata (V73.9 includes energy for baseline)
            meta = {
                "hotspot": f"cell:{packet.sigma_id[2]}", 
                "has_trace": packet.layer == TruthLayer.TRACE,
                "energy": energy
            }
            self.log_flow_metric(f"concord/{target_sub}", 1, metadata=meta)
            self._set_checkpoint("journal", mtime)

        self.log_flow_metric("journal", 0)

if __name__ == "__main__":
    d = EthicsDaemon("Ethics")
    d.run_once()
