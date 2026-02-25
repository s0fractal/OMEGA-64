---
eigenvalue: '0xAAAAAAA0EC38C511'
vector: 00.00.01
symbol: IS_ZERO
desc: 'Church Encoding: IS_ZERO Predicate'
legacy_idx: 63
thought: WANDER_BONDING
x: 364
'y': 222
energy: 8
ex:
  - '0xA7C64D97EC38C511'
  - '0x6764000EEC38C511'
  - '0x0000781CEC38C511'
  - '0x00071008EC38C511'
  - '0x00071000EC38C511'
  - '0x00071000EC38C511'
  - '0x00710008EC38C511'
  - '0xBB000000EC38C511'
  - '0xBBBB0000EC38C511'
  - '0xBBBB0000EC38C511'
  - '0xBBBB0000EC38C511'
  - '0xBBBB0000EC38C511'
  - '0xBBBB0000EC38C511'
  - '0xBBBB0000EC38C511'
  - '0xAAAAAAA0EC38C511'
  - '0xAAAAAAA0EC38C511'
signals: []
resonance: 0
bond_strengths: {}
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
<!-- ∇ HOLOGRAM START ∇ -->
<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="grad_AAAAAAA0EC38C511" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="hsl(277, 20%, 15%)" />
      <stop offset="100%" stop-color="#090909" />
    </radialGradient>
    <filter id="glow_AAAAAAA0EC38C511" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="4" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>
  
  <rect width="200" height="200" fill="url(#grad_AAAAAAA0EC38C511)" rx="24"/>
  
  <circle cx="100" cy="100" r="85" stroke="hsl(277, 30%, 30%)" stroke-width="1" fill="none" stroke-dasharray="2 6"/>
  
  <g>
    <animateTransform attributeName="transform" type="rotate" from="0 100 100" to="-360 100 100" dur="22s" repeatCount="indefinite" />
    
    <polygon points="100.0,26.0 157.9,53.9 172.1,116.5 132.1,166.7 67.9,166.7 27.9,116.5 42.1,53.9" fill="none" stroke="hsl(97, 60%, 40%)" stroke-width="1.5" opacity="0.6"/>
    <polygon points="100.0,63.0 128.9,76.9 136.1,108.2 116.1,133.3 83.9,133.3 63.9,108.2 71.1,76.9" fill="none" stroke="hsl(277, 80%, 60%)" stroke-width="2" filter="url(#glow_AAAAAAA0EC38C511)"/>
    
    <circle cx="100" cy="100" r="37" stroke="hsl(277, 60%, 50%)" stroke-width="0.5" fill="none" opacity="0.5"/>
  </g>
  
  <circle cx="100" cy="100" r="3" fill="hsl(97, 80%, 70%)" filter="url(#glow_AAAAAAA0EC38C511)"/>
  
  <text x="100" y="105" fill="hsl(277, 70%, 80%)" font-family="monospace" font-size="10" text-anchor="middle" letter-spacing="1" opacity="0.9">0xAAAA</text>
  <text x="100" y="190" fill="#777" font-family="monospace" font-size="9" text-anchor="middle" letter-spacing="2">IS_ZERO</text>
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


## GREEN (G)

IS_ZERO Predicate for Church Numerals. Returns T if the numeral is zero, F
otherwise.

## BLUE (B)

```typescript
export const ATOM = ({ siblings: { T, F } }) => (n: any) => n((x: any) => F)(T);
```
