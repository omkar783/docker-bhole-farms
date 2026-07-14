import { prisma } from "@/lib/prisma";
import { AnimatedSection, AnimatedStagger, AnimatedChild } from "@/components/shared/animations";
import { PageBanner } from "@/components/shared/page-banner";

export const dynamic = "force-dynamic";

const categories = [
  { label: "All", icon: "🖼️" },
  { label: "Harvest", icon: "🌾" },
  { label: "Mangoes", icon: "🥭" },
  { label: "Jamun", icon: "🫐" },
  { label: "Farm Events", icon: "🎉" },
  { label: "Drone Shots", icon: "📷" },
];

export default async function GalleryPage() {
  const items = await prisma.galleryItem.findMany({
    orderBy: { order: "asc" },
    include: { images: { orderBy: { sortOrder: "asc" } } },
  });

  return (
    <>
      <PageBanner
        backgroundImage="/images/mango-tree-banner.jpg"
        badge="Farm Life"
        heading="Our Gallery"
        highlightedWord="Gallery"
        subtitle="A glimpse into life at Bhole Farms — captured through the seasons."
        primaryCTA={{ label: "Plan Your Visit", href: "/about" }}
        secondaryCTA={{ label: "View Products", href: "/products" }}
        rightImage="https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=600&q=80"
        rightImageAlt="Fresh Jamhul Berries"
      />

      {/* Gallery */}
      <section className="section-padding">
        <div className="container mx-auto px-4">
          {/* Filters */}
          <AnimatedSection>
            <div className="flex flex-wrap gap-2 mb-8">
              {categories.map((cat, i) => (
                <button key={cat.label} className={`rounded-xl px-5 py-2.5 text-xs font-button font-bold transition-all shadow-sm ${i === 0 ? "bg-primary text-white" : "bg-white border border-border text-foreground/70 hover:bg-primary hover:text-white hover:border-primary"}`}>
                  <span className="mr-1.5">{cat.icon}</span>{cat.label}
                </button>
              ))}
            </div>
          </AnimatedSection>

          {/* Masonry Grid */}
          <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
            {(items.length > 0 ? items : [
              { id: "1", images: [{ imagePath: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&q=80" }], title: "Sunrise at the Orchard", category: "Farm Life" },
              { id: "2", images: [{ imagePath: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=600&q=80" }], title: "Alphonso Mango Harvest", category: "Mangoes" },
              { id: "3", images: [{ imagePath: "https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=600&q=80" }], title: "Fresh Jamun Berries", category: "Jamun" },
              { id: "4", images: [{ imagePath: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80" }], title: "Our Farmers", category: "Farm Life" },
              { id: "5", images: [{ imagePath: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&q=80" }], title: "Green Fields", category: "Harvest" },
              { id: "6", images: [{ imagePath: "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=600&q=80" }], title: "Organic Farming", category: "Harvest" },
              { id: "7", images: [{ imagePath: "https://images.unsplash.com/photo-1629828874514-d53eeea7a101?w=600&q=80" }], title: "Kesar Mangoes", category: "Mangoes" },
              { id: "8", images: [{ imagePath: "https://images.unsplash.com/photo-1536677813196-8fed27bcecdc?w=600&q=80" }], title: "Farm Sunset", category: "Farm Life" },
              { id: "9", images: [{ imagePath: "https://images.unsplash.com/photo-1574180566232-6e1a7e3b6e5b?w=600&q=80" }], title: "Drone View", category: "Drone Shots" },
            ]).map((item, i) => (
              <AnimatedSection key={item.id} delay={i * 0.03}>
                <div className="group relative mb-4 break-inside-avoid rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer">
                  <img src={item.images[0]?.imagePath} alt={item.title || "Gallery"} className="w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    {item.title && <p className="text-sm font-heading font-bold text-white">{item.title}</p>}
                    {item.category && <p className="text-xs text-white/70 mt-0.5">{item.category}</p>}
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>

          {items.length === 0 && (
            <p className="mt-16 text-center text-muted-foreground">Gallery images will appear here soon!</p>
          )}
        </div>
      </section>
    </>
  );
}
