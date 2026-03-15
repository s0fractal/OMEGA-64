// SSoT: src/ontology/core/VmOpcodes.md

// Enum: VmOpcodes
export const OP_NOP: number = 0;
export const OP_SET: number = 1;
export const OP_GET: number = 2;
export const OP_PUT: number = 3;
export const OP_ADD: number = 4;
export const OP_SUB: number = 5;
export const OP_JZ: number = 16;
export const OP_JNZ: number = 17;
export const OP_JMP: number = 18;
export const OP_SYSCALL: number = 96;
export const OP_REPLICATE: number = 128;
export const OP_SIGNAL: number = 129;
export const OP_BIND: number = 130;
export const OP_SHARE: number = 131;
export const OP_HEBB: number = 138;
export const OP_FIRE: number = 139;
export const OP_DECAY: number = 145;
export const OP_PLUG: number = 164;
export const OP_TENSEGRITY: number = 165;
export const OP_COLLECTIVE: number = 166;
export const OP_BUILD: number = 168;
export const OP_SPORE_DRIVE: number = 167;
export const OP_SENSE: number = 169;
export const OP_SENSE_AS: number = 178;
export const OP_SECRETE_PLASMID: number = 170;
export const OP_INCORPORATE_PLASMID: number = 171;
export const OP_RESOLVE: number = 176;
export const OP_RESONATE_KURAMOTO: number = 177;
export const VmOpcodes = {
  OP_NOP: 0,
  OP_SET: 1,
  OP_GET: 2,
  OP_PUT: 3,
  OP_ADD: 4,
  OP_SUB: 5,
  OP_JZ: 16,
  OP_JNZ: 17,
  OP_JMP: 18,
  OP_SYSCALL: 96,
  OP_REPLICATE: 128,
  OP_SIGNAL: 129,
  OP_BIND: 130,
  OP_SHARE: 131,
  OP_HEBB: 138,
  OP_FIRE: 139,
  OP_DECAY: 145,
  OP_PLUG: 164,
  OP_TENSEGRITY: 165,
  OP_COLLECTIVE: 166,
  OP_BUILD: 168,
  OP_SPORE_DRIVE: 167,
  OP_SENSE: 169,
  OP_SENSE_AS: 178,
  OP_SECRETE_PLASMID: 170,
  OP_INCORPORATE_PLASMID: 171,
  OP_RESOLVE: 176,
  OP_RESONATE_KURAMOTO: 177,
  ENTANGLE: 138,
  ROLE: 170,
} as const;
