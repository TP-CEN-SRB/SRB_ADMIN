import jwt from "jsonwebtoken"

export const generateQrToken = (data: {
  disposalId: string
  userId: string
  material: string
  weightInGrams: number
  carbonprint: number
}) => {
  const token = jwt.sign(data, process.env.NEXT_JWT_SECRET_KEY!, {
    expiresIn: "2m",
  })
  return token
}

export const generateTransferQrToken = (data: {
  sessionId: string
  senderId: string
  amount: number
  senderName: string
}) => {
  return jwt.sign(data, process.env.NEXT_JWT_SECRET_KEY!, { 
    expiresIn: "2m" ,
  })
}

type TransferQrPayload = {
  sessionId: string
  senderId: string
  amount: number
  senderName: string
}

export const verifyQrToken = (token: string): TransferQrPayload => {
  return jwt.verify(token, process.env.NEXT_JWT_SECRET_KEY!) as TransferQrPayload
}
