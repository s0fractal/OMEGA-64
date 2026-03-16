// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/crypto/topo_signature.md
import { fnv1a32, make_xor_shift32, normalize_hex64, sha256_hex_bytes, stable_stringify, to_int16_big_endian, sha256_hex } from "@g07";

const clampByte = (x: number): number => Math.max(0, Math.min(255, Math.round(x)));
const clampI16 = (x: number): number => Math.max(-32768, Math.min(32767, x));
const clamp01 = (x: number): number => Math.max(0, Math.min(1, x));
const normalize_angle = (a: number): number => {
  let r = a % (Math.PI * 2);
  if (r <= -Math.PI) r += Math.PI * 2;
  if (r > Math.PI) r -= Math.PI * 2;
  return r;
};

export const deriveFeatureVector = (
  state: unknown,
  size: number = 16,
): number[] => {
  const text = stable_stringify(state);
  const out = new Array<number>(size).fill(0);
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    const idx = i % size;
    out[idx] = (out[idx] + code * ((i % 7) + 1)) % 65535;
  }
  for (let i = 0; i < out.length; i++) {
    const norm = (out[i] / 65535) * 2 - 1;
    out[i] = i % 2 === 0 ? norm : -norm;
  }
  return out;
};

export interface ProjectionOptions {
  resolution?: number;
  deterministic?: boolean;
  noiseAmplitude?: number;
  noiseAlpha?: number;
}

export interface ThreadProjectionConfig {
  radial_bins: number;
  angular_bins: number;
}

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
  state: unknown;
  causal_refs?: string[];
  witness?: string;
}

const TOPO_PROJECTION_VERSION = "topo-signature/v1";
const TOPO_CANONICAL_2D_OPTIONS: Required<ProjectionOptions> = {
  resolution: 256,
  deterministic: true,
  noiseAmplitude: 20,
  noiseAlpha: 50,
};
const TOPO_CANONICAL_THREAD_CONFIG: ThreadProjectionConfig = {
  radial_bins: 64,
  angular_bins: 256,
};

const normalizeProjectionOptions = (
  options: ProjectionOptions = {},
): Required<ProjectionOptions> => {
  const resolution = Number.isFinite(options.resolution)
    ? Math.max(16, Math.min(1024, Math.floor(options.resolution!)))
    : TOPO_CANONICAL_2D_OPTIONS.resolution;
  const deterministic = options.deterministic ??
    TOPO_CANONICAL_2D_OPTIONS.deterministic;
  const noiseAmplitude = Number.isFinite(options.noiseAmplitude)
    ? Math.max(0, Math.min(128, Math.floor(options.noiseAmplitude!)))
    : TOPO_CANONICAL_2D_OPTIONS.noiseAmplitude;
  const noiseAlpha = Number.isFinite(options.noiseAlpha)
    ? Math.max(0, Math.min(255, Math.floor(options.noiseAlpha!)))
    : TOPO_CANONICAL_2D_OPTIONS.noiseAlpha;
  return { resolution, deterministic, noiseAmplitude, noiseAlpha };
};

const normalizeThreadConfig = (
  config: ThreadProjectionConfig = TOPO_CANONICAL_THREAD_CONFIG,
): ThreadProjectionConfig => {
  const radial_bins = Number.isFinite(config.radial_bins)
    ? Math.max(4, Math.min(256, Math.floor(config.radial_bins)))
    : TOPO_CANONICAL_THREAD_CONFIG.radial_bins;
  const angular_bins = Number.isFinite(config.angular_bins)
    ? Math.max(8, Math.min(1024, Math.floor(config.angular_bins)))
    : TOPO_CANONICAL_THREAD_CONFIG.angular_bins;
  return { radial_bins, angular_bins };
};

