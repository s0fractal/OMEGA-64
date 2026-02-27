from daemon_core import BaseDaemon
import os
import hashlib
import time

class NormalizerDaemon(BaseDaemon):
    """Inbox -> Journal: The Guardian of the Standard Envelope."""
    def run_once(self):
        new_files = self.scan_channel("inbox")
        for fpath, mtime in new_files:
            print(f"🧬 Normalizer: Processing {os.path.basename(fpath)}")
            with open(fpath, "r") as f:
                content = f.read()
            
            # 1. Standardize Envelope & Map Legacy Fields (V73.4)
            digest = hashlib.sha256(content.encode()).hexdigest()[:16]
            
            # Mapping Legacy -> Canonical
            if "GEO:" in content and "geo_trace:" not in content:
                content = content.replace("GEO:", "geo_trace:")
            if "GEO_MODEL:" in content and "geo_claim:" not in content:
                content = content.replace("GEO_MODEL:", "geo_claim:")

            if "ΣID:" not in content:
                envelope = f"ΣID: ({int(time.time()/100)}, 'sea', 'self:u123.inbox', 'user:u123')\n"
                content = envelope + content
            
            if "DIGEST:" not in content:
                content += f"\nDIGEST: {digest}"
            
            if "SOURCE:" not in content:
                content += f"\nSOURCE: daemon:normalizer"

            # 2. Atomic Commit to Journal (V73.4)
            journal_dir = os.path.join(self.bus_root, "journal")
            fname = os.path.basename(fpath)
            tmp_path = os.path.join(journal_dir, f".tmp_{fname}")
            final_path = os.path.join(journal_dir, fname)
            
            with open(tmp_path, "w") as f:
                f.write(content)
            os.rename(tmp_path, final_path)
            
            # Clean up inbox
            os.remove(fpath)
            
            # 3. Update Checkpoint & Visibility
            self._set_checkpoint("inbox", mtime)
            self.log_flow_metric("journal", 1)
            print(f"✅ Normalizer: Atomic Commit -> {fname}")

if __name__ == "__main__":
    d = NormalizerDaemon("Normalizer")
    d.run_once()
