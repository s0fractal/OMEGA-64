import { readFileSync } from "fs";

const text = readFileSync("src/00/generate.ts", "utf-8");
const start = text.indexOf("const TS_OFFSETS = `");
const end = text.indexOf("const rsLayoutVariables", start);
const TS_OFFSETS = text.substring(start + 20, end).split("`;")[0];

const rsLayoutVariables = TS_OFFSETS.split('\n')
  .filter(l => {
    return (l.includes('_BYTES = ') || l.includes('_OFFSET = ') || l.includes('INTENT_OFFSET = ') || l.includes('_OFF = ') || l.includes('_OFFSET: usize = ')) && !l.includes('WASM_PAGE_BYTES');
  })
  .map(l => {
    let raw = l.trim();
    if (raw.startsWith('export const ')) raw = raw.substring('export const '.length);
    else if (raw.startsWith('const ')) raw = raw.substring('const '.length);
    else return "";
    
    let parts = raw.split('=');
    // ... we don't need the rest to check if filter works
    return raw;
  }).filter(l => l.length > 0).join('\n');
  
console.log(rsLayoutVariables);
