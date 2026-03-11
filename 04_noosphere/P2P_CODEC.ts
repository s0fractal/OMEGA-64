// OMEGA-64 | P2P_CODEC.ts | Era 69: Absolute Coherence
// Binary serialization for autonomous inter-node atom migration (OP_SPORE_DRIVE)

import { STATE_MATRIX } from "../00_substrate/mod.ts";

export const PACKET_SIZE = 192; // 172 bytes payload + 20 bytes padding for future expansion

export const P2P_CODEC = {
  /**
   * Serializes an atom from STATE_MATRIX into a strict Uint8Array binary format.
   * Format:
   * 0-7:   ID (BigUint64)
   * 8-9:   X (Int16)
   * 10-11: Y (Int16)
   * 12-15: Energy (Float32 - converted back from Float/SCALE internals to preserve fidelity)
   * 16-19: Resonance (Int32)
   * 20-23: Phase (Int32)
   * 24-31: Logic/Genome (Uint8Array x 8)
   * 32:    Role (Uint8)
   * 33:    Damping (Uint8)
   * 34-35: Padding/Reserved (Uint16)
   * 36-43: Lineage (BigUint64)
   * 44-107: Context / Registers (Int32Array x 16 -> 64 bytes)
   * 108-171: Instructions (Uint8Array x 64 -> 64 bytes)
   * 172-191: Padding (20 bytes)
   */
  packAtom: (idx: number): Uint8Array => {
    const buffer = new ArrayBuffer(PACKET_SIZE);
    const view = new DataView(buffer);
    const u8 = new Uint8Array(buffer);

    view.setBigUint64(0, STATE_MATRIX.getId(idx), true);
    view.setInt16(8, STATE_MATRIX.getX(idx), true);
    view.setInt16(10, STATE_MATRIX.getY(idx), true);
    view.setFloat32(12, STATE_MATRIX.getEnergy(idx), true);
    view.setInt32(16, STATE_MATRIX.getResonance(idx), true);
    view.setInt32(20, STATE_MATRIX.getPhase(idx), true);

    const logic = STATE_MATRIX.getLogic(idx);
    u8.set(logic, 24);

    view.setUint8(32, STATE_MATRIX.getRole(idx));
    view.setUint8(33, STATE_MATRIX.getDamping(idx));
    // 34-35 reserved padding
    view.setBigUint64(36, STATE_MATRIX.getLineage(idx), true);

    const context = STATE_MATRIX.getContext(idx);
    u8.set(
      new Uint8Array(context.buffer, context.byteOffset, context.byteLength),
      44,
    );

    const instructions = STATE_MATRIX.getInstructions(idx);
    u8.set(instructions, 108);

    return u8;
  },

  /**
   * Unpacks a binary Uint8Array into a free STATE_MATRIX atom slot.
   * Returns the new index `idx` if successful, or -1 if the matrix is full.
   */
  unpackAtom: (buffer: Uint8Array): number => {
    if (buffer.length < PACKET_SIZE) return -1; // Invalid packet size

    const idx = STATE_MATRIX.findEmptySlot();
    if (idx === -1) return -1; // Lattice full

    const view = new DataView(
      buffer.buffer,
      buffer.byteOffset,
      buffer.byteLength,
    );

    const id = view.getBigUint64(0, true);
    const x = view.getInt16(8, true);
    const y = view.getInt16(10, true);
    const energy = view.getFloat32(12, true);
    const resonance = view.getInt32(16, true);
    const phase = view.getInt32(20, true);

    const logic = buffer.subarray(24, 32);
    const role = view.getUint8(32);
    const damping = view.getUint8(33);
    const lineage = view.getBigUint64(36, true);

    // Seed core fields
    STATE_MATRIX.seedAtom(
      idx,
      id,
      x,
      y,
      Math.max(0, energy),
      Math.max(0, resonance),
      logic,
    );
    STATE_MATRIX.setPhase(idx, phase);
    STATE_MATRIX.setRole(idx, role);
    STATE_MATRIX.setDamping(idx, damping);
    STATE_MATRIX.setLineage(idx, lineage);

    // Restore execution context (registers and PC)
    const contextSrc = buffer.subarray(44, 108);
    const contextDst = new Uint8Array(
      STATE_MATRIX.getContext(idx).buffer,
      STATE_MATRIX.getContext(idx).byteOffset,
      64,
    );
    contextDst.set(contextSrc);

    // Restore instructions
    const instSrc = buffer.subarray(108, 172);
    STATE_MATRIX.setInstructions(idx, instSrc);

    return idx;
  },
};
