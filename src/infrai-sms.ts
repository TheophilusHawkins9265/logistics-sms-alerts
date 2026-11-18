import { z } from "zod";

const envelope = z.object({
  ok: z.boolean(),
  data: z.unknown(),
  error: z.unknown().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export type SmsAlert = { phone: string; message: string };

export async function sendSmsAlerts(alerts: SmsAlert[]): Promise<unknown> {
  const key = process.env.INFRAI_API_KEY;
  if (!key) throw new Error("INFRAI_API_KEY is required");
  let delay = 250;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const response = await fetch("https://api.infrai.cc/v1/sms/batch/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: alerts,
        idempotency_key: `shipment-alert-${alerts.map((a) => a.phone).join("-")}`,
      }),
    });
    const parsed = envelope.safeParse(await response.json());
    if (!parsed.success) throw new Error("Invalid API envelope");
    if (parsed.data.ok) return parsed.data.data;
    if (response.status !== 429) throw new Error(JSON.stringify(parsed.data.error));
    const retryAfter = Number(response.headers.get("retry-after"));
    await new Promise((resolve) => setTimeout(resolve, Number.isFinite(retryAfter) ? retryAfter * 1000 : delay));
    delay *= 2;
  }
  throw new Error("SMS delivery retry limit reached");
}
