export const MYCELIUM_VECTOR = (t: any) => (m: any) => ({ cohere: t?.cohere ?? 0, remember: t?.remember ?? 0, flow: t?.flow ?? 0, tension: m?.tension ?? 0 });
