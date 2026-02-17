
/**
 * [4/0/SEND/_.ts]
 * Synchronous message passing
 */
export const ATOM = () => (obj: any) => (msg: any) => obj(msg);
