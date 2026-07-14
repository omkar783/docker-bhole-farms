"use client";

import { useRef, useState, useCallback } from "react";
import { createGalleryItem } from "@/actions/gallery";
import ImageUploader from "@/components/ImageUploader";

export default function GalleryForm() {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);
  const categoryRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);
  const imageKeyRef = useRef(0);

  const handleUploadComplete = useCallback((url: string) => {
    if (imageRef.current) {
      imageRef.current.value = url;
    }
  }, []);

  const handleFormAction = useCallback(async (formData: FormData) => {
    setSubmitting(true);
    try {
      await createGalleryItem(formData);
      setSuccess(true);
      if (titleRef.current) titleRef.current.value = "";
      if (categoryRef.current) categoryRef.current.value = "";
      if (imageRef.current) imageRef.current.value = "";
      imageKeyRef.current += 1;
      setTimeout(() => setSuccess(false), 2000);
    } finally {
      setSubmitting(false);
    }
  }, []);

  return (
    <form id="gallery-form" action={handleFormAction} className="grid gap-4 max-w-lg grid-cols-2">
      {success && (
        <div className="col-span-2 rounded-lg bg-primary/10 border border-primary/20 px-4 py-3 text-sm text-primary font-medium">
          Image added to gallery
        </div>
      )}
      <input
        ref={titleRef}
        name="title"
        placeholder="Title"
        className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
      />
      <input
        ref={categoryRef}
        name="category"
        placeholder="Category"
        className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
      />
      <input ref={imageRef} name="image" type="hidden" required />
      <div className="col-span-2">
        <ImageUploader key={imageKeyRef.current} onUploadComplete={handleUploadComplete} formId="gallery-form" />
      </div>
      {submitting && (
        <div className="col-span-2 flex items-center justify-center gap-2 py-2 text-sm text-muted-foreground">
          <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z" />
          </svg>
          Saving...
        </div>
      )}
    </form>
  );
}
