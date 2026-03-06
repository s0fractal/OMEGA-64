import {
  captureGoldenTrace,
  SUPPORTED_GOLDEN_TRACE_IDS,
} from "./verification/golden_trace_capture.ts";
import { GOLDEN_TRACE_CATALOG } from "./verification/golden_trace_catalog.ts";

const expect = (condition: unknown, message: string): void => {
  if (!condition) throw new Error(message);
};

const main = async () => {
  expect(
    typeof captureGoldenTrace === "function",
    "[golden_trace_capture] captureGoldenTrace export missing",
  );

  const supported = new Set(SUPPORTED_GOLDEN_TRACE_IDS);
  expect(
    supported.size === GOLDEN_TRACE_CATALOG.length,
    "[golden_trace_capture] supported ids must match catalog size",
  );

  for (const trace of GOLDEN_TRACE_CATALOG) {
    expect(
      supported.has(trace.id),
      `[golden_trace_capture] unsupported trace id: ${trace.id}`,
    );
  }

  console.log(
    `[golden_trace_capture] contract guard passed. scenarios=${SUPPORTED_GOLDEN_TRACE_IDS.length}`,
  );
};

await main();
