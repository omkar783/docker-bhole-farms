import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { AnimatedSection, AnimatedStagger, AnimatedChild, ParallaxImage } from "@/components/shared/animations";
import { PageBanner } from "@/components/shared/page-banner";

export const dynamic = "force-dynamic";

const features = [
  {
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M9 12l2 2 4-4" /></svg>
    ),
    title: "100% Organic",
    desc: "Certified organic, no pesticides",
  },
  {
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>
    ),
    title: "Farm Fresh",
    desc: "Harvested and delivered same-day",
  },
  {
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="3" width="15" height="13" rx="2" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>
    ),
    title: "Fast Delivery",
    desc: "Direct to your doorstep",
  },
  {
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
    ),
    title: "Chemical Free",
    desc: "Pure, natural, safe for your family",
  },
];

const reviews = [
  { name: "Priya Sharma", role: "Home Chef, Pune", content: "The Alphonso mangoes from Bhole Farms are the best I've ever had. Pure sweetness.", rating: 5 },
  { name: "Rahul Deshmukh", role: "Fitness Coach, Mumbai", content: "I trust Bhole Farms for all my organic vegetables. Fresh, clean, and always on time.", rating: 5 },
  { name: "Anita Patel", role: "Restaurant Owner, Nagpur", content: "Our guests notice the difference. Premium quality produce every single time.", rating: 5 },
];

