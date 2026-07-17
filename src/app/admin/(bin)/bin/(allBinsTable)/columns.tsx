import { BinStatus } from "@/generated/prisma"

export type Bin = {
  id: string
  currentCapacity: number
  _count: { disposals: number }
  userId: string
  clearCount: number
  user: { name: string | null; location: string | null }
  status: BinStatus
  binMaterial: { name: string }
  createdAt: Date
  updatedAt: Date
}
