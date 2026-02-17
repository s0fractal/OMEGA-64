
/**
 * [7/4/O_STREAM/_.ts]
 * Inverted from Legacy L03.
 */
export const ATOM = () => (stream: any[], proposal: any): any[] => [
  ...stream,
  proposal,
];
