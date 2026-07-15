import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AnimatedSection, AnimatedStagger, AnimatedChild } from "@/components/shared/animations";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: { isDeleted: false, isActive: true },
      orderBy: { createdAt: "desc" },
      include: { images: { orderBy: { sortOrder: "asc" } } },
    }),
    prisma.category.findMany({ orderBy: { order: "asc" } }),
  ]);

  console.log("[ProductsPage] products count:", products.length);
  products.forEach((p) => {
    console.log(`[ProductsPage] product "${p.name}": images=`, JSON.stringify(p.images));
  });

  return (
    <>
      {/* Premium Products Hero */}
      <section className="relative h-[420px] md:h-[480px] lg:h-[520px] overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
          style={{ backgroundImage: "url(/images/mango-tree-banner.jpg)" }} />

        {/* Dark overlay */}
        <div className="absolute inset-0"
          style={{ background: "linear-gradient(90deg, rgba(8,25,8,.78), rgba(8,25,8,.45), rgba(8,25,8,.15))" }} />

        {/* Vignette */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.4) 100%)" }} />

        {/* Sunlight rays */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] animate-ray origin-center opacity-0"
            style={{ background: "linear-gradient(135deg, transparent 30%, rgba(255,248,220,0.06) 50%, transparent 70%)" }} />
        </div>

        {/* Glow blobs */}
        <div className="absolute top-20 right-[15%] w-96 h-96 rounded-full bg-accent/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-10 left-[5%] w-64 h-64 rounded-full bg-[#F4C542]/5 blur-[100px] pointer-events-none" />

        {/* Floating leaves */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <svg className="absolute top-16 left-[8%] w-8 h-8 text-white/8 animate-leaf-drift" viewBox="0 0 100 100" fill="currentColor">
            <path d="M80 20C60 10 30 20 20 50C10 80 30 90 50 80C70 70 90 40 80 20Z" />
          </svg>
          <svg className="absolute top-32 right-[12%] w-6 h-6 text-white/8 animate-float-slow" viewBox="0 0 100 100" fill="currentColor" style={{ animationDelay: "2s" }}>
            <path d="M80 20C60 10 30 20 20 50C10 80 30 90 50 80C70 70 90 40 80 20Z" />
          </svg>
          <svg className="absolute bottom-24 left-[15%] w-5 h-5 text-white/8 animate-leaf-drift" viewBox="0 0 100 100" fill="currentColor" style={{ animationDelay: "4s", animationDuration: "14s" }}>
            <path d="M80 20C60 10 30 20 20 50C10 80 30 90 50 80C70 70 90 40 80 20Z" />
          </svg>
          <svg className="absolute bottom-16 right-[20%] w-7 h-7 text-white/8 animate-float" viewBox="0 0 100 100" fill="currentColor" style={{ animationDelay: "1s" }}>
            <path d="M80 20C60 10 30 20 20 50C10 80 30 90 50 80C70 70 90 40 80 20Z" />
          </svg>
        </div>

        {/* Tiny particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[
            { top: "20%", left: "10%", delay: "0s", size: "3px" },
            { top: "35%", left: "85%", delay: "0.5s", size: "2px" },
            { top: "60%", left: "5%", delay: "1s", size: "4px" },
            { top: "70%", left: "80%", delay: "1.5s", size: "2px" },
            { top: "45%", left: "50%", delay: "2s", size: "3px" },
            { top: "80%", left: "60%", delay: "2.5s", size: "2px" },
          ].map((p, i) => (
            <div key={i} className="absolute rounded-full bg-white/30 animate-particle"
              style={{ top: p.top, left: p.left, width: p.size, height: p.size, animationDelay: p.delay }} />
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 w-full h-full flex items-center">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 px-4 py-1.5 text-sm text-white/90 mb-6">
              <span className="w-2 h-2 rounded-full bg-[#8BC34A] animate-pulse" />
              🌿 100% ORGANIC
            </span>

            <h1 className="font-heading text-5xl sm:text-6xl md:text-7xl lg:text-[72px] font-bold text-white leading-[1.05] tracking-tight">
              Our{" "}
              <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(90deg, #9AD65C, #F5C542)" }}>
                Products
              </span>
            </h1>

            <p className="mt-5 text-base md:text-lg text-white/70 leading-relaxed max-w-[520px]">
              Fresh handpicked organic produce straight from our farm to your table.
            </p>

            <div className="mt-10 flex flex-wrap gap-3">
              <Link href="/products"
                className="group inline-flex items-center gap-2 rounded-full bg-[#1B5E20] px-7 py-3.5 text-sm font-button font-semibold text-white shadow-xl shadow-[#1B5E20]/25 transition-all hover:shadow-[#1B5E20]/35 hover:-translate-y-0.5 hover:bg-[#1a6b20]">
                Shop Products
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </Link>
              <Link href="/about"
                className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 px-7 py-3.5 text-sm font-button font-semibold text-white transition-all hover:bg-white/20 hover:-translate-y-0.5">
                Visit Farm
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" /></svg>
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
                {[
                  { icon: "🌿", label: "100% Organic" },
                  { icon: "🧪", label: "Chemical Free" },
                  { icon: "🚚", label: "Fast Delivery" },
                  { icon: "👨‍🌾", label: "Farm Fresh" },
                ].map((badge) => (
                  <div key={badge.label} className="flex items-center gap-1.5 text-xs text-white/60">
                    <span>{badge.icon}</span>
                    <span className="text-white/70 font-medium">{badge.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0 leading-none pointer-events-none">
          <svg viewBox="0 0 1440 100" preserveAspectRatio="none" className="w-full h-[60px] md:h-[80px]">
            <path fill="#F8F8F5" d="M0,40 C240,100 480,0 720,40 C960,80 1200,0 1440,40 L1440,100 L0,100 Z" />
            <path fill="#1B5E20" opacity="0.03" d="M0,55 C240,95 480,15 720,55 C960,95 1200,15 1440,55 L1440,100 L0,100 Z" />
          </svg>
        </div>
      </section>

      {/* Filters & Grid */}
      <section className="section-padding">
        <div className="container mx-auto px-4">
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button className="rounded-xl bg-[#1B5E20] px-5 py-2.5 text-xs font-button font-bold text-white shadow-sm">All Products</button>
              {categories.map((cat) => (
                <Link key={cat.id} href={`/products?category=${cat.slug}`} className="rounded-xl border border-border bg-white px-5 py-2.5 text-xs font-button font-bold text-foreground/70 hover:bg-[#1B5E20] hover:text-white hover:border-[#1B5E20] transition-all shadow-sm">
                  {cat.name}
                </Link>
              ))}
            </div>
          )}

          <AnimatedStagger className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4" staggerDelay={0.05}>
            {products.map((product) => (
              <AnimatedChild key={product.id}>
                <Link href={`/products/${product.slug}`} className="group block rounded-2xl bg-white border border-border/40 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all">
                  <div className="relative aspect-[4/5] overflow-hidden bg-primary/5">
                    {product.images[0]?.imagePath ? (
                      <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: `url(${product.images[0].imagePath})` }} />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-4xl text-muted-foreground">🌿</div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute top-3 left-3"><span className="rounded-lg bg-white/90 backdrop-blur-sm px-3 py-1 text-[10px] font-button font-bold text-[#1B5E20] shadow-sm">Organic</span></div>
                    {product.isFeatured && (
                      <div className="absolute top-3 right-3"><span className="rounded-lg bg-[#F4C542] text-[#1B5E20] px-3 py-1 text-[10px] font-button font-bold shadow-sm">Best Seller</span></div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-heading font-bold text-foreground group-hover:text-[#1B5E20] transition-colors">{product.name}</h3>
                    {product.price && <p className="mt-1 text-lg font-bold text-[#1B5E20]">₹{product.price.toString()}<span className="text-xs text-muted-foreground font-normal"> / {product.unit?.toLowerCase() || 'kg'}</span></p>}
                    {product.description && <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{product.description}</p>}
                  </div>
                </Link>
              </AnimatedChild>
            ))}
          </AnimatedStagger>

          {products.length === 0 && (
            <div className="mt-16 text-center">
              <p className="text-muted-foreground">No products available yet. Check back soon!</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
