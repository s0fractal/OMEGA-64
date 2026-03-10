import { OFFSETS } from "./src/index.ts";
import { OFFICIAL_CONSTANTS } from "./OFFSETS.ts";

console.log("TS Offsets:");
for (const [k, v] of Object.entries(import("./OFFSETS.ts"))) {
   if(k.endsWith("_OFFSET")) {
      console.log(k, v);
   }
}
