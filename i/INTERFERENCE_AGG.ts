/**
 * @omega.vector 32.21.07
 * @omega.readonly
 * @omega.load 0
 * @omega.origin i.L13.core.INTERFERENCE.ts
 * @omega.symbol INTERFERENCE
 */

import { WavePacket, WAVE_PACKET } from "./WAVE_PACKET_AGG.ts";

export const INTERFERENCE = {
  superpose: (p1: WavePacket, p2: WavePacket, r: number): number => {
    const a1 = WAVE_PACKET.getAmplitudeAt(p1, r);
    const a2 = WAVE_PACKET.getAmplitudeAt(p2, r);
    const deltaPhi = p1.phase - p2.phase;
    const intensity = a1 * a1 + a2 * a2 + 2 * a1 * a2 * Math.cos(deltaPhi);
    return Math.sqrt(Math.max(0, intensity));
  },
  getTension: (p1: WavePacket, p2: WavePacket): number => {
    const overlap = Math.exp(-Math.pow(p1.center - p2.center, 2) / (Math.pow(p1.width, 2) + Math.pow(p2.width, 2)));
    const phaseConflict = (1 - Math.cos(p1.phase - p2.phase)) / 2;
    return overlap * phaseConflict;
  }
};
