// SSoT: file:///Users/s0fractal/OMEGA/I/memory/ledgerDataView.md
import { MAX_LEDGER_EVENTS, LEDGER_DATA_OFFSET, sharedBuffer } from "@g02";

export const ledgerDataView = new Int32Array(sharedBuffer, LEDGER_DATA_OFFSET, MAX_LEDGER_EVENTS * 4);
