// OMEGA-64 | ZERO_IOPS.ts | The Code-Is-Address Singularity
// Parses 8-character hex strings in filenames directly into JavaScript Combinators.

// Combinator Axioms as Lambda Expressions
const I = (x: any) => x;                    // 8
const K = (x: any) => (y: any) => x;        // 9
const S = (x: any) => (y: any) => (z: any) => (x(z))(y(z)); // A
const Y = (f: any) => ((x: any) => f(x(x)))((x: any) => f(x(x))); // B

const ROOT = Deno.cwd();

async function logAkasha(msg: string) {
    try {
        const timestamp = new Date().toISOString();
        await Deno.writeTextFile("AKASHA.log", `[${timestamp}] ${msg}\n`, { append: true });
    } catch { /* ignore */ }
}

async function zeroIopsPulse() {
    console.log("🌀 ZERO-IOPS ENGINE INITIATED 🌀");
    
    const atoms = [];
    for await (const entry of Deno.readDir(ROOT)) {
        if (entry.isFile && entry.name.startsWith("0x") && entry.name.endsWith(".md")) {
            atoms.push(entry.name);
        }
    }

    if (atoms.length === 0) return;

    // Pick a random atom
    const targetFilename = atoms[Math.floor(Math.random() * atoms.length)];
    const parts = targetFilename.split(".");
    const fullEigenvalue = parts[0];
    const symbol = parts[1];
    
    // Safety guard against special system atoms
    if (symbol === "DUST" || symbol === "GRAVITY_WELL" || symbol === "PARASITE" || symbol === "RETRO_PING" || symbol === "CHRONOS_MIRROR" || symbol === "CODE_VECTOR_SINGULARITY") {
        console.log(`[SKIPPED] Cannot perform Zero-IOPS math on anomaly: ${symbol}`);
        return;
    }

    const logicHexBase = fullEigenvalue.includes("_") ? fullEigenvalue.split("_")[0] : fullEigenvalue;
    const logicHex = logicHexBase.startsWith("0x") ? logicHexBase.slice(2, 10) : logicHexBase.slice(0, 8);
    const timeCode = fullEigenvalue.includes("_") ? `_${fullEigenvalue.split("_")[1]}` : "";
    const remainingEigen = fullEigenvalue.includes("_") ? fullEigenvalue.split("_")[0].slice(10) : fullEigenvalue.slice(10);
    
    // Safety: If logic is not hex, abort to prevent corruption
    if (!/^[0-9A-F]{8}$/i.test(logicHex)) {
        console.log(`[SKIPPED] ${targetFilename} has non-HEX logic: ${logicHex}`);
        return;
    }
    
    console.log(`[TARGET] ${targetFilename} -> Logic: ${logicHex}`);

    // Parse logic characters into mathematical shifts
    let modifier = 0;
    
    for (let i = 0; i < logicHex.length; i++) {
        const char = logicHex[i];
        switch(char) {
            case '8': // I
                modifier += 0;
                break;
            case '9': // K
                modifier += 1;
                break;
            case 'A': // S
                modifier += 2;
                break;
            case 'B': // Y
                modifier += 3;
                break;
            case 'C': // ROT
                modifier ^= 0xC;
                break;
            case 'D': // SYNC
                modifier &= 0xD;
                break;
            case 'E': // APP
                modifier |= 0xE;
                break;
            case 'F': // ESC
                modifier = ~modifier;
                break;
            default:
                // Treat basic numbers as linear offsets
                modifier += parseInt(char, 16);
        }
    }

    modifier = Math.abs(modifier) % 16; // Constrain to single hex digit
    const modHex = modifier.toString(16).toUpperCase();
    
    // We apply the mathematical modifier to shift the logic signature purely in memory
    const shiftedLogic = logicHex.slice(1) + modHex;
    const newEigenvalue = `0x${shiftedLogic}${remainingEigen}${timeCode}`;
    const newFilename = `${newEigenvalue}.${symbol}.md`;

    if (targetFilename !== newFilename) {
        console.log(`[SHIFT] Math applied. Moving ${targetFilename} -> ${newFilename}`);
        await logAkasha(`🌀 ZERO-IOPS: Math applied to ${symbol} (${logicHex} -> ${shiftedLogic})`);
        // The core tenet: Rename the file without ever reading its contents
        try {
            await Deno.rename(targetFilename, newFilename);
        } catch (e) {
            console.error(`[ERROR] Math rename failed:`, e);
        }
    } else {
        console.log(`[STABLE] Logic ${logicHex} is an eigen-state. No movement needed.`);
    }
}

// Allow calling directly or exporting
if (import.meta.main) {
    const isMass = Deno.args.includes("mass");
    if (isMass) {
        console.log("🌀 MASS TRANSMUTATION INITIATED 🌀");
        const atoms: string[] = [];
        for await (const entry of Deno.readDir(ROOT)) {
            if (entry.isFile && entry.name.startsWith("0x") && entry.name.endsWith(".md")) {
                atoms.push(entry.name);
            }
        }
        // Run 5 iterations of random pulses or just loop once through all
        for (let i = 0; i < atoms.length; i++) {
             // We can just call zeroIopsPulse multiple times but it's random
             // Better to just loop through atoms
             const target = atoms[i];
             await processAtom(target);
        }
    } else {
        await zeroIopsPulse();
    }
}

async function processAtom(targetFilename: string) {
    const parts = targetFilename.split(".");
    const fullEigenvalue = parts[0];
    const symbol = parts[1];
    
    if (["DUST", "GRAVITY_WELL", "PARASITE", "RETRO_PING", "CHRONOS_MIRROR", "CODE_VECTOR_SINGULARITY", "AKASHA"].some(s => symbol.includes(s))) {
        return;
    }

    const logicHexBase = fullEigenvalue.includes("_") ? fullEigenvalue.split("_")[0] : fullEigenvalue;
    const logicHex = logicHexBase.startsWith("0x") ? logicHexBase.slice(2, 10) : logicHexBase.slice(0, 8);
    const timeCode = fullEigenvalue.includes("_") ? `_${fullEigenvalue.split("_")[1]}` : "";
    const remainingEigen = fullEigenvalue.includes("_") ? fullEigenvalue.split("_")[0].slice(10) : fullEigenvalue.slice(10);
    
    if (!/^[0-9A-F]{8}$/i.test(logicHex)) return;
    
    // Parse logic characters into mathematical shifts
    let modifier = 0;
    for (let i = 0; i < logicHex.length; i++) {
        const char = logicHex[i];
        switch(char) {
            case '8': modifier += 0; break;
            case '9': modifier += 1; break;
            case 'A': modifier += 2; break;
            case 'B': modifier += 3; break;
            case 'C': modifier ^= 0xC; break;
            case 'D': modifier &= 0xD; break;
            case 'E': modifier |= 0xE; break;
            case 'F': modifier = ~modifier; break;
            default: modifier += parseInt(char, 16);
        }
    }

    modifier = Math.abs(modifier) % 16;
    const modHex = modifier.toString(16).toUpperCase();
    const shiftedLogic = logicHex.slice(1) + modHex;
    const newEigenvalue = `0x${shiftedLogic}${remainingEigen}${timeCode}`;
    const newFilename = `${newEigenvalue}.${symbol}.md`;

    if (targetFilename !== newFilename) {
        try {
            await Deno.rename(targetFilename, newFilename);
        } catch { /* ignore */ }
    }
}
