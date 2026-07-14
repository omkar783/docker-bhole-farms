# Admin CMS & Media Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace URL-based image inputs with FilePond multi-upload, normalize product/gallery images into relational tables, and ensure full frontend synchronization.

**Architecture:** Prisma models with cascade-delete ProductImage/GalleryImage tables. FilePond client side. `POST /api/upload` with sharp-based WEBP conversion. `StorageService` abstraction for future cloud migration. Transaction-safe delete flow.

**Tech Stack:** react-filepond + filepond, sharp, uuid, Prisma, Next.js 16

## Global Constraints

- All uploaded files stored as WEBP
- Relative paths only in DB (e.g. `uploads/products/{id}/file.webp`)
- Temp folder for pre-save uploads: `public/uploads/temp/`
- UUID v4 filenames
- Max 5 MB per file, JPG/PNG/WEBP only
- Server-side validation always — never trust client
- `onDelete: Cascade` on all image foreign keys
- Transaction-safe delete: DB first, then filesystem
- All revalidation via centralized helpers in `src/lib/revalidation.ts`

---
## File Map

### New files
- `src/lib/storage.ts` — StorageService interface + LocalStorageService
- `src/lib/revalidation.ts` — Centralized revalidatePath helpers
- `src/components/FilePondUpload.tsx` — Reusable FilePond wrapper
- `src/components/ThumbnailPicker.tsx` — Thumbnail selection + image grid

### Modified files
- `prisma/schema.prisma` — Add ProductUnit enum, ProductImage, GalleryImage, GalleryItem models
- `package.json` — Add filepond, react-filepond, sharp, uuid
- `src/actions/products.ts` — Updated with image handling, transactional delete
- `src/actions/gallery.ts` — Updated with image handling, transactional delete
- `src/app/api/upload/route.ts` — Multi-file, validation, WEBP conversion via sharp
- `src/app/(admin)/admin/(protected)/products/product-form.tsx` — Full rewrite with FilePond
- `src/app/(admin)/admin/(protected)/products/page.tsx` — Thumbnails, search, filters
- `src/app/(admin)/admin/(protected)/products/new/page.tsx` — Simplified
- `src/app/(admin)/admin/(protected)/products/[id]/edit/page.tsx` — Pre-load images
- `src/app/(admin)/admin/(protected)/gallery/page.tsx` — Thumbnail list
- `src/app/(admin)/admin/(protected)/gallery/gallery-form.tsx` — Full rewrite with FilePond
- `src/app/(website)/page.tsx` — Updated product queries for ProductImage relation
- `src/app/(website)/products/page.tsx` — Updated queries
- `src/app/(website)/products/[slug]/page.tsx` — Updated queries + gallery display
- `src/app/(website)/gallery/page.tsx` — Updated for GalleryImage relation
- `src/app/(admin)/admin/(protected)/dashboard/page.tsx` — Updated counts
- `prisma/seed.ts` — Updated for new schema
- `src/app/(admin)/admin/(protected)/categories/page.tsx` — revalidation import update

---
### Task 1: Prisma Schema & Dependencies

**Files:**
- Modify: `prisma/schema.prisma`
- Modify: `package.json`

**Interfaces:**
- Consumes: nothing
- Produces: new Prisma models (ProductImage, GalleryItem, GalleryImage, ProductUnit enum)

- [ ] **Step 1: Install dependencies**

```bash
cd C:\Users\NKS-WIN-Omkar\Documents\bhole
npm install filepond react-filepond sharp uuid
npm install -D @types/uuid
```

- [ ] **Step 2: Update Prisma schema**

Replace the current `GalleryItem` model, update `Product`, and add new models:

```prisma
enum ProductUnit {
  KG
  GRAM
  DOZEN
  BOX
  PIECE
  LITER
  ML
  BUNDLE
}

model Product {
  id               String         @id @default(cuid())
  name             String
  slug             String         @unique
  description      String?        @db.Text
  shortDescription String?        @db.VarChar(250)

  categoryId       String
  category         Category       @relation(fields: [categoryId], references: [id])

  images           ProductImage[]

  price            Decimal?       @db.Decimal(10, 2)
  stock            Int            @default(0)
  unit             ProductUnit?
  sku              String?

  isFeatured       Boolean        @default(false)
  isSeasonal       Boolean        @default(false)
  isActive         Boolean        @default(true)
  isDeleted        Boolean        @default(false)

  season           String?

  orders           Order[]

  createdAt        DateTime       @default(now())
  updatedAt        DateTime       @updatedAt

  @@index([categoryId])
  @@index([isFeatured])
  @@index([isSeasonal])
  @@index([isActive])
  @@index([createdAt])
  @@index([price])
  @@index([stock])
}

model ProductImage {
  id          String   @id @default(cuid())
  productId   String
  product     Product  @relation(fields: [productId], references: [id], onDelete: Cascade)

  imagePath   String
  fileName    String?
  mimeType    String?
  fileSize    Int?
  width       Int?
  height      Int?
  altText     String?

  sortOrder   Int      @default(0)
  isThumbnail Boolean  @default(false)

  createdAt   DateTime @default(now())

  @@index([productId])
}

model GalleryItem {
  id          String         @id @default(cuid())
  title       String?
  slug        String?        @unique
  description String?
  category    String?

  images      GalleryImage[]

  order       Int            @default(0)

  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt
}

model GalleryImage {
  id          String       @id @default(cuid())
  galleryId   String
  gallery     GalleryItem  @relation(fields: [galleryId], references: [id], onDelete: Cascade)

  imagePath   String
  fileName    String?
  mimeType    String?
  fileSize    Int?
  width       Int?
  height      Int?
  altText     String?

  sortOrder   Int          @default(0)

  createdAt   DateTime     @default(now())

  @@index([galleryId])
}
```

Also remove the `images String[]` field from the current Product model since we now use ProductImage relation.

- [ ] **Step 3: Generate Prisma client & push schema**

```bash
cd C:\Users\NKS-WIN-Omkar\Documents\bhole
npx prisma generate
npx prisma db push
```

Expected output: Schema pushed, client generated to `src/generated/prisma/`

- [ ] **Step 4: Commit**

```bash
git add prisma/schema.prisma package.json src/generated/prisma/
git commit -m "feat: add ProductImage/GalleryImage models, install filepond/sharp/uuid"
```

