export type RealtimeEvent = {
    userId: string;
    event: string;
    payload: Record<string, unknown>;
};

/**
 * V1 implementation is Noop (or FCM). Socket.IO later implements this same port.
 * Booking must never import socket.io.
 */
export interface RealtimePort {
    publish(event: RealtimeEvent): Promise<void>;
}
