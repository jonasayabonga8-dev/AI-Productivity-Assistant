import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/lib/auth";
import hero from "@/assets/hero.jpg";

const safeNext = (n?: string) => (n && n.startsWith("/") && !n.startsWith("//") ? n : "/account");

export const Route = createFileRoute("/auth")({
  validateSearch: z.object({ next: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Sign in — Khayelitsha Fish & Chips" },
      { name: "description", content: "Sign in to order, track your food and see your order history." },
      { property: "og:title", content: "Sign in — Khayelitsha Fish & Chips" },
      { property: "og:description", content: "Sign in to order and track your fish & chips." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { next } = Route.useSearch();
  const navigate = useNavigate();
  const { session, ready } = useAuth();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (ready && session) navigate({ to: safeNext(next) });
  }, [ready, session, next, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "up") {
        const { data, error } = await supabase.auth.signUp({
          email: form.email.trim(),
          password: form.password,
          options: { data: { full_name: form.name.trim() }, emailRedirectTo: window.location.origin + safeNext(next) },
        });
        if (error) throw error;
        if (!data.session) toast.success("Check your email to confirm your account.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: form.email.trim(), password: form.password });
        if (error) throw error;
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    if (next) sessionStorage.setItem("kfc-next", safeNext(next));
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/auth" });
    if (r.error) toast.error("Google sign-in failed");
  };

  useEffect(() => {
    if (ready && session) {
      const saved = sessionStorage.getItem("kfc-next");
      if (saved) {
        sessionStorage.removeItem("kfc-next");
        navigate({ to: safeNext(saved) });
      }
    }
  }, [ready, session, navigate]);

  return (
    <div className="mx-auto grid max-w-5xl gap-8 px-5 py-12 md:grid-cols-2">
      <img src={hero} alt="Golden fish and chips" className="hidden h-full max-h-[520px] w-full rounded-3xl object-cover shadow-warm md:block" />
      <div className="glass-panel rounded-3xl p-8">
        <h1 className="text-3xl font-semibold">{mode === "in" ? "Welcome back" : "Create your account"}</h1>
        <p className="mt-2 text-sm text-muted-foreground">Order faster, track your food live and see past orders.</p>
        <button onClick={google} className="mt-6 w-full rounded-full border bg-card py-3 text-sm font-semibold hover:bg-muted">Continue with Google</button>
        <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />or<span className="h-px flex-1 bg-border" /></div>
        <form onSubmit={submit} className="space-y-3">
          {mode === "up" && <Input label="Your name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />}
          <Input label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
          <Input label="Password" type="password" value={form.password} onChange={(v) => setForm({ ...form, password: v })} />
          <button disabled={busy} className="w-full rounded-full bg-accent py-3 font-semibold text-accent-foreground shadow-warm hover:bg-accent/90 disabled:opacity-60">
            {busy ? "Please wait…" : mode === "in" ? "Sign in" : "Sign up"}
          </button>
        </form>
        <button onClick={() => setMode(mode === "in" ? "up" : "in")} className="mt-4 w-full text-sm text-primary underline">
          {mode === "in" ? "New here? Create an account" : "Already have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <label className="block text-sm font-medium">
      {label}
      <input required type={type} minLength={type === "password" ? 6 : undefined} maxLength={200} value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full rounded-lg border bg-card px-3 py-2 text-sm" />
    </label>
  );
}