---

### Task 2: StorageService

**Files:**
- Create: `src/lib/storage.ts`

**Interfaces:**
- Consumes: nothing
- Produces: `IStorageService`, `localStorageService` singleton

- [ ] **Step 1: Create StorageService interface and implementation**

`src/lib/storage.ts`:

```typescript
import { writeFile, mkdir, unlink, rename, access } from "node:fs/promises";
import path from "node:path";

export interface StorageService {
  save(buffer: Buffer, relativePath: string): Promise<string>;
  delete(relativePath: string): Promise<void>;
  move(sourceRelative: string, destRelative: string): Promise<string>;
  exists(relativePath: string): Promise<boolean>;
}

const UPLOAD_ROOT = path.join(process.cwd(), "public");

export const localStorageService: StorageService = {
  async save(buffer: Buffer, relativePath: string): Promise<string> {
    const absolutePath = path.join(UPLOAD_ROOT, relativePath);
    await mkdir(path.dirname(absolutePath), { recursive: true });
    await writeFile(absolutePath, buffer);
    return relativePath;
  },

  async delete(relativePath: string): Promise<void> {
    const absolutePath = path.join(UPLOAD_ROOT, relativePath);
    try {
      await unlink(absolutePath);
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
    }
  },

  async move(sourceRelative: string, destRelative: string): Promise<string> {
    const sourceAbs = path.join(UPLOAD_ROOT, sourceRelative);
    const destAbs = path.join(UPLOAD_ROOT, destRelative);
    await mkdir(path.dirname(destAbs), { recursive: true });
    await rename(sourceAbs, destAbs);
    return destRelative;
  },

  async exists(relativePath: string): Promise<boolean> {
    const absolutePath = path.join(UPLOAD_ROOT, relativePath);
    try {
      await access(absolutePath);
      return true;
    } catch {
      return false;
    }
  },
};
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/storage.ts
git commit -m "feat: add StorageService interface and local implementation"
```

---

### Task 3: Upload API

**Files:**
- Rewrite: `src/app/api/upload/route.ts`

**Interfaces:**
- Consumes: `localStorageService`, `sharp`
- Produces: `POST /api/upload` returning `{ success, files: [{ id, path, width, height, size, mimeType }] }`

- [ ] **Step 1: Rewrite upload API route**

`src/app/api/upload/route.ts`:

```typescript
import { NextResponse } from "next/server";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";
import { localStorageService } from "@/lib/storage";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const TARGET_DIR = "uploads/temp";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files[]") as File[];
    const target = (formData.get("target") as string) || "temp";

    if (!files || files.length === 0) {
      return NextResponse.json({ success: false, error: "No files provided" }, { status: 400 });
    }

    const results: { id: string; path: string; width: number; height: number; size: number; mimeType: string }[] = [];

    for (const file of files) {
      // Validate MIME type
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          { success: false, error: `Invalid file type: ${file.type}. Allowed: JPG, PNG, WEBP` },
          { status: 400 }
        );
      }

      // Validate extension
      const ext = file.name.toLowerCase().slice(file.name.lastIndexOf("."));
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        return NextResponse.json(
          { success: false, error: `Invalid extension: ${ext}` },
          { status: 400 }
        );
      }

      // Validate size
      if (file.size > MAX_SIZE) {
        return NextResponse.json(
          { success: false, error: `File too large: ${file.name}. Max 5 MB` },
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      const inputBuffer = Buffer.from(bytes);

      // Convert to WEBP, strip metadata, resize if needed
      const processed = await sharp(inputBuffer)
        .webp({ quality: 80 })
        .toBuffer();

      const metadata = await sharp(processed).metadata();

      const uuid = uuidv4();
      const filename = `${uuid}.webp`;
      const relativePath = target === "temp"
        ? `uploads/temp/${filename}`
        : `uploads/${target}/${filename}`;

      await localStorageService.save(processed, relativePath);

      results.push({
        id: uuid,
        path: `/${relativePath}`,
        width: metadata.width || 0,
        height: metadata.height || 0,
        size: processed.length,
        mimeType: "image/webp",
      });
    }

    return NextResponse.json({ success: true, files: results });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Upload failed" },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/upload/route.ts
git commit -m "feat: rewrite upload API with multi-file, sharp conversion, validation"
```

---

### Task 4: Revalidation Helpers

**Files:**
- Create: `src/lib/revalidation.ts`

**Interfaces:**
- Consumes: nothing
- Produces: `revalidateProduct()`, `revalidateGallery()`, `revalidateHomepage()`, `revalidateCategories()`

- [ ] **Step 1: Create revalidation helpers**

`src/lib/revalidation.ts`:

```typescript
import { revalidatePath } from "next/cache";

export function revalidateProduct(slug?: string) {
  revalidatePath("/");
  revalidatePath("/products");
  if (slug) revalidatePath(`/products/${slug}`);
  revalidatePath("/admin/products");
}

export function revalidateGallery() {
  revalidatePath("/");
  revalidatePath("/gallery");
  revalidatePath("/admin/gallery");
}

export function revalidateHomepage() {
  revalidatePath("/");
}

export function revalidateCategories() {
  revalidatePath("/products");
  revalidatePath("/admin/categories");
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/revalidation.ts
git commit -m "feat: add centralized revalidation helpers"
```

---

### Task 5: FilePondUpload Component

**Files:**
- Create: `src/components/FilePondUpload.tsx`

**Interfaces:**
- Consumes: nothing
- Produces: `<FilePondUpload>` component

- [ ] **Step 1: Create FilePondUpload component**

`src/components/FilePondUpload.tsx`:

```tsx
"use client";

import { useState, useCallback, useEffect } from "react";
import { FilePond, registerPlugin } from "react-filepond";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import FilePondPluginFileValidateSize from "filepond-plugin-file-validate-size";
import "filepond/dist/filepond.min.css";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";

registerPlugin(FilePondPluginImagePreview, FilePondPluginFileValidateType, FilePondPluginFileValidateSize);

interface UploadedFile {
  id: string;
  path: string;
  width: number;
  height: number;
  size: number;
  mimeType: string;
  isExisting?: boolean;
}

interface FilePondUploadProps {
  existingImages?: { path: string; id?: string }[];
  onFilesChange: (files: UploadedFile[]) => void;
  maxFiles?: number;
  label?: string;
}

export default function FilePondUpload({
  existingImages = [],
  onFilesChange,
  maxFiles = 10,
  label = "Images",
}: FilePondUploadProps) {
  const [files, setFiles] = useState<any[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  // Load existing images on mount
  useEffect(() => {
    if (existingImages.length > 0) {
      const initialPondFiles = existingImages.map((img) => ({
        source: img.path,
        options: {
          type: "local" as const,
          file: {
            name: img.path.split("/").pop() || "",
            size: 0,
            type: "image/webp",
          },
          metadata: { id: img.id },
        },
      }));
      setFiles(initialPondFiles);

      const initialUploaded = existingImages.map((img, i) => ({
        id: img.id || `existing-${i}`,
        path: img.path,
        width: 0,
        height: 0,
        size: 0,
        mimeType: "image/webp",
        isExisting: true,
      }));
      setUploadedFiles(initialUploaded);
      onFilesChange(initialUploaded);
    }
  }, []);

  const handleUpdateFileItems = useCallback(
    (fileItems: any[]) => {
      setFiles(fileItems);

      const current: UploadedFile[] = [];
      for (const item of fileItems) {
        if (item.serverId) {
          // Newly uploaded via API
          try {
            const parsed = JSON.parse(item.serverId);
            current.push({ ...parsed, isExisting: false });
          } catch {
            // ignore
          }
        } else if (item.file && item.filename) {
          // Local existing
          const existing = uploadedFiles.find(
            (u) => u.path.endsWith(item.filename as string)
          );
          if (existing) current.push(existing);
        }
      }
      setUploadedFiles(current);
      onFilesChange(current);
    },
    [uploadedFiles, onFilesChange]
  );

  const serverConfig = {
    url: "/api/upload",
    process: {
      url: "/api/upload",
      method: "POST",
      withCredentials: false,
      onload: (response: string) => response,
      onerror: (response: string) => response,
    },
    revert: null,
    restore: null,
    load: null,
    fetch: null,
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <FilePond
        files={files}
        allowMultiple={true}
        maxFiles={maxFiles}
        acceptedFileTypes={["image/jpeg", "image/png", "image/webp"]}
        labelFileTypeNotAllowed="Only JPG, PNG, and WEBP files are allowed"
        maxFileSize="5MB"
        labelMaxFileSizeExceeded="File is too large. Maximum size is 5MB."
        allowReorder={true}
        instantUpload={true}
        server={serverConfig}
        onupdatefiles={handleUpdateFileItems}
        name="files[]"
        credits={false}
      />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/FilePondUpload.tsx
git commit -m "feat: add reusable FilePondUpload component"
```

---

### Task 6: ThumbnailPicker Component

**Files:**
- Create: `src/components/ThumbnailPicker.tsx`

**Interfaces:**
- Consumes: `UploadedFile[]` from FilePondUpload
- Produces: `<ThumbnailPicker>` component

- [ ] **Step 1: Create ThumbnailPicker component**

`src/components/ThumbnailPicker.tsx`:

