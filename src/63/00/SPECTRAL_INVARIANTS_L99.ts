
/**
 * [8/0/SPECTRAL_INVARIANTS/_.ts]
 * Verifies that multiple "lenses" projecting a sample yield coherent results.
 */
export const ATOM = () => (input: any) => {
    const DEFAULT_MIN_LENSES = 2;
    const DEFAULT_MAX_DELTA = 0;
    const lenses = input.lenses ?? [];
    const minLenses = Number.isFinite(input.min_lenses) ? input.min_lenses : DEFAULT_MIN_LENSES;
    const maxDelta = Number.isFinite(input.max_delta) ? input.max_delta : DEFAULT_MAX_DELTA;

    if (lenses.length < minLenses) {
        return { ok: false, reason: "INSUFFICIENT_LENSES" };
    }

    const signatures = lenses.map((lens: any) => ({
        id: lens.id,
        sig: lens.project(input.sample),
    }));

    const divergences: any[] = [];
    let sumDelta = 0;

    for (let i = 0; i < signatures.length; i++) {
        for (let j = i + 1; j < signatures.length; j++) {
            const a = signatures[i];
            const b = signatures[j];
            let delta = (a.sig === b.sig) ? 0 : 1;
            divergences.push({ a: a.id, b: b.id, delta });
            sumDelta += delta;
        }
    }

    const maxObserved = divergences.reduce((m, d) => Math.max(m, d.delta), 0);
    const ok = maxObserved <= maxDelta;

    return {
        ok,
        lens_count: lenses.length,
        divergences,
        reason: ok ? "OK" : "SPECTRAL_DIVERGENCE",
    };
};
