
/**
 * [3/7/ARENA/_.ts]
 * Inverted from Legacy L32. Level 31.
 * Спільний простір одночасності.
 */
export const ATOM = ({ siblings: { FIELD, WAVE_PACKET, INTERFERENCE, I16_LIMITS } }) => {
    const I16 = I16_LIMITS();
    const F = FIELD.FIELD;
    const WP = WAVE_PACKET.WAVE_PACKET;
    const INT = INTERFERENCE.INTERFERENCE;

    const active = new Map();

    const ARCHETYPES = {
        NARCISSUS: (pulse: any, subject_wave: any): number => {
            const distance = Math.abs(F.compress(pulse.wave.center) - F.compress(subject_wave.center));
            return Math.exp(-distance / 1000);
        }
    };

    return {
        active,
        ARCHETYPES,
        excite: (pulse: any) => {
            active.set(pulse.source, pulse);
        },
        sense: (subject_id: string, subject_wave: any) => {
            let total_field = 0;
            for (const [source, pulse] of active) {
                if (source === subject_id) continue;
                total_field += WP.getAmplitudeAt(pulse.wave, subject_wave.center);
            }
            return { resonance_index: Math.min(1, total_field / 10) };
        }
    };
};
