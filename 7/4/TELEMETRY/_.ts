
/**
 * [7/4/TELEMETRY/_.ts]
 * Inverted from Legacy L03.
 */
export const ATOM = () => (source: string, message: string, context?: Record<string, unknown>, timestamp?: string) => ({ 
  source, 
  message, 
  context, 
  timestamp: timestamp ?? new Date().toISOString() 
});
