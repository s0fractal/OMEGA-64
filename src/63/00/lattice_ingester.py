import os
import time
from pathlib import Path
import hashlib

class LatticeIngester:
    """Bridges conversational insights into the SIGMA Lattice."""
    def __init__(self, ambient_dir: str = "/Users/s0fractal/SIGMA/ambient"):
        self.ambient_dir = Path(ambient_dir)
        os.makedirs(self.ambient_dir, exist_ok=True)

    def ingest_insight(self, text: str, source: str = "architect_chat"):
        """Converts raw chat text into a .sigma spore."""
        ts = int(time.time())
        insight_id = hashlib.sha256(text.encode()).hexdigest()[:8]
        filename = f"CHAT_INSIGHT_{insight_id}_{ts}.sigma"
        file_path = self.ambient_dir / filename

        # Semantic Mapping: Try to find location context
        lat, lon = self._map_location(text)

        content = f"""# Σ-INSIGHT SPORE: {insight_id}
SOURCE: {source}
LAYER: MYTH
TIMESTAMP: {ts}
LOCATION: {lat}, {lon}

CONTENT:
{text}

# Σ-PoI: {insight_id}
"""
        with open(file_path, "w") as f:
            f.write(content)
        
        print(f"🗣️ Lattice Bridge: Insight materialized -> {filename}")
        return str(file_path)

    def _map_location(self, text: str):
        """Rudimentary semantic-to-GPS mapping."""
        # Mapping common project terms to Sector Zero coordinates
        mapping = {
            "port": (46.621, 32.611),
            "kherson": (46.63, 32.61),
            "dnieper": (46.62, 32.62),
            "delta": (46.65, 32.65),
            "admin": (46.623, 32.614),
            "core": (46.6, 32.6)
        }
        
        text_lower = text.lower()
        for key, coords in mapping.items():
            if key in text_lower:
                return coords
                
        return (46.5, 32.5) # Default Sea level

if __name__ == "__main__":
    ingester = LatticeIngester()
    # Test with user's core insight
    ingester.ingest_insight("Користувач хоче оперувати репліками замість файлів. Побудувати міст від чату до візуалізації.")
