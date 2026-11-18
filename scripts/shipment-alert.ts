import { handleShipmentEvent } from "../src/shipment-alert.js";

const phone = process.env.SHIPMENT_ALERT_PHONE;
if (!phone) throw new Error("SHIPMENT_ALERT_PHONE is required");

const result = await handleShipmentEvent({
  shipmentId: "SHP-2048",
  status: "exception",
  recipientPhone: phone,
  exceptionReason: "address requires confirmation",
});
console.log(JSON.stringify(result, null, 2));
