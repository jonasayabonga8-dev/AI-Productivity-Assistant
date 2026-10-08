import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useAuth } from "@/lib/auth";
import { STATUS_LABEL, nextStatus, type OrderItem } from "@/lib/order-status";

export const Route = createFileRoute("/_authenticated/kitchen")({
  head: () => ({
    meta: [
      { title: "Kitchen screen — Khayelitsha Fish & Chips" },
      { name: "description", content: "Live order queue for kitchen staff." },
      { property: "og:title", content: "Kitchen screen — Khayelitsha Fish & Chips" },
      { property: "og:description", content: "Live order queue for kitchen staff." },
    ],
  }),
  component: Kitchen,
});

type Order = Tables<"orders">;

function Kitchen() {
  const { isStaff, ready } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [, tick] = useState(0);
  const seen = useRef<Set<string> | null>(null);

  useEffect(() => {
    if (!isStaff) return;
    const load = async () => {
      const { data } = await supabase.from("orders").select("*").not("status", "in", "(completed,cancelled)").order("created_at");
      const list = data ?? [];
      if (seen.current) {
        const fresh = list.filter((o) => !seen.current!.has(o.id));
        if (fresh.length) toast.success(`New order #${fresh.map((f) => f.order_number).join(", #")}`);
      }
      seen.current = new Set(list.map((o) => o.id));
      setOrders(list);
    };
    load();
    const ch = supabase.channel("kitchen").on("postgres_changes", { event: "*", schema: "public", table: "orders" }, load).subscribe();
    const t = setInterval(() => tick((n) => n + 1), 30000);
    return () => {
      supabase.removeChannel(ch);
      clearInterval(t);
    };
  }, [isStaff]);

  if (ready && !isStaff)
    return <div className="mx-auto max-w-lg px-5 py-20 text-center"><h1 className="text-3xl font-semibold">Staff only</h1><p className="mt-2 text-muted-foreground">Ask the owner to give your account staff access.</p><Link to="/" className="mt-6 inline-block text-primary underline">Home</Link></div>;

  const update = async (o: Order, status: Order["status"]) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", o.id);
    if (error) toast.error("Could not update order");
  };

  const cols: { key: Order["status"][]; title: string }[] = [
    { key: ["received"], title: "New" },
    { key: ["preparing"], title: "Frying" },
    { key: ["ready", "out_for_delivery"], title: "Ready / on the way" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-5 py-8">
      <div className="flex items-end justify-between">
        <h1 className="text-4xl font-semibold">Kitchen</h1>
        <p className="text-sm text-muted-foreground">{orders.length} open orders · updates live</p>
      </div>
      <div className="mt-6 grid gap-5 md:grid-cols-3">
        {cols.map((c) => (
          <section key={c.title} className="rounded-3xl bg-muted/60 p-4">
            <h2 className="mb-3 font-display text-xl font-semibold">{c.title} <span className="text-muted-foreground">({orders.filter((o) => c.key.includes(o.status)).length})</span></h2>
            <div className="space-y-3">
              {orders.filter((o) => c.key.includes(o.status)).map((o) => {
                const mins = Math.floor((Date.now() - new Date(o.created_at).getTime()) / 60000);
                const late = mins > o.eta_minutes;
                const nxt = nextStatus(o.status, o.mode) as Order["status"] | null;
                return (
                  <article key={o.id} className={`rounded-2xl border-2 bg-card p-4 ${late ? "border-destructive" : "border-transparent"}`}>
                    <div className="flex items-center justify-between">
                      <p className="font-display text-2xl font-semibold">#{o.order_number}</p>
                      <span className={`text-sm font-medium ${late ? "text-destructive" : "text-muted-foreground"}`}>{mins} min</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{o.customer_name} · {o.mode === "delivery" ? "Delivery" : "Collection"} · {o.payment}</p>
                    <ul className="mt-3 space-y-1">
                      {(o.items as OrderItem[]).map((i, n) => {
                        const opts = Object.values(i.options ?? {}).filter((v) => v && v !== "None" && v !== "Regular");
                        return <li key={n}><span className="font-semibold">{i.qty}×</span> {i.name}{opts.length > 0 && <span className="block text-xs text-accent">{opts.join(" · ")}</span>}</li>;
                      })}
                    </ul>
                    {o.address && <p className="mt-2 text-xs text-muted-foreground">📍 {o.address}</p>}
                    <div className="mt-4 flex gap-2">
                      {nxt && <button onClick={() => update(o, nxt)} className="flex-1 rounded-full bg-primary py-2 text-sm font-semibold text-primary-foreground">Mark {STATUS_LABEL[nxt].toLowerCase()}</button>}
                      <button onClick={() => update(o, "cancelled")} className="rounded-full border px-3 py-2 text-xs text-muted-foreground">Cancel</button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
