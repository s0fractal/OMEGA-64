// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/l32_gate/atomic_ledger.md
import { LEDGER_DATA_OFFSET, LEDGER_HEAD_OFFSET, MAX_LEDGER_EVENTS, MX } from "@g04";

// OMEGA-64 | ATOMIC_LEDGER.ts | Era 70
// Binary Event Ring Buffer (Memory-Mapped)


export type AtomicLedgerEvent = {
  tick: number;
  atomIdx: number;
  r1: number;
  r2: number;
};

export const ATOMIC_LEDGER = {
  /**
   * Retrieves the current write cursor (how many total events have been emitted).
   */
  getHead(): number {
    return Atomics.load(MX.ledgerHeadView, 0);
  },

  /**
   * Reads a raw event from the circular buffer given an absolute sequence number.
   * If the sequence number is too old (overwritten by MAX_EVENTS), this will return overwritten data.
   */
  getEvent(sequence: number): AtomicLedgerEvent {
    const cursor = sequence % MAX_LEDGER_EVENTS;
    const base = cursor * 4;
    return {
      tick: Atomics.load(MX.ledgerDataView, base),
      atomIdx: Atomics.load(MX.ledgerDataView, base + 1),
      r1: Atomics.load(MX.ledgerDataView, base + 2),
      r2: Atomics.load(MX.ledgerDataView, base + 3),
    };
  },

  /**
   * Exports the entire ledger data view (including head) as a raw Uint8Array buffer
   * for zero-serialization storage or network transmission.
   */
  exportBinary(): Uint8Array {
    // 4 bytes for head, plus MAX_EVENTS * 16 bytes for data
    const size = 4 + (MAX_LEDGER_EVENTS * 16);
    const dump = new Uint8Array(size);

    // Copy Head
    const headBytes = new Uint8Array(
      MX.ledgerHeadView.buffer,
      LEDGER_HEAD_OFFSET,
      4,
    );
    dump.set(headBytes, 0);

    // Copy Data
    const dataBytes = new Uint8Array(
      MX.ledgerDataView.buffer,
      LEDGER_DATA_OFFSET,
      MAX_LEDGER_EVENTS * 16,
    );
    dump.set(dataBytes, 4);

    return dump;
  },

  /**
   * Reads all events from `startSequence` to `endSequence` strictly.
   */
  readRange(startSeq: number, endSeq: number): AtomicLedgerEvent[] {
    const events: AtomicLedgerEvent[] = [];
    // Ensure we don't try to read more than the buffer can hold
    const safeStart = Math.max(startSeq, endSeq - MAX_LEDGER_EVENTS);
    for (let i = safeStart; i < endSeq; i++) {
      events.push(this.getEvent(i));
    }
    return events;
  },
};
