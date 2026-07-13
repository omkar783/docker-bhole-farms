# Email Notifications Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Send email to the farm admin when customers submit order enquiries or contact form submissions.

**Architecture:** Resend SDK sends emails from the existing API route handlers. React Email components render responsive HTML templates. Email sending is wrapped in try/catch so failure never breaks the user-facing response.

**Tech Stack:** `resend`, `@react-email/components`, TypeScript

## Global Constraints

- No `.env` files are committed — all secrets stay local
- Email failure is non-fatal (log and continue, never throw)
- Brand colors: deep green `#2E7D32`, brown `#5D4037`, gold `#F9A825`, cream `#F5F0EB`

---

### Task 1: Install dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install resend and @react-email/components**

Run: `npm install resend @react-email/components`

- [ ] **Step 2: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add resend and @react-email/components"
```

---

### Task 2: Create email helper

**Files:**
- Create: `src/lib/email.ts`

**Interfaces:**
- Produces: `sendOrderNotification(data: OrderNotificationData): Promise<void>`
- Produces: `sendContactNotification(data: ContactNotificationData): Promise<void>`

- [ ] **Step 1: Create `src/lib/email.ts`**

```typescript
import { Resend } from "resend";
import OrderNotification from "@/emails/order-notification";
import ContactNotification from "@/emails/contact-notification";

const resend = new Resend(process.env.RESEND_API_KEY!);
const adminEmail = process.env.ADMIN_EMAIL!;

interface OrderNotificationData {
  customerName: string;
  phone: string;
  email?: string | null;
  productId?: string | null;
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
      from: "Bhole Farms <notifications@bholefarms.com>",
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
      from: "Bhole Farms <notifications@bholefarms.com>",
      to: adminEmail,
      subject: `New Contact Message — ${data.name}`,
      react: <ContactNotification {...data} />,
      replyTo: data.email,
    });
  } catch (error) {
    console.error("Failed to send contact notification email:", error);
  }
}
```

Note: The `from` address will need to be a verified domain in Resend. For development, you can use `onboarding@resend.dev` as the from address instead.

- [ ] **Step 2: Commit**

```bash
git add src/lib/email.ts
git commit -m "feat: add email notification helper"
```

---

### Task 3: Create order notification email template

**Files:**
- Create: `src/emails/order-notification.tsx`

- [ ] **Step 1: Create `src/emails/order-notification.tsx`**

```tsx
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Heading,
  Text,
  Hr,
} from "@react-email/components";

interface OrderNotificationProps {
  customerName: string;
  phone: string;
  email?: string | null;
  productName?: string;
  quantity: number;
  message?: string | null;
}

