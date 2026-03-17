// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/memory/mailboxes.md
import { MAX_ATOMS, MAILBOX_OFFSET, sharedBuffer } from "@g02";

export const mailboxes = new Int32Array(sharedBuffer, MAILBOX_OFFSET, MAX_ATOMS * 2);