const toOrganismState = (
  snapshot: {
    state_hash?: string;
    state_i16?: Int16Array;
    phase_u16?: Uint16Array;
    stability_q15?: Float32Array;
    entropy_i16?: Int16Array;
  },
): {
  identity: string;
  wave: { center: number; width: number; phase: number; amplitude: number };
  chrono: { tau: number; depth: number; flowRate: number; curvature: number };
  metabolism: number;
  coherence: number;
} => {
  const vector = snapshot.state_i16 ?? new Int16Array(64);
  const n = vector.length > 0 ? vector.length : 1;
  const level = (idx: number): number =>
    idx >= 0 && idx < vector.length ? vector[idx] : 0;

  let sumAbs = 0;
  for (let i = 0; i < vector.length; i++) {
    sumAbs += Math.abs(vector[i]);
  }
  const absMean = sumAbs / n;
  const absMeanNorm = clamp01(absMean / 32767);
  const center = level(32);
  const width = Math.max(1, Math.min(32767, Math.abs(level(24)) + 1));
  const phase = snapshot.phase_u16
    ? snapshot.phase_u16[13] ?? 0
    : Math.round(((clampI16(level(13)) + 32768) / 65535) * 65535) & 0xFFFF;
  const amplitude = Math.min(
    65535,
    Math.max(0, Math.round(absMeanNorm * 65535)),
  );

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
  const entropyNorm = clamp01(entropyMean / 32767);
  const coherence = clamp01(stabilityMean * (1 - entropyNorm));
  const metabolism = clamp01((clampI16(level(19)) + 32768) / 65535);
  const tau = clamp01((clampI16(level(22)) + 32768) / 65535);
  const flowRate = clamp01(Math.abs(level(10)) / 32767);
  const curvature = Math.abs(center) < 1
    ? Math.abs(level(21))
    : (Math.abs(level(21)) / 1000) * (1 / Math.log1p(Math.abs(center)));

  return {
    identity: snapshot.state_hash ?? "organism",
    wave: { center, width, phase, amplitude },
    chrono: { tau, depth: center, flowRate, curvature },
    metabolism,
    coherence,
  };
};

const project2D = (
  state: unknown,
  options: ProjectionOptions = {},
): Uint8Array => {
  const opts = normalizeProjectionOptions(options);
  const resolution = opts.resolution;
  const out = new Uint8Array(resolution * resolution * 4);
  const center = resolution / 2;
  const maxRadius = Math.max(1, center - 1);
  const features = deriveFeatureVector(state, 16);
  const seed = fnv1a32(stable_stringify({ state, options: opts })) || 1;
  const nextRand = make_xor_shift32(seed);

  for (let y = 0; y < resolution; y++) {
    for (let x = 0; x < resolution; x++) {
      const i = (y * resolution + x) * 4;
      const dx = x - center;
      const dy = y - center;
      const rho = Math.min(1, Math.sqrt(dx * dx + dy * dy) / maxRadius);
      const theta = normalize_angle(Math.atan2(dy, dx));
      const fx = features[(x + y) % features.length];
      const fy = features[(x * 3 + y * 5) % features.length];
      const fz = features[(x * 7 + y * 11) % features.length];

      const carrier = Math.sin(
        rho * Math.PI * (8 + Math.abs(fx) * 10) +
          theta * Math.PI * (1 + Math.abs(fy) * 6) +
          fz * Math.PI,
      );
      const lattice = Math.cos(
        (x / resolution) * Math.PI * (2 + Math.abs(fy) * 9) +
          (y / resolution) * Math.PI * (3 + Math.abs(fz) * 7) +
          fx * Math.PI,
      );
      const tone = carrier * 0.65 + lattice * 0.35;
      const base = (tone * 0.5 + 0.5) * 255;
      const noiseUnit = opts.deterministic
        ? ((nextRand() >>> 8) & 0xFF) / 255
        : Math.random();
      const noise = (noiseUnit - 0.5) * opts.noiseAmplitude * 2;

      out[i] = clampByte(base + noise + fx * 24);
      out[i + 1] = clampByte(base - noise * 0.5 + fy * 28);
      out[i + 2] = clampByte(255 - base + noise * 0.75 + fz * 20);
      out[i + 3] = clampByte(
        255 - Math.min(200, rho * 220) + opts.noiseAlpha * 0.1,
      );
    }
  }
  return out;
};

const projectThread1D = (
  rgba: Uint8Array,
  resolution: number,
  config: ThreadProjectionConfig = TOPO_CANONICAL_THREAD_CONFIG,
): Int16Array => {
  const cfg = normalizeThreadConfig(config);
  const bins = cfg.radial_bins * cfg.angular_bins;
  const thread = new Int16Array(bins);
  const center = resolution / 2;
  const maxDist = Math.max(1, center - 2);

  for (let y = 0; y < resolution; y++) {
    for (let x = 0; x < resolution; x++) {
      const dx = x - center;
      const dy = y - center;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > maxDist) continue;
      const rho = dist / maxDist;
      const theta = normalize_angle(Math.atan2(dy, dx));
      const rBin = Math.min(
        cfg.radial_bins - 1,
        Math.max(0, Math.floor(rho * (cfg.radial_bins - 1))),
      );
      const aBin = Math.min(
        cfg.angular_bins - 1,
        Math.max(0, Math.floor(theta * (cfg.angular_bins - 1))),
      );
      const k = rBin * cfg.angular_bins + aBin;
      const idx = (y * resolution + x) * 4;
      const lum = Math.round(
        (rgba[idx] + rgba[idx + 1] + rgba[idx + 2]) / 3 - 127,
      );
      thread[k] = clampI16(thread[k] + lum);
    }
  }
  return thread;
};

