import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { pack_structure_intent } from "../06/pack_structure_intent.ts";

Deno.test("Ontology Contract: pack_structure_intent", () => {
  assertEquals(pack_structure_intent(1, 55, false), 922746881, "Test case 0 failed: fn(1, 55, false) !== 922746881");
  assertEquals(pack_structure_intent(3, 0, true), -2147483645, "Test case 1 failed: fn(3, 0, true) !== -2147483645");
});
