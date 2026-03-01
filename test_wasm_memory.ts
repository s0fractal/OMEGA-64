const mem = new WebAssembly.Memory({ initial: 1, maximum: 1, shared: true });
const workerCode = `
self.onmessage = (e) => {
    const memory = e.data.memory;
    console.log("Worker received memory:", memory instanceof WebAssembly.Memory);
    self.postMessage("done");
};
`;

const blob = new Blob([workerCode], { type: "application/javascript" });
const worker = new Worker(URL.createObjectURL(blob), { type: "module" });

worker.onmessage = () => {
    console.log("Worker finished.");
    Deno.exit(0);
};

worker.postMessage({ memory: mem });
