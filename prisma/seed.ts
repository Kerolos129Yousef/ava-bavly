import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const classes = [
    { name: "فصل بسيط", type: "mild" },
    { name: "فصل متوسط", type: "moderate" },
    { name: "فصل شديد", type: "severe" },
    { name: "أطفال صغيرين", type: "children" },
  ];

  for (const c of classes) {
    await prisma.class.upsert({
      where: { name: c.name },
      update: {},
      create: c,
    });
  }

  console.log("Seeded 4 classes");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
