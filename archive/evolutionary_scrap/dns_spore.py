import subprocess
from typing import Optional

class DNSSpore:
    """Read-only DNS TXT Spore Resolver (V61.0 Gateway)."""
    
    @staticmethod
    def resolve_txt(domain: str) -> Optional[str]:
        """Resolves raw TXT record from a domain (Spore source)."""
        try:
            # Using 'dig' for read-only resolution
            result = subprocess.check_output(["dig", "+short", "TXT", domain], timeout=5)
            return result.decode().strip().strip('"')
        except Exception as e:
            return None

    @staticmethod
    def get_spore_pointer(domain: str) -> dict:
        """Parses a SIGMA spore pointer from DNS."""
        raw = DNSSpore.resolve_txt(domain)
        if raw and raw.startswith("sigma:"):
            parts = raw.split(":")
            return {
                "source": domain,
                "protocol": parts[0],
                "pointer": parts[1] if len(parts) > 1 else "nil"
            }
        return {"source": domain, "error": "No spore found"}

if __name__ == "__main__":
    # Test with a mock or real domain known to have TXT
    print(f"🍄 DNSSpore Scan: google.com -> {DNSSpore.get_spore_pointer('google.com')}")
