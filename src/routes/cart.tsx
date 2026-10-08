import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { placeOrder } from "@/lib/orders.functions";
import { CheckCircle2, Minus, Plus } from "lucide-react";
import { useCart } from "@/lib/cart";
import { BUSINESS, MENU, rand } from "@/lib/menu";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your order — Khayelitsha Fish & Chips" },
      { name: "description", content: "Review your cart and check out for collection or delivery." },
      { property: "og:title", content: "Your order — Khayelitsha Fish & Chips" },
      { property: "og:description", content: "Checkout for collection or delivery in Khayelitsha." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { lines, setQty, subtotal, clear } = useCart();
  const { session, ready } = useAuth();
  const place = useServerFn(placeOrder);
  const [mode, setMode] = useState<"collection" | "delivery">("collection");
  const [pay, setPay] = useState("Cash");
  const [form, setForm] = useState({ name: "", phone: "", address: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [placed, setPlaced] = useState<{ id: number; eta: number } | null>(null);

  useEffect(() => {
    if (!session) return;
    supabase.from("profiles").select("full_name, phone, address").eq("id", session.user.id).maybeSingle().then(({ data }) => {
      if (data) setForm((f) => ({ name: f.name || data.full_name || "", phone: f.phone || data.phone || "", address: f.address || data.address || "" }));
    });
  }, [session]);

  const fee = mode === "delivery" ? BUSINESS.deliveryFee : 0;
  const total = subtotal + fee;
  const eta = Math.max(10, ...lines.map((l) => MENU.find((m) => m.id === l.itemId)?.prepMinutes ?? 0)) + lines.length * 2 + (mode === "delivery" ? 20 : 0);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lines.length) return setError("Your cart is empty.");
    if (form.name.trim().length < 2) return setError("Please enter your name.");
    const phone = form.phone.replace(/\s/g, "");
    if (!/^(\+27|0)\d{9}$/.test(phone)) return setError("Please enter a valid South African phone number.");
    if (mode === "delivery" && form.address.trim().length < 5) return setError("Please enter a delivery address.");
    setError("");
    setBusy(true);
    try {
      const row = await place({
        data: {
          mode,
          payment: pay as "Cash" | "Card on collection",
          name: form.name.trim(),
          phone,
          address: mode === "delivery" ? form.address.trim() : undefined,
          lines: lines.map((l) => ({ itemId: l.itemId, qty: l.qty, options: Object.fromEntries(Object.entries(l.options).filter(([, v]) => typeof v === "string")) as Record<string, string> })),
        },
      });
      setPlaced({ id: Number(row.order_number), eta: row.eta_minutes });
      clear();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not place your order.");
    } finally {
      setBusy(false);
    }
  };

  if (placed)
    return (
      <div className="mx-auto max-w-lg px-5 py-20 text-center">
        <CheckCircle2 className="mx-auto size-14 text-primary" />
        <h1 className="mt-4 text-4xl font-semibold">Order #{placed.id} received</h1>
        <p className="mt-3 text-muted-foreground">Estimated ready in about {placed.eta} minutes. We'll notify you when it's on its way.</p>
        <Link to="/menu" className="mt-8 inline-block rounded-full bg-accent px-6 py-3 font-semibold text-accent-foreground">Order more</Link>
      </div>
    );

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 lg:grid-cols-[1.3fr_1fr]">
      <div>
        <h1 className="text-4xl font-semibold">Your order</h1>
        {!lines.length && (
          <p className="mt-6 text-muted-foreground">Your cart is empty. <Link to="/menu" className="text-primary underline">Browse the menu</Link>.</p>
        )}
        <ul className="mt-6 space-y-3">
          {lines.map((l) => {
            const item = MENU.find((m) => m.id === l.itemId)!;
            const opts = Object.entries(l.options).filter(([, v]) => v && v !== "None" && v !== "Regular").map(([, v]) => v);
            return (
              <li key={l.key} className="glass-panel flex items-center gap-4 rounded-2xl p-3">
                <img src={item.image} alt="" className="size-20 rounded-xl object-cover" />
                <div className="flex-1">
                  <p className="font-semibold">{item.name}</p>
                  {opts.length > 0 && <p className="text-xs text-muted-foreground">{opts.join(" · ")}</p>}
                  <p className="mt-1 text-sm text-primary">{rand(item.price * l.qty)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setQty(l.key, l.qty - 1)} className="grid size-8 place-items-center rounded-full bg-muted" aria-label="Decrease"><Minus className="size-4" /></button>
                  <span className="w-5 text-center font-medium">{l.qty}</span>
                  <button onClick={() => setQty(l.key, l.qty + 1)} className="grid size-8 place-items-center rounded-full bg-muted" aria-label="Increase"><Plus className="size-4" /></button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <form onSubmit={submit} className="glass-panel h-fit space-y-4 rounded-2xl p-6">
        <h2 className="text-2xl font-semibold">Checkout</h2>
        <Toggle options={["collection", "delivery"]} value={mode} onChange={(v) => setMode(v as typeof mode)} />
        <Field label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
        <Field label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} placeholder="082 123 4567" />
        {mode === "delivery" && <Field label="Delivery address" value={form.address} onChange={(v) => setForm({ ...form, address: v })} />}
        <div>
          <p className="mb-2 text-sm font-medium">Payment</p>
          <Toggle options={["Cash", "Card on collection"]} value={pay} onChange={setPay} />
          <p className="mt-2 text-xs text-muted-foreground">Online card payment coming soon. We never ask for card details in chat.</p>
        </div>
        <div className="space-y-1 border-t pt-4 text-sm">
          <Row k="Subtotal" v={rand(subtotal)} />
          <Row k="Delivery" v={rand(fee)} />
          <Row k="Estimated time" v={lines.length ? `~${eta} min` : "—"} />
          <div className="flex justify-between pt-2 font-display text-xl font-semibold"><span>Total</span><span>{rand(total)}</span></div>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <button className="w-full rounded-full bg-accent py-3 font-semibold text-accent-foreground shadow-warm hover:bg-accent/90">Place order</button>
      </form>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="block text-sm font-medium">
      {label}
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} maxLength={200} className="mt-1 w-full rounded-lg border bg-card px-3 py-2 text-sm" />
    </label>
  );
}

function Toggle({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex gap-2 rounded-full bg-muted p-1">
      {options.map((o) => (
        <button type="button" key={o} onClick={() => onChange(o)} className={`flex-1 rounded-full py-2 text-sm font-medium capitalize ${o === value ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>{o}</button>
      ))}
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return <div className="flex justify-between text-muted-foreground"><span>{k}</span><span>{v}</span></div>;
}
