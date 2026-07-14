# Task 1: Prisma Schema & Dependencies

**Goal:** Install dependencies (filepond, react-filepond, sharp, uuid), update Prisma schema with new models, generate client, push to DB.

## Files to modify

- `prisma/schema.prisma`
- `package.json`

## Steps

1. Install packages: `filepond`, `react-filepond`, `sharp`, `uuid`, `@types/uuid`
2. Update Prisma schema with:
   - New `ProductUnit` enum (KG, GRAM, DOZEN, BOX, PIECE, LITER, ML, BUNDLE)
   - Update `Product` model (remove `images String[]`, add `unit ProductUnit?`, add `sku String?`, add `shortDescription String?`, add `isActive Boolean @default(true)`, add `isDeleted Boolean @default(false)`, change `price` to `Decimal? @db.Decimal(10,2)`)
   - New `ProductImage` model with fields: id, productId (FK to Product with onDelete Cascade), imagePath, fileName?, mimeType?, fileSize?, width?, height?, altText?, sortOrder, isThumbnail, createdAt
   - New `GalleryItem` model replacing old one with: id, title?, slug? @unique, description?, category?, images GalleryImage[], order, createdAt, updatedAt
   - New `GalleryImage` model with: id, galleryId (FK to GalleryItem with onDelete Cascade), imagePath, fileName?, mimeType?, fileSize?, width?, height?, altText?, sortOrder, createdAt
3. Run `npx prisma generate` and `npx prisma db push`

## Global constraints

- `onDelete: Cascade` on all image foreign keys
- UUID v4 filenames (handled later, but schema must support)
- Relative paths in DB only

## Commits

- `feat: add ProductImage/GalleryImage models, install filepond/sharp/uuid`
