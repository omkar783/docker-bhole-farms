"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { revalidateProduct } from "@/lib/revalidation";

export async function createProduct(formData: FormData) {
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const description = formData.get("description") as string;
  const shortDescription = formData.get("shortDescription") as string;
  const priceRaw = formData.get("price");
  const price = priceRaw ? parseFloat(priceRaw as string) : null;
  const categoryId = formData.get("categoryId") as string;
  const unit = (formData.get("unit") as string) || null;
  const sku = (formData.get("sku") as string) || null;
  const isFeatured = formData.get("isFeatured") === "on";
  const isSeasonal = formData.get("isSeasonal") === "on";
  const season = formData.get("season") as string;
  const stockRaw = formData.get("stock");
  const stock = stockRaw ? parseInt(stockRaw as string) : null;
  const imagesData = formData.get("imagesData") as string;

  let images: { path: string }[] = [];
  try {
    if (imagesData) images = JSON.parse(imagesData);
  } catch {}

  let productId: string | undefined;

  try {
    await prisma.$transaction(async (tx) => {
      // Check if slug is unique
      const existing = await tx.product.findUnique({
        where: { slug },
      });
      if (existing) {
        throw new Error("A product with this slug already exists.");
      }

      // Check if SKU is unique (if provided)
      if (sku) {
        const existingSku = await tx.product.findFirst({
          where: { sku },
        });
        if (existingSku) {
          throw new Error("A product with this SKU already exists.");
        }
      }

      const product = await tx.product.create({
        data: {
          name,
          slug,
          description,
          shortDescription,
          price,
          categoryId,
          unit: unit as any,
          sku,
          isFeatured,
          isSeasonal,
          season,
          stock,
          isActive: true,
        },
      });
      productId = product.id;

      if (images.length > 0) {
        const imageData = images.map((img, i) => ({
          productId: product.id,
          imagePath: img.path.startsWith("/") ? img.path : "/" + img.path,
          sortOrder: i,
          isThumbnail: i === 0,
        }));
        await tx.productImage.createMany({ data: imageData });
      }
    });
  } catch (error: any) {
    console.error("Error creating product:", error);
    return { error: error.message || "Failed to create product." };
  }

  revalidateProduct(slug);
  redirect("/admin/products");
}

export async function updateProduct(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const description = formData.get("description") as string;
  const shortDescription = formData.get("shortDescription") as string;
  const price = parseFloat(formData.get("price") as string) || null;
  const categoryId = formData.get("categoryId") as string;
  const unit = (formData.get("unit") as string) || null;
  const sku = (formData.get("sku") as string) || null;
  const isFeatured = formData.get("isFeatured") === "on";
  const isSeasonal = formData.get("isSeasonal") === "on";
  const season = formData.get("season") as string;
  const stock = parseInt(formData.get("stock") as string) || null;
  const isActive = formData.get("isActive") === "on";
  const imagesData = formData.get("imagesData") as string;

  let newImages: { id?: string; path: string }[] = [];
  try {
    if (imagesData) newImages = JSON.parse(imagesData);
  } catch {}

  try {
    await prisma.$transaction(async (tx) => {
      // Check if slug is unique for other products
      const existing = await tx.product.findFirst({
        where: {
          slug,
          id: { not: id },
        },
      });
      if (existing) {
        throw new Error("A product with this slug already exists.");
      }

      // Check if SKU is unique for other products (if provided)
      if (sku) {
        const existingSku = await tx.product.findFirst({
          where: {
            sku,
            id: { not: id },
          },
        });
        if (existingSku) {
          throw new Error("A product with this SKU already exists.");
        }
      }

      await tx.product.update({
        where: { id },
        data: {
          name,
          slug,
          description,
          shortDescription,
          price: price || null,
          categoryId,
          unit: unit as any,
          sku,
          isFeatured,
          isSeasonal,
          season,
          stock,
          isActive,
        },
      });

      const existingImages = await tx.productImage.findMany({
        where: { productId: id },
        select: { id: true, imagePath: true },
      });

      const keptImageIds = newImages.filter((img) => img.id).map((img) => img.id);
      const toDelete = existingImages.filter((img) => !keptImageIds.includes(img.id));
      if (toDelete.length > 0) {
        await tx.productImage.deleteMany({
          where: { id: { in: toDelete.map((img) => img.id) } },
        });
      }

      const newEntries = newImages.filter((img) => !img.id);
      if (newEntries.length > 0) {
        const maxOrder = existingImages.length > 0
          ? Math.max(...existingImages.map((img) => img.id === keptImageIds.find((k) => k === img.id) ? 0 : 0))
          : 0;
        await tx.productImage.createMany({
          data: newEntries.map((img, i) => ({
            productId: id,
            imagePath: img.path.startsWith("/") ? img.path : "/" + img.path,
            sortOrder: maxOrder + i + 1,
            isThumbnail: maxOrder + i === 0 && existingImages.length === 0,
          })),
        });
      }
    });
  } catch (error: any) {
    console.error("Error updating product:", error);
    return { error: error.message || "Failed to update product." };
  }

  revalidateProduct(slug);
  redirect("/admin/products");
}

export async function deleteProduct(id: string, formData?: FormData) {
  const force = formData?.get("force-delete") === "true";

  if (force) {
    await prisma.productImage.deleteMany({ where: { productId: id } });
    await prisma.product.delete({ where: { id } });
  } else {
    await prisma.product.update({
      where: { id },
      data: { isDeleted: true },
    });
  }

  revalidateProduct();
}

export async function toggleActive(id: string) {
  const product = await prisma.product.findUnique({ where: { id }, select: { isActive: true } });
  if (!product) throw new Error("Product not found");

  await prisma.product.update({
    where: { id },
    data: { isActive: !product.isActive },
  });

  revalidateProduct();
}
