"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

async function submitEnquiry(
  _prev: string | undefined,
  formData: FormData
) {
  try {
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName: formData.get("name"),
        phone: formData.get("phone"),
        email: formData.get("email"),
        productId: formData.get("productId"),
        quantity: Number(formData.get("quantity")),
        message: formData.get("message"),
      }),
    });
    if (!res.ok) return "Something went wrong. Please try again.";
    return "success";
  } catch {
    return "Something went wrong. Please try again.";
  }
}

interface EnquiryFormProps {
  productId: string;
  productName: string;
}

export function EnquiryForm({ productId, productName }: EnquiryFormProps) {
  const [state, formAction, pending] = useActionState(submitEnquiry, undefined);

  if (state === "success") {
    return (
      <div className="mt-4 rounded-md bg-primary/10 p-4 text-sm text-primary">
        Thank you! We&apos;ve received your enquiry for {productName}. We&apos;ll
        contact you shortly.
      </div>
    );
  }

  return (
    <form action={formAction} className="mt-4 space-y-4">
      <input type="hidden" name="productId" value={productId} />
      {state && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {state}
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          <Input id="name" name="name" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone *</Label>
          <Input id="phone" name="phone" type="tel" required />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="quantity">Quantity</Label>
        <Input id="quantity" name="quantity" type="number" min="1" defaultValue="1" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Textarea id="message" name="message" rows={3} />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Sending..." : "Send Enquiry"}
      </Button>
    </form>
  );
}
