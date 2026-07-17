import { NextRequest, NextResponse } from "next/server"
import { resend } from "@/lib/resend"
import { z } from "zod"

const ContactSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  message: z.string().min(1).max(2000),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = ContactSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid fields", errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { name, email, message } = parsed.data

    await resend.emails.send({
      from: `TP Smart Bin Contact <no-reply@${process.env.RESEND_DOMAIN}>`,
      to: process.env.NEXT_PUBLIC_PERSONAL_EMAIL!,
      replyTo: email,
      subject: `[Smart Bin Contact] Message from ${name}`,
      html: `
        <p><strong>From:</strong> ${name} (${email})</p>
        <p><strong>Message:</strong></p>
        <p style="white-space: pre-wrap;">${message}</p>
      `,
    })

    return NextResponse.json({ message: "Message sent" }, { status: 200 })
  } catch (error) {
    console.error("[contact] error:", error)
    return NextResponse.json({ message: "Failed to send message" }, { status: 500 })
  }
}
