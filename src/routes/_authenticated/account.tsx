import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useCart } from "@/lib/cart";
import { rand } from "@/lib/menu";
import { STATUS_LABEL, stepsFor, type OrderItem } from "@/lib/order-status";
import { rateOrder } from "@/lib/orders.functions";

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({
    meta: [
      { title: "My orders — Aya's Delicious Fish & Chips" },
      { name: "description", content: "Track your order live and reorder your favourites." },
      { property: "og:title", content: "My orders — Aya's Delicious Fish & Chips" },
      { property: "og:description", content: "Live order tracking and order history." },
    ],
  }),
  component: AccountPage,
});

type Order = Tables<"orders">;

function AccountPage() {
  const { user } = Route.useRouteContext();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const { add } = useCart();

  useEffect(() => {
    const load = () =>
      supabase.from("orders").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(30).then(({ data }) => setOrders(data ?? []));
    load();
    const ch = supabase
      .channel(`my-orders-${user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "orders", filter: `user_id=eq.${user.id}` }, load)
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [user.id]);

  const active = orders?.filter((o) => !["completed", "cancelled"].includes(o.status)) ?? [];
  const past = orders?.filter((o) => ["completed", "cancelled"].includes(o.status)) ?? [];

  const reorder = (o: Order) => {
    (o.items as OrderItem[]).forEach((i) => add(i.itemId, i.options, i.qty));
    toast.success("Added to your cart");
  };

  return (
    <div className="mx-auto max-w-4xl px-5 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-semibold">My orders</h1>
          <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
        </div>
        <button onClick={() => supabase.auth.signOut()} className="rounded-full border px-4 py-2 text-sm hover:bg-muted">Sign out</button>
      </div>

      {orders === null && <p className="mt-8 text-muted-foreground">Loading…</p>}
      {orders?.length === 0 && (
        <p className="mt-8 text-muted-foreground">No orders yet. <Link to="/menu" className="text-primary underline">Order something tasty</Link>.</p>
      )}

      {active.map((o) => <LiveOrder key={o.id} o={o} />)}

      {past.length > 0 && <h2 className="mt-10 text-2xl font-semibold">Past orders</h2>}
      <ul className="mt-4 space-y-3">
        {past.map((o) => (
          <li key={o.id} className="glass-panel rounded-2xl p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-semibold">#{o.order_number} · {new Date(o.created_at).toLocaleDateString("en-ZA")}</p>
              <span className="text-sm text-muted-foreground">{STATUS_LABEL[o.status]} · {rand(Number(o.total))}</span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{(o.items as OrderItem[]).map((i) => `${i.qty}× ${i.name}`).join(", ")}</p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <button onClick={() => reorder(o)} className="rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground">Order again</button>
              {o.status === "completed" && <Rate o={o} />}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function LiveOrder({ o }: { o: Order }) {
  const steps = stepsFor(o.mode);
  const idx = steps.indexOf(o.status);
  return (
    <div className="mt-8 rounded-3xl bg-primary p-6 text-primary-foreground shadow-warm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-display text-2xl font-semibold">Order #{o.order_number}</p>
        <p className="text-sm opacity-90">{o.payment_status === "pending" ? "Waiting for card payment…" : `About ${o.eta_minutes} min · ${o.mode}`}{o.payment_status === "paid" ? " · Paid" : ""}</p>
      </div>
      <ol className="mt-6 grid gap-2" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0,1fr))` }}>
        {steps.map((s, i) => (
          <li key={s} className="text-center text-xs sm:text-sm">
            <div className={`mb-2 h-2 rounded-full ${i <= idx ? "bg-accent" : "bg-primary-foreground/25"}`} />
            <span className={i === idx ? "font-semibold" : "opacity-80"}>{STATUS_LABEL[s]}</span>
          </li>
        ))}
      </ol>
      <p className="mt-4 text-sm opacity-90">{(o.items as OrderItem[]).map((i) => `${i.qty}× ${i.name}`).join(", ")} · {rand(Number(o.total))}</p>
    </div>
  );
}

function Rate({ o }: { o: Order }) {
  const rate = useServerFn(rateOrder);
  const [stars, setStars] = useState(o.rating ?? 0);
  const [text, setText] = useState(o.feedback ?? "");
  const [open, setOpen] = useState(false);
  if (o.rating && !open) return <span className="text-sm text-muted-foreground">You rated {o.rating}★</span>;
  if (!open) return <button onClick={() => setOpen(true)} className="text-sm text-primary underline">Rate this order</button>;
  return (
    <div className="flex w-full flex-wrap items-center gap-2">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} onClick={() => setStars(n)} aria-label={`${n} stars`}>
          <Star className={`size-5 ${n <= stars ? "fill-accent text-accent" : "text-muted-foreground"}`} />
        </button>
      ))}
      <input value={text} onChange={(e) => setText(e.target.value)} maxLength={1000} placeholder="Tell us more (optional)" className="min-w-40 flex-1 rounded-lg border bg-card px-3 py-1.5 text-sm" />
      <button
        disabled={!stars}
        onClick={async () => {
          try {
            await rate({ data: { id: o.id, rating: stars, feedback: text } });
            toast.success("Thanks for your feedback!");
            setOpen(false);
          } catch (e) {
            toast.error(e instanceof Error ? e.message : "Failed");
          }
        }}
        className="rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-accent-foreground disabled:opacity-50"
      >
        Send
      </button>
    </div>
  );
}
