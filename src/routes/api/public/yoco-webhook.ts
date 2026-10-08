import { createFileRoute } from "@tanstack/react-router";

const b64 = (buf: ArrayBuffer) => btoa(String.fromCharCode(...new Uint8Array(buf)));

async function verify(secret: string, id: string, ts: string, body: string, header: string) {
  const raw = Uint8Array.from(atob(secret.replace(/^whsec_/, "")), (c) => c.charCodeAt(0));
  const key = await crypto.subtle.importKey("raw", raw, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const expected = b64(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${id}.${ts}.${body}`)));
  return header.split(" ").some((part) => {
    const sig = part.split(",")[1] ?? "";
    if (sig.length !== expected.length) return false;
    let diff = 0;
    for (let i = 0; i < sig.length; i++) diff |= sig.charCodeAt(i) ^ expected.charCodeAt(i);
    return diff === 0;
  });
}

export const Route = createFileRoute("/api/public/yoco-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const id = request.headers.get("webhook-id") ?? "";
        const ts = request.headers.get("webhook-timestamp") ?? "";
        const sig = request.headers.get("webhook-signature") ?? "";
        const body = await request.text();
        if (!id || !ts || !sig) return new Response("Missing signature", { status: 401 });
        if (Math.abs(Date.now() / 1000 - Number(ts)) > 300) return new Response("Stale", { status: 401 });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: settings } = await supabaseAdmin.from("payment_settings").select("yoco_webhook_secret").eq("id", 1).maybeSingle();
        if (!settings?.yoco_webhook_secret) return new Response("Not configured", { status: 503 });
        if (!(await verify(settings.yoco_webhook_secret, id, ts, body, sig))) return new Response("Invalid signature", { status: 401 });

        let ev: { type?: string; payload?: { metadata?: { checkoutId?: string; orderId?: string } } };
        try { ev = JSON.parse(body); } catch { return new Response("Bad body", { status: 400 }); }
        const checkoutId = ev.payload?.metadata?.checkoutId;
        if (!checkoutId) return new Response("ok");

        if (ev.type === "payment.succeeded") {
          await supabaseAdmin.from("orders").update({ payment_status: "paid" }).eq("yoco_checkout_id", checkoutId).eq("payment_status", "pending");
        } else if (ev.type === "payment.failed") {
          await supabaseAdmin.from("orders").update({ payment_status: "failed", status: "cancelled" }).eq("yoco_checkout_id", checkoutId).eq("payment_status", "pending");
        }
        return new Response("ok");
      },
    },
  },
});
