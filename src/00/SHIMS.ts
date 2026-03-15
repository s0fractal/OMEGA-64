// OMEGA-64 | SHIMS.ts
// Legacy Compliance Re-exports
// This file has been modularized. It now serves purely as a barrel file
// to prevent breaking imports in the `src/` modules.

export type REPLAY_AUDIT__08_00_ReplayInvariantReport = any;

const LOAD_DATA = {
  load: (_id: string) => null,
  calculate: (_cfg: any, _phase: number) => 1.0,
};
export const LOAD_LOAD = Object.assign(() => LOAD_DATA, LOAD_DATA);


export * from "./agent_signature.ts";
export * from "./gate_admission.ts";
export * from "../_/01/checkpoint_chain.ts";
export * from "../_/01/ledger_chain.ts";
export * from "./topo_signature.ts";
export * from "./crystallization.ts";
export * from "./invariant_packet.ts";
