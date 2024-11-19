import prisma from "@/lib/db";
import { Prisma } from "@prisma/client";
const userData: Prisma.UserCreateInput[] = [];

for (let i = 1; i <= 30; i++) {
  const emailVerified = i % 2 === 0 ? new Date() : null; // Randomly verify half of the emails
  const password =
    "$2a$10$qPhObhX1emP.wGo7atl0NO4uEytqwJaID.9FiWGiH31R2d5FPs0zC";

  userData.push({
    email: `${Math.floor(Math.random() * 10000000)}a@student.tp.edu.sg`,
    emailVerified: emailVerified,
    password: password,
    name: `User ${i}`,
    role: "STUDENT", // Assuming the role is "STUDENT", you can change this if needed
    createdAt: new Date(),
    updatedAt: new Date(),
    point: { create: { balance: Math.random() * 100 } },
  });
}

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
