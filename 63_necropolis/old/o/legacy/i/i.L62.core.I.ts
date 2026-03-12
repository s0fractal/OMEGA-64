export const I = <T>(x: T): T => x, B = <T, U, V>(f: (u: U) => V) => (g: (t: T) => U) => (x: T): V => f(g(x));
