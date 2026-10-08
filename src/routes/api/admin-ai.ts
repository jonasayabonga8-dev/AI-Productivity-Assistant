import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { BUSINESS, MENU, PROMOS } from "@/lib/menu";

const TOOLS: Record<string, string> = {
  planner: "TASK: Write today's prep plan: estimated hake portions, potato/chips quantity, chicken pieces, staffing for lunch and evening rush, and 3 practical tips. Base it on the recent order data. Be specific with numbers and state assumptions.",
  feedback: "TASK: Analyse the customer ratings and feedback. Give: overall sentiment, top 3 things customers love, top 3 complaints, and 3 concrete fixes. If there is little feedback, say so.",
  promo: "TASK: Suggest 3 promotions for this week that would lift sales, based on best/worst sellers and quiet times. For each: name, offer, price in ZAR, best day/time, and why.",
  message: "TASK: Write ready-to-send WhatsApp/SMS messages for customers (under 300 characters each, warm local tone, a little isiXhosa is fine). Write 3 variations based on the owner's request.",
};

export const Route = createFileRoute("/api/admin-ai")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const token = request.headers.get("authorization")?.replace(/^Bearer /, "");
        const url = process.env["SUPABASE_URL"];
        const pk = process.env["SUPABASE_PUBLISHABLE_KEY"];
        const key = process.env["LOVABLE_API_KEY"];
        if (!token || !url || !pk) return new Response("Unauthorized", { status: 401 });
        if (!key) return new Response("AI is not configured.", { status: 500 });

        const sb = createClient<Database>(url, pk, {
          auth: { persistSession: false, autoRefreshToken: false },
          global: {
            fetch: (input, init) => {
              const h = new Headers(init?.headers);
              h.set("apikey", pk);
              h.set("Authorization", `Bearer ${token}`);
              return fetch(input, { ...init, headers: h });
            },
          },
        });
        const { data: u } = await sb.auth.getUser(token);
        if (!u.user) return new Response("Unauthorized", { status: 401 });
        const { data: isAdmin } = await sb.rpc("has_role", { _user_id: u.user.id, _role: "admin" });
        if (!isAdmin) return new Response("Only the owner can use these tools.", { status: 403 });

        let body: { tool?: string; note?: string };
        try { body = await request.json(); } catch { return new Response("Bad request", { status: 400 }); }
        const task = TOOLS[body.tool ?? ""];
        if (!task) return new Response("Unknown tool", { status: 400 });
        const note = (body.note ?? "").slice(0, 1000);

        const since = new Date(Date.now() - 14 * 864e5).toISOString();
        const { data: orders } = await sb.from("orders").select("created_at, items, total, mode, status, rating, feedback").gte("created_at", since).limit(1000);
        const counts: Record<string, number> = {};
        const byHour: Record<number, number> = {};
        const byDay: Record<string, number> = {};
        let revenue = 0;
        for (const o of orders ?? []) {
          if (o.status === "cancelled") continue;
          revenue += Number(o.total);
          const d = new Date(o.created_at);
          const h = (d.getUTCHours() + 2) % 24;
          byHour[h] = (byHour[h] ?? 0) + 1;
          const day = d.toLocaleDateString("en-ZA", { weekday: "short", timeZone: "Africa/Johannesburg" });
          byDay[day] = (byDay[day] ?? 0) + 1;
          for (const i of (o.items as { name: string; qty: number }[]) ?? []) counts[i.name] = (counts[i.name] ?? 0) + i.qty;
        }
        const feedback = (orders ?? []).filter((o) => o.rating).map((o) => `${o.rating}★ ${o.feedback ?? ""}`).slice(0, 80);
        const today = new Date().toLocaleDateString("en-ZA", { weekday: "long", day: "numeric", month: "long", timeZone: "Africa/Johannesburg" });

        const instructions = `ROLE: You are the business assistant for the owner of ${BUSINESS.name}, Khayelitsha, Cape Town.
CONTEXT: Today is ${today}. Hours: ${BUSINESS.hours.map((h) => `${h.day} ${h.time}`).join("; ")}.
Menu: ${MENU.map((m) => `${m.name} R${m.price}`).join("; ")}. Current promos: ${PROMOS.map((p) => `${p.title} ${p.price}`).join("; ")}.
Last 14 days: ${orders?.length ?? 0} orders, revenue R${revenue.toFixed(0)}. Items sold: ${JSON.stringify(counts)}. Orders by hour (SAST): ${JSON.stringify(byHour)}. Orders by weekday: ${JSON.stringify(byDay)}.
Customer feedback: ${feedback.length ? feedback.join(" | ") : "none yet"}.
${task}
CONSTRAINTS: Use only this data; when data is thin, say so and give sensible starting estimates. Never invent sales figures.
OUTPUT FORMAT: Short markdown with headings and bullets.`;

        const upstream = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
          method: "POST",
          signal: request.signal,
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}`, "Lovable-API-Key": key, "X-Lovable-AIG-SDK": "fetch" },
          body: JSON.stringify({
            model: "openai/gpt-6-astra",
            instructions,
            input: [{ role: "user", content: note || "Go ahead." }],
            stream: true,
            store: false,
            reasoning: { effort: "low" },
          }),
        });
        if (!upstream.ok || !upstream.body) {
          const s = upstream.status;
          console.error("AI gateway error", s, await upstream.text().catch(() => ""));
          const msg = s === 429 ? "Too many requests — try again in a minute." : s === 402 ? "AI credits have run out. Add credits in your workspace settings." : "The AI tool is unavailable right now.";
          return new Response(msg, { status: s });
        }
        const reader = upstream.body.getReader();
        const dec = new TextDecoder();
        const enc = new TextEncoder();
        const stream = new ReadableStream({
          async start(c) {
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
                  const d = line.slice(5).trim();
                  if (!d || d === "[DONE]") continue;
                  try {
                    const ev = JSON.parse(d);
                    if (ev.type === "response.output_text.delta" && ev.delta) c.enqueue(enc.encode(ev.delta));
                  } catch {}
                }
              }
            } catch (e) {
              console.error(e);
            }
            c.close();
          },
        });
        return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } });
      },
    },
  },
});
