// i.L99.core.DETERMINISM_LAWS.ts
// OMEGA-64 | Determinism Law Engine
// "Law as executable physics."

import {
    DeterminismBand,
    atomIdToBand,
    atomIdToLevel
} from "./i.L99.core.DETERMINISM_BANDS.ts";

export interface DeterminismAuditInput {
    atomId: string;
    content: string;
}

export interface DeterminismAuditResult {
    ok: boolean;
    level: number | null;
    band: DeterminismBand;
    reasons: string[];
}

const NON_DETERMINISTIC_TOKENS = [
    "Math.random",
    "crypto.getRandomValues",
    "Date.now",
    "new Date",
    "performance.now",
    "setTimeout",
    "setInterval"
];

const AXOP_FORBIDDEN_TOKENS = [
    "Math.",
    "Date",
    "performance.",
    "crypto.getRandomValues",
    "Deno.",
    "fetch(",
    "console."
];

const IO_TOKENS_AXOP = [
    "console.",
    "fetch(",
    "WebSocket",
    "BroadcastChannel"
];
const IO_TOKENS_FL = [
    "console.",
    "fetch(",
    "WebSocket",
    "BroadcastChannel"
];

const NONCANONICAL_TAG = /@noncanonical|@experimental|non-canonical|noncanonical/i;
const LIMIT_LITERAL_PATTERNS = [
    /(^|[^0-9])32767([^0-9]|$)/,
    /(^|[^0-9])32768([^0-9]|$)/,
    /(^|[^0-9])65535([^0-9]|$)/,
    /(^|[^0-9])65536([^0-9]|$)/,
    /-32768/
];
const CANON_LIMIT_IMPORT = /I16_LIMITS|I16_CLAMP|U16_LIMITS/;

const countExports = (content: string): number => {
    const matches = [
        content.match(/export\s+const\b/g) ?? [],
        content.match(/export\s+function\b/g) ?? [],
        content.match(/export\s+class\b/g) ?? [],
        content.match(/export\s+default\b/g) ?? []
    ];
    return matches.reduce((acc, arr) => acc + arr.length, 0);
};

const hasMultiConstBinding = (content: string): boolean => {
    const match = content.match(/export\s+const\s+([^=]+)=/);
    if (!match) return false;
    return match[1].includes(",");
};

const findToken = (content: string, tokens: string[]): string | null => {
    for (const token of tokens) {
        if (content.includes(token)) return token;
    }
    return null;
};

const stripComments = (content: string): string =>
    content
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/\/\/.*$/gm, "");

const hasLimitLiteral = (content: string): boolean =>
    LIMIT_LITERAL_PATTERNS.some((pattern) => pattern.test(content));

export const DETERMINISM_LAWS = {
    audit: (input: DeterminismAuditInput): DeterminismAuditResult => {
        const level = atomIdToLevel(input.atomId);
        const band = atomIdToBand(input.atomId);
        const reasons: string[] = [];

        if (band === "UNKNOWN") {
            return { ok: true, level, band, reasons };
        }

        const content = input.content;
        const contentNoComments = stripComments(content);
        if (NONCANONICAL_TAG.test(content)) {
            return { ok: true, level, band, reasons: ["NONCANONICAL_EXEMPT"] };
        }

        if (band === "AX" || band === "OP") {
            const forbidden = findToken(content, AXOP_FORBIDDEN_TOKENS);
            if (forbidden) reasons.push(`AXOP_FORBIDDEN_TOKEN:${forbidden}`);

            const exportCount = countExports(content);
            if (exportCount !== 1) reasons.push(`AXOP_EXPORT_COUNT:${exportCount}`);
            if (hasMultiConstBinding(content)) reasons.push("AXOP_MULTI_CONST_BINDING");
        }

        if (band === "FL") {
            const forbidden = findToken(content, NON_DETERMINISTIC_TOKENS);
            if (forbidden) reasons.push(`FL_NONDETERMINISM:${forbidden}`);
        }

        if (band === "AX" || band === "OP") {
            const io = findToken(content, IO_TOKENS_AXOP);
            if (io) reasons.push(`IO_FORBIDDEN:${io}`);
        }

        if (band === "FL") {
            const io = findToken(content, IO_TOKENS_FL);
            if (io) reasons.push(`IO_FORBIDDEN:${io}`);
        }

        if ((band === "AX" || band === "OP" || band === "FL") && hasLimitLiteral(contentNoComments)) {
            if (!CANON_LIMIT_IMPORT.test(contentNoComments)) {
                reasons.push("CANON_LIMITS_DIRECT");
            }
        }

        if (band === "PJ" || band === "DR") {
            const forbidden = findToken(content, NON_DETERMINISTIC_TOKENS);
            if (forbidden && !NONCANONICAL_TAG.test(content)) {
                reasons.push(`PJDR_REQUIRES_NONCANONICAL_TAG:${forbidden}`);
            }
        }

        return { ok: reasons.length === 0, level, band, reasons };
    }
};