export default async function HomePage() {
  const [featuredProducts, settings] = await Promise.all([
    prisma.product.findMany({
      where: { isFeatured: true },
      take: 4,
      include: { images: { orderBy: { sortOrder: "asc" } } },
    }),
    getSettings(),
  ]);

  return (
    <>
      <PageBanner
        backgroundImage="/images/mango-tree-banner.jpg"
        badge="🥭 Alphonso & Kesar Season is Live!"
        heading="Fresh Organic Mangoes from Our Orchards"
        highlightedWord="Organic Mangoes"
        subtitle="Savor the rich, sweet taste of 100% chemical-free Alphonso and Kesar mangoes, handpicked from our family orchards in Devgaon, Maharashtra."
        primaryCTA={{ label: "Order Fresh Mangoes", href: "/products" }}
        secondaryCTA={{ label: "Explore Our Orchards", href: "/about" }}
      />

      {/* Features */}
      <section style={{ marginTop: "80px" }} className="pb-16">
        <div className="container mx-auto px-4">
          <div className="grid gap-4 md:grid-cols-4">
            {features.map((f, i) => (
              <AnimatedSection key={f.title} delay={i * 0.1}>
                <div className="group rounded-2xl bg-white p-6 shadow-lg shadow-black/[0.03] border border-border/40 hover:shadow-xl hover:-translate-y-1 transition-all">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all">
                    {f.icon}
                  </div>
                  <h3 className="mt-4 font-heading font-bold text-foreground">{f.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Premium Products */}
      <section className="section-padding bg-gradient-cream relative" style={{ marginTop: "40px" }}>
        <div className="absolute inset-0 leaf-pattern" />
        <div className="relative container mx-auto px-4">
          <AnimatedSection>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-2 text-xs font-button font-bold uppercase tracking-[0.2em] text-primary">Premium Produce</span>
                <h2 className="mt-2 font-heading text-4xl md:text-5xl font-bold text-foreground">Handpicked for You</h2>
                <p className="mt-2 text-muted-foreground max-w-lg">From our orchards to your home — the freshest organic produce, picked at peak ripeness.</p>
              </div>
              <Link href="/products" className="group inline-flex items-center gap-2 rounded-xl border border-border bg-white px-6 py-3 text-sm font-button font-semibold text-foreground hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm">
                View All Products
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </Link>
            </div>
          </AnimatedSection>
          <AnimatedStagger className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4" staggerDelay={0.08}>
            {(featuredProducts.length > 0 ? featuredProducts : [
              { id: "kesar", slug: "kesar-mango", name: "Kesar Mango", price: 599, images: [{ imagePath: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=600&q=80" }], description: "Sweet, aromatic, and golden", isFeatured: true },
              { id: "alphonso", slug: "alphonso-mango", name: "Alphonso Mango", price: 899, images: [{ imagePath: "https://images.unsplash.com/photo-1629828874514-d53eeea7a101?w=600&q=80" }], description: "The king of mangoes", isFeatured: true },
              { id: "jamun", slug: "jamun", name: "Fresh Jamun", price: 299, images: [{ imagePath: "https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=600&q=80" }], description: "Purple treasure of summer", isFeatured: true },
              { id: "totapuri", slug: "totapuri-mango", name: "Totapuri Mango", price: 449, images: [{ imagePath: "https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=600&q=80" }], description: "Tangy, firm, and delicious", isFeatured: true },
            ]).slice(0, 4).map((product, i) => (
              <AnimatedChild key={product.id}>
                <Link href={`/products/${product.slug}`} className="group block rounded-2xl bg-white border border-border/40 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all">
                  <div className="relative aspect-[4/5] overflow-hidden bg-primary/5">
                    <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: `url(${product.images[0]?.imagePath})` }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute top-3 left-3">
                      <span className="rounded-lg bg-white/90 backdrop-blur-sm px-3 py-1 text-[10px] font-button font-bold text-primary shadow-sm">Organic</span>
                    </div>
                    {i === 0 && (
                      <div className="absolute top-3 right-3">
                        <span className="rounded-lg bg-accent text-primary px-3 py-1 text-[10px] font-button font-bold shadow-sm">Best Seller</span>
                      </div>
                    )}
                    <div className="absolute bottom-3 left-3 right-3">
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/90 backdrop-blur-sm px-4 py-2 text-xs font-button font-bold text-[#25D366] opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 shadow-sm">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                        Order Now
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-heading font-bold text-foreground group-hover:text-primary transition-colors">{product.name}</h3>
                    {product.price && <p className="mt-1 text-lg font-bold text-primary">₹{product.price.toString()}<span className="text-xs text-muted-foreground font-normal"> / kg</span></p>}
                    <p className="mt-1 text-sm text-muted-foreground">{product.description}</p>
                  </div>
                </Link>
              </AnimatedChild>
            ))}
          </AnimatedStagger>
        </div>
      </section>

      {/* About / Story Section */}
      <section className="section-padding relative overflow-hidden" style={{ marginTop: "60px" }}>
        <div className="absolute inset-0 leaf-pattern opacity-30" />
        <div className="relative container mx-auto px-4">
          <div className="grid gap-16 lg:grid-cols-2 items-center">
            {/* Left — Cinematic Orchard Image */}
            <AnimatedSection direction="left">
              <div className="relative">
                <div className="group overflow-hidden rounded-3xl shadow-2xl" style={{ borderRadius: "24px" }}>
                  <div
                    className="aspect-[4/3] w-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                    style={{ backgroundImage: "url(/images/about-drone-orchard.jpg)" }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
                </div>
                {/* Floating stat card */}
                <div className="absolute -bottom-5 -right-5 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl p-5 border border-border/40">
                  <p className="font-heading text-3xl font-bold text-primary">25+</p>
                  <p className="text-xs text-muted-foreground">Acres of Orchard</p>
                </div>
                {/* Floating badge */}
                <div className="absolute -top-4 -left-4 bg-accent/90 backdrop-blur-md rounded-2xl shadow-lg px-4 py-2 border border-accent/20">
                  <p className="text-xs font-bold text-primary">Est. 2015</p>
                </div>
              </div>
            </AnimatedSection>

            {/* Right — Brand Story */}
            <AnimatedSection direction="right">
              {/* Badge */}
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-primary">
                <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                Our Story
              </span>

              {/* Heading */}
              <h2 className="mt-6 font-heading text-4xl sm:text-5xl font-bold text-foreground leading-[1.1] tracking-tight">
                Growing Premium Fruits<br />
                <span className="text-primary">with Love Since 2015</span>
              </h2>

              {/* Description */}
              <div className="mt-6 space-y-4 text-muted-foreground leading-relaxed">
                <p>Bhole Farms is a family-owned organic fruit farm located in Devgaon, Maharashtra.</p>
                <p>For years we have been cultivating premium-quality Kesar Mangoes, Alphonso Mangoes, Totapuri Mangoes, Jamun, Guava, and seasonal fruits using sustainable and chemical-free farming methods.</p>
                <p>Every fruit is grown with care, harvested at peak freshness, and delivered directly from our orchard to your family.</p>
              </div>

              {/* Feature Cards — 2x2 Grid */}
              <div className="mt-10 grid grid-cols-2 gap-4">
                {[
                  { icon: "🥭", title: "Premium Mangoes", desc: "Kesar, Alphonso & Totapuri" },
                  { icon: "🌿", title: "100% Organic", desc: "Chemical-free farming" },
                  { icon: "🚜", title: "Sustainable Farming", desc: "Eco-friendly practices" },
                  { icon: "👨‍🌾", title: "Family Owned", desc: "Three generations strong" },
                ].map((f) => (
                  <div key={f.title} className="group rounded-2xl bg-white border border-border/40 p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-lg group-hover:bg-primary/20 transition-colors">
                      <span>{f.icon}</span>
                    </div>
                    <h4 className="mt-3 font-heading font-bold text-sm text-foreground">{f.title}</h4>
                    <p className="mt-1 text-xs text-muted-foreground">{f.desc}</p>
                  </div>
                ))}
              </div>

              {/* Farm Statistics */}
              <div className="mt-10 grid grid-cols-5 gap-3">
                {[
                  { icon: "🌳", value: "25+", label: "Acres" },
                  { icon: "🥭", value: "15+", label: "Varieties" },
                  { icon: "😊", value: "5000+", label: "Happy" },
                  { icon: "🌿", value: "100%", label: "Organic" },
                  { icon: "👨‍🌾", value: "Since", label: "2015" },
                ].map((s) => (
                  <div key={s.label} className="text-center">
                    <span className="text-lg">{s.icon}</span>
                    <p className="mt-1 font-heading font-bold text-primary text-sm">{s.value}</p>
                    <p className="text-[10px] text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  href="/about"
                  className="group inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:shadow-primary/35 hover:-translate-y-0.5"
                  style={{ borderRadius: "999px" }}
                >
                  Visit Our Farm
                  <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                </Link>
                <Link
                  href="/products"
                  className="group inline-flex items-center gap-2 rounded-full border border-border bg-white px-7 py-3.5 text-sm font-semibold text-foreground transition-all hover:border-primary hover:text-primary hover:-translate-y-0.5 hover:shadow-lg"
                  style={{ borderRadius: "999px" }}
                >
                  Explore Products
                  <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                </Link>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-padding relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-64 gradient-cream" />
        <div className="relative container mx-auto px-4">
          <AnimatedSection className="text-center">
            <span className="text-xs font-button font-bold uppercase tracking-[0.2em] text-primary">Testimonials</span>
            <h2 className="mt-2 font-heading text-4xl md:text-5xl font-bold text-foreground">What Our Customers Say</h2>
            <p className="mt-2 text-muted-foreground max-w-lg mx-auto">Real stories from people who love our produce.</p>
          </AnimatedSection>
          <AnimatedStagger className="mt-10 grid gap-6 md:grid-cols-3" staggerDelay={0.1}>
            {reviews.map((review) => (
              <AnimatedChild key={review.name}>
                <div className="group rounded-2xl bg-white border border-border/40 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all">
                  <div className="flex gap-1 text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg key={i} className={`w-4 h-4 ${i < review.rating ? "text-amber-400" : "text-gray-200"}`} fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                    ))}
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground leading-relaxed italic">&ldquo;{review.content}&rdquo;</p>
                  <div className="mt-4 flex items-center gap-3 pt-4 border-t border-border/40">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">{review.name.charAt(0)}</div>
                    <div>
                      <p className="text-sm font-semibold">{review.name}</p>
                      <p className="text-xs text-muted-foreground">{review.role}</p>
                    </div>
                  </div>
                </div>
              </AnimatedChild>
            ))}
          </AnimatedStagger>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 gradient-green" />
        <div className="absolute inset-0 opacity-[0.05]">
          <svg className="w-full h-full" viewBox="0 0 400 400" preserveAspectRatio="none">
            <defs><pattern id="cta-leaf" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M30 10C20 25 15 40 25 50c-2-8 3-20 8-28 3-4 6-7 8-12" fill="#fff"/></pattern></defs>
            <rect width="100%" height="100%" fill="url(#cta-leaf)" />
          </svg>
        </div>
        <div className="relative container mx-auto px-4 text-center">
          <AnimatedSection>
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-white leading-tight">Bulk Orders &amp; Wholesale</h2>
            <p className="mx-auto mt-4 max-w-xl text-white/70 text-lg">Supplying restaurants, stores, and businesses across Maharashtra. Get in touch for custom pricing and volume discounts.</p>
            <div className="mt-8 flex justify-center gap-4">
              <Link href="/contact" className="rounded-xl bg-white px-8 py-4 text-sm font-button font-semibold text-primary shadow-xl transition-all hover:bg-white/90 hover:-translate-y-0.5">
                Contact Us
              </Link>
              <a href={`https://wa.me/${settings.whatsapp_number}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 px-8 py-4 text-sm font-button font-semibold text-white transition-all hover:bg-white/20">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                WhatsApp Us
              </a>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
