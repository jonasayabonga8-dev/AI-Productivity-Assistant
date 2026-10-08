import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useSoldOut() {
  const { data } = useQuery({
    queryKey: ["sold-out"],
    queryFn: async () => {
      const { data } = await supabase.from("menu_availability").select("item_id").eq("sold_out", true);
      return (data ?? []).map((r) => r.item_id);
    },
    staleTime: 60_000,
    enabled: typeof window !== "undefined",
  });
  return new Set(data ?? []);
}
