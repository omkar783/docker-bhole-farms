import { Resend } from "resend";
import { render } from "@react-email/components";
import OrderNotification from "@/emails/order-notification";
import ContactNotification from "@/emails/contact-notification";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY || "");
}

function getAdminEmail() {
  return process.env.ADMIN_EMAIL || "admin@bholefarms.com";
}

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
    await getResend().emails.send({
      from: "Bhole Farms <onboarding@resend.dev>",
      to: getAdminEmail(),
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
    await getResend().emails.send({
      from: "Bhole Farms <onboarding@resend.dev>",
      to: getAdminEmail(),
      subject: `New Contact Message — ${data.name}`,
      html,
      replyTo: data.email,
    });
  } catch (error) {
    console.error("Failed to send contact notification email:", error);
    throw error;
  }
}
