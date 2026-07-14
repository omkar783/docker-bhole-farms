import { prisma } from "@/lib/prisma";
import { deleteGalleryItem } from "@/actions/gallery";
import GalleryForm from "./gallery-form";

export const dynamic = "force-dynamic";

export default async function AdminGalleryPage() {
  const items = await prisma.galleryItem.findMany({
    orderBy: { order: "asc" },
    include: { images: { orderBy: { sortOrder: "asc" } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-heading font-bold">Gallery</h1>
      </div>
      <GalleryForm />
      <div className="grid gap-4 md:grid-cols-3">
        {items.map((item) => (
          <div key={item.id} className="rounded-lg border border-border bg-card overflow-hidden">
            <img src={item.images[0]?.imagePath} alt={item.title || ""} className="aspect-square w-full object-cover" />
            <div className="p-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{item.title || "Untitled"}</p>
                {item.category && <p className="text-xs text-muted-foreground">{item.category}</p>}
              </div>
              <form action={deleteGalleryItem.bind(null, item.id)}>
                <button type="submit" className="text-xs text-destructive hover:underline">Delete</button>
              </form>
            </div>
          </div>
        ))}
      </div>
      {items.length === 0 && <p className="text-center text-muted-foreground">No gallery items yet.</p>}
    </div>
  );
}
