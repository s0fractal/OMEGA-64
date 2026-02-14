import { TELEMETRY } from "./i.L03.core.TELEMETRY.ts";
import { SIGNAL } from "./i.L64.core.SIGNAL.ts";

export const TELEMETRY_SIGNAL = (packet: ReturnType<typeof TELEMETRY>, type: "INFO" | "WARNING" | "REQUEST" | "ERROR" = "INFO") => SIGNAL.emit(type, { source: packet.source, message: packet.message, context: packet.timestamp ? { ...(packet.context ?? {}), timestamp: packet.timestamp } : packet.context }).catch(() => undefined);
