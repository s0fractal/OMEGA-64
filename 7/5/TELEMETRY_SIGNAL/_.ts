
/**
 * [7/5/TELEMETRY_SIGNAL/_.ts]
 * Inverted from Legacy L02.
 */
export const ATOM = ({ siblings: { TELEMETRY, SIGNAL } }) => {
    return async (packet: any, type: "INFO" | "WARNING" | "REQUEST" | "ERROR" = "INFO") => {
        // TELEMETRY is a lambda in the new system
        const sig = await SIGNAL(); 
        return sig.emit(type, { 
            source: packet.source, 
            message: packet.message, 
            context: packet.timestamp ? { ...(packet.context ?? {}), timestamp: packet.timestamp } : packet.context 
        }).catch(() => undefined);
    };
};
