import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useAuth } from "@/lib/auth";
import { CATEGORIES, MENU, rand } from "@/lib/menu";
import type { OrderItem } from "@/lib/order-status";
import { connectYoco, listStaff, setUserRole, yocoStatus } from "@/lib/orders.functions";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Owner dashboard — Ayas Delicious Tacos" },
      { name: "description", content: "Sales, menu availability, staff and AI business tools." },
      { property: "og:title", content: "Owner dashboard — Ayas Delicious Tacos" },
      { property: "og:description", content: "Sales, menu availability, staff and AI business tools." },
    ],
  }),
  component: Admin,
});

type Order = Tables<"orders">;

function Admin() {
  const { isAdmin, ready } = useAuth();
  const [tab, setTab] = useState<"overview" | "menu" | "staff" | "ai" | "payments">("overview");
  if (ready && !isAdmin)
    return <div className="mx-auto max-w-lg px-5 py-20 text-center"><h1 className="text-3xl font-semibold">Owner only</h1><Link to="/" className="mt-6 inline-block text-primary underline">Home</Link></div>;
  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-4xl font-semibold">Owner dashboard</h1>
        <Link to="/kitchen" className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Open kitchen screen</Link>
      </div>
      <div className="mt-6 flex flex-wrap gap-2 rounded-full bg-muted p-1 w-fit">
        {([["overview", "Overview"], ["menu", "Menu"], ["staff", "Staff"], ["ai", "AI tools"], ["payments", "Payments"]] as const).map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className={`rounded-full px-4 py-2 text-sm font-medium ${tab === k ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>{l}</button>
        ))}
      </div>
      <div className="mt-8">
        {tab === "overview" && <Overview />}
        {tab === "menu" && <MenuControl />}
        {tab === "staff" && <Staff />}
        {tab === "ai" && <AiTools />}
        {tab === "payments" && <Payments />}
      </div>
    </div>
  );
}

function Overview() {
  const [orders, setOrders] = useState<Order[]>([]);
  useEffect(() => {
    const since = new Date(Date.now() - 7 * 864e5).toISOString();
    const load = () => supabase.from("orders").select("*").gte("created_at", since).order("created_at", { ascending: false }).then(({ data }) => setOrders(data ?? []));
    load();
    const ch = supabase.channel("admin-orders").on("postgres_changes", { event: "*", schema: "public", table: "orders" }, load).subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, []);

  const stats = useMemo(() => {
    const ok = orders.filter((o) => o.status !== "cancelled");
    const todayStr = new Date().toDateString();
    const today = ok.filter((o) => new Date(o.created_at).toDateString() === todayStr);
    const counts: Record<string, number> = {};
    ok.forEach((o) => (o.items as OrderItem[]).forEach((i) => (counts[i.name] = (counts[i.name] ?? 0) + i.qty)));
    const rated = ok.filter((o) => o.rating);
    return {
      todaySales: today.reduce((s, o) => s + Number(o.total), 0),
      todayCount: today.length,
      weekSales: ok.reduce((s, o) => s + Number(o.total), 0),
      avg: ok.length ? ok.reduce((s, o) => s + Number(o.total), 0) / ok.length : 0,
      rating: rated.length ? rated.reduce((s, o) => s + (o.rating ?? 0), 0) / rated.length : null,
      top: Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5),
      open: orders.filter((o) => !["completed", "cancelled"].includes(o.status)).length,
    };
  }, [orders]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Today's sales" value={rand(stats.todaySales)} sub={`${stats.todayCount} orders`} />
        <Stat label="Last 7 days" value={rand(stats.weekSales)} sub={`avg ${rand(Math.round(stats.avg))} per order`} />
        <Stat label="Open orders" value={String(stats.open)} sub="in the kitchen now" />
        <Stat label="Customer rating" value={stats.rating ? `${stats.rating.toFixed(1)}★` : "—"} sub="from rated orders" />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="glass-panel rounded-2xl p-5">
          <h2 className="text-xl font-semibold">Best sellers (7 days)</h2>
          {stats.top.length === 0 && <p className="mt-3 text-sm text-muted-foreground">No sales yet.</p>}
          <ul className="mt-3 space-y-2">{stats.top.map(([n, c]) => <li key={n} className="flex justify-between text-sm"><span>{n}</span><span className="font-semibold">{c}</span></li>)}</ul>
        </div>
        <div className="glass-panel rounded-2xl p-5">
          <h2 className="text-xl font-semibold">Recent orders</h2>
          <ul className="mt-3 space-y-2">
            {orders.slice(0, 8).map((o) => (
              <li key={o.id} className="flex justify-between text-sm"><span>#{o.order_number} · {o.customer_name}</span><span className="text-muted-foreground">{o.status.replace(/_/g, " ")} · {rand(Number(o.total))}</span></li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="glass-panel rounded-2xl p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-3xl font-semibold">{value}</p>
      <p className="text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}

function MenuControl() {
  const [sold, setSold] = useState<Set<string>>(new Set());
  useEffect(() => {
    supabase.from("menu_availability").select("item_id").eq("sold_out", true).then(({ data }) => setSold(new Set((data ?? []).map((r) => r.item_id))));
  }, []);
  const toggle = async (id: string) => {
    const next = !sold.has(id);
    const { error } = await supabase.from("menu_availability").upsert({ item_id: id, sold_out: next, updated_at: new Date().toISOString() });
    if (error) {
      toast.error("Could not update");
      return;
    }
    const s = new Set(sold);
    if (next) s.add(id);
    else s.delete(id);
    setSold(s);
  };
  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">Mark items sold out — customers see it on the menu straight away.</p>
      {CATEGORIES.map((c) => (
        <div key={c}>
          <h2 className="mb-2 text-xl font-semibold">{c}</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {MENU.filter((m) => m.category === c).map((m) => (
              <div key={m.id} className="glass-panel flex items-center justify-between rounded-xl p-3">
                <span>{m.name} <span className="text-sm text-muted-foreground">{rand(m.price)}</span></span>
                <button onClick={() => toggle(m.id)} className={`rounded-full px-3 py-1 text-xs font-semibold ${sold.has(m.id) ? "bg-destructive text-destructive-foreground" : "bg-primary/15 text-primary"}`}>
                  {sold.has(m.id) ? "Sold out" : "Available"}
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function Staff() {
  const list = useServerFn(listStaff);
  const setRole = useServerFn(setUserRole);
  const [staff, setStaff] = useState<{ email: string; role: string }[]>([]);
  const [email, setEmail] = useState("");
  const [role, setR] = useState<"staff" | "admin">("staff");
  const load = () => list().then(setStaff).catch(() => {});
  useEffect(() => {
    load();
  }, []);
  const change = async (e: string, r: "staff" | "admin", grant: boolean) => {
    try {
      await setRole({ data: { email: e, role: r, grant } });
      toast.success(grant ? "Access given" : "Access removed");
      setEmail("");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    }
  };
  return (
    <div className="max-w-2xl space-y-6">
      <form onSubmit={(e) => { e.preventDefault(); change(email.trim(), role, true); }} className="glass-panel flex flex-wrap gap-2 rounded-2xl p-4">
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Their account email" className="min-w-48 flex-1 rounded-lg border bg-card px-3 py-2 text-sm" />
        <select value={role} onChange={(e) => setR(e.target.value as "staff" | "admin")} className="rounded-lg border bg-card px-3 py-2 text-sm">
          <option value="staff">Kitchen staff</option>
          <option value="admin">Owner / manager</option>
        </select>
        <button className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground">Give access</button>
      </form>
      <p className="text-xs text-muted-foreground">They must create an account on the sign-in page first.</p>
      <ul className="space-y-2">
        {staff.map((s) => (
          <li key={s.email + s.role} className="glass-panel flex items-center justify-between rounded-xl p-3 text-sm">
            <span>{s.email} <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs">{s.role === "admin" ? "Owner" : "Staff"}</span></span>
            <button onClick={() => change(s.email, s.role as "staff" | "admin", false)} className="text-xs text-destructive underline">Remove</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

const AI_TOOLS = [
  { id: "planner", title: "Daily planner", desc: "Prep quantities and staffing for today.", placeholder: "e.g. It's raining today and there's a soccer match tonight" },
  { id: "feedback", title: "Feedback analyst", desc: "What customers love and complain about.", placeholder: "Anything specific to look for? (optional)" },
  { id: "promo", title: "Promotion ideas", desc: "Specials to lift sales this week.", placeholder: "e.g. Tuesdays are slow; budget is tight" },
  { id: "message", title: "Message writer", desc: "WhatsApp/SMS messages for customers.", placeholder: "e.g. Tell customers about Friday's 2-for-1 tacos" },
] as const;

function AiTools() {
  const [tool, setTool] = useState<string>("planner");
  const [note, setNote] = useState("");
  const [out, setOut] = useState("");
  const [busy, setBusy] = useState(false);
  const t = AI_TOOLS.find((x) => x.id === tool)!;

  const run = async () => {
    setBusy(true);
    setOut("");
    try {
      const { data } = await supabase.auth.getSession();
      const res = await fetch("/api/admin-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${data.session?.access_token ?? ""}` },
        body: JSON.stringify({ tool, note }),
      });
      if (!res.ok || !res.body) {
        setOut(`**${await res.text()}**`);
        return;
      }
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += dec.decode(value, { stream: true });
        setOut(acc);
      }
    } catch {
      setOut("**Something went wrong. Please try again.**");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <div className="space-y-2">
        {AI_TOOLS.map((x) => (
          <button key={x.id} onClick={() => { setTool(x.id); setOut(""); }} className={`w-full rounded-2xl p-4 text-left ${tool === x.id ? "bg-primary text-primary-foreground" : "glass-panel"}`}>
            <p className="font-semibold">{x.title}</p>
            <p className="text-xs opacity-80">{x.desc}</p>
          </button>
        ))}
      </div>
      <div className="glass-panel rounded-2xl p-5">
        <h2 className="text-2xl font-semibold">{t.title}</h2>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} maxLength={1000} rows={3} placeholder={t.placeholder} className="mt-3 w-full rounded-lg border bg-card px-3 py-2 text-sm" />
        <button disabled={busy} onClick={run} className="mt-3 rounded-full bg-accent px-5 py-2 font-semibold text-accent-foreground disabled:opacity-60">{busy ? "Thinking…" : "Generate"}</button>
        {out && <div className="prose prose-sm mt-6 max-w-none text-foreground"><ReactMarkdown>{out}</ReactMarkdown></div>}
      </div>
    </div>
  );
}

