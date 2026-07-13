import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { EnquiryForm } from "./enquiry-form";

export const dynamic = "force-dynamic";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });

  if (!product) notFound();

  return (
    <div className="container mx-auto px-4 py-12">
      <Link
        href="/products"
        className="text-sm text-muted-foreground hover:text-primary transition-colors"
      >
        &larr; Back to Products
      </Link>
      <div className="mt-6 grid gap-8 md:grid-cols-2">
        <div className="aspect-square rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
          {product.images[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="h-full w-full object-cover rounded-lg"
            />
          ) : (
            <span>No image</span>
          )}
        </div>
        <div>
          <h1 className="text-3xl font-heading font-bold">{product.name}</h1>
          {product.price && (
            <p className="mt-2 text-xl text-primary font-semibold">
              ₹{product.price}
            </p>
          )}
          {product.description && (
            <p className="mt-4 text-muted-foreground leading-relaxed">
              {product.description}
            </p>
          )}
          {product.isSeasonal && product.season && (
            <p className="mt-4 text-sm text-accent font-medium">
              Seasonal: {product.season}
            </p>
          )}
          <div className="mt-8 rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-heading font-semibold">
              Enquire About This Product
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Fill in your details and we&apos;ll get back to you
            </p>
            <EnquiryForm productId={product.id} productName={product.name} />
          </div>
        </div>
      </div>
    </div>
  );
}
