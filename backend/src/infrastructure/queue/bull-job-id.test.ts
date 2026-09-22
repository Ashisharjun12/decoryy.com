import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildBullJobId, isBullMqCompatibleJobId } from "@/infrastructure/queue/bull-job-id.js";

describe("buildBullJobId", () => {
    it("produces hyphen ids without colons", () => {
        const orderId = "8f63319f-5f02-4621-bde6-a3ca500a63e4";
        const id = buildBullJobId("dispatch", "expand", orderId, 1);
        assert.equal(id.includes(":"), false);
        assert.ok(id.startsWith("dispatch-expand-"));
        assert.ok(isBullMqCompatibleJobId(id));
    });

    it("rejects legacy invalid expand-style colon ids", () => {
        const orderId = "8f63319f-5f02-4621-bde6-a3ca500a63e4";
        const legacy = `dispatch:expand:${orderId}:1`;
        assert.equal(isBullMqCompatibleJobId(legacy), false);
    });

    it("allows legacy 3-segment colon ids", () => {
        const legacy = "dispatch:start:8f63319f-5f02-4621-bde6-a3ca500a63e4";
        assert.equal(isBullMqCompatibleJobId(legacy), true);
    });
});
