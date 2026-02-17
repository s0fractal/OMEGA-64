
/**
 * [6/2/INTERFERENCE/_.ts]
 * Inverted from Legacy L13. Level 50.
 */
export const ATOM = ({ siblings: { WAVE_PACKET } }) => {
    const WP = WAVE_PACKET.WAVE_PACKET;

    return {
        superpose: (p1: any, p2: any, r: number): number => {
            const a1 = WP.getAmplitudeAt(p1, r);
            const a2 = WP.getAmplitudeAt(p2, r);
            const deltaPhi = (p1.phase ?? p1.phi) - (p2.phase ?? p2.phi);
            const intensity = a1 * a1 + a2 * a2 + 2 * a1 * a2 * Math.cos(deltaPhi);
            return Math.sqrt(Math.max(0, intensity));
        },
        getTension: (p1: any, p2: any): number => {
            const overlap = Math.exp(-Math.pow(p1.center - p2.center, 2) / (Math.pow(p1.width, 2) + Math.pow(p2.width, 2)));
            const phaseConflict = (1 - Math.cos((p1.phase ?? p1.phi) - (p2.phase ?? p2.phi))) / 2;
            return overlap * phaseConflict;
        }
    };
};
