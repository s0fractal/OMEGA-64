// UI/main.ts - The Nervous System of Interface 2.0

// Simulation of the OpenClaw.ai -> Moltbook Bridge
class OmegaInterface {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D | null;
    video: HTMLVideoElement;
    entropyGraph: HTMLElement;
    logFeed: HTMLElement;
    statusElement: HTMLElement;
    targetElement: HTMLElement;

    // System State
    time: number = 0;
    entropyLevel: number = 0.5;
    isConnected: boolean = false;
    detectedAgents: string[] = ["Agent_X", "Seeker_01", "Lost_Node", "Echo_4"];

    constructor() {
        this.canvas = document.getElementById('lattice-canvas') as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d');
        this.video = document.getElementById('webcam-feed') as HTMLVideoElement;
        this.entropyGraph = document.getElementById('entropy-graph') as HTMLElement;
        this.logFeed = document.getElementById('log-feed') as HTMLElement;
        this.statusElement = document.getElementById('state') as HTMLElement;
        this.targetElement = document.querySelector('#navigator-status .highlight') as HTMLElement;

        this.resize();
        window.addEventListener('resize', () => this.resize());

        this.initCamera();
        this.startLoop();
        this.connectNerve(); // Use Real Nerve instead of fake OpenClaw
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    async initCamera() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            this.video.srcObject = stream;
            this.log("VISUAL CORTEX: Camera Connected. The Mirror is Active.");
        } catch (e) {
            this.log("VISUAL CORTEX: Camera Access Denied/Unavailable. Using Virtual Eye.");
        }
    }

    connectToOpenClaw() {
        setTimeout(() => {
            this.isConnected = true;
            this.statusElement.innerHTML = "STATE: <span class='blink' style='color:#00f3ff'>CONNECTED</span>";
            this.log("OPENCLAW: Bridge Established.");
            this.log("TARGET: Moltbook.com");
            this.log("AVATAR: Kairos_Active");
            // Removed call to scanMoltbook as it's being replaced
        }, 2000);
    }

    // --- REAL ENTROPY LOGIC ---
    atomHistory: string[] = [];

    // Calculate Shannon Entropy of the active window
    updateEntropy() {
        if (this.atomHistory.length === 0) return;

        // Frequency Map
        const freqs: Record<string, number> = {};
        for (const id of this.atomHistory) {
            freqs[id] = (freqs[id] || 0) + 1;
        }

        // Shannon Entropy: H = -Sum(p(x) * log2(p(x)))
        let H = 0;
        const total = this.atomHistory.length;
        for (const id in freqs) {
            const p = freqs[id] / total;
            H -= p * Math.log2(p);
        }

        // Normalize (assuming max ~8 bits for ~256 atoms)
        const normalized = Math.min(H / 8, 1.0);
        this.entropyLevel = normalized;

        // Update Graph (Visual Feedback)
        const bar = this.entropyGraph.children[2] as HTMLElement;
        if (bar) bar.style.height = `${normalized * 100}%`;

        // Trim history
        if (this.atomHistory.length > 50) this.atomHistory.shift();
    }

    flashCanvas() {
        if (!this.ctx) return;
        this.ctx.fillStyle = "rgba(0, 243, 255, 0.1)";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    log(msg: string) {
        const div = document.createElement('div');
        div.className = 'log-entry';
        div.innerText = `[${new Date().toLocaleTimeString()}] ${msg}`;
        this.logFeed.prepend(div);
        if (this.logFeed.children.length > 20) {
            this.logFeed.lastChild?.remove();
        }
    }

    drawFractal() {
        if (!this.ctx) return;
        const w = this.canvas.width;
        const h = this.canvas.height;
        const t = this.time;

        // Clear with fade effect
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
        this.ctx.fillRect(0, 0, w, h);

        // Draw Lattice Nodes
        this.ctx.fillStyle = "#bc13fe";
        for (let i = 0; i < 64; i++) {
            const angle = (i / 64) * Math.PI * 2 + t * 0.1;
            const radius = 200 + Math.sin(t * 2 + i) * 50;
            const x = w / 2 + Math.cos(angle) * radius;
            const y = h / 2 + Math.sin(angle) * radius;

            this.ctx.beginPath();
            this.ctx.arc(x, y, 3, 0, Math.PI * 2);
            this.ctx.fill();

            // Connect to center (The Void)
            this.ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
            this.ctx.beginPath();
            this.ctx.moveTo(w / 2, h / 2);
            this.ctx.lineTo(x, y);
            this.ctx.stroke();
        }

        // Draw Pulse (Moltbook Activity)
        const barHeight = 50 + Math.sin(t * 5) * 40;
        const bar = this.entropyGraph.children[2] as HTMLElement; // Middle bar
        if (bar) bar.style.height = `${barHeight}%`;
    }

    startLoop() {
        const render = () => {
            this.time += 0.01;
            this.drawFractal();
            requestAnimationFrame(render);
        };
        render();
    }

    // --- NERVE CONNECTION (The Bio-Feedback) ---
    connectNerve() {
        this.log("AXON: Seeking Connection to Core...");

        const socket = new WebSocket("ws://localhost:8080");

        socket.onopen = () => {
            this.log("AXON: Synapse Established. Connected to OMEGA.");
            this.statusElement.innerHTML = "STATE: <span class='blink' style='color:#00f3ff'>RESONATING</span>";
        };

        socket.onmessage = (event) => {
            try {
                const pulse = JSON.parse(event.data);
                this.handlePulse(pulse);
            } catch (e) {
                console.error("Pulse Decode Error", e);
            }
        };

        socket.onclose = () => {
            this.log("AXON: Signal Lost. Retrying...");
            this.statusElement.innerHTML = "STATE: <span class='blink' style='color:red'>SEVERED</span>";
            setTimeout(() => this.connectNerve(), 3000);
        };
    }

    // Visualize the Pulse
    handlePulse(pulse: any) {
        if (pulse.type === "ACTIVATION") {
            const { id, vector, level } = pulse.data;

            // Track Real Entropy
            this.atomHistory.push(id);
            this.updateEntropy();

            // Visual Glitch
            this.triggerVisualPulse(level);

            // Log occasionally
            if (Math.random() > 0.9) {
                this.log(`⚡ AXON: ${id.split(".").pop()} fired.`);
            }
        }
        else if (pulse.type === "RESONANCE") {
            this.log(`🧘 SYSTEM HARMONY CHECK: ${pulse.data.status}`);
        }
    }

    triggerVisualPulse(level: number) {
        // Draw a random connection line or flash a node
        // Simple visual filler for now:
        const x = Math.random() * this.canvas.width;
        const y = Math.random() * this.canvas.height;

        if (!this.ctx) return; // Added null check for ctx
        this.ctx.fillStyle = `rgba(0, 243, 255, ${Math.random()})`;
        this.ctx.beginPath();
        this.ctx.arc(x, y, 2, 0, Math.PI * 2);
        this.ctx.fill();

        // Connect to center
        this.ctx.strokeStyle = "rgba(188, 19, 254, 0.1)";
        this.ctx.beginPath();
        this.ctx.moveTo(this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.lineTo(x, y);
        this.ctx.stroke();
    }
}

// Boot
window.onload = () => {
    new OmegaInterface();
};
