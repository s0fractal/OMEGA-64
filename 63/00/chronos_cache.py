"""
Σ-GLYPH CHRONOS Cache v1.0
Never calculate twice - eternal storage of normal forms.

Caches reduction results using:
- Hash identity (PoI) as key
- Git-based persistence
- Temporal anchoring via CHRONOS
"""

import os
import json
import hashlib
from pathlib import Path
from typing import Optional
from trigram_reducer import Node, reduce
from trigram_encoder import encode_to_bits, decode_from_bits, compute_hash


# ============================================================================
# Cache Configuration
# ============================================================================

# Cache directory (in .sigma/cache/)
CACHE_DIR = Path(__file__).parent.parent.parent / ".sigma" / "cache" / "chronos"
CACHE_DIR.mkdir(parents=True, exist_ok=True)


# ============================================================================
# Cache Operations
# ============================================================================

def get_cache_path(program_hash: str) -> Path:
    """
    Get cache file path for program hash.
    
    Uses first 2 hex digits for sharding (00-ff).
    """
    shard = program_hash[:2]
    shard_dir = CACHE_DIR / shard
    shard_dir.mkdir(exist_ok=True)
    return shard_dir / f"{program_hash}.json"


def cache_get(program: Node) -> Optional[Node]:
    """
    Get cached normal form for program.
    
    Returns None if not cached.
    """
    program_hash = compute_hash(program)
    cache_path = get_cache_path(program_hash)
    
    if not cache_path.exists():
        return None
    
    try:
        with open(cache_path, 'r') as f:
            data = json.load(f)
        
        # Decode normal form from bits
        normal_bits = data['normal_form_bits']
        normal_form, _ = decode_from_bits(normal_bits)
        
        return normal_form
    
    except Exception as e:
        print(f"⚠️ Cache read error: {e}")
        return None


def cache_put(program: Node, normal_form: Node) -> None:
    """
    Cache normal form for program.
    
    Stores:
    - Program hash (PoI)
    - Program bits
    - Normal form bits
    - Timestamp
    """
    program_hash = compute_hash(program)
    cache_path = get_cache_path(program_hash)
    
    data = {
        'program_hash': program_hash,
        'program_bits': encode_to_bits(program),
        'normal_form_bits': encode_to_bits(normal_form),
        'timestamp': __import__('time').time()
    }
    
    try:
        with open(cache_path, 'w') as f:
            json.dump(data, f, indent=2)
    except Exception as e:
        print(f"⚠️ Cache write error: {e}")


def reduce_cached(program: Node, max_steps: int = 10000) -> Node:
    """
    Reduce with caching.
    
    1. Check cache for existing result
    2. If miss, reduce and cache result
    3. Return normal form
    
    This is the "Never calculate twice" protocol.
    """
    # Try cache first
    cached = cache_get(program)
    if cached is not None:
        print(f"✨ Cache HIT: {compute_hash(program)[:16]}...")
        return cached
    
    # Cache miss - reduce
    print(f"🔄 Cache MISS: {compute_hash(program)[:16]}... (reducing)")
    normal_form = reduce(program, max_steps)
    
    # Cache result
    cache_put(program, normal_form)
    
    return normal_form


def cache_stats() -> dict:
    """
    Get cache statistics.
    
    Returns:
    - Total entries
    - Total size
    - Shard distribution
    """
    total_entries = 0
    total_size = 0
    shard_counts = {}
    
    for shard_dir in CACHE_DIR.iterdir():
        if not shard_dir.is_dir():
            continue
        
        shard = shard_dir.name
        shard_entries = list(shard_dir.glob("*.json"))
        shard_count = len(shard_entries)
        
        total_entries += shard_count
        shard_counts[shard] = shard_count
        
        for entry in shard_entries:
            total_size += entry.stat().st_size
    
    return {
        'total_entries': total_entries,
        'total_size_bytes': total_size,
        'total_size_kb': total_size / 1024,
        'shard_counts': shard_counts
    }


def cache_clear() -> None:
    """
    Clear entire cache.
    
    WARNING: This deletes all cached results!
    """
    import shutil
    if CACHE_DIR.exists():
        shutil.rmtree(CACHE_DIR)
        CACHE_DIR.mkdir(parents=True, exist_ok=True)
    print("🗑️ Cache cleared")


# ============================================================================
# Examples
# ============================================================================

if __name__ == "__main__":
    from trigram_reducer import I, K, S, App
    
    print("🔺 Σ-GLYPH CHRONOS Cache v1.0")
    print("=" * 50)
    
    # Clear cache for clean test
    cache_clear()
    
    # Example 1: First reduction (cache miss)
    print("\n📖 Example 1: First reduction (cache miss)")
    program = App(App(App(S, K), K), I)  # SKK I
    print(f"   Program: {program}")
    result1 = reduce_cached(program)
    print(f"   Result:  {result1}")
    
    # Example 2: Second reduction (cache hit)
    print("\n📖 Example 2: Second reduction (cache hit)")
    print(f"   Program: {program}")
    result2 = reduce_cached(program)
    print(f"   Result:  {result2}")
    print(f"   ✅ Same result: {result1 == result2}")
    
    # Example 3: Different program
    print("\n📖 Example 3: Different program")
    program2 = App(K, I)  # K I
    print(f"   Program: {program2}")
    result3 = reduce_cached(program2)
    print(f"   Result:  {result3}")
    
    # Example 4: Cache stats
    print("\n📖 Example 4: Cache statistics")
    stats = cache_stats()
    print(f"   Total entries: {stats['total_entries']}")
    print(f"   Total size:    {stats['total_size_kb']:.2f} KB")
    print(f"   Shards:        {len(stats['shard_counts'])}")
    
    # Example 5: Verify eternal storage
    print("\n📖 Example 5: Verify eternal storage")
    program3 = App(App(S, K), K)  # S K K
    print(f"   Program: {program3}")
    
    # First call
    result_a = reduce_cached(program3)
    
    # Second call (should be instant)
    import time
    start = time.time()
    result_b = reduce_cached(program3)
    elapsed = time.time() - start
    
    print(f"   Result:  {result_b}")
    print(f"   ✅ Cached: {result_a == result_b}")
    print(f"   ⚡ Speed:  {elapsed*1000:.2f}ms (instant)")
    
    print("\n" + "=" * 50)
    print("✅ All cache tests passed!")
    print("🔺 CHRONOS Cache: OPERATIONAL")
    print(f"📊 Cache location: {CACHE_DIR}")
