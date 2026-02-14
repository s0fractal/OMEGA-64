// i.L99.core.TOPOLOGICAL_SIGNATURE.ts
// 🛡️ OMEGA-64 | Canon Runtime | Topological Signature
// Deterministic identity + causal + projection anchors.

import {
    CHROMO_STATE,
    ChromoEncodeOptions,
    OrganismState
} from "./i.L00.core.CHROMO_STATE.ts";
import type { StateSnapshot } from "./i.L99.core.STATE_SNAPSHOT.ts";
import { I16_LIMITS } from "./i.L00.core.I16_LIMITS.ts";

export interface TopologicalSignature {
    artifact_hash: string;
    state_hash: string;
    tick: number;
    causal_refs: string[];
    projection_2d_hash: string;
    thread_1d_hash: string;
    projection_version: string;
    witness?: string;
}

export interface TopologicalSignatureInput {
    artifact_hash: string;
    state_hash: string;
    tick: number;
    state: OrganismState;
    causal_refs?: string[];
    witness?: string;
}

export interface ThreadProjectionConfig {
    radial_bins: number;
    angular_bins: number;
}

export interface SignatureStateSnapshotLike extends Pick<StateSnapshot, "state_hash" | "state_i16"> {
    phase_u16?: Uint16Array;
    stability_q15?: Float32Array;
    entropy_i16?: Int16Array;
}

const PROJECTION_VERSION = "topo-signature/v1";
const I16 = I16_LIMITS();

const CANONICAL_2D_OPTIONS: Required<ChromoEncodeOptions> = {
    resolution: 256,
    deterministic: true,
    noiseAmplitude: 20,
    noiseAlpha: 50
};

const CANONICAL_THREAD_CONFIG: ThreadProjectionConfig = {
    radial_bins: 64,
    angular_bins: 256
};

const HEX_64 = /^[a-f0-9]{64}$/;

