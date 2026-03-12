
import urllib.request
import json

def get_latest_bitcoin_hash():
    """
    Fetches the latest block hash from the Bitcoin network.
    Uses Blockchair API as a public, non-auth source.
    """
    url = "https://api.blockchair.com/bitcoin/stats"
    try:
        with urllib.request.urlopen(url) as response:
            data = json.loads(response.read().decode())
            # best_block_hash
            return data['data']['best_block_hash']
    except Exception as e:
        print(f"⚠️ Pulse Error: {e}")
        # Return a fallback deterministic hash
        return "00000000000000000003b0c5f0d8e8f8a8b8c8d8e8f8a8b8c8d8e8f8a8b8c8d8"

if __name__ == "__main__":
    print(f"📡 Current Pulse: {get_latest_bitcoin_hash()}")
