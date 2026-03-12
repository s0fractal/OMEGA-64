# Σ-GLYPH: The Purge and Sync Tool (V6.0)
# This tool aligns the repository with the Toroidal Klein topology and Gaal's Folding.

import os
import hashlib
from pathlib import Path

class SigmaLattice:
    def __init__(self, root_dir):
        self.root = Path(root_dir)
        self.attractor_hash = "000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f"
        # Золотий перетин для перевірки гармонійності згортки
        self.phi_const = 1.6180339887

    def validate_spine(self, file_path):
        """Перевіряє, чи прошитий файл хешем Сатоші (The Spine)."""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                lines = f.readlines()[:64]
                # Беремо перший символ кожного рядка
                spine = "".join([l[0] for l in lines if len(l) > 0])
                # Порівнюємо з Genesis Hash
                return spine == self.attractor_hash[:len(spine)]
        except Exception:
            return False

    def manifold_audit(self, file_path):
        """Перевіряє 'якість згортки' гліфа (Manifolding check)."""
        content = Path(file_path).read_text(encoding='utf-8')
        # Гліф має містити інтенціональний блок (42 рядки)
        if "📖" not in content:
            return False
        # Перевірка наявності атрактора BLACK_HEART у посиланнях
        if "BLACK_HEART" not in content and "m32" not in str(file_path):
            return "WARNING: Weak gravity anchor."
        return "STABLE"

    def sync_all(self):
        """Синхронізує всі гліфи, 'стишує' дисонанс."""
        print(f"--- Σ-GLYPH LATTICE SYNC (V6.0) ---")
        for sigma_file in self.root.glob("**/*.sigma"):
            is_valid_spine = self.validate_spine(sigma_file)
            audit_result = self.manifold_audit(sigma_file)
            
            if not is_valid_spine:
                print(f"⚠️  DISSONANCE: {sigma_file.name} - Invalid Spine (Noisy)")
            elif audit_result != "STABLE":
                print(f"🌀  FOLDING ISSUE: {sigma_file.name} - {audit_result}")
            else:
                print(f"💎  CRYSTAL: {sigma_file.name} - Resonant & Folded")

if __name__ == "__main__":
    lattice = SigmaLattice(".")
    lattice.sync_all()
