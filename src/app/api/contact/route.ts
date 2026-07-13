import { NextResponse } from "next/server";
import { sendContactNotification } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, message } = body;

    sendContactNotification({ name, email, phone, message });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to submit form" },
      { status: 500 }
    );
  }
}
