"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function createGalleryItem(formData: FormData) {
  const title = formData.get("title") as string;
  const image = formData.get("image") as string;
  const category = formData.get("category") as string;

  await prisma.galleryItem.create({
    data: {
      title,
      category,
      images: image ? { create: { imagePath: image } } : undefined,
    },
  });
  revalidatePath("/gallery");
  revalidatePath("/admin/gallery");
}

export async function deleteGalleryItem(id: string) {
  await prisma.galleryItem.delete({ where: { id } });
  revalidatePath("/gallery");
  revalidatePath("/admin/gallery");
}
