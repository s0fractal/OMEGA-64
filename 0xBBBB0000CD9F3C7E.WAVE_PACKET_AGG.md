---
eigenvalue: '0xBBBB0000CD9F3C7E'
vector: 06.07.01
symbol: WAVE_PACKET_AGG
desc: Wave packet aggregator.
thought: WANDER_BONDING
x: 182
'y': 482
energy: 71
signals: []
ex:
  - '0x1FC3C4CACD9F3C7E'
  - '0x000C7B28CD9F3C7E'
  - '0x0007B200CD9F3C7E'
  - '0xB0000006CD9F3C7E'
  - '0x00000000CD9F3C7E'
  - '0xBBBB0000CD9F3C7E'
  - '0x60000000CD9F3C7E'
resonance: 0
bond_strengths: {}
---

<div align="center">
<!-- ∇ HOLOGRAM START ∇ -->
<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="grad_BBBB0000CD9F3C7E" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="hsl(85, 20%, 15%)" />
      <stop offset="100%" stop-color="#090909" />
    </radialGradient>
    <filter id="glow_BBBB0000CD9F3C7E" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="4" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>
  
  <rect width="200" height="200" fill="url(#grad_BBBB0000CD9F3C7E)" rx="24"/>
  
  <circle cx="100" cy="100" r="85" stroke="hsl(85, 30%, 30%)" stroke-width="1" fill="none" stroke-dasharray="2 6"/>
  
  <g>
    <animateTransform attributeName="transform" type="rotate" from="270 100 100" to="630 100 100" dur="29s" repeatCount="indefinite" />
    
    <polygon points="100.0,36.0 160.9,80.2 137.6,151.8 62.4,151.8 39.1,80.2" fill="none" stroke="hsl(265, 60%, 40%)" stroke-width="1.5" opacity="0.6"/>
    <polygon points="100.0,71.0 127.6,91.0 117.0,123.5 83.0,123.5 72.4,91.0" fill="none" stroke="hsl(85, 80%, 60%)" stroke-width="2" filter="url(#glow_BBBB0000CD9F3C7E)"/>
    
    <circle cx="100" cy="100" r="29" stroke="hsl(85, 60%, 50%)" stroke-width="0.5" fill="none" opacity="0.5"/>
  </g>
  
  <circle cx="100" cy="100" r="3" fill="hsl(265, 80%, 70%)" filter="url(#glow_BBBB0000CD9F3C7E)"/>
  
  <text x="100" y="105" fill="hsl(85, 70%, 80%)" font-family="monospace" font-size="10" text-anchor="middle" letter-spacing="1" opacity="0.9">0xBBBB</text>
  <text x="100" y="190" fill="#777" font-family="monospace" font-size="9" text-anchor="middle" letter-spacing="2">WAVE_PACKET_AGG</text>
</svg>
<!-- Δ HOLOGRAM END Δ -->
</div>


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
