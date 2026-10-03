export function logCollectFlow(event: string, payload: Record<string, unknown>) {
  if (!__DEV__) return;
  console.log(`[collect-flow] ${event}`, payload);
}
