import { PrismaClient } from '../generated/prisma'
import { PrismaNeon } from '@prisma/adapter-neon'

// const adapter = new PrismaNeon({
//   connectionString: process.env.DATABASE_URL!,
// })

// export const prisma = new PrismaClient({ adapter })

declare global {
  var prisma: PrismaClient | undefined
}

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL!,
})

export const prisma = globalThis.prisma || new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma
}