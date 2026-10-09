import { Link } from "@tanstack/react-router";
import { ShoppingBag, User } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/cart";
import { BUSINESS } from "@/lib/menu";

export function SiteHeader() {
  const { count } = useCart();
  const { session, isStaff, isAdmin } = useAuth();
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid size-9 place-items-center rounded-xl bg-primary font-display text-sm font-semibold text-primary-foreground">AD</span>
          <span className="hidden font-display text-lg font-semibold leading-none sm:inline">{BUSINESS.name}</span>
        </Link>
        <nav className="flex items-center gap-5 text-sm font-medium text-muted-foreground">
          <Link to="/menu" className="hover:text-foreground" activeProps={{ className: "text-foreground" }}>Menu</Link>
          <Link to="/" hash="specials" className="hidden hover:text-foreground md:inline">Specials</Link>
          <Link to="/" hash="visit" className="hidden hover:text-foreground md:inline">Visit</Link>
          {isAdmin && <Link to="/admin" className="hover:text-foreground" activeProps={{ className: "text-foreground" }}>Dashboard</Link>}
          {isStaff && <Link to="/kitchen" className="hover:text-foreground" activeProps={{ className: "text-foreground" }}>Kitchen</Link>}
          <Link to={session ? "/account" : "/auth"} className="inline-flex items-center gap-1 hover:text-foreground" activeProps={{ className: "text-foreground" }}>
            <User className="size-4" /><span className="hidden sm:inline">{session ? "My orders" : "Sign in"}</span>
          </Link>
          <Link to="/cart" className="relative inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90">
            <ShoppingBag className="size-4" />
            <span>Cart</span>
            {count > 0 && (
              <span className="grid size-5 place-items-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">{count}</span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t bg-card/50">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-5 py-8 text-sm text-muted-foreground sm:flex-row sm:justify-between">
        <span>© {new Date().getFullYear()} {BUSINESS.name} · Founded by {BUSINESS.founder}</span>
        <span>{BUSINESS.tagline}</span>
      </div>
    </footer>
  );
}
