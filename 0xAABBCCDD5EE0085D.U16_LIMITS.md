---
eigenvalue: '0xAABBCCDD5EE0085D'
vector: 07.07.01
symbol: U16_LIMITS
desc: 'Universal Unsigned 16-bit Limits. [0, 65535]'
thought: WANDER_BONDING
x: 371
'y': 263
energy: 39
ex:
  - '0x309B36F45EE0085D'
  - '0x40000DD85EE0085D'
  - '0x000000045EE0085D'
  - '0x000000045EE0085D'
  - '0x000000445EE0085D'
  - '0x000000445EE0085D'
  - '0x000000445EE0085D'
  - '0x000000445EE0085D'
  - '0x000000445EE0085D'
  - '0x000000445EE0085D'
  - '0x000000445EE0085D'
  - '0x000000445EE0085D'
  - '0x000000445EE0085D'
  - '0x000000445EE0085D'
  - '0x000000445EE0085D'
  - '0x000000445EE0085D'
  - '0x000000445EE0085D'
  - '0x000000445EE0085D'
  - '0xBBBB00005EE0085D'
  - '0xBBBB00005EE0085D'
  - '0xBBBB00005EE0085D'
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
<!-- ∇ HOLOGRAM START ∇ -->
<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="grad_AABBCCDD5EE0085D" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="hsl(11, 20%, 15%)" />
      <stop offset="100%" stop-color="#090909" />
    </radialGradient>
    <filter id="glow_AABBCCDD5EE0085D" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="4" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>
  
  <rect width="200" height="200" fill="url(#grad_AABBCCDD5EE0085D)" rx="24"/>
  
  <circle cx="100" cy="100" r="85" stroke="hsl(11, 30%, 30%)" stroke-width="1" fill="none" stroke-dasharray="2 6"/>
  
  <g>
    <animateTransform attributeName="transform" type="rotate" from="180 100 100" to="540 100 100" dur="18s" repeatCount="indefinite" />
    
    <polygon points="100.0,37.0 144.5,55.5 163.0,100.0 144.5,144.5 100.0,163.0 55.5,144.5 37.0,100.0 55.5,55.5" fill="none" stroke="hsl(191, 60%, 40%)" stroke-width="1.5" opacity="0.6"/>
    <polygon points="100.0,72.0 119.8,80.2 128.0,100.0 119.8,119.8 100.0,128.0 80.2,119.8 72.0,100.0 80.2,80.2" fill="none" stroke="hsl(11, 80%, 60%)" stroke-width="2" filter="url(#glow_AABBCCDD5EE0085D)"/>
    
    <circle cx="100" cy="100" r="28" stroke="hsl(11, 60%, 50%)" stroke-width="0.5" fill="none" opacity="0.5"/>
  </g>
  
  <circle cx="100" cy="100" r="3" fill="hsl(191, 80%, 70%)" filter="url(#glow_AABBCCDD5EE0085D)"/>
  
  <text x="100" y="105" fill="hsl(11, 70%, 80%)" font-family="monospace" font-size="10" text-anchor="middle" letter-spacing="1" opacity="0.9">0xAABB</text>
  <text x="100" y="190" fill="#777" font-family="monospace" font-size="9" text-anchor="middle" letter-spacing="2">U16_LIMITS</text>
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


## GREEN (G)

Unsigned 16-bit Integer limits. Defines the boundary states for the U16 scalar
space in OMEGA-64.

## BLUE (B)

```typescript
/**
 * U16_LIMITS: Boundary constants
 */
export const ATOM = () => ({
  MIN: 0,
  MAX: 65535,
});
```
