import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { defaultCV } from "../src/lib/default-cv";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  const user = await prisma.user.upsert({
    where: { email: "demo@cvstudio.app" },
    update: {},
    create: {
      email: "demo@cvstudio.app",
      name: "Demo User",
      passwordHash,
    },
  });

  const existingCount = await prisma.cV.count({ where: { userId: user.id } });
  if (existingCount === 0) {
    await prisma.cV.create({
      data: {
        userId: user.id,
        name: "Demo Resume",
        template: "modern",
        data: JSON.stringify(defaultCV()),
      },
    });
  }

  console.log("Seeded demo user: demo@cvstudio.app / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