const toHex = (buffer: ArrayBuffer): string =>
    Array.from(new Uint8Array(buffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

const sha256HexBytes = async (bytes: Uint8Array): Promise<string> => {
    const copy = new Uint8Array(bytes.byteLength);
    copy.set(bytes);
    const digest = await crypto.subtle.digest("SHA-256", copy.buffer);
    return toHex(digest);
};

const clampI16 = (x: number): number => {
    if (x > I16.max) return I16.max;
    if (x < I16.min) return I16.min;
    return x;
};

const clamp01 = (x: number): number => {
    if (x > 1) return 1;
    if (x < 0) return 0;
    return x;
};

const normalizeI16 = (x: number): number => (clampI16(x) - I16.min) / I16.span;

const serializeInt16Be = (arr: Int16Array): Uint8Array => {
    const out = new Uint8Array(arr.length * 2);
    for (let i = 0; i < arr.length; i++) {
        const v = arr[i] < 0 ? arr[i] + 0x10000 : arr[i];
        out[i * 2] = (v >>> 8) & 0xff;
        out[i * 2 + 1] = v & 0xff;
    }
    return out;
};

const normalizeAngle = (angle: number): number => {
    const tau = 2 * Math.PI;
    let a = angle % tau;
    if (a < 0) a += tau;
    return a / tau;
};

export const TOPOLOGICAL_SIGNATURE = {
    PROJECTION_VERSION,
    CANONICAL_2D_OPTIONS,
    CANONICAL_THREAD_CONFIG,

    validateHash: (hex: string): boolean => HEX_64.test(hex),

    composeHash: async (left_hash: string, right_hash: string, op_id: string): Promise<string> => {
        const payload = `compose:v1:${left_hash}:${right_hash}:${op_id}`;
        return await sha256HexBytes(new TextEncoder().encode(payload));
    },

    project2D: (state: OrganismState, options: ChromoEncodeOptions = CANONICAL_2D_OPTIONS): Uint8Array => {
        const image = CHROMO_STATE.encode(state, options);
        return new Uint8Array(image.data);
    },

    hash2D: async (state: OrganismState, options: ChromoEncodeOptions = CANONICAL_2D_OPTIONS): Promise<string> => {
        const bytes = TOPOLOGICAL_SIGNATURE.project2D(state, options);
        return await sha256HexBytes(bytes);
    },

    snapshotToOrganismState: (
        snapshot: SignatureStateSnapshotLike,
        identity: string = snapshot.state_hash
    ): OrganismState => {
        const vec = snapshot.state_i16;
        const n = vec.length > 0 ? vec.length : 1;
        const level = (idx: number): number => (idx >= 0 && idx < vec.length ? vec[idx] : 0);

        let sumAbs = 0;
        for (let i = 0; i < vec.length; i++) {
            sumAbs += Math.abs(vec[i]);
        }
        const absMean = sumAbs / n;
        const absMeanNorm = clamp01(absMean / I16.max);

        const center = level(32);
        const width = Math.max(1, Math.min(I16.max, Math.abs(level(24)) + 1));
        const phase = snapshot.phase_u16
            ? snapshot.phase_u16[13] ?? 0
            : Math.round(normalizeI16(level(13)) * I16.span) & I16.span;
        const amplitude = Math.min(I16.span, Math.max(0, Math.round(absMeanNorm * I16.span)));

        let stabilityMean = 1 - absMeanNorm;
        if (snapshot.stability_q15 && snapshot.stability_q15.length > 0) {
            let s = 0;
            for (let i = 0; i < snapshot.stability_q15.length; i++) {
                s += snapshot.stability_q15[i];
            }
            stabilityMean = clamp01(s / snapshot.stability_q15.length);
        }

        let entropyMean = absMean;
        if (snapshot.entropy_i16 && snapshot.entropy_i16.length > 0) {
            let e = 0;
            for (let i = 0; i < snapshot.entropy_i16.length; i++) {
                e += Math.abs(snapshot.entropy_i16[i]);
            }
            entropyMean = e / snapshot.entropy_i16.length;
        }
        const entropyNorm = clamp01(entropyMean / I16.max);
        const coherence = clamp01(stabilityMean * (1 - entropyNorm));
        const metabolism = clamp01(normalizeI16(level(19)));
        const tau = clamp01(normalizeI16(level(22)));
        const flowRate = clamp01(Math.abs(level(10)) / I16.max);
        const curvature = Math.abs(center) < 1
            ? Math.abs(level(21))
            : (Math.abs(level(21)) / 1000) * (1 / Math.log1p(Math.abs(center)));

        return {
            identity,
            wave: {
                center,
                width,
                phase,
                amplitude
            },
            chrono: {
                tau,
                depth: center,
                flowRate,
                curvature
            },
            metabolism,
            coherence
        };
    },

    projectThread1D: (
        rgba: Uint8Array,
        resolution: number,
        config: ThreadProjectionConfig = CANONICAL_THREAD_CONFIG
    ): Int16Array => {
        const R = config.radial_bins;
        const A = config.angular_bins;
        const N = R * A;
        const thread = new Int16Array(N);
        const center = resolution / 2;
        const maxDist = center - 2;

        for (let y = 0; y < resolution; y++) {
            for (let x = 0; x < resolution; x++) {
                const dx = x - center;
                const dy = y - center;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist > maxDist) continue;

                const rho = maxDist > 0 ? dist / maxDist : 0;
                const theta = normalizeAngle(Math.atan2(dy, dx));
                const rBin = Math.min(R - 1, Math.max(0, Math.floor(rho * (R - 1))));
                const aBin = Math.min(A - 1, Math.max(0, Math.floor(theta * (A - 1))));
                const k = rBin * A + aBin;

                const idx = (y * resolution + x) * 4;
                const r = rgba[idx];
                const g = rgba[idx + 1];
                const b = rgba[idx + 2];
                const luminance = Math.round((r + g + b) / 3 - 127);
                thread[k] = clampI16(thread[k] + luminance);
            }
        }

        return thread;
    },

    hashThread1D: async (
        state: OrganismState,
        options: ChromoEncodeOptions = CANONICAL_2D_OPTIONS,
        config: ThreadProjectionConfig = CANONICAL_THREAD_CONFIG
    ): Promise<string> => {
        const resolution = options.resolution ?? CANONICAL_2D_OPTIONS.resolution;
        const rgba = TOPOLOGICAL_SIGNATURE.project2D(state, options);
        const thread = TOPOLOGICAL_SIGNATURE.projectThread1D(rgba, resolution, config);
        const bytes = serializeInt16Be(thread);
        return await sha256HexBytes(bytes);
    },

    build: async (input: TopologicalSignatureInput): Promise<TopologicalSignature> => {
        if (!TOPOLOGICAL_SIGNATURE.validateHash(input.artifact_hash)) {
            throw new Error("Invalid artifact_hash: expected 64-char lowercase hex SHA-256");
        }
        if (!TOPOLOGICAL_SIGNATURE.validateHash(input.state_hash)) {
            throw new Error("Invalid state_hash: expected 64-char lowercase hex SHA-256");
        }
        if (!Number.isInteger(input.tick) || input.tick < 0) {
            throw new Error("Invalid tick: expected non-negative integer");
        }

        const projectionOptions = { ...CANONICAL_2D_OPTIONS };
        const resolution = projectionOptions.resolution;
        const rgba = TOPOLOGICAL_SIGNATURE.project2D(input.state, projectionOptions);
        const projection2DHash = await sha256HexBytes(rgba);
        const thread = TOPOLOGICAL_SIGNATURE.projectThread1D(rgba, resolution, CANONICAL_THREAD_CONFIG);
        const thread1DHash = await sha256HexBytes(serializeInt16Be(thread));

        return {
            artifact_hash: input.artifact_hash,
            state_hash: input.state_hash,
            tick: input.tick,
            causal_refs: [...(input.causal_refs ?? [])].sort(),
            projection_2d_hash: projection2DHash,
            thread_1d_hash: thread1DHash,
            projection_version: PROJECTION_VERSION,
            witness: input.witness
        };
    },

    verify: async (
        signature: TopologicalSignature,
        state: OrganismState
    ): Promise<{ ok: boolean; reasons: string[] }> => {
        const reasons: string[] = [];

        if (!TOPOLOGICAL_SIGNATURE.validateHash(signature.artifact_hash)) {
            reasons.push("INVALID_ARTIFACT_HASH");
        }
        if (!TOPOLOGICAL_SIGNATURE.validateHash(signature.state_hash)) {
            reasons.push("INVALID_STATE_HASH");
        }
        if (signature.projection_version !== PROJECTION_VERSION) {
            reasons.push("UNSUPPORTED_PROJECTION_VERSION");
        }

        const projectionOptions = { ...CANONICAL_2D_OPTIONS };
        const resolution = projectionOptions.resolution;
        const rgba = TOPOLOGICAL_SIGNATURE.project2D(state, projectionOptions);
        const projection2DHash = await sha256HexBytes(rgba);
        if (projection2DHash !== signature.projection_2d_hash) {
            reasons.push("PROJECTION_2D_HASH_MISMATCH");
        }

        const thread = TOPOLOGICAL_SIGNATURE.projectThread1D(rgba, resolution, CANONICAL_THREAD_CONFIG);
        const thread1DHash = await sha256HexBytes(serializeInt16Be(thread));
        if (thread1DHash !== signature.thread_1d_hash) {
            reasons.push("THREAD_1D_HASH_MISMATCH");
        }

        return { ok: reasons.length === 0, reasons };
    },

    /**
     * Projects a SHA-256 hash into a 64-dimensional manifold coordinate [Int16Array].
     * This treats the hash as a geometric "portal" or coordinate.
     */
    hashToManifoldPoint: (hash: string): Int16Array => {
        const point = new Int16Array(64);
        if (!TOPOLOGICAL_SIGNATURE.validateHash(hash)) return point;

        // Use the hex pairs as 8-bit seed values, distributed across the 64 levels.
        // Since hash is 64 chars, we have 32 bytes. We'll mirror them to fill 64 slots.
        for (let i = 0; i < 32; i++) {
            const byte = parseInt(hash.slice(i * 2, i * 2 + 2), 16);
            // Map 0..255 to -16384..16384 for a subtle but distinct presence
            const val = Math.round((byte / 127.5 - 1) * 16384);
            point[i] = val;
            point[i + 32] = -val; // Mirror symmetry for balance
        }
        return point;
    }
};
