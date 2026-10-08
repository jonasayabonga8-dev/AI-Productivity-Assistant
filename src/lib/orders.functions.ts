import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { BUSINESS, MENU } from "./menu";

const OrderInput = z.object({
  mode: z.enum(["collection", "delivery"]),
  payment: z.enum(["Cash", "Card on collection", "Card online"]),
  name: z.string().trim().min(2).max(100),
  phone: z.string().trim().regex(/^(\+27|0)\d{9}$/),
  address: z.string().trim().max(300).optional(),
  lines: z
    .array(
      z.object({
        itemId: z.string().max(60),
        qty: z.number().int().min(1).max(20),
        options: z.record(z.string(), z.string().max(200)).default({}),
      }),
    )
    .min(1)
    .max(40),
});

export const placeOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => OrderInput.parse(d))
  .handler(async ({ data, context }) => {
    if (data.mode === "delivery" && (!data.address || data.address.length < 5)) throw new Error("Please enter a delivery address.");

    const { data: soldOut } = await context.supabase.from("menu_availability").select("item_id").eq("sold_out", true);
    const soldIds = new Set((soldOut ?? []).map((r) => r.item_id));

    const items = data.lines.map((l) => {
      const m = MENU.find((x) => x.id === l.itemId);
      if (!m) throw new Error("An item in your cart is no longer on the menu.");
      if (soldIds.has(m.id)) throw new Error(`${m.name} is sold out right now.`);
      return { itemId: m.id, name: m.name, price: m.price, qty: l.qty, options: l.options };
    });
    const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
    const fee = data.mode === "delivery" ? BUSINESS.deliveryFee : 0;
    const eta =
      Math.max(10, ...items.map((i) => MENU.find((m) => m.id === i.itemId)?.prepMinutes ?? 0)) +
      items.length * 2 +
      (data.mode === "delivery" ? 20 : 0);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("orders")
      .insert({
        user_id: context.userId,
        customer_name: data.name,
        phone: data.phone,
        mode: data.mode,
        address: data.mode === "delivery" ? (data.address ?? null) : null,
        payment: data.payment,
        items,
        subtotal,
        delivery_fee: fee,
        total: subtotal + fee,
        eta_minutes: eta,
        payment_status: data.payment === "Card online" ? "pending" : "pay_on_collection",
      })
      .select("id, order_number, eta_minutes")
      .single();
    if (error) {
      console.error(error);
      throw new Error("Could not place your order. Please try again.");
    }
    let redirectUrl: string | null = null;
    if (data.payment === "Card online") {
      const yocoKey = process.env["YOCO_SECRET_KEY"];
      if (!yocoKey) {
        await supabaseAdmin.from("orders").update({ status: "cancelled", payment_status: "failed" }).eq("id", row.id);
        throw new Error("Online card payment isn't set up yet. Please choose cash or card on collection.");
      }
      const origin = new URL(getRequest().url).origin;
      const res = await fetch("https://payments.yoco.com/api/checkouts", {
        method: "POST",
        headers: { Authorization: `Bearer ${yocoKey}`, "Content-Type": "application/json", "Idempotency-Key": row.id },
        body: JSON.stringify({
          amount: Math.round((subtotal + fee) * 100),
          currency: "ZAR",
          successUrl: `${origin}/account?payment=success`,
          cancelUrl: `${origin}/cart?payment=cancelled`,
          failureUrl: `${origin}/cart?payment=failed`,
          metadata: { orderId: row.id, orderNumber: String(row.order_number) },
        }),
      });
      const json = (await res.json().catch(() => ({}))) as { id?: string; redirectUrl?: string };
      if (!res.ok || !json.id || !json.redirectUrl) {
        console.error("Yoco checkout failed", res.status, json);
        await supabaseAdmin.from("orders").update({ status: "cancelled", payment_status: "failed" }).eq("id", row.id);
        throw new Error("Card payment couldn't start. Please try again or pay on collection.");
      }
      await supabaseAdmin.from("orders").update({ yoco_checkout_id: json.id }).eq("id", row.id);
      redirectUrl = json.redirectUrl;
    }
    await context.supabase.from("profiles").update({ full_name: data.name, phone: data.phone, ...(data.address ? { address: data.address } : {}) }).eq("id", context.userId);
    return { ...row, redirectUrl };
  });

export const connectYoco = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) throw new Error("Only the owner can do this.");
    const yocoKey = process.env["YOCO_SECRET_KEY"];
    if (!yocoKey) throw new Error("Add your Yoco secret key first.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const origin = new URL(getRequest().url).origin;
    const res = await fetch("https://payments.yoco.com/api/webhooks", {
      method: "POST",
      headers: { Authorization: `Bearer ${yocoKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ name: `kfc-${Date.now()}`, url: `${origin}/api/public/yoco-webhook` }),
    });
    const json = (await res.json().catch(() => ({}))) as { id?: string; secret?: string; mode?: string };
    if (!res.ok || !json.secret) {
      console.error("Yoco webhook register failed", res.status, json);
      throw new Error("Yoco didn't accept the connection. Check your secret key.");
    }
    await supabaseAdmin.from("payment_settings").upsert({ id: 1, yoco_webhook_id: json.id ?? null, yoco_webhook_secret: json.secret, yoco_mode: json.mode ?? null, updated_at: new Date().toISOString() });
    return { mode: json.mode ?? "unknown", url: `${origin}/api/public/yoco-webhook` };
  });

export const yocoStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) throw new Error("Forbidden");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin.from("payment_settings").select("yoco_mode, updated_at, yoco_webhook_secret").eq("id", 1).maybeSingle();
    return { hasKey: !!process.env["YOCO_SECRET_KEY"], connected: !!data?.yoco_webhook_secret, mode: data?.yoco_mode ?? null };
  });

export const rateOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid(), rating: z.number().int().min(1).max(5), feedback: z.string().max(1000) }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("orders")
      .update({ rating: data.rating, feedback: data.feedback || null })
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw new Error("Could not save your rating.");
    return { ok: true };
  });

export const setUserRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ email: z.string().email().max(255), role: z.enum(["staff", "admin"]), grant: z.boolean() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) throw new Error("Only the owner can change staff.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: list } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
    const user = list?.users.find((u) => u.email?.toLowerCase() === data.email.toLowerCase());
    if (!user) throw new Error("No account with that email. Ask them to sign up first.");
    if (!data.grant && user.id === context.userId && data.role === "admin") throw new Error("You can't remove your own owner access.");
    const q = data.grant
      ? supabaseAdmin.from("user_roles").upsert({ user_id: user.id, role: data.role }, { onConflict: "user_id,role" })
      : supabaseAdmin.from("user_roles").delete().eq("user_id", user.id).eq("role", data.role);
    const { error } = await q;
    if (error) throw new Error("Could not update the role.");
    return { ok: true };
  });

export const listStaff = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) throw new Error("Forbidden");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: roles } = await supabaseAdmin.from("user_roles").select("user_id, role").in("role", ["admin", "staff"]);
    const { data: list } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
    return (roles ?? []).map((r) => ({ role: r.role, email: list?.users.find((u) => u.id === r.user_id)?.email ?? "unknown" }));
  });
