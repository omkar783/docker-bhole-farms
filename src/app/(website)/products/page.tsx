import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.category.findMany({ orderBy: { order: "asc" } }),
  ]);

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-heading font-bold">Our Products</h1>
      <p className="mt-2 text-muted-foreground">
        Fresh organic produce straight from our farm
      </p>

      {categories.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.slug}`}
              className="rounded-full border border-border px-4 py-1.5 text-sm text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      )}

      <div className="mt-8 grid gap-6 md:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.slug}`}
            className="group rounded-lg border border-border bg-card p-4 transition-shadow hover:shadow-md"
          >
            <div className="aspect-square rounded-md bg-muted flex items-center justify-center text-muted-foreground">
              {product.images[0] ? (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="h-full w-full object-cover rounded-md"
                />
              ) : (
                <span className="text-sm">No image</span>
              )}
            </div>
            <h3 className="mt-3 font-heading font-semibold group-hover:text-primary transition-colors">
              {product.name}
            </h3>
            {product.price && (
              <p className="text-sm text-muted-foreground">₹{product.price}</p>
            )}
          </Link>
        ))}
      </div>

      {products.length === 0 && (
        <p className="mt-12 text-center text-muted-foreground">
          No products available yet. Check back soon!
        </p>
      )}
    </div>
  );
}
