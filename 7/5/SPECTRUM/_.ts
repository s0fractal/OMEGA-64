
/**
 * [7/5/SPECTRUM/_.ts]
 * Inverted from Legacy L02.
 */
export const ATOM = () => (layer: number, entropy: number, stability: number): string =>
  `hsl(${Math.floor((layer / 64) * 360)}, ${Math.max(0, Math.min(100, Math.round(100 - entropy * 50)))}%, ${Math.max(0, Math.min(100, Math.round(30 + stability * 40)))}%)`;
