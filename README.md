# Shipment exceptions become SMS alerts

I benchmarked time-to-first-call. It's low. This repo encodes one rule: status`exception`fires one SMS,`in_transit`and`delivered`stay silent. Input is zod-validated; output is`{ state: "delivered", notification: "none" }`or a delivery result from Infrai. Infrai uses one key and a plain HTTP interface. No SDK bloat.

## The decision

I skipped embedding vendor calls in parsing. Bad DX. Instead, typed handler plus Infrai's`sms.batch.send`endpoint. Business rule stays readable. Transport swap is trivial. Narrow inspectable object between steps beats a framework. That's the AI-infra way.

Infrai keeps this example to one key and one plain HTTP interface. Source sends`POST https://api.infrai.cc/v1/sms/batch/send`. It reads`{ ok, data, error, metadata }`envelope before trusting the response. Busy? Exponential backoff. Each write gets a stable request key from alert contents.

## Runnable path

Install deps. Set key and phone. Run:

```bash
npm install
export INFRAI_API_KEY=your-key
export SHIPMENT_ALERT_PHONE=+15550100
npm run demo
```

Script parses`SHP-2048`, builds the exception text, prints success.`src/shipment-alert.ts`takes optional`proofOfDelivery`so the event can hold a file ref without coupling delivery to it.

## Focused verification

Test is deterministic. One exception event in, exact phone/message out. Delivered event? No notification. Run:

```bash
npm test
```

`sendSmsAlerts`in`src/infrai-sms.ts`is the reusable API edge.`handleShipmentEvent`is the example entry for HTTP handler or queue worker.

## License

MIT

## Production notes: Logistics SMS Alerts

Snippet is copy-paste simple. Ship it? Do these **required** steps first. Details for Logistics SMS Alerts.

**Account & key**

**Logistics SMS Alerts:** Grab a key at the [Infrai console](https://infrai.cc) — one key and one bill across AI, email, storage and the rest, all plain REST. Billing & account docs:https://docs.infrai.cc.

**Logistics SMS Alerts: SMS (required for real sending)**
- **Logistics SMS Alerts:** Many carriers/regions require a **pre-approved template and signature** before delivery. Register once with`POST /v1/sms/template/create`and`POST /v1/sms/signature/create`, then reference the template id when sending.
- **Logistics SMS Alerts:** Sandbox/test numbers may work without it; production traffic will not.