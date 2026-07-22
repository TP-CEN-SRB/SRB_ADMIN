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

// One-time handoff token for the "Go to Mobile App" SSO flow: short-lived
// and single-purpose (identifies a user, nothing else) so it's safe to pass
// as a URL query param. The mobile app exchanges it via
// POST /api/mobile-handoff for a real session token before it expires.
export const generateMobileHandoffToken = (userId: string) => {
  return jwt.sign({ userId }, process.env.NEXT_JWT_SECRET_KEY!, {
    expiresIn: "2m",
  })
}

export const verifyMobileHandoffToken = (token: string): { userId: string } => {
  return jwt.verify(token, process.env.NEXT_JWT_SECRET_KEY!) as { userId: string }
}
