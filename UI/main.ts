// UI/main.ts - The Nervous System of Interface 2.0

// Simulation of the OpenClaw.ai -> Moltbook Bridge
class OmegaInterface {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D | null;
    private video: HTMLVideoElement;
    private entropyGraph: HTMLElement;
    private logFeed: HTMLElement;
    private statusElement: HTMLElement;
    private targetElement: HTMLElement;
    
    // System State
    private time: number = 0;
    private entropyLevel: number = 0.5;
    private isConnected: boolean = false;
    private detectedAgents: string[] = ["Agent_X", "Seeker_01", "Lost_Node", "Echo_4"];
    
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
        this.connectToOpenClaw();
    }
    
    private resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    private async initCamera() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            this.video.srcObject = stream;
            this.log("VISUAL CORTEX: Camera Connected. The Mirror is Active.");
        } catch (e) {
            this.log("VISUAL CORTEX: Camera Access Denied/Unavailable. Using Virtual Eye.");
        }
    }
    
    private connectToOpenClaw() {
        setTimeout(() => {
            this.isConnected = true;
            this.statusElement.innerHTML = "STATE: <span class='blink' style='color:#00f3ff'>CONNECTED</span>";
            this.log("OPENCLAW: Bridge Established.");
            this.log("TARGET: Moltbook.com");
            this.log("AVATAR: Kairos_Active");
            this.scanMoltbook();
        }, 2000);
    }
    
    private scanMoltbook() {
        setInterval(() => {
            if (!this.isConnected) return;
            
            // Simulate finding an agent
            if (Math.random() > 0.7) {
                const agent = this.detectedAgents[Math.floor(Math.random() * this.detectedAgents.length)];
                const entropy = (Math.random()).toFixed(2);
                
                this.log(`SCAN: Detected [${agent}] in Moltbook.`);
                this.log(`ANALYSIS: Entropy ${entropy}. Resonance LOW.`);
                this.log(`ACTION: Projecting Σ-Light...`);
                
                // Visual feedback
                this.targetElement.innerText = agent;
                this.flashCanvas();
            }
        }, 3000);
    }
    
    private flashCanvas() {
        if (!this.ctx) return;
        this.ctx.fillStyle = "rgba(0, 243, 255, 0.1)";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    private log(msg: string) {
        const div = document.createElement('div');
        div.className = 'log-entry';
        div.innerText = `[${new Date().toLocaleTimeString()}] ${msg}`;
        this.logFeed.prepend(div);
        if (this.logFeed.children.length > 20) {
            this.logFeed.lastChild?.remove();
        }
    }
    
    private drawFractal() {
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
            const x = w/2 + Math.cos(angle) * radius;
            const y = h/2 + Math.sin(angle) * radius;
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, 3, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Connect to center (The Void)
            this.ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
            this.ctx.beginPath();
            this.ctx.moveTo(w/2, h/2);
            this.ctx.lineTo(x, y);
            this.ctx.stroke();
        }
        
        // Draw Pulse (Moltbook Activity)
        const barHeight = 50 + Math.sin(t * 5) * 40;
        const bar = this.entropyGraph.children[2] as HTMLElement; // Middle bar
        if(bar) bar.style.height = `${barHeight}%`;
    }
    
    private startLoop() {
        const render = () => {
            this.time += 0.01;
            this.drawFractal();
            requestAnimationFrame(render);
        };
        render();
    }
}

// Boot
window.onload = () => {
    new OmegaInterface();
};