```tsx
"use client";

interface ImageItem {
  id: string;
  path: string;
  isExisting?: boolean;
}

interface ThumbnailPickerProps {
  images: ImageItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function ThumbnailPicker({ images, selectedId, onSelect }: ThumbnailPickerProps) {
  if (images.length === 0) return null;

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Thumbnail</label>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
        {images.map((img, i) => (
          <button
            key={img.id || i}
            type="button"
            onClick={() => onSelect(img.id)}
            className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
              selectedId === img.id
                ? "border-primary ring-2 ring-primary/30 shadow-md"
                : "border-border hover:border-primary/50"
            }`}
          >
            <img
              src={img.path}
              alt=""
              className="h-full w-full object-cover"
            />
            {selectedId === img.id && (
              <div className="absolute top-1 right-1 bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                ✓
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-1">
              <span className="text-[10px] text-white font-medium">
                {i === 0 && !selectedId ? "Auto" : selectedId === img.id ? "Thumbnail" : `Image ${i + 1}`}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ThumbnailPicker.tsx
git commit -m "feat: add ThumbnailPicker component for thumbnail selection"
```

---

### Task 7: Product Server Actions

**Files:**
- Rewrite: `src/actions/products.ts`

**Interfaces:**
- Consumes: `prisma`, `localStorageService`
- Produces: `createProduct()`, `updateProduct()`, `deleteProduct()`

- [ ] **Step 1: Rewrite createProduct**

Replace `src/actions/products.ts`:

```typescript
"use server";

import { prisma } from "@/lib/prisma";
import { localStorageService } from "@/lib/storage";
import { revalidateProduct } from "@/lib/revalidation";
import { v4 as uuidv4 } from "uuid";

export async function createProduct(formData: FormData) {
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const description = formData.get("description") as string;
  const shortDescription = formData.get("shortDescription") as string;
  const price = formData.get("price") ? parseFloat(formData.get("price") as string) : null;
  const categoryId = formData.get("categoryId") as string;
  const unit = formData.get("unit") as string || null;
  const stock = parseInt(formData.get("stock") as string) || 0;
  const isFeatured = formData.get("isFeatured") === "on";
  const isSeasonal = formData.get("isSeasonal") === "on";
  const isActive = formData.get("isActive") === "on";
  const season = formData.get("season") as string;
  const imagesJson = formData.get("images") as string;

  const product = await prisma.$transaction(async (tx) => {
    const created = await tx.product.create({
      data: { name, slug, description, shortDescription, price, categoryId, unit: unit as any, stock, isFeatured, isSeasonal, isActive, season },
    });

    if (imagesJson) {
      const images: { id: string; path: string }[] = JSON.parse(imagesJson);
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        const uuid = uuidv4();
        const newPath = `uploads/products/${created.id}/${uuid}.webp`;

        // Move from temp to product folder
        const tempPath = img.path.replace(/^\//, "");
        await localStorageService.move(tempPath, newPath);

        await tx.productImage.create({
          data: {
            productId: created.id,
            imagePath: `/${newPath}`,
            sortOrder: i,
            isThumbnail: i === 0,
          },
        });
      }
    }

    return created;
  });

  revalidateProduct(slug);
  return product;
}

export async function updateProduct(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const description = formData.get("description") as string;
  const shortDescription = formData.get("shortDescription") as string;
  const price = formData.get("price") ? parseFloat(formData.get("price") as string) : null;
  const categoryId = formData.get("categoryId") as string;
  const unit = formData.get("unit") as string || null;
  const stock = parseInt(formData.get("stock") as string) || 0;
  const isFeatured = formData.get("isFeatured") === "on";
  const isSeasonal = formData.get("isSeasonal") === "on";
  const isActive = formData.get("isActive") === "on";
  const season = formData.get("season") as string;
  const thumbnailId = formData.get("thumbnailId") as string;
  const imagesJson = formData.get("images") as string;
  const removedJson = formData.get("removedImages") as string;

  await prisma.$transaction(async (tx) => {
    await tx.product.update({
      where: { id },
      data: { name, slug, description, shortDescription, price, categoryId, unit: unit as any, stock, isFeatured, isSeasonal, isActive, season },
    });

    // Handle removed images
    if (removedJson) {
      const removed: string[] = JSON.parse(removedJson);
      for (const imgId of removed) {
        const imageRecord = await tx.productImage.findUnique({ where: { id: imgId } });
        if (imageRecord) {
          await tx.productImage.delete({ where: { id: imgId } });
          try {
            await localStorageService.delete(imageRecord.imagePath.replace(/^\//, ""));
          } catch {
            console.error(`Failed to delete file: ${imageRecord.imagePath}`);
          }
        }
      }
    }

    // Handle new images
    if (imagesJson) {
      const newImages: { id: string; path: string }[] = JSON.parse(imagesJson);
      const currentCount = await tx.productImage.count({ where: { productId: id } });
      for (let i = 0; i < newImages.length; i++) {
        const img = newImages[i];
        const uuid = uuidv4();
        const newPath = `uploads/products/${id}/${uuid}.webp`;
        const tempPath = img.path.replace(/^\//, "");
        await localStorageService.move(tempPath, newPath);
        await tx.productImage.create({
          data: {
            productId: id,
            imagePath: `/${newPath}`,
            sortOrder: currentCount + i,
            isThumbnail: false,
          },
        });
      }
    }

    // Update thumbnail
    if (thumbnailId) {
      await tx.productImage.updateMany({
        where: { productId: id },
        data: { isThumbnail: false },
      });
      await tx.productImage.update({
        where: { id: thumbnailId },
        data: { isThumbnail: true },
      });
    }
  });

  revalidateProduct(slug);
}

export async function deleteProduct(id: string) {
  // Read paths before deleting records
  const images = await prisma.productImage.findMany({ where: { productId: id } });
  const paths = images.map((img) => img.imagePath.replace(/^\//, ""));

  await prisma.$transaction(async (tx) => {
    await tx.productImage.deleteMany({ where: { productId: id } });
    await tx.product.delete({ where: { id } });
  });

  // Delete files after successful DB transaction
  for (const p of paths) {
    try {
      await localStorageService.delete(p);
    } catch {
      console.error(`Failed to delete orphaned file: ${p}`);
    }
  }

  revalidateProduct();
}
```

- [ ] **Step 2: Commit**

```bash
git add src/actions/products.ts
git commit -m "feat: rewrite product actions with transactional image handling"
```

---

### Task 8: Product List Page

**Files:**
- Rewrite: `src/app/(admin)/admin/(protected)/products/page.tsx`

- [ ] **Step 1: Rewrite product list with search, filters, thumbnails**

`src/app/(admin)/admin/(protected)/products/page.tsx`:

```tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deleteProduct } from "@/actions/products";
import ProductListClient from "./product-list-client";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      include: { category: true, images: { orderBy: { sortOrder: "asc" } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({ orderBy: { order: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-heading font-bold">Products</h1>
        <Link
          href="/admin/products/new"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Add Product
        </Link>
      </div>
      <ProductListClient products={products} categories={categories} />
    </div>
  );
}
```

`src/app/(admin)/admin/(protected)/products/product-list-client.tsx`:

```tsx
"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { deleteProduct } from "@/actions/products";

interface ProductWithImages {
  id: string;
  name: string;
  slug: string;
  price: { toString(): string } | null;
  stock: number;
  unit: string | null;
  isFeatured: boolean;
  isActive: boolean;
  createdAt: Date;
  category: { name: string };
  images: { imagePath: string; isThumbnail: boolean }[];
}

interface Props {
  products: ProductWithImages[];
  categories: { id: string; name: string }[];
}

export default function ProductListClient({ products, categories }: Props) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [featuredFilter, setFeaturedFilter] = useState("all");
  const [activeFilter, setActiveFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"name" | "price" | "createdAt">("createdAt");
  const [page, setPage] = useState(1);
  const perPage = 15;

  const filtered = useMemo(() => {
    let list = [...products];

    if (search) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q));
    }
    if (categoryFilter !== "all") {
      list = list.filter((p) => p.category.name === categoryFilter);
    }
    if (featuredFilter !== "all") {
      list = list.filter((p) => p.isFeatured === (featuredFilter === "featured"));
    }
    if (activeFilter !== "all") {
      list = list.filter((p) => p.isActive === (activeFilter === "active"));
    }

    list.sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "price") return (a.price || 0) > (b.price || 0) ? 1 : -1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return list;
  }, [products, search, categoryFilter, featuredFilter, activeFilter, sortBy]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  function getThumbnail(p: ProductWithImages) {
    const thumb = p.images.find((i) => i.isThumbnail) || p.images[0];
    return thumb?.imagePath || null;
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm w-48"
        />
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-2 text-sm">
          <option value="all">All Categories</option>
          {categories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
        </select>
        <select value={featuredFilter} onChange={(e) => setFeaturedFilter(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-2 text-sm">
          <option value="all">All</option>
          <option value="featured">Featured</option>
          <option value="non-featured">Non-Featured</option>
        </select>
        <select value={activeFilter} onChange={(e) => setActiveFilter(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-2 text-sm">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}
          className="h-9 rounded-md border border-input bg-background px-2 text-sm">
          <option value="createdAt">Newest</option>
          <option value="name">Name</option>
          <option value="price">Price</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium w-14">Image</th>
              <th className="px-4 py-3 text-left font-medium">Name</th>
              <th className="px-4 py-3 text-left font-medium">Category</th>
              <th className="px-4 py-3 text-left font-medium">Price</th>
              <th className="px-4 py-3 text-left font-medium">Unit</th>
              <th className="px-4 py-3 text-left font-medium">Stock</th>
              <th className="px-4 py-3 text-left font-medium">Featured</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((p) => {
              const thumb = getThumbnail(p);
              return (
                <tr key={p.id} className="border-b border-border">
                  <td className="px-4 py-2">
                    {thumb ? (
                      <img src={thumb} alt="" className="h-10 w-10 rounded object-cover" />
                    ) : (
                      <div className="h-10 w-10 rounded bg-muted flex items-center justify-center text-muted-foreground text-xs">🌿</div>
                    )}
                  </td>
                  <td className="px-4 py-2 font-medium">{p.name}</td>
                  <td className="px-4 py-2 text-muted-foreground">{p.category.name}</td>
                  <td className="px-4 py-2">{p.price ? `₹${p.price}` : "-"}</td>
                  <td className="px-4 py-2 text-muted-foreground">{p.unit || "-"}</td>
                  <td className="px-4 py-2">{p.stock}</td>
                  <td className="px-4 py-2">{p.isFeatured ? <span className="text-primary font-medium">Yes</span> : "No"}</td>
                  <td className="px-4 py-2">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${p.isActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                      {p.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <Link href={`/admin/products/${p.id}/edit`} className="text-primary hover:underline mr-3">Edit</Link>
                    <form action={deleteProduct.bind(null, p.id)} className="inline"
                      onSubmit={(e) => { if (!confirm("Delete this product?")) e.preventDefault(); }}>
                      <button type="submit" className="text-destructive hover:underline">Delete</button>
                    </form>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {paginated.length === 0 && <p className="p-4 text-center text-muted-foreground">No products found.</p>}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)}
            className="rounded border border-border px-3 py-1 text-sm disabled:opacity-50">Prev</button>
          <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}
            className="rounded border border-border px-3 py-1 text-sm disabled:opacity-50">Next</button>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/\(admin\)/admin/\(protected\)/products/page.tsx src/app/\(admin\)/admin/\(protected\)/products/product-list-client.tsx
git commit -m "feat: update product list with thumbnails, search, filters, pagination"
```

---

### Task 9: Product New & Edit Pages

**Files:**
- Rewrite: `src/app/(admin)/admin/(protected)/products/new/page.tsx`
- Rewrite: `src/app/(admin)/admin/(protected)/products/product-form.tsx`
- Rewrite: `src/app/(admin)/admin/(protected)/products/[id]/edit/page.tsx`

- [ ] **Step 1: Rewrite product form with FilePond and sections**

`src/app/(admin)/admin/(protected)/products/product-form.tsx`:

```tsx
"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import FilePondUpload from "@/components/FilePondUpload";
import ThumbnailPicker from "@/components/ThumbnailPicker";
import { createProduct, updateProduct } from "@/actions/products";
import { toast } from "sonner";

interface Category { id: string; name: string }
interface ProductImageData { id: string; imagePath: string; isThumbnail: boolean; sortOrder: number }

interface ProductFormProps {
  categories: Category[];
  productId?: string;
  defaultValues?: {
    name?: string; slug?: string; description?: string | null; shortDescription?: string | null;
    price?: number | null; categoryId?: string; unit?: string | null; stock?: number;
    isFeatured?: boolean; isSeasonal?: boolean; isActive?: boolean; season?: string | null;
    images?: ProductImageData[];
  };
}

export default function ProductForm({ categories, productId, defaultValues }: ProductFormProps) {
  const isEdit = !!productId;
  const action = productId ? updateProduct.bind(null, productId) : createProduct;

  const [images, setImages] = useState<{ id: string; path: string; isExisting?: boolean }[]>([]);
  const [thumbnailId, setThumbnailId] = useState<string | null>(null);
  const [removedIds, setRemovedIds] = useState<string[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  // Load existing images
  useEffect(() => {
    if (defaultValues?.images && defaultValues.images.length > 0) {
      const loaded = defaultValues.images
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((img) => ({
          id: img.id,
          path: img.imagePath,
          isExisting: true,
        }));
      setImages(loaded);
      const thumb = defaultValues.images.find((i) => i.isThumbnail);
      setThumbnailId(thumb?.id || loaded[0]?.id || null);
    }
  }, []);

  const handleImagesChange = useCallback((newImages: { id: string; path: string; isExisting?: boolean }[]) => {
    setImages(newImages);
    setHasChanges(true);
    // Auto-select thumbnail if not set
    if (!thumbnailId && newImages.length > 0) {
      setThumbnailId(newImages[0].id);
    }
  }, [thumbnailId]);

  const [, formAction, pending] = useActionState(
    async (_prev: unknown, formData: FormData) => {
      // Add image data to form
      const newImages = images.filter((i) => !i.isExisting);
      formData.append("images", JSON.stringify(newImages.map((i) => ({ id: i.id, path: i.path }))));
      if (removedIds.length > 0) formData.append("removedImages", JSON.stringify(removedIds));
      if (thumbnailId) formData.append("thumbnailId", thumbnailId);

      try {
        await action(formData);
        toast.success(isEdit ? "Product updated" : "Product created");
        setHasChanges(false);
      } catch {
        toast.error("Failed to save product");
      }
    },
    undefined
  );

  // Warn on unsaved changes
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (hasChanges) e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [hasChanges]);

  const removeExistingImage = (imgId: string) => {
    setRemovedIds((prev) => [...prev, imgId]);
    setImages((prev) => prev.filter((i) => i.id !== imgId));
    if (thumbnailId === imgId) {
      const remaining = images.filter((i) => i.id !== imgId);
      setThumbnailId(remaining[0]?.id || null);
    }
  };

  return (
    <form action={formAction} className="max-w-3xl space-y-6">
      {/* General Information */}
      <div className="rounded-lg border border-border bg-card p-6 space-y-4">
        <h2 className="font-heading font-bold text-lg">General Information</h2>
        <div className="space-y-2">
          <Label htmlFor="name">Product Name</Label>
          <Input id="name" name="name" defaultValue={defaultValues?.name || ""} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" name="slug" defaultValue={defaultValues?.slug || ""} required placeholder="Auto-generated from name" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="shortDescription">Short Description</Label>
          <Input id="shortDescription" name="shortDescription" defaultValue={defaultValues?.shortDescription || ""} maxLength={250} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Full Description</Label>
          <Textarea id="description" name="description" defaultValue={defaultValues?.description || ""} rows={5} />
        </div>
      </div>

      {/* Pricing & Inventory */}
      <div className="rounded-lg border border-border bg-card p-6 space-y-4">
        <h2 className="font-heading font-bold text-lg">Pricing &amp; Inventory</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="price">Price (₹)</Label>
            <Input id="price" name="price" type="number" step="0.01" defaultValue={defaultValues?.price?.toString() || ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="unit">Unit</Label>
            <select id="unit" name="unit" defaultValue={defaultValues?.unit || ""}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="">Select unit</option>
              {["KG","GRAM","DOZEN","BOX","PIECE","LITER","ML","BUNDLE"].map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="stock">Stock</Label>
            <Input id="stock" name="stock" type="number" defaultValue={defaultValues?.stock?.toString() || "0"} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sku">SKU</Label>
            <Input id="sku" name="sku" defaultValue="" />
          </div>
        </div>
      </div>

      {/* Category */}
      <div className="rounded-lg border border-border bg-card p-6 space-y-4">
        <h2 className="font-heading font-bold text-lg">Category</h2>
        <div className="space-y-2">
          <Label htmlFor="categoryId">Category</Label>
          <select id="categoryId" name="categoryId" defaultValue={defaultValues?.categoryId || ""}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required>
            <option value="" disabled>Select category</option>
            {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
          </select>
        </div>
      </div>

      {/* Product Status */}
      <div className="rounded-lg border border-border bg-card p-6 space-y-4">
        <h2 className="font-heading font-bold text-lg">Product Status</h2>
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="isFeatured" defaultChecked={defaultValues?.isFeatured} /> Featured
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="isSeasonal" defaultChecked={defaultValues?.isSeasonal} /> Seasonal
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="isActive" defaultChecked={defaultValues?.isActive ?? true} /> Active
          </label>
        </div>
        <div className="space-y-2">
          <Label htmlFor="season">Season</Label>
          <Input id="season" name="season" defaultValue={defaultValues?.season || ""} placeholder="e.g., Summer, Monsoon" />
        </div>
      </div>

      {/* Images */}
      <div className="rounded-lg border border-border bg-card p-6 space-y-4">
        <h2 className="font-heading font-bold text-lg">Images</h2>
        <FilePondUpload
          existingImages={defaultValues?.images?.map((i) => ({ path: i.imagePath, id: i.id })) || []}
          onFilesChange={handleImagesChange}
          maxFiles={10}
          label="Product Images"
        />
        {images.length > 0 && (
          <ThumbnailPicker
            images={images}
            selectedId={thumbnailId}
            onSelect={setThumbnailId}
          />
        )}
        {images.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Manage Images</label>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {images.map((img) => (
                <div key={img.id} className="relative group aspect-square rounded-lg overflow-hidden border border-border">
                  <img src={img.path} alt="" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                    {img.isExisting && (
                      <button type="button" onClick={() => removeExistingImage(img.id)}
                        className="bg-destructive text-white rounded p-1 text-xs">Delete</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Submit */}
      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : isEdit ? "Update Product" : "Create Product"}
        </Button>
      </div>
    </form>
  );
}
```

- [ ] **Step 2: Rewrite new page**

`src/app/(admin)/admin/(protected)/products/new/page.tsx`:

```tsx
import { prisma } from "@/lib/prisma";
import ProductForm from "../product-form";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({ orderBy: { order: "asc" } });
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-heading font-bold">New Product</h1>
      <ProductForm categories={categories} />
    </div>
  );
}
```

- [ ] **Step 3: Rewrite edit page**

`src/app/(admin)/admin/(protected)/products/[id]/edit/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductForm from "../../product-form";

export const dynamic = "force-dynamic";

interface Props { params: Promise<{ id: string }> }

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: { images: { orderBy: { sortOrder: "asc" } } },
    }),
    prisma.category.findMany({ orderBy: { order: "asc" } }),
  ]);
  if (!product) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-heading font-bold">Edit: {product.name}</h1>
      <ProductForm
        productId={id}
        categories={categories}
        defaultValues={{
          name: product.name,
          slug: product.slug,
          description: product.description,
          shortDescription: product.shortDescription,
          price: product.price ? Number(product.price) : null,
          categoryId: product.categoryId,
          unit: product.unit,
          stock: product.stock,
          isFeatured: product.isFeatured,
          isSeasonal: product.isSeasonal,
          isActive: product.isActive,
          season: product.season,
          images: product.images,
        }}
      />
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/\(admin\)/admin/\(protected\)/products/product-form.tsx src/app/\(admin\)/admin/\(protected\)/products/new/page.tsx src/app/\(admin\)/admin/\(protected\)/products/\[id\]/edit/page.tsx
git commit -m "feat: rewrite product form with FilePond, thumbnail picker, edit support"
```

---

### Task 10: Gallery Server Actions

**Files:**
- Rewrite: `src/actions/gallery.ts`

- [ ] **Step 1: Rewrite gallery actions**

`src/actions/gallery.ts`:

```typescript
"use server";

import { prisma } from "@/lib/prisma";
import { localStorageService } from "@/lib/storage";
import { revalidateGallery } from "@/lib/revalidation";
import { v4 as uuidv4 } from "uuid";

export async function createGalleryItem(formData: FormData) {
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const category = formData.get("category") as string;
  const imagesJson = formData.get("images") as string;

  await prisma.$transaction(async (tx) => {
    const item = await tx.galleryItem.create({
      data: { title, description, category },
    });

    if (imagesJson) {
      const images: { id: string; path: string }[] = JSON.parse(imagesJson);
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        const uuid = uuidv4();
        const newPath = `uploads/gallery/${item.id}/${uuid}.webp`;
        const tempPath = img.path.replace(/^\//, "");
        await localStorageService.move(tempPath, newPath);
        await tx.galleryImage.create({
          data: { galleryId: item.id, imagePath: `/${newPath}`, sortOrder: i },
        });
      }
    }
  });

  revalidateGallery();
}

export async function updateGalleryItem(id: string, formData: FormData) {
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const category = formData.get("category") as string;
  const imagesJson = formData.get("images") as string;
  const removedJson = formData.get("removedImages") as string;

  await prisma.$transaction(async (tx) => {
    await tx.galleryItem.update({
      where: { id },
      data: { title, description, category },
    });

    if (removedJson) {
      const removed: string[] = JSON.parse(removedJson);
      for (const imgId of removed) {
        const img = await tx.galleryImage.findUnique({ where: { id: imgId } });
        if (img) {
          await tx.galleryImage.delete({ where: { id: imgId } });
          try { await localStorageService.delete(img.imagePath.replace(/^\//, "")); }
          catch { console.error(`Failed to delete: ${img.imagePath}`); }
        }
      }
    }

    if (imagesJson) {
      const newImages: { id: string; path: string }[] = JSON.parse(imagesJson);
      const count = await tx.galleryImage.count({ where: { galleryId: id } });
      for (let i = 0; i < newImages.length; i++) {
        const img = newImages[i];
        const uuid = uuidv4();
        const newPath = `uploads/gallery/${id}/${uuid}.webp`;
        await localStorageService.move(img.path.replace(/^\//, ""), newPath);
        await tx.galleryImage.create({
          data: { galleryId: id, imagePath: `/${newPath}`, sortOrder: count + i },
        });
      }
    }
  });

  revalidateGallery();
}

export async function deleteGalleryItem(id: string) {
  const images = await prisma.galleryImage.findMany({ where: { galleryId: id } });
  const paths = images.map((i) => i.imagePath.replace(/^\//, ""));

  await prisma.$transaction(async (tx) => {
    await tx.galleryImage.deleteMany({ where: { galleryId: id } });
    await tx.galleryItem.delete({ where: { id } });
  });

  for (const p of paths) {
    try { await localStorageService.delete(p); }
    catch { console.error(`Failed to delete: ${p}`); }
  }

  revalidateGallery();
}
```

- [ ] **Step 2: Commit**

```bash
git add src/actions/gallery.ts
git commit -m "feat: rewrite gallery actions with transactional image handling"
```

---

### Task 11: Gallery Admin Pages

**Files:**
- Rewrite: `src/app/(admin)/admin/(protected)/gallery/page.tsx`
- Rewrite: `src/app/(admin)/admin/(protected)/gallery/gallery-form.tsx`

- [ ] **Step 1: Rewrite gallery list page**

`src/app/(admin)/admin/(protected)/gallery/page.tsx`:

```tsx
import { prisma } from "@/lib/prisma";
import { deleteGalleryItem } from "@/actions/gallery";
import { GalleryForm } from "./gallery-form";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminGalleryPage() {
  const items = await prisma.galleryItem.findMany({
    include: { images: { orderBy: { sortOrder: "asc" } } },
    orderBy: { order: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-heading font-bold">Gallery</h1>
      </div>
      <GalleryForm />
      {items.length === 0 && <p className="text-center text-muted-foreground py-8">No gallery items yet.</p>}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <div key={item.id} className="rounded-lg border border-border bg-card overflow-hidden">
            <div className="aspect-video bg-muted">
              {item.images[0] ? (
                <img src={item.images[0].imagePath} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground text-2xl">🖼️</div>
              )}
            </div>
            <div className="p-4 space-y-1">
              <p className="font-medium text-sm">{item.title || "Untitled"}</p>
              <p className="text-xs text-muted-foreground">{item.category || "No category"} · {item.images.length} images</p>
              <div className="flex gap-2 pt-2">
                <form action={deleteGalleryItem.bind(null, item.id)}
                  onSubmit={(e) => { if (!confirm("Delete this gallery item?")) e.preventDefault(); }}>
                  <button type="submit" className="text-xs text-destructive hover:underline">Delete</button>
                </form>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Rewrite gallery form with FilePond**

`src/app/(admin)/admin/(protected)/gallery/gallery-form.tsx`:

```tsx
"use client";

import { useState, useCallback } from "react";
import { useActionState } from "react";
import FilePondUpload from "@/components/FilePondUpload";
import { createGalleryItem } from "@/actions/gallery";
import { toast } from "sonner";

export function GalleryForm() {
  const [images, setImages] = useState<{ id: string; path: string }[]>([]);

  const handleImagesChange = useCallback((newImages: { id: string; path: string }[]) => {
    setImages(newImages);
  }, []);

  const [, formAction, pending] = useActionState(
    async (_prev: unknown, formData: FormData) => {
      const newImages = images.filter((i) => !i.isExisting);
      formData.append("images", JSON.stringify(newImages.map((i) => ({ id: i.id, path: i.path }))));
      try {
        await createGalleryItem(formData);
        toast.success("Gallery item created");
        setImages([]);
      } catch {
        toast.error("Failed to create gallery item");
      }
    },
    undefined
  );

  return (
    <form action={formAction} className="max-w-lg space-y-4 rounded-lg border border-border bg-card p-6">
      <h2 className="font-heading font-bold">Add Gallery Item</h2>
      <div className="space-y-2">
        <label className="text-sm font-medium">Title</label>
        <input name="title" placeholder="Title" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Description</label>
        <textarea name="description" placeholder="Optional description" rows={2}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Category</label>
        <select name="category" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="">Select category</option>
          <option value="Harvest">Harvest</option>
          <option value="Mangoes">Mangoes</option>
          <option value="Jamun">Jamun</option>
          <option value="Farm Events">Farm Events</option>
          <option value="Drone Shots">Drone Shots</option>
        </select>
      </div>
      <FilePondUpload onFilesChange={handleImagesChange} maxFiles={20} label="Gallery Images" />
      <button type="submit" disabled={pending || images.length === 0}
        className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
        {pending ? "Saving..." : "Add to Gallery"}
      </button>
    </form>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/\(admin\)/admin/\(protected\)/gallery/page.tsx src/app/\(admin\)/admin/\(protected\)/gallery/gallery-form.tsx
git commit -m "feat: rewrite gallery admin with FilePond upload"
```

---

### Task 12: Frontend Product Pages

**Files:**
- Modify: `src/app/(website)/page.tsx` — update queries for ProductImage relation
- Modify: `src/app/(website)/products/page.tsx` — update queries
- Modify: `src/app/(website)/products/[slug]/page.tsx` — update queries + gallery view

- [ ] **Step 1: Update homepage product queries**

In `src/app/(website)/page.tsx`, update the featured products query:

```tsx
const [featuredProducts, settings] = await Promise.all([
  prisma.product.findMany({
    where: { isFeatured: true, isActive: true, isDeleted: false },
    include: { images: { orderBy: { sortOrder: "asc" } } },
    take: 4,
  }),
  getSettings(),
]);
```

Then in the products section, change `product.images[0]` to `product.images.find(i => i.isThumbnail)?.imagePath || product.images[0]?.imagePath`.

- [ ] **Step 2: Update products list page**

In `src/app/(website)/products/page.tsx`, update the product query:

```tsx
prisma.product.findMany({
  where: { isActive: true, isDeleted: false },
  include: { images: { orderBy: { sortOrder: "asc" } } },
  orderBy: { createdAt: "desc" },
}),
```

And in the card rendering:

```tsx
const thumb = product.images.find(i => i.isThumbnail)?.imagePath || product.images[0]?.imagePath;
{thumb ? (
  <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: `url(${thumb})` }} />
) : (
  <div className="flex h-full w-full items-center justify-center text-4xl text-muted-foreground">🌿</div>
)}
```

- [ ] **Step 3: Update product detail page**

In `src/app/(website)/products/[slug]/page.tsx`, update the query:

```tsx
prisma.product.findUnique({
  where: { slug },
  include: { images: { orderBy: { sortOrder: "asc" } } },
}),
```

Add a gallery section:

```tsx
{/* Image Gallery */}
<AnimatedSection direction="left">
  <div className="space-y-4">
    <div className="rounded-2xl overflow-hidden bg-primary/5 shadow-xl">
      {(() => {
        const mainImg = product.images.find(i => i.isThumbnail)?.imagePath || product.images[0]?.imagePath;
        return mainImg ? (
          <img src={mainImg} alt={product.name} className="h-full w-full object-cover aspect-square" />
        ) : (
          <div className="aspect-square flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5">
            <span className="text-6xl">🌿</span>
          </div>
        );
      })()}
    </div>
    {product.images.length > 1 && (
      <div className="grid grid-cols-4 gap-2">
        {product.images.map((img, i) => (
          <button key={img.id} type="button"
            className="aspect-square rounded-lg overflow-hidden border border-border hover:border-primary transition-colors">
            <img src={img.imagePath} alt="" className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
    )}
  </div>
</AnimatedSection>
```

- [ ] **Step 4: Commit**

```bash
git add src/app/\(website\)/page.tsx src/app/\(website\)/products/page.tsx src/app/\(website\)/products/\[slug\]/page.tsx
git commit -m "feat: update frontend product queries for ProductImage relation"
```

---

### Task 13: Frontend Gallery Page

**Files:**
- Modify: `src/app/(website)/gallery/page.tsx`

- [ ] **Step 1: Update gallery query and display**

```tsx
const items = await prisma.galleryItem.findMany({
  include: { images: { orderBy: { sortOrder: "asc" } } },
  orderBy: { order: "asc" },
});
```

And in the masonry grid, replace `item.image` with `item.images[0]?.imagePath` and update the display to show all images:

```tsx
{(items.length > 0 ? items : []).map((item, i) => (
  <AnimatedSection key={item.id} delay={i * 0.03}>
    <div className="group relative mb-4 break-inside-avoid rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer">
      {item.images[0] && (
        <img src={item.images[0].imagePath} alt={item.title || "Gallery"} className="w-full object-cover transition-transform duration-700 group-hover:scale-110" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
        {item.title && <p className="text-sm font-heading font-bold text-white">{item.title}</p>}
        {item.category && <p className="text-xs text-white/70 mt-0.5">{item.category} · {item.images.length} photos</p>}
      </div>
    </div>
  </AnimatedSection>
))}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/\(website\)/gallery/page.tsx
git commit -m "feat: update gallery page for GalleryImage relation"
```

---

### Task 14: Dashboard & Seed Script

**Files:**
- Modify: `src/app/(admin)/admin/(protected)/dashboard/page.tsx`
- Modify: `prisma/seed.ts`

- [ ] **Step 1: Update dashboard counts**

`src/app/(admin)/admin/(protected)/dashboard/page.tsx` — add gallery count:

```tsx
const [productCount, orderCount, blogCount, galleryCount] = await Promise.all([
  prisma.product.count({ where: { isDeleted: false } }),
  prisma.order.count(),
  prisma.blogPost.count(),
  prisma.galleryItem.count(),
]);
```

Add a fourth stat card for Gallery.

- [ ] **Step 2: Update seed script for new schema**

`prisma/seed.ts` — update product images to use `ProductImage.create` instead of the `images` array.

- [ ] **Step 3: Commit**

```bash
git add src/app/\(admin\)/admin/\(protected\)/dashboard/page.tsx prisma/seed.ts
git commit -m "feat: update dashboard counts, fix seed script for new schema"
```

---

### Task 15: Build & Verify

- [ ] **Step 1: Run build**

```bash
cd C:\Users\NKS-WIN-Omkar\Documents\bhole
npm run build 2>&1
```

Expected: Compiled successfully, all routes generated.

- [ ] **Step 2: Verify upload pipeline**

Run the dev server and test:
1. Navigate to `/admin/products/new`
2. Upload images via FilePond — previews should appear
3. Fill form, submit — product created with images moved from temp to `uploads/products/{id}/`
4. Edit the product — existing images should load in FilePond
5. Add/remove/reorder images — save should work
6. Delete product — images should be removed from disk

- [ ] **Step 3: Test gallery**

1. Navigate to `/admin/gallery`
2. Upload images via FilePond
3. Submit — gallery item created
4. Verify images appear on `/gallery` public page

- [ ] **Step 4: Verify revalidation**

After creating/editing/deleting:
- Homepage should reflect changes
- Products page should reflect changes
- Gallery page should reflect changes

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "chore: final build fixes and verification"
```
