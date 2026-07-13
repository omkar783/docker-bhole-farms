import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [featuredProducts, latestPosts] = await Promise.all([
    prisma.product.findMany({ where: { isFeatured: true }, take: 6 }),
    prisma.blogPost.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
  ]);

  return (
    <>
      <section className="relative flex min-h-[70vh] items-center justify-center bg-gradient-to-b from-primary/10 to-background">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-heading font-bold text-primary md:text-6xl">
            Fresh from Our Farm to Your Table
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            100% organic produce grown with care in Maharashtra. Naturally
            fresh, naturally healthy.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/products"
              className="rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Browse Products
            </Link>
            <Link
              href="/contact"
              className="rounded-md border border-border bg-background px-6 py-3 text-sm font-medium text-foreground hover:bg-accent transition-colors"
            >
              Get in Touch
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-heading font-bold text-center">
            Featured Products
          </h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {featuredProducts.map((product) => (
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
                    <span className="text-sm">Image</span>
                  )}
                </div>
                <h3 className="mt-3 font-heading font-semibold group-hover:text-primary transition-colors">
                  {product.name}
                </h3>
                {product.price && (
                  <p className="text-sm text-muted-foreground">
                    ₹{product.price}
                  </p>
                )}
              </Link>
            ))}
          </div>
          {featuredProducts.length === 0 && (
            <p className="mt-8 text-center text-muted-foreground">
              No products yet. Check back soon!
            </p>
          )}
        </div>
      </section>

      <section className="bg-card py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-heading font-bold text-center">
            Our Story
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-center text-muted-foreground">
            Bhole Farms is a family-run organic farm nestled in the heart of
            Maharashtra. For generations, we have cultivated the land with
            respect for nature, producing fresh, chemical-free fruits,
            vegetables, and grains. We believe in farm-to-table transparency and
            bringing the goodness of pure, organic produce to your home.
          </p>
          <div className="mt-8 text-center">
            <Link
              href="/about"
              className="text-sm font-medium text-primary hover:underline"
            >
              Learn more about us
            </Link>
          </div>
        </div>
      </section>

      {latestPosts.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-heading font-bold text-center">
              From the Farm
            </h2>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {latestPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group rounded-lg border border-border bg-card p-4 transition-shadow hover:shadow-md"
                >
                  {post.coverImage && (
                    <div className="aspect-video rounded-md bg-muted flex items-center justify-center text-muted-foreground">
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        className="h-full w-full object-cover rounded-md"
                      />
                    </div>
                  )}
                  <h3 className="mt-3 font-heading font-semibold group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {post.excerpt}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
