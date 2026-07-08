// // app/api/resend-verification/route.ts
// import { NextRequest, NextResponse } from "next/server"
// import { prisma } from "@/lib/db"
// import { generateVerificationToken } from "@/lib/tokens"
// import { sendVerificationEmail } from "@/lib/resend"
// import { ableToGenerateNewVerificationToken } from "@/utils/verificationToken"

// export async function POST(req: NextRequest) {
//   try {
//     const body = await req.json().catch(() => null)
//     const email = body?.email
//     const redirect = body?.redirect

//     // Always "success" for invalid input (anti-enumeration)
//     if (!email) {
//       return NextResponse.json({ success: true, sent: false })
//     }

//     const normalizedEmail = String(email).toLowerCase().trim()

//     const user = await prisma.user.findUnique({
//       where: { email: normalizedEmail },
//     })

//     // Don't reveal existence / verification state
//     if (!user || user.emailVerified) {
//       return NextResponse.json({ success: true, sent: false })
//     }

//     const canResend = await ableToGenerateNewVerificationToken(normalizedEmail)
//     if (!canResend) {
//       return NextResponse.json(
//         { error: "Please wait before requesting another verification email." },
//         { status: 429 }
//       )
//     }

//     const token = await generateVerificationToken(normalizedEmail)

//     // If email send fails, this should throw and we return 500
//     await sendVerificationEmail(token.email, token.token, redirect)

//     return NextResponse.json({ success: true, sent: true })
//   } catch (err) {
//     console.error("[resend-verification] error:", err)
//     return NextResponse.json(
//       { error: "Failed to send verification email." },
//       { status: 500 }
//     )
//   }
// }
