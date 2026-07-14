import { NextResponse } from "next/server";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";
import { storageService } from "@/lib/storage";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files[]") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ success: false, error: "No files provided" }, { status: 400 });
    }

    const results: { id: string; path: string; width: number; height: number; size: number; mimeType: string }[] = [];

    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          { success: false, error: `Invalid file type: ${file.type}. Allowed: JPG, PNG, WEBP` },
          { status: 400 }
        );
      }

      const ext = file.name.toLowerCase().slice(file.name.lastIndexOf("."));
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        return NextResponse.json(
          { success: false, error: `Invalid extension: ${ext}` },
          { status: 400 }
        );
      }

      if (file.size > MAX_SIZE) {
        return NextResponse.json(
          { success: false, error: `File too large: ${file.name}. Max 5 MB` },
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      const inputBuffer = Buffer.from(bytes);

      // Convert to WEBP, strip metadata, compress
      const processed = await sharp(inputBuffer)
        .webp({ quality: 80 })
        .toBuffer();

      const metadata = await sharp(processed).metadata();

      const uuid = uuidv4();
      const filename = `${uuid}.webp`;
      const relativePath = `uploads/temp/${filename}`;

      await storageService.save(processed, relativePath);

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
