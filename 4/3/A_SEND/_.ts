
/**
 * [4/3/A_SEND/_.ts]
 * Asynchronous / Actor message passing
 */
export const ATOM = () => (actor: any) => (msg: any) => actor(msg);
