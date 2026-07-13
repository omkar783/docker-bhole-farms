import { Resend } from "resend";
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
    await resend.emails.send({
      from: "Bhole Farms <onboarding@resend.dev>",
      to: adminEmail,
      subject: `New Order Enquiry — ${data.customerName}`,
      react: <OrderNotification {...data} />,
      replyTo: data.email || undefined,
    });
  } catch (error) {
    console.error("Failed to send order notification email:", error);
  }
}

export async function sendContactNotification(data: ContactNotificationData) {
  try {
    await resend.emails.send({
      from: "Bhole Farms <onboarding@resend.dev>",
      to: adminEmail,
      subject: `New Contact Message — ${data.name}`,
      react: <ContactNotification {...data} />,
      replyTo: data.email,
    });
  } catch (error) {
    console.error("Failed to send contact notification email:", error);
  }
}
