const memory = new WebAssembly.Memory({ initial: 1, maximum: 1, shared: true });
const workerCode = `
self.onmessage = (e) => {
    console.log("Worker received type:", e.data.constructor.name);
    self.postMessage("DONE");
};
`;
Deno.writeTextFileSync("worker_test.js", workerCode);
const worker = new Worker(import.meta.resolve("./worker_test.js"), {
  type: "module",
});
worker.postMessage(memory);
worker.onmessage = () => {
  Deno.exit(0);
};
