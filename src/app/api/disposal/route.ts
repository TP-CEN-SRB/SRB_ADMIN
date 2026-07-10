import { NextRequest, NextResponse } from "next/server"
import { DisposalSchema } from "@/schemas"
import jwt from "jsonwebtoken"
import sharp from "sharp"
import { prisma } from "@/lib/db"
import { utapi } from "@/lib/uploadthing"

// Cap stored disposal images well below the raw camera capture size -
// this is a thumbnail for admin review, not a forensic record.
const DISPOSAL_IMAGE_MAX_DIMENSION = 480
const DISPOSAL_IMAGE_JPEG_QUALITY = 70

type Body = {
  userId: string
  material: string
  weightInGrams: number
  queueId?: string
}

export const GET = async (req: NextRequest) => {
  try {
    const token = req.headers.get("Authorization")?.split(" ")[1]
    if (!token) {
      return NextResponse.json(
        { message: "Missing authorization header!" },
        { status: 401 }
      )
    }
    const decodedToken = jwt.verify(token, process.env.NEXT_JWT_SECRET_KEY!)
    if (typeof decodedToken === "string") {
      return NextResponse.json(
        { message: "Unauthorized access!" },
        { status: 401 }
      )
    }
    const bins = await prisma.bin.findMany({
      where: { userId: decodedToken.userId },
      select: {
        _count: { select: { disposals: true } },
        binMaterial: { select: { name: true } },
      },
    })
    if (bins.length === 0) {
      return NextResponse.json({ message: "No bins found!" })
    }
    const disposals = bins.map((bin) => ({
      material: bin.binMaterial.name,
      count: bin._count.disposals,
    }))
    if (disposals.length === 0) {
      return NextResponse.json({ message: "No disposals found!" })
    }
    return NextResponse.json({ disposals }, { status: 200 })
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return NextResponse.json(
        { message: "Token has expired!" },
        { status: 401 }
      )
    } else if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { message: "Token is invalid!" },
        { status: 401 }
      )
    } else if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 500 })
    }
    return NextResponse.json(
      { message: "An unknown error occurred" },
      { status: 500 }
    )
  }
}

// sent by locally hosted bin
export const POST = async (req: NextRequest) => {
  try {
    // Auth
    const token = req.headers.get("Authorization")?.split(" ")[1]
    if (!token) {
      return NextResponse.json(
        { message: "Missing authorization header!" },
        { status: 401 }
      )
    }
    const decodedToken = jwt.verify(token, process.env.NEXT_JWT_SECRET_KEY!)
    if (typeof decodedToken === "string") {
      return NextResponse.json(
        { message: "Unauthorized access!" },
        { status: 401 }
      )
    }

    // Body
    const raw = await req.json()
    const userId: string = raw.userId

    // Normalize to items[]
    // imageBase64 is optional and used for low-confidence detections that
    // need a human to eyeball them later - uploaded to UploadThing (not
    // stored in Postgres) since Vercel has no persistent local disk.
    type Item = { material: string; weightInGrams: number; imageBase64?: string }
    const items: Item[] =
      Array.isArray(raw.items) && raw.items.length > 0
        ? raw.items
        : [{ material: raw.material, weightInGrams: raw.weightInGrams, imageBase64: raw.imageBase64 }]

    // Validate each item
    for (const it of items) {
      const validated = DisposalSchema.safeParse(it)
      if (!validated.success) {
        return NextResponse.json({ message: "Invalid fields!" }, { status: 400 })
      }
    }

    // Upload any images ahead of the transaction - an external HTTP call
    // has no business running inside a DB transaction/holding row locks.
    const imageUrls: (string | undefined)[] = await Promise.all(
      items.map(async (item) => {
        if (!item.imageBase64) return undefined
        try {
          const rawBuffer = Buffer.from(item.imageBase64, "base64")
          const resizedBuffer = await sharp(rawBuffer)
            .resize(DISPOSAL_IMAGE_MAX_DIMENSION, DISPOSAL_IMAGE_MAX_DIMENSION, {
              fit: "inside",
              withoutEnlargement: true,
            })
            .jpeg({ quality: DISPOSAL_IMAGE_JPEG_QUALITY })
            .toBuffer()
          const file = new File(
            [new Uint8Array(resizedBuffer)], 
            `disposal-${Date.now()}-${item.material}.jpg`, 
            { type: "image/jpeg" }
          )
          const result = await utapi.uploadFiles(file)
          return result.data?.url
        } catch (e) {
          console.error("[disposal] image upload failed:", e)
          return undefined
        }
      })
    )

    // Transaction: create one or many disposals
    const { ids, points, carbonprints } = await prisma.$transaction(async (tx) => {
      const ids: string[] = []
      const points: number[] = []
      const carbonprints: number[] = []

      for (let i = 0; i < items.length; i++) {
        const { material: mRaw, weightInGrams } = items[i]
        const imageUrl = imageUrls[i]
        const material = (mRaw ?? "").toUpperCase()

        const [bin, binMaterial] = await Promise.all([
          tx.bin.findFirst({
            where: {
              userId,
              binMaterial: { name: material },
            },
            select: {
              id: true,
              status: true,
              currentCapacity: true,
              binMaterial: { select: { name: true } },
            },
          }),
          tx.binMaterial.findUnique({
            where: { name: material },
          }),
        ])

        if (!bin) throw new Error("No bin found!")
        if (!binMaterial) throw new Error("No bin material found!")
        if (bin.status === "UNDER_MAINTENANCE") {
          throw new Error("Bin is currently under maintenance!")
        }
        if (bin.currentCapacity >= 100) {
          throw new Error("Bin is already full!")
        }

        const carbonPrint =
          weightInGrams * (binMaterial.carbon_multiplier ?? 0)
        const pointsAwarded = Math.floor(
          weightInGrams * (binMaterial.multiplier ?? 1)
        )

        const disposal = await tx.disposal.create({
          data: {
            weightInGrams,
            binId: bin.id,
            carbonprint: carbonPrint,
            pointsAwarded,
            imageUrl,
          },
          select: { id: true, pointsAwarded: true, carbonprint: true },
        })

        ids.push(disposal.id)
        points.push(disposal.pointsAwarded)
        carbonprints.push(disposal.carbonprint)
      }

      return { ids, points, carbonprints }
    })

    // Response
    if (ids.length === 1) {
      return NextResponse.json(
        {
          id: ids[0],
          point: points[0],
          carbonprint: carbonprints[0],
        },
        { status: 200 }
      )
    }

    return NextResponse.json(
      {
        ids,
        points,
        carbonprints,
      },
      { status: 200 }
    )
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return NextResponse.json(
        { message: "Token has expired!" },
        { status: 401 }
      )
    } else if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { message: "Token is invalid!" },
        { status: 401 }
      )
    } else if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 500 })
    }
    return NextResponse.json(
      { message: "An unknown error occurred" },
      { status: 500 }
    )
  }
}
