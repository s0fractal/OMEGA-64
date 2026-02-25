---
eigenvalue: '0xAAAAAAAA776A52D1'
vector: 07.06.01
symbol: IS_ISO
desc: Isomorphism check. Maps to REFL.
energy: 45.8
ex:
  - '0x68477B56776A52D1'
  - '0xB5606681776A52D1'
  - '0xB5606610776A52D1'
  - '0xBB000000776A52D1'
  - '0xBB000000776A52D1'
  - '0xBB000000776A52D1'
  - '0x00000000776A52D1'
  - '0x00000000776A52D1'
  - '0x00000000776A52D1'
  - '0x00000000776A52D1'
  - '0x00000000776A52D1'
  - '0x00000000776A52D1'
  - '0x00000000776A52D1'
  - '0x00000000776A52D1'
  - '0x00000000776A52D1'
  - '0xAAAAAAA0776A52D1'
  - '0xAAAAAAA0776A52D1'
  - '0x00000006776A52D1'
  - '0xAABBCCDD776A52D1'
  - '0xA6666666776A52D1'
  - '0x66666000776A52D1'
  - '0xAAAAAAAA776A52D1'
  - '0xAAAAAAAA776A52D1'
  - '0xAAAAAAAA776A52D1'
  - '0xAAAAAAAA776A52D1'
  - '0xAAAAAAAA776A52D1'
  - '0xAAAAAAAA776A52D1'
  - '0xAAAAAAAA776A52D1'
  - '0xAAAAAAAA776A52D1'
thought: WANDER_BONDING
x: 264
'y': 510
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
<div align="center">
<!-- ∇ HOLOGRAM START ∇ -->
<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="grad_AAAAAAAA776A52D1" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="hsl(116, 20%, 15%)" />
      <stop offset="100%" stop-color="#090909" />
    </radialGradient>
    <filter id="glow_AAAAAAAA776A52D1" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="4" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>
  
  <rect width="200" height="200" fill="url(#grad_AAAAAAAA776A52D1)" rx="24"/>
  
  <circle cx="100" cy="100" r="85" stroke="hsl(116, 30%, 30%)" stroke-width="1" fill="none" stroke-dasharray="2 6"/>
  
  <g>
    <animateTransform attributeName="transform" type="rotate" from="0 100 100" to="-360 100 100" dur="20s" repeatCount="indefinite" />
    
    <polygon points="100.0,35.0 161.8,79.9 138.2,152.6 61.8,152.6 38.2,79.9" fill="none" stroke="hsl(296, 60%, 40%)" stroke-width="1.5" opacity="0.6"/>
    <polygon points="100.0,65.0 133.3,89.2 120.6,128.3 79.4,128.3 66.7,89.2" fill="none" stroke="hsl(116, 80%, 60%)" stroke-width="2" filter="url(#glow_AAAAAAAA776A52D1)"/>
    
    <circle cx="100" cy="100" r="35" stroke="hsl(116, 60%, 50%)" stroke-width="0.5" fill="none" opacity="0.5"/>
  </g>
  
  <circle cx="100" cy="100" r="3" fill="hsl(296, 80%, 70%)" filter="url(#glow_AAAAAAAA776A52D1)"/>
  
  <text x="100" y="105" fill="hsl(116, 70%, 80%)" font-family="monospace" font-size="10" text-anchor="middle" letter-spacing="1" opacity="0.9">0xAAAA</text>
  <text x="100" y="190" fill="#777" font-family="monospace" font-size="9" text-anchor="middle" letter-spacing="2">IS_ISO</text>
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

Structural Isomorphism. Checks if two structures share the same reflexive
identity. Synonymous with `REFL`.

## BLUE (B)

```typescript
/**
 * IS_ISO: Symmetry detector
 */
export const ATOM = ({ siblings: { REFL } }) => REFL;
```