function Payments() {
  const status = useServerFn(yocoStatus);
  const connect = useServerFn(connectYoco);
  const [st, setSt] = useState<{ hasKey: boolean; connected: boolean; mode: string | null } | null>(null);
  const [busy, setBusy] = useState(false);
  const load = () => status().then(setSt).catch(() => {});
  useEffect(() => {
    load();
  }, []);
  return (
    <div className="glass-panel max-w-xl space-y-4 rounded-2xl p-6">
      <h2 className="text-2xl font-semibold">Online card payments (Yoco)</h2>
      {!st ? <p className="text-sm text-muted-foreground">Checking…</p> : (
        <ul className="space-y-1 text-sm">
          <li>{st.hasKey ? "✅" : "⬜"} Yoco secret key saved</li>
          <li>{st.connected ? "✅" : "⬜"} Payment confirmations connected{st.mode ? ` (${st.mode} mode)` : ""}</li>
        </ul>
      )}
      <p className="text-sm text-muted-foreground">Card orders only reach the kitchen once Yoco confirms payment. Press connect after saving your key, and again after publishing your site.</p>
      <button
        disabled={busy || !st?.hasKey}
        onClick={async () => {
          setBusy(true);
          try {
            const r = await connect();
            toast.success(`Connected to Yoco (${r.mode} mode)`);
            load();
          } catch (e) {
            toast.error(e instanceof Error ? e.message : "Failed");
          } finally {
            setBusy(false);
          }
        }}
        className="rounded-full bg-accent px-5 py-2 font-semibold text-accent-foreground disabled:opacity-50"
      >
        {busy ? "Connecting…" : st?.connected ? "Reconnect Yoco" : "Connect Yoco"}
      </button>
    </div>
  );
}
