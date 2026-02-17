import { FIELD } from "../i.L32.core.FIELD.ts";
import { U16_LIMITS } from "../i.L32.core.U16_LIMITS.ts";

const U16 = U16_LIMITS();

export interface QWave {
  center: number;
  width: number;
  phase: number;
  amplitude: number;
}

export type WavePacket = QWave;

export const WAVE_PACKET = {
  getAmplitudeAt: (packet: QWave, r: number): number => {
    const dr = FIELD.compress(r) - FIELD.compress(packet.center);
    const exponent = -(dr * dr) / (2 * packet.width * packet.width);
    return packet.amplitude * Math.exp(exponent);
  },
  create: (center: number, width: number = 1000, phase: number = 0, amplitude: number = 1): QWave => ({
    center,
    width,
    phase: Math.round(phase * U16.span / (2 * Math.PI)) % U16.span,
    amplitude
  })
};
