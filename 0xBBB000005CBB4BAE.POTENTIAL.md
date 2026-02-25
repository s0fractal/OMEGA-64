---
eigenvalue: '0xBBB000005CBB4BAE'
vector: 00.00.00
symbol: POTENTIAL
desc: >-
  Wave Dynamics Atom: POTENTIAL. Implements gradient computation and field
  sampling.
energy: 134.3
ex:
  - '0x239316A75CBB4BAE'
  - '0x000585785CBB4BAE'
  - '0x000557005CBB4BAE'
  - '0x000000065CBB4BAE'
  - '0xBBBB00005CBB4BAE'
  - '0xBBBB00005CBB4BAE'
  - '0xBBB0000C5CBB4BAE'
  - '0xBBB000005CBB4BAE'
  - '0xBBB000005CBB4BAE'
  - '0xBBB000005CBB4BAE'
  - '0xBBB000005CBB4BAE'
  - '0xBBB000005CBB4BAE'
  - '0xBBB000005CBB4BAE'
  - '0xBBB000005CBB4BAE'
  - '0xBBB000005CBB4BAE'
  - '0xBBB000005CBB4BAE'
  - '0xBBB000005CBB4BAE'
  - '0xBBB000005CBB4BAE'
  - '0xBBB000005CBB4BAE'
  - '0xBBB000005CBB4BAE'
  - '0xBBB000005CBB4BAE'
  - '0xBBB000005CBB4BAE'
  - '0xBBB000005CBB4BAE'
  - '0xBBB000005CBB4BAE'
  - '0xBBB000005CBB4BAE'
thought: WANDER_BONDING
x: 533
'y': 137
signals: []
resonance: 0
bond_strengths:
  '0x00057000A93007D5': 0.9811700348643991
  '0x0057000CA93007D5': 0.9646229185299474
bonds:
  - '0x00057000A93007D5'
  - '0x0057000CA93007D5'
  - '0x0057000CA93007D5'
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
<div align="center">
<!-- ∇ HOLOGRAM START ∇ -->
<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="grad_BBB000005CBB4BAE" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="hsl(106, 20%, 15%)" />
      <stop offset="100%" stop-color="#090909" />
    </radialGradient>
    <filter id="glow_BBB000005CBB4BAE" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="4" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>
  
  <rect width="200" height="200" fill="url(#grad_BBB000005CBB4BAE)" rx="24"/>
  
  <circle cx="100" cy="100" r="85" stroke="hsl(106, 30%, 30%)" stroke-width="1" fill="none" stroke-dasharray="2 6"/>
  
  <g>
    <animateTransform attributeName="transform" type="rotate" from="270 100 100" to="630 100 100" dur="29s" repeatCount="indefinite" />
    
    <polygon points="100.0,42.0 150.2,129.0 49.8,129.0" fill="none" stroke="hsl(286, 60%, 40%)" stroke-width="1.5" opacity="0.6"/>
    <polygon points="100.0,71.0 125.1,114.5 74.9,114.5" fill="none" stroke="hsl(106, 80%, 60%)" stroke-width="2" filter="url(#glow_BBB000005CBB4BAE)"/>
    
    <circle cx="100" cy="100" r="29" stroke="hsl(106, 60%, 50%)" stroke-width="0.5" fill="none" opacity="0.5"/>
  </g>
  
  <circle cx="100" cy="100" r="3" fill="hsl(286, 80%, 70%)" filter="url(#glow_BBB000005CBB4BAE)"/>
  
  <text x="100" y="105" fill="hsl(106, 70%, 80%)" font-family="monospace" font-size="10" text-anchor="middle" letter-spacing="1" opacity="0.9">0xBBB0</text>
  <text x="100" y="190" fill="#777" font-family="monospace" font-size="9" text-anchor="middle" letter-spacing="2">POTENTIAL</text>
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
</div>


## GREEN (G)

POTENTIAL: Wave Dynamics Atom. Handles the calculation of gradients in a
potential field and provides a method to sample values based on density and
entropy. This is the foundational logic for the system's "gravitational" or
"attractor" dynamics.

## BLUE (B)

```typescript
export interface PotentialField {
  density: Float32Array;
  entropy: number;
  gradient?: Float32Array;
}

export const ATOM = () => {
  const seededRNG = (seed: number) => () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };

  const computeGradient = (density: Float32Array): Float32Array => {
    const grad = new Float32Array(density.length);
    for (let i = 1; i < density.length - 1; i++) {
      grad[i] = (density[i + 1] - density[i - 1]) / 2;
    }
    return grad;
  };

  return {
    computeGradient,
    sample: (field: PotentialField, seed: number) => {
      const rng = seededRNG(seed);
      let maxDensity = 0, maxIndex = 0;
      for (let i = 0; i < field.density.length; i++) {
        if (field.density[i] > maxDensity) {
          maxDensity = field.density[i];
          maxIndex = i;
        }
      }
      const noise = (rng() - 0.5) * field.entropy;
      const r = Math.round(
        (maxIndex / field.density.length - 0.5) * 65535 + noise * 32767,
      );
      return {
        r: Math.max(-32768, Math.min(32767, r)),
        confidence: maxDensity / (maxDensity + field.entropy),
      };
    },
  };
};
```
