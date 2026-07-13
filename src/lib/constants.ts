export const SITE_NAME = "Bhole Farms";
export const SITE_DESCRIPTION = "Fresh organic produce from farm to table";

export const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "91XXXXXXXXXX";
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;

export const CONTACT_EMAIL = "hello@bholefarms.com";
export const CONTACT_PHONE = "+91XXXXXXXXXX";

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/about", label: "About" },
  { href: "/gallery", label: "Gallery" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
] as const;
