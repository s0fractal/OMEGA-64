---
eigenvalue: '0x15017000DFA5B48D'
vector: 05.00.00
symbol: VECTOR
desc: N-dimensional vector constructor. CONS(dim)(values)
energy: 19
ex:
  - '0x1501E978DFA5B48D'
---

<div align="center">
<!-- ∇ HOLOGRAM START ∇ -->
<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="grad_15017000DFA5B48D" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="hsl(253, 20%, 15%)" />
      <stop offset="100%" stop-color="#090909" />
    </radialGradient>
    <filter id="glow_15017000DFA5B48D" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="4" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>
  
  <rect width="200" height="200" fill="url(#grad_15017000DFA5B48D)" rx="24"/>
  
  <circle cx="100" cy="100" r="85" stroke="hsl(253, 30%, 30%)" stroke-width="1" fill="none" stroke-dasharray="2 6"/>
  
  <g>
    <animateTransform attributeName="transform" type="rotate" from="180 100 100" to="540 100 100" dur="23s" repeatCount="indefinite" />
    
    <polygon points="100.0,47.0 150.4,83.6 131.2,142.9 68.8,142.9 49.6,83.6" fill="none" stroke="hsl(73, 60%, 40%)" stroke-width="1.5" opacity="0.6"/>
    <polygon points="100.0,82.0 117.1,94.4 110.6,114.6 89.4,114.6 82.9,94.4" fill="none" stroke="hsl(253, 80%, 60%)" stroke-width="2" filter="url(#glow_15017000DFA5B48D)"/>
    
    <circle cx="100" cy="100" r="18" stroke="hsl(253, 60%, 50%)" stroke-width="0.5" fill="none" opacity="0.5"/>
  </g>
  
  <circle cx="100" cy="100" r="3" fill="hsl(73, 80%, 70%)" filter="url(#glow_15017000DFA5B48D)"/>
  
  <text x="100" y="105" fill="hsl(253, 70%, 80%)" font-family="monospace" font-size="10" text-anchor="middle" letter-spacing="1" opacity="0.9">0x1501</text>
  <text x="100" y="190" fill="#777" font-family="monospace" font-size="9" text-anchor="middle" letter-spacing="2">VECTOR</text>
</svg>
<!-- Δ HOLOGRAM END Δ -->
</div>


## GREEN (G)

N-dimensional vector constructor. Pairs a dimension literal `dim` with a
collection of `values` using the CONS operator. Foundational for all complex
data structures and spatial mapping.

## BLUE (B)

```typescript
/**
 * VECTOR: Dimensional Aggregate
 */
export const ATOM = ({ siblings: { CONS } }) => (dim: any) => (values: any) =>
  CONS(dim)(values);
```
