
/**
 * [5/1/OBSERVABLE/_.ts]
 * Observable state wrapper
 */
export const ATOM = () => (f: any) => (obs: any) => f(obs);
