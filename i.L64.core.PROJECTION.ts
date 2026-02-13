// i.L64.core.PROJECTION.ts
// 🛡️ OMEGA-64 | The Lens | Topological Projection
// Transforms high-dimensional state into 3D geometry for the Hologram.

import type { StateSnapshot } from "./i.L99.core.STATE_SNAPSHOT.ts";

export interface Point3D {
    x: number;
    y: number;
    z: number;
    color: string;
    size: number;
    id: string; // Atom ID
}

export type ProjectionMode = "CYLINDER" | "TORUS";

export const PROJECTION = {
    /**
     * Projects the linear state (64 levels) into a 3D structure.
     */
    transform: (state: StateSnapshot, mode: ProjectionMode = "CYLINDER"): Point3D[] => {
        const points: Point3D[] = [];
        const levels = state.state_i16.length; // 64

        // Constants for Geometry
        const RADIUS = 200;
        const HEIGHT_SCALE = 10;
        const TORUS_R = 150; // Distance from center to tube center
        const TORUS_r = 50;  // Radius of the tube

        for (let i = 0; i < levels; i++) {
            const val = state.state_i16[i]; // -32768..32767
            const normalized = val / 32768.0; // -1.0..1.0
            
            // Phase determines Angle (Theta)
            // We don't have per-atom phase in global state efficiently yet, 
            // so we use the Index + Value to simulate a spiral.
            // In a full implementation, we'd use state.phase_u16[i]
            const phase = state.phase_u16 ? state.phase_u16[i] : 0;
            const theta = (i / levels) * Math.PI * 2 * 2; // 2 windings
            
            // Interaction with Phase:
            // Actual atoms would be distinct points.
            // Here we visualize the "Backbone" (the 64 levels).
            
            let x, y, z;

            if (mode === "CYLINDER") {
                // Cylindrical Projection
                // x, z are the circle
                // y is the vertical axis (levels)
                
                // Modulate Radius by Value (Entropy/Energy)
                const r = RADIUS + (normalized * 50); 
                
                x = r * Math.cos(theta);
                z = r * Math.sin(theta);
                y = (i - levels/2) * HEIGHT_SCALE;

            } else {
                // Torus Projection
                // theta is the large circle
                // phi (from value) is the small circle
                const phi = normalized * Math.PI; // Twist based on value

                x = (TORUS_R + TORUS_r * Math.cos(phi)) * Math.cos(theta);
                z = (TORUS_R + TORUS_r * Math.cos(phi)) * Math.sin(theta);
                y = TORUS_r * Math.sin(phi);
            }

            // Color Mapping
            // Red = High Entropy (Excited)
            // Blue = Low Entropy (Frozen)
            // Green = Balanced
            const intensity = Math.floor(Math.abs(normalized) * 255);
            let color = `rgb(${intensity}, 200, 255)`;
            if (val > 10000) color = `rgb(255, 100, 100)`; // Hot
            if (val < -10000) color = `rgb(100, 100, 255)`; // Cold

            points.push({
                x, y, z,
                color,
                size: 2 + Math.abs(normalized) * 3, // Louder = Bigger
                id: `L${i}`
            });
        }
        
        return points;
    }
};
