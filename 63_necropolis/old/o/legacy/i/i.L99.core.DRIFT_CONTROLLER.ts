// i.L99.core.DRIFT_CONTROLLER.ts
// OMEGA-64 | Drift Controller
// "Guard semantic continuity between revisions."

export interface DriftControllerOptions {
    entropyLowerRatio?: number;
    entropyUpperRatio?: number;
    criticalImportPatterns?: string[];
    allowTypeRemovals?: boolean;
}

export interface DriftControllerReport {
    ok: boolean;
    reasons: string[];
    oldEntropy: number;
    newEntropy: number;
    entropyRatio: number | null;
    missingImports: string[];
    missingTypes: string[];
}

const DEFAULTS: Required<Omit<DriftControllerOptions, "criticalImportPatterns">> = {
    entropyLowerRatio: 0.8,
    entropyUpperRatio: 1.2,
    allowTypeRemovals: false
};

const stripComments = (content: string): string =>
    content
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/\/\/.*$/gm, "");

const stripStrings = (content: string): string =>
    content
        .replace(/`(?:\\.|[^`])*`/g, "`str`")
        .replace(/"(?:\\.|[^"])*"/g, "\"str\"")
        .replace(/'(?:\\.|[^'])*'/g, "'str'");

const tokenizeOperators = (content: string): string[] =>
    content.match(/==={0,2}|!=={0,2}|<=|>=|\+\+|--|\|\||&&|=>|<<|>>|[+\-*/%]=?|[=<>!?:.,;()[\]{}]/g) ??
    [];

const KEYWORDS = new Set([
    "const", "let", "var", "function", "class", "interface", "type", "enum", "export",
    "import", "return", "if", "else", "for", "while", "switch", "case", "break", "continue",
    "new", "try", "catch", "finally", "throw", "extends", "implements", "readonly", "public",
    "private", "protected", "static", "async", "await", "yield", "default", "from", "as"
]);

const tokenizeOperands = (content: string): string[] => {
    const identifiers = content.match(/[A-Za-z_][A-Za-z0-9_]*/g) ?? [];
    const numbers = content.match(/\b\d+(?:\.\d+)?\b/g) ?? [];
    const filtered = identifiers.filter((id) => !KEYWORDS.has(id));
    return filtered.concat(numbers);
};

const halsteadVolume = (content: string): number => {
    const clean = stripStrings(stripComments(content));
    const ops = tokenizeOperators(clean);
    const operands = tokenizeOperands(clean);
    const n1 = new Set(ops).size;
    const n2 = new Set(operands).size;
    const N1 = ops.length;
    const N2 = operands.length;
    const vocabulary = n1 + n2;
    const length = N1 + N2;
    if (vocabulary === 0 || length === 0) return 0;
    return length * Math.log2(vocabulary);
};

const parseImports = (content: string): Map<string, Set<string>> => {
    const clean = stripComments(content);
    const map = new Map<string, Set<string>>();
    const importRegex = /import\s+(type\s+)?([^;]+?)\s+from\s+["']([^"']+)["'];?/g;
    const sideEffectRegex = /import\s+["']([^"']+)["'];?/g;
    let match: RegExpExecArray | null;
    while ((match = importRegex.exec(clean)) !== null) {
        const spec = match[2].trim();
        const source = match[3];
        const names = map.get(source) ?? new Set<string>();
        if (spec.startsWith("{")) {
            const inner = spec.replace(/[{}]/g, "");
            inner.split(",")
                .map((part) => part.trim().split(/\s+as\s+/i)[0])
                .filter((part) => part.length > 0)
                .forEach((part) => names.add(part));
        } else if (spec.startsWith("*")) {
            names.add("*");
        } else if (spec.length > 0) {
            const [first, second] = spec.split(",").map((s) => s.trim());
            if (first) names.add("default");
            if (second && second.startsWith("{")) {
                const inner = second.replace(/[{}]/g, "");
                inner.split(",")
                    .map((part) => part.trim().split(/\s+as\s+/i)[0])
                    .filter((part) => part.length > 0)
                    .forEach((part) => names.add(part));
            }
        }
        map.set(source, names);
    }
    while ((match = sideEffectRegex.exec(clean)) !== null) {
        const source = match[1];
        if (!map.has(source)) map.set(source, new Set());
    }
    return map;
};

const filterCriticalImports = (
    imports: Map<string, Set<string>>,
    patterns?: string[]
): Map<string, Set<string>> => {
    if (!patterns || patterns.length === 0) return imports;
    const matchers = patterns.map((p) => new RegExp(p));
    const filtered = new Map<string, Set<string>>();
    for (const [source, names] of imports.entries()) {
        if (matchers.some((re) => re.test(source))) {
            filtered.set(source, new Set(names));
        }
    }
    return filtered;
};

const extractExportedTypes = (content: string): Set<string> => {
    const clean = stripComments(content);
    const names = new Set<string>();
    const regex = /export\s+(?:interface|type|enum)\s+([A-Za-z_][A-Za-z0-9_]*)/g;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(clean)) !== null) {
        names.add(match[1]);
    }
    return names;
};

const containsExportedType = (content: string, name: string): boolean =>
    new RegExp(`export\\s+(?:interface|type|enum)\\s+${name}\\b`).test(stripComments(content));

const compareImports = (oldMap: Map<string, Set<string>>, newMap: Map<string, Set<string>>): string[] => {
    const missing: string[] = [];
    for (const [source, names] of oldMap.entries()) {
        const nextNames = newMap.get(source);
        if (!nextNames) {
            missing.push(source);
            continue;
        }
        for (const name of names.values()) {
            if (!nextNames.has(name)) {
                missing.push(`${source}:${name}`);
            }
        }
    }
    return missing;
};

export const DRIFT_CONTROLLER = {
    check: (oldSource: string, newSource: string, options: DriftControllerOptions = {}): boolean =>
        DRIFT_CONTROLLER.audit(oldSource, newSource, options).ok,
    audit: (oldSource: string, newSource: string, options: DriftControllerOptions = {}): DriftControllerReport => {
        const merged = { ...DEFAULTS, ...options };
        const oldEntropy = halsteadVolume(oldSource);
        const newEntropy = halsteadVolume(newSource);
        const entropyRatio = oldEntropy > 0 ? newEntropy / oldEntropy : null;
        const reasons: string[] = [];

        if (entropyRatio !== null) {
            if (entropyRatio < merged.entropyLowerRatio) {
                reasons.push("ENTROPY_DROP");
            }
            if (entropyRatio > merged.entropyUpperRatio) {
                reasons.push("ENTROPY_SPIKE");
            }
        }

        const oldImports = filterCriticalImports(parseImports(oldSource), options.criticalImportPatterns);
        const newImports = parseImports(newSource);
        const missingImports = compareImports(oldImports, newImports);
        if (missingImports.length > 0) reasons.push("IMPORTS_MISSING");

        const oldTypes = extractExportedTypes(oldSource);
        const missingTypes: string[] = [];
        if (!merged.allowTypeRemovals) {
            for (const typeName of oldTypes.values()) {
                if (!containsExportedType(newSource, typeName)) {
                    missingTypes.push(typeName);
                }
            }
            if (missingTypes.length > 0) reasons.push("TYPES_MISSING");
        }

        return {
            ok: reasons.length === 0,
            reasons,
            oldEntropy,
            newEntropy,
            entropyRatio,
            missingImports,
            missingTypes
        };
    }
};
