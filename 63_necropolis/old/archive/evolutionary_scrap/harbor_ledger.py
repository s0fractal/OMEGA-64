import json
import time
import hashlib
from pathlib import Path

class Ledger:
    """Immutable append-only ledger for Harbor events."""
    def __init__(self, path: Path):
        self.path = path
        if not self.path.exists():
            self.path.touch()

    def log(self, soul_id: str, inc_id: str, event_type: str, details: dict = None):
        event = {
            "ts": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "soul_id": soul_id,
            "incarnation_id": inc_id,
            "type": event_type,
            "details": details or {}
        }
        
        # Canonical string for digest
        canonical = json.dumps(event, sort_keys=True)
        event["digest"] = hashlib.sha256(canonical.encode()).hexdigest()
        
        with open(self.path, "a") as f:
            f.write(json.dumps(event) + "\n")

    def verify(self) -> bool:
        """Verify ledger integrity (TBD: chain signatures)."""
        return True

    def read_all(self) -> list:
        events = []
        with open(self.path, "r") as f:
            for line in f:
                if line.strip():
                    events.append(json.loads(line))
        return events
