
self.onmessage = (e) => {
    console.log("Worker received type:", e.data.constructor.name);
    self.postMessage("DONE");
};
