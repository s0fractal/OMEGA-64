import json
import hashlib
from pathlib import Path

class EvolutionLog:
    def __init__(self, path: Path):
        self.path = path
        if not self.path.exists():
            self.path.write_text("", encoding="utf-8")

    def append(self, event_type: str, data: dict):
        # Deterministic JSON (sort keys)
        event = {
            "type": event_type,
            "data": data,
            "prev": self.get_last_hash()
        }
        event_str = json.dumps(event, sort_keys=True)
        h = hashlib.sha256(event_str.encode()).hexdigest()
        
        with self.path.open("a", encoding="utf-8") as f:
            f.write(f"{h} {event_str}\n")
        return h

    def get_last_hash(self) -> str:
        lines = self.path.read_text(encoding="utf-8").strip().splitlines()
        if not lines: return "0" * 64
        return lines[-1].split(" ", 1)[0]

    def verify(self) -> bool:
        expected_prev = "0" * 64
        for line in self.path.read_text(encoding="utf-8").strip().splitlines():
            if not line: continue
            h, event_str = line.split(" ", 1)
            event = json.loads(event_str)
            if event["prev"] != expected_prev: return False
            if hashlib.sha256(event_str.encode()).hexdigest() != h: return False
            expected_prev = h
        return True

    def replay(self, callback):
        """Replay all events in the log."""
        for line in self.path.read_text(encoding="utf-8").strip().splitlines():
            if not line: continue
            h, event_str = line.split(" ", 1)
            event = json.loads(event_str)
            callback(event)

# Σ-PoI: b32237e8a1488bb987fcdcbd19c559839cdd53bea8bf5198cdaf5d62663b0f6e
