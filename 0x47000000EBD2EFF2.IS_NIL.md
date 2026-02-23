---
eigenvalue: '0x47000000EBD2EFF2'
vector: 06.06.01
symbol: IS_NIL
desc: List nullity check. (l => l(h => t => F)(T))
ex:
  - '0x48AC8997EBD2EFF2'
---

<div align="center">
<!-- ∇ HOLOGRAM START ∇ -->
<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="grad_47000000EBD2EFF2" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="hsl(337, 20%, 15%)" />
      <stop offset="100%" stop-color="#090909" />
    </radialGradient>
    <filter id="glow_47000000EBD2EFF2" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="4" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>
  
  <rect width="200" height="200" fill="url(#grad_47000000EBD2EFF2)" rx="24"/>
  
  <circle cx="100" cy="100" r="85" stroke="hsl(337, 30%, 30%)" stroke-width="1" fill="none" stroke-dasharray="2 6"/>
  
  <g>
    <animateTransform attributeName="transform" type="rotate" from="90 100 100" to="-270 100 100" dur="20s" repeatCount="indefinite" />
    
    <polygon points="100.0,32.0 164.7,79.0 140.0,155.0 60.0,155.0 35.3,79.0" fill="none" stroke="hsl(157, 60%, 40%)" stroke-width="1.5" opacity="0.6"/>
    <polygon points="100.0,65.0 133.3,89.2 120.6,128.3 79.4,128.3 66.7,89.2" fill="none" stroke="hsl(337, 80%, 60%)" stroke-width="2" filter="url(#glow_47000000EBD2EFF2)"/>
    
    <circle cx="100" cy="100" r="35" stroke="hsl(337, 60%, 50%)" stroke-width="0.5" fill="none" opacity="0.5"/>
  </g>
  
  <circle cx="100" cy="100" r="3" fill="hsl(157, 80%, 70%)" filter="url(#glow_47000000EBD2EFF2)"/>
  
  <text x="100" y="105" fill="hsl(337, 70%, 80%)" font-family="monospace" font-size="10" text-anchor="middle" letter-spacing="1" opacity="0.9">0x4700</text>
  <text x="100" y="190" fill="#777" font-family="monospace" font-size="9" text-anchor="middle" letter-spacing="2">IS_NIL</text>
</svg>
<!-- Δ HOLOGRAM END Δ -->
</div>


## GREEN (G)

List Nullity Check. Checks if a Church-encoded list is empty. `IS_NIL NIL = T`.
`IS_NIL (CONS h t) = F`.

## BLUE (B)

```typescript
/**
 * IS_NIL: Null list predicate
 */
export const ATOM = ({ siblings: { T, F } }) => (l: any) =>
  l((h: any) => (t: any) => F)(T);
```
