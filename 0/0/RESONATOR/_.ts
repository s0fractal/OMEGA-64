/**
 * RESONATOR: Active Toroidal Memory Loop
 * Based on the Y-combinator (Fixed-point operator).
 * Creates a stable standing wave by infinitely passing state through a transform.
 */

export const Y = () => (f: any) => ((x: any) => f((v: any) => x(x)(v)))((x: any) => f((v: any) => x(x)(v)));

/**
 * Creates a resonant orbit for a state 's' using transform 'f'.
 */
export const ORBIT = ({ siblings: { Y } }) => (f: any) => (s: any) => Y(f)(s);

export const ATOM = () => ({
  Y,
  ORBIT,
});
