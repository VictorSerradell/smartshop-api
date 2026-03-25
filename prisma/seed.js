// prisma/seed.js
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Admin user
  await prisma.user.upsert({
    where: { email: "admin@smartshop.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@smartshop.com",
      password: await bcrypt.hash("admin123", 10),
      role: "ADMIN",
    },
  });

  // Demo user
  await prisma.user.upsert({
    where: { email: "demo@smartshop.com" },
    update: {},
    create: {
      name: "Demo User",
      email: "demo@smartshop.com",
      password: await bcrypt.hash("demo123", 10),
    },
  });

  // Products
  const products = [
    {
      name: "Wireless Headphones",
      description: "Premium noise-cancelling headphones",
      price: 129.99,
      stock: 50,
      category: "Electronics",
    },
    {
      name: "Mechanical Keyboard",
      description: "RGB backlit, tactile switches",
      price: 89.99,
      stock: 30,
      category: "Electronics",
    },
    {
      name: "Running Shoes",
      description: "Lightweight, breathable mesh",
      price: 74.99,
      stock: 100,
      category: "Sports",
    },
    {
      name: "Yoga Mat",
      description: "Non-slip, 6mm thick",
      price: 34.99,
      stock: 80,
      category: "Sports",
    },
    {
      name: "Coffee Grinder",
      description: "Burr grinder, 15 grind settings",
      price: 49.99,
      stock: 25,
      category: "Kitchen",
    },
    {
      name: "Desk Lamp",
      description: "LED, adjustable color temperature",
      price: 39.99,
      stock: 60,
      category: "Home",
    },
  ];

  for (const p of products) {
    await prisma.product.create({ data: p });
  }

  console.log("✅ Seed complete!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
