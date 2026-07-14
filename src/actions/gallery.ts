"use server";

import { prisma } from "@/lib/prisma";
import { revalidateGallery } from "@/lib/revalidation";

export async function createGalleryItem(formData: FormData) {
  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;
  const description = formData.get("description") as string;
  const category = formData.get("category") as string;
  const order = parseInt(formData.get("order") as string) || 0;
  const imagesData = formData.get("imagesData") as string;

  let images: { path: string }[] = [];
  try {
    if (imagesData) images = JSON.parse(imagesData);
  } catch {}

  await prisma.$transaction(async (tx) => {
    const item = await tx.galleryItem.create({
      data: { title, slug, description, category, order },
    });

    if (images.length > 0) {
      await tx.galleryImage.createMany({
        data: images.map((img, i) => ({
          galleryId: item.id,
          imagePath: img.path.startsWith("/") ? img.path.slice(1) : img.path,
          sortOrder: i,
        })),
      });
    }
  });

  revalidateGallery();
}

export async function updateGalleryItem(id: string, formData: FormData) {
  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;
  const description = formData.get("description") as string;
  const category = formData.get("category") as string;
  const order = parseInt(formData.get("order") as string) || 0;
  const imagesData = formData.get("imagesData") as string;

  let newImages: { id?: string; path: string }[] = [];
  try {
    if (imagesData) newImages = JSON.parse(imagesData);
  } catch {}

  await prisma.$transaction(async (tx) => {
    await tx.galleryItem.update({
      where: { id },
      data: { title, slug, description, category, order },
    });

    const existingImages = await tx.galleryImage.findMany({
      where: { galleryId: id },
      select: { id: true },
    });

    const keptImageIds = newImages.filter((img) => img.id).map((img) => img.id);
    const toDelete = existingImages.filter((img) => !keptImageIds.includes(img.id));
    if (toDelete.length > 0) {
      await tx.galleryImage.deleteMany({
        where: { id: { in: toDelete.map((img) => img.id) } },
      });
    }

    const newEntries = newImages.filter((img) => !img.id);
    if (newEntries.length > 0) {
      const maxOrder = existingImages.length > 0
        ? existingImages.length
        : 0;
      await tx.galleryImage.createMany({
        data: newEntries.map((img, i) => ({
          galleryId: id,
          imagePath: img.path.startsWith("/") ? img.path.slice(1) : img.path,
          sortOrder: maxOrder + i + 1,
        })),
      });
    }
  });

  revalidateGallery();
}

export async function deleteGalleryItem(id: string) {
  await prisma.galleryItem.delete({ where: { id } });
  revalidateGallery();
}