export default function OrderNotification({
  customerName,
  phone,
  email,
  productName,
  quantity,
  message,
}: OrderNotificationProps) {
  return (
    <Html>
      <Head />
      <Preview>New order enquiry from {customerName}</Preview>
      <Body style={{ fontFamily: "Arial, sans-serif", padding: "20px" }}>
        <Container
          style={{
            backgroundColor: "#F5F0EB",
            padding: "24px",
            borderRadius: "8px",
          }}
        >
          <Heading
            style={{ color: "#2E7D32", fontSize: "24px", margin: "0 0 16px" }}
          >
            New Order Enquiry
          </Heading>
          <Text style={{ color: "#5D4037", fontSize: "14px", margin: "0 0 20px" }}>
            A customer has submitted an order enquiry. Details below:
          </Text>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tr>
              <td style={{ padding: "8px 0", color: "#5D4037", fontWeight: "bold", width: "120px" }}>Name</td>
              <td style={{ padding: "8px 0", color: "#333" }}>{customerName}</td>
            </tr>
            <tr>
              <td style={{ padding: "8px 0", color: "#5D4037", fontWeight: "bold" }}>Phone</td>
              <td style={{ padding: "8px 0", color: "#333" }}>{phone}</td>
            </tr>
            {email && (
              <tr>
                <td style={{ padding: "8px 0", color: "#5D4037", fontWeight: "bold" }}>Email</td>
                <td style={{ padding: "8px 0", color: "#333" }}>{email}</td>
              </tr>
            )}
            <tr>
              <td style={{ padding: "8px 0", color: "#5D4037", fontWeight: "bold" }}>Product</td>
              <td style={{ padding: "8px 0", color: "#333" }}>{productName || "General enquiry"}</td>
            </tr>
            <tr>
              <td style={{ padding: "8px 0", color: "#5D4037", fontWeight: "bold" }}>Quantity</td>
              <td style={{ padding: "8px 0", color: "#333" }}>{quantity}</td>
            </tr>
          </table>
          {message && (
            <>
              <Hr style={{ borderColor: "#ddd", margin: "16px 0" }} />
              <Text style={{ color: "#5D4037", fontWeight: "bold", margin: "0 0 8px" }}>
                Message
              </Text>
              <Text style={{ color: "#333", margin: "0", whiteSpace: "pre-wrap" }}>
                {message}
              </Text>
            </>
          )}
        </Container>
      </Body>
    </Html>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/emails/order-notification.tsx
git commit -m "feat: add order notification email template"
```

---

### Task 4: Create contact notification email template

**Files:**
- Create: `src/emails/contact-notification.tsx`

- [ ] **Step 1: Create `src/emails/contact-notification.tsx`**

```tsx
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Heading,
  Text,
  Hr,
} from "@react-email/components";

interface ContactNotificationProps {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

export default function ContactNotification({
  name,
  email,
  phone,
  message,
}: ContactNotificationProps) {
  return (
    <Html>
      <Head />
      <Preview>New message from {name}</Preview>
      <Body style={{ fontFamily: "Arial, sans-serif", padding: "20px" }}>
        <Container
          style={{
            backgroundColor: "#F5F0EB",
            padding: "24px",
            borderRadius: "8px",
          }}
        >
          <Heading
            style={{ color: "#2E7D32", fontSize: "24px", margin: "0 0 16px" }}
          >
            New Contact Message
          </Heading>
          <Text style={{ color: "#5D4037", fontSize: "14px", margin: "0 0 20px" }}>
            Someone has submitted the contact form. Details below:
          </Text>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tr>
              <td style={{ padding: "8px 0", color: "#5D4037", fontWeight: "bold", width: "120px" }}>Name</td>
              <td style={{ padding: "8px 0", color: "#333" }}>{name}</td>
            </tr>
            <tr>
              <td style={{ padding: "8px 0", color: "#5D4037", fontWeight: "bold" }}>Email</td>
              <td style={{ padding: "8px 0", color: "#333" }}>{email}</td>
            </tr>
            {phone && (
              <tr>
                <td style={{ padding: "8px 0", color: "#5D4037", fontWeight: "bold" }}>Phone</td>
                <td style={{ padding: "8px 0", color: "#333" }}>{phone}</td>
              </tr>
            )}
          </table>
          <Hr style={{ borderColor: "#ddd", margin: "16px 0" }} />
          <Text style={{ color: "#5D4037", fontWeight: "bold", margin: "0 0 8px" }}>
            Message
          </Text>
          <Text style={{ color: "#333", margin: "0", whiteSpace: "pre-wrap" }}>
            {message}
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/emails/contact-notification.tsx
git commit -m "feat: add contact notification email template"
```

---

### Task 5: Integrate into orders API route

**Files:**
- Modify: `src/app/api/orders/route.ts`

**Interfaces:**
- Consumes: `sendOrderNotification` from `@/lib/email`

- [ ] **Step 1: Edit `src/app/api/orders/route.ts`**

```typescript
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendOrderNotification } from "@/lib/email";

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
      include: { product: true },
    });

    sendOrderNotification({
      customerName: body.customerName,
      phone: body.phone,
      email: body.email,
      productId: body.productId,
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
```

- [ ] **Step 2: Build check**

Run: `npm run build`
Expected: Compiles without errors

- [ ] **Step 3: Commit**

```bash
git add src/app/api/orders/route.ts
git commit -m "feat: send email notification on new order"
```

---

### Task 6: Integrate into contact API route

**Files:**
- Modify: `src/app/api/contact/route.ts`

**Interfaces:**
- Consumes: `sendContactNotification` from `@/lib/email`

- [ ] **Step 1: Edit `src/app/api/contact/route.ts`**

```typescript
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
```

- [ ] **Step 2: Build check**

Run: `npm run build`
Expected: Compiles without errors

- [ ] **Step 3: Commit**

```bash
git add src/app/api/contact/route.ts
git commit -m "feat: send email notification on contact form submission"
```
