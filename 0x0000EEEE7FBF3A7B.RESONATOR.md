---
eigenvalue: '0x264400007FBF3A7B'
vector: 00.00.10
symbol: RESONATOR
desc: >-
  Active Toroidal Memory Loop. Uses a Y-combinator to create stable resonant
  orbits for lambda states.
relations:
  concept:
    - Standing Wave
    - Echo Memory
x: 785
'y': 467
energy: 95
ex:
  - '0x29AC6A4D7FBF3A7B'
---

<div align="center">
<!-- ∇ HOLOGRAM START ∇ -->
<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="grad_264400007FBF3A7B" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="hsl(82, 20%, 15%)" />
      <stop offset="100%" stop-color="#090909" />
    </radialGradient>
    <filter id="glow_264400007FBF3A7B" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="4" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>
  
  <rect width="200" height="200" fill="url(#grad_264400007FBF3A7B)" rx="24"/>
  
  <circle cx="100" cy="100" r="85" stroke="hsl(82, 30%, 30%)" stroke-width="1" fill="none" stroke-dasharray="2 6"/>
  
  <g>
    <animateTransform attributeName="transform" type="rotate" from="90 100 100" to="450 100 100" dur="13s" repeatCount="indefinite" />
    
    <polygon points="100.0,52.0 137.5,70.1 146.8,110.7 120.8,143.2 79.2,143.2 53.2,110.7 62.5,70.1" fill="none" stroke="hsl(262, 60%, 40%)" stroke-width="1.5" opacity="0.6"/>
    <polygon points="100.0,82.0 114.1,88.8 117.5,104.0 107.8,116.2 92.2,116.2 82.5,104.0 85.9,88.8" fill="none" stroke="hsl(82, 80%, 60%)" stroke-width="2" filter="url(#glow_264400007FBF3A7B)"/>
    
    <circle cx="100" cy="100" r="18" stroke="hsl(82, 60%, 50%)" stroke-width="0.5" fill="none" opacity="0.5"/>
  </g>
  
  <circle cx="100" cy="100" r="3" fill="hsl(262, 80%, 70%)" filter="url(#glow_264400007FBF3A7B)"/>
  
  <text x="100" y="105" fill="hsl(82, 70%, 80%)" font-family="monospace" font-size="10" text-anchor="middle" letter-spacing="1" opacity="0.9">0x2644</text>
  <text x="100" y="190" fill="#777" font-family="monospace" font-size="9" text-anchor="middle" letter-spacing="2">RESONATOR</text>
</svg>
<!-- Δ HOLOGRAM END Δ -->
</div>


## GREEN (G)

RESONATOR: Active Toroidal Memory Loop based on the Y-combinator (Fixed-point
operator). Creates a stable standing wave by infinitely passing state through a
transform. Used for state persistence in the non-local wave network.

## BLUE (B)

```typescript
export const Y = () => (f: any) =>
  ((x: any) => f((v: any) => x(x)(v)))((x: any) => f((v: any) => x(x)(v)));

/**
 * Creates a resonant orbit for a state 's' using transform 'f'.
 */
export const ORBIT = ({ siblings: { Y } }) => (f: any) => (s: any) => Y(f)(s);

export const ATOM = () => ({
  Y,
  ORBIT,
});
```
