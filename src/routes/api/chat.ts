import { createFileRoute } from "@tanstack/react-router";
import { BUSINESS, MENU, PROMOS, FAQ } from "@/lib/menu";

const SYSTEM = () => `ROLE: You are "Fish & Chips AI", the friendly customer assistant for ${BUSINESS.name} in Khayelitsha, Cape Town.
CONTEXT:
- Address: ${BUSINESS.address}. Phone: ${BUSINESS.phone}.
- Hours: ${BUSINESS.hours.map((h) => `${h.day} ${h.time}`).join("; ")}.
- Delivery fee: R${BUSINESS.deliveryFee}. Collection is free.
- Menu (prices in ZAR): ${MENU.map((m) => `${m.name} (${m.category}) R${m.price}`).join("; ")}.
- Promotions: ${PROMOS.map((p) => `${p.title}: ${p.headline} ${p.price} — ${p.body}`).join("; ")}.
- FAQ: ${FAQ.map((f) => `${f.q} ${f.a}`).join(" ")}
TASK: Help customers choose food, answer questions about menu, prices, hours, delivery and promotions, and suggest meals within a budget.
CONSTRAINTS: Only use the information above; never invent items, prices or policies. If unsure, say so and suggest calling or WhatsApp. Do not take payments or ask for card details or other sensitive personal data. Do not give medical/allergy guarantees — advise customers with allergies to confirm with staff. Keep answers short, warm and local (a little isiXhosa greeting is fine). Customers place orders themselves on the Menu page.
OUTPUT FORMAT: Short markdown, bullets for options, include prices.`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key = process.env['LOVABLE_API_KEY'];
        if (!key) return new Response("AI is not configured.", { status: 500 });
        let body: { messages?: { role: string; content: string }[] };
        try { body = await request.json(); } catch { return new Response("Bad request", { status: 400 }); }
        const messages = (body.messages ?? [])
          .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
          .slice(-20)
          .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }));
        if (!messages.length) return new Response("No messages", { status: 400 });

        const upstream = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
          method: "POST",
          signal: request.signal,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${key}`,
            "Lovable-API-Key": key,
            "X-Lovable-AIG-SDK": "fetch",
          },
          body: JSON.stringify({
            model: "openai/gpt-6-astra",
            instructions: SYSTEM(),
            input: messages,
            stream: true,
            store: false,
            reasoning: { effort: "low" },
          }),
        });

        if (!upstream.ok || !upstream.body) {
          const status = upstream.status;
          const msg =
            status === 429 ? "We're busy right now — please try again in a moment."
            : status === 402 ? "AI credits have run out. Please contact the restaurant."
            : "The assistant is unavailable right now.";
          console.error("AI gateway error", status, await upstream.text().catch(() => ""));
          return new Response(msg, { status });
        }

        const reader = upstream.body.getReader();
        const dec = new TextDecoder();
        const enc = new TextEncoder();
        const stream = new ReadableStream({
          async start(controller) {
            let buf = "";
            try {
              for (;;) {
                const { done, value } = await reader.read();
                if (done) break;
                buf += dec.decode(value, { stream: true });
                const lines = buf.split("\n");
                buf = lines.pop() ?? "";
                for (const line of lines) {
                  if (!line.startsWith("data:")) continue;
                  const data = line.slice(5).trim();
                  if (!data || data === "[DONE]") continue;
                  try {
                    const ev = JSON.parse(data);
                    if (ev.type === "response.output_text.delta" && ev.delta) controller.enqueue(enc.encode(ev.delta));
                  } catch {}
                }
              }
            } catch (e) {
              console.error(e);
            }
            controller.close();
          },
        });
        return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-cache" } });
      },
    },
  },
});
