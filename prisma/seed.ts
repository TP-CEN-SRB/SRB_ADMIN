import prisma from "@/lib/db";
import { Prisma } from "@prisma/client";
import { BinMaterial, BinStatus } from "@prisma/client";
const binData: Prisma.BinCreateInput[] = [
  {
    location: "Library",
    status: BinStatus.FUNCTIONAL,
    material: BinMaterial.METAL,
    currentCapacity: 0,
  },
  {
    location: "Library",
    status: BinStatus.FUNCTIONAL,
    material: BinMaterial.PLASTIC,
    currentCapacity: 0,
  },
];

async function main() {
  for (const data of binData) {
    const bin = await prisma.bin.create({
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
