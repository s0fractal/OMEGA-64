// SSoT: src/ontology/core/VmSys.md

// Enum: VmSys
export const SYS_YIELD: number = 1;
export const SYS_READ_MEM: number = 2;
export const SYS_WRITE_MEM: number = 3;
export const SYS_SPAWN: number = 4;
export const SYS_BIND: number = 5;
export const SYS_SET_ROLE: number = 6;
export const SYS_MUTATE: number = 7;
export const SYS_MSG: number = 8;
export const SYS_READ_INBOX: number = 9;
export const SYS_TRANSFER: number = 10;
export const SYS_REPLICATE: number = 11;
export const SYS_EMIT: number = 12;
export const SYS_SCAN: number = 13;
export const SYS_MOVE: number = 14;
export const SYS_EAT: number = 15;
export const SYS_BET: number = 16;
export const SYS_ATTRACT: number = 17;
export const SYS_FOLD: number = 18;
export const SYS_SPORE_DRIVE: number = 20;
export const SYS_SENSE_PHASE: number = 21;
export const VmSys = {
  YIELD: 1,
  READ_MEM: 2,
  WRITE_MEM: 3,
  SPAWN: 4,
  BIND: 5,
  SET_ROLE: 6,
  MUTATE: 7,
  MSG: 8,
  READ_INBOX: 9,
  TRANSFER: 10,
  REPLICATE: 11,
  EMIT: 12,
  SCAN: 13,
  MOVE: 14,
  EAT: 15,
  BET: 16,
  ATTRACT: 17,
  FOLD: 18,
  SPORE_DRIVE: 20,
  SENSE_PHASE: 21,
} as const;
