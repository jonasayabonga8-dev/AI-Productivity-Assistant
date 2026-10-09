import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { z } from "zod";
import { MenuCard } from "@/components/MenuCard";
import { CATEGORIES, MENU } from "@/lib/menu";

const searchSchema = z.object({ category: z.enum(CATEGORIES).optional() });

export const Route = createFileRoute("/menu")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Menu — Ayas Delicious Tacos" },
      { name: "description", content: "Beef tacos, chicken tacos, veggie tacos, nachos, combos and drinks. Customise and order online." },
      { property: "og:title", content: "Menu — Ayas Delicious Tacos" },
      { property: "og:description", content: "Browse our full menu with prices in Rand and order for collection or delivery." },
    ],
  }),
  component: MenuPage,
});

function MenuPage() {
  const { category } = Route.useSearch();
  const navigate = useNavigate({ from: "/menu" });
  const [q, setQ] = useState("");
  const [maxPrice, setMaxPrice] = useState(250);

  const items = useMemo(
    () =>
      MENU.filter(
        (m) =>
          (!category || m.category === category) &&
          m.price <= maxPrice &&
          (m.name + m.description).toLowerCase().includes(q.toLowerCase()),
      ),
    [category, q, maxPrice],
  );

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <h1 className="text-4xl font-semibold">Our menu</h1>
      <p className="mt-2 text-muted-foreground">Fresh fillings. Warm tortillas. Big flavour.</p>

      <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center">
        <label className="glass-panel flex flex-1 items-center gap-2 rounded-full px-4 py-2.5">
          <Search className="size-4 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search tacos, nachos, combo…" className="w-full bg-transparent text-sm outline-none" />
        </label>
        <label className="flex items-center gap-3 text-sm text-muted-foreground">
          Up to R{maxPrice}
          <input type="range" min={10} max={250} step={5} value={maxPrice} onChange={(e) => setMaxPrice(+e.target.value)} className="accent-primary" />
        </label>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <Chip active={!category} onClick={() => navigate({ search: {} })}>All</Chip>
        {CATEGORIES.map((c) => (
          <Chip key={c} active={category === c} onClick={() => navigate({ search: { category: c } })}>{c}</Chip>
        ))}
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((m) => <MenuCard key={m.id} item={m} />)}
      </div>
      {!items.length && <p className="mt-10 text-center text-muted-foreground">No items match. Try another search.</p>}
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`rounded-full px-4 py-2 text-sm font-medium ${active ? "bg-primary text-primary-foreground" : "glass-panel text-muted-foreground hover:text-foreground"}`}>
      {children}
    </button>
  );
}
