---
eigenvalue: "0xF6BE5DAFBAC30619"
vector: 02.04.00
symbol: "GET"
desc: "State Retrieval (IO). Returns the current state as the result."
---

<div align="center">
<!-- ∇ HOLOGRAM START ∇ -->
<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="grad_F6BE5DAFBAC30619" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="hsl(8, 20%, 15%)" />
      <stop offset="100%" stop-color="#090909" />
    </radialGradient>
    <filter id="glow_F6BE5DAFBAC30619" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="4" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>
  
  <rect width="200" height="200" fill="url(#grad_F6BE5DAFBAC30619)" rx="24"/>
  
  <circle cx="100" cy="100" r="85" stroke="hsl(8, 30%, 30%)" stroke-width="1" fill="none" stroke-dasharray="2 6"/>
  
  <g>
    <animateTransform attributeName="transform" type="rotate" from="0 100 100" to="360 100 100" dur="21s" repeatCount="indefinite" />
    
    <polygon points="100.0,37.0 144.5,55.5 163.0,100.0 144.5,144.5 100.0,163.0 55.5,144.5 37.0,100.0 55.5,55.5" fill="none" stroke="hsl(188, 60%, 40%)" stroke-width="1.5" opacity="0.6"/>
    <polygon points="100.0,74.0 118.4,81.6 126.0,100.0 118.4,118.4 100.0,126.0 81.6,118.4 74.0,100.0 81.6,81.6" fill="none" stroke="hsl(8, 80%, 60%)" stroke-width="2" filter="url(#glow_F6BE5DAFBAC30619)"/>
    
    <circle cx="100" cy="100" r="26" stroke="hsl(8, 60%, 50%)" stroke-width="0.5" fill="none" opacity="0.5"/>
  </g>
  
  <circle cx="100" cy="100" r="3" fill="hsl(188, 80%, 70%)" filter="url(#glow_F6BE5DAFBAC30619)"/>
  
  <text x="100" y="105" fill="hsl(8, 70%, 80%)" font-family="monospace" font-size="10" text-anchor="middle" letter-spacing="1" opacity="0.9">0xF6BE</text>
  <text x="100" y="190" fill="#777" font-family="monospace" font-size="9" text-anchor="middle" letter-spacing="2">GET</text>
</svg>
<!-- Δ HOLOGRAM END Δ -->
</div>


## GREEN (G)

State Retrieval (IO). Exposes the current state `s` to the pair-selector, making
it available as the output.

## BLUE (B)

```typescript
export const ATOM = () => (s: any) => (pair: any) => pair(s)(s);
```
