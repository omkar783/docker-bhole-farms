"use client";

import { useActionState, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createGalleryItem, updateGalleryItem } from "@/actions/gallery";
import FilePondUpload from "@/components/FilePondUpload";

interface UploadedFile {
  id: string;
  path: string;
  isExisting?: boolean;
}

interface GalleryFormProps {
  itemId?: string;
  defaultValues?: {
    title?: string;
    slug?: string;
    description?: string;
    category?: string;
    order?: number;
    images?: { path: string; id?: string }[];
  };
}

export function GalleryForm({ itemId, defaultValues }: GalleryFormProps) {
  const action = itemId ? updateGalleryItem.bind(null, itemId) : createGalleryItem;
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const [state, formAction, pending] = useActionState(
    async (_prev: unknown, formData: FormData) => {
      await action(formData);
    },
    undefined
  );

  const handleFilesChange = useCallback((files: UploadedFile[]) => {
    setUploadedFiles(files);
  }, []);

  return (
    <form action={formAction} className="max-w-lg space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" defaultValue={defaultValues?.title || ""} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="slug">Slug</Label>
        <Input id="slug" name="slug" defaultValue={defaultValues?.slug || ""} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" defaultValue={defaultValues?.description || ""} rows={3} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Input id="category" name="category" defaultValue={defaultValues?.category || ""} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="order">Order</Label>
        <Input id="order" name="order" type="number" defaultValue={defaultValues?.order?.toString() || "0"} />
      </div>
      <div className="space-y-2">
        <FilePondUpload
          existingImages={defaultValues?.images || []}
          onFilesChange={handleFilesChange}
          label="Gallery Images"
        />
      </div>
      <input type="hidden" name="imagesData" value={JSON.stringify(uploadedFiles)} />
      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : itemId ? "Update Gallery Item" : "Add to Gallery"}
      </Button>
    </form>
  );
}
