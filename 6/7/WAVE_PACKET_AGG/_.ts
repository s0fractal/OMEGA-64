
/**
 * [6/7/WAVE_PACKET_AGG/_.ts]
 * Wave packet aggregator
 */
export const ATOM = () => {
    return (packet: any) => (r: any) => {
        const dr = r - packet.center;
        const exponent = -(dr * dr) / (2 * packet.width * packet.width);
        return packet.amplitude * Math.exp(exponent);
    };
};
