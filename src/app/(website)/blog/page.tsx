import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const posts = await prisma.blogPost.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-heading font-bold">Blog</h1>
      <p className="mt-2 text-muted-foreground">
        Stories and updates from Bhole Farms
      </p>
      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/blog/${post.slug}`}
            className="group rounded-lg border border-border bg-card overflow-hidden transition-shadow hover:shadow-md"
          >
            {post.coverImage && (
              <div className="aspect-video bg-muted">
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            <div className="p-4">
              <h2 className="font-heading font-semibold group-hover:text-primary transition-colors">
                {post.title}
              </h2>
              {post.excerpt && (
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                  {post.excerpt}
                </p>
              )}
              <p className="mt-2 text-xs text-muted-foreground">
                {new Date(post.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </Link>
        ))}
      </div>
      {posts.length === 0 && (
        <p className="mt-12 text-center text-muted-foreground">
          No blog posts yet. Check back soon!
        </p>
      )}
    </div>
  );
}
