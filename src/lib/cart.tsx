import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { MENU } from "./menu";

export type CartLine = {
  key: string;
  itemId: string;
  qty: number;
  options: { chips?: string; sauce?: string; fish?: string; note?: string };
};

type CartCtx = {
  lines: CartLine[];
  add: (itemId: string, options?: CartLine["options"], qty?: number) => void;
  setQty: (key: string, qty: number) => void;
  clear: () => void;
  count: number;
  subtotal: number;
};

const Ctx = createContext<CartCtx | null>(null);
const KEY = "kfc-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setLines(JSON.parse(raw));
    } catch {}
  }, []);

  const persist = (next: CartLine[]) => {
    setLines(next);
    localStorage.setItem(KEY, JSON.stringify(next));
  };

  const add: CartCtx["add"] = (itemId, options = {}, qty = 1) => {
    if (!MENU.find((m) => m.id === itemId)) return;
    const key = `${itemId}|${JSON.stringify(options)}`;
    const existing = lines.find((l) => l.key === key);
    persist(
      existing
        ? lines.map((l) => (l.key === key ? { ...l, qty: Math.min(20, l.qty + qty) } : l))
        : [...lines, { key, itemId, qty, options }],
    );
  };

  const setQty = (key: string, qty: number) =>
    persist(qty <= 0 ? lines.filter((l) => l.key !== key) : lines.map((l) => (l.key === key ? { ...l, qty: Math.min(20, qty) } : l)));

  const count = lines.reduce((s, l) => s + l.qty, 0);
  const subtotal = lines.reduce((s, l) => s + (MENU.find((m) => m.id === l.itemId)?.price ?? 0) * l.qty, 0);

  return (
    <Ctx.Provider value={{ lines, add, setQty, clear: () => persist([]), count, subtotal }}>{children}</Ctx.Provider>
  );
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart outside CartProvider");
  return c;
}
