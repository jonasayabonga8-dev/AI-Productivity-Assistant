import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type Role = "admin" | "staff" | "customer";
type AuthCtx = { session: Session | null; roles: Role[]; ready: boolean; isStaff: boolean; isAdmin: boolean };

const Ctx = createContext<AuthCtx>({ session: null, roles: [], ready: false, isStaff: false, isAdmin: false });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const load = async (s: Session | null) => {
      setSession(s);
      if (s) {
        const { data } = await supabase.from("user_roles").select("role").eq("user_id", s.user.id);
        setRoles((data ?? []).map((r) => r.role as Role));
      } else setRoles([]);
      setReady(true);
    };
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setTimeout(() => load(s), 0);
    });
    supabase.auth.getSession().then(({ data }) => load(data.session));
    return () => sub.subscription.unsubscribe();
  }, []);

  const isAdmin = roles.includes("admin");
  return (
    <Ctx.Provider value={{ session, roles, ready, isAdmin, isStaff: isAdmin || roles.includes("staff") }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
