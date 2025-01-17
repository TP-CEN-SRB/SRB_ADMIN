import prisma from "@/lib/db";
import { Prisma } from "@prisma/client";

const binMaterialData: Prisma.BinMaterialCreateInput[] = [
  {
    id: "126f6451-956f-44f3-a9c7-be31e2229ed0",
    name: "PLASTIC",
  },
  {
    id: "0ab11796-b46b-4c21-aecd-a80f850f78d4",
    name: "METAL",
  },
  {
    id: "526b5a69-fc92-459b-b538-39310412f538",
    name: "PAPER",
  },
  {
    id: "7223ee16-49c8-4740-a79f-70c8e5983b8a",
    name: "GLASS",
  },
  {
    id: "5b058bae-7d4e-4198-b8d7-294b2a40c0cc",
    name: "GENERAL",
  },
];

async function main() {
  for (const data of binMaterialData) {
    const binMaterial = await prisma.binMaterial.create({
      data: data,
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
