"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

async function submitContact(
  _prev: string | undefined,
  formData: FormData
) {
  try {
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        message: formData.get("message"),
      }),
    });
    if (!res.ok) return "Something went wrong. Please try again.";
    return "success";
  } catch {
    return "Something went wrong. Please try again.";
  }
}

export function ContactForm() {
  const [state, formAction, pending] = useActionState(submitContact, undefined);

  if (state === "success") {
    return (
      <div className="mt-4 rounded-md bg-primary/10 p-4 text-sm text-primary">
        Thank you for your message! We&apos;ll get back to you shortly.
      </div>
    );
  }

  return (
    <form action={formAction} className="mt-4 space-y-4">
      {state && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {state}
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="name">Name *</Label>
        <Input id="name" name="name" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email *</Label>
        <Input id="email" name="email" type="email" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" name="phone" type="tel" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="message">Message *</Label>
        <Textarea id="message" name="message" required rows={4} />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Sending..." : "Send Message"}
      </Button>
    </form>
  );
}
