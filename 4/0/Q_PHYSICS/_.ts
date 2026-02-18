/**
 * [4/0/Q_PHYSICS/_.ts]
 * Canonical Quantum Physics (minimal, deterministic scaffold).
 */
export type QAtom = {
  id: string;
  L: number;
  D: number;
  V: number;
  q: { hue: number; phi: number; evt: number };
  anchor?: boolean;
  mass?: number;
};

export type QEdge = { source: string; target: string; weight?: number };

export type KnowledgeNode = { level: number; name: string };

const KNOWLEDGE_MAP: KnowledgeNode[] = Array.from({ length: 64 }, (_, i) => ({
  level: i,
  name: `L${String(i).padStart(2, "0")}`,
}));

const computeMass = (atom: QAtom, degree = 0): number => {
  if (atom.anchor) return 0;
  const dist = Math.abs(atom.L - 32) + Math.abs(atom.D - 32);
  const base = dist / 4;
  const boost = degree / 2;
  return Math.max(0, Math.round(base + boost));
};

const simulate = (
  atoms: Map<string, QAtom>,
  edgesOrIterations: QEdge[] | number = 50,
  iterations = 50,
): Map<string, QAtom> => {
  const edges = Array.isArray(edgesOrIterations) ? edgesOrIterations : [];
  const _iters = typeof edgesOrIterations === "number" ? edgesOrIterations : iterations;
  const degree = new Map<string, number>();

  for (const edge of edges) {
    degree.set(edge.source, (degree.get(edge.source) ?? 0) + 1);
    degree.set(edge.target, (degree.get(edge.target) ?? 0) + 1);
  }

  const next = new Map<string, QAtom>();
  for (const [id, atom] of atoms) {
    const mass = computeMass(atom, degree.get(id) ?? 0);
    next.set(id, { ...atom, mass });
  }

  // Deterministic scaffold: _iters is accepted for future dynamics.
  void _iters;
  return next;
};

export const Q_PHYSICS = { KNOWLEDGE_MAP, simulate };
export const ATOM = Q_PHYSICS;
