import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

function createPrismaClient() {
  const raw = process.env.DATABASE_URL || "";
  const url = new URL(raw);
  url.password = decodeURIComponent(url.password);
  const adapter = new PrismaPg(url.toString());
  return new PrismaClient({ adapter });
}

const prisma = createPrismaClient();

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
    { key: "contact_phone", value: "9881732998" },
    { key: "contact_email", value: "bholefarms21@gmail.com" },
    { key: "whatsapp_number", value: "919881732998" },
    { key: "address", value: "के. दत्तूभाऊ भोळे फार्महाउस देवगाव RV4J+69, Devgaon, Maharashtra 431123, India" },
    { key: "hero_headline", value: "Fresh from Our Farm to Your Table" },
    { key: "hero_subtext", value: "100% organic produce grown with care in Maharashtra" },
  ];

  for (const s of defaultSettings) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    });
  }

  console.log("Settings seeded:", defaultSettings.length);

  // Fetch categories to link products
  const fruitsCategory = await prisma.category.findUniqueOrThrow({ where: { slug: "fruits" } });
  const veggiesCategory = await prisma.category.findUniqueOrThrow({ where: { slug: "vegetables" } });
  const grainsCategory = await prisma.category.findUniqueOrThrow({ where: { slug: "grains-pulses" } });

  const products = [
    {
      name: "Kesar Mango",
      slug: "kesar-mango",
      description: "Sweet, rich in flavor and natural sweetness.",
      price: 220,
      categoryId: fruitsCategory.id,
      images: ["/images/kesar-mango.jpg"],
      isFeatured: true,
      isSeasonal: true,
      season: "Summer",
      stock: 100,
    },
    {
      name: "Alphonso Mango",
      slug: "alphonso-mango",
      description: "Sweet, juicy and full of aroma. A summer favorite.",
      price: 180,
      categoryId: fruitsCategory.id,
      images: ["/images/alphonso-mango.jpg"],
      isFeatured: true,
      isSeasonal: true,
      season: "Summer",
      stock: 100,
    },
    {
      name: "Totapuri Mango",
      slug: "totapuri-mango",
      description: "Delicious & aromatic with a smooth texture.",
      price: 120,
      categoryId: fruitsCategory.id,
      images: ["/images/totapuri-mango.jpg"],
      isFeatured: true,
      isSeasonal: true,
      season: "Summer",
      stock: 100,
    },
    {
      name: "Jambhul (Jamun)",
      slug: "jambhul-jamun",
      description: "Naturally sweet and healthy. Rich in antioxidants.",
      price: 100,
      categoryId: fruitsCategory.id,
      images: ["/images/jambhul-jamun.jpg"],
      isFeatured: true,
      isSeasonal: true,
      season: "Summer",
      stock: 100,
    },
    {
      name: "Guava (Peru)",
      slug: "guava-peru",
      description: "Crispy, juicy and rich in vitamin C.",
      price: 80,
      categoryId: fruitsCategory.id,
      images: ["/images/guava-peru.jpg"],
      isFeatured: false,
      isSeasonal: false,
      stock: 100,
    },
    {
      name: "Pomegranate (Dalimb)",
      slug: "pomegranate-dalimb",
      description: "Full of nutrients and natural goodness.",
      price: 130,
      categoryId: fruitsCategory.id,
      images: ["/images/pomegranate-dalimb.jpg"],
      isFeatured: false,
      isSeasonal: false,
      stock: 100,
    },
    {
      name: "Fresh Vegetables",
      slug: "fresh-vegetables",
      description: "A wide variety of seasonal organic vegetables.",
      price: 40,
      categoryId: veggiesCategory.id,
      images: ["/images/fresh-vegetables.jpg"],
      isFeatured: false,
      isSeasonal: false,
      stock: 200,
    },
    {
      name: "Toor Dal (Organic)",
      slug: "toor-dal",
      description: "High quality organic pulses for a healthy life.",
      price: 110,
      categoryId: grainsCategory.id,
      images: ["/images/toor-dal.jpg"],
      isFeatured: false,
      isSeasonal: false,
      stock: 150,
    },
  ];

  for (const prod of products) {
    const { images, ...prodData } = prod;
    await prisma.product.upsert({
      where: { slug: prod.slug },
      update: {
        name: prodData.name,
        description: prodData.description,
        price: prodData.price,
        categoryId: prodData.categoryId,
        isFeatured: prodData.isFeatured,
        isSeasonal: prodData.isSeasonal,
        season: prodData.season || null,
        stock: prodData.stock,
      },
      create: prodData,
    });
  }

  console.log("Products seeded:", products.length);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
