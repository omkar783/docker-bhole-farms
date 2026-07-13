import { Resend } from "resend";
import { render } from "@react-email/components";
import OrderNotification from "@/emails/order-notification";
import ContactNotification from "@/emails/contact-notification";

const resend = new Resend(process.env.RESEND_API_KEY!);
const adminEmail = process.env.ADMIN_EMAIL!;

interface OrderNotificationData {
  customerName: string;
  phone: string;
  email?: string | null;
  productName?: string;
  quantity: number;
  message?: string | null;
}

interface ContactNotificationData {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

export async function sendOrderNotification(data: OrderNotificationData) {
  try {
    const html = await render(<OrderNotification {...data} />);
    await resend.emails.send({
      from: "Bhole Farms <onboarding@resend.dev>",
      to: adminEmail,
      subject: `New Order Enquiry — ${data.customerName}`,
      html,
      replyTo: data.email || undefined,
    });
  } catch (error) {
    console.error("Failed to send order notification email:", error);
  }
}

export async function sendContactNotification(data: ContactNotificationData) {
  try {
    const html = await render(<ContactNotification {...data} />);
    await resend.emails.send({
      from: "Bhole Farms <onboarding@resend.dev>",
      to: adminEmail,
      subject: `New Contact Message — ${data.name}`,
      html,
      replyTo: data.email,
    });
  } catch (error) {
    console.error("Failed to send contact notification email:", error);
  }
}
