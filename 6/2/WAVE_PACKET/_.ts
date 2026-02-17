
/**
 * [6/2/WAVE_PACKET/_.ts]
 * Inverted from Legacy L13 (63-13=50 -> 6/2).
 */
export const ATOM = ({ siblings: { FIELD, U16_LIMITS } }) => {
  const U16 = U16_LIMITS();

  const WAVE_PACKET = {
    getAmplitudeAt: (packet: any, r: number): number => {
      const dr = FIELD.FIELD.compress(r) - FIELD.FIELD.compress(packet.center);
      const exponent = -(dr * dr) / (2 * packet.width * packet.width);
      return packet.amplitude * Math.exp(exponent);
    },
    create: (center: number, width: number = 1000, phase: number = 0, amplitude: number = 1): any => ({
      center,
      width,
      phase: Math.round(phase * U16.span / (2 * Math.PI)) % U16.span,
      amplitude
    })
  };

  return { WAVE_PACKET };
};
