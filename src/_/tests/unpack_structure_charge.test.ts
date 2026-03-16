import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { unpack_structure_charge } from "../06/unpack_structure_charge.ts";

Deno.test("Ontology Contract: unpack_structure_charge", () => {
  assertEquals(unpack_structure_charge(922746881), 55, "Test case 0 failed: fn(922746881) !== 55");
  assertEquals(unpack_structure_charge(-2147483645), 0, "Test case 1 failed: fn(-2147483645) !== 0");
});
