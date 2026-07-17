import { NextResponse } from "next/server";
import { sendContactNotification } from "@/lib/email";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const ip = getClientIP(req);
    const { allowed, retryAfter } = checkRateLimit(`contact:${ip}`);
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many requests. Try again later." },
        { status: 429, headers: { "Retry-After": String(retryAfter) } }
      );
    }

    const body = await req.json();
    const { name, email, phone, message } = body;

    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json({ error: "Invalid name" }, { status: 400 });
    }

    if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    if (phone && phone.trim() !== "") {
      const cleanPhone = phone.replace(/[^\d]/g, "");
      if (cleanPhone.length < 10 || cleanPhone.length > 15) {
        return NextResponse.json({ error: "Invalid phone number (must be 10-15 digits)" }, { status: 400 });
      }
    }

    if (!message || typeof message !== "string" || message.trim().length < 10) {
      return NextResponse.json({ error: "Message must be at least 10 characters" }, { status: 400 });
    }

    try {
      await sendContactNotification({ name, email, phone, message });
    } catch {
      return NextResponse.json(
        { error: "Failed to send message. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to submit form" },
      { status: 500 }
    );
  }
}
