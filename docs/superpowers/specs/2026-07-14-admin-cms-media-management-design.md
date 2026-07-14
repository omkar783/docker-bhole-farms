# Admin CMS & Media Management System

Date: 2026-07-14
Status: Design (pre-implementation)

## Overview

Production-ready admin CMS and media management system for Bhole Farms. Replaces the current URL-based image inputs with FilePond-powered multi-upload, normalizes image storage into relational tables, and ensures full frontend synchronization.

---

## Database Schema

### Enums

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
```

### Models

```prisma
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

### Constraints

- Each Product must have at least one image (enforced in app logic).
- Exactly one thumbnail per Product (auto-select first image if none chosen).
- Gallery must have at least one image.
- `isDeleted` supports soft-delete; permanent delete is a separate explicit action.

---

## Media Storage

### Directory Structure

```
public/uploads/
  temp/                        # Upload destination before entity save
  products/{productId}/        # Moved after product creation
    uuid-v4-1.webp
    uuid-v4-2.webp
    uuid-v4-thumbnail.webp
  gallery/{galleryId}/
    uuid-v4-1.webp
  banners/
  farm/
```

### File Naming

- UUID v4 as filename base, preserve original extension or convert to .webp
- Example: `550e8400-e29b-41d4-a716-446655440000.webp`

### Upload Workflow

1. User selects files in FilePond
2. Files upload to `/api/upload` → saved to `public/uploads/temp/`
3. API returns `{ success, files: [{ path, width, height, size, mimeType }] }`
4. User submits form (create product/gallery)
5. Server action:
   a. Creates DB records in a Prisma transaction
   b. On success: moves files from `temp/` to `products/{productId}/` or `gallery/{galleryId}/`
   c. On failure: files stay in `temp/` for cleanup, DB is rolled back

---

## Upload API

### `POST /api/upload`

**Request:** `multipart/form-data`
- `files[]` — one or more image files
- `target` — `products`, `gallery`, `banners`, `farm`

**Server validation:**
- MIME type: `image/jpeg`, `image/png`, `image/webp`
- Extension: `.jpg`, `.jpeg`, `.png`, `.webp`
- Max size: 5 MB per file
- Image integrity check (via sharp or similar)
- Reject executables, SVGs, fake MIME types

**Response (200):**
```json
{
  "success": true,
  "files": [
    { "id": "uuid", "path": "uploads/temp/uuid.webp", "width": 1200, "height": 800, "size": 240000, "mimeType": "image/webp" }
  ]
}
```

### Image Processing

- Convert all uploads to WEBP
- Compress with quality 80
- Generate thumbnail (400px wide)
- Strip EXIF/metadata
- Use `sharp` for processing

---

## StorageService

Abstract interface for file operations to support future cloud migration:

```typescript
interface StorageService {
  save(file: Buffer, path: string): Promise<string>
  delete(path: string): Promise<void>
  move(source: string, dest: string): Promise<string>
  exists(path: string): Promise<boolean>
}
```

Initial implementation: `LocalStorageService` (fs operations).
`CloudStorageService` (S3/Cloudinary) can be added later without changing app code.

---

## Delete Flow (Transaction-Safe)

1. Read all image paths from DB
2. Begin Prisma interactive transaction
3. Delete DB records (cascade handles child images)
4. Commit transaction
5. If commit succeeds: delete files from disk (log failures but don't rollback DB)
6. If commit fails: abort, files remain untouched

**Never leave the database inconsistent.** File system failures after DB commit are logged and queued for cleanup.

---

## FilePond Integration

### Product Form

- `allowMultiple: true`
- `allowReorder: true`
- Max file size: 5 MB
- Accepted file types: `.jpg,.jpeg,.png,.webp`
- Server validation via `/api/upload`
- Existing images loaded with `{ source: path, options: { type: 'local' } }`
- Remove existing image → marks for deletion in state, removed on save
- Progress bar display

### Thumbnail Picker

Below FilePond, a grid showing all images (new + existing):
- Each image has radio-style "Set as Thumbnail" selection
- Delete button (with confirmation)
- Replace button (opens file picker)
- Drag to reorder updates `sortOrder`

Auto-select first image as thumbnail if none explicitly chosen.

### Gallery Form

Same FilePond setup without thumbnail selection.

---

## Admin Pages

### Product Form Layout

Cards with labeled sections:

| Section | Fields |
|---------|--------|
| General Information | Product Name, Slug (auto-generated, editable), Short Description, Full Description |
| Pricing & Inventory | Price, Unit (enum), Stock, SKU, Availability (In Stock / Out of Stock / Coming Soon) |
| Category | Category dropdown |
| Product Status | Featured, Seasonal, Active toggles |
| Images | FilePond + Thumbnail Picker |
| SEO (future) | Meta Title, Meta Description, Image Alt Text |

### Product List

Columns: Thumbnail, Name, Category, Price, Unit, Stock, Status, Featured, Created Date, Actions (Edit/Delete)

Features: Search, Category filter, Featured filter, Active filter, Sort by name/price/date, Pagination

### Product Edit

- Loads existing images into FilePond
- Thumbnail pre-selected
- Warn on unsaved changes
- Add/replace/delete/reorder images

### Gallery Form/Create

- Title, Description, Category
- FilePond multi-upload
- Same image UX as products

### Gallery List

Columns: Thumbnail, Title, Category, Image Count, Created Date, Actions

Features: Search, Category filter, Pagination

---

## Revalidation

Helper functions centralizing `revalidatePath` calls:

```typescript
revalidateProduct(slug?: string)   // /, /products, /products/[slug], /admin/products
revalidateGallery()                // /, /gallery, /admin/gallery
revalidateHomepage()               // /
revalidateCategory()               // /products, /admin/categories
```

Called automatically after every create/update/delete action.

---

## Frontend Display

### Homepage
- Featured Products (with thumbnail)
- Latest Products
- Seasonal Products

### Products Page
- Product cards: thumbnail, name, price, unit
- Product detail: main image (thumbnail), gallery, zoom, lightbox, keyboard navigation
- WhatsApp order button, Email order button
- Related products

### Gallery Page
- Responsive masonry grid with lazy loading
- Lightbox with image navigation
- Mobile friendly

### Image Performance
- Next.js `Image` component
- WEBP format
- Lazy loading
- Blur placeholders (with `blurDataURL`)
- Responsive sizes

---

## Accessibility

- Alt text on every image
- Keyboard navigation in grid/list views
- Visible focus states
- Proper ARIA labels on interactive elements

---

## UX / Feedback

| State | UI |
|-------|-----|
| Uploading | Progress bar |
| Saving | "Saving..." with spinner |
| Deleting | Confirmation dialog |
| Success | Toast notification |
| Error | Error toast + message |
| Empty | Empty state with illustration and action |
| Loading | Skeleton cards |

---

## Verification Checklist

- [ ] Upload works via FilePond
- [ ] Preview appears before save
- [ ] Multiple file upload works
- [ ] Drag-and-drop reorder works
- [ ] Thumbnail selection works
- [ ] Editing loads existing images
- [ ] Replace individual image works
- [ ] Delete individual image works (DB + file)
- [ ] Full product/gallery delete cleans up all files
- [ ] Transaction safety: DB failure doesn't delete files
- [ ] Transaction safety: DB success + file failure logged, DB not rolled back
- [ ] No orphan DB records
- [ ] No orphan files on disk
- [ ] Public website updates after every save
- [ ] Responsive on desktop, tablet, mobile
- [ ] Accessible (alt text, keyboard, ARIA)
- [ ] All image files are WEBP
- [ ] Images optimized (compressed, metadata stripped)
