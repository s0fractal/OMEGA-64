// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/memory/attentionFieldBuffer.md
import { GRID_CELLS, ATTENTION_FIELD_OFFSET, sharedBuffer } from "@g02";

export const attentionFieldBuffer = new Float32Array(sharedBuffer, ATTENTION_FIELD_OFFSET, GRID_CELLS).buffer;
