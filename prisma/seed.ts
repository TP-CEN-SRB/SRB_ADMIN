import prisma from "@/lib/db";
import { Prisma } from "@prisma/client";
import { BinStatus } from "@prisma/client";
const userData: Prisma.UserCreateInput[] = [
  {
    id: "eabc24b6-ca1c-4c94-86e1-2ebbc4952a78",
    name: "testBin",
    email: "testbin@tp.bin.sg",
    emailVerified: new Date(),
    password: "$2a$10$BHXfEfhhlGstuGsCpg5iB.5mv7Z1WQSimraKQAWqIOxT3Grw2itVm", // 12345678
    role: "BIN",
    location: "Library",
    bins: {
      createMany: {
        data: [
          {
            status: BinStatus.FUNCTIONAL,
            binMaterialId: "126f6451-956f-44f3-a9c7-be31e2229ed0",
          },
          {
            status: BinStatus.FUNCTIONAL,
            binMaterialId: "0ab11796-b46b-4c21-aecd-a80f850f78d4",
          },
          {
            status: BinStatus.FUNCTIONAL,
            binMaterialId: "526b5a69-fc92-459b-b538-39310412f538",
          },
          {
            status: BinStatus.FUNCTIONAL,
            binMaterialId: "7223ee16-49c8-4740-a79f-70c8e5983b8a",
          },
          {
            status: BinStatus.FUNCTIONAL,
            binMaterialId: "5b058bae-7d4e-4198-b8d7-294b2a40c0cc",
          },
        ],
      },
    },
  },
  {
    name: "Test Admin",
    email: "testadmin@tp.edu.sg",
    emailVerified: new Date(),
    password: "$2a$10$BHXfEfhhlGstuGsCpg5iB.5mv7Z1WQSimraKQAWqIOxT3Grw2itVm", // 12345678
    role: "ADMIN",
    faculty: "ENGINEERING",
  },
];

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

const rewardsData: Prisma.RewardCreateInput[] = [
  {
    name: "flappy bird",
    pointsRequired: 100,
    description: "big stuff toy bird",
    isAvailable: true,
    image: "https://utfs.io/f/oCGZ90SRbWap5Ojx6jc1SjwIuQeqVB9Oop2mt3GkNXdZiWc7",
  },
  {
    name: "flappy bird head",
    pointsRequired: 50,
    description: "no body no wing, only the head!",
    isAvailable: true,
    image: "https://utfs.io/f/oCGZ90SRbWaptKqtKP9epDWxdTiRN82OruAqJZBz3Syskfgn",
  },
];

async function main() {
  for (const data of binMaterialData) {
    const binMaterial = await prisma.binMaterial.create({
      data: data,
    });
  }
  for (const data of userData) {
    const user = await prisma.user.create({
      data: data,
    });
  }
  for (const data of rewardsData) {
    const reward = await prisma.reward.create({
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
