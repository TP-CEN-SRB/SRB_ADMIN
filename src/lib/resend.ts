import { Resend } from 'resend'

if (!process.env.RESEND_API_KEY) {
  throw new Error(
    'Missing RESEND_API_KEY environment variable. ' +
      'Get your API key from https://resend.com/api-keys',
  )
}

//resend API
export const resend = new Resend(process.env.RESEND_API_KEY)

//Email Template
export function emailTemplate(link: string, type: "VERIFY" | "RESET") {

  const actionText = type === "RESET" ? "Reset Password" : "Verify Email"
  const actionInstruction = type === "RESET" ? "reset your password" : "verify your email address"

  return `
  <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${actionText}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        h1 { color: #333333; }
        p { color: #555555; }
        .btn {
          display: inline-block;
          padding: 12px 24px;
          background-color: #007BFF;
          color: #ffffff;
          text-decoration: none;
          border-radius: 5px;
          font-weight: bold;
          margin-top: 20px;
        }
        .btn:hover { background-color: #0056b3; }
        .footer {
          margin-top: 20px;
          font-size: 12px;
          color: #999999;
        }
        .raw-link {
          margin-top: 20px;
          word-break: break-all;
          color: #007BFF;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Hello,</h1>
        <p>We received a request to <strong>${actionInstruction}</strong>. If you made this request, please click the button below:</p>
        <a href="${link}" class="btn">${actionText}</a>
        <p>If the button doesn’t work, copy and paste this link into your browser:</p>
        <p class="raw-link">${link}</p>
        <div class="footer">
          <p>Thank you,<br>Temasek Polytechnic CEN</p>
        </div>
      </div>
    </body>
  </html>`
}

//Email Template
export function warningEmailTemplate(binCapacity: number, material: string, location: string | null) {
  return `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Bin Capacity Warning</title>
      <style>
        body { font-family: Arial, sans-serif background-color: #f4f4f4 margin: 0 padding: 0 }
        .container { max-width: 600px margin: 0 auto background-color: #ffffff padding: 20px border-radius: 8px box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1) }
        h1 { color: #333333 }
        p { color: #555555 }
        .footer { margin-top: 20px font-size: 12px color: #999999 }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Hello,</h1>
        <p>Please be informed that the <b>${material}</b> bin at <b>${location}</b> is currently <b>${binCapacity.toFixed(2)}%</b> full.</p>
        <p>You may head to the specified location for the clearing of bins.</p>
        <div class="footer">
          <p>Thank you,<br>Temasek Polytechnic CEN</p>
        </div>
      </div>
    </body>
  </html>`
}

//Resend Email
export const sendBinWarningEmail = async (
  emailList: string[],
  binCapacity: number,
  material: string,
  location: string | null
): Promise<void> => {
  try {
    await resend.emails.send({
      from: `TP Smart Bin <no-reply@${process.env.RESEND_DOMAIN}>`,
      to: emailList,
      subject: "[Smart Bin System] Bin Capacity Information",
      html: warningEmailTemplate(binCapacity, material, location),
    })

    console.log(
      `📧 Bin warning email SENT → ${material} at ${location} (${binCapacity}%)`
    )
  } catch (err: any) {
    console.error("❌ Bin warning email failed:", err.message)
  }
}
