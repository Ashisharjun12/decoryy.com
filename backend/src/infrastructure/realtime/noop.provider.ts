import type { RealtimeEvent, RealtimePort } from "@/infrastructure/realtime/realtime.port.js";

export class NoopRealtimeProvider implements RealtimePort {
    async publish(_event: RealtimeEvent): Promise<void> {
        return;
    }
}
