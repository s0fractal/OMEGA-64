"""
Σ-GLYPH Akasha CAS
Content-Addressed Storage for immutable blobs
V2.4.0 - LUT Authority
"""

import hashlib
from pathlib import Path
import tempfile
import os


class AkashaStore:
    """
    Content-Addressed Storage for immutable blobs.
    
    Properties:
    - Blobs stored by SHA-256 hash
    - Prefix sharding (first 2 chars) for filesystem performance
    - Atomic writes (temp file + rename)
    - No mutation - blobs are immutable
    """
    
    def __init__(self, root: Path):
        """
        Initialize Akasha store.
        
        Args:
            root: Repository root path
        """
        self.root = root / "AKASHA" / "blobs"
        self.root.mkdir(parents=True, exist_ok=True)
    
    def _blob_path(self, hash_hex: str) -> Path:
        """
        Get path for blob with prefix sharding.
        
        Args:
            hash_hex: SHA-256 hash (64 hex chars)
        
        Returns:
            Path to blob file
        """
        if len(hash_hex) != 64:
            raise ValueError(f"Invalid hash length: {len(hash_hex)} (expected 64)")
        
        prefix = hash_hex[:2]
        return self.root / prefix / hash_hex
    
    def put(self, data: bytes) -> str:
        """
        Store blob and return its hash.
        
        Args:
            data: Raw blob bytes
        
        Returns:
            SHA-256 hash (hex string)
        """
        # Compute hash
        blob_hash = hashlib.sha256(data).hexdigest()
        blob_path = self._blob_path(blob_hash)
        
        # Skip if already exists
        if blob_path.exists():
            # Verify existing blob
            existing_data = blob_path.read_bytes()
            if existing_data != data:
                raise ValueError(f"Hash collision detected: {blob_hash}")
            return blob_hash
        
        # Atomic write: temp file + rename
        blob_path.parent.mkdir(parents=True, exist_ok=True)
        with tempfile.NamedTemporaryFile(
            mode='wb',
            dir=blob_path.parent,
            delete=False,
            prefix='.tmp_'
        ) as tmp:
            tmp.write(data)
            tmp_path = tmp.name
        
        try:
            os.rename(tmp_path, blob_path)
        except Exception as e:
            # Clean up temp file on error
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)
            raise e
        
        return blob_hash
    
    def get(self, hash_hex: str) -> bytes:
        """
        Retrieve blob by hash.
        
        Args:
            hash_hex: SHA-256 hash (hex string)
        
        Returns:
            Raw blob bytes
        
        Raises:
            FileNotFoundError: Blob not found
            ValueError: Blob corruption detected
        """
        blob_path = self._blob_path(hash_hex)
        
        if not blob_path.exists():
            raise FileNotFoundError(
                f"Blob not found in Akasha: {hash_hex}\n"
                f"Expected path: {blob_path}"
            )
        
        data = blob_path.read_bytes()
        
        # Verify integrity
        actual_hash = hashlib.sha256(data).hexdigest()
        if actual_hash != hash_hex:
            raise ValueError(
                f"Blob corruption detected!\n"
                f"Expected: {hash_hex}\n"
                f"Actual:   {actual_hash}"
            )
        
        return data
    
    def verify(self, hash_hex: str) -> bool:
        """
        Verify blob exists and matches hash.
        
        Args:
            hash_hex: SHA-256 hash (hex string)
        
        Returns:
            True if blob exists and is valid, False otherwise
        """
        try:
            self.get(hash_hex)
            return True
        except (FileNotFoundError, ValueError):
            return False
    
    def exists(self, hash_hex: str) -> bool:
        """
        Check if blob exists (without verification).
        
        Args:
            hash_hex: SHA-256 hash (hex string)
        
        Returns:
            True if blob file exists, False otherwise
        """
import json

class SemanticAkasha(AkashaStore):
    """
    V52.0: Masterman Linguistic Matrix.
    Indexes blobs via "Semantic Shells" (linguistic vectors).
    """

    def __init__(self, root: Path):
        super().__init__(root)
        self.index_path = self.root.parent / "semantic_index.json"
        self.index = self._load_index()

    def _load_index(self) -> dict:
        if self.index_path.exists():
            try:
                return json.loads(self.index_path.read_text())
            except:
                return {}
        return {}

    def _save_index(self):
        self.index_path.write_text(json.dumps(self.index, indent=2))

    def put_with_semantics(self, data: bytes, shell: dict) -> str:
        """Stores blob and associates it with a Masterman Semantic Shell."""
        blob_hash = self.put(data)
        self.index[blob_hash] = shell
        self._save_index()
        return blob_hash

    def get_shell(self, hash_hex: str) -> Optional[dict]:
        """Retrieves the linguistic vector for a given hash."""
        return self.index.get(hash_hex)

    def find_by_resonance(self, target_vector: dict, threshold: float = 0.5) -> list:
        """
        Finds hashes with high semantic resonance to a target vector.
        Simplified: matches keys in the shell dictionary.
        """
        matches = []
        for h, shell in self.index.items():
            # Masterman Fan Logic (simplified)
            score = self._calculate_vector_resonance(shell, target_vector)
            if score >= threshold:
                matches.append((h, score))
        return sorted(matches, key=lambda x: x[1], reverse=True)

    def _calculate_vector_resonance(self, shell_a: dict, shell_b: dict) -> float:
        """Linguistic vector similarity (Masterman Fan)."""
        keys_a = set(shell_a.keys())
        keys_b = set(shell_b.keys())
        intersection = keys_a.intersection(keys_b)
        union = keys_a.union(keys_b)
        if not union: return 0.0
        return len(intersection) / len(union)
