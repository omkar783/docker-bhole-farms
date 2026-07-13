import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const order = await prisma.order.create({
      data: {
        customerName: body.customerName,
        phone: body.phone,
        email: body.email || null,
        productId: body.productId || null,
        quantity: body.quantity || 1,
        message: body.message || null,
      },
    });
    return NextResponse.json({ success: true, id: order.id });
  } catch {
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
