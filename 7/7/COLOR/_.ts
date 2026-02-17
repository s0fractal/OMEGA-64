
/**
 * [7/7/COLOR/_.ts]
 * Inverted from Legacy L00.
 * Chromo-Topological Isomorphism.
 */
export const ATOM = ({ siblings: { FIELD, U16_LIMITS, WAVE_PACKET } }) => {
  const U16 = U16_LIMITS();
  const F = FIELD.FIELD;
  const WP = WAVE_PACKET.WAVE_PACKET;

  const CHROMO = {
    waveToHsv: (wave: any): any => {
      const h = (wave.phase / U16.span) * 360;
      const s = Math.abs(wave.center) / FIELD.FIELD_CONFIG.MAX_ATTRACTOR;
      const v = Math.min(1, wave.amplitude / U16.span);
      return { h, s, v };
    },
    hsvToWave: (hsv: any, sign: 1 | -1 = 1): any => {
      const phi = Math.round((hsv.h / 360) * U16.span) % U16.span;
      const r = Math.round(hsv.s * FIELD.FIELD_CONFIG.MAX_ATTRACTOR) * sign;
      const amplitude = Math.round(hsv.v * U16.span);
      const width = Math.round(1000 * (1 - hsv.s) + 100);
      return WP.create(r, width, phi, amplitude);
    },
    hsvToRgb: (hsv: any): any => {
      const { h, s, v } = hsv;
      const c = v * s;
      const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
      const m = v - c;
      let r, g, b: number;
      if (h < 60)       [r, g, b] = [c, x, 0];
      else if (h < 120) [r, g, b] = [x, c, 0];
      else if (h < 180) [r, g, b] = [0, c, x];
      else if (h < 240) [r, g, b] = [0, x, c];
      else if (h < 300) [r, g, b] = [x, 0, c];
      else              [r, g, b] = [c, 0, x];
      return {
        r: Math.round((r + m) * 255),
        g: Math.round((g + m) * 255),
        b: Math.round((b + m) * 255)
      };
    },
    waveToRgb: (wave: any): any => {
      return CHROMO.hsvToRgb(CHROMO.waveToHsv(wave));
    }
  };

  return { CHROMO };
};
