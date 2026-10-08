import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { BUSINESS, MENU } from "./menu";

const OrderInput = z.object({
  mode: z.enum(["collection", "delivery"]),
  payment: z.enum(["Cash", "Card on collection"]),
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
        address: data.mode === "delivery" ? data.address : null,
        payment: data.payment,
        items,
        subtotal,
        delivery_fee: fee,
        total: subtotal + fee,
        eta_minutes: eta,
      })
      .select("id, order_number, eta_minutes")
      .single();
    if (error) {
      console.error(error);
      throw new Error("Could not place your order. Please try again.");
    }
    await context.supabase.from("profiles").update({ full_name: data.name, phone: data.phone, ...(data.address ? { address: data.address } : {}) }).eq("id", context.userId);
    return row;
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
