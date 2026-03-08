import { walk } from "jsr:@std/fs";
import { parse as parseYaml, stringify as stringifyYaml } from "jsr:@std/yaml";

const CODEX_PATH = "./8/2/CODEX_RULES/_.yaml";
const ROOT = Deno.cwd();

type Law = {
  id: string;
  when?: string;
  kind: string;
  strength?: number;
  note?: string;
};

const loadCodex = async (): Promise<Law[]> => {
  const rawText = await Deno.readTextFile(CODEX_PATH);
  const raw = parseYaml(rawText) as { laws?: Law[] };
  return Array.isArray(raw?.laws) ? raw.laws : [];
};

type AtomNode = {
  id: string;
  path: string;
  vector: { s: number; o: number; v: number };
  pos: { x: number; y: number; z: number };
  mass: number;
  charge: number;
  spin: number;
  relationsUse: string[];
  meta: any;
};

const parseVector = (vector: string) => {
  const [sRaw, oRaw, vRaw] = vector.split(".");
  const s = Number(sRaw ?? 0);
  const o = Number(oRaw ?? 0);
  const v = Number(vRaw ?? 0);
  return { s, o, v };
};

const main = async () => {
  const laws = await loadCodex();
  const useSpring = laws.find((l) =>
    l.when === "relations.use" && l.kind === "spring"
  );
  const springStrength = useSpring?.strength ?? 1;
  const gravityLaw = laws.find((l) => l.kind === "gravity");
  const chargeLaw = laws.find((l) => l.kind === "charge");
  const spinLaw = laws.find((l) => l.kind === "spin");
  const gravityStrength = gravityLaw?.strength ?? 0;
  const chargeStrength = chargeLaw?.strength ?? 0;
  const spinStrength = spinLaw?.strength ?? 0;

  const atoms: AtomNode[] = [];
  let touched = 0;
  for await (const entry of walk(ROOT, { includeDirs: false })) {
    if (!entry.isFile || !entry.name.endsWith(".yaml")) continue;
    const rel = entry.path.replaceAll("\\", "/");
    if (!/(?:^|\/)[0-8]\/[0-7]\/[^/]+\/_.yaml$/.test(rel)) continue;
    const text = await Deno.readTextFile(entry.path);
    const meta = parseYaml(text) as any;

    if (!meta || typeof meta !== "object") continue;
    if (typeof meta.vector !== "string") continue;

    const vector = parseVector(meta.vector);
    const id = typeof meta.symbol === "string"
      ? meta.symbol
      : rel.replace(/\/_.yaml$/, "");
    const self = meta?.forces?.self ?? {};
    const mass = Number(self.mass ?? meta.mass ?? 0);
    const charge = Number(self.charge ?? meta.charge ?? 0);
    const spin = Number(self.spin ?? meta.spin ?? 0);
    const relationsUse = Array.isArray(meta?.relations?.use)
      ? meta.relations.use.map((t: any) => String(t))
      : [];

    atoms.push({
      id,
      path: entry.path,
      vector,
      pos: { x: vector.s, y: vector.o, z: vector.v },
      mass,
      charge,
      spin,
      relationsUse,
      meta,
    });
  }

  const net = new Map<string, { x: number; y: number; z: number }>();
  const pairs = new Map<string, any[]>();
  const EPS = 1e-6;

  for (let i = 0; i < atoms.length; i++) {
    for (let j = i + 1; j < atoms.length; j++) {
      const a = atoms[i];
      const b = atoms[j];
      const dx = b.pos.x - a.pos.x;
      const dy = b.pos.y - a.pos.y;
      const dz = b.pos.z - a.pos.z;
      const r2 = Math.max(EPS, dx * dx + dy * dy + dz * dz);
      const r = Math.sqrt(r2);
      const ux = dx / r;
      const uy = dy / r;
      const uz = dz / r;

      const gravityMag = gravityStrength !== 0
        ? (gravityStrength * a.mass * b.mass) / r2
        : 0;
      const chargeMag = chargeStrength !== 0
        ? (-chargeStrength * a.charge * b.charge) / r2
        : 0;
      const spinMag = spinStrength !== 0 ? spinStrength * a.spin * b.spin : 0;
      const fx = (gravityMag + chargeMag) * ux;
      const fy = (gravityMag + chargeMag) * uy;
      const fz = (gravityMag + chargeMag) * uz;

      if (!net.has(a.id)) net.set(a.id, { x: 0, y: 0, z: 0 });
      if (!net.has(b.id)) net.set(b.id, { x: 0, y: 0, z: 0 });
      net.get(a.id)!.x += fx;
      net.get(a.id)!.y += fy;
      net.get(a.id)!.z += fz;
      net.get(b.id)!.x -= fx;
      net.get(b.id)!.y -= fy;
      net.get(b.id)!.z -= fz;

      const pairA = {
        target: b.id,
        dx,
        dy,
        dz,
        r,
        gravity: gravityMag || undefined,
        charge: chargeMag || undefined,
        spin: spinMag || undefined,
        fx,
        fy,
        fz,
      };
      const pairB = {
        target: a.id,
        dx: -dx,
        dy: -dy,
        dz: -dz,
        r,
        gravity: gravityMag || undefined,
        charge: chargeMag || undefined,
        spin: spinMag || undefined,
        fx: -fx,
        fy: -fy,
        fz: -fz,
      };
      if ((gravityMag !== 0) || (chargeMag !== 0) || (spinMag !== 0)) {
        if (!pairs.has(a.id)) pairs.set(a.id, []);
        if (!pairs.has(b.id)) pairs.set(b.id, []);
        pairs.get(a.id)!.push(pairA);
        pairs.get(b.id)!.push(pairB);
      }
    }
  }

  for (const atom of atoms) {
    const text = await Deno.readTextFile(atom.path);
    const meta = atom.meta;

    const links = atom.relationsUse.map((t) => ({
      kind: "spring",
      target: String(t),
      strength: springStrength,
    }));
    const netVec = net.get(atom.id) ?? { x: 0, y: 0, z: 0 };
    const magnitude = Math.sqrt(netVec.x ** 2 + netVec.y ** 2 + netVec.z ** 2);

    const nextForces = {
      ...(meta.forces ?? {}),
      self: {
        ...(meta?.forces?.self ?? {}),
        mass: atom.mass || undefined,
        charge: atom.charge || undefined,
        spin: atom.spin || undefined,
      },
      links,
      pairs: pairs.get(atom.id) ?? [],
      net: { ...netVec, magnitude },
    };
    const next = { ...meta, forces: nextForces };

    const out = stringifyYaml(next);
    if (out !== text) {
      await Deno.writeTextFile(atom.path, out);
      touched++;
    }
  }

  console.log(`CODEX_FORCE_ENGINE updated ${touched} atoms.`);
};

if (import.meta.main) {
  await main();
}
