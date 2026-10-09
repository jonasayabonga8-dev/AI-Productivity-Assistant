import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, MapPin, MessageCircle } from "lucide-react";
import hero from "@/assets/tacos-hero.jpg";
import { Button } from "@/components/ui/button";
import { MenuCard } from "@/components/MenuCard";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BUSINESS, CATEGORIES, CATEGORY_IMAGES, FAQ, MENU, PROMOS } from "@/lib/menu";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ayas Delicious Tacos — Fresh. Crispy. Local." },
      { name: "description", content: "Fresh tacos in Cape Town CBD. Order your favourite meal for collection or delivery." },
      { property: "og:title", content: "Ayas Delicious Tacos — Fresh. Crispy. Local." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:description", content: "Order beef tacos, chicken tacos, veggie tacos and nachos in Cape Town CBD." },
    ],
  }),
  component: Home,
});

function Home() {
  const popular = MENU.filter((m) => m.popular).slice(0, 3);
  return (
    <>
      <section className="taco-hero relative isolate overflow-hidden">
        <img src={hero} alt="Fresh beef, chicken and vegetable tacos with salsa and guacamole" width={1536} height={1024} className="absolute inset-0 -z-20 h-full w-full object-cover object-right" />
        <div className="taco-hero-shade absolute inset-0 -z-10" />
        <div className="mx-auto flex min-h-[500px] max-w-6xl items-center px-5 py-12 sm:min-h-[540px]">
          <div className="max-w-lg animate-rise">
            <p className="text-sm font-semibold uppercase text-primary">Cape Town CBD · Fresh. Crispy. Local.</p>
            <h1 className="mt-5 text-5xl font-bold leading-[1.04] sm:text-6xl">Ayas<br />Delicious Tacos<span className="text-primary">.</span></h1>
            <p className="mt-5 max-w-sm text-lg text-foreground">Big flavour. Fresh fillings. Your new favourite taco spot, founded by Ayabonga Jonas.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild size="lg" className="h-12 rounded-full"><Link to="/menu">Order tacos <ArrowUpRight /></Link></Button>
              <Button asChild variant="outline" size="lg" className="h-12 rounded-full"><Link to="/menu">View menu</Link></Button>
            </div>
            <p className="mt-6 text-sm font-medium text-muted-foreground">Beef · Chicken · Veggie · Nachos</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-12">
        <h2 className="text-3xl font-semibold">Browse by craving</h2>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {CATEGORIES.map((c) => (
            <Link key={c} to="/menu" search={{ category: c }} className="group relative overflow-hidden rounded-lg">
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
        <div className="max-w-2xl">
          <div className="py-2">
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
