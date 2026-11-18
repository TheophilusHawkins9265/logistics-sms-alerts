import { z } from "zod";
import { sendSmsAlerts } from "./infrai-sms.js";

export const shipmentEvent = z.object({
  shipmentId: z.string().min(1),
  status: z.enum(["in_transit", "delivered", "exception"]),
  recipientPhone: z.string().min(7),
  proofOfDelivery: z.string().optional(),
  exceptionReason: z.string().optional(),
});

export type ShipmentEvent = z.infer<typeof shipmentEvent>;

export function alertFor(event: ShipmentEvent) {
  if (event.status !== "exception") return null;
  const reason = event.exceptionReason ?? "review required";
  return {
    phone: event.recipientPhone,
    message: `Shipment ${event.shipmentId} needs attention: ${reason}.`,
  };
}

export async function handleShipmentEvent(body: unknown) {
  const event = shipmentEvent.parse(body);
  const alert = alertFor(event);
  if (!alert) return { state: event.status, notification: "none" };
  const delivery = await sendSmsAlerts([alert]);
  return { state: "exception_notified", notification: delivery };
}
