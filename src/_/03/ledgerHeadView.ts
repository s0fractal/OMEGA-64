// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/memory/ledgerHeadView.md
import { LEDGER_HEAD_OFFSET, sharedBuffer } from "@g02";

export const ledgerHeadView = new Int32Array(sharedBuffer, LEDGER_HEAD_OFFSET, 1);
