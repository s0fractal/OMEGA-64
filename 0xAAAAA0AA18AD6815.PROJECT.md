---
eigenvalue: '0xAAAAA0AA18AD6815'
vector: 07.05.00
symbol: PROJECT
desc: Relational projection (List map). MAP(transform)(rel)
x: 488
'y': 262
energy: 30.199999999999996
ex:
  - '0x10092F5018AD6815'
  - '0x500087EE18AD6815'
  - '0x0007000C18AD6815'
  - '0x0007000018AD6815'
  - '0x0007000018AD6815'
  - '0x0007000018AD6815'
  - '0x0007000018AD6815'
  - '0x0007000018AD6815'
  - '0x0070000718AD6815'
  - '0x0070000718AD6815'
  - '0x0070000718AD6815'
  - '0x0070000718AD6815'
  - '0x0070000718AD6815'
  - '0x0070000718AD6815'
  - '0x0070000718AD6815'
  - '0x0070000718AD6815'
  - '0x0070000718AD6815'
  - '0x0070000718AD6815'
  - '0x0070000718AD6815'
  - '0x0070000718AD6815'
  - '0x0070000718AD6815'
  - '0xBB00000018AD6815'
  - '0xAAAAA0AA18AD6815'
  - '0xAAAAA0AA18AD6815'
thought: WANDER_BONDING
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
    <radialGradient id="grad_AAAAA0AA18AD6815" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="hsl(146, 20%, 15%)" />
      <stop offset="100%" stop-color="#090909" />
    </radialGradient>
    <filter id="glow_AAAAA0AA18AD6815" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="4" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>
  
  <rect width="200" height="200" fill="url(#grad_AAAAA0AA18AD6815)" rx="24"/>
  
  <circle cx="100" cy="100" r="85" stroke="hsl(146, 30%, 30%)" stroke-width="1" fill="none" stroke-dasharray="2 6"/>
  
  <g>
    <animateTransform attributeName="transform" type="rotate" from="180 100 100" to="-180 100 100" dur="27s" repeatCount="indefinite" />
    
    <polygon points="100.0,51.0 138.3,69.4 147.8,110.9 121.3,144.1 78.7,144.1 52.2,110.9 61.7,69.4" fill="none" stroke="hsl(326, 60%, 40%)" stroke-width="1.5" opacity="0.6"/>
    <polygon points="100.0,68.0 125.0,80.0 131.2,107.1 113.9,128.8 86.1,128.8 68.8,107.1 75.0,80.0" fill="none" stroke="hsl(146, 80%, 60%)" stroke-width="2" filter="url(#glow_AAAAA0AA18AD6815)"/>
    
    <circle cx="100" cy="100" r="32" stroke="hsl(146, 60%, 50%)" stroke-width="0.5" fill="none" opacity="0.5"/>
  </g>
  
  <circle cx="100" cy="100" r="3" fill="hsl(326, 80%, 70%)" filter="url(#glow_AAAAA0AA18AD6815)"/>
  
  <text x="100" y="105" fill="hsl(146, 70%, 80%)" font-family="monospace" font-size="10" text-anchor="middle" letter-spacing="1" opacity="0.9">0xAAAA</text>
  <text x="100" y="190" fill="#777" font-family="monospace" font-size="9" text-anchor="middle" letter-spacing="2">PROJECT</text>
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


## GREEN (G)

Relational PROJECTION. Maps a transformation function over a relation or list
structure. `PROJECT rel transform = MAP transform rel`.

## BLUE (B)

```typescript
/**
 * PROJECT: Relation mapping
 */
export const ATOM = ({ siblings: { MAP } }) => (rel: any) => (transform: any) =>
  MAP(transform)(rel);
```
