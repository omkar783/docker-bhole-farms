import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AnimatedSection } from "@/components/shared/animations";

export const dynamic = "force-dynamic";

interface BlogPostProps {
  params: Promise<{ slug: string }>;
}

export default async function BlogPostPage({ params }: BlogPostProps) {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({ where: { slug } });

  if (!post || !post.published) notFound();

  return (
    <>
      {/* Breadcrumb */}
      <div className="bg-muted/50 border-b border-border/40">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-primary transition-colors">Blog</Link>
            <span>/</span>
            <span className="text-foreground font-medium">{post.title}</span>
          </div>
        </div>
      </div>

      {/* Hero Image */}
      {post.coverImage && (
        <div className="relative h-[50vh] min-h-[300px] overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${post.coverImage})` }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </div>
      )}

      <article className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-3xl">
          <AnimatedSection>
            <div className="flex items-center gap-2 mb-4">
              <span className="rounded-lg bg-primary/10 px-3 py-1 text-xs font-button font-bold text-primary">From the Farm</span>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground">{new Date(post.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</span>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground">5 min read</span>
            </div>

            <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground leading-tight">{post.title}</h1>

            <div className="mt-6 flex items-center gap-4 pb-6 border-b border-border/40">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-base font-bold text-primary">BF</div>
              <div>
                <p className="text-sm font-semibold text-foreground">Bhole Farms</p>
                <p className="text-xs text-muted-foreground">Published on {new Date(post.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
              </div>
              {/* Share buttons */}
              <div className="ml-auto flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Share</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-primary hover:text-white cursor-pointer transition-all">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" /></svg>
                </span>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-sky-600 hover:text-white cursor-pointer transition-all">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </span>
              </div>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.1} className="mt-8 space-y-6 text-muted-foreground leading-relaxed">
            {post.content.split("\n").map((paragraph, i) => {
              if (!paragraph.trim()) return null;
              return <p key={i}>{paragraph}</p>;
            })}
          </AnimatedSection>

          {/* Back to Blog */}
          <div className="mt-12 flex items-center justify-between border-t border-border/40 pt-6">
            <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
              Back to Blog
            </Link>
          </div>
        </div>
      </article>
    </>
  );
}
