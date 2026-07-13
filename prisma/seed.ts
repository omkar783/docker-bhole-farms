import { PrismaClient } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("admin123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@bholefarms.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@bholefarms.com",
      hashedPassword,
      role: "ADMIN",
    },
  });

  console.log("Admin created:", admin.email);

  const categories = [
    { name: "Vegetables", slug: "vegetables", order: 1 },
    { name: "Fruits", slug: "fruits", order: 2 },
    { name: "Grains & Pulses", slug: "grains-pulses", order: 3 },
    { name: "Dairy", slug: "dairy", order: 4 },
    { name: "Seasonal Specials", slug: "seasonal-specials", order: 5 },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  console.log("Categories seeded:", categories.length);

  const defaultSettings = [
    { key: "site_name", value: "Bhole Farms" },
    { key: "site_description", value: "Fresh organic produce from farm to table" },
    { key: "contact_phone", value: "+91XXXXXXXXXX" },
    { key: "contact_email", value: "hello@bholefarms.com" },
    { key: "whatsapp_number", value: "91XXXXXXXXXX" },
    { key: "address", value: "Bhole Farms, Maharashtra" },
    { key: "hero_headline", value: "Fresh from Our Farm to Your Table" },
    { key: "hero_subtext", value: "100% organic produce grown with care in Maharashtra" },
  ];

  for (const s of defaultSettings) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: {},
      create: s,
    });
  }

  console.log("Settings seeded:", defaultSettings.length);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
