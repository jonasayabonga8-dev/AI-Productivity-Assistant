import { createFileRoute, Link } from "@tanstack/react-router";
import { MapPin, MessageCircle, Star } from "lucide-react";
import hero from "@/assets/hero.jpg";
import { MenuCard } from "@/components/MenuCard";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BUSINESS, CATEGORIES, CATEGORY_IMAGES, FAQ, MENU, PROMOS, REVIEWS } from "@/lib/menu";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Aya's Delicious Fish & Chips — Fresh. Crispy. Local." },
      { name: "description", content: "Your local Khayelitsha fish & chips spot. Order your favourite meal for collection or delivery." },
      { property: "og:title", content: "Aya's Delicious Fish & Chips — Fresh. Crispy. Local." },
      { property: "og:description", content: "Order hake & chips, chicken, burgers and combos for collection or delivery in Khayelitsha." },
    ],
  }),
  component: Home,
});

function Home() {
  const popular = MENU.filter((m) => m.popular).slice(0, 3);
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-24 left-1/2 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-sun blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 lg:grid-cols-[1.05fr_1fr] lg:py-24">
          <div className="animate-rise">
            <span className="glass-panel inline-flex rounded-full px-3 py-1 text-xs font-medium tracking-[0.14em] text-primary uppercase">Cape Town · Khayelitsha</span>
            <h1 className="mt-5 text-[clamp(2.6rem,6.5vw,5rem)] leading-[0.98] font-semibold">Fresh. Crispy. Local.</h1>
            <p className="mt-5 max-w-[46ch] text-lg text-muted-foreground">Your local Khayelitsha fish &amp; chips spot. Order your favourite meal for collection or delivery.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/menu" className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground shadow-warm hover:bg-accent/90">Order Now</Link>
              <Link to="/menu" className="glass-panel rounded-full px-6 py-3 text-sm font-semibold hover:bg-card">View Menu</Link>
            </div>
            <div className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
              <span>Open 09:00–21:00 daily</span><span>·</span>
              <span className="inline-flex items-center gap-1"><Star className="size-4 fill-accent text-accent" /> 4.8 from local reviews</span>
            </div>
          </div>
          <div className="relative animate-rise [animation-delay:120ms]">
            <div className="glass-panel absolute -inset-4 -rotate-2 rounded-3xl" />
            <img src={hero} alt="Golden battered hake and chips in a paper cone" width={1024} height={1024} className="relative aspect-square w-full rounded-3xl object-cover shadow-warm" />
            <div className="glass-panel absolute -bottom-5 -left-5 rounded-2xl px-4 py-3">
              <p className="font-display text-2xl leading-none font-semibold">R65</p>
              <p className="mt-1 text-xs text-muted-foreground">Hake &amp; Chips</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-12">
        <h2 className="text-3xl font-semibold">Browse by craving</h2>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {CATEGORIES.map((c) => (
            <Link key={c} to="/menu" search={{ category: c }} className="group relative overflow-hidden rounded-2xl">
              <img src={CATEGORY_IMAGES[c]} alt="" loading="lazy" className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/75 to-transparent" />
              <span className="absolute bottom-2 left-3 font-display font-semibold text-background">{c}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-3xl font-semibold">Popular meals</h2>
          <Link to="/menu" className="text-sm font-medium text-primary hover:underline">See full menu →</Link>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {popular.map((m) => <MenuCard key={m.id} item={m} />)}
        </div>
      </section>

      <section id="specials" className="mx-auto max-w-6xl px-5 py-12">
        <h2 className="text-3xl font-semibold">This week's specials</h2>
        <div className="mt-7 grid gap-5 md:grid-cols-3">
          {PROMOS.map((p) => (
            <div key={p.title} className={`rounded-2xl p-6 ${p.tone === "primary" ? "bg-primary text-primary-foreground" : p.tone === "accent" ? "bg-accent text-accent-foreground" : "glass-panel"}`}>
              <p className={`text-xs font-medium tracking-[0.16em] uppercase ${p.tone === "glass" ? "text-primary" : "opacity-80"}`}>{p.title}</p>
              <h3 className="mt-3 text-2xl leading-tight font-semibold">{p.headline}</h3>
              <p className={`mt-2 text-sm ${p.tone === "glass" ? "text-muted-foreground" : "opacity-85"}`}>{p.body}</p>
              <p className={`mt-5 font-display text-3xl font-semibold ${p.tone === "glass" ? "text-primary" : ""}`}>{p.price}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="visit" className="mx-auto max-w-6xl px-5 py-12">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
          <div className="glass-panel rounded-2xl p-6">
            <h2 className="text-2xl font-semibold">Hours &amp; location</h2>
            <ul className="mt-5 space-y-2 text-sm">
              {BUSINESS.hours.map((h) => (
                <li key={h.day} className="flex justify-between border-b pb-2 last:border-0"><span className="text-muted-foreground">{h.day}</span><span className="font-medium">{h.time}</span></li>
              ))}
            </ul>
            <p className="mt-5 inline-flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="size-4" /> {BUSINESS.address}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <a href={`https://wa.me/${BUSINESS.whatsapp}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-whatsapp px-5 py-2.5 text-sm font-medium text-whatsapp-foreground hover:opacity-90"><MessageCircle className="size-4" /> Chat on WhatsApp</a>
              <a href="https://maps.google.com/?q=Cape+Town+CBD" target="_blank" rel="noreferrer" className="glass-panel rounded-full px-5 py-2.5 text-sm font-medium hover:bg-card">Get directions</a>
            </div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {REVIEWS.map((r, i) => (
              <figure key={r.name} className={`glass-panel rounded-2xl p-5 ${i === 2 ? "sm:col-span-2" : ""}`}>
                <div className="flex gap-0.5">{Array.from({ length: 5 }).map((_, k) => <Star key={k} className="size-4 fill-accent text-accent" />)}</div>
                <p className="mt-3 text-sm text-muted-foreground">“{r.text}”</p>
                <figcaption className="mt-4 flex items-center gap-3">
                  <span className="grid size-9 place-items-center rounded-full bg-secondary font-display font-semibold text-secondary-foreground">{r.name[0]}</span>
                  <span className="text-sm font-medium">{r.name}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 py-12">
        <h2 className="text-3xl font-semibold">Questions</h2>
        <Accordion type="single" collapsible className="mt-6">
          {FAQ.map((f) => (
            <AccordionItem key={f.q} value={f.q}>
              <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </>
  );
}
