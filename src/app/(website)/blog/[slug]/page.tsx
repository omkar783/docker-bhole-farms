import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

interface BlogPostProps {
  params: Promise<{ slug: string }>;
}

export default async function BlogPostPage({ params }: BlogPostProps) {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({ where: { slug } });

  if (!post || !post.published) notFound();

  return (
    <article className="container mx-auto px-4 py-12">
      <Link
        href="/blog"
        className="text-sm text-muted-foreground hover:text-primary transition-colors"
      >
        &larr; Back to Blog
      </Link>
      <div className="mx-auto mt-6 max-w-3xl">
        {post.coverImage && (
          <div className="aspect-video rounded-lg bg-muted overflow-hidden">
            <img
              src={post.coverImage}
              alt={post.title}
              className="h-full w-full object-cover"
            />
          </div>
        )}
        <h1 className="mt-6 text-3xl font-heading font-bold">{post.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {new Date(post.createdAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
        <div className="mt-8 prose prose-gray max-w-none">
          {post.content.split("\n").map((paragraph, i) => (
            <p key={i} className="mb-4 leading-relaxed text-muted-foreground">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </article>
  );
}
