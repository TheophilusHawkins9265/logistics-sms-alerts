import assert from "node:assert/strict";
import test from "node:test";
import { alertFor } from "../src/shipment-alert.js";

test("exception events become one concrete customer alert", () => {
  assert.deepEqual(alertFor({
    shipmentId: "SHP-2048",
    status: "exception",
    recipientPhone: "+15550100",
    exceptionReason: "address requires confirmation",
  }), {
    phone: "+15550100",
    message: "Shipment SHP-2048 needs attention: address requires confirmation.",
  });
  assert.equal(alertFor({ shipmentId: "SHP-2048", status: "delivered", recipientPhone: "+15550100" }), null);
});
