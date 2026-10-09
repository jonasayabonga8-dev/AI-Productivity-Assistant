import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/lib/cart";
import { useSoldOut } from "@/lib/sold-out";
import { OPTIONS, rand, type MenuItem } from "@/lib/menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function MenuCard({ item }: { item: MenuItem }) {
  const { add } = useCart();
  const soldOut = useSoldOut().has(item.id);
  const [open, setOpen] = useState(false);
  const [tortilla, setTortilla] = useState<string>(OPTIONS.tortilla[0] ?? "Soft corn");
  const [sauce, setSauce] = useState<string>(OPTIONS.sauce[0] ?? "Tomato salsa");
  const [heat, setHeat] = useState<string>(OPTIONS.heat[0] ?? "Mild");
  const [note, setNote] = useState("");
  const isTaco = ["Tacos", "Chicken", "Vegetarian", "Combos"].includes(item.category);

  const quickAdd = () => {
    if (item.customisable) return setOpen(true);
    add(item.id);
    toast.success(`${item.name} added`);
  };

  const confirm = () => {
    add(item.id, { sauce, heat, ...(isTaco ? { tortilla } : {}), ...(note.trim() ? { note: note.trim().slice(0, 120) } : {}) });
    toast.success(`${item.name} added`);
    setOpen(false);
    setNote("");
  };

  return (
    <>
      <div className="group glass-panel overflow-hidden rounded-lg p-3 transition-transform hover:-translate-y-1 hover:shadow-warm">
        <div className="overflow-hidden rounded-xl">
          <img src={item.image} alt={item.name} loading="lazy" width={1024} height={768} className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        </div>
        <div className="flex items-start justify-between gap-3 px-2 pt-3">
          <div>
            <h3 className="text-lg font-semibold leading-tight">{item.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
          </div>
          <span className="font-display text-lg font-semibold text-primary">{rand(item.price)}</span>
        </div>
        <Button disabled={soldOut} onClick={quickAdd} className="mx-2 mt-3 mb-1 inline-flex w-[calc(100%-1rem)] items-center justify-center gap-2 rounded-full bg-accent py-2.5 text-sm font-semibold text-accent-foreground hover:bg-accent/90 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground">
          {soldOut ? "Sold out today" : <><Plus className="size-4" /> Add to order</>}
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">{item.name} — {rand(item.price)}</DialogTitle>
          </DialogHeader>
          <img src={item.image} alt="" className="aspect-[16/9] w-full rounded-xl object-cover" />
          {isTaco && <OptionRow label="Tortilla" options={OPTIONS.tortilla} value={tortilla} onChange={setTortilla} />}
          <OptionRow label="Sauce" options={OPTIONS.sauce} value={sauce} onChange={setSauce} />
          <OptionRow label="Heat" options={OPTIONS.heat} value={heat} onChange={setHeat} />
          <label className="text-sm font-medium">
            Special instructions
            <input value={note} onChange={(e) => setNote(e.target.value)} maxLength={120} placeholder="e.g. no coriander" className="mt-1 w-full rounded-lg border bg-card px-3 py-2 text-sm" />
          </label>
          <Button onClick={confirm} className="rounded-full bg-primary py-3 font-semibold text-primary-foreground hover:bg-primary/90">Add to cart</Button>
        </DialogContent>
      </Dialog>
    </>
  );
}

function OptionRow({ label, options, value, onChange }: { label: string; options: readonly string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <Button key={o} onClick={() => onChange(o)} className={`rounded-full px-3 py-1.5 text-sm ${o === value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-secondary"}`}>
            {o}
          </Button>
        ))}
      </div>
    </div>
  );
}
