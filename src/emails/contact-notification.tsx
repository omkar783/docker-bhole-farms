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
