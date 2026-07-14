import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendOrderNotification } from "@/lib/email";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const ip = getClientIP(req);
    const { allowed, retryAfter } = checkRateLimit(`order:${ip}`);
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many requests. Try again later." },
        { status: 429, headers: { "Retry-After": String(retryAfter) } }
      );
    }

    const body = await req.json();

    if (!body.customerName || typeof body.customerName !== "string" || body.customerName.trim().length < 2) {
      return NextResponse.json({ error: "Invalid customer name" }, { status: 400 });
    }

    if (!body.phone || typeof body.phone !== "string" || !/^\d{10,15}$/.test(body.phone.trim())) {
      return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
    }

    if (body.email && (typeof body.email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email))) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    if (body.quantity && (typeof body.quantity !== "number" || body.quantity < 1 || body.quantity > 1000)) {
      return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
    }

    if (body.message && typeof body.message === "string" && body.message.length > 500) {
      return NextResponse.json({ error: "Message too long" }, { status: 400 });
    }

    const order = await prisma.order.create({
      data: {
        customerName: body.customerName.trim(),
        phone: body.phone.trim(),
        email: body.email?.trim() || null,
        productId: body.productId || null,
        quantity: body.quantity || 1,
        message: body.message?.trim() || null,
      },
      include: { product: true },
    });

    sendOrderNotification({
      customerName: body.customerName,
      phone: body.phone,
      email: body.email,
      productName: order.product?.name,
      quantity: body.quantity || 1,
      message: body.message,
    });

    return NextResponse.json({ success: true, id: order.id });
  } catch {
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
