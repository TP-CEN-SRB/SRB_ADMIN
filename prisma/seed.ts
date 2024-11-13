import prisma from "@/lib/db";
import { Prisma } from "@prisma/client";
import { BinMaterial, BinStatus } from "@prisma/client";
const userData: Prisma.UserCreateInput[] = [
  {
    name: "testBin",
    email: "testbin@tp.bin.sg",
    emailVerified: new Date(),
    password: "$2a$10$BHXfEfhhlGstuGsCpg5iB.5mv7Z1WQSimraKQAWqIOxT3Grw2itVm", // 12345678
    secondaryPassword:
      "$2a$10$cXW5NGfru.a5xrRMi/kdQuxOADv2XqJ6s6QrSshhjlukD7miW0qNa", // 123456
    role: "BIN",
    bins: {
      createMany: {
        data: [
          {
            location: "Library",
            status: BinStatus.FUNCTIONAL,
            material: BinMaterial.METAL,
          },
          {
            location: "Library",
            status: BinStatus.FUNCTIONAL,
            material: BinMaterial.PLASTIC,
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

async function main() {
  for (const data of userData) {
    const user = await prisma.user.create({
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
