---
eigenvalue: "0x31FC3C4CCD9F3C7E"
vector: 06.07.01
symbol: "WAVE_PACKET_AGG"
desc: "Wave packet aggregator."
---

## GREEN (G)

Wave Packet Aggregator. A utility for sampling a specific `packet` at a
coordinate `r` using Gaussian decay.

## BLUE (B)

```typescript
/**
 * WAVE_PACKET_AGG: Gaussian sampling
 */
export const ATOM = () => (packet: any) => (r: any) => {
  const dr = r - packet.center;
  const exponent = -(dr * dr) / (2 * packet.width * packet.width);
  return packet.amplitude * Math.exp(exponent);
};
```