const canonicalCausalRefs = (refs: unknown): string[] => {
  if (!Array.isArray(refs)) return [];
  const out = new Set<string>();
  for (const ref of refs) {
    if (typeof ref !== "string") continue;
    const trimmed = ref.trim();
    if (!trimmed) continue;
    out.add(trimmed);
  }
  return Array.from(out).sort();
};

export const TOPOLOGICAL_SIGNATURE = {
  PROJECTION_VERSION: TOPO_PROJECTION_VERSION,
  CANONICAL_2D_OPTIONS: TOPO_CANONICAL_2D_OPTIONS,
  CANONICAL_THREAD_CONFIG: TOPO_CANONICAL_THREAD_CONFIG,

  validateHash: (hash: string): boolean => normalize_hex64(hash) !== null,

  project2D,

  projectThread1D,

  hash2D: async (
    state: unknown,
    options: ProjectionOptions = TOPO_CANONICAL_2D_OPTIONS,
  ): Promise<string> => {
    const rgba = project2D(state, options);
    return await sha256_hex_bytes(rgba);
  },

  hashThread1D: async (
    state: unknown,
    options: ProjectionOptions = TOPO_CANONICAL_2D_OPTIONS,
    config: ThreadProjectionConfig = TOPO_CANONICAL_THREAD_CONFIG,
  ): Promise<string> => {
    const opts = normalizeProjectionOptions(options);
    const rgba = project2D(state, opts);
    const thread = projectThread1D(rgba, opts.resolution, config);
    return await sha256_hex_bytes(to_int16_big_endian(thread));
  },

  snapshotToOrganismState: toOrganismState,

  build: async (
    input: TopologicalSignatureInput,
  ): Promise<TopologicalSignature> => {
    const artifactHash = normalize_hex64(input.artifact_hash);
    const stateHash = normalize_hex64(input.state_hash);
    if (!artifactHash) {
      throw new Error("Invalid artifact_hash: expected SHA-256 lowercase hex");
    }
    if (!stateHash) {
      throw new Error("Invalid state_hash: expected SHA-256 lowercase hex");
    }
    if (!Number.isInteger(input.tick) || input.tick < 0) {
      throw new Error("Invalid tick: expected non-negative integer");
    }

    const opts = normalizeProjectionOptions(TOPO_CANONICAL_2D_OPTIONS);
    const rgba = project2D(input.state, opts);
    const projection2dHash = await sha256_hex_bytes(rgba);
    const thread = projectThread1D(
      rgba,
      opts.resolution,
      TOPO_CANONICAL_THREAD_CONFIG,
    );
    const thread1dHash = await sha256_hex_bytes(to_int16_big_endian(thread));

    return {
      artifact_hash: artifactHash,
      state_hash: stateHash,
      tick: input.tick,
      causal_refs: canonicalCausalRefs(input.causal_refs),
      projection_2d_hash: projection2dHash,
      thread_1d_hash: thread1dHash,
      projection_version: TOPO_PROJECTION_VERSION,
      witness: input.witness,
    };
  },

  verify: async (
    signature: TopologicalSignature,
    state: unknown,
  ): Promise<{ ok: boolean; reasons: string[]; failures: string[] }> => {
    const reasons: string[] = [];
    if (!normalize_hex64(signature.artifact_hash)) {
      reasons.push("INVALID_ARTIFACT_HASH");
    }
    if (!normalize_hex64(signature.state_hash)) {
      reasons.push("INVALID_STATE_HASH");
    }
    if (!normalize_hex64(signature.projection_2d_hash)) {
      reasons.push("INVALID_PROJECTION_2D_HASH");
    }
    if (!normalize_hex64(signature.thread_1d_hash)) {
      reasons.push("INVALID_THREAD_1D_HASH");
    }
    if (signature.projection_version !== TOPO_PROJECTION_VERSION) {
      reasons.push("UNSUPPORTED_PROJECTION_VERSION");
    }

    const opts = normalizeProjectionOptions(TOPO_CANONICAL_2D_OPTIONS);
    const rgba = project2D(state, opts);
    const projection2dHash = await sha256_hex_bytes(rgba);
    if (projection2dHash !== signature.projection_2d_hash) {
      reasons.push("PROJECTION_2D_HASH_MISMATCH");
    }

    const thread = projectThread1D(
      rgba,
      opts.resolution,
      TOPO_CANONICAL_THREAD_CONFIG,
    );
    const thread1dHash = await sha256_hex_bytes(to_int16_big_endian(thread));
    if (thread1dHash !== signature.thread_1d_hash) {
      reasons.push("THREAD_1D_HASH_MISMATCH");
    }

    return { ok: reasons.length === 0, reasons, failures: [...reasons] };
  },
};
