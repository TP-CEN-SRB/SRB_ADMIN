
import { Prisma } from "@prisma/client";
import { BinStatus } from "@prisma/client";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const userData: Prisma.UserCreateInput[] = [
  {
    id: "eabc24b6-ca1c-4c94-86e1-2ebbc4952a78",
    name: "testBin",
    email: "testbin@tp.bin.sg",
    emailVerified: new Date(),
    password: "$2a$10$BHXfEfhhlGstuGsCpg5iB.5mv7Z1WQSimraKQAWqIOxT3Grw2itVm", // 12345678
    role: "BIN",
    faculty: "BUS",
    location: "Library",
    lat: 1.3450567,
    long: 103.9325828,
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
    subscriptions: { create: { email: "testadmin@tp.edu.sg" } },
  },
  {
    id: "eppp24b6-ca1c-4c94-86e1-2ebbc4952a78",
    name: "testBin",
    email: "testbin2@tp.bin.sg",
    emailVerified: new Date(),
    password: "$2a$10$BHXfEfhhlGstuGsCpg5iB.5mv7Z1WQSimraKQAWqIOxT3Grw2itVm", // 12345678
    role: "BIN",
    faculty: "ENG",
    location: "Blk 11 Level 5",
    lat: 1.3463256,
    long: 103.9321536,
    bins: {
      createMany: {
        data: [
          {
            status: BinStatus.UNDER_MAINTENANCE,
            binMaterialId: "126f6451-956f-44f3-a9c7-be31e2229ed0",
          },
          {
            status: BinStatus.UNDER_MAINTENANCE,
            binMaterialId: "0ab11796-b46b-4c21-aecd-a80f850f78d4",
          },
          {
            status: BinStatus.UNDER_MAINTENANCE,
            binMaterialId: "526b5a69-fc92-459b-b538-39310412f538",
          },
          {
            status: BinStatus.UNDER_MAINTENANCE,
            binMaterialId: "7223ee16-49c8-4740-a79f-70c8e5983b8a",
          },
          {
            status: BinStatus.UNDER_MAINTENANCE,
            binMaterialId: "5b058bae-7d4e-4198-b8d7-294b2a40c0cc",
          },
        ],
      },
    },
  },
  {
    id: "e10b1f86-7a8e-4fa1-b2b8-1a1726a812f6",
    name: "testBin",
    email: "testbin3@tp.bin.sg",
    emailVerified: new Date(),
    password: "$2a$10$BHXfEfhhlGstuGsCpg5iB.5mv7Z1WQSimraKQAWqIOxT3Grw2itVm", // 12345678
    role: "BIN",
    faculty: "ENG",
    location: "Blk 20 Level 3",
    lat: 1.3468865,
    long: 103.9308492,
    bins: {
      createMany: {
        data: [
          {
            status: BinStatus.UNDER_MAINTENANCE,
            binMaterialId: "126f6451-956f-44f3-a9c7-be31e2229ed0",
          },
          {
            status: BinStatus.UNDER_MAINTENANCE,
            binMaterialId: "0ab11796-b46b-4c21-aecd-a80f850f78d4",
          },
          {
            status: BinStatus.UNDER_MAINTENANCE,
            binMaterialId: "526b5a69-fc92-459b-b538-39310412f538",
          },
          {
            status: BinStatus.UNDER_MAINTENANCE,
            binMaterialId: "7223ee16-49c8-4740-a79f-70c8e5983b8a",
          },
          {
            status: BinStatus.UNDER_MAINTENANCE,
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
    faculty: "ENG",
  },
];

const binMaterialData: Prisma.BinMaterialCreateInput[] = [
  {
    id: "126f6451-956f-44f3-a9c7-be31e2229ed0",
    name: "PLASTIC",
    multiplier: 0.8,
  },
  {
    id: "0ab11796-b46b-4c21-aecd-a80f850f78d4",
    name: "METAL",
    multiplier: 2.0,
  },
  {
    id: "526b5a69-fc92-459b-b538-39310412f538",
    name: "PAPER",
    multiplier: 1,
  },
  {
    id: "7223ee16-49c8-4740-a79f-70c8e5983b8a",
    name: "EWASTE",
    multiplier: 1,
  },
  {
    id: "5b058bae-7d4e-4198-b8d7-294b2a40c0cc",
    name: "GENERAL",
    multiplier: 0,
  },
];

const rewardsData: Prisma.RewardCreateInput[] = [
  {
    name: "$10 Voucher",
    pointsRequired: 100,
    description: "$10 Voucher for any purchase",
    isAvailable: true,
    image: "https://utfs.io/f/oCGZ90SRbWapvpFBCziJ9wlydo0JqmYXNfAeHBbSGzO8U1Zg",
  },
  {
    name: "$5 Voucher",
    pointsRequired: 50,
    description: "$5 Voucher for any purchase",
    isAvailable: true,
    image: "https://utfs.io/f/oCGZ90SRbWapNPIZsn3lfDP1q9EKkgxoQhystSaZBMvCm0Fu",
  },
  {
    name: "Airpods Pro Lucky Draw",
    pointsRequired: 3000,
    description: "Stand a chance to win an AirPods Pro",
    isAvailable: true,
    image: "https://utfs.io/f/oCGZ90SRbWapJfURlwLzQkoOu3UtsWAj9Z4a7iqRDYGNL2c1",
  },
  {
    name: "Recycled Tote Bag",
    pointsRequired: 100,
    description: "A recycled tote bag to fit your items",
    isAvailable: true,
    image: "https://utfs.io/f/oCGZ90SRbWapvajbyjJ9wlydo0JqmYXNfAeHBbSGzO8U1Zgr",
  },
  {
    name: "Pokka Botted Drinks",
    pointsRequired: 300,
    description: "Any pokka drink of your choice",
    isAvailable: true,
    image: "https://utfs.io/f/oCGZ90SRbWapl61FyKqA5mhpsex0kJjiROr3492wgyFaUKnN",
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
