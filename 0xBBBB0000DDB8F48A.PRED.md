---
eigenvalue: '0xBBBB0000DDB8F48A'
vector: 01.00.00
symbol: PRED
desc: 'Church Encoding: Predecessor function. Maps n to n-1.'
ex:
  - '0x76803B78DDB8F48A'
  - '0x603B700ADDB8F48A'
  - '0x00300D81DDB8F48A'
  - '0x03001004DDB8F48A'
  - '0x03001004DDB8F48A'
  - '0x03001004DDB8F48A'
  - '0x03001002DDB8F48A'
  - '0x30010048DDB8F48A'
  - '0x30010040DDB8F48A'
  - '0x30010040DDB8F48A'
  - '0x30010040DDB8F48A'
  - '0x30010040DDB8F48A'
  - '0x30010040DDB8F48A'
  - '0x30010040DDB8F48A'
  - '0x30010040DDB8F48A'
  - '0x30010040DDB8F48A'
  - '0x60000000DDB8F48A'
  - '0x60000000DDB8F48A'
  - '0x00000000DDB8F48A'
  - '0xAAA0AAAADDB8F48A'
  - '0xAAA0AAAADDB8F48A'
  - '0xAAA0AAAADDB8F48A'
  - '0x66666600DDB8F48A'
  - '0x66666660DDB8F48A'
  - '0x66666660DDB8F48A'
  - '0xBA000000DDB8F48A'
  - '0xBA0A0000DDB8F48A'
  - '0x00000000DDB8F48A'
  - '0x06666666DDB8F48A'
  - '0x06666666DDB8F48A'
  - '0x66666666DDB8F48A'
  - '0x66666666DDB8F48A'
  - '0x60000000DDB8F48A'
  - '0x60000000DDB8F48A'
  - '0x06600006DDB8F48A'
  - '0x00666000DDB8F48A'
  - '0x000A0A00DDB8F48A'
  - '0xBBBB0000DDB8F48A'
  - '0xBBBB0000DDB8F48A'
thought: WANDER_BONDING
x: 121
'y': 166
energy: 27.79999999999999
signals: []
resonance: 0
bond_strengths:
  '0x000354022A40A908': 0.9675225846837673
  '0x0035402E2A40A908': 0.9694605362958227
bonds:
  - '0x000354022A40A908'
  - '0x0035402E2A40A908'
---

<div align="center">
<div align="center">
<div align="center">
<div align="center">
<div align="center">
<div align="center">
<div align="center">
<div align="center">
<div align="center">
<div align="center">
<div align="center">
<div align="center">
<div align="center">
<div align="center">
<div align="center">
<div align="center">
<div align="center">
<div align="center">
<div align="center">
<div align="center">
<!-- ∇ HOLOGRAM START ∇ -->
<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="grad_BBBB0000DDB8F48A" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="hsl(343, 20%, 15%)" />
      <stop offset="100%" stop-color="#090909" />
    </radialGradient>
    <filter id="glow_BBBB0000DDB8F48A" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="4" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>
  
  <rect width="200" height="200" fill="url(#grad_BBBB0000DDB8F48A)" rx="24"/>
  
  <circle cx="100" cy="100" r="85" stroke="hsl(343, 30%, 30%)" stroke-width="1" fill="none" stroke-dasharray="2 6"/>
  
  <g>
    <animateTransform attributeName="transform" type="rotate" from="90 100 100" to="450 100 100" dur="10s" repeatCount="indefinite" />
    
    <polygon points="100.0,48.0 149.5,83.9 130.6,142.1 69.4,142.1 50.5,83.9" fill="none" stroke="hsl(163, 60%, 40%)" stroke-width="1.5" opacity="0.6"/>
    <polygon points="100.0,75.0 123.8,92.3 114.7,120.2 85.3,120.2 76.2,92.3" fill="none" stroke="hsl(343, 80%, 60%)" stroke-width="2" filter="url(#glow_BBBB0000DDB8F48A)"/>
    
    <circle cx="100" cy="100" r="25" stroke="hsl(343, 60%, 50%)" stroke-width="0.5" fill="none" opacity="0.5"/>
  </g>
  
  <circle cx="100" cy="100" r="3" fill="hsl(163, 80%, 70%)" filter="url(#glow_BBBB0000DDB8F48A)"/>
  
  <text x="100" y="105" fill="hsl(343, 70%, 80%)" font-family="monospace" font-size="10" text-anchor="middle" letter-spacing="1" opacity="0.9">0xBBBB</text>
  <text x="100" y="190" fill="#777" font-family="monospace" font-size="9" text-anchor="middle" letter-spacing="2">PRED</text>
</svg>
<!-- Δ HOLOGRAM END Δ -->
</div>
</div>
</div>
</div>
</div>
</div>
</div>
</div>
</div>
</div>
</div>
</div>
</div>
</div>
</div>
</div>
</div>
</div>
</div>
</div>


## GREEN (G)

The Predecessor function for Church-encoded numerals. Transforms a numeral
representing `n` into one representing `n-1`.

## BLUE (B)

```typescript
/**
 * PRED: Church Encoding Predecessor
 */
export const ATOM = () => (n: any) => (f: any) => (x: any) =>
  n((g: any) => (h: any) => h(g(f)))((_: any) => x)((u: any) => u);
```
