import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  const items = await prisma.galleryItem.findMany({
    orderBy: { order: "asc" },
  });

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-heading font-bold">Gallery</h1>
      <p className="mt-2 text-muted-foreground">
        A glimpse into life at Bhole Farms
      </p>
      <div className="mt-8 columns-1 gap-4 md:columns-2 lg:columns-3">
        {items.map((item) => (
          <div key={item.id} className="mb-4 break-inside-avoid">
            <div className="rounded-lg bg-muted overflow-hidden">
              <img
                src={item.image}
                alt={item.title || "Gallery image"}
                className="h-full w-full object-cover"
              />
              {item.title && (
                <div className="p-3">
                  <p className="text-sm font-medium">{item.title}</p>
                  {item.category && (
                    <p className="text-xs text-muted-foreground">
                      {item.category}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      {items.length === 0 && (
        <p className="mt-12 text-center text-muted-foreground">
          Gallery coming soon!
        </p>
      )}
    </div>
  );
}
