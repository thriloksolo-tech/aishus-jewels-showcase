import { createFileRoute } from "@tanstack/react-router";
import hero from "@/assets/hero-jewelry.jpg";
import { Instagram, MessageCircle, Sparkles, Heart, Shield, Truck, Lock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { categoryFallbackImage, defaultFallback } from "@/lib/product-fallbacks";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Aishu's Jewl's Collection — Handpicked Jewellery" },
      { name: "description", content: "Discover Aishu's Jewl's Collection — exquisite handpicked jewellery. Shop necklaces, earrings, bangles & more via Instagram & WhatsApp." },
      { property: "og:title", content: "Aishu's Jewl's Collection" },
      { property: "og:description", content: "Exquisite handpicked jewellery, delivered with love." },
    ],
  }),
  component: Index,
});

const INSTAGRAM_URL = "https://instagram.com/aishus_jewls_collection";
const WHATSAPP_NUMBER = "919999999999"; // TODO: replace with real number
const waLink = (msg: string) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;

function Index() {
  const { data: categories = [] } = useQuery({
    queryKey: ["public-categories"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("*").order("sort_order");
      return data ?? [];
    },
  });
  const { data: products = [] } = useQuery({
    queryKey: ["public-products"],
    queryFn: async () => {
      const { data } = await supabase.from("products").select("*").eq("active", true).order("sort_order");
      return data ?? [];
    },
  });

  const imgFor = (p: { image_url: string | null; category_id: string | null }) => {
    if (p.image_url) return p.image_url;
    const slug = categories.find((c) => c.id === p.category_id)?.slug;
    return (slug && categoryFallbackImage[slug]) || defaultFallback;
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-background/80 border-b border-border/60">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <a href="#top" className="flex flex-col leading-none">
            <span className="font-display text-2xl tracking-wide" style={{ fontFamily: 'var(--font-display)' }}>Aishu's</span>
            <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Jewl's Collection</span>
          </a>
          <nav className="hidden md:flex gap-10 text-sm tracking-wide">
            <a href="#collection" className="hover:text-accent transition">Collection</a>
            <a href="#story" className="hover:text-accent transition">Our Story</a>
            <a href="#order" className="hover:text-accent transition">How to Order</a>
            <a href="#contact" className="hover:text-accent transition">Contact</a>
          </nav>
          <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="hidden sm:inline-flex items-center gap-2 text-sm border border-foreground/20 rounded-full px-4 py-2 hover:bg-foreground hover:text-background transition">
            <Instagram className="w-4 h-4" /> Follow
          </a>
        </div>
      </header>

      {/* Hero */}
      <section id="top" className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 pt-16 pb-24 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-accent mb-6">
              <Sparkles className="w-3.5 h-3.5" /> Handpicked · Made with love
            </div>
            <h1 className="text-5xl md:text-7xl leading-[1.05] mb-6">
              Jewellery that <em className="text-accent">tells</em> your story.
            </h1>
            <p className="text-lg text-muted-foreground max-w-md mb-8">
              Aishu's Jewl's Collection brings you timeless pieces — from everyday delicates to occasion statements. Shop directly through Instagram or WhatsApp.
            </p>
            <div className="flex flex-wrap gap-3">
              <a href="#collection" className="inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-medium text-primary-foreground" style={{ background: 'var(--gradient-gold)', boxShadow: 'var(--shadow-luxe)' }}>
                Explore Collection
              </a>
              <a href={waLink("Hi Aishu! I'd love to know more about your collection.")} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm border border-foreground/30 hover:bg-foreground hover:text-background transition">
                <MessageCircle className="w-4 h-4" /> Chat on WhatsApp
              </a>
            </div>
            <div className="mt-12 flex gap-8 text-xs uppercase tracking-[0.2em] text-muted-foreground">
              <div>500+<br/><span className="normal-case tracking-normal text-sm">Happy clients</span></div>
              <div>100%<br/><span className="normal-case tracking-normal text-sm">Quality assured</span></div>
              <div>Pan-India<br/><span className="normal-case tracking-normal text-sm">Delivery</span></div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-6 rounded-full blur-3xl opacity-40" style={{ background: 'var(--gradient-gold)' }} />
            <img src={hero} alt="Featured jewellery from Aishu's collection" width={1600} height={1200} className="relative rounded-2xl shadow-2xl object-cover aspect-[4/5] w-full" />
          </div>
        </div>
      </section>

      {/* Collection */}
      <section id="collection" className="border-t border-border/60 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
            <div>
              <div className="text-xs uppercase tracking-[0.3em] text-accent mb-3">The Collection</div>
              <h2 className="text-4xl md:text-5xl max-w-xl">Pieces you'll reach for, again and again.</h2>
            </div>
            <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="text-sm underline underline-offset-4 hover:text-accent">See full catalogue on Instagram →</a>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.length === 0 && (
              <div className="col-span-full text-center py-16 text-muted-foreground">No products yet — check back soon.</div>
            )}
            {products.map((p) => (
              <article key={p.name} className="group">
                <div className="relative overflow-hidden rounded-xl bg-secondary mb-4 aspect-[4/5]">
                  <img src={imgFor(p)} alt={p.name} loading="lazy" width={800} height={1000} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
                  {p.tag && <span className="absolute top-3 left-3 text-[10px] uppercase tracking-widest bg-background/90 backdrop-blur px-3 py-1 rounded-full">{p.tag}</span>}
                  {p.stock === 0 && <span className="absolute top-3 right-3 text-[10px] uppercase tracking-widest bg-foreground text-background px-3 py-1 rounded-full">Sold out</span>}
                </div>
                <div className="flex items-baseline justify-between">
                  <h3 className="text-xl">{p.name}</h3>
                  <span className="text-accent font-medium">₹{Number(p.price_inr).toLocaleString("en-IN")}</span>
                </div>
                {p.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{p.description}</p>}
                <div className="mt-3 flex gap-2">
                  <a href={waLink(`Hi! I'm interested in "${p.name}" (₹${Number(p.price_inr).toLocaleString("en-IN")}). Is it available?`)} target="_blank" rel="noreferrer" className="flex-1 inline-flex items-center justify-center gap-2 text-xs uppercase tracking-wider border border-foreground/20 rounded-full py-2.5 hover:bg-foreground hover:text-background transition">
                    <MessageCircle className="w-3.5 h-3.5" /> Enquire
                  </a>
                  <a href={p.instagram_url || INSTAGRAM_URL} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-foreground/20 hover:bg-foreground hover:text-background transition">
                    <Instagram className="w-4 h-4" />
                  </a>
                </div>
              </article>
            ))}
          </div>
          {categories.length > 0 && (
            <div className="mt-10 flex flex-wrap gap-2 justify-center text-xs uppercase tracking-wider text-muted-foreground">
              {categories.map((c) => <span key={c.id} className="px-3 py-1 rounded-full bg-secondary">{c.name}</span>)}
            </div>
          )}
        </div>
      </section>

      {/* Story */}
      <section id="story" className="py-24 bg-secondary/40 border-y border-border/60">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <div className="text-xs uppercase tracking-[0.3em] text-accent mb-4">Our Story</div>
          <h2 className="text-4xl md:text-5xl mb-6">A small studio, big on love.</h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Started by Aishu with a simple wish — to bring beautiful, affordable jewellery to women who love to dress up every day. Each piece in our collection is personally selected for its craft, finish, and that little spark that makes it special.
          </p>
        </div>
      </section>

      {/* How to Order */}
      <section id="order" className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-14">
            <div className="text-xs uppercase tracking-[0.3em] text-accent mb-3">How to Order</div>
            <h2 className="text-4xl md:text-5xl">Three simple steps.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { n: "01", t: "Browse", d: "Explore the collection here or on our Instagram for the full catalogue and latest drops." },
              { n: "02", t: "Message", d: "Tap Enquire or DM us on Instagram with the piece you love. We'll confirm price & availability." },
              { n: "03", t: "Receive", d: "Pay securely via UPI/bank transfer. We pack with care and ship pan-India in 3–5 days." },
            ].map((s) => (
              <div key={s.n} className="p-8 rounded-2xl border border-border bg-card">
                <div className="text-accent font-display text-3xl mb-4" style={{ fontFamily: 'var(--font-display)' }}>{s.n}</div>
                <h3 className="text-2xl mb-2">{s.t}</h3>
                <p className="text-muted-foreground">{s.d}</p>
              </div>
            ))}
          </div>
          <div className="grid sm:grid-cols-3 gap-6 mt-14 text-sm">
            <div className="flex items-center gap-3"><Shield className="w-5 h-5 text-accent" /> Quality checked pieces</div>
            <div className="flex items-center gap-3"><Truck className="w-5 h-5 text-accent" /> Pan-India shipping</div>
            <div className="flex items-center gap-3"><Heart className="w-5 h-5 text-accent" /> Hand-packed with love</div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section id="contact" className="py-24 border-t border-border/60">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-4xl md:text-6xl mb-6">Let's find your next favourite piece.</h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
            Message us on WhatsApp or Instagram — we typically reply within a few hours.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href={waLink("Hi Aishu! I'd like to place an order.")} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full px-8 py-4 text-primary-foreground" style={{ background: 'var(--gradient-gold)', boxShadow: 'var(--shadow-luxe)' }}>
              <MessageCircle className="w-5 h-5" /> WhatsApp Us
            </a>
            <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full px-8 py-4 border border-foreground/30 hover:bg-foreground hover:text-background transition">
              <Instagram className="w-5 h-5" /> @aishus_jewls_collection
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/60 py-10">
        <div className="mx-auto max-w-7xl px-6 flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Aishu's Jewl's Collection. Crafted with love.</p>
          <div className="flex gap-6">
            <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="hover:text-accent">Instagram</a>
            <a href={waLink("Hi!")} target="_blank" rel="noreferrer" className="hover:text-accent">WhatsApp</a>
            <Link to="/admin" className="hover:text-accent inline-flex items-center gap-1"><Lock className="w-3 h-3" /> Admin</Link>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp */}
      <a href={waLink("Hi! I have a question about your jewellery.")} target="_blank" rel="noreferrer" aria-label="Chat on WhatsApp" className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center text-primary-foreground shadow-2xl hover:scale-110 transition" style={{ background: 'var(--gradient-gold)' }}>
        <MessageCircle className="w-6 h-6" />
      </a>
    </div>
  );
}
