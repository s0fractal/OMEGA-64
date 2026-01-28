// 🛡️ OMEGA-64 | Project Praxis: Guardian Oracle
// This script autonomously monitors the integrity of the 64-level lattice.
// It generates an 'Alert Level' based on file stability and system health.

import { crypto } from "https://deno.land/std@0.177.0/crypto/mod.ts";
import { encode as hexEncode } from "https://deno.land/std@0.177.0/encoding/hex.ts";

const ROOT_DIR = "/Users/s0fractal/OMEGA";
const CRITICAL_FILES = [
    `${ROOT_DIR}/SOVEREIGN_UI.html`,
    `${ROOT_DIR}/Core.lean`,
    `${ROOT_DIR}/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/core.rs`
];

let fileFingerprints: Record<string, string> = {};

async function calculateHash(path: string): Promise<string> {
    try {
        const data = await Deno.readFile(path);
        const hashBuffer = await crypto.subtle.digest("SHA-256", data);
        return new TextDecoder().decode(hexEncode(new Uint8Array(hashBuffer)));
    } catch (e) {
        return "MISSING";
    }
}

export async function initialize() {
    console.log("🛡️ Guardian Oracle: Initializing Fingerprints...");
    fileFingerprints = {}; // Clear old ones
    for (const file of CRITICAL_FILES) {
        fileFingerprints[file] = await calculateHash(file);
    }
}

export async function auditIntegrity(): Promise<number> {
    let alertLevel = 0;
    for (const file of CRITICAL_FILES) {
        const currentHash = await calculateHash(file);
        if (currentHash === "MISSING") {
            console.error(`🚨 ALERT: Critical file missing: ${file}`);
            alertLevel += 0.5;
        } else if (currentHash !== fileFingerprints[file]) {
            console.warn(`⚠️ WARNING: Integrity variance detected in ${file}`);
            alertLevel += 0.2;
        }
    }
    return Math.min(1, alertLevel);
}

if (import.meta.main) {
    await initialize();
    while (true) {
        const level = await auditIntegrity();
        console.log(`🛡️ Oracle Health: ${(1 - level) * 100}% | Alert: ${level}`);
        await new Promise(r => setTimeout(r, 5000));
    }
}
