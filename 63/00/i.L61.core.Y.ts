import { T } from "./i.L32.core.T.ts";
export const Y = (f: any): any =>
    ((g: any) => g(g))((g: any) => f((x: any) => g(g)(x))),
  φ = <T, R>(f: (a: R) => (b: R) => R) => (i: (x: T) => R) => (e: R) =>
    Y((r: any) => (a: T[]): R =>
      (a.length === 0)
        ? e
        : (a.length === 1)
        ? i(a[0])
        : f(r(a.slice(0, (a.length / 2) | 0)))(r(a.slice((a.length / 2) | 0)))
    );
