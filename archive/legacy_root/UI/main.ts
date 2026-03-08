// 🛡️ OMEGA-64 Sovereign UI Logic

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;
const levelDisplay = document.getElementById("level-display")!;
const gaugeBar = document.getElementById("gauge-bar")!;
const healthSignal = document.getElementById("health-signal")!;
const healthCount = document.getElementById("health-count")!;
const healthIndex = document.getElementById("health-index")!;
const healthUpdated = document.getElementById("health-updated")!;
const safeWindow = document.getElementById("safe-window")!;
const mountCount = document.getElementById("mount-count")!;
const mountFiles = document.getElementById("mount-files")!;

let width: number, height: number;
let time = 0;
let lastHealth = "UNKNOWN";
let lastSafeWindow = "UNKNOWN";

function setHealthSignal(signal: string) {
  const normalized = signal.trim().toUpperCase();
  if (normalized === lastHealth) return;
  lastHealth = normalized;
  healthSignal.textContent = normalized;
  healthSignal.classList.remove("green", "amber", "red", "unknown");
  if (normalized === "GREEN") healthSignal.classList.add("green");
  else if (normalized === "AMBER") healthSignal.classList.add("amber");
  else if (normalized === "RED") healthSignal.classList.add("red");
  else healthSignal.classList.add("unknown");
}

function setSafeWindowSignal(signal: string, reason?: string) {
  const normalized = signal.trim().toUpperCase();
  if (normalized === lastSafeWindow && !reason) return;
  lastSafeWindow = normalized;
  safeWindow.textContent = normalized;
  if (reason) {
    safeWindow.title = reason;
  } else {
    safeWindow.removeAttribute("title");
  }
  safeWindow.classList.remove("green", "amber", "red", "unknown");
  if (normalized === "OPEN" || normalized === "GREEN") {
    safeWindow.classList.add("green");
  } else if (normalized === "CLOSED" || normalized === "RED") {
    safeWindow.classList.add("red");
  } else if (normalized === "AMBER") safeWindow.classList.add("amber");
  else safeWindow.classList.add("unknown");
}

function resize() {
  width = canvas.width = globalThis.innerWidth;
  height = canvas.height = globalThis.innerHeight;
}

globalThis.addEventListener("resize", resize);
resize();

class LevelNode {
  constructor(
    public depth: number,
    public x: number,
    public y: number,
    public radius: number,
    public angle: number,
  ) {}

  draw(t: number) {
    const pulse = Math.sin(t * 0.001 + this.depth * 0.1) * 0.5 + 0.5;
    const alpha = (1 - this.depth / 64) * 0.8 + 0.2;

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius * (1 + pulse * 0.1), 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(0, 242, 255, ${alpha})`;
    ctx.lineWidth = 1;
    ctx.stroke();

    if (this.depth < 64) {
      const children = 3;
      for (let i = 0; i < children; i++) {
        const childAngle = this.angle + (i - 1) * 0.5 +
          Math.sin(t * 0.0005) * 0.2;
        const dist = this.radius * 2.5;
        const cx = this.x + Math.cos(childAngle) * dist;
        const cy = this.y + Math.sin(childAngle) * dist;

        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(cx, cy);
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.1})`;
        ctx.stroke();
      }
    }
  }
}

function drawFractal(
  x: number,
  y: number,
  radius: number,
  depth: number,
  angle: number,
  t: number,
) {
  if (depth > 5) return; // Limit depth for performance

  const node = new LevelNode(depth, x, y, radius, angle);
  node.draw(t);

  const children = 3;
  for (let i = 0; i < children; i++) {
    const nextAngle = angle + (i - 1) * 1.5 + t * 0.0002;
    const dist = radius * 3;
    drawFractal(
      x + Math.cos(nextAngle) * dist,
      y + Math.sin(nextAngle) * dist,
      radius * 0.6,
      depth + 1,
      nextAngle,
      t,
    );
  }
}

function animate() {
  time += 16;
  ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  ctx.translate(width / 2, height / 2);
  ctx.rotate(time * 0.0001);
  drawFractal(0, 0, 40, 0, 0, time);
  ctx.restore();

  // Update UI
  const currentLevel = Math.floor((Math.sin(time * 0.001) * 0.5 + 0.5) * 64);
  levelDisplay.textContent = `L${63 - currentLevel} → L00`;
  gaugeBar.style.width = `${(currentLevel / 64) * 100}%`;

  requestAnimationFrame(animate);
}

animate();

async function pollHealth() {
  try {
    const response = await fetch("health_signal.txt", { cache: "no-store" });
    if (!response.ok) return;
    const text = await response.text();
    if (text.trim().length === 0) return;
    setHealthSignal(text);
  } catch {
    // ignore network errors
  }
}

setHealthSignal("UNKNOWN");
setSafeWindowSignal("UNKNOWN");
pollHealth();
setInterval(pollHealth, 3000);

async function fetchHealthPayload(): Promise<any | null> {
  const candidates = ["health.json", "health_io.json"];
  for (const path of candidates) {
    try {
      const response = await fetch(path, { cache: "no-store" });
      if (!response.ok) continue;
      return await response.json();
    } catch {
      // try next candidate
    }
  }
  return null;
}

async function pollHealthDetails() {
  try {
    const payload = await fetchHealthPayload();
    if (!payload) return;
    const total = payload?.summary?.total ??
      payload?.health?.after?.summary?.total ?? 0;
    const indexOk = payload?.archive_index_exists
      ? "OK"
      : (payload?.health?.after?.archive_index_exists ? "OK" : "MISSING");
    healthCount.textContent = String(total);
    healthIndex.textContent = indexOk;
    healthUpdated.textContent = new Date().toLocaleTimeString();
    const safe = payload?.safe_window ?? payload?.health?.safe_window ??
      payload?.before?.safe_window ?? payload?.health?.before?.safe_window;
    if (safe && typeof safe === "object") {
      const ok = Boolean(safe.ok);
      const reason = typeof safe.reason === "string" ? safe.reason : undefined;
      setSafeWindowSignal(ok ? "OPEN" : "CLOSED", reason);
    } else {
      setSafeWindowSignal("UNKNOWN");
    }
  } catch {
    // ignore network errors
  }
}

pollHealthDetails();
setInterval(pollHealthDetails, 5000);

async function pollMounts() {
  try {
    const response = await fetch("OMEGA_MOUNTS.json", { cache: "no-store" });
    if (!response.ok) return;
    const payload = await response.json();
    const mounts = Array.isArray(payload?.mounts) ? payload.mounts : [];
    const totalFiles = mounts.reduce((acc: number, mount: any) => {
      if (Array.isArray(mount?.files)) return acc + mount.files.length;
      return acc;
    }, 0);
    mountCount.textContent = String(mounts.length);
    mountFiles.textContent = String(totalFiles);
  } catch {
    // ignore network errors
  }
}

pollMounts();
setInterval(pollMounts, 8000);
